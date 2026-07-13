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
  APPS_SCRIPT_WORKFLOW_REVIEW_GUIDANCE_RELATIVE_PATH,
  readGateResult,
  scrubAppsScriptSensitiveValue
} from './apps-script-auto-review-common.js';

const options = parseArgs();
if (options.help) {
  printHelp('create-apps-script-workflow-review-guidance');
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

const PRIORITY_WORKFLOWS = [
  'Conference Campaigns',
  'Patient Campaigns',
  'ScreenCloud/display provider operations',
  'Provider display preferences'
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

function parseSourceTypes(reportText) {
  const match = reportText.match(/^- Source types used:\s*(.+)$/m);
  return match ? scrubAppsScriptSensitiveValue(match[1]) : 'UNKNOWN';
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

function parseVerificationWorkflowTable(packetText) {
  const section = extractSection(packetText, 'Workflow Verification Table');
  if (!section) return new Map();
  const rows = new Map();
  for (const line of section.split(/\r?\n/)) {
    if (!line.trim().startsWith('|') || /^\|\s*(?:---|Workflow\s*\|)/i.test(line)) continue;
    const cells = parseMarkdownRow(line);
    if (cells.length < 15 || !WORKFLOWS.includes(cells[0])) continue;
    rows.set(cells[0], {
      workflow: cells[0],
      appsScriptSignal: cells[1],
      handler: cells[2],
      caller: cells[3],
      sheet: cells[4],
      trigger: cells[5],
      readWrite: cells[6],
      dryRunDecision: cells[13]
    });
  }
  return rows;
}

function candidateFor(workflow, reportRows, packetRows) {
  return packetRows.get(workflow) || reportRows.get(workflow) || {
    workflow,
    appsScriptSignal: 'UNKNOWN',
    handler: 'UNKNOWN',
    caller: 'UNKNOWN',
    sheet: 'UNKNOWN',
    trigger: 'UNKNOWN',
    readWrite: 'UNKNOWN',
    dryRunDecision: 'EXCLUDE_FROM_PHASE_3_DRY_RUN',
    stillUnknown: 'UNKNOWN'
  };
}

function hasCandidate(value) {
  return value && !/^(?:UNKNOWN|NONE|N\/A)$/i.test(value);
}

function routeRisk(value) {
  const route = String(value || '');
  let score = 0;
  if (/conference/i.test(route)) score += 5;
  if (/campaign/i.test(route)) score += 3;
  if (/submit|purchase|billing|redirect/i.test(route)) score += 2;
  if (/preview/i.test(route)) score += 1;
  return score;
}

function reviewOrder(reportRows, packetRows) {
  const rows = WORKFLOWS.map((workflow) => {
    const row = candidateFor(workflow, reportRows, packetRows);
    const priorityIndex = PRIORITY_WORKFLOWS.indexOf(workflow);
    const hasRoute = hasCandidate(row.caller);
    const hasSignal = hasCandidate(row.appsScriptSignal) || hasCandidate(row.handler) || hasCandidate(row.sheet) || hasCandidate(row.trigger) || hasCandidate(row.readWrite);
    const bucket = priorityIndex !== -1 ? priorityIndex : hasRoute ? 10 : hasSignal ? 20 : 30;
    return {
      workflow,
      row,
      bucket,
      score: routeRisk(row.caller),
      rationale: hasRoute
        ? 'Route/caller candidate present; review before signal-only workflows.'
        : hasSignal
          ? 'Apps Script evidence signal present; verify before no-signal workflows.'
          : 'No relationship signal found; keep UNKNOWN unless manual review finds evidence.'
    };
  });
  return rows.sort((a, b) => a.bucket - b.bucket || b.score - a.score || a.workflow.localeCompare(b.workflow));
}

function displayedRoot(privateRoot) {
  const relativeHome = path.relative(os.homedir(), privateRoot);
  return relativeHome && !relativeHome.startsWith('..') ? path.join('~', relativeHome) : privateRoot;
}

function orderTable(ordered) {
  return ordered.map((item, index) => `| ${index + 1} | ${escapeMarkdown(item.workflow)} | ${escapeMarkdown(item.row.caller)} | ${escapeMarkdown(item.row.appsScriptSignal)} | ${item.score} | ${escapeMarkdown(item.rationale)} |`).join('\n');
}

function checklistSections(ordered) {
  return ordered.map((item, index) => `### ${index + 1}. ${escapeMarkdown(item.workflow)}

| Question | Default answer | Evidence support |
| --- | --- | --- |
| Is there an active Apps Script handler or mode for this workflow? | UNKNOWN | Candidate: ${escapeMarkdown(item.row.handler)} |
| Is there a production caller or public route for this workflow? | UNKNOWN | Candidate: ${escapeMarkdown(item.row.caller)} |
| Which current Sheet, if any, does the workflow read from? | UNKNOWN | Candidate current Sheet: ${escapeMarkdown(item.row.sheet)} |
| Which current Sheet, if any, does the workflow write to? | UNKNOWN | Candidate current Sheet: ${escapeMarkdown(item.row.sheet)} |
| Is there a trigger involved? | UNKNOWN | Candidate trigger: ${escapeMarkdown(item.row.trigger)} |
| Who owns cutover review? | UNKNOWN | UNKNOWN |
| Is there a documented rollback path? | UNKNOWN | UNKNOWN |
| Should the workflow remain excluded from any Phase 3 dry run? | EXCLUDE_FROM_PHASE_3_DRY_RUN | Current dry-run decision: ${escapeMarkdown(item.row.dryRunDecision || 'EXCLUDE_FROM_PHASE_3_DRY_RUN')} |
| What evidence supports each answer? | UNKNOWN | Use sanitized evidence only. |
`).join('\n');
}

function conferenceDeepDive(row) {
  return `## First Workflow Deep-Dive Template

| Field | Value |
| --- | --- |
| Workflow | Conference Campaigns |
| Candidate routes | ${escapeMarkdown(row.caller)} |
| Candidate handler/mode | ${escapeMarkdown(row.handler)} |
| Candidate current Sheet | ${escapeMarkdown(row.sheet)} |
| Candidate tabs | UNKNOWN |
| Read behavior | UNKNOWN |
| Write behavior | UNKNOWN |
| Trigger behavior | ${escapeMarkdown(row.trigger)} |
| Production caller evidence | ${escapeMarkdown(row.caller)} |
| Cutover owner | UNKNOWN |
| Rollback path | UNKNOWN |
| Reviewer decision for handler | UNKNOWN |
| Reviewer decision for caller | UNKNOWN |
| Reviewer decision for read/write | UNKNOWN |
| Reviewer decision for trigger | UNKNOWN |
| Dry-run decision | ${escapeMarkdown(row.dryRunDecision || 'EXCLUDE_FROM_PHASE_3_DRY_RUN')} |
| Notes | UNKNOWN |
`;
}

function buildGuidance({ privateRoot, reportFound, reportText, packetFound, packetText }) {
  const reportRows = reportFound ? parseWorkflowRelationshipMatrix(reportText) : new Map();
  const packetRows = packetFound ? parseVerificationWorkflowTable(packetText) : new Map();
  const ordered = reviewOrder(reportRows, packetRows);
  const conferenceRow = candidateFor('Conference Campaigns', reportRows, packetRows);
  const sourceTypes = reportFound ? parseSourceTypes(reportText) : 'UNKNOWN';
  const reportGate = reportFound ? readGateResult(reportText) : 'UNKNOWN';

  return `# Apps Script Workflow Review Guidance

## Evidence Boundary

| Field | Value |
| --- | --- |
| Generated by command | npm run evidence:create-apps-script-workflow-review-guidance |
| Generated at | ${new Date().toISOString()} |
| Private evidence root | ${escapeMarkdown(displayedRoot(privateRoot))} |
| Source types used | ${escapeMarkdown(sourceTypes)} |
| Auto-review report found | ${reportFound ? 'YES' : 'NO'} |
| Relationship verification packet found | ${packetFound ? 'YES' : 'NO'} |
| Auto-review gate result | ${escapeMarkdown(reportGate)} |
| Production impact | NONE |
| Phase 3 started | NO |
| Raw private evidence committed | NO |
| Manual review complete | UNKNOWN |

${reportFound ? '' : 'WARNING: Phase 2.16 auto-review report was not found. Candidate fields default to UNKNOWN.'}
${packetFound ? '' : 'WARNING: Phase 2.17 relationship verification packet was not found. Reviewer decisions default to UNKNOWN.'}

This guidance is local/private and does not query or modify live systems.

## Recommended Manual Review Order

| Rank | Workflow | Route/caller candidate | Apps Script signal | Route risk score | Rationale |
| --- | --- | --- | --- | --- | --- |
${orderTable(ordered)}

Review logic is conservative: route/caller candidates first, Apps Script evidence signals next, and workflows with no evidence signals last. Higher-risk route words such as conference, campaign, submit, billing, purchase, and redirect increase priority. The default first workflow is Conference Campaigns.

## Workflow Review Checklist

${checklistSections(ordered)}

${conferenceDeepDive(conferenceRow)}

## Allowed Review Decisions

${ALLOWED_REVIEW_DECISIONS.map((decision) => `- ${decision}`).join('\n')}

MAYBE_AFTER_REVIEW is not approval to deploy, cut over, write to live Sheets, edit Apps Script, modify triggers, or start Phase 3.

## Phase 3 Gate Reminder

- Default gate remains PHASE_3_BLOCKED.
- No workflow may be included in a Phase 3 dry run unless handler, caller, read/write behavior, cutover owner, and rollback path are reviewed.
- Production writes remain unauthorized.
- Live migration remains unauthorized.

## Do Not Do

- Do not deploy.
- Do not edit Apps Script.
- Do not change triggers.
- Do not write live Sheets.
- Do not start Phase 3.
- Do not commit generated private guidance.
- Do not treat evidence signals as production proof.
`;
}

try {
  assertPrivateRootOutsideRepo(options.root);
  ensurePrivateEvidenceFolders(options.root);
  const reportPath = path.join(options.root, APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH);
  const packetPath = path.join(options.root, APPS_SCRIPT_RELATIONSHIP_VERIFICATION_PACKET_RELATIVE_PATH);
  const reportFound = fs.existsSync(reportPath);
  const packetFound = fs.existsSync(packetPath);
  const reportText = reportFound ? fs.readFileSync(reportPath, 'utf8') : '';
  const packetText = packetFound ? fs.readFileSync(packetPath, 'utf8') : '';
  const guidance = buildGuidance({ privateRoot: options.root, reportFound, reportText, packetFound, packetText });
  const guidancePath = path.join(options.root, APPS_SCRIPT_WORKFLOW_REVIEW_GUIDANCE_RELATIVE_PATH);
  const temporaryPath = `${guidancePath}.tmp`;
  fs.mkdirSync(path.dirname(guidancePath), { recursive: true });
  fs.writeFileSync(temporaryPath, guidance, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporaryPath, guidancePath);
  const reportRows = reportFound ? parseWorkflowRelationshipMatrix(reportText).size : 0;
  const packetRows = packetFound ? parseVerificationWorkflowTable(packetText).size : 0;
  const ordered = reviewOrder(
    reportFound ? parseWorkflowRelationshipMatrix(reportText) : new Map(),
    packetFound ? parseVerificationWorkflowTable(packetText) : new Map()
  );
  console.log(`Apps Script workflow review guidance written: ${guidancePath}`);
  console.log(`Phase 2.16 auto-review report parsed: ${reportFound ? 'YES' : 'NO'}`);
  console.log(`Phase 2.16 workflow rows parsed: ${reportRows}`);
  console.log(`Phase 2.17 verification packet parsed: ${packetFound ? 'YES' : 'NO'}`);
  console.log(`Phase 2.17 workflow rows parsed: ${packetRows}`);
  console.log(`Top recommended workflow: ${ordered[0]?.workflow || 'UNKNOWN'}`);
  console.log('Overall gate recommendation: PHASE_3_BLOCKED');
  console.log('Production impact: NONE');
  console.log('Phase 3 started: NO');
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
