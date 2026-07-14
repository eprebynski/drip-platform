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
  PHASE_3_READINESS_TRACKER_RELATIVE_PATH,
  scrubAppsScriptSensitiveValue
} from './apps-script-auto-review-common.js';

const options = parseArgs();
if (options.help) {
  printHelp('create-phase-3-readiness-tracker');
  process.exit(0);
}

const WORKFLOW_REVIEWS = [
  {
    workflow: 'Conference Campaigns',
    file: 'conference-campaigns-manual-review.md',
    dependencyField: null
  },
  {
    workflow: 'Patient Campaigns',
    file: 'patient-campaigns-manual-review.md',
    dependencyField: null
  },
  {
    workflow: 'Provider Campaigns',
    file: 'provider-campaigns-manual-review.md',
    dependencyField: null
  },
  {
    workflow: 'ScreenCloud/display provider operations',
    file: 'screencloud-display-provider-operations-manual-review.md',
    dependencyField: 'Reviewer decision for display-provider dependency'
  },
  {
    workflow: 'Provider display preferences',
    file: 'provider-display-preferences-manual-review.md',
    dependencyField: 'Reviewer decision for display eligibility dependency'
  }
];

const NEXT_MANUAL_REVIEWS = [
  'Admin review workflows',
  'Stripe invoicing',
  'Video/playback billing',
  'Patient Campaign QR scan logging',
  'Provider revenue share',
  'YouTube/playlist operations',
  'Provider signup',
  'Advertiser/vendor/employer signup',
  'QR redirects',
  'Market intelligence uploads',
  'Welcome emails'
];

const SUPPORTING_FILES = [
  'apps-script-workflow-review-guidance.md',
  'apps-script-relationship-verification-packet.md',
  'apps-script-dependency-auto-review-report.md'
];

const SAFE_STATUS_VALUES = new Set([
  'APPROVED',
  'BLOCKED_BY_UNKNOWN_DEPENDENCIES',
  'BLOCKED_EARLY',
  'BLOCKED_PROGRESSING',
  'EXCLUDE_FROM_PHASE_3_DRY_RUN',
  'FOUND',
  'HIGH',
  'LOW',
  'MAYBE_AFTER_MANUAL_REVIEW',
  'MEDIUM',
  'N/A',
  'NO',
  'NONE',
  'NOT_APPROVED',
  'NOT_FOUND',
  'NOT_REVIEWED',
  'PARTIAL',
  'PARTIAL_DEPENDENCY_CONFIRMED',
  'PHASE_3_BLOCKED',
  'PLANNING_ONLY',
  'READY_FOR_INTERNAL_DRY_RUN_BUILD',
  'READY_FOR_LIMITED_DRY_RUN_REVIEW',
  'READY_FOR_NON_PRODUCTION_DESIGN',
  'READY_FOR_PHASE_3_APPROVAL_REVIEW',
  'UNKNOWN',
  'YES'
]);

const ADMIN_DASHBOARD_AREAS = [
  ['Campaign review queue', 'Patient Campaigns / Provider Campaigns / Conference Campaigns', 'BLOCKED_BY_UNKNOWN_DEPENDENCIES', 'Campaign handler, caller, Sheet read/write, owner, and rollback decisions remain incomplete.'],
  ['Conference Campaign admin', 'Conference Campaigns', 'PLANNING_ONLY', 'Conference caller evidence is partial, but handler and read/write behavior remain UNKNOWN.'],
  ['Patient Campaign admin', 'Patient Campaigns', 'PLANNING_ONLY', 'Patient campaign caller evidence is partial, but display eligibility, billing, and delivery dependencies remain UNKNOWN.'],
  ['Provider Campaign admin', 'Provider Campaigns', 'BLOCKED_BY_UNKNOWN_DEPENDENCIES', 'Provider Campaigns-specific caller, handler, and read/write behavior remain UNKNOWN.'],
  ['Provider display preference review', 'Provider display preferences', 'PLANNING_ONLY', 'Display eligibility dependency is partial, but current behavior and ownership remain UNKNOWN.'],
  ['Screen/display provider status', 'ScreenCloud/display provider operations', 'PLANNING_ONLY', 'Display-provider dependency is partial, but exact production details and rollback remain UNKNOWN.'],
  ['Billing/revenue-share review', 'Provider revenue share / Video/playback billing / Stripe invoicing', 'BLOCKED_BY_UNKNOWN_DEPENDENCIES', 'Billing and revenue-share workflows have not been manually reviewed.'],
  ['Issue tracker', 'All reviewed workflows', 'READY_FOR_NON_PRODUCTION_DESIGN', 'Reviewed workflows have clear blocker lists that can feed an internal issue tracker.'],
  ['Evidence/gate status panel', 'Manual review rollup', 'READY_FOR_NON_PRODUCTION_DESIGN', 'Evidence and gate fields are available for local-only dashboard design.'],
  ['User/org lookup', 'Provider signup / Advertiser/vendor/employer signup', 'BLOCKED_BY_UNKNOWN_DEPENDENCIES', 'Signup and organization workflows have not been manually reviewed.']
];

