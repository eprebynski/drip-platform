#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { parseArgs } from './private-evidence-kit-common.js';
import { APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH } from './apps-script-dependency-template.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const originalGeneratorPath = path.join(__dirname, 'generate-sanitized-migration-review-packets-clean.js');
const originalResult = spawnSync(process.execPath, [originalGeneratorPath, ...process.argv.slice(2)], {
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

function scrubSensitiveValue(value) {
  return String(value || '')
    .replace(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\b/g, '[REDACTED_APPS_SCRIPT_URL]')
    .replace(/\bAKfy[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_APPS_SCRIPT_TOKEN]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeMarkdown(value) {
  return (scrubSensitiveValue(value) || 'UNKNOWN').replace(/\|/g, '\\|');
}

function insertSafeFinding(packet, finding, evidenceType, confidence, notes) {
  if (packet.includes(finding)) {
    return packet;
  }
  const row = `| ${escapeMarkdown(finding)} | ${evidenceType} | ${confidence} | ${escapeMarkdown(notes)} |`;
  const header = '| --- | --- | --- | --- |';
  const index = packet.indexOf(header);
  if (index === -1) {
    return packet;
  }
  return `${packet.slice(0, index + header.length)}\n${row}${packet.slice(index + header.length)}`;
}

function removeExistingPhase212Section(packet) {
  const start = packet.indexOf('## Phase 2.12 Manual Verification Template');
  const end = packet.indexOf('## Production Dependencies', start);
  if (start === -1 || end === -1) {
    return packet;
  }
  return `${packet.slice(0, start)}${packet.slice(end)}`;
}

const packetPath = path.join(options.root, 'review-packets', 'apps-script-review-packet.md');
if (!fs.existsSync(packetPath)) {
  console.error(`Error: Apps Script review packet was not generated: ${packetPath}`);
  process.exit(1);
}

const templatePath = path.join(options.root, APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH);
const templatePresent = fs.existsSync(templatePath);
const templateRelativePath = APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH.split(path.sep).join('/');
const phase212Section = `## Phase 2.12 Manual Verification Template

The Phase 2.12 template is a manual verification aid only. Template presence does not prove deployed parity, runtime behavior, live caller usage, linked Sheet IDs, or cutover ownership.

| Field | Status |
| --- | --- |
| Template path | ${escapeMarkdown(templateRelativePath)} |
| Template present | ${templatePresent ? 'YES' : 'NO'} |
| Evidence status | MANUAL_VERIFICATION_AID_ONLY |
| Production impact | NONE |
| Phase 3 started | NO |
| Recommended manual step | Complete the template from sanitized private exports before Phase 3 review. |

## Still UNKNOWN Until Verified

| Dependency question | Current status | Required verification |
| --- | --- | --- |
| Deployed Apps Script parity | UNKNOWN | Compare sanitized source/version exports to deployed version mapping. |
| Apps Script runtime load order | UNKNOWN | Review sanitized project file order and runtime notes. |
| Live mode usage | UNKNOWN | Map public routes/forms/callers to doGet/doPost modes from sanitized evidence. |
| Linked Sheet IDs | UNKNOWN | Verify Sheet links from sanitized exports without committing private IDs. |
| Cutover owner | UNKNOWN | Assign Drip owner before any replacement or retirement decision. |

`;

let packet = fs.readFileSync(packetPath, 'utf8');
packet = removeExistingPhase212Section(packet);
if (templatePresent) {
  packet = insertSafeFinding(
    packet,
    'Phase 2.12 Apps Script dependency verification template is present as a manual aid.',
    'MANUAL_TEMPLATE',
    'HIGH',
    'Template presence does not verify production behavior; complete it before Phase 3 review.'
  );
}

const productionDependenciesIndex = packet.indexOf('## Production Dependencies');
if (productionDependenciesIndex === -1) {
  console.error('Error: Apps Script review packet is missing the Production Dependencies section.');
  process.exit(1);
}

packet = `${packet.slice(0, productionDependenciesIndex)}${phase212Section}${packet.slice(productionDependenciesIndex)}`;
fs.writeFileSync(packetPath, packet, 'utf8');
console.log('Apps Script Phase 2.12 packet reference applied: template is a manual aid and UNKNOWNs are preserved.');
