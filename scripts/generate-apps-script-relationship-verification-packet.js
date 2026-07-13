#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  assertPrivateRootOutsideRepo,
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp
} from './private-evidence-kit-common.js';
import {
  APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH,
  APPS_SCRIPT_RELATIONSHIP_VERIFICATION_PACKET_RELATIVE_PATH,
  readGateResult,
  scrubAppsScriptSensitiveValue
} from './apps-script-auto-review-common.js';

const options = parseArgs();
if (options.help) {
  printHelp('create-apps-script-relationship-verification-packet');
  process.exit(0);
}

const WORKFLOWS = [
  'Provider signup',
  'Advertiser/vendor/employer signup',
  'Provider display preferences',
  'Provider Campaigns',
  'Patient Campaigns',
  'Conference Campaigns',
  'QR redirects',
  'Patient Campaign QR scan logging',
  'Video/playback billing',
  'Provider revenue share',
  'Stripe invoicing',
  'Welcome emails',
  'ScreenCloud/display provider operations',
  'YouTube/playlist operations',
  'Market intelligence uploads',
  'Admin review workflows'
];

const ALLOWED_REVIEW_DECISIONS = [
  'UNKNOWN',
  'NO_ACTIVE_DEPENDENCY_FOUND',
  'ACTIVE_DEPENDENCY_CONFIRMED',
  'PARTIAL_DEPENDENCY_CONFIRMED',
  'EXCLUDE_FROM_PHASE_3_DRY_RUN',
  'MAYBE_AFTER_REVIEW'
];
const SAFE_STATUS_VALUES = new Set([...ALLOWED_REVIEW_DECISIONS, 'PHASE_3_BLOCKED']);

function escapeMarkdown(value) {
  const text = String(value || '').trim();
  const scrubbed = SAFE_STATUS_VALUES.has(text) ? text : scrubAppsScriptSensitiveValue(text);
  return (scrubbed.trim() || 'UNKNOWN').replace(/\|/g, '\\|');
}

function parseMarkdownRow(line) {
  const cells = [];
  let cell = '';
  for (let index = 0; index < line.length; index += 1) {
    const character = line[index];
    if (character === '\\' && line[index + 1] === '|') {
      cell += '|';
      index += 1;
    } else if (character === '|') {
      cells.push(cell.trim());
      cell = '';
    } else {
      cell += character;
    }
  }
  cells.push(cell.trim());
  if (cells[0] === '') cells.shift();
  if (cells.at(-1) === '') cells.pop();
  return cells;
}

function extractSection(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const next = text.indexOf('\n## ', start + 1);
  return next === -1 ? text.slice(start) : text.slice(start, next);
}

function parseWorkflowRelationshipMatrix(reportText) {
  const section = extractSection(reportText, 'Workflow Relationship Matrix');
  if (!section) return new Map();
  const rows = new Map();
  for (const line of section.split(/\r?\n/)) {
    if (!line.trim().startsWith('|') || /^\|\s*(?:---|Workflow\s*\|)/i.test(line)) continue;
    const cells = parseMarkdownRow(line);
    if (cells.length < 11 || !WORKFLOWS.includes(cells[0])) continue;
    rows.set(cells[0], {
      workflow: cells[0],
      appsScriptSignal: cells[1],
      handler: cells[2],
      caller: cells[3],
      sheet: cells[4],
      readWrite: cells[5],
      trigger: cells[6],
      dryRunDecision: cells[9],
      stillUnknown: cells[10]
    });
  }
  return rows;
}

function parseSourceTypes(reportText) {
  const match = reportText.match(/^- Source types used:\s*(.+)$/m);
  return match ? scrubAppsScriptSensitiveValue(match[1]) : 'UNKNOWN';
}

function displayedRoot(privateRoot) {
  const relativeHome = path.relative(os.homedir(), privateRoot);
  return relativeHome && !relativeHome.startsWith('..') ? path.join('~', relativeHome) : privateRoot;
}

function packetRows(matrix) {
  return WORKFLOWS.map((workflow) => {
    const row = matrix.get(workflow) || {};
    const dryRunDecision = row.dryRunDecision && row.dryRunDecision !== 'UNKNOWN'
      ? row.dryRunDecision
      : 'EXCLUDE_FROM_PHASE_3_DRY_RUN';
    return `| ${escapeMarkdown(workflow)} | ${escapeMarkdown(row.appsScriptSignal || 'UNKNOWN')} | ${escapeMarkdown(row.handler || 'UNKNOWN')} | ${escapeMarkdown(row.caller || 'UNKNOWN')} | ${escapeMarkdown(row.sheet || 'UNKNOWN')} | ${escapeMarkdown(row.trigger || 'UNKNOWN')} | ${escapeMarkdown(row.readWrite || 'UNKNOWN')} | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | ${escapeMarkdown(dryRunDecision)} | UNKNOWN |`;
  }).join('\n');
}

function rollbackRows() {
  return WORKFLOWS.map((workflow) => `| ${escapeMarkdown(workflow)} | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |`).join('\n');
}