function displayedRoot(privateRoot) {
  const relativeHome = path.relative(os.homedir(), privateRoot);
  return relativeHome && !relativeHome.startsWith('..') ? path.join('~', relativeHome) : privateRoot;
}

function escapeMarkdown(value) {
  const rawValue = String(value || '').trim();
  const scrubbed = SAFE_STATUS_VALUES.has(rawValue)
    ? rawValue
    : scrubAppsScriptSensitiveValue(rawValue);
  return (scrubbed || 'UNKNOWN').replace(/\|/g, '\\|');
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

function parseFieldTable(text, heading) {
  const section = extractSection(text, heading);
  const fields = new Map();
  for (const line of section.split(/\r?\n/)) {
    if (!line.trim().startsWith('|') || /^\|\s*(?:---|Field\s*\||Generated by\s*\|)/i.test(line)) continue;
    const cells = parseMarkdownRow(line);
    if (cells.length >= 2) {
      fields.set(cells[0], cells.slice(1).join(' | '));
    }
  }
  return fields;
}

function extractSection(text, heading) {
  const start = text.indexOf(`## ${heading}`);
  if (start === -1) return '';
  const next = text.indexOf('\n## ', start + 1);
  return next === -1 ? text.slice(start) : text.slice(start, next);
}

function extractUnknownItems(text) {
  const section = extractSection(text, 'Still UNKNOWN');
  return section.split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith('- '))
    .map((line) => escapeMarkdown(line.slice(2).replace(/: UNKNOWN\.?$/i, '')))
    .filter(Boolean);
}

function reviewFromFile(privateRoot, config) {
  const relativePath = path.join('apps-script', config.file);
  const filePath = path.join(privateRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    return {
      ...config,
      found: false,
      relativePath,
      manualStatus: 'NOT_REVIEWED',
      handlerDecision: 'NOT_REVIEWED',
      callerDecision: 'NOT_REVIEWED',
      readWriteDecision: 'NOT_REVIEWED',
      triggerDecision: 'NOT_REVIEWED',
      dependencyDecision: config.dependencyField ? 'NOT_REVIEWED' : 'N/A',
      cutoverOwnerDecision: 'NOT_REVIEWED',
      rollbackPathDecision: 'NOT_REVIEWED',
      dryRunDecision: 'EXCLUDE_FROM_PHASE_3_DRY_RUN',
      overallRecommendation: 'PHASE_3_BLOCKED',
      hardBlockers: ['manual review file missing']
    };
  }

  const text = fs.readFileSync(filePath, 'utf8');
  const boundary = parseFieldTable(text, 'Evidence Boundary');
  const decisionHeading = `${config.workflow} Decision Table`;
  const decisions = parseFieldTable(text, decisionHeading);
  const unknowns = extractUnknownItems(text);
  return {
    ...config,
    found: true,
    relativePath,
    manualStatus: boundary.get('Manual review complete') || 'UNKNOWN',
    handlerDecision: decisions.get('Reviewer decision for handler') || 'UNKNOWN',
    callerDecision: decisions.get('Reviewer decision for caller') || 'UNKNOWN',
    readWriteDecision: decisions.get('Reviewer decision for read/write') || 'UNKNOWN',
    triggerDecision: decisions.get('Reviewer decision for trigger') || 'UNKNOWN',
    dependencyDecision: config.dependencyField ? decisions.get(config.dependencyField) || 'UNKNOWN' : 'N/A',
    cutoverOwnerDecision: decisions.get('Reviewer decision for cutover owner') || 'UNKNOWN',
    rollbackPathDecision: decisions.get('Reviewer decision for rollback path') || 'UNKNOWN',
    dryRunDecision: decisions.get('Dry-run decision') || 'EXCLUDE_FROM_PHASE_3_DRY_RUN',
    overallRecommendation: decisions.get('Overall recommendation') || 'PHASE_3_BLOCKED',
    hardBlockers: unknowns.length ? unknowns : ['UNKNOWN blockers not enumerated']
  };
}

