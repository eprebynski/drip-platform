# Phase 2.45 Admin Dashboard v0 Static Build Plan

## 1. Purpose

This document defines a future Admin Dashboard v0 static build plan.

This is documentation and planning only. It does not build the dashboard. It does not create routes. It does not create route files. It does not create UI components. It does not create pages. It does not create fixtures. It does not create JSON files. It does not create seed files. It does not create schemas. It does not create migrations. It does not create APIs. It does not create Firestore collections, BigQuery tables, Cloud Run services, jobs, GitHub issue templates, GitHub issues, GitHub labels, GCP resources, or production resources.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, market intelligence changes, or revenue-share calculations.

## 2. Inputs

This static build plan uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- Phase 2.41 workflow registry draft
- Phase 2.42 Admin Dashboard v0 wireframe / route plan
- Phase 2.43 workflow blocker issue template drafts
- Phase 2.44 local/mock fixture planning
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This plan does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Static Build Principles

- static/local/mock data only
- read-only dashboard only
- no live credentials
- no external system access
- no private evidence committed
- no-PHI guardrails
- blocked states must stay visually blocked
- partial evidence must not look approved
- unknown fields must remain visible
- dry-run eligible defaults to `NO`
- production behavior allowed defaults to `NO`
- production impact defaults to `NONE`
- Phase 3 remains blocked
- no operational admin actions
- no approval controls
- no live writes
- no live reads
- no billing, email, redirect, QR, ScreenCloud, YouTube, Stripe, upload, import, or revenue-share actions

Admin Dashboard v0 should explain status and blockers. It must not operate production systems or imply that dry run or production behavior has been approved.

## 4. Build Preconditions

Before any future static build can begin, Drip must explicitly approve:

- approved Phase 2.45 static build plan
- explicit approval to create mock fixtures
- approved fixture location
- approved fixture naming
- approved fixture validation rules
- approved dashboard route namespace
- approved no-live-service-call guard
- approved feature flag or environment guard
- approved test plan
- confirmed Phase 3 still blocked
- confirmed production impact `NONE`

This document does not satisfy those approvals by itself. It is a planning input only.

## 5. Proposed Future Route Namespace

Conceptual future route namespace:

- `/admin/v0`
- `/admin/v0/overview`
- `/admin/v0/workflows`
- `/admin/v0/workflows/:workflowId`
- `/admin/v0/legacy-workflows`
- `/admin/v0/future-workflows`
- `/admin/v0/blockers`
- `/admin/v0/evidence-sources`
- `/admin/v0/manual-review-decisions`
- `/admin/v0/owners-rollback`
- `/admin/v0/phase-gates`
- `/admin/v0/issues`
- `/admin/v0/prohibited-actions`
- `/admin/v0/data-model`
- `/admin/v0/display-settings`

No routes are created in this phase. These route names are planning concepts only.

## 6. Proposed Future Fixture Dependency Plan

This plan references the Phase 2.44 fixture categories. No fixtures are created in this phase.

| Fixture category | Purpose | Required before which dashboard page | Validation required | Safe fields only? | Private data excluded? | Production behavior allowed now? |
| --- | --- | --- | --- | --- | --- | --- |
| `phase_gate_summary` | Summarize phase gate posture. | Overview; Phase Gates | Gate values must include blocked/not-approved/no-production-impact defaults. | YES | YES | NO |
| `workflow_registry` | Catalog legacy and future workflows. | Workflows; Workflow detail | Workflow IDs, status, gate, and owner category fields must be present. | YES | YES | NO |
| `workflow_domains` | Define workflow domains. | Workflows; Future Platform Catalog | Domain IDs must be stable and sanitized. | YES | YES | NO |
| `owner_categories` | Define planning owner categories. | Owners & Rollback; Issues | No personal names, emails, permissions, or accounts. | YES | YES | NO |
| `status_lifecycle` | Define safe lifecycle states. | Workflows; Phase Gates | Dry-run and production states remain not approved unless later approved. | YES | YES | NO |
| `strict_gate_profiles` | Define strict gate rules. | Phase Gates; Prohibited Actions; Workflow detail | Every strict gate blocks dry run and production by default. | YES | YES | NO |
| `legacy_workflow_matrix` | Represent the 16 legacy workflows. | Legacy 16 Matrix; Overview | All dry-run eligibility values remain `NO`; unknowns remain visible. | YES | YES | NO |
| `future_platform_workflows` | Represent future planning-only workflows. | Future Platform Catalog | Default status is `PLANNING_ONLY`. | YES | YES | NO |
| `workflow_blockers` | Represent blocker records. | Blockers; Issues | Severity, evidence needed, owner needed, rollback needed, and gate impact must be explicit. | YES | YES | NO |
| `evidence_sources` | Represent sanitized evidence metadata. | Evidence Sources; Workflow detail | Raw evidence is never included; redaction and confidence status must be explicit. | YES | YES | NO |
| `manual_review_decisions` | Represent sanitized manual review decisions. | Manual Review Decisions; Legacy 16 Matrix | `safe_for_dry_run` and `safe_for_production` default to `NO`. | YES | YES | NO |
| `workflow_owners` | Represent owner category needs. | Owners & Rollback | Owner categories are planning labels only. | YES | YES | NO |
| `rollback_requirements` | Represent rollback needs. | Owners & Rollback; Blockers | Rollback status, fallback category, and stop condition are explicit or `UNKNOWN`. | YES | YES | NO |
| `admin_issues` | Represent local/mock planning issues. | Issues; Blockers | Records are not GitHub issues and must not include assignees or live IDs. | YES | YES | NO |
| `prohibited_actions` | Represent prohibited actions. | Prohibited Actions; Phase Gates | Prohibitions cannot be overridden by fixture values. | YES | YES | NO |
| `external_system_boundaries` | Represent read/write boundaries. | Workflow detail; Prohibited Actions | Read, write, credential, dry-run, and production boundaries must block live systems. | YES | YES | NO |
| `data_model_notes` | Represent conceptual model notes. | Data Model | No schemas, raw examples, private records, or source files. | YES | YES | NO |
| `dashboard_view_configs` | Represent dashboard view planning. | All dashboard views | No production settings, auth state, or user preferences. | YES | YES | NO |

