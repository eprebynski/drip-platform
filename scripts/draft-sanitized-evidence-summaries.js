#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  EVIDENCE_CATEGORIES,
  EVIDENCE_DESTINATION_FOLDERS,
  TEXT_SNIFF_EXTENSIONS,
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('draft-sanitized-evidence-summaries');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const TEXT_PREVIEW_LIMIT = 96 * 1024;
const EVIDENCE_TYPES = ['PUBLIC_EVIDENCE', 'PRIVATE_EXPORT_SUMMARY', 'REDACTION_REPORT', 'MANIFEST_ONLY', 'UNKNOWN'];
const CONFIDENCE_LEVELS = ['HIGH', 'MEDIUM', 'LOW', 'UNKNOWN'];
const SOURCE_FOLDERS = [
  'inbox',
  ...EVIDENCE_DESTINATION_FOLDERS,
  'review-needed',
  'manifests',
  'redaction-reports'
];

const CATEGORY_TERMS = {
  'squarespace-pages': ['page', 'pages', 'page-list', 'navigation', 'seo', 'canonical', 'title', 'homepage'],
  'squarespace-forms': ['form', 'forms', 'field', 'fields', 'destination', 'notification', 'spam'],
  'squarespace-code-injection': ['script', 'code', 'injection', 'header', 'footer', 'embed', 'html'],
  'squarespace-redirects': ['redirect', 'url mapping', 'route', 'routes', 'slug'],
  'squarespace-assets': ['asset', 'assets', 'media', 'image', 'download', 'file', 'pdf'],
  'squarespace-commerce': ['commerce', 'store', 'cart', 'checkout', 'product', 'order', 'payment', 'tax', 'shipping'],
  'domain-registrar': ['registrar', 'rdap', 'whois', 'domain owner', 'domain ownership', 'renewal', 'domain lock'],
  'dns-zone': ['dns', 'zone', 'mx', 'txt', 'spf', 'dkim', 'dmarc', 'cname', 'nameserver', 'soa', 'caa', 'ttl'],
  'google-analytics': ['analytics', 'ga4', 'gtag', 'measurement', 'traffic', 'landing page', 'pages and screens'],
  'google-search-console': ['search console', 'gsc', 'sitemap', 'indexing', 'coverage', 'query', 'indexed'],
  'apps-script-deployments': ['apps script', 'appsscript', 'deployment', 'version', 'source', 'web app'],
  'apps-script-modes': ['apps script', 'doget', 'dopost', 'mode=', 'mode ', 'macros', 'route mapping'],
  'google-sheets-destinations': ['sheets', 'spreadsheet', 'worksheet', 'tab', 'columns', 'form destination'],
  'upload-service': ['upload', 'bucket', 'storage', 'file type', 'moderation', 'retention'],
  'screencloud-references': ['screencloud', 'screen cloud', 'screen id', 'channel', 'playlist', 'display'],
  'active-routes': ['active route', 'route', 'routes', 'qr', 'campaign', 'conference', 'showcase', 'provider', 'advertiser', 'vendors']
};

