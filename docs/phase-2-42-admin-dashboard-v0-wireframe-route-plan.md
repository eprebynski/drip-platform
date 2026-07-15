# Phase 2.42 Admin Dashboard v0 Wireframe / Route Plan

## 1. Purpose

This document defines the Admin Dashboard v0 wireframe and conceptual route plan for future Drip platform planning.

This is documentation and planning only. It does not build the dashboard. It does not create routes. It does not create route files. It does not create UI components. It does not create pages. It does not create fixtures. It does not create schemas. It does not create APIs. It does not create Firestore collections. It does not create BigQuery tables. It does not create Cloud Run services, jobs, migrations, seed files, GCP resources, or production resources.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, market intelligence changes, or revenue-share calculations.

## 2. Inputs

This wireframe and route plan uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- Phase 2.41 workflow registry draft
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This plan does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Wireframe Principles

- read-only dashboard first
- status visibility before operations
- blocked states must look blocked
- partial evidence must not look approved
- unknown fields must remain visibly unknown
- no live credentials
- no private evidence committed
- no-PHI guardrails
- future workflows start as `PLANNING_ONLY`
- legacy workflows remain blocker-tracked
- no workflow becomes dry-run eligible without explicit future approval
- no workflow becomes production-active without explicit future approval
- billing, email, redirect, QR, ScreenCloud, YouTube, Stripe, upload, import, and production-ingestion workflows require strict gates

Admin Dashboard v0 should help Drip see what is blocked, what evidence exists safely, what remains unknown, and what planning action should happen next. It must not become a control surface for live operations.

## 4. Conceptual Navigation Structure

| Navigation item | Purpose | Notes |
| --- | --- | --- |
| Overview | Show gate posture, readiness, blocked state, and next planning actions. | First page in v0. |
| Workflows | Browse legacy and future workflow registry entries together. | Read, filter, sort, search, and navigate only. |
| Legacy 16 Matrix | Review the 16 blocker-tracked legacy workflows. | All dry-run eligibility remains `NO`. |
| Future Platform Catalog | Review future platform workflow taxonomy by domain. | Future workflows default to `PLANNING_ONLY`. |
| Blockers | Show blocker categories, evidence needs, owners, and rollback gaps. | Does not resolve blockers. |
| Evidence Sources | Show sanitized evidence metadata and safe display status. | Raw evidence is never displayed. |
| Manual Review Decisions | Show decision fields and safe-for-design interpretation. | Partial evidence is not dry-run or production proof. |
| Owners & Rollback | Show missing owner and rollback planning needs. | Does not assign production owners. |
| Phase Gates | Show phase gate status, required approvals, and prohibited actions. | Phase 3 remains blocked. |
| Issues | Show planning-only issue concepts tied to blockers. | No GitHub issues are created in v0. |
| Prohibited Actions | Keep live-system and production prohibitions visible. | No overrides. |
| Data Model | Show conceptual non-production data model needs. | No schemas or fixtures. |
| Settings / Display Preferences | Future dashboard display preferences, planning-only. | Not provider display preferences and not production settings. |

## 5. Conceptual Route Plan

These route names are conceptual future route names only. This phase does not create route files, pages, components, APIs, schemas, fixtures, resources, redirects, or deployments.

Allowed interactions for every conceptual route are limited to view, filter, sort, search, expand or collapse detail, copy safe summaries where noted, and navigate. Prohibited interactions for every conceptual route include data mutation, approval, dry-run approval, production approval, live-system queries, live-system writes, job triggers, emails, invoices, billing actions, external-system changes, route creation, fixture creation, and production resource creation.