function hardBlockerList(reviews) {
  const required = [
    'active Apps Script handler/mode unknown',
    'active production caller proof unknown',
    'Sheet read/write behavior unknown',
    'trigger/schedule involvement unknown',
    'cutover owner unknown',
    'rollback path unknown',
    'route owner/traffic priority unknown',
    'whether data should enter Phase 3 dataset ingestion unknown'
  ];
  const conditional = [
    'source-system owner unknown where display-provider dependencies are involved',
    'exact production dependency details unknown where display-provider or eligibility dependencies are involved'
  ];
  const fromReviews = new Set();
  for (const review of reviews) {
    for (const blocker of review.hardBlockers) {
      fromReviews.add(`${review.workflow}: ${blocker}`);
    }
  }
  return [...required, ...conditional, ...fromReviews];
}

function workflowRollupTable(reviews) {
  return reviews.map((review) => {
    const blockers = review.hardBlockers.slice(0, 5).join('; ');
    return `| ${escapeMarkdown(review.workflow)} | ${review.found ? 'YES' : 'NO'} | ${escapeMarkdown(review.manualStatus)} | ${escapeMarkdown(review.handlerDecision)} | ${escapeMarkdown(review.callerDecision)} | ${escapeMarkdown(review.readWriteDecision)} | ${escapeMarkdown(review.triggerDecision)} | ${escapeMarkdown(review.dependencyDecision)} | ${escapeMarkdown(review.cutoverOwnerDecision)} | ${escapeMarkdown(review.rollbackPathDecision)} | ${escapeMarkdown(review.dryRunDecision)} | ${escapeMarkdown(review.overallRecommendation)} | ${escapeMarkdown(blockers)} |`;
  }).join('\n');
}

function adminReadinessTable() {
  return ADMIN_DASHBOARD_AREAS
    .map(([area, workflow, readiness, reason]) => `| ${area} | ${workflow} | ${readiness} | ${reason} |`)
    .join('\n');
}

function filesFoundSummary(reviews) {
  return reviews
    .map((review) => `${review.workflow}: ${review.found ? 'FOUND' : 'NOT_REVIEWED'}`)
    .join('; ');
}

function supportFilesSummary(privateRoot) {
  return SUPPORTING_FILES
    .map((file) => {
      const found = fs.existsSync(path.join(privateRoot, 'apps-script', file));
      return `${file}: ${found ? 'FOUND' : 'NOT_FOUND'}`;
    })
    .join('; ');
}

function partialDecisionSummary(reviews) {
  return reviews
    .filter((review) => [review.callerDecision, review.dependencyDecision].includes('PARTIAL_DEPENDENCY_CONFIRMED'))
    .map((review) => review.workflow)
    .join(', ') || 'NONE';
}

