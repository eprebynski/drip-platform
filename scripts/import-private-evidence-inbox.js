#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {
  EVIDENCE_CATEGORIES,
  EVIDENCE_DESTINATION_FOLDERS,
  TEXT_SNIFF_EXTENSIONS,
  ensurePrivateEvidenceFolders,
  isIgnoredEvidenceName,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('import-private-evidence-inbox');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const CLASSIFICATION_RULES = [
  {
    folder: 'dns-registrar',
    terms: ['dns', 'zone', 'registrar', 'domain', 'nameserver', 'name server', 'mx', 'txt', 'spf', 'dkim', 'dmarc', 'cname', 'a-record', 'ttl', 'squarespace domains']
  },
  {
    folder: 'squarespace',
    terms: ['squarespace', 'page list', 'pages', 'navigation', 'form', 'forms', 'code injection', 'header', 'footer', 'redirect', 'url mapping', 'asset', 'media library', 'seo', 'site styles']
  },
  {
    folder: 'apps-script',
    terms: ['apps script', 'appsscript', 'gas', 'doget', 'dopost', 'deployment', 'trigger', 'web app', 'script.google.com', 'mode=', 'script properties', 'AK' + 'fy']
  },
  {
    folder: 'sheets',
    terms: ['google sheets', 'spreadsheet', 'tab', 'worksheet', 'column headers', 'sheet schema', 'form destination', 'sheet id']
  },
  {
    folder: 'analytics-search-console',
    terms: ['analytics', 'ga4', 'measurement id', 'search console', 'gsc', 'sitemap', 'indexing', 'pages and screens', 'landing page', 'traffic']
  },
  {
    folder: 'commerce',
    terms: ['commerce', 'store', 'cart', 'checkout', 'product', 'order', 'payment', 'tax', 'shipping', 'stripe']
  },
  {
    folder: 'upload-service',
    terms: ['upload.driphealthcare.com', 'upload', 'bucket', 'storage', 'file type', 'moderation', 'retention']
  },
  {
    folder: 'screencloud',
    terms: ['screencloud', 'screen cloud', 'channel', 'playlist', 'screen id', 'proof of play', 'display']
  },
  {
    folder: 'active-routes',
    terms: ['qr', 'campaign', 'conference', 'route', 'redirect', 'landing url', 'showcase', 'provider media center', 'advertisers', 'vendors']
  }
];

const SNIFF_BYTE_LIMIT = 64 * 1024;

function normalize(text) {
  return text.toLowerCase().replace(/[_-]+/g, ' ');
}

function escapeMarkdown(value) {
  return String(value).replace(/\|/g, '\\|').replace(/\n/g, ' ');
}

function timestampForFile(date = new Date()) {
  return date.toISOString().replace(/[-:]/g, '').replace(/\..+$/, 'Z');
}

function isTextSniffable(filePath) {
  return TEXT_SNIFF_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function readTextSnippet(filePath) {
  if (!isTextSniffable(filePath)) {
    return '';
  }
  const fileHandle = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(SNIFF_BYTE_LIMIT);
    const bytesRead = fs.readSync(fileHandle, buffer, 0, SNIFF_BYTE_LIMIT, 0);
    return buffer.subarray(0, bytesRead).toString('utf8');
  } finally {
    fs.closeSync(fileHandle);
  }
}

function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (isIgnoredEvidenceName(entry.name)) {
      continue;
    }
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (chunk) => hash.update(chunk));
    stream.on('error', reject);
    stream.on('end', () => resolve(hash.digest('hex')));
  });
}

async function buildDuplicateIndex(privateRoot) {
  const duplicateIndex = new Map();
  const foldersToCheck = [...EVIDENCE_DESTINATION_FOLDERS, 'review-needed'];
  for (const folder of foldersToCheck) {
    const folderPath = path.join(privateRoot, folder);
    for (const filePath of walkFiles(folderPath)) {
      const fileHash = await hashFile(filePath);
      if (!duplicateIndex.has(fileHash)) {
        duplicateIndex.set(fileHash, filePath);
      }
    }
  }
  return duplicateIndex;
}