| Conceptual route | Purpose | Main panels | Primary fields | Allowed interactions | Prohibited interactions | Future data source | Build priority |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `/admin/v0` | Default v0 entry point. | Redirect-style landing concept to Overview; safety banner. | Gate, dry-run status, readiness score, production impact. | View and navigate. | Create redirect, deploy route, approve gate. | Static/mock gate summary. | 1 |
| `/admin/v0/overview` | Show migration safety posture. | Gate Status Summary, Phase 3 Safety Banner, Readiness Score Card, Top Blockers. | `PHASE_3_BLOCKED`, `NOT_APPROVED`, `BLOCKED_PROGRESSING`, `NONE`, `NO`. | View, sort blocker list, navigate to detail. | Start Phase 3, approve dry run, change gate state. | Mock/local phase gate and blocker data. | 1 |
| `/admin/v0/workflows` | Browse all workflow registry entries. | Workflow Search, Domain Filter, Status Filter, Workflow Table. | Workflow ID, name, domain, owner category, status, strict gate profile. | View, search, filter, sort, expand row. | Promote status, create workflow record, trigger action. | Mock/local workflow registry. | 2 |
| `/admin/v0/workflows/:workflowId` | Show one workflow detail. | Detail Summary, Related Blockers, Evidence Sources, Owner/Rollback Needs, Prohibited Actions. | Status, source-of-truth status, dry-run eligible, production behavior allowed. | View, expand/collapse, copy safe summary, navigate. | Approve workflow, mutate source of truth, write evidence. | Mock/local workflow registry and linked metadata. | 2 |
| `/admin/v0/legacy-workflows` | Show the Legacy 16 matrix. | Legacy Workflow Matrix, Evidence Status Summary, Unknowns, Owner/Rollback Missing Summary. | Workflow, handler status, caller status, Sheet read/write status, owner, rollback, dry-run eligibility. | View, filter, sort, search, expand detail. | Mark dry-run eligible, edit Apps Script, edit Sheets. | Mock/local legacy workflow matrix. | 3 |
| `/admin/v0/future-workflows` | Show future platform catalog. | Domain Summary Cards, Future Workflow Table, Strict Gate Summary, Planning-Only Warnings. | Workflow ID, domain, owner category, `PLANNING_ONLY`, strict gate profile. | View, filter, sort, search. | Create production workflow, approve build, approve production. | Mock/local future workflow catalog. | 4 |
| `/admin/v0/blockers` | Show blocker categories and unresolved blockers. | Blocker Categories Table, Critical Blockers, High Blockers, Detail Drawer. | Category, severity, current status, evidence needed, owner needed, rollback needed. | View, filter, sort, search, expand detail. | Resolve blocker, assign production owner, approve dry run. | Mock/local blocker records. | 5 |
| `/admin/v0/evidence-sources` | Show sanitized evidence source metadata. | Evidence Source Registry, Safe Display Status, Redaction Status, Confidence Summary. | Evidence source ID, type, label, confidence, redaction status, safe to display. | View, filter, sort, search. | Display raw evidence, upload files, import files, commit private evidence. | Mock/local sanitized evidence metadata. | 7 |
| `/admin/v0/manual-review-decisions` | Show manual review decision fields. | Decision Matrix, Unknown Decision Fields, Safe-for-Design Summary, Not-Safe Summaries. | Decision ID, workflow, decision field, decision value, evidence basis, unknowns. | View, filter, sort, search, copy safe summary. | Treat partial evidence as production proof, approve dry run. | Mock/local sanitized review decisions. | 8 |
| `/admin/v0/owners-rollback` | Show owner and rollback gaps. | Owner Needed Queue, Rollback Needed Queue, Owner Category Summary, Workflow Detail Drawer. | Workflow, owner category, owner status, rollback status, approval needed. | View, filter, sort, search, expand detail. | Assign production owner, approve rollback, approve production. | Mock/local owner and rollback planning records. | 9 |
| `/admin/v0/phase-gates` | Show phase gate posture. | Phase 2 Planning Gate, Phase 3 Blocked Gate, Required Approvals, Unresolved Blockers. | Gate ID, phase name, gate status, dry-run status, readiness score, started. | View, filter, expand detail. | Change gate, start Phase 3, approve limited dry run. | Mock/local phase gate summary. | 6 |
| `/admin/v0/issues` | Show planning-only issues. | Issue Table, Severity Filters, Workflow Filters, Issue Detail Drawer. | Issue ID, workflow, severity, owner category, status, evidence needed. | View, filter, sort, search, expand detail. | Create GitHub issue, assign owner, trigger work. | Mock/local issue drafts. | 10 |
| `/admin/v0/prohibited-actions` | Show explicit prohibitions. | Prohibited Actions List, Critical Warnings, Workflow-Linked Prohibitions. | Action, severity, related workflows, reason, current status. | View, filter, sort, search. | Override prohibition, execute prohibited action. | Mock/local prohibited action registry. | 6 |
| `/admin/v0/data-model` | Show conceptual model planning view. | Conceptual Entities, Entity Relationships, Safe Display Fields, Private/Excluded Fields. | Entity, purpose, safe fields, excluded fields, related entities. | View, filter, sort, search. | Create schema, collection, table, API, migration, fixture. | Mock/local model planning metadata. | 11 |
| `/admin/v0/display-settings` | Plan future dashboard display preferences. | View Preferences Concept, Safe Display Warnings, No-Production-Settings Warning. | Dashboard view name, visible columns, safe display rule. | View only in v0 planning. | Change production settings, change provider display preferences. | Future mock/local dashboard view config only. | Later |

