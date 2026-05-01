#!/usr/bin/env node

import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

export const DEFAULT_API_VERSION = '2026-04';
const GRAPHQL_PAGE_SIZE = 250;
const EXPORT_SOURCE = 'shopify-admin-graphql';
const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectory = path.dirname(currentFilePath);
const repoRoot = path.resolve(currentDirectory, '..', '..');
const outputDirectory = path.join(repoRoot, 'docs', 'metaobjects');
const indexFileName = 'index.json';
const dotenvFileNames = ['.env', '.env.local'];

const metaobjectDefinitionsQuery = `#graphql
  query ExportMetaobjectDefinitions($first: Int!, $after: String) {
    metaobjectDefinitions(first: $first, after: $after) {
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        id
        name
        type
        description
        displayNameKey
        createdAt
        updatedAt
        metaobjectsCount
        access {
          admin
          storefront
        }
        capabilities {
          publishable {
            enabled
          }
          translatable {
            enabled
          }
          renderable {
            enabled
          }
          onlineStore {
            enabled
          }
        }
        fieldDefinitions {
          key
          name
          description
          required
          type {
            name
          }
          validations {
            name
            value
          }
        }
      }
    }
  }
`;

class UserFacingError extends Error {
  constructor(message, detail) {
    super(message);
    this.name = 'UserFacingError';
    this.detail = detail;
  }
}

function fail(message, detail) {
  throw new UserFacingError(message, detail);
}

function formatError(error) {
  if (error instanceof UserFacingError) {
    return {
      message: error.message,
      detail: error.detail,
    };
  }

  return {
    message: 'Failed to export Shopify metaobject definitions.',
    detail: error instanceof Error ? error.stack ?? error.message : String(error),
  };
}

function logError(error) {
  const formatted = formatError(error);
  console.error(formatted.message);

  if (formatted.detail) {
    console.error(formatted.detail);
  }
}

function assertSupportedNodeVersion() {
  const majorVersion = Number.parseInt(process.versions.node.split('.')[0], 10);

  if (!Number.isFinite(majorVersion) || majorVersion < 20) {
    fail(`Node.js 20 or newer is required. Current version: ${process.version}`);
  }
}