function countMatches(source, terms) {
  return terms.filter((term) => source.includes(term)).length;
}

function classifyFile(filePath) {
  const fileNameSource = normalize(path.parse(filePath).name);
  const textSource = normalize(readTextSnippet(filePath));
  const scores = CLASSIFICATION_RULES.map((rule) => {
    const filenameMatches = countMatches(fileNameSource, rule.terms);
    const contentMatches = countMatches(textSource, rule.terms);
    return {
      folder: rule.folder,
      filenameMatches,
      contentMatches,
      score: filenameMatches * 2 + contentMatches
    };
  }).sort((a, b) => b.score - a.score);

  const top = scores[0];
  const runnerUp = scores[1];
  if (!top || top.score === 0) {
    return {
      detectedCategory: 'UNKNOWN',
      confidence: 'UNKNOWN',
      targetFolder: 'review-needed',
      reason: 'No reliable filename or text-snippet match.'
    };
  }

  if (runnerUp && runnerUp.score > 0 && runnerUp.score >= top.score - 1) {
    return {
      detectedCategory: top.folder,
      confidence: 'LOW',
      targetFolder: 'review-needed',
      reason: `Multiple categories matched closely: ${top.folder} (${top.score}) and ${runnerUp.folder} (${runnerUp.score}).`
    };
  }

  if (top.filenameMatches > 0 && top.contentMatches > 0) {
    return {
      detectedCategory: top.folder,
      confidence: 'HIGH',
      targetFolder: top.folder,
      reason: `Filename and text snippet both matched ${top.folder}.`
    };
  }

  if (top.score >= 2) {
    const source = top.filenameMatches > 0 ? 'filename' : 'text snippet';
    return {
      detectedCategory: top.folder,
      confidence: 'MEDIUM',
      targetFolder: top.folder,
      reason: `${source} strongly matched ${top.folder}.`
    };
  }

  return {
    detectedCategory: top.folder,
    confidence: 'LOW',
    targetFolder: 'review-needed',
    reason: `Only a weak match was found for ${top.folder}.`
  };
}