## 6. Overview Page Wireframe

| Panel | Purpose | Required fields or values | Notes |
| --- | --- | --- | --- |
| Gate Status Summary | Show overall migration gate. | `PHASE_3_BLOCKED` | Must be visually prominent. |
| Phase 3 Safety Banner | Warn that Phase 3 is not approved. | Phase 3 started: `NO`; dry-run status: `NOT_APPROVED` | No dismiss-to-approve behavior. |
| Readiness Score Card | Show current readiness. | `BLOCKED_PROGRESSING` | Progressing does not mean approved. |
| Legacy Workflow Count Card | Show reviewed legacy workflow count. | 16 legacy workflows | Count only, no private review content. |
| Dry-Run Eligibility Card | Show dry-run eligibility. | 0 dry-run eligible workflows | All dry-run eligibility remains `NO`. |
| Production Impact Card | Show production impact. | `NONE` | This may look positive only because no production impact exists. |
| Missing Owner Card | Show owner gaps. | Count from sanitized/mock data later | Unknown owner fields remain unresolved. |
| Missing Rollback Card | Show rollback gaps. | Count from sanitized/mock data later | Unknown rollback fields remain unresolved. |
| Top Blockers List | Show highest risk blockers. | Critical and high blocker categories | Read-only list. |
| Prohibited Actions Summary | Keep prohibited actions visible. | Production behavior allowed: `NO` | No override controls. |
| Recommended Next Planning Actions | Suggest safe next planning steps. | Review, gather evidence, draft plans | No build or Phase 3 approval. |

## 7. Workflow Taxonomy Browser Wireframe

Panels:

- Workflow Search
- Domain Filter
- Status Filter
- Strict Gate Filter
- Workflow Table
- Workflow Detail Drawer
- Related Blockers
- Related Evidence Sources
- Related Owner/Rollback Needs
- Related Prohibited Actions

Fields:

- workflow ID
- workflow name
- primary domain
- related domains
- legacy migration workflow yes/no
- future platform workflow yes/no
- status
- owner category
- strict gate profile
- source-of-truth status
- dry-run eligible
- production behavior allowed
- safe summary

Allowed interactions are view, filter, sort, search, expand/collapse, copy safe summary, and navigate only.

## 8. Legacy 16 Matrix Wireframe

The Legacy 16 matrix includes these workflows:

1. Conference Campaigns
2. Patient Campaigns
3. Provider Campaigns
4. ScreenCloud/display provider operations
5. Provider display preferences
6. Admin review workflows
7. Stripe invoicing
8. Video/playback billing
9. Patient Campaign QR scan logging
10. Provider revenue share
11. YouTube/playlist operations
12. Provider signup
13. Advertiser/vendor/employer signup
14. QR redirects
15. Market intelligence uploads
16. Welcome emails

Panels:

- Legacy Workflow Matrix
- Evidence Status Summary
- Handler/Caller Unknowns
- Sheet Read/Write Unknowns
- Trigger/Schedule/Job Unknowns
- Owner/Rollback Missing Summary
- Recommended Next Evidence Targets

Columns:

- workflow
- status
- partial evidence signals
- handler/mode status
- caller/route/form/trigger/job status
- Sheet read status
- Sheet write status
- trigger/schedule/job status
- owner status
- rollback status
- ingestion decision
- dry-run eligibility
- production behavior allowed
- next evidence target

All dry-run eligibility remains `NO`. Unknown fields remain `UNKNOWN`. Partial evidence remains `PARTIAL` and must not display as approval.

## 9. Future Platform Catalog Wireframe

The Future Platform Catalog groups workflows by the 20 domains from Phase 2.38:

1. Marketing workflows
2. Sales workflows
3. Provider acquisition workflows
4. Advertiser/vendor/employer acquisition workflows
5. Campaign product workflows
6. Advertising operations workflows
7. Digital signage / screen distribution workflows
8. QR / redirect / attribution workflows
9. Conference sponsorship workflows
10. Provider display preference workflows
11. Billing / payments workflows
12. Provider revenue share workflows
13. Customer support workflows
14. Internal admin / operations workflows
15. Evidence / gate / migration workflows
16. Analytics / reporting workflows
17. Market intelligence workflows
18. Compliance / policy / safety workflows
19. Notifications / communications workflows
20. Integration / external system workflows

Panels:

- Domain Summary Cards
- Future Workflow Table
- Strict Gate Summary
- Planning-Only Warnings
- Future Build Candidates, planning-only

