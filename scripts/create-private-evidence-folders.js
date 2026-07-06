#!/usr/bin/env node
import path from 'node:path';
import {
  REQUIRED_FOLDERS,
  ensurePrivateEvidenceFolders,
  folderReadme,
  parseArgs,
  printHelp,
  rootReadme,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('create-private-evidence-folders');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

let written = 0;
if (writeTextFile(path.join(options.root, 'README.md'), rootReadme(), { force: options.force })) {
  written += 1;
}
for (const folder of REQUIRED_FOLDERS) {
  const readmePath = path.join(options.root, folder, 'README.md');
  if (writeTextFile(readmePath, folderReadme(folder), { force: options.force })) {
    written += 1;
  }
}

console.log(`Private evidence folder ready: ${options.root}`);
console.log(`Required folders: ${REQUIRED_FOLDERS.length}`);
console.log(`README files written: ${written}`);
