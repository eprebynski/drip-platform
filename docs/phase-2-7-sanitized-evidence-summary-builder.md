# Phase 2.7: Sanitized Evidence Summary Builder

## Scope

Phase 2.7 adds local-only private evidence review tooling for drafting sanitized summary files from evidence that Drip has already collected locally. It does not deploy, change DNS, modify Squarespace, modify Apps Script or triggers, write to live Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, create production resources, use live credentials, connect to private APIs, pull data from live systems, or start Phase 3 dataset ingestion.

Default private evidence root:

```text
~/Documents/Drip/private-evidence
```

The helper refuses to use a private evidence root inside this repository.

## Command

```text
npm run evidence:draft-summaries
```

Optional local test root:

```text
npm run evidence:draft-summaries -- --root /private/tmp/drip-test-evidence
```

## Behavior

The summary builder reads local private evidence only. It prefers redacted copies from `redaction-reports/redacted-copies/` when they exist, reads import manifests, public collection manifests, scanner reports, redaction reports, and status reports, then drafts or updates summaries under:

```text
~/Documents/Drip/private-evidence/sanitized-summaries
```

It also writes a summary-builder manifest under:

```text
~/Documents/Drip/private-evidence/manifests
```

The manifest records summaries drafted, source files used, skipped files, remaining `UNKNOWN` fields, redaction warnings, production impact `NONE`, and Phase 3 started `NO`.

## Summary Shape

Each drafted summary includes:

- Safe findings
- Still `UNKNOWN`
- Redaction concerns
- Migration implications
- Do not commit raw evidence

Every drafted finding is labeled as one of:

- `PUBLIC_EVIDENCE`
- `PRIVATE_EXPORT_SUMMARY`
- `REDACTION_REPORT`
- `MANIFEST_ONLY`
- `UNKNOWN`

Every drafted finding also includes confidence:

- `HIGH`
- `MEDIUM`
- `LOW`
- `UNKNOWN`

Unverified details remain `UNKNOWN` until Drip/ChatGPT review confirms them from sanitized evidence.

## Safety Rules

The builder must not copy raw secrets, tokens, private deployment IDs, personal data, customer data, order data, payment data, raw form responses, cookies, signed URLs, or private screenshots into sanitized summaries.

Raw private evidence remains outside Git. The output remains local/private until Drip and ChatGPT review it. No automatic promotion into repo docs is allowed.

## Acceptance Checks

Phase 2.7 is acceptable when:

- The script runs locally without credentials.
- The script refuses a private evidence root inside the repo.
- The script drafts all present evidence-category sanitized summary files.
- `UNKNOWN` is preserved where evidence is incomplete.
- A summary-builder manifest is produced.
- Existing `evidence:import`, `evidence:scan`, and `evidence:status` workflows still work.
- Local package tests pass.
- Repo secret-pattern scan is clean.
- Production impact is `NONE`.
- Phase 3 remains blocked pending Drip/ChatGPT review.

## Codex Review Queue Item

Phase: Phase 2.7

Title: Sanitized Evidence Summary Builder

Summary: Added a local-only helper that drafts sanitized evidence summaries and a manifest from already-collected private evidence, redacted copies, import/public manifests, status reports, and scanner reports. The helper keeps raw evidence out of Git, preserves `UNKNOWN` for unverified fields, and keeps Phase 3 blocked until review.

Production impact: None. No deploys, no DNS changes, no Squarespace changes, no Apps Script changes, no live credentials, no private API calls, no live-system writes, and no Phase 3 dataset ingestion.

Unresolved blockers: Draft summaries still require Drip/ChatGPT review. Remaining `UNKNOWN` fields and redaction warnings must be resolved manually before any sanitized findings are promoted into repo documentation or used for cutover planning.

Approvals needed: Drip/ChatGPT approval before trusting drafted summaries, promoting sanitized findings, changing production systems, or starting Phase 3.

Recommended next Codex prompt:

```text
Review Phase 2.7 with Drip and ChatGPT; inspect the drafted sanitized summaries and summary-builder manifest; resolve redaction concerns manually; keep UNKNOWN fields until verified; decide which sanitized findings can be promoted into repo docs; do not start Phase 3 or change production systems.
```
