import path from 'node:path';

export const APPS_SCRIPT_AUTO_REVIEW_REPORT_RELATIVE_PATH = path.join(
  'apps-script',
  'apps-script-dependency-auto-review-report.md'
);

export const APPS_SCRIPT_GATE_RESULTS = new Set([
  'PHASE_3_BLOCKED',
  'PHASE_3_CAN_PROCEED_WITH_EXCLUSIONS',
  'PHASE_3_READY_FOR_LIMITED_DRY_RUN',
  'UNKNOWN'
]);

export function scrubAppsScriptSensitiveValue(value) {
  return String(value || '')
    .replace(/https?:\/\/script\.google\.com\/macros\/s\/[A-Za-z0-9_-]+\/exec\b/gi, '[REDACTED_APPS_SCRIPT_URL]')
    .replace(/\bAKfy[A-Za-z0-9_-]{10,}\b/g, '[REDACTED_APPS_SCRIPT_ID]')
    .replace(/\b(?:sk|pk)_(?:live|test)_[A-Za-z0-9_-]+\b/gi, '[REDACTED_STRIPE_VALUE]')
    .replace(/\bAIza[A-Za-z0-9_-]{20,}\b/g, '[REDACTED_GOOGLE_API_KEY]')
    .replace(/\bBearer\s+[A-Za-z0-9._~+/-]+=*\b/gi, 'Bearer [REDACTED]')
    .replace(/\beyJ[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\b/g, '[REDACTED_TOKEN]')
    .replace(/-----BEGIN [A-Z ]+ PRIVATE KEY-----[\s\S]*?-----END [A-Z ]+ PRIVATE KEY-----/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/gi, '[REDACTED_EMAIL]')
    .replace(/\b(?:customer|payment|order|invoice|session|cookie|token|secret)[_-]?[A-Za-z0-9_-]{8,}\b/gi, '[REDACTED_SENSITIVE_ID]')
    .replace(/\b(?=[A-Za-z0-9_-]{25,}\b)(?=[A-Za-z0-9_-]*[A-Za-z])(?=[A-Za-z0-9_-]*\d)[A-Za-z0-9_-]+\b/g, '[REDACTED_HIGH_ENTROPY_VALUE]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ');
}

export function readGateResult(reportText) {
  const match = String(reportText || '').match(/^- Gate result:\s*([A-Z0-9_]+)\s*$/m);
  return match && APPS_SCRIPT_GATE_RESULTS.has(match[1]) ? match[1] : 'UNKNOWN';
}
