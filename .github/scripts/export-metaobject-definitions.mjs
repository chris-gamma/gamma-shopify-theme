#!/usr/bin/env node

import process from 'node:process';
import { runCli } from '../../scripts/shopify/export-metaobject-definitions.mjs';

const exitCode = await runCli(process.argv.slice(2));
process.exit(exitCode);
