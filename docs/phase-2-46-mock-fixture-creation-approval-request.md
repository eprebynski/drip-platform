# Phase 2.46 Mock Fixture Creation Approval Request

## 1. Purpose

This document is a request for explicit approval to create mock fixture files in a later non-production PR.

This is documentation and planning only. It does not grant approval by itself. It does not create fixtures. It does not create JSON files. It does not create seed files. It does not create schemas. It does not create migrations. It does not create APIs. It does not create routes, route files, UI components, pages, Firestore collections, BigQuery tables, Cloud Run services, jobs, GitHub issue templates, GitHub issues, GitHub labels, GCP resources, or production resources. It does not build the dashboard.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, market intelligence changes, or revenue-share calculations.

## 2. Inputs

This approval request uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- Phase 2.41 workflow registry draft
- Phase 2.42 Admin Dashboard v0 wireframe / route plan
- Phase 2.43 workflow blocker issue template drafts
- Phase 2.44 local/mock fixture planning
- Phase 2.45 Admin Dashboard v0 static build plan
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This request does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Approval Request Summary

Request:

Approve a future non-production PR to create static local/mock fixture files for Admin Dashboard v0, using only sanitized planning data, with no live credentials, no external system access, no private evidence, no production reads, no production writes, and no dashboard build in the fixture PR unless separately approved.

Approval would allow creating mock fixture files only. Approval would not allow building dashboard routes, pages, or components. Approval would not allow live data reads. Approval would not allow live writes. Approval would not allow production deployment. Approval would not allow Phase 3. Approval would not allow a limited dry run. Approval would not allow production behavior.

This document asks for a decision. It does not make the decision.

## 4. Proposed Future Fixture Location

Requested future location:

`packages/dashboard/src/admin-v0/mock-data/`

This directory is not created in this phase. This directory would only be created in a later approved fixture PR. The directory must contain mock, local, sanitized files only. The directory must not contain raw evidence, exports, screenshots, logs, private IDs, credentials, live data, production identifiers, or generated private evidence.

## 5. Proposed Future Fixture Files

Requested future mock files:

- `phase-gate-summary.mock.json`
- `workflow-registry.mock.json`
- `workflow-domains.mock.json`
- `owner-categories.mock.json`
- `status-lifecycle.mock.json`
- `strict-gate-profiles.mock.json`
- `legacy-workflow-matrix.mock.json`
- `future-platform-workflows.mock.json`
- `workflow-blockers.mock.json`
- `evidence-sources.mock.json`
- `manual-review-decisions.mock.json`
- `workflow-owners.mock.json`
- `rollback-requirements.mock.json`
- `admin-issues.mock.json`
- `prohibited-actions.mock.json`
- `external-system-boundaries.mock.json`
- `data-model-notes.mock.json`
- `dashboard-view-configs.mock.json`

These files are not created in this phase. The future PR should create only mock/local fixture files. The future PR should not create routes, components, pages, APIs, schemas, migrations, Firestore collections, BigQuery tables, jobs, services, Cloud Run resources, GCP resources, or production resources.

## 6. Proposed Future Fixture Purpose By File

Every future fixture file must use safe fields only, exclude private data, preserve conservative defaults, and keep production behavior allowed now as `NO`.

