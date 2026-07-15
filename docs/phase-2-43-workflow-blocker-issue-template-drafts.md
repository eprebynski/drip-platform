# Phase 2.43 Workflow Blocker Issue Template Drafts

## 1. Purpose

This document defines planning-only issue template drafts for future workflow blocker resolution.

This is documentation and planning only. It does not create GitHub issue templates. It does not create `.github/ISSUE_TEMPLATE` files. It does not create GitHub issues. It does not create labels. It does not assign owners. It does not build the dashboard. It does not create routes, UI components, pages, APIs, schemas, fixtures, migrations, seed files, Firestore collections, BigQuery tables, Cloud Run services, jobs, GCP resources, or production resources.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, market intelligence changes, or revenue-share calculations.

## 2. Inputs

This issue-template draft uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- Phase 2.41 workflow registry draft
- Phase 2.42 Admin Dashboard v0 wireframe / route plan
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This draft does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Issue Template Principles

- issue templates are planning tools only
- no issue template can approve Phase 3
- no issue template can approve dry run
- no issue template can approve production behavior
- evidence must be sanitized
- partial evidence is not production proof
- `UNKNOWN` remains blocking
- owner categories are planning categories only
- rollback must be documented before build
- live-system boundaries must be explicit
- strict-gate workflows require extra review
- no-PHI guardrails
- no private evidence committed

Issue templates can later help organize blocker resolution work. They must not become approval surfaces or operational controls.

## 4. Proposed Issue Template Types

These are future issue template drafts only. No GitHub issue templates, issues, labels, or assignments are created in this phase.

| Template type | Purpose | When to use | Primary owner category | Related dashboard view | Related conceptual entity | Strict gate required? | Production behavior allowed now? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `workflow_blocker_resolution` | Track a specific blocker for a workflow. | A blocker needs evidence, owner, rollback, or decision work. | `operations_owner` | Blockers; Workflow detail | `workflow_blockers` | Depends on workflow | NO |
| `evidence_needed` | Request sanitized evidence needed to resolve an unknown. | Evidence is missing, unsafe, private, or too partial. | `engineering_owner` | Evidence Sources | `evidence_sources` | Depends on evidence type | NO |
| `owner_decision_needed` | Clarify owner category and decision path. | Owner or cutover authority is unknown. | `product_owner` | Owners & Rollback | `workflow_owners` | Depends on workflow | NO |
| `rollback_decision_needed` | Track rollback path and fallback needs. | Rollback path, owner, or test status is missing. | `operations_owner` | Owners & Rollback | `rollback_requirements` | YES | NO |
| `source_of_truth_decision` | Decide future source-of-truth status. | Data ownership, read path, or write path is unknown. | `product_owner` | Data Model; Workflow detail | `workflow_registry` | Depends on external systems | NO |
| `external_system_boundary_review` | Document read/write/credential boundaries. | Workflow touches external systems or live services. | `engineering_owner` | Prohibited Actions; Workflow detail | `external_system_boundaries` | YES | NO |
| `strict_gate_review` | Review strict gate requirements. | Workflow involves billing, email, redirect, QR, external write, upload/import, production ingestion, or policy risk. | `engineering_owner` | Phase Gates | `phase_gates` | YES | NO |
| `manual_review_unknown_field` | Track one unresolved manual review field. | A review value remains `UNKNOWN`. | `operations_owner` | Manual Review Decisions | `manual_review_decisions` | Depends on field | NO |
| `phase_gate_review` | Review phase readiness and approvals. | Phase gate status needs planning review. | `drip_founder_operator` | Phase Gates | `phase_gates` | YES | NO |
| `admin_dashboard_v0_followup` | Track dashboard planning followups. | A read-only dashboard field, panel, or view needs clarification. | `product_owner` | Issues; Data Model | `admin_issues` | NO | NO |
| `data_model_planning_followup` | Track conceptual data model needs. | Entity, relationship, or field planning is unresolved. | `data_analytics_owner` | Data Model | `data_model_notes` | Depends on entity | NO |
| `workflow_registry_followup` | Track registry entry changes or questions. | Workflow metadata or registry values need review. | `product_owner` | Workflows | `workflow_registry` | Depends on workflow | NO |
| `prohibited_action_review` | Review an action that must remain blocked. | A prohibited action needs explicit documentation or review. | `compliance_policy_owner` | Prohibited Actions | `prohibited_actions` | YES | NO |
| `future_platform_workflow_intake` | Draft future planning-only workflow entries. | A new platform workflow needs taxonomy intake. | `product_owner` | Future Platform Catalog | `workflow_registry` | Depends on workflow | NO |
| `legacy_migration_workflow_followup` | Track followup for one of the 16 legacy workflows. | Legacy workflow evidence, owner, rollback, or gate remains unresolved. | `engineering_owner` | Legacy 16 Matrix | `workflow_reviews` | YES | NO |