function decisionSummary(matrix) {
  const dryRunDecisions = WORKFLOWS.map((workflow) => matrix.get(workflow)?.dryRunDecision || 'EXCLUDE_FROM_PHASE_3_DRY_RUN');
  const excluded = dryRunDecisions.filter((decision) => decision === 'EXCLUDE_FROM_PHASE_3_DRY_RUN').length;
  const maybe = dryRunDecisions.filter((decision) => decision === 'MAYBE_AFTER_REVIEW').length;
  return [
    ['Total workflows', WORKFLOWS.length],
    ['Workflows excluded', excluded],
    ['Workflows maybe after review', maybe],
    ['Workflows with confirmed handler', 0],
    ['Workflows with confirmed caller', 0],
    ['Workflows with confirmed read/write behavior', 0],
    ['Workflows with assigned cutover owner', 0],
    ['Workflows with documented rollback path', 0],
    ['Overall gate recommendation', 'PHASE_3_BLOCKED']
  ].map(([field, value]) => `| ${field} | ${value} |`).join('\n');
}

function buildPacket({ privateRoot, reportFound, reportText }) {
  const reportGate = reportFound ? readGateResult(reportText) : 'UNKNOWN';
  const matrix = reportFound ? parseWorkflowRelationshipMatrix(reportText) : new Map();
  const sourceTypes = reportFound ? parseSourceTypes(reportText) : 'UNKNOWN';
  const reportStatus = reportFound
    ? `FOUND - parsed ${matrix.size} workflow relationship row(s) from the Phase 2.16 auto-review report.`
    : 'MISSING - Phase 2.16 report not found; candidate fields default to UNKNOWN.';

  return `# Apps Script Relationship Verification Packet

## Evidence Boundary

| Field | Value |
| --- | --- |
| Generated by command | npm run evidence:create-apps-script-relationship-verification-packet |
| Generated at | ${new Date().toISOString()} |
| Private evidence root | ${escapeMarkdown(displayedRoot(privateRoot))} |
| Phase 2.16 auto-review report | ${escapeMarkdown(reportStatus)} |
| Source types used | ${escapeMarkdown(sourceTypes)} |
| Auto-review gate result | ${escapeMarkdown(reportGate)} |
| Production impact | NONE |
| Phase 3 started | NO |
| Raw private evidence committed | NO |
| Manual review complete | UNKNOWN |

This packet is local/private. It does not query Apps Script, Google Sheets, GCP, Stripe, ScreenCloud, Squarespace, DNS, Cloud Run, or production systems.

## Instructions For Manual Review

Review one workflow at a time using sanitized evidence only.

- Evidence signals are not production proof.
- Do not use live systems unless separately authorized.
- Do not paste secrets, deployment URLs, private Sheet IDs, customer data, payment data, or raw exports into this packet.
- Keep this packet local/private.
- Preserve UNKNOWN unless sanitized evidence supports a conclusion.
- Do not treat any reviewed status as approval to deploy, cut over, write to live Sheets, or start Phase 3.

Allowed reviewer decision values:

${ALLOWED_REVIEW_DECISIONS.map((decision) => `- ${decision}`).join('\n')}

## Workflow Verification Table

| Workflow | Current Apps Script signal from Phase 2.16 | Candidate handler/mode | Candidate caller/route | Candidate current Sheet | Candidate trigger | Candidate read/write behavior | Reviewer decision for handler | Reviewer decision for caller | Reviewer decision for Sheet read/write | Reviewer decision for trigger | Reviewer decision for cutover owner | Reviewer decision for rollback path | Dry-run decision | Reviewer notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${packetRows(matrix)}

## Cutover Owner Review Section

| Proposed cutover owner | Evidence source description | Owner status | Decision date | Reviewer | Notes |
| --- | --- | --- | --- | --- | --- |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN |

## Rollback Path Review Section

| Workflow | Rollback path documented? | Rollback owner | Rollback test status | Rollback notes | Reviewer decision |
| --- | --- | --- | --- | --- | --- |
${rollbackRows()}

## Phase 3 Decision Summary

| Field | Value |
| --- | --- |
${decisionSummary(matrix)}

The default overall gate recommendation remains PHASE_3_BLOCKED. Any future MAYBE_AFTER_REVIEW status still requires Drip/ChatGPT review, explicit scope approval, and production writes remaining unauthorized.

## Do Not Do

- Do not deploy.
- Do not edit Apps Script.
- Do not change triggers.
- Do not write live Sheets.
- Do not start Phase 3.
- Do not commit generated private packet.
- Do not treat evidence signals as production proof.
`;
}

try {
  assertPrivateRootOutsideRepo(options.root);
  ensurePrivateEvidenceFolders(options.root);
  const reportPath = path.join(options.root, APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH);
  const reportFound = fs.existsSync(reportPath);
  const reportText = reportFound ? fs.readFileSync(reportPath, 'utf8') : '';
  const packet = buildPacket({ privateRoot: options.root, reportFound, reportText });
  const packetPath = path.join(options.root, APPS_SCRIPT_RELATIONSHIP_VERIFICATION_PACKET_RELATIVE_PATH);
  const temporaryPath = `${packetPath}.tmp`;
  fs.mkdirSync(path.dirname(packetPath), { recursive: true });
  fs.writeFileSync(temporaryPath, packet, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporaryPath, packetPath);
  const parsedRows = reportFound ? parseWorkflowRelationshipMatrix(reportText).size : 0;
  console.log(`Apps Script relationship verification packet written: ${packetPath}`);
  console.log(`Phase 2.16 auto-review report parsed: ${reportFound ? 'YES' : 'NO'}`);
  console.log(`Workflow rows prefilled: ${parsedRows}`);
  console.log('Overall gate recommendation: PHASE_3_BLOCKED');
  console.log('Production impact: NONE');
  console.log('Phase 3 started: NO');
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
