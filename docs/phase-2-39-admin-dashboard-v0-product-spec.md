# Phase 2.39 Admin Dashboard v0 Product Spec

## 1. Purpose

Admin Dashboard v0 is the first internal dashboard planning surface for Drip's migration and platform workflow control layer.

This is a product spec only. It does not build the dashboard. It does not create routes, UI components, APIs, schemas, Firestore collections, BigQuery tables, Cloud Run services, jobs, or production resources.

This spec does not approve Phase 3. It does not approve a limited dry run. It does not approve production writes. It does not approve live operational admin actions. It does not approve deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, revenue-share calculations, or production data ingestion.

Admin Dashboard v0 should be internal-only, non-production, read-only, evidence/gate/status focused, extensible for future Drip platform workflows, and blocked from live operational actions.

## 2. Inputs

This spec uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- The 16 manual workflow reviews
- The expanded 16-workflow readiness tracker
- Existing evidence/gate tooling

These inputs are referenced at a planning level only. This spec does not copy raw private evidence, generated private tracker output, private review files, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Admin Dashboard v0 Principles

- internal-only
- non-production
- read-only
- no live writes
- no live approvals
- no live billing actions
- no live emails
- no live redirects
- no live QR creation
- no live ScreenCloud or YouTube actions
- no live Apps Script or Sheet edits
- evidence over assumption
- partial evidence is not production proof
- every workflow needs owner and rollback before build
- future workflows start as planning-only
- no-PHI guardrails

Admin Dashboard v0 may help Drip see what is blocked. It must not become a control surface for changing live operations.

## 4. Primary Users

These are role categories, not production user accounts, permissions, or identity records yet.

| Role category | Expected v0 need |
| --- | --- |
| Drip founder/operator | See migration gate status, workflow readiness, blockers, risks, and next planning actions. |
| Product owner | Review workflow taxonomy, dashboard scope, future product boundaries, and status lifecycle. |
| Operations owner | Track blockers, issue queues, owner gaps, rollback gaps, and prohibited actions. |
| Engineering owner | Understand evidence boundaries, future data model needs, and no-live-system constraints. |
| Billing owner | See billing and revenue-share blockers without invoice, Stripe, payment, or payout actions. |
| Display operations owner | See display-provider and playlist blockers without ScreenCloud or YouTube actions. |
| Campaign operations owner | See campaign workflow status without live approval, scheduling, targeting, or delivery actions. |
| Provider success owner | See provider onboarding/display preference blockers without live provider onboarding actions. |
| Advertiser/vendor success owner | See buyer-side onboarding and campaign access blockers without live account changes. |
| Sales owner | See future sales workflow taxonomy and planning status without CRM/source-of-truth commitments. |
| Marketing owner | See future funnel and website workflow taxonomy without live page, form, or route changes. |
| Data/analytics owner | See future reporting and event-model needs without ingestion approval. |
| Compliance/policy owner | See policy, safety, no-PHI, terms, and audit needs without production enforcement actions. |

## 5. Dashboard v0 Information Architecture

