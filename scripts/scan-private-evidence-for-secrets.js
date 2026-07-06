#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import {
  ensurePrivateEvidenceFolders,
  parseArgs,
  printHelp,
  writeTextFile
} from './private-evidence-kit-common.js';

const options = parseArgs();

if (options.help) {
  printHelp('scan-private-evidence-for-secrets');
  process.exit(0);
}

try {
  ensurePrivateEvidenceFolders(options.root);
} catch (error) {
  console.error(`Error: ${error.message}`);
  process.exit(1);
}

const SENSITIVE_PATTERNS = [
  { name: 'Private key', regex: /-----BEGIN [A-Z ]*PRIVATE KEY-----/g, replacement: '[REDACTED_PRIVATE_KEY]' },
  { name: 'Stripe key', regex: /\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b/g, replacement: '[REDACTED_STRIPE_KEY]' },
  { name: 'Webhook secret', regex: new RegExp('\\bwh' + 'sec_[A-Za-z0-9]{16,}\\b', 'g'), replacement: '[REDACTED_WEBHOOK_SECRET]' },
  { name: 'Google API key', regex: /\bAIza[0-9A-Za-z_-]{35}\b/g, replacement: '[REDACTED_GOOGLE_API_KEY]' },
  { name: 'Apps Script deployment URL/token', regex: /https:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\b/g, replacement: '[REDACTED_APPS_SCRIPT_URL]' },
  { name: 'Apps Script deployment token', regex: new RegExp('\\bAK' + 'fy[A-Za-z0-9_-]{20,}\\b', 'g'), replacement: '[REDACTED_APPS_SCRIPT_TOKEN]' },
  { name: 'Bearer token', regex: /\bBearer\s+[A-Za-z0-9._~+/=-]{12,}\b/gi, replacement: 'Bearer [REDACTED_TOKEN]' },
  { name: 'OAuth token', regex: /\bya29\.[0-9A-Za-z_-]+\b/g, replacement: '[REDACTED_OAUTH_TOKEN]' },
  { name: 'Generic API key assignment', regex: /\b(?:api[_-]?key|access[_-]?token|refresh[_-]?token|client[_-]?secret)\s*[:=]\s*["']?[^"'\s,;]{12,}/gi, replacement: '[REDACTED_KEY_ASSIGNMENT]' },
  { name: 'Cookie/session value', regex: /\b(?:cookie|sessionid|session[_-]?token|sid)\s*[:=]\s*["']?[^"'\s,;]{12,}/gi, replacement: '[REDACTED_COOKIE_OR_SESSION]' },
  { name: 'Email address', regex: /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, replacement: '[REDACTED_EMAIL]' },
  { name: 'Phone number', regex: /(?:\+?1[\s.-]?)?(?:\(?\d{3}\)?[\s.-]?)\d{3}[\s.-]?\d{4}\b/g, replacement: '[REDACTED_PHONE]' },
  { name: 'Payment/order/customer identifier', regex: /\b(?:cus|pi|ch|in|sub|ord|order|customer)_[A-Za-z0-9]{8,}\b/gi, replacement: '[REDACTED_PAYMENT_OR_CUSTOMER_ID]' },
  { name: 'DNS verification value', regex: /\b(?:google-site-verification|facebook-domain-verification|MS=ms|apple-domain-verification)[=:][A-Za-z0-9._-]{8,}\b/gi, replacement: '[REDACTED_DNS_VERIFICATION]' },
  { name: 'Signed URL', regex: /https?:\/\/[^\s"'<>]+(?:X-Goog-Signature|X-Amz-Signature|Signature=|sig=|token=)[^\s"'<>]*/gi, replacement: '[REDACTED_SIGNED_URL]' }
];

const TEXT_EXTENSIONS = new Set([
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
  '.js',
  '.css'
]);

function isTextFile(filePath) {
  const extension = path.extname(filePath).toLowerCase();
  return TEXT_EXTENSIONS.has(extension);
}

function walkFiles(dirPath, files = []) {
  if (!fs.existsSync(dirPath)) {
    return files;
  }
  for (const entry of fs.readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = path.join(dirPath, entry.name);
    const relative = path.relative(options.root, fullPath);
    if (entry.isDirectory()) {
      if (relative === 'redaction-reports') {
        continue;
      }
      walkFiles(fullPath, files);
    } else if (entry.isFile() && isTextFile(fullPath)) {
      files.push(fullPath);
    }
  }
  return files;
}

function maskValue(value) {
  const compact = value.replace(/\s+/g, ' ');
  if (compact.length <= 8) {
    return '[REDACTED]';
  }
  return `${compact.slice(0, 4)}...[${compact.length} chars]...${compact.slice(-3)}`;
}

function scanText(filePath, text) {
  const findings = [];
  const lines = text.split(/\r?\n/);
  for (let lineIndex = 0; lineIndex < lines.length; lineIndex += 1) {
    const line = lines[lineIndex];
    for (const pattern of SENSITIVE_PATTERNS) {
      pattern.regex.lastIndex = 0;
      let match;
      while ((match = pattern.regex.exec(line)) !== null) {
        findings.push({
          filePath,
          line: lineIndex + 1,
          pattern: pattern.name,
          masked: maskValue(match[0])
        });
      }
    }
  }
  return findings;
}

function redactText(text) {
  let redacted = text;
  for (const pattern of SENSITIVE_PATTERNS) {
    pattern.regex.lastIndex = 0;
    redacted = redacted.replace(pattern.regex, pattern.replacement);
  }
  return redacted;
}

const files = walkFiles(options.root);
const findings = [];

for (const filePath of files) {
  const text = fs.readFileSync(filePath, 'utf8');
  const fileFindings = scanText(filePath, text);
  findings.push(...fileFindings);

  if (options.safeRedact && fileFindings.length > 0) {
    const relative = path.relative(options.root, filePath);
    const redactedPath = path.join(options.root, 'redaction-reports', 'redacted-copies', relative);
    writeTextFile(redactedPath, redactText(text), { force: true });
  }
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const reportPath = path.join(options.root, 'redaction-reports', `redaction-report-${timestamp}.md`);
const rows = findings.map((finding) => {
  const relative = path.relative(options.root, finding.filePath);
  return `| ${relative} | ${finding.line} | ${finding.pattern} | ${finding.masked} |`;
});
const report = `# Redaction Report\n\n- Generated: ${new Date().toISOString()}\n- Evidence root: ${options.root}\n- Files scanned: ${files.length}\n- Findings: ${findings.length}\n- Destructive changes made: NO\n- Safe redacted copies written: ${options.safeRedact ? 'YES, under redaction-reports/redacted-copies' : 'NO'}\n\n## Findings\n\n| File | Line | Pattern | Masked value |\n| --- | ---: | --- | --- |\n${rows.length > 0 ? rows.join('\n') : '| NONE |  |  |  |'}\n\n## Recommendation\n\nReview all findings before using any sanitized summary in repo docs. Keep unverified fields UNKNOWN. Do not commit raw exports or this private report unless it is sanitized and explicitly approved.\n`;

writeTextFile(reportPath, report, { force: true });

console.log(`Redaction report written: ${reportPath}`);
console.log(`Files scanned: ${files.length}`);
console.log(`Findings: ${findings.length}`);

if (findings.length > 0) {
  process.exitCode = 2;
}
