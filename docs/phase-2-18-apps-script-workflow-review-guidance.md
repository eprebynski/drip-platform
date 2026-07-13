# Phase 2.18 Apps Script Workflow Review Guidance

## Scope

Phase 2.18 adds a local/private workflow review guidance generator for Apps Script relationship review.

- Production impact: NONE
- Phase 3 started: NO
- Apps Script changes: NONE
- Trigger changes: NONE
- Live Google Sheet changes: NONE
- Deployments: NONE
- Live credentials required: NO

## Why Phase 2.17 Still Blocks Phase 3

Phase 2.17 created a manual relationship verification packet, but all reviewer decisions still default to `UNKNOWN` and every workflow remains excluded from Phase 3 dry-run scope.

The packet is a review aid. It does not prove handlers, callers, Sheet read/write behavior, trigger behavior, cutover owner, rollback path, or migration readiness.

## Why Review Order Matters

Manual review should start where there are visible candidate relationships and higher cutover risk. Route/caller candidates can indicate public behavior that needs careful migration planning. Apps Script evidence signals without routes still need review, but they are less actionable than known route candidates.

The generated guidance ranks:

1. workflows with route/caller candidates
2. workflows with Apps Script evidence signals
3. workflows with no evidence signals

Higher-risk route words such as conference, campaign, submit, billing, purchase, and redirect increase priority.

## Why Conference Campaigns First

Conference Campaigns is the first deep-dive because the Phase 2.16 and Phase 2.17 private outputs show candidate routes for conference campaign behavior, including preview and submit-style paths. Those routes could affect public campaign or conference workflows, so they should be reviewed before signal-only or no-signal workflows.

This priority is not production proof and does not authorize Phase 3.

## Generated Private Guidance

Run:

```bash
npm run evidence:create-apps-script-workflow-review-guidance
```

The command writes:

```text
~/Documents/Drip/private-evidence/apps-script/apps-script-workflow-review-guidance.md
```

The generated guidance includes:

- Evidence Boundary
- Recommended Manual Review Order
- Workflow Review Checklist
- First Workflow Deep-Dive Template for Conference Campaigns
- Allowed Review Decisions
- Phase 3 Gate Reminder
- Do Not Do list

If the Phase 2.16 auto-review report or Phase 2.17 verification packet is missing, the guidance still generates with `UNKNOWN` defaults and a warning.

## Allowed Reviewer Decisions

Allowed reviewer decision values are:

- `UNKNOWN`
- `NO_ACTIVE_DEPENDENCY_FOUND`
- `ACTIVE_DEPENDENCY_CONFIRMED`
- `PARTIAL_DEPENDENCY_CONFIRMED`
- `EXCLUDE_FROM_PHASE_3_DRY_RUN`
- `MAYBE_AFTER_REVIEW`

`MAYBE_AFTER_REVIEW` is not approval to deploy, cut over, write to live Sheets, edit Apps Script, or start Phase 3.

## Dry-Run Exclusion Decisions

`EXCLUDE_FROM_PHASE_3_DRY_RUN` means the workflow must remain out of any future Phase 3 dry-run scope.

No workflow may be included in a future dry run unless handler, caller, read/write behavior, cutover owner, and rollback path have been reviewed and Drip/ChatGPT explicitly approves the scope.

The default gate remains `PHASE_3_BLOCKED`.

## Cutover Owner And Rollback

Cutover owner and rollback path remain hard blockers. Without them, Drip cannot assign responsibility, pause migration work, reverse a change, or decide whether a dry-run boundary is safe.

## Local And Private Only

Generated workflow guidance remains local/private under:

```text
~/Documents/Drip/private-evidence
```

Do not commit generated private guidance, packets, reports, filled templates, raw exports, screenshots, customer data, payment data, private Sheet exports, Apps Script deployment URLs, tokens, cookies, credentials, or secrets.

Commit only source code and separately reviewed documentation. Preserve `UNKNOWN` wherever sanitized evidence does not support a conclusion.