function safeFileName(fileName) {
  return fileName.replace(/[^A-Za-z0-9._-]+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

function uniqueDestinationPath(folderPath, fileName) {
  let candidate = path.join(folderPath, fileName);
  if (!fs.existsSync(candidate)) {
    return candidate;
  }

  const extension = path.extname(fileName);
  const baseName = fileName.slice(0, fileName.length - extension.length);
  let counter = 2;
  while (fs.existsSync(candidate)) {
    candidate = path.join(folderPath, `${baseName}-${counter}${extension}`);
    counter += 1;
  }
  return candidate;
}

function relatedSummaryUnknown(privateRoot, folder) {
  if (folder === 'review-needed') {
    return 'YES';
  }
  const relatedCategories = EVIDENCE_CATEGORIES.filter((category) => category.folder === folder);
  if (relatedCategories.length === 0) {
    return 'YES';
  }
  for (const category of relatedCategories) {
    const summaryPath = path.join(privateRoot, 'sanitized-summaries', `${category.id}-summary.md`);
    if (!fs.existsSync(summaryPath)) {
      return 'YES';
    }
    const summary = fs.readFileSync(summaryPath, 'utf8');
    if (summary.includes('UNKNOWN')) {
      return 'YES';
    }
  }
  return 'NO';
}

function importManifest(rows, importDate, inboxPath, moveMode) {
  const tableRows = rows.map((row) => [
    row.importDate,
    row.originalPath,
    row.copiedPath,
    row.detectedCategory,
    row.confidence,
    row.reason,
    row.fileHash,
    row.action,
    row.scanBeforeUse,
    row.categoryRemainsUnknown,
    row.inboxOriginalKept
  ].map(escapeMarkdown));

  return `# Private Evidence Inbox Import Manifest\n\n- Import date: ${importDate}\n- Inbox path: ${inboxPath}\n- Import mode: ${moveMode ? 'MOVE requested for successfully copied files' : 'COPY only'}\n- Production systems changed: NO\n- External APIs called: NO\n- Live credentials used: NO\n- Raw files redacted or modified: NO\n\n## Imported Files\n\n| Import date | Original file path | Copied file path | Detected category | Confidence | Reason | File hash | Action | Scan before use | Evidence category remains UNKNOWN | Inbox original kept |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${tableRows.length > 0 ? tableRows.map((row) => `| ${row.join(' | ')} |`).join('\n') : '| NONE |  |  |  |  |  |  |  |  |  |  |'}\n\n## Required Next Steps\n\n1. Run npm run evidence:scan.\n2. Review the private redaction report.\n3. Fill sanitized summaries only after redaction review.\n4. Keep raw exports outside the repo.\n5. Keep UNKNOWN fields until verified.\n6. Do not start Phase 3 from this import alone.\n`;
}

async function main() {
  const privateRoot = options.root;
  const inboxPath = path.join(privateRoot, 'inbox');
  const manifestDir = path.join(privateRoot, 'manifests');
  const importDate = new Date().toISOString();
  const filePrefix = timestampForFile();
  const duplicateIndex = await buildDuplicateIndex(privateRoot);
  const inboxFiles = walkFiles(inboxPath).filter((filePath) => path.basename(filePath) !== 'README.md');
  const manifestRows = [];

  for (const filePath of inboxFiles) {
    const fileHash = await hashFile(filePath);
    const classification = classifyFile(filePath);
    const existingPath = duplicateIndex.get(fileHash);
    let copiedPath = existingPath || '';
    let action = 'SKIPPED_DUPLICATE';
    let inboxOriginalKept = 'YES';

    if (!existingPath) {
      const targetFolder = classification.targetFolder;
      const targetDir = path.join(privateRoot, targetFolder);
      const prefixCategory = classification.targetFolder === 'review-needed'
        ? `review-needed-${classification.detectedCategory.toLowerCase()}`
        : classification.detectedCategory.toLowerCase();
      const copiedFileName = `${filePrefix}-${prefixCategory}-${safeFileName(path.basename(filePath))}`;
      copiedPath = uniqueDestinationPath(targetDir, copiedFileName);
      fs.copyFileSync(filePath, copiedPath);
      duplicateIndex.set(fileHash, copiedPath);
      action = classification.targetFolder === 'review-needed' ? 'SENT_TO_REVIEW_NEEDED' : 'COPIED';

      if (options.move) {
        fs.unlinkSync(filePath);
        inboxOriginalKept = 'NO';
      }
    }

    manifestRows.push({
      importDate,
      originalPath: filePath,
      copiedPath,
      detectedCategory: classification.detectedCategory,
      confidence: classification.confidence,
      reason: classification.reason,
      fileHash,
      action,
      scanBeforeUse: 'YES',
      categoryRemainsUnknown: relatedSummaryUnknown(privateRoot, classification.targetFolder),
      inboxOriginalKept
    });
  }

  const manifestPath = path.join(manifestDir, `private-evidence-import-${filePrefix}.md`);
  writeTextFile(manifestPath, importManifest(manifestRows, importDate, inboxPath, Boolean(options.move)), { force: true });

  const copiedCount = manifestRows.filter((row) => row.action === 'COPIED').length;
  const reviewCount = manifestRows.filter((row) => row.action === 'SENT_TO_REVIEW_NEEDED').length;
  const duplicateCount = manifestRows.filter((row) => row.action === 'SKIPPED_DUPLICATE').length;

  console.log(`Import manifest written: ${manifestPath}`);
  console.log(`Inbox files processed: ${manifestRows.length}`);
  console.log(`Copied to evidence folders: ${copiedCount}`);
  console.log(`Sent to review-needed: ${reviewCount}`);
  console.log(`Skipped as duplicates: ${duplicateCount}`);
  console.log('');
  console.log('Next steps:');
  console.log('1. Run npm run evidence:scan');
  console.log('2. Review the redaction report');
  console.log('3. Fill sanitized summaries only');
  console.log('4. Keep raw exports outside repo');
  console.log('5. Keep UNKNOWN fields until verified');
}

main().catch((error) => {
  console.error(`Error: ${error.message}`);
  process.exit(1);
});