| Proposed file | Purpose | Dashboard views supported | Required safe fields | Required conservative defaults | Excluded private data | Production behavior allowed now? |
| --- | --- | --- | --- | --- | --- | --- |
| `phase-gate-summary.mock.json` | Summarize gate posture. | Overview; Phase Gates | Gate ID, phase name, gate status, dry-run status, readiness score, production impact, started, blocker counts, safe summary. | `PHASE_3_BLOCKED`, `NOT_APPROVED`, `BLOCKED_PROGRESSING`, `NONE`, Phase 3 started `NO`. | Generated tracker content, private approvals, private notes. | NO |
| `workflow-registry.mock.json` | Catalog legacy and future workflows. | Workflows; Workflow Detail | Workflow ID, name, category, domains, status, owner category, strict gate profile, source-of-truth status, safe summary. | Dry-run eligible `NO`; production behavior allowed `NO`. | Raw evidence, private IDs, private URLs, customer data. | NO |
| `workflow-domains.mock.json` | Define workflow domain metadata. | Workflows; Future Platform Catalog | Domain ID, name, description, owner category, safe risks, safe summary. | Planning-only. | Source files, private examples, customer details. | NO |
| `owner-categories.mock.json` | Define planning owner categories. | Owners & Rollback; Issues | Owner category ID, display name, scope, safe summary. | Planning-only; no production authority. | People, emails, accounts, permissions. | NO |
| `status-lifecycle.mock.json` | Define safe status lifecycle values. | Workflows; Phase Gates | Status ID, meaning, allowed now, requires approval, safe summary. | Dry-run and production statuses not allowed now. | Private approval artifacts. | NO |
| `strict-gate-profiles.mock.json` | Define strict gate requirements. | Phase Gates; Prohibited Actions; Workflow Detail | Gate profile, required evidence category, owner categories, rollback requirement, blocked actions. | Dry-run allowed `NO`; production allowed `NO`. | Credentials, endpoints, live IDs. | NO |
| `legacy-workflow-matrix.mock.json` | Represent the 16 legacy workflows. | Legacy 16 Matrix; Overview | Workflow ID, name, status, partial evidence signals, unknown statuses, owner status, rollback status, next evidence target. | Dry-run eligible `NO`; production behavior allowed `NO`. | Raw manual reviews, generated tracker output, private identifiers. | NO |
| `future-platform-workflows.mock.json` | Represent future planning-only workflows. | Future Platform Catalog | Workflow ID, name, domain, owner category, strict gate, status, safe summary. | `PLANNING_ONLY`; dry-run eligible `NO`. | Live operational records, customer data. | NO |
| `workflow-blockers.mock.json` | Represent blocker records. | Blockers; Issues | Blocker ID, workflow ID, category, severity, status, evidence needed, owner needed, rollback needed, gate impact. | Unknowns remain visible; blockers stay unresolved unless explicitly supported. | Raw evidence, logs, private references. | NO |
| `evidence-sources.mock.json` | Represent sanitized evidence metadata. | Evidence Sources; Workflow Detail | Source ID, source type, label, sanitized boundary, confidence, redaction status, safe summary. | Raw private evidence committed `NO`. | Raw evidence, screenshots, exports, private URLs, credentials. | NO |
| `manual-review-decisions.mock.json` | Represent sanitized manual review decisions. | Manual Review Decisions; Legacy 16 Matrix | Decision ID, workflow ID, decision field/value, evidence basis type, unknowns, next evidence target. | Safe for dry run `NO`; safe for production `NO`. | Generated review content, private notes, raw evidence. | NO |
| `workflow-owners.mock.json` | Represent owner category needs. | Owners & Rollback | Workflow ID, owner category, ownership status, approval required, safe summary. | Planning labels only. | Names, emails, accounts, permissions. | NO |
| `rollback-requirements.mock.json` | Represent rollback requirements. | Owners & Rollback; Blockers | Workflow ID, rollback status, fallback category, stop condition, test status, safe summary. | Rollback unknown or needed until approved. | Private runbooks, live URLs, credentials. | NO |
| `admin-issues.mock.json` | Represent planning-only issue records. | Issues; Blockers | Issue ID, type, workflow ID, domain ID, blocker category, severity, owner category, evidence needed. | Local/mock only. | GitHub live issue IDs, assignees, private evidence. | NO |
| `prohibited-actions.mock.json` | Represent prohibited actions. | Prohibited Actions; Phase Gates | Action ID, action name, reason, severity, related workflows, approval required, safe summary. | Prohibited by default. | Internal escalation data, credentials. | NO |
| `external-system-boundaries.mock.json` | Represent boundary planning. | Workflow Detail; Prohibited Actions | External system category, read boundary, write boundary, credential boundary, dry-run boundary, production boundary. | Live reads/writes blocked. | Endpoints, tokens, private IDs, credentials. | NO |
| `data-model-notes.mock.json` | Represent conceptual model notes. | Data Model | Entity name, note type, safe fields, excluded field categories, related workflows. | Planning-only. | Raw examples, private records, private evidence. | NO |
| `dashboard-view-configs.mock.json` | Represent dashboard view planning. | Dashboard view planning | View ID, title, columns, filters, safe display rules, safe summary. | Planning-only. | User preferences, auth state, production settings. | NO |

