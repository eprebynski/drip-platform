#!/usr/bin/env node
import { spawn } from 'node:child_process';
import path from 'node:path';
import {
  REQUIRED_FOLDERS,
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('open-private-evidence-folder');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const targetFolder = options.folder || '';
if (targetFolder && !REQUIRED_FOLDERS.includes(targetFolder)) {
  console.error(`Error: Unknown private evidence folder: ${targetFolder}`);
  console.error(`Allowed folders: ${REQUIRED_FOLDERS.join(', ')}`);
  process.exit(1);
}

const targetPath = targetFolder ? path.join(options.root, targetFolder) : options.root;
const opener = process.platform === 'darwin'
  ? { command: 'open', args: [targetPath] }
  : process.platform === 'win32'
    ? { command: 'cmd', args: ['/c', 'start', '', targetPath] }
    : { command: 'xdg-open', args: [targetPath] };

const child = spawn(opener.command, opener.args, {
  detached: true,
  stdio: 'ignore'
});

child.on('error', (error) => {
  console.error(`Error opening private evidence folder: ${error.message}`);
  process.exit(1);
});

child.unref();
console.log(`Opened private evidence folder: ${targetPath}`);
