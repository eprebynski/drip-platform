# Phase 2.16 Apps Script Relationship Evidence

## Scope

Phase 2.16 improves the local-only Apps Script dependency auto-review report so it organizes sanitized relationship evidence for the remaining Phase 3 blockers.

- Production impact: NONE
- Phase 3 started: NO
- Apps Script changes: NONE
- Trigger changes: NONE
- Live Google Sheet changes: NONE
- Deployments: NONE
- Live credentials required: NO

## Why Phase 2.15 Still Blocks Phase 3

Phase 2.15 corrected the planning-only map from current legacy Sheets to future logical Sheet areas. That fixed incorrect migration guidance, but it did not prove live Apps Script behavior.

The remaining blockers are relationship questions:

- live mode usage
- active Apps Script handlers
- workflow-to-handler mapping
- workflow-to-Sheet read/write behavior
- production caller map
- trigger map
- cutover owner
- rollback path

These are still required before any migration, cutover, or Phase 3 dry-run scope can be reviewed.

## Relationship Evidence Extracted

The local report now adds:

- Apps Script Relationship Evidence Summary
- Workflow Relationship Matrix
- Phase 3 Exclusion Draft
- Cutover And Rollback Gaps

The report reads only local/private sanitized evidence from the existing private evidence workflow. It does not query Apps Script, Google Sheets, GCP, Stripe, ScreenCloud, Squarespace, DNS, or any production system.

## Matrix Meaning

The Workflow Relationship Matrix uses conservative labels:

- `EVIDENCE_SIGNAL_ONLY`
- `POSSIBLE`
- `PARTIAL_SANITIZED_EVIDENCE`
- `UNKNOWN`
- `EXCLUDE_FROM_PHASE_3_DRY_RUN`
- `MAYBE_AFTER_REVIEW`

These labels help reviewers see what should be investigated next. They are not production proof and do not mean a workflow is approved, migrated, ready, or safe.

## Phase 3 Exclusions

A workflow is excluded from any future Phase 3 dry-run scope whenever handler, caller, read/write behavior, cutover owner, or rollback path remains `UNKNOWN`.

`MAYBE_AFTER_REVIEW` means only that the workflow could become a future planning candidate after Drip/ChatGPT review. It does not authorize production writes, deploys, cutover, live Sheet changes, or Phase 3.

## Cutover Owner And Rollback

Cutover owner and rollback path are hard blockers. Without them, Drip cannot assign responsibility, evaluate risk, pause a migration, reverse a change, or decide whether a limited dry run has a safe boundary.

Before any migration or cutover review, sanitized evidence must show:

- assigned cutover owner
- documented rollback path
- verified active Apps Script handlers
- verified workflow-to-handler mapping
- verified workflow-to-Sheet read/write behavior
- verified production caller map
- explicit Drip/ChatGPT approval

## Local And Private Only

Generated reports remain local/private under:

```text
~/Documents/Drip/private-evidence
```

Do not commit generated private reports, filled templates, review packets, raw exports, screenshots, customer data, payment data, private Sheet exports, Apps Script deployment URLs, tokens, cookies, credentials, or secrets.

Commit only source code and separately reviewed documentation. Preserve `UNKNOWN` wherever sanitized evidence does not support a conclusion.