function normalizeShopDomain(rawValue) {
  return rawValue.trim().replace(/^https?:\/\//i, '').replace(/\/+$/g, '').toLowerCase();
}

function sanitizeDefinitionType(definitionType) {
  return definitionType.toLowerCase().replace(/[^a-z0-9_.-]+/g, '-');
}

function stripInlineComment(value) {
  const commentIndex = value.search(/\s+#/);
  return commentIndex === -1 ? value : value.slice(0, commentIndex).trimEnd();
}

function parseEnvFile(fileContents) {
  const values = {};

  for (const rawLine of fileContents.split(/\r?\n/u)) {
    const line = rawLine.trim();

    if (!line || line.startsWith('#')) {
      continue;
    }

    const match = /^(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/u.exec(line);

    if (!match) {
      continue;
    }

    const [, key, rawValue] = match;
    let value = rawValue.trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      const quote = value[0];
      value = value.slice(1, -1);

      if (quote === '"') {
        value = value
          .replace(/\\n/g, '\n')
          .replace(/\\r/g, '\r')
          .replace(/\\t/g, '\t')
          .replace(/\\"/g, '"')
          .replace(/\\\\/g, '\\');
      }
    } else {
      value = stripInlineComment(value);
    }

    values[key] = value;
  }

  return values;
}

async function loadLocalEnvironmentFiles() {
  if (process.env.GITHUB_ACTIONS === 'true' || process.env.CI === 'true') {
    return;
  }

  const mergedFileValues = {};

  for (const fileName of dotenvFileNames) {
    const filePath = path.join(repoRoot, fileName);

    try {
      const fileContents = await readFile(filePath, 'utf8');
      Object.assign(mergedFileValues, parseEnvFile(fileContents));
    } catch (error) {
      if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
        continue;
      }

      throw error;
    }
  }

  for (const [key, value] of Object.entries(mergedFileValues)) {
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

function buildExportMetadata(apiVersion, shop) {
  return {
    source: EXPORT_SOURCE,
    apiVersion,
    shop,
  };
}

function stringifyJson(value) {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function redactSensitiveValues(value) {
  if (Array.isArray(value)) {
    return value.map((entry) => redactSensitiveValues(entry));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  return Object.fromEntries(
    Object.entries(value).map(([key, entryValue]) => {
      if (key === 'access_token' || key === 'client_secret') {
        return [key, '[REDACTED]'];
      }

      return [key, redactSensitiveValues(entryValue)];
    }),
  );
}

function summarizeChangedFiles(fileNames) {
  return fileNames.map((fileName) => `  - docs/metaobjects/${fileName}`).join('\n');
}

async function requestAdminAccessToken(shop, clientId, clientSecret) {
  const tokenUrl = `https://${shop}/admin/oauth/access_token`;
  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  if (!response.ok) {
    const responseBody = await response.text();
    fail(
      `Shopify client credentials token request failed with HTTP ${response.status} ${response.statusText}.`,
      responseBody,
    );
  }

  let payload;

  try {
    payload = await response.json();
  } catch (error) {
    fail(
      'Shopify client credentials token response was not valid JSON.',
      error instanceof Error ? error.message : String(error),
    );
  }

  if (!payload?.access_token || typeof payload.access_token !== 'string') {
    fail(
      'Shopify client credentials token response did not include an access_token.',
      JSON.stringify(redactSensitiveValues(payload), null, 2),
    );
  }

  console.log(`Temporary Admin API token scope: ${payload.scope ?? '(not provided)'}`);
  console.log(`Temporary Admin API token expires_in: ${payload.expires_in ?? '(not provided)'}`);

  return payload.access_token;
}

async function fetchMetaobjectDefinitions(apiUrl, accessToken) {
  const definitions = [];
  let hasNextPage = true;
  let after = null;

  while (hasNextPage) {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': accessToken,
      },
      body: JSON.stringify({
        query: metaobjectDefinitionsQuery,
        variables: {
          first: GRAPHQL_PAGE_SIZE,
          after,
        },
      }),
    });

    if (!response.ok) {
      const responseBody = await response.text();
      fail(
        `Shopify Admin GraphQL request failed with HTTP ${response.status} ${response.statusText}.`,
        responseBody,
      );
    }

    let payload;

    try {
      payload = await response.json();
    } catch (error) {
      fail(
        'Shopify Admin GraphQL returned a non-JSON response.',
        error instanceof Error ? error.message : String(error),
      );
    }

    if (Array.isArray(payload.errors) && payload.errors.length > 0) {
      fail('Shopify Admin GraphQL returned errors.', JSON.stringify(payload.errors, null, 2));
    }

    const connection = payload.data?.metaobjectDefinitions;

    if (!connection || !Array.isArray(connection.nodes) || !connection.pageInfo) {
      fail('Shopify Admin GraphQL response did not include metaobjectDefinitions in the expected shape.');
    }

    definitions.push(...connection.nodes);
    hasNextPage = Boolean(connection.pageInfo.hasNextPage);
    after = connection.pageInfo.endCursor;
  }

  return definitions;
}

async function readManagedFiles() {
  const managedFiles = new Map();

  try {
    const entryNames = await readdir(outputDirectory);

    for (const entryName of entryNames) {
      if (entryName === indexFileName || entryName.endsWith('.definition.json')) {
        const filePath = path.join(outputDirectory, entryName);
        managedFiles.set(entryName, await readFile(filePath, 'utf8'));
      }
    }
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return managedFiles;
    }

    throw error;
  }

  return managedFiles;
}

function buildDesiredFiles(definitions, { apiVersion, shop }) {
  const desiredFiles = new Map();
  const exportMetadata = buildExportMetadata(apiVersion, shop);
  const seenFileNames = new Map();

  for (const definition of definitions) {
    const safeType = sanitizeDefinitionType(definition.type);
    const fileName = `${safeType}.definition.json`;
    const existingType = seenFileNames.get(fileName);

    if (existingType && existingType !== definition.type) {
      fail(
        `Multiple metaobject definition types resolve to the same output file name: ${existingType} and ${definition.type} -> ${fileName}`,
      );
    }

    seenFileNames.set(fileName, definition.type);
    desiredFiles.set(
      fileName,
      stringifyJson({
        _export: exportMetadata,
        definition,
      }),
    );
  }

  desiredFiles.set(
    indexFileName,
    stringifyJson({
      _export: exportMetadata,
      count: definitions.length,
      definitions: definitions.map((definition) => ({
        type: definition.type,
        name: definition.name,
        file: `${sanitizeDefinitionType(definition.type)}.definition.json`,
      })),
    }),
  );

  return desiredFiles;
}

function diffManagedFiles(existingFiles, desiredFiles) {
  const filesToWrite = [];

  for (const [fileName, nextContent] of desiredFiles) {
    if (existingFiles.get(fileName) !== nextContent) {
      filesToWrite.push(fileName);
    }
  }

  const filesToDelete = [...existingFiles.keys()]
    .filter((fileName) => fileName.endsWith('.definition.json') && !desiredFiles.has(fileName))
    .sort();

  return {
    changed: filesToWrite.length > 0 || filesToDelete.length > 0,
    filesToWrite: filesToWrite.sort(),
    filesToDelete,
  };
}

async function removeExistingDefinitionFiles() {
  try {
    const entryNames = await readdir(outputDirectory);
    const definitionFileNames = entryNames.filter((entryName) => entryName.endsWith('.definition.json'));

    await Promise.all(
      definitionFileNames.map((entryName) => rm(path.join(outputDirectory, entryName), { force: true })),
    );
  } catch (error) {
    if (error && typeof error === 'object' && 'code' in error && error.code === 'ENOENT') {
      return;
    }

    throw error;
  }
}

async function applyManagedFiles(desiredFiles, diff) {
  await mkdir(outputDirectory, { recursive: true });

  const shouldRewriteDefinitionFiles =
    diff.filesToDelete.length > 0 || diff.filesToWrite.some((fileName) => fileName.endsWith('.definition.json'));

  if (shouldRewriteDefinitionFiles) {
    await removeExistingDefinitionFiles();

    for (const [fileName, content] of desiredFiles) {
      if (fileName.endsWith('.definition.json')) {
        await writeFile(path.join(outputDirectory, fileName), content, 'utf8');
      }
    }
  }

  if (desiredFiles.has(indexFileName) && (shouldRewriteDefinitionFiles || diff.filesToWrite.includes(indexFileName))) {
    await writeFile(path.join(outputDirectory, indexFileName), desiredFiles.get(indexFileName), 'utf8');
  }
}

async function resolveConfiguration() {
  await loadLocalEnvironmentFiles();

  const shopDomainInput = process.env.SHOPIFY_SHOP_DOMAIN ?? '';
  const clientId = process.env.SHOPIFY_CLIENT_ID ?? '';
  const clientSecret = process.env.SHOPIFY_CLIENT_SECRET ?? '';
  const apiVersion = process.env.SHOPIFY_API_VERSION || DEFAULT_API_VERSION;

  const missingEnvironmentVariables = [];

  if (!shopDomainInput.trim()) {
    missingEnvironmentVariables.push('SHOPIFY_SHOP_DOMAIN');
  }
  if (!clientId.trim()) {
    missingEnvironmentVariables.push('SHOPIFY_CLIENT_ID');
  }
  if (!clientSecret.trim()) {
    missingEnvironmentVariables.push('SHOPIFY_CLIENT_SECRET');
  }

  if (missingEnvironmentVariables.length > 0) {
    fail(
      `Missing required environment variables: ${missingEnvironmentVariables.join(', ')}`,
      'Set them in the shell or in a local .env/.env.local file before running this export.',
    );
  }

  const shop = normalizeShopDomain(shopDomainInput);

  if (!shop || shop.includes('/')) {
    fail(`SHOPIFY_SHOP_DOMAIN must be a bare shop domain like store.myshopify.com. Received: ${shopDomainInput}`);
  }

  return {
    shop,
    clientId,
    clientSecret,
    apiVersion,
  };
}

export async function exportMetaobjectDefinitions({ check = false } = {}) {
  assertSupportedNodeVersion();

  const configuration = await resolveConfiguration();
  const apiUrl = `https://${configuration.shop}/admin/api/${configuration.apiVersion}/graphql.json`;

  console.log(`Shop: ${configuration.shop}`);
  console.log(`Admin API version: ${configuration.apiVersion}`);

  const accessToken = await requestAdminAccessToken(
    configuration.shop,
    configuration.clientId,
    configuration.clientSecret,
  );
  const definitions = await fetchMetaobjectDefinitions(apiUrl, accessToken);

  definitions.sort((left, right) => left.type.localeCompare(right.type));

  const desiredFiles = buildDesiredFiles(definitions, configuration);
  const existingFiles = await readManagedFiles();
  const diff = diffManagedFiles(existingFiles, desiredFiles);

  console.log(`Metaobject definition count: ${definitions.length}`);

  if (check) {
    if (diff.changed) {
      const changedFiles = [...new Set([...diff.filesToWrite, ...diff.filesToDelete])].sort();
      console.error('Committed docs/metaobjects are out of date with live Shopify metaobject definitions.');

      if (changedFiles.length > 0) {
        console.error(summarizeChangedFiles(changedFiles));
      }

      return {
        ...diff,
        definitionCount: definitions.length,
        changedFiles,
      };
    }

    console.log('Committed docs/metaobjects are current.');
    return {
      ...diff,
      definitionCount: definitions.length,
      changedFiles: [],
    };
  }

  if (!diff.changed) {
    console.log('docs/metaobjects is already up to date.');
    return {
      ...diff,
      definitionCount: definitions.length,
      changedFiles: [],
    };
  }

  await applyManagedFiles(desiredFiles, diff);

  const changedFiles = [...new Set([...diff.filesToWrite, ...diff.filesToDelete])].sort();
  console.log('Updated docs/metaobjects from live Shopify metaobject definitions.');

  if (changedFiles.length > 0) {
    console.log(summarizeChangedFiles(changedFiles));
  }

  return {
    ...diff,
    definitionCount: definitions.length,
    changedFiles,
  };
}

function printHelp() {
  console.log(`Usage: node scripts/shopify/export-metaobject-definitions.mjs [--check]\n\nOptions:\n  --check  Compare live Shopify definitions against docs/metaobjects without writing files.\n  --help   Show this help message.\n`);
}

export async function runCli(argv = process.argv.slice(2)) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printHelp();
    return 0;
  }

  try {
    const result = await exportMetaobjectDefinitions({
      check: argv.includes('--check'),
    });

    return result.changed && argv.includes('--check') ? 1 : 0;
  } catch (error) {
    logError(error);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  const exitCode = await runCli();
  process.exit(exitCode);
}
