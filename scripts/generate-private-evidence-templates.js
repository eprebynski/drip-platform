#!/usr/bin/env node
import path from 'node:path';
import {
  EVIDENCE_CATEGORIES,
  REQUIRED_FOLDERS,
  ensurePrivateEvidenceFolders,
  folderReadme,
  manifestTemplate,
  parseArgs,
  printHelp,
  redactionChecklist,
  rootReadme,
  summaryTemplate,
  writeTextFile
} from './private-evidence-kit-common.js';
import {
  APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH,
  appsScriptDependencyVerificationTemplate
} from './apps-script-dependency-template.js';

const options = parseArgs();

if (options.help) {
  printHelp('generate-private-evidence-templates');
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
  if (writeTextFile(path.join(options.root, folder, 'README.md'), folderReadme(folder), { force: options.force })) {
    written += 1;
  }
}
for (const category of EVIDENCE_CATEGORIES) {
  const summaryPath = path.join(options.root, 'sanitized-summaries', `${category.id}-summary.md`);
  if (writeTextFile(summaryPath, summaryTemplate(category), { force: options.force })) {
    written += 1;
  }
}
if (writeTextFile(path.join(options.root, 'manifests', 'evidence-manifest-template.md'), manifestTemplate(), { force: options.force })) {
  written += 1;
}
if (writeTextFile(path.join(options.root, 'manifests', 'redaction-checklist.md'), redactionChecklist(), { force: options.force })) {
  written += 1;
}
if (writeTextFile(path.join(options.root, APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH), appsScriptDependencyVerificationTemplate(), { force: options.force })) {
  written += 1;
}

console.log(`Private evidence templates ready: ${options.root}`);
console.log(`Files written: ${written}`);
console.log('Raw private exports must stay outside the repo. Keep unverified fields UNKNOWN.');
