# Phase 2.17 Apps Script Relationship Verification Packet

## Scope

Phase 2.17 adds a local/private manual verification packet generator for Apps Script relationship evidence.

- Production impact: NONE
- Phase 3 started: NO
- Apps Script changes: NONE
- Trigger changes: NONE
- Live Google Sheet changes: NONE
- Deployments: NONE
- Live credentials required: NO

## Why Phase 2.16 Still Blocks Phase 3

Phase 2.16 organizes sanitized relationship evidence, but it does not convert signals into reviewed production facts.

The private auto-review report still defaults every workflow to `EXCLUDE_FROM_PHASE_3_DRY_RUN` while handler, caller, read/write behavior, cutover owner, or rollback path remains `UNKNOWN`.

## Why Manual Verification Is Needed

Apps Script relationships are migration-critical. Sanitized evidence can show candidates and signals, but a reviewer must decide whether each workflow has an active handler, caller, Sheet read/write dependency, trigger, owner, and rollback path.

The Phase 2.17 packet gives Drip/ChatGPT a structured way to review one workflow at a time without using live systems or copying private evidence into the repo.

## Generated Private Packet

Run:

```bash
npm run evidence:create-apps-script-relationship-verification-packet
```

The command writes:

```text
~/Documents/Drip/private-evidence/apps-script/apps-script-relationship-verification-packet.md
```

The generated packet includes:

- Evidence Boundary
- Instructions For Manual Review
- Workflow Verification Table
- Cutover Owner Review Section
- Rollback Path Review Section
- Phase 3 Decision Summary
- Do Not Do list

If the Phase 2.16 auto-review report exists, the packet pre-fills candidate fields from its Workflow Relationship Matrix. If the report is missing, candidate fields remain `UNKNOWN`.

## Allowed Reviewer Decision Values

Allowed reviewer decision values are:

- `UNKNOWN`
- `NO_ACTIVE_DEPENDENCY_FOUND`
- `ACTIVE_DEPENDENCY_CONFIRMED`
- `PARTIAL_DEPENDENCY_CONFIRMED`
- `EXCLUDE_FROM_PHASE_3_DRY_RUN`
- `MAYBE_AFTER_REVIEW`

These values are review labels only. They do not authorize production writes, cutover, deployment, Apps Script edits, or Phase 3.

## Dry-Run Exclusion Decisions

`EXCLUDE_FROM_PHASE_3_DRY_RUN` means the workflow must stay outside any future dry-run scope until the missing relationship evidence is reviewed.

`MAYBE_AFTER_REVIEW` means the workflow may become a future planning candidate after explicit Drip/ChatGPT review. It still does not authorize production writes or Phase 3.

The default overall gate recommendation remains `PHASE_3_BLOCKED`.

## Cutover Owner And Rollback

Cutover owner and rollback path remain hard blockers. Without an owner and rollback path, Drip cannot assign responsibility, pause a migration, reverse a change, or decide whether a limited dry run has a safe boundary.

Before migration or cutover review, sanitized evidence must support:

- assigned cutover owner
- documented rollback path
- rollback owner
- rollback test status
- reviewed workflow relationships
- explicit Drip/ChatGPT approval

## Local And Private Only

Generated verification packets remain local/private under:

```text
~/Documents/Drip/private-evidence
```

Do not commit generated private packets, generated reports, filled templates, review packets, raw exports, screenshots, customer data, payment data, private Sheet exports, Apps Script deployment URLs, tokens, cookies, credentials, or secrets.

Commit only source code and separately reviewed documentation. Preserve `UNKNOWN` wherever sanitized evidence does not support a conclusion.