function buildTracker(privateRoot, reviews) {
  const blockers = hardBlockerList(reviews);
  const foundCount = reviews.filter((review) => review.found).length;
  return `# Phase 3 Readiness Tracker

## Evidence Boundary

| Field | Value |
| --- | --- |
| Generated by command | npm run evidence:create-phase-3-readiness-tracker |
| Generated at | ${new Date().toISOString()} |
| Private evidence root | ${escapeMarkdown(displayedRoot(privateRoot))} |
| Manual review files found | ${foundCount} of ${reviews.length} |
| Manual review file status | ${escapeMarkdown(filesFoundSummary(reviews))} |
| Supporting evidence file status | ${escapeMarkdown(supportFilesSummary(privateRoot))} |
| Production impact | NONE |
| Phase 3 started | NO |
| Live systems queried | NO |
| Raw private evidence committed | NO |
| Tracker confidence | MEDIUM for rollup status; LOW for readiness because hard blockers remain UNKNOWN |

This tracker reads local/private files only. Workflow decisions come from the five manual review files; supporting files are reported for evidence-boundary context only. It does not query or modify live systems.

## Executive Summary

| Field | Value |
| --- | --- |
| Overall gate recommendation | PHASE_3_BLOCKED |
| Phase 3 dry-run status | NOT_APPROVED |
| Production writes authorized | NO |
| Live migration authorized | NO |
| Admin dashboard v0 readiness | Planning/evidence stage only |
| Phase 3 readiness score | BLOCKED_PROGRESSING |
| Partial dependency movement | ${escapeMarkdown(partialDecisionSummary(reviews))} |
| Recommended next action | Continue manual workflow reviews and assign owners/rollback paths before any Phase 3 dry-run review. |

## Workflow Review Rollup

| Workflow | Manual review file found | Manual review complete status | Handler decision | Caller decision | Read/write decision | Trigger decision | Dependency decision, if applicable | Cutover owner decision | Rollback path decision | Dry-run decision | Overall recommendation | Remaining hard blockers |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${workflowRollupTable(reviews)}

## Remaining Hard Blockers

${blockers.map((blocker) => `- ${escapeMarkdown(blocker)}`).join('\n')}

## Phase 3 Readiness Score

| Field | Value |
| --- | --- |
| Score | BLOCKED_PROGRESSING |
| Allowed score values | BLOCKED_EARLY; BLOCKED_PROGRESSING; MAYBE_AFTER_MANUAL_REVIEW; READY_FOR_LIMITED_DRY_RUN_REVIEW; READY_FOR_PHASE_3_APPROVAL_REVIEW |
| Rationale | Several manual reviews are complete and some caller/dependency decisions moved to PARTIAL_DEPENDENCY_CONFIRMED, but handler, caller proof, read/write behavior, trigger, owner, rollback, and data-ingestion decisions remain unresolved. |

## Admin Dashboard v0 Readiness Tracker

The admin dashboard is not production-ready. Internal v0 planning can proceed only as non-production design until required workflows are mapped and hard blockers are resolved.

| Admin dashboard area | Related workflow | Readiness | Reason |
| --- | --- | --- | --- |
${adminReadinessTable()}

## What Would Move The Gate

For each reviewed workflow, Drip/ChatGPT must verify all of the following before moving toward Phase 3:

${reviews.map((review) => `### ${escapeMarkdown(review.workflow)}

- Handler/mode reviewed.
- Caller/route reviewed.
- Sheet read/write reviewed.
- Trigger reviewed.
- Cutover owner assigned.
- Rollback path documented.
- Explicit Drip/ChatGPT approval recorded.
`).join('\n')}

## Recommended Next Manual Reviews

${NEXT_MANUAL_REVIEWS.map((workflow, index) => `${index + 1}. ${workflow}`).join('\n')}

This ordering is conservative and may be adjusted if new sanitized evidence appears.

## Do Not Do

- Do not deploy.
- Do not edit Apps Script.
- Do not change triggers.
- Do not write live Sheets.
- Do not modify ScreenCloud.
- Do not modify YouTube playlists.
- Do not start Phase 3.
- Do not commit generated private tracker.
- Do not treat partial dependency decisions as production proof.
`;
}

try {
  assertPrivateRootOutsideRepo(options.root);
  ensurePrivateEvidenceFolders(options.root);
  const reviews = WORKFLOW_REVIEWS.map((review) => reviewFromFile(options.root, review));
  const tracker = buildTracker(options.root, reviews);
  const trackerPath = path.join(options.root, PHASE_3_READINESS_TRACKER_RELATIVE_PATH);
  const temporaryPath = `${trackerPath}.tmp`;
  fs.mkdirSync(path.dirname(trackerPath), { recursive: true });
  fs.writeFileSync(temporaryPath, tracker, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporaryPath, trackerPath);
  console.log(`Phase 3 readiness tracker written: ${trackerPath}`);
  console.log(`Manual review files found: ${reviews.filter((review) => review.found).length} of ${reviews.length}`);
  console.log('Reviewed workflows summarized: 5');
  console.log('Phase 3 readiness score: BLOCKED_PROGRESSING');
  console.log('Overall gate recommendation: PHASE_3_BLOCKED');
  console.log('Phase 3 dry-run status: NOT_APPROVED');
  console.log('Production impact: NONE');
  console.log('Phase 3 started: NO');
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