const SENSITIVE_PATTERNS = [
  { name: 'Private key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  { name: 'Stripe key', regex: /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g, replacement: '[REDACTED_STRIPE_KEY]' },
  { name: 'Webhook secret', regex: new RegExp('\\bwh' + 'sec_[A-Za-z0-9]{16,}\\b', 'g'), replacement: '[REDACTED_WEBHOOK_SECRET]' },
  { name: 'Google API key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/g, replacement: '[REDACTED_GOOGLE_API_KEY]' },
  { name: 'Apps Script deployment URL', regex: /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\b/g, replacement: '[REDACTED_APPS_SCRIPT_URL]' },
  { name: 'Apps Script deployment token', regex: new RegExp('\\bAK' + 'fy[A-Za-z0-9_-]{20,}\\b', 'g'), replacement: '[REDACTED_APPS_SCRIPT_TOKEN]' },
  { name: 'Bearer token', regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  { name: 'OAuth token', regex: /\bya29\.[0-9A-Za-z_-]+\b/g, replacement: '[REDACTED_OAUTH_TOKEN]' },
  { name: 'Generic API key assignment', regex: /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[^"'\s,;]{12,}/gi, replacement: '[REDACTED_KEY_ASSIGNMENT]' },
  { name: 'Cookie/session value', regex: /\b(?:cookie|sessionid|session[_-]?token|sid)\s*[:=]\s*["']?[^"'\s,;]{12,}/gi, replacement: '[REDACTED_COOKIE_OR_SESSION]' },
  { name: 'Email address', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[REDACTED_EMAIL]' },
  { name: 'Phone number', regex: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
  { name: 'Payment/order/customer identifier', regex: /\b(?:cus|pi|ch|in|sub|ord|order|customer)_[A-Za-z0-9]{8,}\b/gi, replacement: '[REDACTED_PAYMENT_OR_CUSTOMER_ID]' },
  { name: 'DNS verification value', regex: /\b(?:google-site-verification|facebook-domain-verification|MS=ms|apple-domain-verification)[=:][A-Za-z0-9._-]{8,}\b/gi, replacement: '[REDACTED_DNS_VERIFICATION]' },
  { name: 'Signed URL', regex: /https?:\/\/[^\s"'<>]+(?:X-Goog-Signature|X-Amz-Signature|Signature=|sig=|token=)[^\s"'<>]*/gi, replacement: '[REDACTED_SIGNED_URL]' },
  { name: 'Long mixed token', regex: /\b(?=[A-Za-z0-9_-]{28,}\b)(?=.*[A-Z])(?=.*[a-z])(?=.*\d)[A-Za-z0-9_-]+\b/g, replacement: '[REDACTED_TOKEN_LIKE_VALUE]' }
];

const folderCategoryCounts = EVIDENCE_CATEGORIES.reduce((counts, category) => {
  counts.set(category.folder, (counts.get(category.folder) || 0) + 1);
  return counts;
}, new Map());

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\..+$/, 'Z');
}

function scrubSensitive(value) {
  let safe = String(value || '');
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    safe = safe.replace(pattern.regex, pattern.replacement);
  }
  return safe.replace(/\s+/g, ' ').trim();
}

function escapeMarkdown(value) {
  return scrubSensitive(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function normalize(value) {
  return scrubSensitive(value).toLowerCase().replace(/[_-]+/g, ' ');
}

function safeRelativePath(filePath) {
  return escapeMarkdown(path.relative(options.root, filePath));
}

function isTextFile(filePath) {
  return TEXT_SNIFF_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function walkFiles(dirPath, files = [], skipped = []) {
  if (!fs.existsSync(dirPath)) {
    skipped.push({ filePath: dirPath, reason: 'Folder does not exist.' });
    return files;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    const relative = path.relative(options.root, fullPath);
    if (entry.isDirectory()) {
      if (relative === 'sanitized-summaries') {
        skipped.push({ filePath: fullPath, reason: 'Existing summary output folder is not used as evidence.' });
        continue;
      }
      if (relative === path.join('redaction-reports', 'redacted-copies')) {
        skipped.push({ filePath: fullPath, reason: 'Redacted copies are preferred through their original source mapping.' });
        continue;
      }
      walkFiles(fullPath, files, skipped);
    } else if (entry.isFile()) {
      if (entry.name === 'README.md') {
        skipped.push({ filePath: fullPath, reason: 'README file is not evidence.' });
      } else {
        files.push(fullPath);
      }
    }
  }
  return files;
}

function readTextPreview(filePath, skipped) {
  if (!isTextFile(filePath)) {
    skipped.push({ filePath, reason: 'Binary or unsupported file type was not text-read.' });
    return '';
  }
  const fileHandle = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(TEXT_PREVIEW_LIMIT);
    const bytesRead = fs.readSync(fileHandle, buffer, 0, TEXT_PREVIEW_LIMIT, 0);
    return scrubSensitive(buffer.subarray(0, bytesRead).toString('utf8'));
  } finally {
    fs.closeSync(fileHandle);
  }
}

function redactedCopyFor(filePath) {
  const relative = path.relative(options.root, filePath);
  const redactedPath = path.join(options.root, 'redaction-reports', 'redacted-copies', relative);
  return fs.existsSync(redactedPath) ? redactedPath : null;
}

function evidenceTypeFor(filePath) {
  const relative = path.relative(options.root, filePath);
  const base = path.basename(filePath).toLowerCase();
  if (base.startsWith('redaction-report-')) {
    return 'REDACTION_REPORT';
  }
  if (base.includes('public-evidence-collection-manifest') || relative.includes(`${path.sep}public-`) || base.includes('public-')) {
    return 'PUBLIC_EVIDENCE';
  }
  if (relative.startsWith(`manifests${path.sep}`) || base.includes('manifest') || base.includes('status')) {
    return 'MANIFEST_ONLY';
  }
  return 'PRIVATE_EXPORT_SUMMARY';
}

function confidenceForSource(source) {
  if (source.evidenceType === 'REDACTION_REPORT') {
    return 'HIGH';
  }
  if (source.evidenceType === 'MANIFEST_ONLY') {
    return 'LOW';
  }
  if (source.evidenceType === 'PUBLIC_EVIDENCE') {
    return source.redactionWarnings.length > 0 ? 'LOW' : 'MEDIUM';
  }
  if (source.redactionWarnings.length > 0 && !source.redactedCopyUsed) {
    return 'LOW';
  }
  return 'MEDIUM';
}

function termScore(sourceText, terms) {
  return terms.reduce((score, term) => sourceText.includes(term.toLowerCase()) ? score + 1 : score, 0);
}

function categoryMatches(source, category) {
  const terms = CATEGORY_TERMS[category.id] || [];
  const sourceText = `${source.normalizedPath} ${source.normalizedPreview}`;
  const termsMatched = termScore(sourceText, terms);
  const topFolder = source.relativeOriginal.split(/[\\/]/)[0];
  const folderMatches = topFolder === category.folder;
  const folderHasManyCategories = (folderCategoryCounts.get(category.folder) || 0) > 1;

  if (folderMatches && (!folderHasManyCategories || termsMatched > 0)) {
    return true;
  }
  if (source.evidenceType === 'MANIFEST_ONLY' || source.evidenceType === 'PUBLIC_EVIDENCE') {
    return termsMatched > 0 || sourceText.includes(category.id.replace(/-/g, ' '));
  }
  return termsMatched >= 2;
}

function parseRedactionReports(reportFiles) {
  const findingsByFile = new Map();
  const warningRows = [];

  for (const reportFile of reportFiles) {
    const text = fs.readFileSync(reportFile, 'utf8');
    for (const line of text.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed.startsWith('|') || trimmed.includes('| File |') || trimmed.includes('| ---')) {
        continue;
      }
      const cells = trimmed.split('|').slice(1, -1).map((cell) => scrubSensitive(cell.trim()));
      if (cells.length < 4 || cells[0] === 'NONE') {
        continue;
      }
      const [relativePath, lineNumber, pattern] = cells;
      const row = {
        reportFile,
        relativePath,
        lineNumber,
        pattern
      };
      warningRows.push(row);
      if (!findingsByFile.has(relativePath)) {
        findingsByFile.set(relativePath, []);
      }
      findingsByFile.get(relativePath).push(row);
    }
  }

  return { findingsByFile, warningRows };
}

function latestFile(files, prefix) {
  const matches = files.filter((filePath) => path.basename(filePath).startsWith(prefix));
  if (matches.length === 0) {
    return null;
  }
  matches.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return matches[0];
}

function createSourceRecords(allFiles, redactionFindings, skipped) {
  const sources = [];
  let counter = 1;

  for (const originalPath of allFiles) {
    const relativeOriginal = path.relative(options.root, originalPath);
    const redactedPath = redactedCopyFor(originalPath);
    const readPath = redactedPath || originalPath;
    const preview = readTextPreview(readPath, skipped);
    const redactionWarnings = redactionFindings.get(relativeOriginal) || [];
    const source = {
      id: `SRC-${String(counter).padStart(3, '0')}`,
      originalPath,
      readPath,
      relativeOriginal,
      safePath: safeRelativePath(readPath),
      evidenceType: evidenceTypeFor(originalPath),
      redactedCopyUsed: redactedPath ? 'YES' : 'NO',
      redactionWarnings,
      normalizedPath: normalize(relativeOriginal),
      normalizedPreview: normalize(preview)
    };
    source.confidence = confidenceForSource(source);
    sources.push(source);
    counter += 1;
  }

  return sources;
}

function countsByPattern(warnings) {
  const counts = new Map();
  for (const warning of warnings) {
    counts.set(warning.pattern, (counts.get(warning.pattern) || 0) + 1);
  }
  return [...counts.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}

function uniqueWarnings(sources) {
  const seen = new Set();
  const warnings = [];
  for (const source of sources) {
    for (const warning of source.redactionWarnings) {
      const key = `${warning.relativePath}:${warning.lineNumber}:${warning.pattern}`;
      if (!seen.has(key)) {
        warnings.push(warning);
        seen.add(key);
      }
    }
  }
  return warnings;
}

function findingRows(category, sources) {
  const rows = [];
  const byType = new Map();
  for (const source of sources) {
    if (!byType.has(source.evidenceType)) {
      byType.set(source.evidenceType, []);
    }
    byType.get(source.evidenceType).push(source);
  }

  for (const type of EVIDENCE_TYPES) {
    if (type === 'UNKNOWN') {
      continue;
    }
    const typedSources = byType.get(type) || [];
    if (typedSources.length === 0) {
      continue;
    }
    const sourceIds = typedSources.map((source) => source.id).join(', ');
    const confidence = typedSources.some((source) => source.confidence === 'HIGH')
      ? 'HIGH'
      : typedSources.some((source) => source.confidence === 'MEDIUM') ? 'MEDIUM' : 'LOW';
    const noteByType = {
      PUBLIC_EVIDENCE: 'Public/read-only evidence exists. Private-source verification is still required.',
      PRIVATE_EXPORT_SUMMARY: 'Local private evidence files exist. Findings remain draft-only until human redaction review.',
      REDACTION_REPORT: 'Redaction report evidence exists. Pattern names only are summarized.',
      MANIFEST_ONLY: 'Manifest or status evidence exists, but content-level verification remains UNKNOWN.'
    };
    rows.push({
      finding: `${typedSources.length} ${type.toLowerCase().replace(/_/g, ' ')} source(s) are available for ${category.title}.`,
      evidenceType: type,
      confidence,
      sourceIds,
      notes: noteByType[type]
    });
  }

  if (rows.length === 0) {
    rows.push({
      finding: `No local evidence source clearly verifies ${category.title}.`,
      evidenceType: 'UNKNOWN',
      confidence: 'UNKNOWN',
      sourceIds: 'NONE',
      notes: 'Keep this category UNKNOWN until Drip provides verified private evidence.'
    });
  }

  return rows;
}

function remainingUnknowns(category, sources, warnings) {
  const unknowns = [
    'Export owner',
    'Export date',
    'Source system owner',
    'Whether raw evidence is fully redacted and approved for summary use',
    'Exact production dependency details',
    'Rollback behavior and cutover priority',
    'Drip/ChatGPT approval status'
  ];
  if (sources.length === 0) {
    unknowns.push('Whether any evidence exists for this category');
  }
  if (sources.every((source) => source.evidenceType !== 'PRIVATE_EXPORT_SUMMARY')) {
    unknowns.push('Private export verification');
  }
  if (warnings.length > 0) {
    unknowns.push('Whether redaction warnings have been manually resolved');
  }
  return unknowns;
}

function sourceTableRows(sources) {
  if (sources.length === 0) {
    return '| NONE | UNKNOWN | UNKNOWN | NONE | NO |';
  }
  return sources.map((source) => `| ${source.id} | ${source.evidenceType} | ${source.confidence} | ${source.safePath} | ${source.redactedCopyUsed} |`).join('\n');
}

function warningRows(warnings) {
  if (warnings.length === 0) {
    return '| NONE | HIGH | No scanner findings mapped to this category. |';
  }
  return countsByPattern(warnings)
    .map(([pattern, count]) => `| ${escapeMarkdown(pattern)} | HIGH | ${count} finding(s); values are not copied into this summary. |`)
    .join('\n');
}

function summaryContent(category, sources, generatedAt) {
  const warnings = uniqueWarnings(sources);
  const findings = findingRows(category, sources);
  const unknowns = remainingUnknowns(category, sources, warnings);
  const safeFindingsRows = findings
    .map((row) => `| ${escapeMarkdown(row.finding)} | ${row.evidenceType} | ${row.confidence} | ${escapeMarkdown(row.sourceIds)} | ${escapeMarkdown(row.notes)} |`)
    .join('\n');
  const unknownList = unknowns.map((item) => `- ${escapeMarkdown(item)}: UNKNOWN`).join('\n');

  return `# ${category.title} Sanitized Summary\n\n## Evidence Boundary\n\n- Generated by: npm run evidence:draft-summaries\n- Generated at: ${generatedAt}\n- Source folder: ${category.folder}\n- Raw private evidence location: outside repo\n- Raw evidence committed to Git: NO\n- Automatic promotion into repo docs: NO\n- Redaction review complete: UNKNOWN\n- Verified by evidence: ${sources.length > 0 ? 'PARTIAL' : 'UNKNOWN'}\n- Production impact: NONE\n- Phase 3 started: NO\n\n## Source Evidence Used\n\n| Source ID | Evidence type | Confidence | Safe local path used | Redacted copy used |\n| --- | --- | --- | --- | --- |\n${sourceTableRows(sources)}\n\n## Safe Findings\n\n| Finding | Evidence type | Confidence | Source IDs | Notes |\n| --- | --- | --- | --- | --- |\n${safeFindingsRows}\n\n## Still UNKNOWN\n\n${unknownList}\n\n## Redaction Concerns\n\n| Pattern | Confidence | Notes |\n| --- | --- | --- |\n${warningRows(warnings)}\n\n## Migration Implications\n\n- Blocks Squarespace retirement: ${category.blocksRetirement}\n- Blocks Phase 3: ${category.blocksPhase3}\n- This draft does not authorize migration, DNS, Squarespace, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, display-provider, or production-resource changes.\n- Public evidence and manifests are planning aids only; private-source facts remain UNKNOWN until Drip/ChatGPT review.\n\n## Do Not Commit Raw Evidence\n\n- Do not commit raw exports, private tokens, credentials, cookies, deployment IDs, form responses, customer data, order data, payment data, or private screenshots.\n- Commit only sanitized documentation after explicit Drip/ChatGPT review.\n- Keep every unresolved or unverified field marked UNKNOWN.\n`;
}

function markdownList(items, empty = '- NONE') {
  if (items.length === 0) {
    return empty;
  }
  return items.map((item) => `- ${escapeMarkdown(item)}`).join('\n');
}

function manifestContent({
  generatedAt,
  draftedSummaries,
  sources,
  skipped,
  remainingUnknownRows,
  redactionWarnings
}) {
  const summaryRows = draftedSummaries.map((summary) => `| ${summary.categoryId} | ${escapeMarkdown(summary.summaryPath)} | ${summary.sourceCount} | ${summary.remainingUnknownCount} |`).join('\n');
  const sourceRows = sources.map((source) => `| ${source.id} | ${source.evidenceType} | ${source.confidence} | ${source.safePath} | ${source.redactedCopyUsed} |`).join('\n');
  const skippedRows = skipped.map((entry) => `| ${safeRelativePath(entry.filePath)} | ${escapeMarkdown(entry.reason)} |`).join('\n');
  const unknownRows = remainingUnknownRows.map((row) => `| ${row.categoryId} | ${escapeMarkdown(row.unknown)} | UNKNOWN |`).join('\n');
  const warningTableRows = redactionWarnings.length === 0
    ? '| NONE | HIGH | No redaction warnings parsed from scanner reports. |'
    : countsByPattern(redactionWarnings).map(([pattern, count]) => `| ${escapeMarkdown(pattern)} | HIGH | ${count} finding(s); values omitted. |`).join('\n');

  return `# Sanitized Evidence Summary Builder Manifest\n\n- Generated: ${generatedAt}\n- Evidence root: ${options.root}\n- Production impact: NONE\n- Phase 3 started: NO\n- External API calls: NO\n- Live credentials used: NO\n- Cookies used: NO\n- Admin consoles accessed: NO\n- Live systems pulled: NO\n- Raw private evidence committed: NO\n- Automatic promotion into repo docs: NO\n\n## Summaries Drafted\n\n| Category | Summary path | Source count | Remaining UNKNOWN count |\n| --- | --- | ---: | ---: |\n${summaryRows || '| NONE |  |  |  |'}\n\n## Source Files Used\n\n| Source ID | Evidence type | Confidence | Safe local path used | Redacted copy used |\n| --- | --- | --- | --- | --- |\n${sourceRows || '| NONE | UNKNOWN | UNKNOWN | NONE | NO |'}\n\n## Skipped Files\n\n| Safe local path | Reason |\n| --- | --- |\n${skippedRows || '| NONE |  |'}\n\n## Remaining UNKNOWNs\n\n| Category | Field | Status |\n| --- | --- | --- |\n${unknownRows || '| NONE |  |  |'}\n\n## Redaction Warnings\n\n| Pattern | Confidence | Notes |\n| --- | --- | --- |\n${warningTableRows}\n\n## Required Next Steps\n\n1. Review every drafted sanitized summary manually.\n2. Review redaction reports and redacted copies before sharing summaries.\n3. Keep raw evidence outside the repo.\n4. Keep unresolved fields marked UNKNOWN.\n5. Do not promote findings into repo docs until Drip/ChatGPT review.\n6. Do not start Phase 3 from this manifest.\n`;
}

const skippedFiles = [];
const sourceRoots = SOURCE_FOLDERS.map((folder) => path.join(options.root, folder));
const allFiles = sourceRoots.flatMap((sourceRoot) => walkFiles(sourceRoot, [], skippedFiles));
const redactionReportFiles = allFiles.filter((filePath) => path.basename(filePath).startsWith('redaction-report-'));
const latestStatusReport = latestFile(allFiles, 'private-evidence-status-');
const latestImportManifest = latestFile(allFiles, 'private-evidence-import-');
const publicCollectionManifests = allFiles.filter((filePath) => path.basename(filePath).includes('public-evidence-collection-manifest'));

if (!latestStatusReport) {
  skippedFiles.push({ filePath: path.join(options.root, 'manifests'), reason: 'No private evidence status report found.' });
}
if (!latestImportManifest) {
  skippedFiles.push({ filePath: path.join(options.root, 'manifests'), reason: 'No private evidence import manifest found.' });
}
if (publicCollectionManifests.length === 0) {
  skippedFiles.push({ filePath: options.root, reason: 'No public evidence collection manifest found.' });
}

const { findingsByFile, warningRows: parsedWarnings } = parseRedactionReports(redactionReportFiles);
const sources = createSourceRecords(allFiles, findingsByFile, skippedFiles);
const generatedAt = new Date().toISOString();
const fileStamp = timestampForFile(new Date(generatedAt));
const draftedSummaries = [];
const remainingUnknownRows = [];

for (const category of EVIDENCE_CATEGORIES) {
  const categorySources = sources.filter((source) => categoryMatches(source, category));
  const content = summaryContent(category, categorySources, generatedAt);
  const summaryPath = path.join(options.root, 'sanitized-summaries', `${category.id}-summary.md`);
  writeTextFile(summaryPath, content, { force: true });
  const unknowns = remainingUnknowns(category, categorySources, uniqueWarnings(categorySources));
  for (const unknown of unknowns) {
    remainingUnknownRows.push({ categoryId: category.id, unknown });
  }
  draftedSummaries.push({
    categoryId: category.id,
    summaryPath: path.relative(options.root, summaryPath),
    sourceCount: categorySources.length,
    remainingUnknownCount: unknowns.length
  });
}

const manifestPath = path.join(options.root, 'manifests', `sanitized-summary-builder-${fileStamp}.md`);
writeTextFile(manifestPath, manifestContent({
  generatedAt,
  draftedSummaries,
  sources,
  skipped: skippedFiles,
  remainingUnknownRows,
  redactionWarnings: parsedWarnings
}), { force: true });

const unknownCount = remainingUnknownRows.length;
const redactionWarningCount = parsedWarnings.length;

console.log(`Sanitized evidence summaries drafted: ${path.join(options.root, 'sanitized-summaries')}`);
console.log(`Summaries drafted: ${draftedSummaries.length}`);
console.log(`Summary-builder manifest written: ${manifestPath}`);
console.log(`Source files used: ${sources.length}`);
console.log(`Skipped files: ${skippedFiles.length}`);
console.log(`Remaining UNKNOWNs: ${unknownCount}`);
console.log(`Redaction warnings: ${redactionWarningCount}`);
console.log('Production impact: NONE');
console.log('Phase 3 started: NO');
