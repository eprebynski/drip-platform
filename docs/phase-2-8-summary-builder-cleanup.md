# Phase 2.8: Sanitized Summary Builder Cleanup

## Scope

Phase 2.8 cleans up local-only private evidence tooling from Phase 2.7. It does not deploy, modify DNS, modify Squarespace, modify website pages/forms/redirects, modify Apps Script or triggers, write to live Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, create production resources, use live credentials, connect to private APIs, pull live-system data, or start Phase 3 dataset ingestion.

## Cleanup Behavior

The evidence importer, scanner, status report, and sanitized summary builder now ignore dotfiles, `.DS_Store`, and README files as evidence inputs. Sanitized summary output files are not reused as input evidence. Prior summary-builder manifests are skipped by default so new source counts are easier to review.

`npm run evidence:draft-summaries` now prefers the latest redaction report for current warning counts. Its manifest separates:

- latest redaction report warnings
- historical redaction report warnings
- warnings mapped to sources used in current summaries

All raw values remain redacted. `UNKNOWN` fields remain intentional until verified by Drip/ChatGPT review.

## Status Reporting

`npm run evidence:status` now distinguishes:

- sanitized summary files present
- sanitized summaries drafted
- summaries with intentional `UNKNOWN` fields
- summary files needing manual review
- categories with no evidence yet
- files needing review

Drafted summaries with intentional `UNKNOWN` fields are no longer reported as if they were untouched summary stubs.

## Safety

Raw private evidence remains outside Git. The tools do not promote local summaries into repo docs automatically. Production impact remains `NONE`, and Phase 3 started remains `NO`.

## Acceptance Checks

- `npm run evidence:scan -- --safe-redact` still works.
- `npm run evidence:draft-summaries` drafts all 16 summaries.
- `npm run evidence:status` distinguishes drafted summaries from original stubs.
- `.DS_Store`, dotfiles, and README files are ignored.
- The summary-builder manifest separates latest, historical, and mapped warning counts.
- Existing `evidence:import` and `evidence:collect-public` still work.
- Repo secret-pattern scan is clean.
- No production systems are changed.

## Codex Review Queue Item

Phase: Phase 2.8

Title: Sanitized Summary Builder Cleanup

Summary: Cleanup for local-only private evidence tooling so summary-builder outputs are easier to trust and manually review. The work reduces noisy source counts, ignores dotfiles and README files, prefers the latest redaction report, separates historical warning totals, and improves status reporting for drafted summaries with intentional `UNKNOWN` fields.

Production impact: None. No deploys, DNS changes, Squarespace changes, Apps Script changes, live credentials, private API calls, live-system writes, or Phase 3 dataset ingestion.

Unresolved blockers: Drafted summaries and redaction warnings still require Drip/ChatGPT review before sanitized findings are promoted or used for migration decisions.

Approvals needed: Drip/ChatGPT approval before trusting drafted summaries, promoting sanitized findings, changing production systems, or starting Phase 3.

Recommended next Codex prompt:

```text
Review Phase 2.8 with Drip and ChatGPT; run the cleaned evidence workflow locally, compare latest versus historical redaction warnings, review drafted sanitized summaries manually, keep UNKNOWN fields until verified, and do not start Phase 3 or change production systems.
```
