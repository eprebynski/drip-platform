#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  EVIDENCE_CATEGORIES,
  EVIDENCE_DESTINATION_FOLDERS,
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('generate-private-evidence-status-report');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    if (entry.isDirectory()) {
      walkFiles(fullPath, files);
    } else if (entry.isFile() && entry.name !== 'README.md') {
      files.push(fullPath);
    }
  }
  return files;
}

function relativeList(files) {
  if (files.length === 0) {
    return '- NONE';
  }
  return files.map((filePath) => `- ${path.relative(options.root, filePath)}`).join('\n');
}

function latestFile(dirPath, prefix) {
  const files = walkFiles(dirPath).filter((filePath) => path.basename(filePath).startsWith(prefix));
  if (files.length === 0) {
    return 'NONE';
  }
  files.sort((a, b) => fs.statSync(b).mtimeMs - fs.statSync(a).mtimeMs);
  return files[0];
}

function hasFilesNewerThan(files, referencePath) {
  if (referencePath === 'NONE') {
    return files.length > 0;
  }
  const referenceTime = fs.statSync(referencePath).mtimeMs;
  return files.some((filePath) => fs.statSync(filePath).mtimeMs > referenceTime);
}

function summaryUnknownCategories() {
  return EVIDENCE_CATEGORIES.filter((category) => {
    const summaryPath = path.join(options.root, 'sanitized-summaries', `${category.id}-summary.md`);
    if (!fs.existsSync(summaryPath)) {
      return true;
    }
    return fs.readFileSync(summaryPath, 'utf8').includes('UNKNOWN');
  });
}

const inboxFiles = walkFiles(path.join(options.root, 'inbox'));
const reviewFiles = walkFiles(path.join(options.root, 'review-needed'));
const categoryFiles = EVIDENCE_DESTINATION_FOLDERS.map((folder) => ({
  folder,
  files: walkFiles(path.join(options.root, folder))
}));
const missingCategories = categoryFiles.filter((entry) => entry.files.length === 0);
const unknownSummaries = summaryUnknownCategories();
const latestRedactionReport = latestFile(path.join(options.root, 'redaction-reports'), 'redaction-report-');
const latestImportManifest = latestFile(path.join(options.root, 'manifests'), 'private-evidence-import-');
const reportDate = new Date().toISOString();
const reportStamp = reportDate.replace(/[-:]/g, '').replace(/\..+$/, 'Z');

const inboxHasUnimportedChanges = hasFilesNewerThan(inboxFiles, latestImportManifest);

let recommendedCommand = 'npm run evidence:scan';
if (inboxHasUnimportedChanges) {
  recommendedCommand = 'npm run evidence:import';
} else if (reviewFiles.length > 0) {
  recommendedCommand = 'Review files in review-needed, then run npm run evidence:scan';
} else if (latestRedactionReport === 'NONE') {
  recommendedCommand = 'npm run evidence:scan';
} else if (unknownSummaries.length > 0) {
  recommendedCommand = 'Fill sanitized summaries only after redaction review';
}

const categoryRows = categoryFiles.map((entry) => `| ${entry.folder} | ${entry.files.length} |`).join('\n');
const report = `# Private Evidence Status Report\n\n- Generated: ${reportDate}\n- Evidence root: ${options.root}\n- Production systems changed: NO\n- External APIs called: NO\n- Live credentials used: NO\n- Latest import manifest: ${latestImportManifest === 'NONE' ? 'NONE' : latestImportManifest}\n- Latest redaction report: ${latestRedactionReport === 'NONE' ? 'NONE' : latestRedactionReport}\n- Recommended next local command: ${recommendedCommand}\n\n## Inbox Files\n\n${relativeList(inboxFiles)}\n\n## Imported Files By Category\n\n| Category | File count |\n| --- | ---: |\n${categoryRows}\n\n## Files Needing Review\n\n${relativeList(reviewFiles)}\n\n## Categories With No Evidence Yet\n\n${missingCategories.length > 0 ? missingCategories.map((entry) => `- ${entry.folder}`).join('\n') : '- NONE'}\n\n## Sanitized Summary Stubs Still Marked UNKNOWN\n\n${unknownSummaries.length > 0 ? unknownSummaries.map((category) => `- ${category.id}: ${category.title}`).join('\n') : '- NONE'}\n\n## Next Steps\n\n1. Run npm run evidence:import if inbox files remain.\n2. Run npm run evidence:scan before using any imported evidence.\n3. Review the redaction report.\n4. Fill sanitized summaries only.\n5. Keep raw files outside the repo.\n6. Keep UNKNOWN fields until verified.\n7. Do not start Phase 3 from this status report.\n`;

const reportPath = path.join(options.root, 'manifests', `private-evidence-status-${reportStamp}.md`);
writeTextFile(reportPath, report, { force: true });

console.log(`Private evidence status report written: ${reportPath}`);
console.log(`Inbox files: ${inboxFiles.length}`);
console.log(`Files needing review: ${reviewFiles.length}`);
console.log(`Categories with no evidence yet: ${missingCategories.length}`);
console.log(`UNKNOWN summary stubs: ${unknownSummaries.length}`);
console.log(`Recommended next local command: ${recommendedCommand}`);