| Section | Purpose | Primary fields | Allowed actions | Prohibited actions | Future upgrade path |
| --- | --- | --- | --- | --- | --- |
| Overview / Gate Status | Show the current migration gate, readiness score, and safety posture. | Gate, dry-run status, readiness score, production impact, Phase 3 started, counts, timestamps. | View, filter, sort, prepare planning notes. | Approve Phase 3, approve dry run, start work, deploy, write live systems. | v1 can add saved views and mock/local status snapshots. |
| Workflow Taxonomy Browser | Browse legacy migration workflows and future platform workflows together. | Workflow ID, name, domain, owner category, user type, entities, risks, status. | View, filter, sort, prepare planning notes. | Create production workflow records, promote statuses, trigger operational actions. | v1 can add a local workflow registry draft. |
| Legacy 16 Workflow Matrix | Show the migration-readiness control layer for the reviewed legacy workflows. | Review status, partial evidence, handler, caller, Sheet read/write, trigger, owner, rollback, dry-run eligibility. | View, filter, sort, prepare planning notes. | Mark dry-run eligible, approve production behavior, edit Apps Script or Sheets. | v1 can add non-production issue links. |
| Future Platform Workflow Catalog | Show the broader Drip distribution platform workflow taxonomy. | Workflow ID, domain, name, status, owner, user type, entities, external systems, strict gates. | View, filter, sort, prepare planning notes. | Add production workflows, create external resources, approve live behavior. | v1 can add a mock/local registry. |
| Blocker Matrix | Show common blocker categories and workflow-specific status. | Category, severity, evidence needed, owner needed, next action, v0 display/resolution flags. | View, filter, sort, prepare planning notes. | Resolve blockers as production facts, approve dry run, assign production owners. | v1 can add local issue draft creation. |
| Evidence Source Registry | Show sanitized evidence metadata and review status. | Source ID, type, sanitized/private boundary, related workflows, confidence, redaction status. | View sanitized metadata, filter, sort, prepare planning notes. | Display raw private evidence, expose secrets, commit generated evidence. | v1 can add import from sanitized local summaries. |
| Manual Review Decision Matrix | Show manual decision fields and design/prod safety interpretation. | Workflow, decision field, value, evidence basis, unknowns, next evidence target, design/prod safety. | View, filter, sort, prepare planning notes. | Treat partial evidence as production proof, approve production, approve dry run. | v1 can add reviewer note drafts. |
| Owner Needed / Rollback Needed Queue | Highlight workflows missing owner or rollback decisions. | Workflow, missing owner, missing rollback, severity, risk, suggested owner category, status. | View, filter, sort, prepare planning notes. | Assign production owners, approve rollback, approve dry run, approve production change. | v1 can add local planning assignments. |
| Phase Gate Detail | Explain each phase gate and what remains unresolved. | Phase, gate status, dry-run status, impact, started flag, approvals, blockers, prohibited actions. | View, filter, sort, prepare planning notes. | Change gate state, approve dry run, start Phase 3. | v1 can add local gate history. |
| Issue Tracker | Track planning-only blocker issues. | Issue ID, workflow, domain, blocker category, severity, owner category, status, evidence needed. | View, filter, sort, prepare planning notes. | Create GitHub issues, assign production owners, change live systems. | v1 may design local-only issue drafts. |
| Prohibited Actions Panel | Keep safety boundaries visible. | Prohibited action, related workflows, reason, severity, current status. | View, filter, sort, acknowledge in planning notes. | Override prohibitions or execute prohibited actions. | v1 can add static guardrail checks. |
| Data Model Planning View | Show conceptual model needs without creating schemas. | Entity, purpose, related sections, source-of-truth status, production status. | View, filter, sort, prepare planning notes. | Create schemas, Firestore collections, BigQuery tables, Cloud Run jobs. | v1 can add mock/local model drafts. |

Allowed v0 actions are limited to viewing, filtering, sorting, and planning notes in a non-production future build. No live operational action is allowed in v0.

## 6. Overview / Gate Status Requirements

| Field | Current expected value or rule |
| --- | --- |
| Overall gate recommendation | PHASE_3_BLOCKED |
| Phase 3 dry-run status | NOT_APPROVED |
| Readiness score | BLOCKED_PROGRESSING |
| Production impact | NONE |
| Phase 3 started | NO |
| Manual reviews found | 16 of 16 when local private evidence is present |
| Workflows summarized | 16 when local private evidence is present |
| Workflows dry-run eligible | 0 |
| Workflows blocked | 16 legacy migration workflows remain blocked |
| Workflows with partial evidence | Display count from sanitized tracker/reviews only |
| Workflows missing owner | Display count from sanitized tracker/reviews only |
| Workflows missing rollback | Display count from sanitized tracker/reviews only |
| Last tracker generated at | Metadata only; no generated private tracker content |
| Last evidence status check | Metadata only; no generated private report content |

The v0 overview should be visually conservative: blocked states should look blocked, partial states should not look approved, and missing evidence should remain `UNKNOWN`.

## 7. Workflow Taxonomy Browser Requirements

The taxonomy browser should support both legacy migration workflows and future platform workflows.

Required fields:

