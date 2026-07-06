import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const DEFAULT_PRIVATE_EVIDENCE_DIR = '~/Documents/Drip/private-evidence';

export const REQUIRED_FOLDERS = [
  'inbox',
  'squarespace',
  'dns-registrar',
  'apps-script',
  'sheets',
  'analytics-search-console',
  'commerce',
  'upload-service',
  'screencloud',
  'active-routes',
  'sanitized-summaries',
  'redaction-reports',
  'manifests',
  'review-needed'
];

export const EVIDENCE_DESTINATION_FOLDERS = [
  'squarespace',
  'dns-registrar',
  'apps-script',
  'sheets',
  'analytics-search-console',
  'commerce',
  'upload-service',
  'screencloud',
  'active-routes'
];

export const TEXT_SNIFF_EXTENSIONS = [
  '.csv',
  '.json',
  '.jsonl',
  '.log',
  '.md',
  '.txt',
  '.tsv',
  '.xml',
  '.yaml',
  '.yml',
  '.html',
  '.htm',
  '.js',
  '.css'
];

export const EVIDENCE_CATEGORIES = [
  { id: 'squarespace-pages', title: 'Squarespace pages and page settings', folder: 'squarespace', blocksRetirement: 'YES', blocksPhase3: 'NO unless pages contain dataset intake dependencies' },
  { id: 'squarespace-forms', title: 'Squarespace forms, fields, destinations, notifications, storage, spam settings', folder: 'squarespace', blocksRetirement: 'YES', blocksPhase3: 'MAYBE if form outputs feed datasets or market-intelligence inputs' },
  { id: 'squarespace-code-injection', title: 'Squarespace custom code/header/footer/page injection', folder: 'squarespace', blocksRetirement: 'YES', blocksPhase3: 'MAYBE if scripts feed datasets or automation' },
  { id: 'squarespace-redirects', title: 'Squarespace redirects/URL mappings', folder: 'squarespace', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'squarespace-assets', title: 'Squarespace assets/downloads/files/media', folder: 'squarespace', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'squarespace-commerce', title: 'Squarespace commerce/products/orders/payment settings', folder: 'commerce', blocksRetirement: 'YES if store or cart remains needed', blocksPhase3: 'NO' },
  { id: 'domain-registrar', title: 'Domain registrar ownership', folder: 'dns-registrar', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'dns-zone', title: 'DNS zone export', folder: 'dns-registrar', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'google-analytics', title: 'Google Analytics', folder: 'analytics-search-console', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'google-search-console', title: 'Google Search Console', folder: 'analytics-search-console', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'apps-script-deployments', title: 'Apps Script deployments/source/version mapping', folder: 'apps-script', blocksRetirement: 'YES', blocksPhase3: 'MAYBE if Phase 3 needs legacy dataset/source parity' },
  { id: 'apps-script-modes', title: 'Apps Script modes called by website pages', folder: 'apps-script', blocksRetirement: 'YES', blocksPhase3: 'MAYBE if modes produce dataset inputs' },
  { id: 'google-sheets-destinations', title: 'Google Sheets destinations used by forms/custom modes', folder: 'sheets', blocksRetirement: 'YES', blocksPhase3: 'YES if Sheets feed dataset ingestion or market intelligence' },
  { id: 'upload-service', title: 'upload.driphealthcare.com backend/storage/auth/moderation/retention', folder: 'upload-service', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'screencloud-references', title: 'ScreenCloud references', folder: 'screencloud', blocksRetirement: 'YES', blocksPhase3: 'NO' },
  { id: 'active-routes', title: 'active QR/campaign/conference routes', folder: 'active-routes', blocksRetirement: 'YES', blocksPhase3: 'MAYBE if routes feed dataset or market signals' }
];