## 5. Shared Issue Fields

Every future issue template should include these common fields.

| Field | Purpose | Conservative default |
| --- | --- | --- |
| `issue_type` | Template type. | Required |
| `workflow_id` | Related workflow identifier. | Required when workflow-linked |
| `workflow_name` | Safe workflow display name. | Required when workflow-linked |
| `primary_domain_id` | Primary workflow domain. | `UNKNOWN` if not known |
| `related_domain_ids` | Supporting domains. | Empty or `UNKNOWN` |
| `legacy_migration_workflow` | Whether the workflow is one of the legacy 16. | `UNKNOWN` |
| `future_platform_workflow` | Whether the workflow belongs to future platform taxonomy. | `UNKNOWN` |
| `current_status` | Current safe planning status. | `UNKNOWN` |
| `blocker_category` | Blocker category if applicable. | `UNKNOWN` |
| `severity` | Planning severity. | `UNKNOWN` |
| `owner_category_needed` | Owner category needed for review. | `UNKNOWN` |
| `rollback_needed` | Whether rollback planning is needed. | `UNKNOWN` |
| `source_of_truth_status` | Source-of-truth status. | `UNKNOWN` |
| `external_systems` | External system categories. | Empty or `UNKNOWN` |
| `strict_gate_profile` | Related strict gate profile. | `UNKNOWN` |
| `evidence_needed` | Sanitized evidence request. | Required when unresolved |
| `safe_evidence_summary` | Safe summary only. | `UNKNOWN` |
| `unknowns` | Unresolved unknown fields. | Required |
| `recommended_next_action` | Planning-only next action. | Required |
| `production_impact` | Expected production impact of issue work. | `NONE` |
| `phase_gate_impact` | Related phase gate impact. | `PHASE_3_BLOCKED` if relevant |
| `dry_run_eligible` | Dry-run eligibility. | `NO` |
| `production_behavior_allowed` | Production behavior allowance. | `NO` |
| `private_evidence_included` | Whether private evidence is included in the issue. | `NO` |
| `raw_private_evidence_committed` | Whether raw private evidence is committed. | `NO` |
| `approval_required` | Whether explicit approval is needed for later work. | `YES` for strict gates |
| `notes` | Sanitized planning notes. | Empty |

Conservative defaults are `production_impact: NONE`, `dry_run_eligible: NO`, `production_behavior_allowed: NO`, `private_evidence_included: NO`, and `raw_private_evidence_committed: NO`.

## 6. Template Draft: `workflow_blocker_resolution`

Purpose: track a specific workflow blocker through sanitized evidence review and planning decisions.

Sections:

- Summary
- Workflow
- Blocker category
- Current blocker status
- Evidence needed
- Safe evidence summary
- Unknowns
- Owner category needed
- Rollback requirement
- Source-of-truth decision
- External-system boundary
- Strict gate profile
- Phase gate impact
- Acceptance criteria
- Prohibited actions
- Safety confirmation

Acceptance criteria:

- sanitized evidence summary is present
- no raw private evidence is included
- owner category is identified or remains explicitly `UNKNOWN`
- rollback need is identified or remains explicitly `UNKNOWN`
- source-of-truth status is updated or remains explicitly `UNKNOWN`
- blocker remains unresolved unless evidence is sufficient
- no Phase 3 approval is granted
- no dry-run approval is granted
- no production approval is granted

## 7. Template Draft: `evidence_needed`

Purpose: request sanitized evidence without committing private source material.

Sections:

- Evidence request summary
- Related workflow
- Related blocker
- Evidence type needed
- Sanitized evidence format
- Private evidence boundary
- Safe-to-display decision
- Confidence level
- Redaction status
- Next review step
- Acceptance criteria
- Safety confirmation

Acceptance criteria:

- requested evidence type is specific
- safe file format or summary format is identified
- sensitive values to redact are listed
- raw private evidence remains outside the repo
- safe-to-display decision is explicit
- confidence level is `HIGH`, `MEDIUM`, `LOW`, or `UNKNOWN`
- unresolved fields remain `UNKNOWN`

## 8. Template Draft: `owner_decision_needed`

Purpose: clarify the planning owner category needed for blocker, cutover, or approval review.

Sections:

- Owner decision summary
- Related workflow
- Candidate owner category
- Supporting owner categories
- Decision needed
- Cutover decision needed?
- Approval needed?
- Escalation category
- What owner can decide
- What owner cannot decide
- Safety confirmation

Owner categories do not grant production authority. They are planning labels only and do not assign people, permissions, accounts, approval rights, or operational access.

## 9. Template Draft: `rollback_decision_needed`

Purpose: document rollback requirements before any future build or cutover planning.

Sections:

- Rollback decision summary
- Related workflow
- Rollback path needed
- Fallback system category
- Stop condition
- Rollback owner category
- Rollback test status
- Evidence needed
- Acceptance criteria
- Safety confirmation

Acceptance criteria:

- rollback need is explicit
- fallback system category is identified or remains `UNKNOWN`
- stop condition is documented or remains `UNKNOWN`
- rollback owner category is identified or remains `UNKNOWN`
- no rollback is approved for production by this issue

## 10. Template Draft: `source_of_truth_decision`

Purpose: document source-of-truth decisions needed before data model, dashboard, or migration work.

Sections:

- Source-of-truth decision summary
- Related workflow
- Current source-of-truth status
- Candidate source-of-truth options
- Read path
- Write path
- Current unknowns
- Migration/cutover impact
- Rollback impact
- Acceptance criteria
- Safety confirmation

Acceptance criteria:

- candidate source-of-truth options are sanitized
- read path is described at category level
- write path is described at category level
- unknowns remain visible
- migration/cutover impact is planning-only
- no live system is queried or modified

## 11. Template Draft: `external_system_boundary_review`

Purpose: document live-system, credential, read, write, dry-run, and production boundaries.

Sections:

- Boundary review summary
- Related workflow
- External system category
- Read boundary
- Write boundary
- Credential boundary
- Dry-run boundary
- Production boundary
- Strict gate required
- Rollback/fallback
- Prohibited actions
- Acceptance criteria

External system categories include:

- Apps Script
- Google Sheets
- Gmail/email
- Stripe
- ScreenCloud/display provider
- YouTube
- redirects/QR
- uploads/imports
- Firestore
- BigQuery
- Cloud Run
- GCP
- Squarespace/public site

Acceptance criteria:

- read boundary is explicit
- write boundary is explicit
- credential boundary is explicit
- dry-run boundary remains blocked unless later approved
- production boundary remains blocked unless later approved
- rollback/fallback need is documented
- prohibited actions are listed

## 12. Template Draft: `strict_gate_review`

Purpose: define extra review requirements for strict-gate workflows.

| Gate profile | Required evidence | Required owner categories | Rollback required? | Dry-run allowed now? | Production allowed now? | What remains blocked |
| --- | --- | --- | --- | --- | --- | --- |
| `standard_planning_gate` | Sanitized workflow description, owner category, safe display review. | `product_owner` or relevant domain owner | YES before build | NO | NO | Build, dry run, production. |
| `migration_blocker_gate` | Sanitized review, blocker, owner, rollback, handler/caller/read/write evidence. | `engineering_owner`, `operations_owner`, `drip_founder_operator` | YES | NO | NO | Phase 3, dry run, production. |
| `external_system_gate` | Boundary map, credential plan, no-write guard, rollback plan. | `engineering_owner`, domain owner | YES | NO | NO | External reads/writes and credentials. |
| `billing_payment_gate` | Billing boundary, finance review, invoice/payment no-write proof, rollback plan. | `billing_owner`, `engineering_owner`, `drip_founder_operator` | YES | NO | NO | Stripe, invoices, payment changes. |
| `email_notification_gate` | Template/source review, no-send guard, recipient boundary, rollback plan. | `operations_owner`, `compliance_policy_owner`, `engineering_owner` | YES | NO | NO | Email sending and notification activation. |
| `redirect_qr_gate` | Target map, fallback, route owner, no-live-change guard. | `campaign_operations_owner`, `engineering_owner` | YES | NO | NO | Redirect changes and QR creation. |
| `display_youtube_gate` | Adapter boundary, playlist/display write guard, rollback/fallback plan. | `display_operations_owner`, `engineering_owner` | YES | NO | NO | ScreenCloud, display provider, and YouTube writes. |
| `upload_import_gate` | Upload boundary, schema review, storage rules, no-import guard. | `data_analytics_owner`, `engineering_owner` | YES | NO | NO | Uploads, imports, and file ingestion. |
| `production_ingestion_gate` | Source-of-truth, schema, privacy, ingestion, and rollback review. | `data_analytics_owner`, `engineering_owner`, `compliance_policy_owner` | YES | NO | NO | Production data ingestion and reporting writes. |
| `revenue_share_gate` | Calculation boundary, finance review, no-payment guard, rollback plan. | `billing_owner`, `drip_founder_operator`, `engineering_owner` | YES | NO | NO | Revenue-share calculation and payment. |
| `compliance_policy_gate` | Policy review, audit model, no-PHI confirmation, owner approval. | `compliance_policy_owner`, `product_owner`, `engineering_owner` | YES | NO | NO | Policy enforcement, production activation, and audit claims. |