- workflow ID
- workflow name
- domain
- legacy migration workflow? yes/no
- future platform workflow? yes/no
- primary owner category
- related owner categories
- user types
- main entities
- source-of-truth status
- status lifecycle state
- risks
- external systems
- production behavior allowed? no
- dry-run eligible? no unless explicitly approved later
- notes

Every new future workflow should default to `PLANNING_ONLY`. A taxonomy entry is not a production approval, migration approval, or dry-run approval.

## 8. Legacy 16 Workflow Matrix Requirements

All dry-run eligibility values remain `NO`.

| Workflow | Manual review file present | Current review status | Partial evidence signals | Handler/mode status | Caller/route/form/trigger/job status | Sheet read status | Sheet write status | Trigger/schedule/job status | Owner status | Rollback status | Ingestion decision | Dry-run eligibility | Recommended next evidence target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Conference Campaigns | YES when local evidence exists | PARTIAL | Route/context signal only | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Sanitized handler and route-owner map |
| Patient Campaigns | YES when local evidence exists | PARTIAL | Route/context signal only | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Cross-workflow dependency map |
| Provider Campaigns | YES when local evidence exists | PARTIAL | No production-confirmed caller | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Provider Media Center workflow split |
| ScreenCloud/display provider operations | YES when local evidence exists | PARTIAL | Display-provider dependency signal | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Display-provider boundary map |
| Provider display preferences | YES when local evidence exists | PARTIAL | Display eligibility dependency signal | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Preference schema and eligibility decision map |
| Admin review workflows | YES when local evidence exists | PARTIAL | Admin route/context signal | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Admin workflow state map |
| Stripe invoicing | YES when local evidence exists | PARTIAL | Billing dependency planning signal | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Billing boundary and no-write design |
| Video/playback billing | YES when local evidence exists | PARTIAL | Playback metric dependency planning signal | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Playback event model |
| Patient Campaign QR scan logging | YES when local evidence exists | PARTIAL | Route/context signal | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | QR event schema and route ownership |
| Provider revenue share | YES when local evidence exists | PARTIAL | Planning/context signal only | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Calculation boundary and exclusion rules |
| YouTube/playlist operations | YES when local evidence exists | PARTIAL | Planning/intake context only | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Playlist read/write boundary |
| Provider signup | YES when local evidence exists | PARTIAL | Route/form-intake context only | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Intake and record-creation map |
| Advertiser/vendor/employer signup | YES when local evidence exists | PARTIAL | Route/form-intake context only | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Intake and org/user creation boundary |
| QR redirects | YES when local evidence exists | PARTIAL | Route/context signal only | UNKNOWN | PARTIAL/UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Target-map inventory and fallback rules |
| Market intelligence uploads | YES when local evidence exists | PARTIAL | Planning/upload context only | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Upload boundary and schema draft |
| Welcome emails | YES when local evidence exists | PARTIAL | Notification planning signal only | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Notification trigger and no-send boundary |

## 9. Future Platform Workflow Catalog Requirements

The catalog should group workflows by the 20 domains from Phase 2.38.

For each future workflow, show:

- workflow ID
- domain
- workflow name
- status, default `PLANNING_ONLY`
- owner category
- user type
- main entities
- external systems
- strict-gate required? yes/no
- v0 visibility? yes/no
- production behavior allowed now? no

Strict-gate workflows include billing, payments, revenue share, email, redirects, QR creation, ScreenCloud, YouTube, uploads/imports, live Sheet writes, Apps Script changes, live GCP resources, and production data ingestion.

## 10. Blocker Matrix Requirements

