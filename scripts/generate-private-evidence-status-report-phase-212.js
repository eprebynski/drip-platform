#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './private-evidence-kit-common.js';
import { APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH } from './apps-script-dependency-template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const originalStatusPath = path.join(__dirname, 'generate-private-evidence-status-report.js');
const originalResult = spawnSync(process.execPath, [originalStatusPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

if (originalResult.error) {
  console.error(`Error: ${originalResult.error.message}`);
  process.exit(1);
}

const options = parseArgs();
if (originalResult.status !== 0 || options.help) {
  process.exit(originalResult.status || 0);
}

function latestStatusReport(manifestsPath) {
  if (!fs.existsSync(manifestsPath)) {
    return null;
  }
  const reports = fs.readdirSync(manifestsPath)
    .filter((name) => /^private-evidence-status-.+\.md$/.test(name))
    .map((name) => path.join(manifestsPath, name))
    .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs);
  return reports[0] || null;
}

const templatePath = path.join(options.root, APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH);
const templatePresentText = fs.existsSync(templatePath) ? 'YES' : 'NO';
const reportPath = latestStatusReport(path.join(options.root, 'manifests'));

if (reportPath) {
  const statusLine = `- Apps Script dependency verification template present: ${templatePresentText}`;
  let report = fs.readFileSync(reportPath, 'utf8');
  if (/^- Apps Script dependency verification template present: (YES|NO)$/m.test(report)) {
    report = report.replace(/^- Apps Script dependency verification template present: (YES|NO)$/m, statusLine);
  } else {
    report = report.replace(
      /^- Recommended next local command:/m,
      `${statusLine}\n- Recommended next local command:`
    );
  }
  fs.writeFileSync(reportPath, report, 'utf8');
}

console.log(`Apps Script dependency verification template present: ${templatePresentText}`);
