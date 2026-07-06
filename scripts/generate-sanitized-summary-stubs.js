#!/usr/bin/env node
import path from 'node:path';
import {
  EVIDENCE_CATEGORIES,
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp,
  summaryTemplate,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('generate-sanitized-summary-stubs');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

let written = 0;
for (const category of EVIDENCE_CATEGORIES) {
  const summaryPath = path.join(options.root, 'sanitized-summaries', `${category.id}-summary.md`);
  if (writeTextFile(summaryPath, summaryTemplate(category), { force: options.force })) {
    written += 1;
  }
}

console.log(`Sanitized summary stubs ready: ${path.join(options.root, 'sanitized-summaries')}`);
console.log(`Templates written: ${written}`);
console.log('Unverified fields remain UNKNOWN by default.');