| Blocker category | Applies to workflows | Severity | Current status | Evidence needed | Owner category needed | Suggested next action | Can v0 display it? | Can v0 resolve it? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| active handler/mode | Legacy 16 and any future migration workflow | HIGH | UNKNOWN | Sanitized handler/mode map | Engineering owner | Gather sanitized handler evidence | YES | NO |
| production caller/route/form/trigger/job proof | All migration workflows | HIGH | UNKNOWN/PARTIAL | Sanitized caller, route, form, trigger, job map | Engineering owner; operations owner | Confirm active production callers without live changes | YES | NO |
| current read behavior | All migration workflows | HIGH | UNKNOWN | Sanitized read path summary | Engineering owner; data/analytics owner | Map read sources and tabs | YES | NO |
| current write behavior | All migration workflows | HIGH | UNKNOWN | Sanitized write path summary | Engineering owner; operations owner | Map write destinations and guardrails | YES | NO |
| trigger/schedule/job behavior | All migration workflows | HIGH | UNKNOWN | Sanitized trigger/job inventory | Engineering owner | Confirm schedules and job ownership | YES | NO |
| schema/event model | All workflows with future data model needs | MEDIUM | UNKNOWN/PARTIAL | Sanitized field and event model draft | Data/analytics owner; product owner | Draft non-production model | YES | NO |
| source-of-truth decision | All workflows | HIGH | UNKNOWN | Owner-approved source-of-truth decision | Product owner; engineering owner | Propose source-of-truth candidates | YES | NO |
| owner/cutover decision | All workflows | HIGH | UNKNOWN | Owner category and approval path | Product owner; operations owner | Assign proposed owner categories | YES | NO |
| rollback path | All workflows | HIGH | UNKNOWN | Rollback steps and fallback boundary | Engineering owner; operations owner | Draft rollback requirements | YES | NO |
| rollback owner/test status | All workflows | HIGH | UNKNOWN | Rollback owner and non-production test status | Operations owner; engineering owner | Identify rollback owner category | YES | NO |
| live-system boundary | All workflows | CRITICAL | BLOCKING | Written read/write/live-system boundary | Engineering owner; compliance/policy owner | Keep v0 read-only | YES | NO |
| ingestion decision | All data workflows | HIGH | UNKNOWN | Inclusion/exclusion decision and schema readiness | Data/analytics owner | Keep ingestion blocked | YES | NO |
| explicit Drip/ChatGPT approval | Any future dry-run or production workflow | CRITICAL | NOT_APPROVED | Written scope approval | Drip founder/operator; product owner | Keep blocked until approval | YES | NO |

## 11. Evidence Source Registry Requirements

Future v0 may show only sanitized summaries, metadata, and decision statuses. It must not show raw private evidence.

Required fields:

- evidence source ID
- source type
- sanitized/private boundary
- related workflows
- related domains
- last reviewed at
- reviewer decision
- confidence level
- redaction status
- safe to display in v0? yes/no
- raw private evidence committed? no

Evidence marked unsafe, raw, sensitive, or private-only should be omitted from v0 display except for sanitized metadata such as "source exists" or "review required."

## 12. Manual Review Decision Matrix Requirements

Required fields:

- workflow
- decision field
- decision value
- evidence basis
- unknowns
- next evidence target
- reviewer notes
- safe to use for design?
- safe to use for production?
- dry-run impact

`PARTIAL_DEPENDENCY_CONFIRMED` means design signal only. `UNKNOWN` remains blocking. No decision currently approves production behavior. No decision currently approves a limited dry run.

## 13. Owner Needed / Rollback Needed Queue Requirements

Required fields:

- workflow
- missing owner category
- missing rollback path
- severity
- risk category
- suggested owner category
- suggested rollback evidence
- status
- notes

Allowed v0 actions:

- view
- filter
- sort
- prepare planning notes

Prohibited v0 actions:

- assign production owners
- approve rollback
- approve dry run
- approve production change

## 14. Phase Gate Detail Requirements

Required fields:

- phase
- gate status
- dry-run status
- production impact
- started?
- required approvals
- unresolved blockers
- prohibited actions
- next planning action

Required gates:

| Phase gate | Gate status | Dry-run status | Production impact | Started? | Next planning action |
| --- | --- | --- | --- | --- | --- |
| Phase 2 evidence/planning | IN_PROGRESS_PLANNING | NOT_APPROVED_FOR_PRODUCTION | NONE | YES | Continue documentation, registry, and model planning. |
| Phase 3 limited non-production dry-run review | PHASE_3_BLOCKED | NOT_APPROVED | NONE | NO | Resolve blockers and seek explicit future approval before any review. |
| Future production review | NOT_APPROVED | NOT_APPROVED | NONE | NO | Requires future evidence, owner, rollback, dry-run, and approval package. |

