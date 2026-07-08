#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './private-evidence-kit-common.js';
import { APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH } from './apps-script-auto-review-common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const phase212StatusPath = path.join(__dirname, 'generate-private-evidence-status-report-phase-212.js');
const statusResult = spawnSync(process.execPath, [phase212StatusPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

if (statusResult.error) {
  console.error(`Error: ${statusResult.error.message}`);
  process.exit(1);
}

const options = parseArgs();
if (statusResult.status !== 0 || options.help) {
  process.exit(statusResult.status || 0);
}

function latestStatusReport(manifestsPath) {
  if (!fs.existsSync(manifestsPath)) {
    return null;
  }
  return fs.readdirSync(manifestsPath)
    .filter((name) => /^private-evidence-status-.+\.md$/.test(name))
    .map((name) => path.join(manifestsPath, name))
    .sort((left, right) => fs.statSync(right).mtimeMs - fs.statSync(left).mtimeMs)[0] || null;
}

const autoReviewPath = path.join(options.root, APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH);
const present = fs.existsSync(autoReviewPath);
const presentText = present ? 'YES' : 'NO';
const reportPath = latestStatusReport(path.join(options.root, 'manifests'));

if (reportPath) {
  const statusLine = `- Apps Script dependency auto-review report present: ${presentText}`;
  let report = fs.readFileSync(reportPath, 'utf8');
  if (/^- Apps Script dependency auto-review report present: (YES|NO)$/m.test(report)) {
    report = report.replace(/^- Apps Script dependency auto-review report present: (YES|NO)$/m, statusLine);
  } else {
    report = report.replace(
      /^- Recommended next local command:/m,
      `${statusLine}\n- Recommended next local command:`
    );
  }
  fs.writeFileSync(reportPath, report, 'utf8');
}

console.log(`Apps Script dependency auto-review report present: ${presentText}`);