## 7. Proposed Future Implementation Order

Later implementation phases, if explicitly approved, should proceed in this order:

1. Create mock fixture files only after explicit approval.
2. Add fixture validation tests.
3. Add route namespace behind non-production/static guard.
4. Add static Overview page.
5. Add static Workflow taxonomy browser.
6. Add static Legacy 16 matrix.
7. Add static Blocker matrix.
8. Add static Phase Gates page.
9. Add static Prohibited Actions page.
10. Add static Evidence Sources page.
11. Add static Manual Review Decisions page.
12. Add static Owners & Rollback page.
13. Add static Issues page.
14. Add static Data Model page.
15. Add dashboard no-live-service-call tests.
16. Add final static dashboard safety review.

This order is planning only and does not approve implementation.

## 8. Proposed Future Component Boundary Plan

Conceptual future component groups:

- `AdminV0Shell`
- `AdminV0SafetyBanner`
- `GateStatusSummary`
- `ReadinessScoreCard`
- `WorkflowTable`
- `WorkflowDetailDrawer`
- `LegacyWorkflowMatrix`
- `BlockerMatrix`
- `EvidenceSourceTable`
- `ManualReviewDecisionTable`
- `OwnerRollbackQueue`
- `PhaseGatePanel`
- `ProhibitedActionsPanel`
- `AdminIssueTable`
- `DataModelPlanningView`
- `SafeSummaryCopyControl`

No components are created in this phase. These names are planning concepts only and may be revised during a later approved build plan or implementation review.

## 9. Read-Only Interaction Plan

Allowed later interactions:

- view
- search
- filter
- sort
- expand/collapse
- navigate
- copy safe summary
- export safe planning summary only after later approval

Prohibited interactions:

- mutate data
- approve workflows
- approve dry run
- approve production
- assign production owners
- create GitHub issues
- create labels
- trigger jobs
- query live systems
- write live systems
- send emails
- invoice customers
- change external systems
- change redirects
- create QR codes
- modify playlists
- calculate revenue share

## 10. Safety Guard Plan

Required future guards:

- static-only data source guard
- no-live-service-call guard
- no credentials required
- no environment variables required for static rendering
- no API calls
- no server actions
- no form submissions
- no mutation buttons
- feature flag or environment flag for admin v0
- dashboard route namespace isolated from production user flows
- all production-impact fields default to `NONE`
- all dry-run fields default to `NO`
- all production-behavior fields default to `NO`
- unknown fields rendered as unresolved
- partial fields rendered as incomplete

The future dashboard should fail closed if fixture data is missing, unsafe, or shaped in a way that could imply approval.

## 11. Testing Plan For Later Build

Future tests should include:

- fixture syntax validation
- fixture schema-shape validation, if schemas are later approved
- no private data string scan
- no token/secret pattern scan
- no live URL/private identifier scan
- no email address scan
- no service-client import test
- no network call test
- no mutation control test
- route renders static data only
- blocked states visible
- unknown states visible
- partial states not approved
- Phase 3 blocked visible
- dry-run not approved visible
- production impact none visible
- production behavior allowed no visible

No tests are created in this phase unless existing validation commands are run. Future build tests must be added only in a later approved non-production implementation phase.

## 12. Feature Flag / Environment Planning

Future planning options:

- `ADMIN_V0_STATIC_ENABLED`
- `ADMIN_V0_MOCK_DATA_ONLY`
- `ADMIN_V0_NO_LIVE_SERVICES`
- `ADMIN_V0_NON_PRODUCTION_ONLY`

These environment variables are not created now. These flags are planning concepts only. A later implementation must decide whether feature flags are needed. No live environment configuration is changed.

## 13. Dashboard Page Build Readiness Matrix