## 15. Issue Tracker Requirements

Issue tracker v0 is planning-only. It does not create GitHub issues unless a later phase explicitly designs that.

Required fields:

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
- notes
- linked document or evidence source
- production impact
- phase gate impact

The issue tracker should help organize blocker work. It must not assign production owners, change production workflows, create production tickets, or trigger live actions.

## 16. Prohibited Actions Panel Requirements

Warnings visible in v0:

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
- Do not use partial evidence as production proof

The panel should remain visible in any future v0 dashboard experience.

## 17. Data Model Planning View Requirements

Conceptual entities that v0 may eventually display:

- `workflow_reviews`
- `workflow_blockers`
- `evidence_sources`
- `manual_review_decisions`
- `phase_gates`
- `admin_issues`
- `workflow_registry`
- `workflow_domains`
- `workflow_owners`
- `rollback_requirements`
- `prohibited_actions`

This is a display/planning model only. Do not create schemas, migrations, Firestore collections, BigQuery tables, Cloud Run services, jobs, APIs, or production resources yet.

## 18. Status Lifecycle Usage

Admin Dashboard v0 may display the status lifecycle from Phase 2.38:

- `PLANNING_ONLY`
- `EVIDENCE_NEEDED`
- `DESIGN_READY_NON_PRODUCTION`
- `BLOCKED_BY_UNKNOWN_DEPENDENCIES`
- `READY_FOR_OWNER_REVIEW`
- `READY_FOR_NON_PRODUCTION_BUILD`
- `READY_FOR_LIMITED_DRY_RUN_REVIEW`
- `APPROVED_FOR_LIMITED_DRY_RUN`
- `READY_FOR_PRODUCTION_REVIEW`
- `APPROVED_FOR_PRODUCTION`
- `ACTIVE`
- `PAUSED`
- `RETIRED`

No workflow should be moved into dry-run or production-approved statuses without later explicit approval. Current migration workflows should remain blocked, partial, or planning-only until evidence, owner, rollback, source-of-truth, and approval requirements are satisfied.

## 19. Future Dashboard Versions

### v0

Evidence/gate/status only.

### v1

Possible non-production workflow registry and issue tracker build.

### v2

Possible operational dashboard design after owner, rollback, and source-of-truth decisions.

### v3

Possible limited production admin tools only after future approvals.

v1, v2, and v3 are future concepts only. They do not approve build work, dry runs, production behavior, live credentials, live system queries, live writes, or deployments.

## 20. Out Of Scope For v0

- live campaign approval
- live provider onboarding
- live advertiser/vendor/employer onboarding
- live billing
- live invoice creation
- live revenue-share calculation
- live payout review
- live redirect management
- live QR creation
- live email sending
- live ScreenCloud management
- live YouTube management
- live Sheet writes
- live Apps Script changes
- live GCP resource creation
- production user management
- production data ingestion

## 21. Acceptance Criteria For Future Admin Dashboard v0 Build

A later build PR would need:

- read-only data source
- no live credentials
- no production writes
- static/mock/local data first
- explicit status labels
- prohibited action warnings
- workflow taxonomy browser
- blocker matrix
- phase gate panel
- no operational mutations
- tests
- no private data committed

This future build criteria does not approve the build now.

## 22. Recommended Next Phase 2 Actions

1. Merge this product spec after review.
2. Create non-production data model draft for evidence/gate/workflow tracking.
3. Create workflow registry draft.
4. Create Admin Dashboard v0 wireframe or route plan using static/mock data only.
5. Create issue templates for blocker resolution.
6. Keep Phase 3 blocked.

## Phase 2.39 Safety Confirmation

| Field | Confirmation |
| --- | --- |
| Production impact | NONE |
| Live systems queried or modified | NO |
| Generated private tracker committed | NO |
| Raw private evidence committed | NO |
| Phase 3 started | NO |
| Limited dry run approved | NO |
| Production behavior approved | NO |
| Dashboard built | NO |