## 7. Allowed Fixture Content

Allowed future fixture content:

- safe mock IDs
- safe workflow IDs
- safe domain IDs
- safe owner category IDs
- safe display names
- safe summaries
- mock status values
- blocker categories
- strict gate profiles
- planning-only issue records
- conceptual data model notes
- safe field names
- excluded field categories
- mock dashboard view configurations
- non-sensitive validation metadata

Allowed status values include:

- `PHASE_3_BLOCKED`
- `NOT_APPROVED`
- `BLOCKED_PROGRESSING`
- `NONE`
- `NO`
- `UNKNOWN`
- `PARTIAL`
- `PLANNING_ONLY`
- `EVIDENCE_NEEDED`
- `BLOCKED_BY_UNKNOWN_DEPENDENCIES`
- `READY_FOR_OWNER_REVIEW`
- `READY_FOR_NON_PRODUCTION_BUILD`

Approved production states should not appear unless explicitly approved in a later phase.

## 8. Prohibited Fixture Content

Prohibited future fixture content:

- raw private evidence
- private Sheet IDs
- private URLs
- customer names
- email addresses
- screen IDs
- playlist IDs
- channel IDs
- Stripe IDs
- invoice IDs
- logs
- uploaded data
- tokens
- secrets
- credentials
- screenshots
- generated private tracker content
- generated private review content
- live system identifiers
- PHI or patient data
- production endpoints
- production API responses
- real billing records
- real provider records
- real advertiser/vendor/employer records
- real campaign records
- real QR/redirect targets
- real ScreenCloud or YouTube data

## 9. Required Conservative Defaults

Every future fixture file must preserve:

- `dry_run_eligible`: `NO`
- `production_behavior_allowed`: `NO`
- `production_impact`: `NONE`
- `phase_gate_status`: `PHASE_3_BLOCKED` where relevant
- `dry_run_status`: `NOT_APPROVED` where relevant
- `phase_3_started`: `NO` where relevant
- `raw_private_evidence_committed`: `NO`
- `safe_to_display`: `YES` only for sanitized mock fields

## 10. Required Validation Before Future Fixture PR

Before creating fixture files in a future PR, require:

- approved fixture location
- approved fixture file list
- approved safe field list
- approved excluded data list
- changed-file secret scan
- no email address scan
- no private URL scan
- no private ID scan
- no token/secret/credential scan
- no generated private evidence scan
- JSON syntax validation
- dry-run default validation
- production-behavior default validation
- Phase 3 blocked validation
- production impact none validation

## 11. Required Validation During Future Fixture PR

The future fixture PR should run:

```bash
git diff --check
npm run evidence:create-phase-3-readiness-tracker
npm run evidence:status
npm test --prefix packages/shared
npm test --prefix packages/services
npm test --prefix packages/dashboard
```

If fixture-validation scripts exist by then, run them too.

If fixture-validation scripts do not exist, manually validate:

- JSON syntax
- no private data
- no credentials
- no email addresses
- no live URLs
- all dry-run values are `NO`
- all production behavior values are `NO`
- Phase 3 remains blocked
- production impact remains `NONE`

## 12. Approval Decision Options

| Decision option | Meaning | Allows | Does not allow |
| --- | --- | --- | --- |
| `APPROVE_FIXTURE_CREATION_REQUEST` | Approves a later fixture-only PR. | A later PR may create approved mock fixture files only. | Dashboard build, routes, components, pages, Phase 3, dry run, production behavior. |
| `REQUEST_CHANGES_TO_FIXTURE_PLAN` | Requires edits before fixture creation can be considered. | Planning revisions only. | Fixture creation until revised and approved. |
| `DO_NOT_APPROVE_FIXTURE_CREATION` | Keeps fixture creation blocked. | Continued planning only. | Fixture creation. |

