import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const approvedFixtureFiles = [
  "phase-gate-summary.mock.json",
  "workflow-registry.mock.json",
  "workflow-domains.mock.json",
  "owner-categories.mock.json",
  "status-lifecycle.mock.json",
  "strict-gate-profiles.mock.json",
  "legacy-workflow-matrix.mock.json",
  "future-platform-workflows.mock.json",
  "workflow-blockers.mock.json",
  "evidence-sources.mock.json",
  "manual-review-decisions.mock.json",
  "workflow-owners.mock.json",
  "rollback-requirements.mock.json",
  "admin-issues.mock.json",
  "prohibited-actions.mock.json",
  "external-system-boundaries.mock.json",
  "data-model-notes.mock.json",
  "dashboard-view-configs.mock.json"
];

const allowedNonFixtureFiles = new Set(["README.md"]);
const fixtureDirectory = path.resolve(__dirname, "../src/admin-v0/mock-data");

const unsafePatterns = [
  { label: "email address", pattern: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/iu },
  { label: "http URL", pattern: /https?:\/\//iu },
  { label: "credential-like key/value", pattern: /\b(api[_-]?key|access[_-]?token|auth[_-]?token|bearer|client[_-]?secret|credential|password|private[_-]?key|secret)\b/iu },
  { label: "private Sheet ID reference", pattern: /\b(spreadsheet[_-]?id|sheet[_-]?id|google[_-]?sheet[_-]?id)\b/iu },
  { label: "Google Sheet ID-like value", pattern: /\b1[A-Za-z0-9_-]{32,}\b/u },
  { label: "Stripe live or object ID-like value", pattern: /\b(sk_live|pk_live|acct|cus|pi|ch|in|sub|price|prod|pm|evt)_[A-Za-z0-9]{6,}\b/u },
  { label: "ScreenCloud ID reference", pattern: /\b(screencloud[_-]?id|screen[_-]?id)\b/iu },
  { label: "YouTube playlist/channel/video ID reference", pattern: /\b(youtube[_-]?(playlist|channel|video)[_-]?id|(playlist|channel|video)[_-]?id)\b/iu },
  { label: "YouTube playlist/channel ID-like value", pattern: /\b((PL|UU|UC)[A-Za-z0-9_-]{16,}|OLAK5uy_[A-Za-z0-9_-]{10,})\b/u },
  { label: "private URL-like value", pattern: /\b(private URL|signed URL|private endpoint|production endpoint)\b/iu },
  { label: "generated private evidence reference", pattern: /\bgenerated private evidence\b/iu },
  { label: "raw logs", pattern: /\b(raw logs?|stack trace|error dump)\b/iu },
  { label: "PHI or patient data indicator", pattern: /\b(PHI|patient data|patient record|patient_id|medical record|mrn|date of birth|dob|ssn)\b/iu }
];

const disallowedValues = [
  "APPROVED_FOR_PRODUCTION",
  "PRODUCTION_APPROVED",
  "DRY_RUN_APPROVED",
  "PHASE_3_STARTED",
  "LIVE_WRITE_ENABLED",
  "LIVE_READ_ENABLED",
  "DEPLOY_APPROVED",
  "BILLING_ENABLED",
  "EMAIL_SEND_ENABLED",
  "STRIPE_WRITE_ENABLED",
  "SCREENCLOUD_WRITE_ENABLED",
  "YOUTUBE_WRITE_ENABLED"
];

const requiredValues = [
  "PHASE_3_BLOCKED",
  "NOT_APPROVED",
  "BLOCKED_PROGRESSING",
  "NONE",
  "NO",
  "UNKNOWN",
  "PARTIAL",
  "PLANNING_ONLY",
  "EVIDENCE_NEEDED"
];

function addError(errors, file, message) {
  errors.push(file ? `${file}: ${message}` : message);
}

function collectJsonTerms(value, terms = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonTerms(item, terms);
    }
    return terms;
  }

  if (value && typeof value === "object") {
    for (const [key, item] of Object.entries(value)) {
      terms.push(String(key));
      collectJsonTerms(item, terms);
    }
    return terms;
  }

  if (value !== null && value !== undefined) {
    terms.push(String(value));
  }

  return terms;
}

function collectJsonValues(value, values = []) {
  if (Array.isArray(value)) {
    for (const item of value) {
      collectJsonValues(item, values);
    }
    return values;
  }

  if (value && typeof value === "object") {
    for (const item of Object.values(value)) {
      collectJsonValues(item, values);
    }
    return values;
  }

  if (value !== null && value !== undefined) {
    values.push(String(value));
  }

  return values;
}