Fields:

- workflow ID
- workflow name
- domain
- owner category
- status
- strict gate profile
- v0 visible
- dry-run eligible
- production behavior allowed

Default future workflow status is `PLANNING_ONLY`. Dry-run eligibility is `NO`. Production behavior allowed is `NO`.

## 10. Blocker Matrix Wireframe

Panels:

- Blocker Categories Table
- Critical Blockers
- High Blockers
- Workflow Blocker Detail Drawer
- Evidence Needed Panel
- Owner Needed Panel
- Rollback Needed Panel

Blocker categories:

- active handler/mode
- production caller/route/form/trigger/job proof
- current read behavior
- current write behavior
- trigger/schedule/job behavior
- schema/event model
- source-of-truth decision
- owner/cutover decision
- rollback path
- rollback owner/test status
- live-system boundary
- ingestion decision
- explicit Drip/ChatGPT approval

The blocker matrix can display blocker state, evidence needed, owner category needed, rollback needed, and suggested planning action. It cannot resolve blockers or change gate status.

## 11. Evidence Sources Wireframe

Panels:

- Evidence Source Registry
- Safe Display Status
- Redaction Status
- Confidence Level Summary
- Related Workflows
- Private Boundary Warning

Fields:

- evidence source ID
- source type
- source label
- sanitized boundary
- private boundary
- related workflows
- related domains
- confidence level
- redaction status
- safe to display
- raw private evidence committed

Raw evidence is never displayed. Private files, generated tracker output, generated review content, screenshots, logs, private identifiers, private URLs, and credentials remain outside the dashboard.

## 12. Manual Review Decisions Wireframe

Panels:

- Decision Matrix
- Unknown Decision Fields
- Safe-for-Design Summary
- Not-Safe-for-Dry-Run Summary
- Not-Safe-for-Production Summary
- Next Evidence Targets

Fields:

- decision ID
- workflow
- decision field
- decision value
- evidence basis type
- safe for design
- safe for dry run
- safe for production
- unknowns
- next evidence target
- safe summary

Manual review decisions can inform non-production design only when the basis is sanitized and safe. They do not approve dry run, production use, live writes, or external actions.

## 13. Owners & Rollback Wireframe

Panels:

- Owner Needed Queue
- Rollback Needed Queue
- Owner Category Summary
- Rollback Status Summary
- Workflow Detail Drawer

Allowed interactions:

- view
- filter
- sort
- search
- expand detail

Prohibited interactions:

- assign production owners
- approve rollback
- approve dry run
- approve production change

Owner categories are planning labels only. They are not user accounts, permission grants, or authority assignments.

## 14. Phase Gates Wireframe

Panels:

- Phase 2 Planning Gate
- Phase 3 Blocked Gate
- Future Production Review Gate
- Required Approvals
- Unresolved Blockers
- Prohibited Actions by Gate

Fields:

- phase gate ID
- phase name
- gate status
- dry-run status
- readiness score
- production impact
- started
- required approvals
- unresolved blocker count
- prohibited actions
- next planning action

Current expected values remain `PHASE_3_BLOCKED`, `NOT_APPROVED`, `BLOCKED_PROGRESSING`, `NONE`, and Phase 3 started `NO`.

## 15. Issue Tracker Wireframe

Issue tracker v0 is planning-only.

Panels:

- Issue Table
- Severity Filters
- Workflow Filters
- Blocker Category Filters
- Owner Category Filters
- Issue Detail Drawer

Fields:

- issue ID
- workflow
- domain
- blocker category
- severity
- owner category
- status
- evidence needed
- rollback needed
- due date placeholder
- production impact
- phase gate impact
- safe summary

No GitHub issues are created in v0. The issue tracker is a future dashboard planning view only.

## 16. Prohibited Actions Wireframe

Panels:

- Prohibited Actions List
- Critical Warnings
- Workflow-Linked Prohibitions
- External-System Prohibitions
- Financial/Communication Prohibitions

Warnings:

- Do not start Phase 3
- Do not deploy
- Do not edit Apps Script
- Do not modify triggers
- Do not write live Sheets
- Do not send emails
- Do not create invoices
- Do not modify Stripe
- Do not modify ScreenCloud
- Do not modify YouTube
- Do not change redirects
- Do not create QR codes
- Do not upload/import files
- Do not calculate/pay revenue share
- Do not create Firestore collections
- Do not create BigQuery tables
- Do not create Cloud Run services/jobs
- Do not ingest production data
- Do not use partial evidence as production proof

The prohibited actions view should be available from every strict-gate workflow detail later.