const FOLDER_PURPOSES = {
  'inbox': 'Drop downloaded exports, screenshots, PDFs, CSVs, TXT files, markdown files, JSON files, and notes here before local import.',
  'squarespace': 'Read-only Squarespace page, form, code injection, redirect, asset, and related export evidence.',
  'dns-registrar': 'Registrar ownership evidence and DNS zone exports with exact values stored privately.',
  'apps-script': 'Read-only Apps Script deployment, source/version, mode, trigger, and route mapping evidence.',
  'sheets': 'Read-only Google Sheets destination maps, tab schemas, and downstream dependency notes.',
  'analytics-search-console': 'Google Analytics and Search Console aggregate route, sitemap, indexing, and ownership evidence.',
  'commerce': 'Squarespace commerce, product, checkout, order-retention, and payment settings evidence.',
  'upload-service': 'upload.driphealthcare.com ownership, storage, auth, moderation, retention, and rollback evidence.',
  'screencloud': 'ScreenCloud references embedded in public pages and display-provider dependency evidence.',
  'active-routes': 'Active QR, campaign, conference, provider, advertiser, and showcase route evidence.',
  'sanitized-summaries': 'Blank and reviewed sanitized summaries that may later inform repo docs after redaction review.',
  'redaction-reports': 'Non-destructive scanner reports and optional safe redacted copies generated from private evidence.',
  'manifests': 'Evidence manifests, redaction checklists, owner maps, import manifests, status reports, and export-tracking templates.',
  'review-needed': 'Files that the inbox importer could not classify confidently enough for a destination evidence folder.'
};

export function getRepoRoot() {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
}

export function expandHome(inputPath) {
  if (!inputPath || inputPath === '~') {
    return os.homedir();
  }
  if (inputPath.startsWith('~/')) {
    return path.join(os.homedir(), inputPath.slice(2));
  }
  return inputPath;
}

export function parseArgs(argv = process.argv.slice(2)) {
  const options = {
    root: process.env.DRIP_PRIVATE_EVIDENCE_DIR || DEFAULT_PRIVATE_EVIDENCE_DIR,
    force: false,
    safeRedact: false
  };

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (arg === '--root') {
      options.root = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--root=')) {
      options.root = arg.slice('--root='.length);
    } else if (arg === '--force') {
      options.force = true;
    } else if (arg === '--safe-redact') {
      options.safeRedact = true;
    } else if (arg === '--move') {
      options.move = true;
    } else if (arg === '--folder') {
      options.folder = argv[index + 1];
      index += 1;
    } else if (arg.startsWith('--folder=')) {
      options.folder = arg.slice('--folder='.length);
    } else if (arg === '--help' || arg === '-h') {
      options.help = true;
    }
  }

  options.root = path.resolve(expandHome(options.root));
  return options;
}

export function isPathInside(childPath, parentPath) {
  const relative = path.relative(parentPath, childPath);
  return relative === '' || (relative && !relative.startsWith('..') && !path.isAbsolute(relative));
}

export function assertPrivateRootOutsideRepo(privateRoot) {
  const repoRoot = getRepoRoot();
  if (isPathInside(privateRoot, repoRoot)) {
    throw new Error(`Refusing to use a private evidence folder inside the repo: ${privateRoot}`);
  }
}

export function ensurePrivateEvidenceFolders(privateRoot) {
  assertPrivateRootOutsideRepo(privateRoot);
  fs.mkdirSync(privateRoot, { recursive: true });
  for (const folder of REQUIRED_FOLDERS) {
    fs.mkdirSync(path.join(privateRoot, folder), { recursive: true });
  }
}

export function writeTextFile(filePath, content, { force = false } = {}) {
  if (!force && fs.existsSync(filePath)) {
    return false;
  }
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, content, 'utf8');
  return true;
}

export function folderReadme(folder) {
  const purpose = FOLDER_PURPOSES[folder] || 'Private export evidence.';
  return `# ${folder}\n\n${purpose}\n\nKeep raw exports in this private folder only. Do not commit raw evidence, secrets, tokens, form responses, customer data, order data, payment data, private DNS tokens, Apps Script deployment tokens, or live credentials to Git.\n\nUse sanitized summaries only after redaction review. Any unverified field must remain UNKNOWN.\n`;
}

export function rootReadme() {
  return `# Drip Private Evidence\n\nThis folder is local-only and intentionally outside the GitHub repository.\n\nUse it to collect private export evidence for Squarespace retirement and website migration planning. Do not place this folder inside the repo. Do not commit raw exports, secrets, tokens, form responses, customer data, order data, payment data, private DNS tokens, Apps Script deployment tokens, or live credentials.\n\nDefault categories:\n\n${REQUIRED_FOLDERS.map((folder) => `- ${folder}`).join('\n')}\n\nOnly sanitized summaries should be considered for repo documentation after redaction review. Keep unverified fields marked UNKNOWN.\n`;
}

