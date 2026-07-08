# Phase 2.12 Apps Script Dependency Verification Kit

## Scope

Phase 2.12 adds local-only evidence tooling and documentation for manually verifying Apps Script dependencies before any website, forms, Sheets, automation, or backend migration decision.

- Production impact: NONE
- Phase 3 started: NO
- Apps Script changes: NONE
- Live Sheet changes: NONE
- Deployment changes: NONE
- Live credentials required: NO

This phase does not replace Apps Script, authorize migration, authorize cutover, or approve deletion of legacy scripts. It creates a safer inventory path for later Drip/ChatGPT review.

## Why Inventory Comes First

Apps Script can sit between public pages, forms, Sheets, redirects, campaign workflows, billing previews, display operations, notifications, and admin review steps. A script may also depend on deployment settings, execution identity, access permissions, runtime file order, triggers, linked Sheets, or public callers that are not visible from repo code alone.

Before migration, Drip needs source-verified answers for:

- which Apps Script projects and deployments exist
- which doGet, doPost, modes, triggers, or handlers are live
- which public routes, Squarespace forms, redirects, or upload flows call them
- which Sheets are read from, written to, or appended to
- which workflows are still operationally dependent on Apps Script
- which replacements must exist before any cutover
- who owns approval and rollback

Until verified, these fields remain UNKNOWN.

## Temporary Bridge, Not Long-Term Backend

Apps Script remains useful as a temporary migration bridge because it already connects parts of the legacy workflow. It should not be the long-term backend for Drip's rebuilt platform because it is harder to version, review, test, observe, deploy, roll back, and secure than the planned GitHub/GCP stack.

The future target remains:

- Cloud Run and API services for app/backend workflows
- Firestore for operational state
- BigQuery for analytics and dataset pipelines
- Cloud Scheduler for scheduled jobs
- Cloud Storage for upload and asset flows
- Secret Manager for secrets
- GitHub CI/CD for reviewed, repeatable deployments

## Evidence To Collect

Collect sanitized summaries for:

- Apps Script project inventory
- web app deployment inventory
- doGet, doPost, mode, route, and function inventory
- trigger inventory
- linked Google Sheet read/write map
- public caller and route map
- workflow classifications
- replacement targets and migration dispositions
- backup, rollback, owner, and cutover readiness

Raw exports, screenshots, deployment URLs, script identifiers, tokens, customer data, payment data, form responses, cookies, and credentials must stay outside the repo.

## What Remains UNKNOWN

The following stay UNKNOWN until verified from sanitized private evidence:

| Dependency | Status |
| --- | --- |
| Deployed Apps Script parity | UNKNOWN |
| Apps Script runtime load order | UNKNOWN |
| Live mode usage | UNKNOWN |
| Linked Sheet IDs | UNKNOWN |
| Cutover owner | UNKNOWN |
| Trigger schedules and owners | UNKNOWN |
| Public callers and route usage | UNKNOWN |
| Replacement readiness | UNKNOWN |
| Rollback readiness | UNKNOWN |

## Local Template Workflow

Generate the local/private template with either command:

```bash
npm run evidence:create-templates
npm run evidence:create-apps-script-template
```

The template is written outside the repo at:

```text
~/Documents/Drip/private-evidence/apps-script/apps-script-dependency-verification-template.md
```

Use the template as a manual checklist. It should be completed from sanitized evidence only and reviewed before Phase 3 is considered. The template is not production evidence by itself.

## What Must Not Be Committed

Do not commit:

- raw Apps Script exports
- private deployment URLs
- AKfy-style deployment identifiers
- project IDs when sensitive
- linked Sheet IDs when sensitive
- tokens, cookies, credentials, or private keys
- customer data, payment data, order data, raw form responses, or screenshots
- generated private packets or raw private evidence

Commit only sanitized documentation after Drip/ChatGPT review.

## Review Packet Behavior

The Apps Script migration review packet references the Phase 2.12 template when it is present. That reference means only that a manual verification aid exists. It does not prove production behavior.

The packet must continue to preserve UNKNOWN for deployed parity, runtime load order, live mode usage, linked Sheet IDs, and cutover owner until sanitized evidence verifies them.

## Phase 3 Gate

Phase 3 remains blocked until Drip/ChatGPT review confirms:

- Apps Script dependencies are inventoried
- Sheets dependencies are mapped
- public callers and routes are understood
- replacement targets are identified
- owners are assigned
- rollback paths are documented
- no raw private evidence has been committed

This phase provides planning and verification scaffolding only.