## 17. Data Model Planning View Wireframe

Panels:

- Conceptual Entities
- Entity Relationships
- Safe Display Fields
- Private/Excluded Fields
- Future Implementation Notes

Entities:

- `workflow_registry`
- `workflow_domains`
- `workflow_reviews`
- `workflow_blockers`
- `manual_review_decisions`
- `evidence_sources`
- `phase_gates`
- `admin_issues`
- `workflow_owners`
- `rollback_requirements`
- `prohibited_actions`
- `workflow_status_history`
- `external_system_boundaries`
- `data_model_notes`
- `dashboard_view_configs`

This view describes planning needs only. It does not create schemas, route loaders, collections, tables, migrations, fixtures, seed files, or APIs.

## 18. Visual State Guidance

This plan does not specify exact CSS, colors, components, or implementation design. It defines semantic emphasis only.

| State | Semantic display guidance |
| --- | --- |
| `PHASE_3_BLOCKED` | Blocked should be visually prominent and should not resemble success. |
| `NOT_APPROVED` | Approval is absent; display as blocked or not allowed. |
| `BLOCKED_PROGRESSING` | Some planning progress exists, but blockers remain. |
| `NONE` | Use carefully; positive only when it means no production impact. |
| `UNKNOWN` | Visibly unresolved and blocking until verified. |
| `PARTIAL` | Visibly incomplete and never equivalent to approved. |
| `PLANNING_ONLY` | Safe for planning display, not build or execution approval. |
| `EVIDENCE_NEEDED` | Needs sanitized evidence before further reliance. |
| `BLOCKED_BY_UNKNOWN_DEPENDENCIES` | Blocked until dependency unknowns are resolved. |
| `READY_FOR_OWNER_REVIEW` | Ready for planning owner review only. |
| `READY_FOR_NON_PRODUCTION_BUILD` | Future planning status only; not a build approval in this phase. |
| `NO` | Should not look successful unless it means no production impact or no live behavior. |

Approved states should not be used unless explicitly approved in a future phase.

## 19. Read-Only Interaction Model

Allowed:

- view
- search
- filter
- sort
- expand/collapse
- navigate
- copy safe summary
- export safe planning summary later, not now

Prohibited:

- mutate data
- approve workflows
- approve dry run
- approve production
- assign production owners
- create GitHub issues
- create routes
- create fixtures
- trigger jobs
- query live systems
- write live systems
- send emails
- invoice customers
- change external systems

## 20. Static/Mock Data Assumptions For Later Build

Future static/mock data might include:

- workflow registry fixture
- domain registry fixture
- owner category fixture
- status lifecycle fixture
- strict gate profile fixture
- legacy workflow matrix fixture
- future platform workflow fixture
- blocker fixture
- evidence source metadata fixture
- phase gate fixture
- prohibited action fixture

No fixtures are created in this phase. No JSON files, seed files, schemas, migrations, collections, tables, APIs, jobs, routes, UI components, or resources are created in this phase.

## 21. Build Priority Proposal For Later Phase

Recommended later build order:

1. Static overview page using mock/local data
2. Workflow taxonomy browser
3. Legacy 16 matrix
4. Blocker matrix
5. Phase gates
6. Prohibited actions
7. Evidence source registry
8. Manual review decisions
9. Owner/rollback queue
10. Issue tracker
11. Data model planning view

This does not approve the build. It only proposes an order for future planning if Drip/ChatGPT later approves a non-production dashboard build phase.

## 22. What Remains Prohibited

- no deploy
- no Apps Script edits
- no live Sheets writes
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
- no workflow registry code
- no registry fixture creation
- no Phase 3 start

## 23. Recommended Next Phase 2 Actions

1. Merge this wireframe / route plan after review.
2. Create issue template drafts for workflow blocker resolution.
3. Create a local/mock fixture planning document in a later phase.
4. Create an Admin Dashboard v0 static build plan only after fixture planning.
5. Keep Phase 3 blocked.

## Phase 2.42 Safety Confirmation

Production impact is `NONE`.

No live systems were queried or modified. No Apps Script files, triggers, live Sheets, Gmail, Stripe, ScreenCloud, YouTube, redirects, QR codes, uploads, imports, market intelligence data, provider records, advertiser records, vendor records, employer records, organization records, user records, campaign records, billing records, Firestore collections, BigQuery tables, Cloud Run services, GCP resources, DNS records, or production resources were created, queried, or modified by this document.

Phase 3 remains blocked. Phase 3 dry run remains `NOT_APPROVED`. Production behavior allowed remains `NO`.
