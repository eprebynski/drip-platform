#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './private-evidence-kit-common.js';
import {
  APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH,
  readGateResult
} from './apps-script-auto-review-common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const phase212GeneratorPath = path.join(__dirname, 'generate-sanitized-migration-review-packets-phase-212.js');
const generatorResult = spawnSync(process.execPath, [phase212GeneratorPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

if (generatorResult.error) {
  console.error(`Error: ${generatorResult.error.message}`);
  process.exit(1);
}

const options = parseArgs();
if (generatorResult.status !== 0 || options.help) {
  process.exit(generatorResult.status || 0);
}

function removeExistingSection(packet) {
  const start = packet.indexOf('## Phase 2.13 Apps Script Auto-Review Gate');
  const end = packet.indexOf('## Production Dependencies', start);
  return start !== -1 && end !== -1 ? `${packet.slice(0, start)}${packet.slice(end)}` : packet;
}

const packetPath = path.join(options.root, 'review-packets', 'apps-script-review-packet.md');
if (!fs.existsSync(packetPath)) {
  console.error(`Error: Apps Script review packet was not generated: ${packetPath}`);
  process.exit(1);
}

const reportPath = path.join(options.root, APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH);
const reportPresent = fs.existsSync(reportPath);
const gateResult = reportPresent ? readGateResult(fs.readFileSync(reportPath, 'utf8')) : 'UNKNOWN';
const relativeReportPath = APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH.split(path.sep).join('/');
const section = `## Phase 2.13 Apps Script Auto-Review Gate

The auto-review report is a local/private review aid generated from sanitized evidence. Its presence does not prove production behavior, authorize migration, or resolve UNKNOWN fields without manual Drip/ChatGPT review.

| Field | Status |
| --- | --- |
| Auto-review report present | ${reportPresent ? 'YES' : 'NO'} |
| Report path | ${relativeReportPath} |
| Safely parsed gate result | ${gateResult} |
| Raw report copied into this packet | NO |
| Raw private evidence committed | NO |
| Production impact | NONE |
| Phase 3 started | NO |

UNKNOWN fields remain blockers unless they are supported by sanitized evidence and reviewed. Keep the report and this packet local/private.

`;

let packet = removeExistingSection(fs.readFileSync(packetPath, 'utf8'));
const insertionPoint = packet.indexOf('## Production Dependencies');
if (insertionPoint === -1) {
  console.error('Error: Apps Script review packet is missing the Production Dependencies section.');
  process.exit(1);
}
packet = `${packet.slice(0, insertionPoint)}${section}${packet.slice(insertionPoint)}`;
fs.writeFileSync(packetPath, packet, 'utf8');

console.log(`Apps Script Phase 2.13 packet reference applied: auto-review report ${reportPresent ? 'present' : 'not present'}.`);
console.log(`Safely parsed gate result: ${gateResult}`);