export function summaryTemplate(category) {
  return `# ${category.title} Sanitized Summary\n\n## Evidence Boundary\n\n- Source folder: ${category.folder}\n- Raw private evidence location: outside repo\n- Raw evidence committed to Git: NO\n- Redaction review complete: UNKNOWN\n- Verified by evidence: UNKNOWN\n\n## Source Evidence\n\n| Field | Value |\n| --- | --- |\n| Export owner | UNKNOWN |\n| Export date | UNKNOWN |\n| Source system | UNKNOWN |\n| Source file names | UNKNOWN |\n| Sensitive data present in raw export | UNKNOWN |\n| Redaction report path | UNKNOWN |\n\n## Sanitized Findings\n\n| Finding | Status | Notes |\n| --- | --- | --- |\n| Verified dependency exists | UNKNOWN | Keep UNKNOWN until confirmed by private evidence. |\n| Blocks Squarespace retirement | ${category.blocksRetirement} | Confirm with Drip/ChatGPT review. |\n| Blocks Phase 3 | ${category.blocksPhase3} | Confirm with Drip/ChatGPT review. |\n| Rollback relevance | UNKNOWN | Document only after evidence review. |\n\n## Migration Notes\n\n- UNKNOWN\n\n## Redaction Checklist\n\n- [ ] No secrets or private tokens included.\n- [ ] No form responses, customer data, order data, or payment data included.\n- [ ] No Apps Script deployment tokens included.\n- [ ] No private DNS verification values included unless explicitly approved as safe.\n- [ ] Raw export remains outside the repo.\n`;
}

export function manifestTemplate() {
  return `# Evidence Manifest Template\n\nRaw exports stay outside the repo. Commit only sanitized findings after review.\n\n| Category | Owner | Source system | Export date | Raw file path outside repo | Sensitive data present | Redaction report | Sanitized summary | Verified status | Blocks Squarespace retirement | Blocks Phase 3 | Rollback relevance |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |\n${EVIDENCE_CATEGORIES.map((category) => `| ${category.title} | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | sanitized-summaries/${category.id}-summary.md | UNKNOWN | ${category.blocksRetirement} | ${category.blocksPhase3} | UNKNOWN |`).join('\n')}\n`;
}

export function redactionChecklist() {
  return `# Redaction Checklist\n\nUse this checklist before any sanitized summary informs repo documentation.\n\n- [ ] Raw export is stored outside the GitHub repo.\n- [ ] No live credentials are present in the summary.\n- [ ] API keys, OAuth tokens, bearer tokens, webhook secrets, cookies, session values, and private keys are removed.\n- [ ] Stripe keys, payment IDs, order IDs, customer IDs, and customer details are removed or aggregated.\n- [ ] Apps Script deployment URLs and deployment tokens are redacted.\n- [ ] Google API keys and DNS verification values are redacted unless explicitly approved as safe.\n- [ ] Email addresses and phone numbers are removed unless strictly required and approved.\n- [ ] Signed URLs and private file URLs are removed.\n- [ ] All unverified fields remain UNKNOWN.\n- [ ] Drip and ChatGPT review is required before migration decisions or Phase 3 work.\n`;
}

export function printHelp(commandName) {
  console.log(`${commandName}\n\nOptions:\n  --root <path>       Private evidence root. Default: ${DEFAULT_PRIVATE_EVIDENCE_DIR}\n  --force             Overwrite generated templates/readmes.\n  --move              Importer only: remove inbox original after a successful copy.\n  --folder <name>     Folder opener only: open a specific private evidence subfolder.\n  --safe-redact       Scanner only: write redacted copies under redaction-reports/redacted-copies.\n  --dry-run           Public collector only: skip public fetches and DNS/RDAP lookups.\n  --base-url <url>    Public collector only: base public site URL. Default: https://driphealthcare.com.\n  --domain <domain>   Public collector only: DNS/RDAP domain. Default: driphealthcare.com.\n`);
}
