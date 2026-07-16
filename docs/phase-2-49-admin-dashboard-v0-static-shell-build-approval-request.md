# Phase 2.49 Admin Dashboard v0 Static Shell Build Approval Request

## 1. Purpose

This document requests explicit approval for a later non-production PR to build the first Admin Dashboard v0 static shell.

This document is documentation and planning only. It does not build the dashboard. It does not grant approval by itself. It does not create routes, route files, pages, UI components, APIs, schemas, migrations, services, jobs, Firestore collections, BigQuery tables, Cloud Run services or jobs, GCP resources, or production resources.

This document does not start Phase 3. It does not approve limited dry run. It does not approve production behavior. It does not approve live credentials, live service calls, production reads, production writes, deploys, Apps Script edits, live Sheet reads or writes, Gmail/email actions, Stripe actions, ScreenCloud actions, YouTube actions, redirect changes, QR creation, uploads, imports, market intelligence changes, revenue-share calculations, or revenue-share payments.

## 2. Inputs

This approval request uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- Phase 2.41 static workflow registry draft
- Phase 2.42 Admin Dashboard v0 wireframe / route plan
- Phase 2.43 workflow blocker issue template drafts
- Phase 2.44 local/mock fixture planning
- Phase 2.45 Admin Dashboard v0 static build plan
- Phase 2.46 mock fixture creation approval request
- Phase 2.47 mock fixture files
- Phase 2.48 mock fixture validation tooling

This request does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Approval Request Summary

Request:

Approve a later non-production PR to build the first Admin Dashboard v0 static shell using only local/mock validated fixture data, with no live credentials, no external system access, no production reads, no production writes, no operational admin actions, no Phase 3 approval, no limited dry run approval, and no production behavior approval.

Approval would allow only a later static shell build. It would not allow a full dashboard buildout, production dashboard release, live data access, production deployment, Phase 3, limited dry run, production behavior, or operational admin actions.

This document asks for a decision. It does not make the decision.

## 4. What Approval Would Allow

If approved later, approval would allow a future PR to create a guarded static Admin Dashboard v0 shell only, such as:

- a non-production/static-only route namespace if required by the existing dashboard architecture
- a minimal shell layout
- a safety banner
- a static overview page
- local import or read of approved mock fixture data only
- display of blocked/not-approved/production-impact-none posture
- local tests proving no live services are used
- local tests proving fixture validation still passes

The later PR would still need to be reviewed as non-production work and would still need to preserve the current blocked posture.

## 5. What Approval Would Not Allow

Approval would not allow:

- production dashboard release
- production deployment
- live credentials
- live service calls
- production reads
- production writes
- Apps Script edits
- live Sheets reads/writes
- Gmail/email actions
- Stripe actions
- ScreenCloud actions
- YouTube actions
- redirect changes
- QR creation
- uploads/imports
- revenue share calculations/payments
- GitHub issue creation
- GitHub label creation
- Phase 3 start
- limited dry run
- production behavior
- workflow approvals
- operational admin mutation buttons
- billing/admin actions
- provider/advertiser/customer actions

## 6. Proposed Future Static Shell Scope

A conservative first static shell scope should be limited to:

- Admin Dashboard v0 shell container
- safety/status banner
- navigation list for planned views
- static Overview view
- fixture validation status panel
- Phase gate summary card
- blocked workflows summary card
- prohibited actions summary card
- production impact `NONE` card
- dry-run `NOT_APPROVED` card
- Phase 3 `PHASE_3_BLOCKED` card

The first static shell should not include forms, action buttons, mutation controls, live data tables, auth changes, real user management, billing controls, issue creation, external system actions, or production admin tools.

## 7. Proposed Future Route Namespace

Earlier planning referenced a possible future route:

`/admin/v0`

Only the minimum shell route should be considered in the first build PR. If the dashboard architecture prefers a different local route structure, Codex must follow the existing app conventions.

No route is created in this approval-request phase.

## 8. Required Static-Only Guardrails For Later Build

A later build PR must include or preserve:

- validated mock fixtures only
- no live service client imports
- no network calls
- no server mutations
- no forms
- no write actions
- no credentials
- no production environment dependency
- fail-closed behavior if mock fixtures fail validation
- visual display of Phase 3 blocked
- visual display of limited dry run not approved
- visual display of production behavior not approved
- visual display of production impact none

## 9. Required Tests For Later Build

A later build PR should include tests that prove:

- mock fixture validation passes
- static shell renders with mock data only
- no live service clients are imported
- no network calls are made
- no mutation controls are rendered
- Phase 3 blocked is visible
- dry run not approved is visible
- production behavior not approved is visible
- production impact none is visible
- approval-like production values fail validation

## 10. Approval Decision Options

### 1. `APPROVE_STATIC_SHELL_BUILD_REQUEST`

Allows a later non-production PR to build the first static shell only.

This does not approve full dashboard buildout. It does not approve live data. It does not approve production.

### 2. `REQUEST_CHANGES_TO_STATIC_SHELL_PLAN`

Requires revisions before the static shell can be considered.

### 3. `DO_NOT_APPROVE_STATIC_SHELL_BUILD`

Keeps dashboard build blocked.

Recommended decision:

`APPROVE_STATIC_SHELL_BUILD_REQUEST`

This recommendation applies only to a later non-production PR that creates a static shell using validated mock fixture data only.

## 11. Relationship To Admin Dashboard v0

The static shell would be the first visible dashboard foundation. It would not be operational. It would not use live systems. It would not approve workflows. It would not start Phase 3. It would provide a safe visual layer over the mock fixture data.

## 12. Relationship To Phase 3

Static shell approval does not start Phase 3. Static shell approval does not approve limited dry run. Static shell approval does not approve production behavior. Static shell approval does not resolve workflow blockers. Static shell approval does not prove production readiness.

Phase 3 remains blocked until explicit future approval.

## 13. Relationship To Production Systems

No production systems are accessed. No live data is read. No live data is written. No Apps Script is edited. No live Sheets are read or written. No Gmail/email actions occur. No Stripe actions occur. No ScreenCloud or YouTube actions occur. No redirects or QR codes are changed. No uploads/imports occur. No Firestore, BigQuery, or Cloud Run resources are created. No production data ingestion occurs.

## 14. Recommended Next Phase 2 Actions

1. Merge this approval request document after review.
2. If Drip explicitly approves `APPROVE_STATIC_SHELL_BUILD_REQUEST`, create a later PR for the first guarded static shell only.
3. Keep mock fixture validation required.
4. Keep Phase 3 blocked.

## Current Safety Posture

- Phase 3: `PHASE_3_BLOCKED`
- Limited dry run: `NOT_APPROVED`
- Production behavior: `NO`
- Production impact: `NONE`
- Phase 3 started: `NO`