| Page | Required fixtures | Read-only interactions | Prohibited interactions | Safety guard needed | Implementation priority | Approved to build now? |
| --- | --- | --- | --- | --- | --- | --- |
| Overview | `phase_gate_summary`, `workflow_blockers`, `prohibited_actions` | View, sort, navigate | Gate approval, dry-run approval, production approval | Static data guard; blocked state display | 1 | NO |
| Workflows | `workflow_registry`, `workflow_domains`, `owner_categories`, `status_lifecycle`, `strict_gate_profiles` | View, search, filter, sort, expand | Status mutation, workflow creation, production promotion | No mutation controls; safe summary only | 2 | NO |
| Workflow detail | `workflow_registry`, `workflow_blockers`, `evidence_sources`, `workflow_owners`, `rollback_requirements`, `prohibited_actions` | View, expand/collapse, copy safe summary | Approve workflow, edit source-of-truth, write evidence | Static-only linked metadata | 2 | NO |
| Legacy 16 Matrix | `legacy_workflow_matrix`, `manual_review_decisions`, `workflow_blockers`, `rollback_requirements` | View, filter, sort, search, expand | Mark dry-run eligible, edit Apps Script, edit Sheets | Dry-run values locked to `NO` | 3 | NO |
| Future Platform Catalog | `future_platform_workflows`, `workflow_domains`, `strict_gate_profiles` | View, filter, sort, search | Create production workflow, approve build | `PLANNING_ONLY` default | 4 | NO |
| Blockers | `workflow_blockers`, `workflow_owners`, `rollback_requirements`, `external_system_boundaries` | View, filter, sort, search, expand | Resolve blockers, assign owners, approve dry run | Unknowns remain unresolved | 5 | NO |
| Evidence Sources | `evidence_sources` | View, filter, sort, search | Display raw evidence, upload, import | Raw evidence exclusion guard | 7 | NO |
| Manual Review Decisions | `manual_review_decisions` | View, filter, sort, search, copy safe summary | Treat partial evidence as proof | Dry-run/prod safe flags default `NO` | 8 | NO |
| Owners & Rollback | `workflow_owners`, `rollback_requirements` | View, filter, sort, search, expand | Assign owners, approve rollback | Planning labels only | 9 | NO |
| Phase Gates | `phase_gate_summary`, `strict_gate_profiles`, `workflow_blockers` | View, filter, expand | Change gate, start Phase 3, approve dry run | Gate state locked to blocked/not-approved | 6 | NO |
| Issues | `admin_issues`, `workflow_blockers`, `owner_categories` | View, filter, sort, search, expand | Create GitHub issues, labels, assignments | Local/mock issue records only | 10 | NO |
| Prohibited Actions | `prohibited_actions`, `strict_gate_profiles` | View, filter, sort, search | Override prohibitions, execute actions | Prohibition cannot be overridden | 6 | NO |
| Data Model | `data_model_notes`, `workflow_registry`, `external_system_boundaries` | View, filter, sort, search | Create schemas, collections, tables, APIs | Planning-only model display | 11 | NO |
| Display Settings | `dashboard_view_configs` | View only | Change production settings, provider preferences | Dashboard-only planning scope | Later | NO |

## 14. Relationship To Phase 3

Admin Dashboard v0 static planning does not start Phase 3. It does not approve a limited dry run. It does not approve production behavior. A later static dashboard build would still be non-production and read-only. Phase 3 remains blocked until explicit future approval.

Current expected status remains:

- Overall gate recommendation: `PHASE_3_BLOCKED`
- Phase 3 dry-run status: `NOT_APPROVED`
- Readiness score: `BLOCKED_PROGRESSING`
- Production impact: `NONE`
- Phase 3 started: `NO`

## 15. Relationship To Production Systems

- No production systems are accessed.
- No Apps Script is edited.
- No live Sheets are read or written.
- No Gmail/email actions occur.
- No Stripe actions occur.
- No ScreenCloud or YouTube actions occur.
- No redirects or QR codes are changed.
- No uploads/imports occur.
- No Firestore, BigQuery, or Cloud Run resources are created.
- No production data ingestion occurs.

## 16. What Remains Prohibited

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
- no registry fixture creation
- no mock JSON creation
- no seed file creation
- no GitHub issue template creation
- no GitHub issue creation
- no GitHub label creation
- no Phase 3 start

## 17. Recommended Next Phase 2 Actions

1. Merge this static build plan after review.
2. Create a Phase 2.46 mock fixture creation approval request document.
3. Do not create fixtures until explicit approval.
4. Keep Phase 3 blocked.

## Phase 2.45 Safety Confirmation

Production impact is `NONE`.

No live systems were queried or modified. No dashboard files, fixture files, JSON files, seed files, schemas, migrations, APIs, routes, route files, UI components, pages, GitHub issue templates, GitHub issues, GitHub labels, Apps Script files, triggers, live Sheets, Gmail, Stripe, ScreenCloud, YouTube, redirects, QR codes, uploads, imports, market intelligence data, provider records, advertiser records, vendor records, employer records, organization records, user records, campaign records, billing records, Firestore collections, BigQuery tables, Cloud Run services, GCP resources, DNS records, or production resources were created, queried, or modified by this document.

Phase 3 remains blocked. Phase 3 dry run remains `NOT_APPROVED`. Production behavior allowed remains `NO`.