## 13. Template Draft: `manual_review_unknown_field`

Purpose: track one unresolved manual review field that blocks confidence.

Sections:

- Unknown field summary
- Related workflow
- Decision field
- Current value: `UNKNOWN`
- Why this blocks progress
- Evidence needed
- Safe-for-design impact
- Safe-for-dry-run impact
- Safe-for-production impact
- Acceptance criteria

Acceptance criteria:

- the unknown field is named
- evidence needed is specific and sanitized
- safe-for-design impact is explicit
- safe-for-dry-run remains `NO` unless later approved
- safe-for-production remains `NO` unless later approved

## 14. Template Draft: `phase_gate_review`

Purpose: review phase gate status without changing or approving a gate.

Sections:

- Phase gate summary
- Phase
- Current gate status
- Dry-run status
- Readiness score
- Production impact
- Started?
- Required approvals
- Unresolved blockers
- Prohibited actions
- Acceptance criteria

Current values remain:

- `PHASE_3_BLOCKED`
- `NOT_APPROVED`
- `BLOCKED_PROGRESSING`
- `NONE`
- Phase 3 started: `NO`

Acceptance criteria:

- gate status is documented
- approvals needed are listed
- unresolved blockers remain visible
- no Phase 3 approval is granted
- no dry-run approval is granted
- no production behavior is approved

## 15. Template Draft: `admin_dashboard_v0_followup`

Purpose: capture future dashboard planning followups without approving dashboard implementation.

Sections:

- Dashboard followup summary
- Related dashboard view
- Related workflow/domain
- Read-only interaction
- Safe display fields
- Private/excluded fields
- Static/mock data need
- Prohibited interactions
- Build approval status
- Acceptance criteria

No dashboard build is approved by this template. Followups remain planning-only until a later explicit non-production build approval.

## 16. Template Draft: `data_model_planning_followup`

Purpose: capture future non-production data model planning needs.

Sections:

- Data model followup summary
- Related conceptual entity
- Related workflow/domain
- Field or relationship need
- Safe display status
- Private/excluded data
- Future fixture need
- Schema creation allowed now? `NO`
- Acceptance criteria

Acceptance criteria:

- entity or relationship need is described conceptually
- safe display status is explicit
- private/excluded data is named by category only
- future fixture need is planning-only
- schema creation remains `NO`

## 17. Template Draft: `workflow_registry_followup`

Purpose: capture future workflow registry questions or proposed planning changes.

Sections:

- Registry followup summary
- Related workflow/domain
- Registry field
- Current value
- Proposed value
- Evidence basis
- Safe display status
- Fixture creation allowed now? `NO`
- Acceptance criteria

Acceptance criteria:

- proposed value is sanitized
- evidence basis is safe to summarize
- unresolved values remain `UNKNOWN`
- fixture creation remains `NO`
- production behavior remains `NO`

## 18. Template Draft: `prohibited_action_review`

Purpose: document why a prohibited action must remain blocked.

Sections:

- Prohibited action summary
- Related workflow/domain
- Prohibited action
- Why prohibited
- Strict gate profile
- Approval required to change
- Current status
- Acceptance criteria

