#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  EVIDENCE_CATEGORIES,
  REVIEW_PACKET_FILES,
  TEXT_SNIFF_EXTENSIONS,
  ensurePrivateEvidenceFolders,
  isIgnoredEvidenceName,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('generate-sanitized-migration-review-packets');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const PREVIEW_LIMIT = 160 * 1024;
const REVIEW_PACKET_DIR = path.join(options.root, 'review-packets');
const SUMMARY_DIR = path.join(options.root, 'sanitized-summaries');
const REDACTED_COPIES_DIR = path.join(options.root, 'redaction-reports', 'redacted-copies');
const MANIFEST_DIR = path.join(options.root, 'manifests');
const SHEETS_AUDIT_PATH = path.join(options.root, 'sheets', 'google-sheets-evidence-from-audit.md');

const SENSITIVE_PATTERNS = [
  { regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  { regex: /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g, replacement: '[REDACTED_STRIPE_KEY]' },
  { regex: new RegExp('\\bwh' + 'sec_[A-Za-z0-9]{16,}\\b', 'g'), replacement: '[REDACTED_WEBHOOK_SECRET]' },
  { regex: /\bAIza[0-9A-Za-z_-]{35}\b/g, replacement: '[REDACTED_GOOGLE_API_KEY]' },
  { regex: /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\b/g, replacement: '[REDACTED_APPS_SCRIPT_URL]' },
  { regex: new RegExp('\\bAK' + 'fy[A-Za-z0-9_-]{20,}\\b', 'g'), replacement: '[REDACTED_APPS_SCRIPT_TOKEN]' },
  { regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  { regex: /\bya29\.[0-9A-Za-z_-]+\b/g, replacement: '[REDACTED_OAUTH_TOKEN]' },
  { regex: /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[^"'\s,;]{12,}/gi, replacement: '[REDACTED_KEY_ASSIGNMENT]' },
  { regex: /\b(?:cookie|sessionid|session[_-]?token|sid)\s*[:=]\s*["']?[^"'\s,;]{12,}/gi, replacement: '[REDACTED_COOKIE_OR_SESSION]' },
  { regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[REDACTED_EMAIL]' },
  { regex: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
  { regex: /\b(?:cus|pi|ch|in|sub|ord|order|customer)_[A-Za-z0-9]{8,}\b/gi, replacement: '[REDACTED_PAYMENT_OR_CUSTOMER_ID]' },
  { regex: /\b(?:google-site-verification|facebook-domain-verification|MS=ms|apple-domain-verification)[=:][A-Za-z0-9._-]{8,}\b/gi, replacement: '[REDACTED_DNS_VERIFICATION]' },
  { regex: /https?:\/\/[^\s"'<>]+(?:X-Goog-Signature|X-Amz-Signature|Signature=|sig=|token=)[^\s"'<>]*/gi, replacement: '[REDACTED_SIGNED_URL]' }
];

const PACKET_TITLES = new Map([
  ['active-routes-review-packet.md', 'Active Routes Migration Review Packet'],
  ['google-sheets-destinations-review-packet.md', 'Google Sheets Destinations Migration Review Packet'],
  ['apps-script-review-packet.md', 'Apps Script Migration Review Packet'],
  ['squarespace-forms-review-packet.md', 'Squarespace Forms Migration Review Packet'],
  ['analytics-search-console-review-packet.md', 'Analytics and Search Console Migration Review Packet'],
  ['migration-blockers-review-packet.md', 'Migration Blockers Review Packet']
]);

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\..+$/, 'Z');
}

function isTextFile(filePath) {
  return TEXT_SNIFF_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    if (isIgnoredEvidenceName(entry.name)) {
      continue;
    }
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function latestFile(dirPath, prefix) {
  const files = walkFiles(dirPath).filter((filePath) => path.basename(filePath).startsWith(prefix));
  if (files.length === 0) {
    return null;
  }
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function scrubSensitive(value) {
  let safe = String(value || '');
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    safe = safe.replace(pattern.regex, pattern.replacement);
  }
  return safe.replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
}

function escapeMarkdown(value) {
  const safe = scrubSensitive(value || 'UNKNOWN') || 'UNKNOWN';
  return safe.replace(/\|/g, '\\|');
}

function readText(filePath) {
  if (!filePath || !fs.existsSync(filePath) || !isTextFile(filePath)) {
    return '';
  }
  const fileHandle = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(PREVIEW_LIMIT);
    const bytesRead = fs.readSync(fileHandle, buffer, 0, PREVIEW_LIMIT, 0);
    return scrubSensitive(buffer.subarray(0, bytesRead).toString('utf8'));
  } finally {
    fs.closeSync(fileHandle);
  }
}

function loadSource(filePath, evidenceType) {
  return {
    filePath,
    evidenceType,
    relativePath: path.relative(options.root, filePath),
    text: readText(filePath)
  };
}

function loadSummary(categoryId) {
  const summaryPath = path.join(SUMMARY_DIR, `${categoryId}-summary.md`);
  return fs.existsSync(summaryPath) ? loadSource(summaryPath, 'SANITIZED_SUMMARY') : null;
}

function loadLatestManifests() {
  return [
    latestFile(MANIFEST_DIR, 'private-evidence-status-'),
    latestFile(MANIFEST_DIR, 'private-evidence-import-'),
    latestFile(MANIFEST_DIR, 'sanitized-summary-builder-')
  ].filter(Boolean).map((filePath) => loadSource(filePath, 'MANIFEST_ONLY'));
}

function loadRedactedCopiesFor(prefixes) {
  return walkFiles(REDACTED_COPIES_DIR)
    .filter((filePath) => {
      const originalRelative = path.relative(REDACTED_COPIES_DIR, filePath);
      return prefixes.some((prefix) => originalRelative === prefix || originalRelative.startsWith(`${prefix}/`));
    })
    .map((filePath) => loadSource(filePath, 'REDACTED_COPY'));
}

function packetSources({ categories = [], redactedPrefixes = [], includeSheetsAudit = false, includeManifests = true }) {
  const sources = [];
  for (const categoryId of categories) {
    const summary = loadSummary(categoryId);
    if (summary) {
      sources.push(summary);
    }
  }
  sources.push(...loadRedactedCopiesFor(redactedPrefixes));
  if (includeSheetsAudit && fs.existsSync(SHEETS_AUDIT_PATH)) {
    sources.push(loadSource(SHEETS_AUDIT_PATH, 'SANITIZED_SHEETS_AUDIT'));
  }
  if (includeManifests) {
    sources.push(...loadLatestManifests());
  }
  return sources.filter((source, index, all) => all.findIndex((candidate) => candidate.filePath === source.filePath) === index);
}

function joinedText(sources) {
  return sources.map((source) => source.text).join('\n\n');
}

function evidenceBoundary(title, generatedAt, sources) {
  const sourceTypes = [...new Set(sources.map((source) => source.evidenceType))].sort();
  return `# ${title}\n\n## Evidence Boundary\n\n- Generated by: npm run evidence:review-packets\n- Generated at: ${generatedAt}\n- Evidence root: outside repo\n- Output folder: review-packets\n- Raw private evidence committed to Git: NO\n- Raw snippets copied into packet: NO\n- Manual review complete: UNKNOWN\n- Production impact: NONE\n- Phase 3 started: NO\n- Source types used: ${sourceTypes.length > 0 ? sourceTypes.join(', ') : 'UNKNOWN'}\n- Safe source file count: ${sources.length}\n`;
}

function safeFindingsRows(findings) {
  if (findings.length === 0) {
    return '| No safe finding could be extracted. | UNKNOWN | UNKNOWN | Preserve UNKNOWN until verified manually. |';
  }
  return findings.map((finding) => `| ${escapeMarkdown(finding.finding)} | ${finding.evidenceType} | ${finding.confidence} | ${escapeMarkdown(finding.notes)} |`).join('\n');
}

function unknownList(sources, extraUnknowns = []) {
  const unknowns = new Set(extraUnknowns);
  const unknownLineRegex = /(?:^|\n)-\s*([^:\n]+):\s*UNKNOWN\b/gi;
  for (const source of sources) {
    let match;
    while ((match = unknownLineRegex.exec(source.text)) !== null) {
      unknowns.add(match[1].trim());
    }
  }
  if (unknowns.size === 0) {
    unknowns.add('Manual verification status');
  }
  return [...unknowns].slice(0, 18).map((item) => `- ${escapeMarkdown(item)}: UNKNOWN`).join('\n');
}

function redactionConcernsSection(sources) {
  const latestReport = latestFile(path.join(options.root, 'redaction-reports'), 'redaction-report-');
  const latestReportText = readText(latestReport);
  const findingCountMatch = latestReportText.match(/Findings:\s*(\d+)/i);
  const findingCount = findingCountMatch ? findingCountMatch[1] : 'UNKNOWN';
  const redactedCopyCount = sources.filter((source) => source.evidenceType === 'REDACTED_COPY').length;
  return `| Concern | Status | Notes |\n| --- | --- | --- |\n| Latest redaction report available | ${latestReport ? 'YES' : 'UNKNOWN'} | Finding count: ${findingCount}. Values are not copied into packets. |\n| Redacted copies used | ${redactedCopyCount > 0 ? 'YES' : 'NO'} | Redacted copies are treated as safe local aids, not production truth. |\n| Raw sensitive snippets copied | NO | Secrets, tokens, cookies, private deployment IDs, customer data, order data, payment data, and raw form responses are omitted. |\n| Manual redaction review complete | UNKNOWN | Drip/ChatGPT review is required before using packet findings. |`;
}

function productionDependenciesRows(dependencies) {
  if (dependencies.length === 0) {
    return '| UNKNOWN | UNKNOWN | UNKNOWN | Verify manually before migration. |';
  }
  return dependencies.map((dependency) => `| ${escapeMarkdown(dependency.system)} | ${escapeMarkdown(dependency.status)} | ${escapeMarkdown(dependency.risk)} | ${escapeMarkdown(dependency.notes)} |`).join('\n');
}

function packetFooter({ sources, dependencies, unknowns, manualSteps, phase3Impact }) {
  return `\n## Production Dependencies\n\n| System | Evidence status | Risk | Notes |\n| --- | --- | --- | --- |\n${productionDependenciesRows(dependencies)}\n\n## Redaction Concerns\n\n${redactionConcernsSection(sources)}\n\n## Remaining UNKNOWNs\n\n${unknownList(sources, unknowns)}\n\n## Recommended Manual Verification Steps\n\n${manualSteps.map((step) => `- ${escapeMarkdown(step)}`).join('\n')}\n\n## Phase 3 Readiness Impact\n\n${phase3Impact}\n\n## Do Not Commit Raw Evidence\n\n- Keep these packets local/private until Drip/ChatGPT review.\n- Do not commit raw exports, screenshots, credentials, cookies, tokens, private deployment IDs, form responses, customer data, order data, or payment data.\n- Keep unverified fields marked UNKNOWN.\n`;
}

function extractRoutes(text) {
  const routes = new Set();
  const urlRegex = /https?:\/\/[A-Za-z0-9.-]+(:\d+)?(\/[A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]*)/g;
  let urlMatch;
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    routes.add(urlMatch[2].split(/[?#]/)[0] || '/');
  }

  const pathRegex = /(^|[\s("'`])\/[A-Za-z0-9][A-Za-z0-9._~:/?#\[\]@!$&'()*+,;=%-]{0,120}/g;
  let pathMatch;
  while ((pathMatch = pathRegex.exec(text)) !== null) {
    routes.add(pathMatch[0].trim().replace(/^[("'`]+/, '').replace(/[.,;:)]+$/, '').split(/[?#]/)[0]);
  }

  return [...routes]
    .map((route) => route.replace(/\/+$/, '') || '/')
    .filter((route) => !route.includes('[REDACTED'))
    .filter((route) => !route.startsWith('/Users') && !route.startsWith('/Documents') && !route.startsWith('/private'))
    .filter((route) => !route.includes('/private-evidence/') && !route.endsWith('.md'))
    .filter((route, index, all) => all.indexOf(route) === index)
    .sort()
    .slice(0, 25);
}

function classifyRoute(route) {
  const lower = route.toLowerCase();
  if (route === '/' || lower === '/home') {
    return 'RETAIN';
  }
  if (lower.includes('old') || lower.includes('legacy')) {
    return 'REDIRECT';
  }
  if (/(qr|campaign|conference|showcase|provider|advertiser|media|upload|form|intake|vendor)/.test(lower)) {
    return 'REBUILD';
  }
  return 'UNKNOWN';
}

function routeRows(routes) {
  if (routes.length === 0) {
    return '| UNKNOWN | UNKNOWN | Specific route/path could not be safely extracted. | Active-routes export, redirect map, GA/GSC route report, or QR/campaign route inventory. |';
  }
  return routes.map((route) => {
    const decision = classifyRoute(route);
    const rationale = decision === 'UNKNOWN'
      ? 'Route candidate found, but migration intent is not verified.'
      : `Route candidate appears to require ${decision.toLowerCase()} handling.`;
    return `| ${escapeMarkdown(route)} | ${decision} | ${escapeMarkdown(rationale)} | Manual route inventory and traffic review. |`;
  }).join('\n');
}

function activeRoutesPacket(generatedAt) {
  const sources = packetSources({
    categories: ['active-routes', 'squarespace-redirects', 'google-analytics', 'google-search-console'],
    redactedPrefixes: ['active-routes', 'squarespace', 'analytics-search-console']
  });
  const routes = extractRoutes(joinedText(sources));
  const findings = [
    {
      finding: routes.length > 0 ? `${routes.length} sanitized route/path candidate(s) were found.` : 'No specific route/path candidate was safely extracted.',
      evidenceType: routes.length > 0 ? 'REDACTED_COPY' : 'UNKNOWN',
      confidence: routes.length > 0 ? 'LOW' : 'UNKNOWN',
      notes: 'Route candidates are review aids only and may be incomplete.'
    }
  ];
  return `${evidenceBoundary(PACKET_TITLES.get('active-routes-review-packet.md'), generatedAt, sources)}\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Notes |\n| --- | --- | --- | --- |\n${safeFindingsRows(findings)}\n\n## Actionable Migration Questions\n\n- Which route candidates are active public, campaign, QR, provider, advertiser, or conference paths?\n- Which paths require redirect mapping before Squarespace retirement?\n- Which paths should be rebuilt in the Drip repo versus retained as redirects?\n- Which routes block Phase 3 dataset ingestion because they feed form, upload, or campaign workflows?\n\n## Retain / Rebuild / Redirect / Retire / Unknown Table\n\n| Route/path candidate | Classification | Rationale | Evidence source that should verify it |\n| --- | --- | --- | --- |\n${routeRows(routes)}\n${packetFooter({
    sources,
    dependencies: [
      { system: 'Squarespace redirects and public routes', status: routes.length > 0 ? 'PARTIAL' : 'UNKNOWN', risk: 'HIGH', notes: 'Cutover can break QR/campaign/conference/provider routes if not verified.' },
      { system: 'GA4/Search Console route traffic', status: 'UNKNOWN', risk: 'MEDIUM', notes: 'Traffic priority still requires manual export review.' }
    ],
    unknowns: ['Active route owner', 'Route traffic priority', 'Redirect target map', 'Campaign/QR dependency status'],
    manualSteps: [
      'Export current Squarespace URL mappings and active routes.',
      'Compare route candidates against GA4 landing-page and Search Console page data.',
      'Confirm QR, campaign, conference, provider, advertiser, and showcase paths with Drip.',
      'Mark each route RETAIN, REBUILD, REDIRECT, RETIRE, or UNKNOWN after review.'
    ],
    phase3Impact: 'Phase 3 remains blocked for any route that feeds dataset intake, campaign attribution, provider media workflows, or market-intelligence signals until route ownership and redirect behavior are verified.'
  })}`;
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

function firstMatch(text, regexes) {
  for (const regex of regexes) {
    const match = text.match(regex);
    if (match && match[1]) {
      return scrubSensitive(match[1]).slice(0, 120) || 'UNKNOWN';
    }
  }
  return 'UNKNOWN';
}

function slugCandidate(value) {
  const slug = scrubSensitive(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 48);
  return slug || 'unknown';
}

function inferRole(block) {
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

function sheetRows(sheetsText) {
  const rows = [];
  for (let number = 1; number <= 7; number += 1) {
    const block = linesForSheet(sheetsText, number);
    const name = firstMatch(block, [
      new RegExp(`Sheet\\s*${number}\\s*[:|-]\\s*([^\\n|]+)`, 'i'),
      /\bSheet name\s*[:|-]\s*([^\n|]+)/i,
      /\bName\s*[:|-]\s*([^\n|]+)/i
    ]);
    const sheetName = name === 'UNKNOWN' && block ? `Sheet ${number}` : name;
    const spreadsheetId = firstMatch(block, [
      /\/spreadsheets\/d\/([A-Za-z0-9_-]{12,})/i,
      /\bSpreadsheet ID\s*[:|-]\s*([A-Za-z0-9_-]{12,})/i,
      /\bSheet ID\s*[:|-]\s*([A-Za-z0-9_-]{12,})/i
    ]);
    const tabs = firstMatch(block, [
      /\bTabs?\s*[:|-]\s*([^\n]+)/i,
      /\bWorksheets?\s*[:|-]\s*([^\n]+)/i
    ]);
    const role = inferRole(block);
    const slug = slugCandidate(sheetName !== 'UNKNOWN' ? sheetName : `sheet_${number}`);
    const blocker = block && /(phase 3|dataset|ingestion|form|apps script|automation|campaign|market)/i.test(block) ? 'YES - verify before Phase 3' : 'UNKNOWN';
    rows.push(`| Sheet ${number}${sheetName !== 'UNKNOWN' ? `: ${escapeMarkdown(sheetName)}` : ''} | ${escapeMarkdown(spreadsheetId)} | ${escapeMarkdown(role)} | ${escapeMarkdown(tabs)} | ${block ? 'PARTIAL' : 'UNKNOWN'} | ${sheetName !== 'UNKNOWN' ? `legacy_${slug}` : 'UNKNOWN'} | ${sheetName !== 'UNKNOWN' ? `legacy_${slug}_events` : 'UNKNOWN'} | ${block ? 'HIGH' : 'UNKNOWN'} | ${blocker} | ${block ? 'Manual owner, schema, and destination verification' : 'All fields'} |`);
  }
  return rows.join('\n');
}

function googleSheetsPacket(generatedAt) {
  const sources = packetSources({
    categories: ['google-sheets-destinations', 'squarespace-forms', 'apps-script-modes'],
    redactedPrefixes: ['sheets', 'squarespace', 'apps-script'],
    includeSheetsAudit: true
  });
  const sheetsText = readText(SHEETS_AUDIT_PATH);
  const hasAudit = Boolean(sheetsText);
  const findings = [
    {
      finding: hasAudit ? 'Sanitized Sheets audit evidence file is available.' : 'Sanitized Sheets audit evidence file is missing.',
      evidenceType: hasAudit ? 'SANITIZED_SHEETS_AUDIT' : 'UNKNOWN',
      confidence: hasAudit ? 'MEDIUM' : 'UNKNOWN',
      notes: 'Sheet rows remain draft planning candidates until manually verified.'
    }
  ];
  return `${evidenceBoundary(PACKET_TITLES.get('google-sheets-destinations-review-packet.md'), generatedAt, sources)}\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Notes |\n| --- | --- | --- | --- |\n${safeFindingsRows(findings)}\n\n## Actionable Migration Questions\n\n- Which Sheets are still active form, Apps Script, campaign, media, billing, or market-intelligence dependencies?\n- Which tabs should become Firestore collections, BigQuery tables, or event streams?\n- Which Sheets block Phase 3 because they are current dataset or automation sources?\n- Which Sheets can be retired after replacement intake flows are approved?\n\n## Retain / Rebuild / Redirect / Retire / Unknown Table\n\n| Sheet | Spreadsheet ID | Current role | Known tabs | Current operational dependency | Future Firestore collection candidate | Future BigQuery table/event candidate | Migration priority | Phase 3 blocker status | Still UNKNOWN |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${sheetRows(sheetsText)}\n${packetFooter({
    sources,
    dependencies: [
      { system: 'Google Sheets form destinations', status: hasAudit ? 'PARTIAL' : 'UNKNOWN', risk: 'HIGH', notes: 'Sheets may be active intake or automation sources.' },
      { system: 'Future Firestore/BigQuery map', status: 'UNKNOWN', risk: 'HIGH', notes: 'Phase 3 cannot start until table and collection candidates are reviewed.' }
    ],
    unknowns: ['Sheet owners', 'Tab schemas', 'Live form destinations', 'Firestore collection map', 'BigQuery table map'],
    manualSteps: [
      'Open the sanitized Sheets audit evidence and verify Sheet 1 through Sheet 7 manually.',
      'Confirm each Sheet owner, active tabs, form destinations, and Apps Script dependencies.',
      'Map approved Sheets to future Firestore collections and BigQuery tables/events.',
      'Keep any unverified sheet or tab marked UNKNOWN.'
    ],
    phase3Impact: 'Phase 3 remains blocked until active Sheets, tab schemas, and approved Firestore/BigQuery migration targets are verified.'
  })}`;
}

function extractAppsScriptAreas(text) {
  const areas = new Set();
  const modeRegex = /\bmode\s*[=:]\s*([A-Za-z0-9_-]+)/gi;
  let modeMatch;
  while ((modeMatch = modeRegex.exec(text)) !== null) {
    areas.add(`mode=${modeMatch[1]}`);
  }
  if (/\bdoGet\b/i.test(text)) {
    areas.add('doGet');
  }
  if (/\bdoPost\b/i.test(text)) {
    areas.add('doPost');
  }
  if (/\bweb app\b|\bdeployment\b/i.test(text)) {
    areas.add('web app deployment');
  }
  return [...areas].slice(0, 20);
}

function appsScriptRows(text) {
  const areas = extractAppsScriptAreas(text);
  if (areas.length === 0) {
    return '| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | HIGH | Apps Script deployment export and source/mode map required. |';
  }
  return areas.map((area) => {
    const lower = area.toLowerCase();
    const disposition = lower.includes('doget') || lower.includes('dopost') || lower.includes('mode=') ? 'REBUILD OR KEEP TEMPORARILY' : 'UNKNOWN';
    return `| ${escapeMarkdown(area)} | Legacy website/form/automation route handling | UNKNOWN | ${disposition} | HIGH | Verify deployed source, runtime load order, called modes, linked Sheet, and route usage. |`;
  }).join('\n');
}

function appsScriptPacket(generatedAt) {
  const sources = packetSources({
    categories: ['apps-script-deployments', 'apps-script-modes', 'google-sheets-destinations', 'active-routes'],
    redactedPrefixes: ['apps-script', 'sheets', 'active-routes']
  });
  const text = joinedText(sources);
  const areas = extractAppsScriptAreas(text);
  const findings = [
    {
      finding: areas.length > 0 ? `${areas.length} Apps Script area/mode candidate(s) found.` : 'No Apps Script deployment or mode could be safely extracted.',
      evidenceType: areas.length > 0 ? 'REDACTED_COPY' : 'UNKNOWN',
      confidence: areas.length > 0 ? 'LOW' : 'UNKNOWN',
      notes: 'Deployment IDs and URLs remain redacted; manual source/version mapping is required.'
    }
  ];
  return `${evidenceBoundary(PACKET_TITLES.get('apps-script-review-packet.md'), generatedAt, sources)}\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Notes |\n| --- | --- | --- | --- |\n${safeFindingsRows(findings)}\n\n## Actionable Migration Questions\n\n- Which Apps Script deployments are currently called by public website pages, forms, redirects, or upload flows?\n- Which modes must be rebuilt in the future API layer before Squarespace retirement?\n- Which scripts should be kept temporarily only for rollback?\n- Which linked Sheets or routes block Phase 3?\n\n## Retain / Rebuild / Redirect / Retire / Unknown Table\n\n| Deployment / mode / script area | Likely current dependency | Linked Sheet or route | Keep temporarily / rebuild / retire / unknown | Migration risk | Manual verification needed |\n| --- | --- | --- | --- | --- | --- |\n${appsScriptRows(text)}\n${packetFooter({
    sources,
    dependencies: [
      { system: 'Apps Script deployed web app/modes', status: areas.length > 0 ? 'PARTIAL' : 'UNKNOWN', risk: 'HIGH', notes: 'Runtime source/version and load order must be verified manually.' },
      { system: 'Linked Sheets/routes', status: 'UNKNOWN', risk: 'HIGH', notes: 'Phase 3 may depend on legacy Sheets or mode outputs.' }
    ],
    unknowns: ['Deployed Apps Script parity', 'Runtime load order', 'Live mode usage', 'Linked Sheet IDs', 'Cutover owner'],
    manualSteps: [
      'Export deployed Apps Script URLs, versions, source files, and mode mapping with tokens redacted.',
      'Confirm which website pages or forms call each mode.',
      'Map each mode to future API routes or mark it temporary rollback only.',
      'Do not change Apps Script deployments or triggers during review.'
    ],
    phase3Impact: 'Phase 3 remains blocked for any Apps Script mode that produces dataset, form, route, or automation outputs until parity and ownership are verified.'
  })}`;
}

function formRows(text) {
  const candidates = new Set();
  const formRegex = /\b(?:form|page)\s*(?:name|title|slug)?\s*[:|-]\s*([^\n|]{2,100})/gi;
  let match;
  while ((match = formRegex.exec(text)) !== null) {
    candidates.add(scrubSensitive(match[1]));
  }
  if (candidates.size === 0 && /\bform\b/i.test(text)) {
    candidates.add('Squarespace form inventory evidence available');
  }
  if (candidates.size === 0) {
    return '| UNKNOWN | UNKNOWN | UNKNOWN | Future app/API intake flow | HIGH | Form/page inventory and destination export required. |';
  }
  return [...candidates].slice(0, 20).map((candidate) => {
    const destination = /google sheets|spreadsheet|sheet destination/i.test(text) ? 'Google Sheets candidate' : 'UNKNOWN';
    return `| ${escapeMarkdown(candidate)} | ${destination} | UNKNOWN | Future app/API intake flow | HIGH | Verify form fields, notifications, spam settings, storage, destination, and owner. |`;
  }).join('\n');
}

function squarespaceFormsPacket(generatedAt) {
  const sources = packetSources({
    categories: ['squarespace-forms', 'google-sheets-destinations', 'apps-script-modes'],
    redactedPrefixes: ['squarespace', 'sheets', 'apps-script']
  });
  const text = joinedText(sources);
  const hasFormEvidence = /\bform\b/i.test(text);
  const findings = [
    {
      finding: hasFormEvidence ? 'Squarespace form evidence is available for manual review.' : 'No Squarespace form detail was safely extracted.',
      evidenceType: hasFormEvidence ? 'SANITIZED_SUMMARY' : 'UNKNOWN',
      confidence: hasFormEvidence ? 'LOW' : 'UNKNOWN',
      notes: 'Form fields and raw responses are not copied into this packet.'
    }
  ];
  return `${evidenceBoundary(PACKET_TITLES.get('squarespace-forms-review-packet.md'), generatedAt, sources)}\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Notes |\n| --- | --- | --- | --- |\n${safeFindingsRows(findings)}\n\n## Actionable Migration Questions\n\n- Which Squarespace forms are active and which can be retired?\n- Which forms write to Sheets, email notifications, Apps Script modes, upload flows, or commerce workflows?\n- Which fields must move to the future app/API intake flow?\n- Which form routes need redirects after rebuild?\n\n## Retain / Rebuild / Redirect / Retire / Unknown Table\n\n| Form/page | Destination | Linked Sheet or workflow | Rebuild target | Migration risk | Still UNKNOWN |\n| --- | --- | --- | --- | --- | --- |\n${formRows(text)}\n${packetFooter({
    sources,
    dependencies: [
      { system: 'Squarespace form storage/destinations', status: hasFormEvidence ? 'PARTIAL' : 'UNKNOWN', risk: 'HIGH', notes: 'Form destination changes can break intake and automations.' },
      { system: 'Future app/API intake flow', status: 'NOT_STARTED', risk: 'HIGH', notes: 'No production intake cutover is authorized.' }
    ],
    unknowns: ['Active forms', 'Form fields', 'Destinations', 'Notifications', 'Spam settings', 'Response retention'],
    manualSteps: [
      'Export Squarespace form list, fields, destinations, notifications, storage, and spam settings.',
      'Map each form to future app/API intake or retirement.',
      'Verify linked Sheets or Apps Script modes before changing any production route.',
      'Do not copy raw form responses into review packets or repo docs.'
    ],
    phase3Impact: 'Phase 3 remains blocked for forms that feed datasets, market intelligence, campaign operations, or provider/advertiser workflows until destinations are verified.'
  })}`;
}

function analyticsRows(text) {
  const ga4 = /ga4|google analytics|measurement id|gtag/i.test(text) ? 'PARTIAL' : 'UNKNOWN';
  const gsc = /search console|gsc|sitemap|indexing/i.test(text) ? 'PARTIAL' : 'UNKNOWN';
  const routeTraffic = /landing page|traffic|page path|query/i.test(text) ? 'PARTIAL' : 'UNKNOWN';
  const seo = /redirect|canonical|sitemap|index/i.test(text) ? 'PARTIAL' : 'UNKNOWN';
  return `| Google Analytics / GA4 | ${ga4} | ${routeTraffic} | ${seo} | Manual property, measurement ID, and route report verification required. |\n| Google Search Console | ${gsc} | ${routeTraffic} | ${seo} | Manual ownership, sitemap, indexing, and page report verification required. |`;
}

function analyticsPacket(generatedAt) {
  const sources = packetSources({
    categories: ['google-analytics', 'google-search-console', 'active-routes', 'squarespace-pages', 'squarespace-redirects'],
    redactedPrefixes: ['analytics-search-console', 'active-routes', 'squarespace']
  });
  const text = joinedText(sources);
  const hasAnalytics = /ga4|google analytics|search console|gsc/i.test(text);
  const findings = [
    {
      finding: hasAnalytics ? 'Analytics/Search Console evidence is available for manual review.' : 'Analytics/Search Console evidence remains UNKNOWN.',
      evidenceType: hasAnalytics ? 'SANITIZED_SUMMARY' : 'UNKNOWN',
      confidence: hasAnalytics ? 'LOW' : 'UNKNOWN',
      notes: 'Measurement IDs, verification values, and private reports are not copied as raw evidence.'
    }
  ];
  return `${evidenceBoundary(PACKET_TITLES.get('analytics-search-console-review-packet.md'), generatedAt, sources)}\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Notes |\n| --- | --- | --- | --- |\n${safeFindingsRows(findings)}\n\n## Actionable Migration Questions\n\n- Which GA4 property and measurement IDs must be preserved in the new site/app stack?\n- Which Search Console properties, sitemaps, and indexing states must be preserved?\n- Which high-traffic pages require redirect priority before Squarespace retirement?\n- Which SEO metadata must be rebuilt in the Drip repo?\n\n## Retain / Rebuild / Redirect / Retire / Unknown Table\n\n| Surface | Evidence available | Route/page traffic dependency | SEO/redirect implication | Still UNKNOWN |\n| --- | --- | --- | --- | --- |\n${analyticsRows(text)}\n${packetFooter({
    sources,
    dependencies: [
      { system: 'GA4 measurement and reporting', status: hasAnalytics ? 'PARTIAL' : 'UNKNOWN', risk: 'MEDIUM', notes: 'Tracking continuity needs manual verification.' },
      { system: 'Search Console and sitemap/indexing', status: hasAnalytics ? 'PARTIAL' : 'UNKNOWN', risk: 'MEDIUM', notes: 'SEO cutover needs sitemap and redirect verification.' }
    ],
    unknowns: ['GA4 property owner', 'Measurement IDs', 'Search Console owners', 'Sitemap status', 'High-traffic redirect priority'],
    manualSteps: [
      'Export GA4 property ownership, measurement IDs, route/page reports, and landing-page traffic.',
      'Export Search Console ownership, sitemap, indexing, and page performance data.',
      'Map high-traffic pages to retain/rebuild/redirect/retire decisions.',
      'Keep private verification values redacted.'
    ],
    phase3Impact: 'Phase 3 is not directly started by analytics review, but dataset and market-intelligence planning should not rely on route traffic assumptions until GA4/GSC evidence is verified.'
  })}`;
}

function evidenceStatusFor(categoryId) {
  const source = loadSummary(categoryId);
  if (!source) {
    return 'UNKNOWN';
  }
  if (/Verified by evidence:\s*PARTIAL/i.test(source.text)) {
    return 'PARTIAL';
  }
  if (/Source Evidence Used[\s\S]*\|\s*NONE\s*\|/i.test(source.text)) {
    return 'UNKNOWN';
  }
  return 'NEEDS_REVIEW';
}

function migrationBlockerRows() {
  const blockers = [
    ['Deployed Apps Script parity', 'Apps Script', evidenceStatusFor('apps-script-deployments'), 'HIGH', 'Deployment URLs, versions, source mapping, and behavior parity', 'YES', 'MAYBE'],
    ['Apps Script runtime load order', 'Apps Script', evidenceStatusFor('apps-script-modes'), 'HIGH', 'Loaded files, globals, mode dispatch, and dependencies', 'YES', 'MAYBE'],
    ['Live route usage', 'Public routes / QR / campaigns', evidenceStatusFor('active-routes'), 'HIGH', 'Active routes, QR/campaign/conference paths, redirect targets, and traffic', 'YES', 'MAYBE'],
    ['Squarespace form destinations', 'Squarespace / Sheets / Apps Script', evidenceStatusFor('squarespace-forms'), 'HIGH', 'Fields, destinations, notifications, spam settings, and response storage', 'YES', 'YES if forms feed datasets'],
    ['Google Sheets destination map', 'Sheets', evidenceStatusFor('google-sheets-destinations'), 'HIGH', 'Sheet 1 through Sheet 7 owners, tabs, schemas, and downstream consumers', 'YES', 'YES'],
    ['Secret Manager migration', 'Credentials / config', 'UNKNOWN', 'HIGH', 'Future secret ownership and dry-run/write guard configuration', 'NO', 'YES before production services'],
    ['Approval owners', 'Operations', 'UNKNOWN', 'MEDIUM', 'Drip owner for routes, forms, Sheets, scripts, analytics, and cutover approval', 'YES', 'YES'],
    ['BigQuery table map', 'BigQuery / analytics', 'UNKNOWN', 'HIGH', 'Approved dataset, table, and event naming for future ingestion', 'NO', 'YES'],
    ['Analytics/Search Console continuity', 'GA4 / GSC / SEO', evidenceStatusFor('google-analytics'), 'MEDIUM', 'Property ownership, sitemap/indexing status, measurement IDs, and top pages', 'YES', 'NO'],
    ['Rollback route plan', 'Hosting / DNS / redirects', evidenceStatusFor('squarespace-redirects'), 'HIGH', 'Rollback domain/DNS/redirect dependencies and owner approval', 'YES', 'NO']
  ];
  return blockers.map((row) => `| ${row.map(escapeMarkdown).join(' | ')} |`).join('\n');
}

function migrationBlockersPacket(generatedAt) {
  const sources = packetSources({
    categories: EVIDENCE_CATEGORIES.map((category) => category.id),
    redactedPrefixes: ['active-routes', 'apps-script', 'sheets', 'squarespace', 'analytics-search-console'],
    includeSheetsAudit: true
  });
  const findings = [
    {
      finding: 'Production cutover and Phase 3 remain blocked until private evidence is manually reviewed.',
      evidenceType: 'MANIFEST_ONLY',
      confidence: 'MEDIUM',
      notes: 'This packet organizes blockers; it does not authorize production changes.'
    }
  ];
  return `${evidenceBoundary(PACKET_TITLES.get('migration-blockers-review-packet.md'), generatedAt, sources)}\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Notes |\n| --- | --- | --- | --- |\n${safeFindingsRows(findings)}\n\n## Actionable Migration Questions\n\n- Which blockers must be resolved before Squarespace retirement?\n- Which blockers specifically prevent Phase 3 dataset ingestion?\n- Who owns approval for each affected system?\n- Which blockers need a rollback test before production cutover?\n\n## Retain / Rebuild / Redirect / Retire / Unknown Table\n\n| Blocker | Affected system | Evidence status | Risk level | What must be verified manually | Blocks Squarespace retirement | Blocks Phase 3 |\n| --- | --- | --- | --- | --- | --- | --- |\n${migrationBlockerRows()}\n${packetFooter({
    sources,
    dependencies: [
      { system: 'Squarespace retirement readiness', status: 'BLOCKED', risk: 'HIGH', notes: 'Private evidence review and route/form/script parity are incomplete.' },
      { system: 'Phase 3 dataset ingestion', status: 'BLOCKED', risk: 'HIGH', notes: 'Sheets, BigQuery table map, and approval owners remain unresolved.' }
    ],
    unknowns: ['Final cutover owner', 'Approval owners', 'BigQuery table map', 'Secret Manager migration plan', 'Rollback verification status'],
    manualSteps: [
      'Review each packet with Drip and ChatGPT.',
      'Assign an owner and evidence source for every HIGH-risk blocker.',
      'Keep Squarespace retirement blocked until route, form, script, SEO, and rollback evidence are verified.',
      'Keep Phase 3 blocked until Sheets and BigQuery mapping are approved.'
    ],
    phase3Impact: 'Phase 3 remains blocked. These packets are planning aids only and do not authorize ingestion, production writes, credential use, or live system changes.'
  })}`;
}

const generatedAt = new Date().toISOString();
fs.mkdirSync(REVIEW_PACKET_DIR, { recursive: true });

const packetWriters = new Map([
  ['active-routes-review-packet.md', activeRoutesPacket],
  ['google-sheets-destinations-review-packet.md', googleSheetsPacket],
  ['apps-script-review-packet.md', appsScriptPacket],
  ['squarespace-forms-review-packet.md', squarespaceFormsPacket],
  ['analytics-search-console-review-packet.md', analyticsPacket],
  ['migration-blockers-review-packet.md', migrationBlockersPacket]
]);

const packetRows = [];
for (const fileName of REVIEW_PACKET_FILES) {
  const writer = packetWriters.get(fileName);
  const packetPath = path.join(REVIEW_PACKET_DIR, fileName);
  writeTextFile(packetPath, writer(generatedAt), { force: true });
  packetRows.push(`| ${fileName} | ${PACKET_TITLES.get(fileName)} | NEEDS_MANUAL_REVIEW |`);
}

const manifestPath = path.join(MANIFEST_DIR, `sanitized-migration-review-packets-${timestampForFile(new Date(generatedAt))}.md`);
writeTextFile(manifestPath, `# Sanitized Migration Review Packets Manifest\n\n- Generated: ${generatedAt}\n- Evidence root: ${options.root}\n- Output folder: review-packets\n- Packets generated: ${REVIEW_PACKET_FILES.length}\n- Production impact: NONE\n- Phase 3 started: NO\n- External API calls: NO\n- Live credentials used: NO\n- Raw private evidence committed: NO\n- Automatic promotion into repo docs: NO\n\n## Packets\n\n| Packet | Title | Status |\n| --- | --- | --- |\n${packetRows.join('\n')}\n\n## Required Next Steps\n\n1. Review all packets manually with Drip/ChatGPT.\n2. Keep raw evidence outside the repo.\n3. Keep UNKNOWN fields until verified.\n4. Do not start Phase 3 from these packets.\n`, { force: true });

console.log(`Sanitized migration review packets written: ${REVIEW_PACKET_DIR}`);
console.log(`Packets generated: ${REVIEW_PACKET_FILES.length}`);
console.log(`Packets needing manual review: ${REVIEW_PACKET_FILES.length}`);
console.log(`Packet manifest written: ${manifestPath}`);
console.log('Production impact: NONE');
console.log('Phase 3 started: NO');