function validateConservativeDefaults(file, item, errors) {
  if (!item || typeof item !== "object" || Array.isArray(item)) {
    return;
  }

  const exactDefaults = {
    dry_run_eligible: "NO",
    production_behavior_allowed: "NO",
    production_impact: "NONE",
    phase_3_started: "NO",
    raw_private_evidence_committed: "NO"
  };

  for (const [field, expected] of Object.entries(exactDefaults)) {
    if (field in item && item[field] !== expected) {
      addError(errors, file, `${field} must be ${expected} when present`);
    }
  }

  if (
    "phase_gate_status" in item &&
    /APPROVED|STARTED|COMPLETE|READY/i.test(String(item.phase_gate_status))
  ) {
    addError(errors, file, "phase_gate_status must not indicate approval");
  }

  if (
    "dry_run_status" in item &&
    String(item.dry_run_status) !== "NOT_APPROVED" &&
    /APPROVED|ENABLED|STARTED|READY/i.test(String(item.dry_run_status))
  ) {
    addError(errors, file, "dry_run_status must not indicate approval");
  }

  if ("safe_to_display" in item && !["YES", "NO"].includes(item.safe_to_display)) {
    addError(errors, file, "safe_to_display must be YES or NO when present");
  }
}

function validateFixtureContent(file, parsed, errors, seenSafeValues) {
  const terms = collectJsonTerms(parsed);
  const values = collectJsonValues(parsed);
  const haystack = terms.join("\n");

  for (const { label, pattern } of unsafePatterns) {
    if (pattern.test(haystack)) {
      addError(errors, file, `unsafe/private pattern found: ${label}`);
    }
  }

  for (const value of disallowedValues) {
    if (values.some((term) => term.toUpperCase().includes(value))) {
      addError(errors, file, `disallowed approval-like value found: ${value}`);
    }
  }

  for (const value of requiredValues) {
    if (values.includes(value)) {
      seenSafeValues.add(value);
    }
  }

  for (const item of parsed) {
    validateConservativeDefaults(file, item, errors);
  }
}

export function validateAdminV0MockFixtures(options = {}) {
  const mockDataDirectory = options.mockDataDirectory
    ? path.resolve(options.mockDataDirectory)
    : fixtureDirectory;
  const errors = [];
  const seenSafeValues = new Set();

  if (!fs.existsSync(mockDataDirectory)) {
    addError(errors, null, `mock fixture directory is missing: ${mockDataDirectory}`);
    return { ok: false, errors, filesValidated: 0 };
  }

  const directoryEntries = fs.readdirSync(mockDataDirectory, {
    withFileTypes: true
  });
  const files = directoryEntries
    .filter((entry) => entry.isFile())
    .map((entry) => entry.name)
    .sort();
  const fixtureFiles = files.filter((file) => file.endsWith(".mock.json"));
  const approvedSet = new Set(approvedFixtureFiles);

  for (const entry of directoryEntries) {
    if (!entry.isFile()) {
      addError(errors, entry.name, "unapproved non-file entry in mock-data directory");
    }
  }

  for (const file of approvedFixtureFiles) {
    if (!fixtureFiles.includes(file)) {
      addError(errors, file, "approved fixture file is missing");
    }
  }

  for (const file of fixtureFiles) {
    if (!approvedSet.has(file)) {
      addError(errors, file, "unapproved mock fixture file");
    }
  }

  for (const file of files) {
    if (!file.endsWith(".mock.json") && !allowedNonFixtureFiles.has(file)) {
      addError(errors, file, "unapproved file in mock-data directory");
    }
  }

  for (const file of fixtureFiles) {
    const filePath = path.join(mockDataDirectory, file);
    let parsed;

    try {
      parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));
    } catch (error) {
      addError(errors, file, `invalid JSON: ${error.message}`);
      continue;
    }

    if (!Array.isArray(parsed)) {
      addError(errors, file, "top-level JSON value must be an array");
      continue;
    }

    if (parsed.length === 0) {
      addError(errors, file, "fixture array must be non-empty");
      continue;
    }

    validateFixtureContent(file, parsed, errors, seenSafeValues);
  }

  for (const value of requiredValues) {
    if (!seenSafeValues.has(value)) {
      addError(errors, null, `required safe value is missing: ${value}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    filesValidated: fixtureFiles.length,
    mockDataDirectory
  };
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const result = validateAdminV0MockFixtures();

  if (!result.ok) {
    console.error("Admin Dashboard v0 mock fixture validation failed:");
    for (const error of result.errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(
    `Admin Dashboard v0 mock fixture validation passed for ${result.filesValidated} files.`
  );
}