Recommended decision: `APPROVE_FIXTURE_CREATION_REQUEST`, but only for a later non-production PR that creates mock/local/sanitized fixture files and no dashboard build.

## 13. What Approval Would Allow

If approved later, approval would allow a future PR to:

- create `packages/dashboard/src/admin-v0/mock-data/`
- create the approved `.mock.json` files
- populate those files with sanitized mock/local planning data only
- include blocked/not-approved/planning-only fixture values
- add basic JSON validation if already allowed
- update documentation explaining fixture usage

## 14. What Approval Would Not Allow

Approval would not allow:

- dashboard build
- route creation
- route file creation
- component creation
- page creation
- API creation
- schema creation
- migrations
- Firestore collections
- BigQuery tables
- Cloud Run services/jobs
- production resources
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
- GitHub issue template creation
- GitHub issue creation
- GitHub label creation
- Phase 3 start
- limited dry run
- production behavior

## 15. Relationship To Admin Dashboard v0

Mock fixtures are a prerequisite for a later static dashboard build. Mock fixtures do not build the dashboard. Mock fixtures do not create routes or components. Mock fixtures only give future dashboard pages safe local data to render. Future dashboard pages must still be separately approved. Admin Dashboard v0 remains internal-only, read-only, non-production, and evidence/gate/status focused.

## 16. Relationship To Phase 3

Fixture creation does not start Phase 3. Fixture creation does not approve a limited dry run. Fixture creation does not approve production behavior. Fixture creation does not resolve workflow blockers by itself. Fixture creation does not prove production readiness. Phase 3 remains blocked until explicit future approval.

## 17. Relationship To Production Systems

- No production systems are accessed.
- No live data is read.
- No live data is written.
- No Apps Script is edited.
- No live Sheets are read or written.
- No Gmail/email actions occur.
- No Stripe actions occur.
- No ScreenCloud or YouTube actions occur.
- No redirects or QR codes are changed.
- No uploads/imports occur.
- No Firestore, BigQuery, or Cloud Run resources are created.
- No production data ingestion occurs.

## 18. What Remains Prohibited

- no deploy
- no Apps Script edits
- no live Sheets writes
- no live Sheets reads
- no trigger changes
- no emails
- no invoices
- no Stripe changes
- no ScreenCloud changes
- no YouTube changes
- no redirect changes
- no QR creation
- no uploads/imports
- no revenue share calculation/payment
- no Firestore collection creation
- no BigQuery table creation
- no Cloud Run service/job creation
- no production data ingestion
- no dashboard build
- no route creation
- no UI component creation
- no page creation
- no workflow registry code
- no GitHub issue template creation
- no GitHub issue creation
- no GitHub label creation
- no Phase 3 start

## 19. Recommended Next Phase 2 Actions

1. Merge this approval request document after review.
2. If Drip explicitly approves `APPROVE_FIXTURE_CREATION_REQUEST`, create a later PR for mock fixture files only.
3. If not approved, revise the fixture plan before creating any fixtures.
4. Keep Phase 3 blocked.

## Phase 2.46 Safety Confirmation

Production impact is `NONE`.

No live systems were queried or modified. No fixture files, JSON files, seed files, schemas, migrations, APIs, routes, route files, UI components, pages, GitHub issue templates, GitHub issues, GitHub labels, Apps Script files, triggers, live Sheets, Gmail, Stripe, ScreenCloud, YouTube, redirects, QR codes, uploads, imports, market intelligence data, provider records, advertiser records, vendor records, employer records, organization records, user records, campaign records, billing records, Firestore collections, BigQuery tables, Cloud Run services, GCP resources, DNS records, or production resources were created, queried, or modified by this document.

Phase 3 remains blocked. Phase 3 dry run remains `NOT_APPROVED`. Production behavior allowed remains `NO`.
