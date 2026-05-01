#!/usr/bin/env node

import process from 'node:process';
import { runCli } from './export-metaobject-definitions.mjs';

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`Usage: node scripts/shopify/assert-metaobject-definitions-fresh.mjs\n\nChecks whether committed docs/metaobjects matches live Shopify metaobject definitions.\n`);
  process.exit(0);
}

const exitCode = await runCli(['--check']);
process.exit(exitCode);