Prohibited actions cannot be overridden by an issue. Any future change would require explicit Drip/ChatGPT approval and a separate approved phase.

## 19. Template Draft: `future_platform_workflow_intake`

Purpose: intake future platform workflows as planning-only taxonomy entries.

Sections:

- Future workflow summary
- Proposed workflow ID
- Proposed domain
- Primary owner category
- Related owner categories
- User types
- Main entities
- External systems
- Strict gate profile
- Default status: `PLANNING_ONLY`
- Dry-run eligible: `NO`
- Production behavior allowed: `NO`
- Evidence needed
- Acceptance criteria

Acceptance criteria:

- workflow ID is proposed, not implemented
- domain is selected from the workflow taxonomy
- owner categories remain planning labels
- strict gate profile is identified or remains `UNKNOWN`
- no registry fixture is created
- no production behavior is approved

## 20. Template Draft: `legacy_migration_workflow_followup`

Purpose: track followup needs for one of the 16 legacy migration workflows.

Sections:

- Legacy workflow summary
- Legacy workflow ID
- Current blocker status
- Manual review status
- Handler/mode status
- Caller/route/form/trigger/job status
- Read behavior status
- Write behavior status
- Trigger/schedule/job status
- Owner status
- Rollback status
- Ingestion decision
- Dry-run eligibility: `NO`
- Production behavior allowed: `NO`
- Next evidence target
- Acceptance criteria

Acceptance criteria:

- legacy workflow ID is one of the 16 blocker-tracked workflows
- unknown handler/caller/read/write/trigger fields remain `UNKNOWN` until verified
- owner and rollback status remain explicit
- ingestion decision remains blocked unless later approved
- dry-run eligibility remains `NO`
- production behavior allowed remains `NO`

## 21. Suggested Labels For Future Planning Only

These labels are conceptual only and are not created in this phase:

- `phase-2-planning`
- `phase-3-blocked`
- `dry-run-not-approved`
- `production-impact-none`
- `workflow-blocker`
- `evidence-needed`
- `owner-needed`
- `rollback-needed`
- `source-of-truth-needed`
- `strict-gate`
- `external-system-boundary`
- `no-live-systems`
- `no-private-evidence`
- `admin-dashboard-v0`
- `workflow-registry`
- `data-model-planning`

No GitHub labels are created, assigned, or modified by this document.

## 22. Relationship To Admin Dashboard v0

Future issue templates could support these Admin Dashboard v0 planning views:

- Issues view: show planning-only issue categories, severity, workflow, blocker, owner category, and safe summary.
- Workflow detail pages: link workflow issues to blockers, evidence needs, strict gates, and prohibited actions.
- Blocker matrix: group issue drafts by blocker category, severity, owner category, rollback need, and evidence needed.
- Evidence sources: show sanitized evidence requests and safe-to-display status.
- Owner/rollback queue: show owner and rollback decision issue drafts.
- Phase gates: show phase-gate review issue drafts and required approvals.
- Prohibited actions: show prohibited-action review issue drafts and related strict gates.
- Data model planning view: show data-model followups and related conceptual entities.

Admin Dashboard v0 still cannot create, update, assign, label, close, or mutate GitHub issues. Any future issue integration would require explicit approval in a later non-production phase.

## 23. What Remains Prohibited

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
- no GitHub issue template creation
- no GitHub issue creation
- no GitHub label creation
- no Phase 3 start

## 24. Recommended Next Phase 2 Actions

1. Merge this issue template draft document after review.
2. Create a local/mock fixture planning document in a later phase.
3. Create an Admin Dashboard v0 static build plan only after fixture planning.
4. Consider actual GitHub issue templates only after explicit approval.
5. Keep Phase 3 blocked.

## Phase 2.43 Safety Confirmation

Production impact is `NONE`.

No live systems were queried or modified. No GitHub issue templates, GitHub issues, GitHub labels, Apps Script files, triggers, live Sheets, Gmail, Stripe, ScreenCloud, YouTube, redirects, QR codes, uploads, imports, market intelligence data, provider records, advertiser records, vendor records, employer records, organization records, user records, campaign records, billing records, Firestore collections, BigQuery tables, Cloud Run services, GCP resources, DNS records, or production resources were created, queried, or modified by this document.

Phase 3 remains blocked. Phase 3 dry run remains `NOT_APPROVED`. Production behavior allowed remains `NO`.
