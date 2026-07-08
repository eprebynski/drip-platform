#!/usr/bin/env node
import path from 'node:path';
import {
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';
import {
  APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH,
  appsScriptDependencyVerificationTemplate
} from './apps-script-dependency-template.js';

const options = parseArgs();

if (options.help) {
  printHelp('generate-apps-script-dependency-template');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const templatePath = path.join(options.root, APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH);
const written = writeTextFile(templatePath, appsScriptDependencyVerificationTemplate(), { force: options.force });

console.log(`Apps Script dependency verification template ready: ${templatePath}`);
console.log(`Files written: ${written ? 1 : 0}`);
console.log('This is a manual verification aid only. Keep raw evidence outside the repo and preserve UNKNOWN until verified.');
