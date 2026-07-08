#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import {
  TEXT_SNIFF_EXTENSIONS,
  isIgnoredEvidenceName,
  parseArgs
} from './private-evidence-kit-common.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const originalGeneratorPath = path.join(__dirname, 'generate-sanitized-migration-review-packets.js');
const originalResult = spawnSync(process.execPath, [originalGeneratorPath, ...process.argv.slice(2)], {
  stdio: 'inherit'
});

if (originalResult.error) {
  console.error(`Error: ${originalResult.error.message}`);
  process.exit(1);
}

if (originalResult.status !== 0 || parseArgs().help) {
  process.exit(originalResult.status || 0);
}

const options = parseArgs();
const ACTIVE_ROUTES_PACKET = path.join(options.root, 'review-packets', 'active-routes-review-packet.md');
const ROUTE_TABLE_HEADING = '## Retain / Rebuild / Redirect / Retire / Unknown Table';
const PRODUCTION_DEPENDENCIES_HEADING = '## Production Dependencies';
const STATIC_ASSET_EXTENSIONS = new Set([
  '.avif',
  '.css',
  '.gif',
  '.ico',
  '.jpeg',
  '.jpg',
  '.js',
  '.json',
  '.map',
  '.pdf',
  '.png',
  '.svg',
  '.ttf',
  '.webmanifest',
  '.webp',
  '.woff',
  '.woff2',
  '.zip'
]);
const EXPLICIT_REBUILD_ROUTES = new Set([
  '/ad-campaigns',
  '/conference-campaign-preview',
  '/conference-campaign-submit',
  '/conference-showcase',
  '/conferences'
]);
const PREVIEW_LIMIT = 160 * 1024;
const SAFE_ROUTE_SOURCE_PATHS = [
  path.join(options.root, 'sanitized-summaries', 'active-routes-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'squarespace-redirects-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'google-analytics-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'google-search-console-summary.md'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'active-routes'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'squarespace'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'analytics-search-console')
];
const GOOGLE_SHEETS_PACKET = path.join(options.root, 'review-packets', 'google-sheets-destinations-review-packet.md');
const APPS_SCRIPT_PACKET = path.join(options.root, 'review-packets', 'apps-script-review-packet.md');
const SHEETS_AUDIT_PATH = path.join(options.root, 'sheets', 'google-sheets-evidence-from-audit.md');
const APPS_SCRIPT_SOURCE_PATHS = [
  path.join(options.root, 'sanitized-summaries', 'apps-script-deployments-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'apps-script-modes-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'google-sheets-destinations-summary.md'),
  path.join(options.root, 'sanitized-summaries', 'active-routes-summary.md'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'apps-script'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'sheets'),
  path.join(options.root, 'redaction-reports', 'redacted-copies', 'active-routes')
];
const FUTURE_LOGICAL_SHEET_MODEL = [
  {
    label: 'Legacy Archive: Old Sheet 1 Campaigns',
    purpose: 'Historical campaign, click, billing, and redirect reference.',
    disposition: 'RETIRE_ARCHIVE_ONLY',
    targets: 'Optional historical BigQuery import; not an active future campaign model.',
    phase3: 'OPTIONAL - only if approved for historical import.',
    notes: 'Do not rebuild old Sheet 1 campaigns as active Firestore campaign operations.'
  },
  {
    label: 'Sheet 1: Provider Intake',
    purpose: 'Provider organization signup, facility onboarding, provider user creation, affiliate/referral link generation, and welcome workflow.',
    disposition: 'FUTURE_LOGICAL_MODEL',
    targets: 'organizations, providerOrganizations, providerFacilities, users, organizationMemberships, providerUserAffiliateLinks',
    phase3: 'MAYBE - if provider intake feeds dataset or operations migration.',
    notes: 'Logical future model only; do not physically rename live Sheets in this phase.'
  },
  {
    label: 'Sheet 2: Advertiser Intake',
    purpose: 'Vendor/employer signup, advertiser organization profile, billing bridge, promo/invoice bridge during migration.',
    disposition: 'FUTURE_LOGICAL_MODEL',
    targets: 'organizations, advertiserOrganizations, advertiserProfiles, billingAccounts, billingEvents, invoiceEvents, promoCodes',
    phase3: 'MAYBE - if advertiser intake feeds dataset or billing migration.',
    notes: 'Logical future model only; do not physically rename live Sheets in this phase.'
  },
  {
    label: 'Sheet 3: Provider Display Preferences',
    purpose: 'Provider users set display preferences for vendors/employers; applies only to Patient Campaign display eligibility.',
    disposition: 'FUTURE_LOGICAL_MODEL',
    targets: 'providerDisplayPreferences, providerUserPreferenceSignals, displayPreferenceChangeEvents',
    phase3: 'YES - if patient campaign display eligibility depends on current preference data.',
    notes: 'Use display preference wording. Avoid provider approval or endorsement wording.'
  },
  {
    label: 'Sheet 4: Provider Campaigns',
    purpose: 'Campaigns shown only to provider organization users inside the Provider Media Center.',
    disposition: 'FUTURE_LOGICAL_MODEL',
    targets: 'campaigns, campaignCreatives, campaignAudienceTargets, campaignEvents, billingEvents',
    phase3: 'MAYBE - if provider campaign history or targeting data is imported.',
    notes: 'Provider Campaigns are not shown to patients and are not displayed on provider screens.'
  },
  {
    label: 'Sheet 5: Conference Campaigns',
    purpose: 'Conference inventory, sponsorship reservations, holds, waitlists, purchase log, funding status, refund review, and showcase pages.',
    disposition: 'FUTURE_LOGICAL_MODEL',
    targets: 'conferenceEvents, conferenceSponsorshipInventory, conferenceReservations, conferenceWaitlistEntries, conferencePurchaseEvents, campaigns, billingEvents',
    phase3: 'MAYBE - if conference inventory or purchase records become dataset inputs.',
    notes: 'Conference Campaigns are separate from Patient Campaigns and Provider Campaigns.'
  },
  {
    label: 'Sheet 6: Patient Campaigns',
    purpose: 'Campaigns shown only to patients on provider screens using QR, video, or QR plus video.',
    disposition: 'FUTURE_LOGICAL_MODEL',
    targets: 'campaigns, campaignCreatives, campaignPlacements, campaignPlacementEligibility, patientScreenQrScanEvents, patientScreenPlaybackEvents, billingEvents, providerRevenueShareEvents',
    phase3: 'YES - if patient campaign data feeds display eligibility, billing, or revenue share.',
    notes: 'Requires provider display preference eligibility, Drip safety review, dates, assets, billing, active screens, and no compliance block.'
  }
];

function isTextFile(filePath) {
  return TEXT_SNIFF_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function walkFiles(inputPath, files = []) {
  if (!fs.existsSync(inputPath)) {
    return files;
  }

  const stat = fs.statSync(inputPath);
  if (stat.isFile()) {
    if (isTextFile(inputPath) && !isIgnoredEvidenceName(path.basename(inputPath))) {
      files.push(inputPath);
    }
    return files;
  }

  if (!stat.isDirectory()) {
    return files;
  }

  for (const entry of fs.readdirSync(inputPath, { withFileTypes: true })) {
    if (isIgnoredEvidenceName(entry.name)) {
      continue;
    }
    const fullPath = path.join(inputPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function readPreview(filePath) {
  const fileHandle = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(PREVIEW_LIMIT);
    const bytesRead = fs.readSync(fileHandle, buffer, 0, PREVIEW_LIMIT, 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally {
    fs.closeSync(fileHandle);
  }
}

function normalizeRouteCandidate(candidate) {
  let route = String(candidate || '')
    .trim()
    .replace(/^[("'`]+/, '')
    .replace(/[)"'`]+$/, '')
    .split(/[?#]/)[0]
    .replace(/[.;:)]+$/, '');

  if (!route.startsWith('/')) {
    return '';
  }

  const parts = route.split(',');
  if (parts.length > 1 && parts.slice(1).every((part) => /^-?\d+(?:\.\d+)?%?$/.test(part.trim()))) {
    route = parts[0];
  }

  route = route.replace(/\/+$/, '') || '/';
  return route.includes('[REDACTED') ? '' : route;
}

function isStaticAssetRoute(route) {
  const lower = route.toLowerCase();
  if (lower.startsWith('/content/v1/')) {
    return true;
  }
  if (/\/(?:assets?|static|images?|files?|downloads?)\//.test(lower)) {
    return true;
  }
  return STATIC_ASSET_EXTENSIONS.has(path.extname(lower));
}

function shouldKeepRouteCandidate(route) {
  return route
    && route !== 'UNKNOWN'
    && !route.startsWith('/Users')
    && !route.startsWith('/Documents')
    && !route.startsWith('/private')
    && !route.includes('/private-evidence/')
    && !route.toLowerCase().endsWith('.md');
}

function addRouteCandidate(candidate, routes, assets) {
  const route = normalizeRouteCandidate(candidate);
  if (!shouldKeepRouteCandidate(route)) {
    return;
  }
  if (isStaticAssetRoute(route)) {
    assets.add(route);
  } else {
    routes.add(route);
  }
}

function mergeInventory(target, source) {
  for (const route of source.routes) {
    target.routes.add(route);
  }
  for (const asset of source.assets) {
    target.assets.add(asset);
  }
}

function classifyRoute(route) {
  const lower = route.toLowerCase();
  if (route === '/' || lower === '/home') {
    return 'RETAIN';
  }
  if (lower.includes('old') || lower.includes('legacy')) {
    return 'REDIRECT';
  }
  if (EXPLICIT_REBUILD_ROUTES.has(lower)) {
    return 'REBUILD';
  }
  if (lower === '/cart') {
    return 'RETIRE_CANDIDATE';
  }
  if (lower === '/contact') {
    return 'REBUILD';
  }
  if (/(provider|vendor|advertiser|campaign|qr|showcase|conference|media|upload|form|intake)/.test(lower)) {
    return 'REBUILD';
  }
  return 'UNKNOWN';
}

function extractRoutesFromText(text) {
  const routes = new Set();
  const assets = new Set();
  const urlRegex = /https?:\/\/[A-Za-z0-9.-]+(:\d+)?(\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]*)/g;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    addRouteCandidate(urlMatch[2] || '/', routes, assets);
  }

  const pathRegex = /(^|[\s("'`])\/[A-Za-z0-9][A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]{0,120}/g;
  let pathMatch;
  while ((pathMatch = pathRegex.exec(text)) !== null) {
    addRouteCandidate(pathMatch[0], routes, assets);
  }

  const csvRouteRegex = /(^|[\s("'`|])\/[A-Za-z0-9][A-Za-z0-9._~:/?#\[\]@!$&'()*+;=%-]{0,120},(?:-?\d+(?:\.\d+)?%?)(?:,-?\d+(?:\.\d+)?%?)*/g;
  let csvRouteMatch;
  while ((csvRouteMatch = csvRouteRegex.exec(text)) !== null) {
    addRouteCandidate(csvRouteMatch[0], routes, assets);
  }

  const csvRootRegex = /(^|[\s("'`|])\/,(?:-?\d+(?:\.\d+)?%?)(?:,-?\d+(?:\.\d+)?%?)*/g;
  let csvRootMatch;
  while ((csvRootMatch = csvRootRegex.exec(text)) !== null) {
    addRouteCandidate(csvRootMatch[0], routes, assets);
  }

  const bareRootRegex = /(^|\n)\s*\/\s*($|\n)/g;
  if (bareRootRegex.test(text)) {
    addRouteCandidate('/', routes, assets);
  }

  return { routes, assets };
}

function collectSafeRouteSources() {
  const inventory = { routes: new Set(), assets: new Set() };
  const sourceFiles = SAFE_ROUTE_SOURCE_PATHS.flatMap((sourcePath) => walkFiles(sourcePath));
  for (const sourceFile of sourceFiles) {
    mergeInventory(inventory, extractRoutesFromText(readPreview(sourceFile)));
  }
  return inventory;
}

function routeRationale(classification) {
  if (classification === 'RETAIN') {
    return 'Core public route should be retained unless manual review says otherwise.';
  }
  if (classification === 'REBUILD') {
    return 'Route appears tied to public site, campaign, conference, provider, advertiser, media, upload, form, or intake workflows that should move into the Drip stack.';
  }
  if (classification === 'REDIRECT') {
    return 'Legacy or old path should be mapped to a verified replacement before cutover.';
  }
  if (classification === 'RETIRE_CANDIDATE') {
    return 'Cart route needs commerce review before retain, rebuild, redirect, or retire decision.';
  }
  return 'Route candidate found, but migration intent is not verified.';
}

function scrubSensitiveValue(value) {
  return String(value || '')
    .replace(/-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]+?-----END [A-Z ]*PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g, '[REDACTED_STRIPE_KEY]')
    .replace(new RegExp('\\bwh' + 'sec_[A-Za-z0-9]{16,}\\b', 'g'), '[REDACTED_WEBHOOK_SECRET]')
    .replace(/\bAIza[0-9A-Za-z_-]{35}\b/g, '[REDACTED_GOOGLE_API_KEY]')
    .replace(/https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\b/g, '[REDACTED_APPS_SCRIPT_URL]')
    .replace(/\bAKfy[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_APPS_SCRIPT_TOKEN]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, 'Bearer [REDACTED_TOKEN]')
    .replace(/\bya29\.[0-9A-Za-z_-]+\b/g, '[REDACTED_OAUTH_TOKEN]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function escapeMarkdown(value) {
  return (scrubSensitiveValue(value) || 'UNKNOWN').replace(/\|/g, '\\|');
}

function firstMatch(text, regexes) {
  for (const regex of regexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      return scrubSensitiveValue(match[1]).slice(0, 120) || 'UNKNOWN';
    }
  }
  return 'UNKNOWN';
}

function linesForSheet(text, number) {
  const lines = text.split(/\r?\n/);
  const start = lines.findIndex((line) => new RegExp(`\\bSheet\\s*${number}\\b`, 'i').test(line));
  if (start === -1) {
    return '';
  }
  const end = lines.findIndex((line, index) => index > start && /\bSheet\s*\d+\b/i.test(line));
  return lines.slice(start, end === -1 ? lines.length : end).join('\n');
}

function inferSheetRole(block) {
  const lower = block.toLowerCase();
  if (lower.includes('form')) {
    return 'Form/intake destination';
  }
  if (lower.includes('campaign') || lower.includes('qr')) {
    return 'Campaign or route operations';
  }
  if (lower.includes('upload')) {
    return 'Upload workflow dependency';
  }
  if (lower.includes('billing') || lower.includes('stripe') || lower.includes('payment')) {
    return 'Billing review dependency';
  }
  if (lower.includes('provider') || lower.includes('media')) {
    return 'Provider/media workflow dependency';
  }
  return block ? 'Legacy operational data source' : 'UNKNOWN';
}

function extractSheetEvidence(sheetsText, number) {
  const block = linesForSheet(sheetsText, number);
  if (!block) {
    return {
      source: `Current Sheet ${number}`,
      spreadsheetId: 'UNKNOWN',
      tabs: 'UNKNOWN',
      currentRole: 'UNKNOWN',
      evidenceStatus: 'UNKNOWN',
      stillUnknown: 'Sheet ID, tabs, owner, role, live dependency status'
    };
  }

  const name = firstMatch(block, [
    new RegExp(`Sheet\\s*${number}\\s*[:|-]\\s*([^\\n|]+)`, 'i'),
    /\bSheet name\s*[:|-]\s*([^\n|]+)/i,
    /\bName\s*[:|-]\s*([^\n|]+)/i
  ]);
  const spreadsheetId = firstMatch(block, [
    /\/spreadsheets\/d\/([A-Za-z0-9_-]{12,})/i,
    /\bSpreadsheet ID\s*[:|-]\s*([A-Za-z0-9_-]{12,})/i,
    /\bSheet ID\s*[:|-]\s*([A-Za-z0-9_-]{12,})/i
  ]);
  const tabs = firstMatch(block, [
    /\bTabs?\s*[:|-]\s*([^\n]+)/i,
    /\bWorksheets?\s*[:|-]\s*([^\n]+)/i
  ]);

  return {
    source: name === 'UNKNOWN' ? `Current Sheet ${number}` : `Current Sheet ${number}: ${name}`,
    spreadsheetId,
    tabs,
    currentRole: inferSheetRole(block),
    evidenceStatus: 'PARTIAL',
    stillUnknown: 'Owner, active tabs, live form destinations, Apps Script dependencies, cutover disposition'
  };
}

function currentSheetEvidenceRows(sheetsText) {
  const rows = [];
  for (let number = 1; number <= 7; number += 1) {
    const evidence = extractSheetEvidence(sheetsText, number);
    const disposition = number === 1
      ? 'Legacy/archive review only; not a future active campaign model.'
      : 'Current evidence only; future logical model is listed separately.';
    rows.push(`| ${escapeMarkdown(evidence.source)} | ${escapeMarkdown(evidence.spreadsheetId)} | ${escapeMarkdown(evidence.tabs)} | ${escapeMarkdown(evidence.currentRole)} | ${evidence.evidenceStatus} | ${escapeMarkdown(disposition)} | ${escapeMarkdown(evidence.stillUnknown)} |`);
  }
  return rows.join('\n');
}

function futureLogicalSheetRows() {
  return FUTURE_LOGICAL_SHEET_MODEL
    .map((item) => `| ${escapeMarkdown(item.label)} | ${escapeMarkdown(item.purpose)} | ${escapeMarkdown(item.disposition)} | ${escapeMarkdown(item.targets)} | ${escapeMarkdown(item.phase3)} | ${escapeMarkdown(item.notes)} |`)
    .join('\n');
}

function replacePacketBodySection(packet, startHeading, endHeading, replacement) {
  const start = packet.indexOf(startHeading);
  const end = packet.indexOf(endHeading, start);
  if (start === -1 || end === -1) {
    throw new Error(`Packet is missing expected section markers: ${startHeading}`);
  }
  return `${packet.slice(0, start)}${replacement}${packet.slice(end)}`;
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

function cleanGoogleSheetsPacket(packetPath) {
  if (!fs.existsSync(packetPath)) {
    throw new Error(`Google Sheets review packet was not generated: ${packetPath}`);
  }

  const sheetsText = fs.existsSync(SHEETS_AUDIT_PATH) ? readPreview(SHEETS_AUDIT_PATH) : '';
  const packet = fs.readFileSync(packetPath, 'utf8');
  const replacement = `## Actionable Migration Questions\n\n- Which Sheets are still active form, Apps Script, campaign, media, billing, or market-intelligence dependencies?\n- Which current Sheet IDs, tabs, owners, and destinations are verified by sanitized evidence?\n- Which future logical Sheet areas map to app/API intake, Firestore collections, BigQuery tables, or event streams?\n- Which Sheets block Phase 3 because they are current dataset or automation sources?\n- Which Sheets can be retired after replacement intake flows are approved?\n\n## Current Evidence Table\n\nThis table describes current sanitized evidence only. It must not be read as the future data model. If a current Sheet ID, tab list, or role cannot be safely extracted from sanitized evidence, it remains UNKNOWN.\n\n| Current source | Safely extracted spreadsheet ID | Safely extracted tabs | Current role from evidence | Evidence status | Next-generation disposition | Still UNKNOWN |\n| --- | --- | --- | --- | --- | --- | --- |\n${currentSheetEvidenceRows(sheetsText)}\n\n## Future Logical Sheet Model\n\nThis table is a planning model only. Do not physically rename live Sheets in this phase. Google Sheets remain temporary bridges during migration and should not define the permanent architecture.\n\n| Future logical area | Purpose | Disposition | Future targets | Phase 3 blocker status | Notes |\n| --- | --- | --- | --- | --- | --- |\n${futureLogicalSheetRows()}\n\n`;
  const withFinding = insertSafeFinding(
    packet,
    'Old Sheet 1 campaigns are legacy/archive only in the next-generation design.',
    'DESIGN_DECISION',
    'HIGH',
    'Old Sheet 1 should not be migrated as an active future campaign model.'
  );
  const updated = replacePacketBodySection(withFinding, '## Actionable Migration Questions', '## Production Dependencies', replacement);
  fs.writeFileSync(packetPath, updated, 'utf8');
  console.log('Google Sheets review packet cleanup applied: separated current evidence from the future logical Sheet model.');
}

function addInventoryItem(items, seen, item) {
  const candidate = scrubSensitiveValue(item.candidate).slice(0, 120) || 'UNKNOWN';
  const key = `${item.area}|${candidate}`;
  if (seen.has(key)) {
    return;
  }
  seen.add(key);
  items.push({
    area: item.area,
    candidate,
    operationalSignal: item.operationalSignal || operationalSignalFor(candidate),
    linkedSheetOrRoute: item.linkedSheetOrRoute || linkedSheetOrRouteFor(candidate),
    confidence: item.confidence || 'LOW',
    stillUnknown: item.stillUnknown || 'Source version, live caller, runtime behavior, owner, and cutover disposition'
  });
}

function operationalSignalFor(candidate) {
  const lower = candidate.toLowerCase();
  if (/redirect|route|landing|url/.test(lower)) {
    return 'Redirect/routing candidate';
  }
  if (/campaign|qr|ad|creative/.test(lower)) {
    return 'Campaign-related candidate';
  }
  if (/billing|invoice|stripe|payment|promo/.test(lower)) {
    return 'Billing/invoice candidate';
  }
  if (/screencloud|screen cloud|playback|display/.test(lower)) {
    return 'Screen/display candidate';
  }
  if (/provider|facility|media/.test(lower)) {
    return 'Provider/media candidate';
  }
  if (/conference|showcase|sponsor/.test(lower)) {
    return 'Conference candidate';
  }
  if (/sheet|spreadsheet/.test(lower)) {
    return 'Linked Sheet candidate';
  }
  if (/trigger|scheduled|clock/.test(lower)) {
    return 'Trigger candidate';
  }
  if (/doget|dopost|web app|mode=/.test(lower)) {
    return 'Web app mode or handler candidate';
  }
  return 'UNKNOWN';
}

function linkedSheetOrRouteFor(candidate) {
  const sheetMatch = candidate.match(/\b(?:sheet|spreadsheet)(?:\s+id)?\s*[=:]\s*([A-Za-z0-9_-]{8,})/i);
  if (sheetMatch) {
    return `Sheet candidate: ${sheetMatch[1]}`;
  }
  const routeMatch = candidate.match(/\/[A-Za-z0-9][A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]{0,120}/);
  return routeMatch ? `Route candidate: ${routeMatch[0].split(/[?#]/)[0]}` : 'UNKNOWN';
}

function collectAppsScriptEvidenceText() {
  return APPS_SCRIPT_SOURCE_PATHS
    .flatMap((sourcePath) => walkFiles(sourcePath))
    .map((sourceFile) => readPreview(sourceFile))
    .join('\n\n');
}

function extractAppsScriptInventory(text) {
  const items = [];
  const seen = new Set();
  const add = (item) => addInventoryItem(items, seen, item);

  const modeRegexes = [
    /\bmode\s*[=:]\s*([A-Za-z0-9_-]{2,80})/gi,
    /["']mode["']\s*:\s*["']([A-Za-z0-9_-]{2,80})["']/gi
  ];
  for (const regex of modeRegexes) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      add({ area: 'Web app mode', candidate: `mode=${match[1]}`, confidence: 'LOW' });
    }
  }

  const handlerRegex = /\bfunction\s+(doGet|doPost|[A-Za-z0-9_]*(?:Handler|Route|Mode|Trigger)[A-Za-z0-9_]*)\s*\(/gi;
  let handlerMatch;
  while ((handlerMatch = handlerRegex.exec(text)) !== null) {
    add({ area: 'doGet/doPost route or handler', candidate: handlerMatch[1], confidence: /^(doGet|doPost)$/i.test(handlerMatch[1]) ? 'MEDIUM' : 'LOW' });
  }
  if (/\bdoGet\b/i.test(text)) {
    add({ area: 'doGet/doPost route or handler', candidate: 'doGet', confidence: 'MEDIUM' });
  }
  if (/\bdoPost\b/i.test(text)) {
    add({ area: 'doGet/doPost route or handler', candidate: 'doPost', confidence: 'MEDIUM' });
  }

  const triggerRegexes = [
    /\btrigger(?:\s+name)?\s*[:=-]\s*([^\n|]{2,80})/gi,
    /ScriptApp\.newTrigger\(["']?([A-Za-z0-9_ -]{2,80})["']?\)/gi
  ];
  for (const regex of triggerRegexes) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      add({ area: 'Trigger name', candidate: match[1], confidence: 'LOW' });
    }
  }

  const linkedSheetRegexes = [
    /\/spreadsheets\/d\/([A-Za-z0-9_-]{12,})/gi,
    /\b(?:Spreadsheet ID|Sheet ID)\s*[:=-]\s*([A-Za-z0-9_-]{12,})/gi
  ];
  for (const regex of linkedSheetRegexes) {
    let match;
    while ((match = regex.exec(text)) !== null) {
      add({
        area: 'Likely linked Sheet',
        candidate: `Spreadsheet ID=${match[1]}`,
        operationalSignal: 'Linked Sheet candidate',
        linkedSheetOrRoute: `Sheet candidate: ${match[1]}`,
        confidence: 'LOW',
        stillUnknown: 'Exact tab, caller mode, owner, write/read behavior, and Phase 3 impact'
      });
    }
  }

  const routeRegex = /\b(?:route|path|redirect)\s*[:=-]\s*(\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]{1,120})/gi;
  let routeMatch;
  while ((routeMatch = routeRegex.exec(text)) !== null) {
    const route = routeMatch[1].split(/[?#]/)[0];
    add({
      area: 'Route or redirect mode',
      candidate: route,
      operationalSignal: 'Redirect/routing candidate',
      linkedSheetOrRoute: `Route candidate: ${route}`,
      confidence: 'LOW'
    });
  }

  return items.slice(0, 30);
}

function appsScriptInventoryRows(text) {
  const items = extractAppsScriptInventory(text);
  if (items.length === 0) {
    return '| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Apps Script deployment export and source/mode map required. |';
  }
  return items
    .map((item) => `| ${escapeMarkdown(item.area)} | ${escapeMarkdown(item.candidate)} | ${escapeMarkdown(item.operationalSignal)} | ${escapeMarkdown(item.linkedSheetOrRoute)} | ${escapeMarkdown(item.confidence)} | ${escapeMarkdown(item.stillUnknown)} |`)
    .join('\n');
}

function cleanAppsScriptPacket(packetPath) {
  if (!fs.existsSync(packetPath)) {
    throw new Error(`Apps Script review packet was not generated: ${packetPath}`);
  }

  const evidenceText = collectAppsScriptEvidenceText();
  const packet = fs.readFileSync(packetPath, 'utf8');
  const replacement = `## Actionable Migration Questions\n\n- Which Apps Script deployments are currently called by public website pages, forms, redirects, or upload flows?\n- Which web app modes, doGet/doPost handlers, triggers, linked Sheets, redirects, campaign paths, billing paths, ScreenCloud/playback paths, provider paths, or conference paths are verified by sanitized evidence?\n- Which modes must be rebuilt in the future API layer before Squarespace retirement?\n- Which scripts should be kept temporarily only for rollback?\n- Which linked Sheets or routes block Phase 3?\n\n## Sanitized Apps Script Evidence Inventory\n\nThis table is extracted from sanitized summaries, redacted copies, and manifests only. It is not proof of production behavior. If a mode, trigger, linked Sheet, route, source version, or live caller cannot be safely identified, it remains UNKNOWN.\n\n| Evidence area | Candidate from sanitized evidence | Operational signal | Linked Sheet or route | Confidence | Still UNKNOWN |\n| --- | --- | --- | --- | --- | --- |\n${appsScriptInventoryRows(evidenceText)}\n\n`;
  const updated = replacePacketBodySection(packet, '## Actionable Migration Questions', '## Production Dependencies', replacement);
  fs.writeFileSync(packetPath, updated, 'utf8');
  console.log('Apps Script review packet cleanup applied: added sanitized evidence inventory without production behavior claims.');
}

function splitMarkdownRow(row) {
  const cells = [];
  let current = '';
  let escaped = false;
  for (const char of row.trim()) {
    if (char === '|' && !escaped) {
      cells.push(current.trim());
      current = '';
      continue;
    }
    current += char;
    escaped = char === '\\' && !escaped;
    if (char !== '\\') {
      escaped = false;
    }
  }
  cells.push(current.trim());
  return cells.filter((cell, index, all) => !(cell === '' && (index === 0 || index === all.length - 1)));
}

function sortRoutes(routes) {
  return [...routes].sort((left, right) => {
    if (left === '/') {
      return -1;
    }
    if (right === '/') {
      return 1;
    }
    return left.localeCompare(right);
  });
}

function routeRows(routes) {
  if (routes.size === 0) {
    return '| UNKNOWN | UNKNOWN | Specific route/path could not be safely extracted. | Active-routes export, redirect map, GA/GSC route report, or QR/campaign route inventory. |';
  }

  return sortRoutes(routes).map((route) => {
    const classification = classifyRoute(route);
    return `| ${escapeMarkdown(route)} | ${classification} | ${escapeMarkdown(routeRationale(classification))} | Manual route inventory and traffic review. |`;
  }).join('\n');
}

function assetDependencySection(assets) {
  if (assets.size === 0) {
    return '';
  }

  const rows = sortRoutes(assets).slice(0, 10).map((assetPath) => (
    `| ${escapeMarkdown(assetPath)} | ASSET_DEPENDENCY | Excluded from the primary route table; verify asset migration separately. |`
  )).join('\n');

  return `\n## Asset Dependencies Found\n\n- Static asset path count: ${assets.size}\n- Primary route classification table excludes these assets.\n\n| Asset path example | Classification | Notes |\n| --- | --- | --- |\n${rows}\n`;
}

function extractRoutesFromTable(section) {
  const routes = new Set();
  const assets = new Set();

  for (const line of section.split(/\r?\n/)) {
    if (!line.trim().startsWith('|') || /^\|\s*-+/.test(line) || line.includes('Route/path candidate')) {
      continue;
    }

    const [candidate] = splitMarkdownRow(line);
    const route = normalizeRouteCandidate(candidate);
    if (!route || route === 'UNKNOWN') {
      continue;
    }

    if (isStaticAssetRoute(route)) {
      assets.add(route);
    } else {
      routes.add(route);
    }
  }

  return { routes, assets };
}

function updateSafeFindings(packet, routeCount, assetCount) {
  const routeFinding = routeCount > 0
    ? `| ${routeCount} sanitized route/path candidate(s) were found. | REDACTED_COPY | LOW | Route candidates are review aids only and may be incomplete. |`
    : '| No specific route/path candidate was safely extracted. | UNKNOWN | UNKNOWN | Route candidates are review aids only and may be incomplete. |';
  const assetFinding = assetCount > 0
    ? `\n| ${assetCount} static asset path candidate(s) were separated from active routes. | REDACTED_COPY | LOW | Asset dependencies are not classified as rebuild routes. |`
    : '';

  return packet.replace(
    /\| (?:\d+ sanitized route\/path candidate\(s\) were found\.|No specific route\/path candidate was safely extracted\.) \| (?:REDACTED_COPY|UNKNOWN) \| (?:LOW|UNKNOWN) \| Route candidates are review aids only and may be incomplete\. \|/,
    `${routeFinding}${assetFinding}`
  );
}

function cleanActiveRoutesPacket(packetPath) {
  if (!fs.existsSync(packetPath)) {
    throw new Error(`Active routes review packet was not generated: ${packetPath}`);
  }

  const packet = fs.readFileSync(packetPath, 'utf8');
  const tableStart = packet.indexOf(ROUTE_TABLE_HEADING);
  const nextSectionStart = packet.indexOf(PRODUCTION_DEPENDENCIES_HEADING, tableStart);
  if (tableStart === -1 || nextSectionStart === -1) {
    throw new Error('Active routes review packet is missing the expected route table markers.');
  }

  const beforeTable = packet.slice(0, tableStart);
  const tableSection = packet.slice(tableStart, nextSectionStart).trimEnd();
  const afterTable = packet.slice(nextSectionStart);
  const { routes, assets } = extractRoutesFromTable(tableSection);
  mergeInventory({ routes, assets }, collectSafeRouteSources());
  const updatedTable = `${ROUTE_TABLE_HEADING}\n\n| Route/path candidate | Classification | Rationale | Evidence source that should verify it |\n| --- | --- | --- | --- |\n${routeRows(routes)}\n${assetDependencySection(assets)}\n`;
  const updatedPacket = updateSafeFindings(`${beforeTable}${updatedTable}${afterTable}`, routes.size, assets.size);

  fs.writeFileSync(packetPath, updatedPacket, 'utf8');
  console.log('Active routes review packet cleanup applied: normalized routes, deduplicated rows, and separated static assets.');
}

try {
  cleanActiveRoutesPacket(ACTIVE_ROUTES_PACKET);
  cleanGoogleSheetsPacket(GOOGLE_SHEETS_PACKET);
  cleanAppsScriptPacket(APPS_SCRIPT_PACKET);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}
