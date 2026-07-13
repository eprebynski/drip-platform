#!/usr/bin/env node
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {
  assertPrivateRootOutsideRepo,
  ensurePrivateEvidenceFolders,
  isIgnoredEvidenceName,
  parseArgs,
  printHelp,
  TEXT_SNIFF_EXTENSIONS
} from './private-evidence-kit-common.js';
import {
  APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH,
  scrubAppsScriptSensitiveValue
} from './apps-script-auto-review-common.js';
import { APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH } from './apps-script-dependency-template.js';

const options = parseArgs();
if (options.help) {
  printHelp('review-apps-script-dependencies');
  process.exit(0);
}

const SOURCE_GROUPS = [
  ['SANITIZED_SUMMARY', 'sanitized-summaries', true],
  ['MIGRATION_REVIEW_PACKET', 'review-packets', true],
  ['REDACTED_COPY', path.join('redaction-reports', 'redacted-copies'), true],
  ['MANIFEST', 'manifests', false],
  ['MANUAL_TEMPLATE', APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH, false]
];
const GOOGLE_SHEETS_PACKET_RELATIVE_PATH = path.join(
  'review-packets',
  'google-sheets-destinations-review-packet.md'
);
const WORKFLOW_DATA = [
  ['Provider signup', 'provider\\s+(?:signup|sign-up|intake|registration)', 'Provider intake and account onboarding', 'Auth/user service', 'REBUILD_IN_CLOUD_RUN', 'Sheet 1: Provider Intake'],
  ['Advertiser/vendor/employer signup', '(?:advertiser|vendor|employer)\\s+(?:signup|sign-up|intake|registration)', 'Advertiser and partner intake', 'API route', 'REBUILD_IN_CLOUD_RUN', 'Sheet 2: Advertiser Intake'],
  ['Provider display preferences', '(?:provider\\s+)?display\\s+preferences?', 'Provider display preference intake', 'Firestore write', 'REPLACE_WITH_DASHBOARD_FLOW', 'Sheet 3: Provider Display Preferences'],
  ['Provider Campaigns', 'provider\\s+campaigns?', 'Provider campaign operations', 'API route', 'REBUILD_IN_CLOUD_RUN', 'Sheet 4: Provider Campaigns'],
  ['Patient Campaigns', 'patient\\s+campaigns?', 'Patient-facing campaign operations', 'API route', 'REBUILD_IN_CLOUD_RUN', 'Sheet 6: Patient Campaigns'],
  ['Conference Campaigns', 'conference\\s+(?:campaigns?|showcase|reservation|sponsorship)', 'Conference campaign and showcase operations', 'Conference service', 'REBUILD_IN_CLOUD_RUN', 'Sheet 5: Conference Campaigns'],
  ['QR redirects', 'qr\\s+(?:redirects?|routes?)|\\/qr(?:\\/|\\b)', 'Public QR redirect handling', 'Redirect service', 'REBUILD_IN_CLOUD_RUN', 'UNKNOWN'],
  ['Patient Campaign QR scan logging', 'qr\\s+scan\\s+(?:logging|events?)|patient.*qr\\s+scan', 'Patient campaign QR event capture', 'BigQuery event pipeline', 'REPLACE_WITH_FIRESTORE_OR_BIGQUERY_PIPELINE', 'Sheet 6: Patient Campaigns'],
  ['Video/playback billing', '(?:video|playback).{0,30}billing|billing.{0,30}(?:video|playback)', 'Playback-derived billing events', 'BigQuery event pipeline', 'REPLACE_WITH_FIRESTORE_OR_BIGQUERY_PIPELINE', 'Sheet 6: Patient Campaigns'],
  ['Provider revenue share', '(?:provider\\s+)?revenue\\s+share', 'Provider revenue-share calculation', 'Cloud Run job', 'REBUILD_IN_CLOUD_RUN', 'Sheet 6: Patient Campaigns'],
  ['Stripe invoicing', 'stripe\\s+(?:invoicing|invoice|billing)', 'Invoice preparation or delivery', 'Stripe webhook/service', 'REBUILD_IN_CLOUD_RUN', 'UNKNOWN'],
  ['Welcome emails', '(?:welcome|onboarding)\\s+emails?', 'Onboarding notifications', 'Notification service', 'REBUILD_IN_CLOUD_RUN', 'UNKNOWN'],
  ['ScreenCloud/display provider operations', 'screencloud|display\\s+provider\\s+(?:operations?|adapter)', 'Display provider synchronization', 'Screen/display provider adapter', 'REBUILD_IN_CLOUD_RUN', 'UNKNOWN'],
  ['YouTube/playlist operations', 'youtube|playlist\\s+operations?', 'Media and playlist operations', 'API route', 'REBUILD_IN_CLOUD_RUN', 'UNKNOWN'],
  ['Market intelligence uploads', 'market\\s+intelligence\\s+uploads?|payor\\s+dataset', 'Market-intelligence evidence intake', 'Cloud Storage upload flow', 'REPLACE_WITH_DASHBOARD_FLOW', 'UNKNOWN'],
  ['Admin review workflows', 'admin\\s+review\\s+workflows?|review\\s+queue', 'Human approval and review state', 'Dashboard flow', 'REPLACE_WITH_DASHBOARD_FLOW', 'UNKNOWN']
];
const WORKFLOWS = WORKFLOW_DATA.map(([name, pattern, role, target, disposition, sheet]) => ({
  name, pattern: new RegExp(pattern, 'i'), role, target, disposition, sheet
}));
const CURRENT_TO_FUTURE_SHEET_MAP = new Map([
  [1, 'Legacy Archive: Old Sheet 1 Campaigns'],
  [2, 'Sheet 2: Advertiser Intake'],
  [3, 'Sheet 3: Provider Display Preferences'],
  [4, 'Sheet 1: Provider Intake'],
  [5, 'Sheet 4: Provider Campaigns'],
  [6, 'Sheet 6: Patient Campaigns'],
  [7, 'Sheet 5: Conference Campaigns']
]);
const SHEET_DATA = [
  [1, 'current\\s+sheet\\s+1|old\\s+sheet\\s+1|legacy\\s+archive', 'Legacy campaign archive; archive/retire only'],
  [2, 'current\\s+sheet\\s+2|advertiser\\s+intake|vendor\\s+intake|employer\\s+intake', 'Advertiser/vendor/employer intake'],
  [3, 'current\\s+sheet\\s+3|provider\\s+display\\s+preferences?|provider\\s+preferences?|provider\\s+approvals?', 'Provider display preferences and approvals'],
  [4, 'current\\s+sheet\\s+4|provider\\s+intake|medical\\s+venue\\s+intake', 'Provider and medical venue intake'],
  [5, 'current\\s+sheet\\s+5|provider\\s+campaigns?|provider\\s+marketplace|provider\\s+directory', 'Provider marketplace and directory campaigns'],
  [6, 'current\\s+sheet\\s+6|patient\\s+campaigns?|video\\s+campaigns?|patient\\s+screen', 'Video and patient screen campaigns'],
  [7, 'current\\s+sheet\\s+7|conference\\s+campaigns?', 'Conference campaigns']
];
const SHEETS = SHEET_DATA.map(([number, pattern, role]) => ({
  number,
  label: `Current Sheet ${number}`,
  pattern: new RegExp(`\\b(?:${pattern})\\b`, 'i'),
  role,
  logical: CURRENT_TO_FUTURE_SHEET_MAP.get(number)
}));
const SAFE_EXTENSIONS = new Set(TEXT_SNIFF_EXTENSIONS);
const SAFE_ROUTE_WORDS = new Set('ad ads admin advertiser advertisers api app campaign campaigns cart center conference conferences contact employer employers form forms go intake legacy media old patient patients preview provider providers qr redirect redirects showcase signup submit upload vendor vendors'.split(' '));
const STATIC_ASSET = /\.(?:avif|css|gif|ico|jpe?g|js|map|pdf|png|svg|webp|woff2?)(?:$|[?#])/i;
const ROUTE_PATTERN = /\/[A-Za-z0-9][A-Za-z0-9._~!$&'()*+,;=:@%/-]*/g;
const PUBLIC_ROUTE_SIGNAL = /\/(?:[^/\s]+-)*(?:admin|advertiser|campaign|cart|conference|contact|employer|form|intake|media|patient|provider|qr|redirect|showcase|signup|submit|upload|vendor)(?:[-/]|$)/i;
const SENSITIVE_CANDIDATE = /(?:token|secret|cookie|password|credential|key|AKfy|script\.google|@)/i;

function escapeMarkdown(value) {
  return (scrubAppsScriptSensitiveValue(value).trim() || 'UNKNOWN').replace(/\|/g, '\\|');
}

function listTextFiles(targetPath, recursive) {
  if (!fs.existsSync(targetPath)) return [];
  if (fs.statSync(targetPath).isFile()) {
    return SAFE_EXTENSIONS.has(path.extname(targetPath).toLowerCase()) ? [targetPath] : [];
  }
  return fs.readdirSync(targetPath, { withFileTypes: true }).flatMap((entry) => {
    if (isIgnoredEvidenceName(entry.name)) return [];
    const entryPath = path.join(targetPath, entry.name);
    if (entry.isDirectory()) return recursive ? listTextFiles(entryPath, true) : [];
    return entry.isFile() && SAFE_EXTENSIONS.has(path.extname(entry.name).toLowerCase()) ? [entryPath] : [];
  });
}

function latestManifests(files) {
  const latest = new Map();
  for (const filePath of files) {
    const prefix = path.basename(filePath).replace(/(?:-\d{4}-\d{2}-\d{2}[^.]*)?\.[^.]+$/, '');
    const prior = latest.get(prefix);
    if (!prior || fs.statSync(filePath).mtimeMs > fs.statSync(prior).mtimeMs) latest.set(prefix, filePath);
  }
  return [...latest.values()];
}

function loadSources() {
  return SOURCE_GROUPS.flatMap(([type, relativePath, recursive]) => {
    let files = listTextFiles(path.join(options.root, relativePath), recursive);
    if (type === 'MANIFEST') files = latestManifests(files);
    return files.flatMap((filePath) => {
      if (path.resolve(filePath) === path.resolve(path.join(options.root, APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH))) return [];
      if (fs.statSync(filePath).size > 2_000_000) return [];
      return [{ type, filePath, text: scrubAppsScriptSensitiveValue(fs.readFileSync(filePath, 'utf8')) }];
    });
  });
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

function safePacketCell(value, maxLength = 180) {
  const scrubbed = scrubAppsScriptSensitiveValue(value)
    .replace(/https?:\/\/\S+/gi, '[REDACTED_URL]')
    .replace(/\s+/g, ' ')
    .trim();
  return (scrubbed || 'UNKNOWN').slice(0, maxLength);
}

function isKnownPacketCell(value) {
  return value && !/^(?:UNKNOWN|NONE|N\/A)$/i.test(value.trim());
}

function loadSanitizedSheetPromotion() {
  const packetPath = path.join(options.root, GOOGLE_SHEETS_PACKET_RELATIVE_PATH);
  const promotion = {
    found: fs.existsSync(packetPath),
    packetPath,
    rows: new Map(),
    fieldsPromoted: new Set()
  };
  if (!promotion.found) return promotion;

  const packet = fs.readFileSync(packetPath, 'utf8');
  const start = packet.indexOf('## Current Evidence Table');
  const end = packet.indexOf('## Future Logical Sheet Model', start);
  if (start === -1 || end === -1) return promotion;

  for (const line of packet.slice(start, end).split(/\r?\n/)) {
    if (!line.trim().startsWith('|') || /^\|\s*(?:---|Current source)/i.test(line)) continue;
    const cells = parseMarkdownRow(line);
    if (cells.length !== 7) continue;
    const currentSource = safePacketCell(cells[0]);
    const numberMatch = currentSource.match(/\bCurrent Sheet\s*(\d+)\b/i);
    if (!numberMatch) continue;
    const number = Number(numberMatch[1]);
    if (number < 1 || number > 7) continue;
    promotion.fieldsPromoted.add('current source');

    const spreadsheetIdKnown = isKnownPacketCell(cells[1]);
    const tabsKnown = isKnownPacketCell(cells[2]);
    const roleKnown = isKnownPacketCell(cells[3]);
    const evidenceKnown = isKnownPacketCell(cells[4]);
    const dispositionKnown = isKnownPacketCell(cells[5]);
    if (spreadsheetIdKnown) promotion.fieldsPromoted.add('spreadsheet ID status');
    if (tabsKnown) promotion.fieldsPromoted.add('tabs');
    if (roleKnown) promotion.fieldsPromoted.add('current role');
    if (evidenceKnown) promotion.fieldsPromoted.add('evidence status');
    if (dispositionKnown) promotion.fieldsPromoted.add('next-generation disposition');

    promotion.rows.set(number, {
      currentSource,
      idStatus: spreadsheetIdKnown ? 'PRESENT_IN_SANITIZED_PACKET' : 'UNKNOWN',
      tabs: tabsKnown ? `REFERENCED_IN_SANITIZED_PACKET: ${safePacketCell(cells[2], 120)}` : 'UNKNOWN',
      currentRole: roleKnown ? `SANITIZED_PACKET_ROLE: ${safePacketCell(cells[3], 120)}` : 'UNKNOWN',
      evidenceStatus: evidenceKnown ? 'PARTIAL_SANITIZED_EVIDENCE' : 'UNKNOWN',
      disposition: number === 1
        ? 'ARCHIVE_RETIRE_ONLY (SANITIZED_PACKET)'
        : dispositionKnown
          ? `SANITIZED_PACKET_DISPOSITION: ${safePacketCell(cells[5], 140)}`
          : 'UNKNOWN',
      stillUnknown: isKnownPacketCell(cells[6]) ? safePacketCell(cells[6], 160) : 'UNKNOWN'
    });
  }
  return promotion;
}

function isUsableEvidence(source) {
  if (source.type === 'REDACTED_COPY') return true;
  if (source.type !== 'SANITIZED_SUMMARY') return false;
  if (source.text.includes('Generated by: npm run evidence:draft-summaries')) return true;
  if (/Verified by evidence:\s*(?!UNKNOWN\b)[A-Z_]+/i.test(source.text)) return true;
  return !/Verified dependency exists\s*\|\s*UNKNOWN/i.test(source.text)
    || !/## Migration Notes\s+- UNKNOWN/i.test(source.text);
}

function matches(sources, pattern) {
  return sources.filter((source) => pattern.test(source.text));
}

function confidence(items) {
  if (!items.length) return 'UNKNOWN';
  return items.length >= 2 && new Set(items.map((item) => item.type)).size >= 2 ? 'MEDIUM' : 'LOW';
}

function hasAppsScript(text) {
  return /\bapps?\s+script\b|\bdoGet\b|\bdoPost\b|\bmode\s*=|\btrigger\b/i.test(text);
}

function inferWorkflow(value) {
  const normalized = String(value).replace(/[_/-]+/g, ' ');
  return WORKFLOWS.find((workflow) => workflow.pattern.test(normalized))?.name || 'UNKNOWN';
}

function workflowRows(sources) {
  return WORKFLOWS.map((workflow) => {
    const related = matches(sources, workflow.pattern);
    const appsRelated = related.filter((source) => hasAppsScript(source.text));
    const signal = appsRelated.length ? `Sanitized evidence contains ${appsRelated.length} Apps Script-associated source signal(s).` : 'UNKNOWN';
    const linkedSheet = workflow.sheet !== 'UNKNOWN' && related.some((source) => source.text.includes(workflow.sheet)) ? workflow.sheet : 'UNKNOWN';
    return {
      ...workflow, signal, linkedSheet, confidence: confidence(appsRelated),
      blocker: signal === 'UNKNOWN' || linkedSheet === 'UNKNOWN' ? 'YES - dependency incomplete' : 'REVIEW_REQUIRED',
      unknown: 'Active handler, linked Sheet, owner, production usage, and rollback path'
    };
  });
}

function sheetRows(sources, promotion) {
  return SHEETS.map((sheet) => {
    const related = matches(sources, sheet.pattern);
    const combined = related.map((source) => source.text).join(' ');
    const appsRelated = related.filter((source) => hasAppsScript(source.text));
    const promoted = promotion.rows.get(sheet.number);
    const fallbackIdStatus = /spreadsheet\s+id.{0,40}(?:verified|confirmed|redacted|present)/i.test(combined)
      ? 'PRESENT_IN_SANITIZED_SUMMARY'
      : 'UNKNOWN';
    return {
      ...sheet,
      displaySource: promoted?.currentSource || sheet.label,
      idStatus: promoted?.idStatus || fallbackIdStatus,
      tabs: promoted?.tabs || (/\b(?:known\s+)?tabs?\b.{0,80}(?:verified|confirmed|redacted|present)/i.test(combined) ? 'REFERENCED_IN_SANITIZED_SUMMARY' : 'UNKNOWN'),
      currentRole: promoted?.currentRole || (related.length ? `${sheet.role} signal in sanitized summary` : 'UNKNOWN'),
      evidenceStatus: promoted?.evidenceStatus || 'UNKNOWN',
      disposition: promoted?.disposition || (sheet.number === 1 ? 'ARCHIVE_RETIRE_ONLY' : 'UNKNOWN'),
      packetStillUnknown: promoted?.stillUnknown || 'UNKNOWN',
      appsSignal: appsRelated.length ? `${appsRelated.length} Apps Script-associated source signal(s)` : 'UNKNOWN',
      blocker: !appsRelated.length ? 'YES - Apps Script behavior remains UNKNOWN' : 'REVIEW_REQUIRED',
      confidence: promoted ? 'MEDIUM' : confidence(related)
    };
  });
}

function safeIdentifier(value) {
  const candidate = String(value || '').trim();
  return /^[A-Za-z][A-Za-z0-9_-]{1,63}$/.test(candidate)
    && !SENSITIVE_CANDIDATE.test(candidate)
    && !/\d{12,}/.test(candidate) ? candidate : null;
}

function modeRows(sources) {
  const found = new Map();
  for (const source of sources) {
    for (const handler of ['doGet', 'doPost']) {
      if (new RegExp(`\\b${handler}\\b`).test(source.text)) found.set(handler, [handler, 'HANDLER', 'Public web app request dispatch']);
    }
    for (const match of source.text.matchAll(/\bmode\s*=\s*["']?([A-Za-z][A-Za-z0-9_-]{1,63})/gi)) {
      const value = safeIdentifier(match[1]);
      if (value) found.set(`mode:${value.toLowerCase()}`, [value, 'MODE', inferWorkflow(value)]);
    }
    for (const match of source.text.matchAll(/\b(?:handler|function)\s*(?:name)?\s*[:=]\s*["']?([A-Za-z][A-Za-z0-9_-]{1,63})/gi)) {
      const value = safeIdentifier(match[1]);
      if (value) found.set(`function:${value.toLowerCase()}`, [value, 'FUNCTION_CANDIDATE', inferWorkflow(value)]);
    }
  }
  return [...found.values()].slice(0, 40);
}

function triggerRows(sources) {
  return [
    ['onFormSubmit', 'Form submission event', 'REBUILD_IN_CLOUD_RUN'],
    ['onEdit', 'Spreadsheet edit event', 'REBUILD_IN_CLOUD_RUN'],
    ['onOpen', 'Spreadsheet open event', 'REBUILD_IN_CLOUD_RUN'],
    ['time-driven', 'Scheduled time-driven event', 'REPLACE_WITH_CLOUD_SCHEDULER_JOB'],
    ['clock trigger', 'Scheduled clock event', 'REPLACE_WITH_CLOUD_SCHEDULER_JOB']
  ].flatMap(([candidate, eventSource, disposition]) => {
    const related = sources.filter((source) => new RegExp(`\\b${candidate.replace(/[- ]/g, '[- ]')}\\b`, 'i').test(source.text));
    return related.length ? [[candidate, eventSource, inferWorkflow(related.map((item) => item.text).join(' ')), confidence(related), disposition]] : [];
  });
}

function normalizeRoute(value) {
  const route = value.split(/[?#,]/)[0].replace(/[.;:]+$/, '').replace(/\/{2,}/g, '/').replace(/\/$/, '') || '/';
  if (route.length > 120 || route.startsWith('/content/v1/') || STATIC_ASSET.test(route) || SENSITIVE_CANDIDATE.test(route) || route.includes('[REDACTED')) return null;
  const words = route.split('/').filter(Boolean).flatMap((segment) => segment.toLowerCase().split('-'));
  return PUBLIC_ROUTE_SIGNAL.test(route) && words.every((word) => SAFE_ROUTE_WORDS.has(word)) ? route : null;
}

function replacementForRoute(route) {
  if (/qr|redirect/i.test(route)) return 'Redirect service';
  if (/conference|showcase/i.test(route)) return 'Conference service';
  if (/media|display/i.test(route)) return 'Screen/display provider adapter';
  if (/provider|advertiser|vendor|admin/i.test(route)) return 'Dashboard flow';
  return 'API route';
}

function routeRows(sources) {
  const routes = new Map();
  const eligible = sources.filter((source) => /(?:active-routes|apps-script|squarespace-forms|analytics-search-console)/i.test(source.filePath));
  for (const source of eligible) {
    for (const raw of source.text.match(ROUTE_PATTERN) || []) {
      const route = normalizeRoute(raw);
      if (!route) continue;
      const prior = routes.get(route) || { route, types: new Set(), appsScript: false };
      prior.types.add(source.type);
      prior.appsScript ||= hasAppsScript(source.text);
      routes.set(route, prior);
    }
  }
  return [...routes.values()].sort((a, b) => a.route.localeCompare(b.route)).slice(0, 60);
}

function knownStatus(sources, label, accepted) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return sources.some((source) => new RegExp(`${escaped}.{0,100}${accepted}`, 'i').test(source.text));
}

function assessGate(allSources, workflows, sheets, modes, routes) {
  const blockers = [];
  if (workflows.some((workflow) => workflow.signal === 'UNKNOWN' || workflow.linkedSheet === 'UNKNOWN')) blockers.push('Dataset, form, route, billing, display, or review workflow dependencies remain UNKNOWN.');
  if (!knownStatus(allSources, 'Live mode usage', '(?:VERIFIED|CONFIRMED|NONE)')) blockers.push('Live mode usage remains UNKNOWN.');
  if (sheets.some((sheet) => sheet.number !== 1 && sheet.idStatus === 'UNKNOWN')) blockers.push('Linked Sheet IDs remain UNKNOWN for active workflow candidates.');
  if (!modes.length || !knownStatus(allSources, 'Active Apps Script handlers', '(?:VERIFIED|CONFIRMED|MAPPED)')) blockers.push('Active Apps Script handlers remain UNKNOWN.');
  if (!knownStatus(allSources, 'Workflow-to-handler mapping', '(?:VERIFIED|CONFIRMED|MAPPED)')) blockers.push('Workflow-to-handler mapping remains UNKNOWN.');
  if (!knownStatus(allSources, 'Workflow-to-Sheet read/write behavior', '(?:VERIFIED|CONFIRMED|MAPPED)')) blockers.push('Workflow-to-Sheet read/write behavior remains UNKNOWN.');
  if (!routes.length || !knownStatus(allSources, 'Production caller map', '(?:VERIFIED|CONFIRMED|MAPPED)')) blockers.push('Production caller map remains UNKNOWN.');
  if (!knownStatus(allSources, 'Cutover owner', '(?:VERIFIED|CONFIRMED|ASSIGNED)')) blockers.push('Cutover owner remains UNKNOWN.');
  if (!knownStatus(allSources, 'Rollback path', '(?:VERIFIED|CONFIRMED|DOCUMENTED|YES)')) blockers.push('Rollback path remains UNKNOWN.');
  if (blockers.length) return ['PHASE_3_BLOCKED', blockers];
  if (workflows.some((workflow) => workflow.signal === 'UNKNOWN')) return ['PHASE_3_CAN_PROCEED_WITH_EXCLUSIONS', ['Unmapped workflows must be explicitly excluded.']];
  return ['PHASE_3_READY_FOR_LIMITED_DRY_RUN', ['Production writes, cutover, and unresolved dependencies remain excluded.']];
}

function tableRows(items, formatter, columns) {
  return items.length ? items.map(formatter).join('\n') : `| ${Array(columns).fill('UNKNOWN').join(' | ')} |`;
}

function buildReport(allSources) {
  const sources = allSources.filter(isUsableEvidence);
  const promotion = loadSanitizedSheetPromotion();
  const workflows = workflowRows(sources);
  const sheets = sheetRows(sources, promotion);
  const modes = modeRows(sources);
  const triggers = triggerRows(sources);
  const routes = routeRows(sources);
  const [gate, blockers] = assessGate(allSources, workflows, sheets, modes, routes);
  const sourceTypes = [...new Set(allSources.map((source) => source.type))].sort();
  const signaled = workflows.filter((workflow) => workflow.signal !== 'UNKNOWN');
  const confidenceLevel = !sources.length || !signaled.length ? 'LOW' : new Set(sources.map((source) => source.type)).size >= 2 ? 'MEDIUM' : 'LOW';
  const relativeHome = path.relative(os.homedir(), options.root);
  const displayedRoot = relativeHome && !relativeHome.startsWith('..') ? path.join('~', relativeHome) : options.root;
  const workflowTable = workflows.map((item) => `| ${escapeMarkdown(item.name)} | ${escapeMarkdown(item.signal)} | ${escapeMarkdown(item.linkedSheet)} | ${escapeMarkdown(item.role)} | ${escapeMarkdown(item.target)} | ${item.disposition} | ${escapeMarkdown(item.blocker)} | ${item.confidence} | ${escapeMarkdown(item.unknown)} | Co-occurrence is a review signal, not proof. |`).join('\n');
  const sheetTable = sheets.map((item) => `| ${escapeMarkdown(item.displaySource)} | ${item.idStatus} | ${escapeMarkdown(item.tabs)} | ${escapeMarkdown(item.currentRole)} | ${item.evidenceStatus} | ${escapeMarkdown(item.appsSignal)} | ${escapeMarkdown(item.disposition)} | ${escapeMarkdown(item.logical)} | ${escapeMarkdown(item.blocker)} | ${item.confidence} | ${escapeMarkdown(item.packetStillUnknown)}; active handler, live caller, owner, runtime usage, rollback, and cutover owner remain UNKNOWN. |`).join('\n');
  const modeTable = tableRows(modes, ([candidate, type, workflow]) => `| ${escapeMarkdown(candidate)} | ${type} | ${escapeMarkdown(workflow)} | UNKNOWN | LOW | ${type === 'FUNCTION_CANDIDATE' ? 'UNKNOWN' : 'REBUILD_IN_CLOUD_RUN'} | Live usage, handler, linked Sheet, owner, and rollback remain UNKNOWN. |`, 7);
  const triggerTable = tableRows(triggers, ([candidate, event, workflow, itemConfidence, disposition]) => `| ${escapeMarkdown(candidate)} | ${escapeMarkdown(event)} | ${escapeMarkdown(workflow)} | ${itemConfidence} | ${disposition} | Active schedule, function, owner, and linked Sheet remain UNKNOWN. |`, 6);
  const routeTable = tableRows(routes, (item) => `| ${escapeMarkdown(item.route)} | ${item.appsScript ? 'POSSIBLE - sanitized source also contains Apps Script signals' : 'UNKNOWN'} | ${escapeMarkdown(inferWorkflow(item.route))} | ${escapeMarkdown(replacementForRoute(item.route))} | ${/campaign|qr|conference|billing|submit|form|intake|signup/i.test(item.route) ? 'HIGH' : 'MEDIUM'} | ${item.types.size >= 2 ? 'MEDIUM' : 'LOW'} | Live caller, handler, traffic, owner, and rollback remain UNKNOWN. |`, 7);

  return [gate, `# Apps Script Dependency Auto-Review Report

## Evidence Boundary

- Generated by: npm run evidence:review-apps-script-dependencies
- Generated at: ${new Date().toISOString()}
- Evidence root: ${escapeMarkdown(displayedRoot)}
- Source types used: ${sourceTypes.length ? sourceTypes.join(', ') : 'UNKNOWN'}
- Safe source files reviewed: ${allSources.length}
- Raw private evidence committed to Git: NO
- Production impact: NONE
- Phase 3 started: NO
- Manual review complete: UNKNOWN
- Report confidence: ${confidenceLevel}
- Gate result: ${gate}

This report uses local sanitized evidence only and does not query or verify a live system. Source-level associations are review signals, not proof of production behavior.

## Executive Summary

- What was safely identified: ${signaled.length ? `${signaled.length} workflow area(s) have sanitized Apps Script-associated signals.` : 'No workflow dependency was safely identified.'}
- What remains UNKNOWN: production usage, active Sheets, owners, cutover readiness, rollback, and every unsupported conclusion.
- Phase 3 is currently: ${gate}.
- Phase 3 may proceed only with exclusions: ${gate === 'PHASE_3_CAN_PROCEED_WITH_EXCLUSIONS' ? 'MAYBE after Drip/ChatGPT approval.' : 'NO under the current gate.'}
- Workflows appearing most dependent on Apps Script: ${signaled.slice(0, 6).map((item) => escapeMarkdown(item.name)).join(', ') || 'UNKNOWN'}.

## Sanitized Sheet Evidence Promotion

- Google Sheets review packet found: ${promotion.found ? 'YES' : 'NO'}
- Current Sheet evidence rows parsed: ${promotion.rows.size}
- Fields promoted into the Current Sheet Dependency Map: ${promotion.fieldsPromoted.size ? [...promotion.fieldsPromoted].join(', ') : 'NONE'}
- Evidence label: SANITIZED_PACKET_EVIDENCE_ONLY
- Live production proof: NO

Promoted values describe current sanitized review evidence only. They do not prove Apps Script handlers, live callers, production runtime behavior, owners, read/write behavior, rollback, cutover readiness, or migration approval.

## Apps Script Dependency Inventory

| Dependency/workflow | Evidence-backed current Apps Script signal | Linked current Sheet, if safely known | Current role | Future replacement target | Migration disposition | Phase 3 blocker | Confidence | Still UNKNOWN | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${workflowTable}
| Other discovered Apps Script modes/triggers/routes | ${modes.length} mode/handler, ${triggers.length} trigger, and ${routes.length} route candidate(s) | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | YES - manual classification required | ${modes.length + triggers.length + routes.length ? 'LOW' : 'UNKNOWN'} | Production usage, owner, linked Sheet, replacement, and rollback | Candidate tables below are sanitized review aids only. |

## Current Sheet Dependency Map

| Current Sheet | Safely known spreadsheet ID status | Safely known tabs | Current role from sanitized evidence | Current evidence status | Apps Script dependency signal | Sanitized packet disposition | Future logical area | Phase 3 blocker | Confidence | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
${sheetTable}

Current Sheet evidence is current sanitized evidence only. The future logical area is a separate planning model. Old Sheet 1 remains archive/retire only, Google Sheets remain temporary bridges, current Sheet numbers do not define the future architecture, and no Sheet is renamed or modified.

## Apps Script Mode / Handler Candidates

| Candidate | Type | Possible workflow | Possible linked Sheet/route | Evidence confidence | Migration disposition | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- |
${modeTable}

No raw code snippets, deployment URLs, or private IDs are copied. If no candidate is safe, the table remains UNKNOWN.

## Trigger Candidates

| Candidate | Possible schedule/event source | Possible workflow | Evidence confidence | Migration disposition | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- |
${triggerTable}

## Public Caller / Route Candidates

| Route/caller candidate | Possible Apps Script dependency | Possible workflow | Future replacement target | Cutover risk | Confidence | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- |
${routeTable}

Static assets, query strings, high-entropy values, unknown route words, and sensitive candidates are excluded.

## Phase 3 Gate Assessment

- Gate result: ${gate}
- Production impact: NONE
- Phase 3 started: NO
- Live migration authorized: NO
- Production writes authorized: NO

${blockers.map((blocker) => `- ${escapeMarkdown(blocker)}`).join('\n')}

PHASE_3_BLOCKED means unresolved dependencies still affect potential migration decisions. Other gate results still require explicit Drip/ChatGPT approval, dry-run-only scope, and exclusions for every unresolved workflow.

## Recommended Next Actions

1. Export a sanitized Apps Script mode map, trigger list, and linked Sheet status map.
2. Review active public callers and classify one workflow at a time.
3. Assign a cutover owner and document a sanitized rollback path.
4. Keep Phase 3 blocked unless Drip/ChatGPT approves a limited dry run with explicit exclusions.

## Do Not Do

- Do not deploy.
- Do not edit Apps Script or change triggers.
- Do not write to live Sheets.
- Do not start Phase 3 unless Drip/ChatGPT approves.
- Do not commit private evidence or this generated private report.
- Do not treat template presence as production proof.
`];
}

try {
  assertPrivateRootOutsideRepo(options.root);
  ensurePrivateEvidenceFolders(options.root);
  const sources = loadSources();
  const [gate, report] = buildReport(sources);
  const reportPath = path.join(options.root, APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH);
  const temporaryPath = `${reportPath}.tmp`;
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(temporaryPath, report, { encoding: 'utf8', mode: 0o600 });
  fs.renameSync(temporaryPath, reportPath);
  console.log(`Apps Script dependency auto-review report written: ${reportPath}`);
  console.log(`Safe source files reviewed: ${sources.length}`);
  console.log(`Gate result: ${gate}`);
  console.log('Production impact: NONE');
  console.log('Phase 3 started: NO');
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
