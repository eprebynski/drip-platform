# Phase 2.44 Local/Mock Fixture Planning

## 1. Purpose

This document defines future local/mock fixture planning for Admin Dashboard v0.

This is documentation and planning only. It does not create fixtures. It does not create JSON files. It does not create seed files. It does not create schemas. It does not create migrations. It does not create APIs. It does not create routes, route files, UI components, pages, Firestore collections, BigQuery tables, Cloud Run services, jobs, GCP resources, GitHub issue templates, GitHub issues, GitHub labels, or production resources. It does not build the dashboard.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, market intelligence changes, or revenue-share calculations.

## 2. Inputs

This fixture planning document uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- Phase 2.41 workflow registry draft
- Phase 2.42 Admin Dashboard v0 wireframe / route plan
- Phase 2.43 workflow blocker issue template drafts
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This document does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Fixture Planning Principles

- mock/local data only in a later approved phase
- no live credentials
- no external system access
- no private evidence committed
- no-PHI guardrails
- static data should default to blocked, unknown, not-approved, or planning-only
- partial evidence must not look approved
- unknown fields must remain visible
- dry-run eligible defaults to `NO`
- production behavior allowed defaults to `NO`
- production impact defaults to `NONE`
- Phase 3 remains blocked
- future fixture creation requires explicit approval

Fixtures, if approved later, should help Admin Dashboard v0 display safe planning states. They must not become production records, source-of-truth records, dry-run approvals, operational data, or imported evidence.

## 4. Proposed Future Fixture Categories

These fixture categories are planning concepts only. No fixture files are created in this phase.

| Fixture category | Purpose | Dashboard views supported | Safe fields | Excluded/private fields | Default status posture | Production behavior allowed now? |
| --- | --- | --- | --- | --- | --- | --- |
| `phase_gate_summary` | Summarize phase gate posture. | Overview; Phase Gates | Gate status, dry-run status, readiness score, production impact, started flag, blocker counts, safe summary. | Generated tracker content, private approvals, private notes. | `PHASE_3_BLOCKED`, `NOT_APPROVED`, `BLOCKED_PROGRESSING`. | NO |
| `workflow_registry` | Catalog legacy and future workflows. | Workflows; Workflow detail | Workflow IDs, names, domains, categories, owner categories, strict gates, safe summary. | Raw evidence, private IDs, live URLs, customer data. | Legacy blocked; future `PLANNING_ONLY`. | NO |
| `workflow_domains` | Define workflow domain metadata. | Future Platform Catalog; Workflows | Domain IDs, names, descriptions, owner categories, safe risks. | Private evidence, source files, customer details. | Planning-only. | NO |
| `owner_categories` | Define planning owner categories. | Owners & Rollback; Issues | Owner category IDs, display names, scope, safe summary. | People, emails, accounts, permissions, live authority. | Planning-only. | NO |
| `status_lifecycle` | Define safe status values. | Workflows; Phase Gates | Status ID, meaning, allowed now, production behavior allowed. | Private approval artifacts. | Blocked/planning statuses only. | NO |
| `strict_gate_profiles` | Define strict gate requirements. | Phase Gates; Prohibited Actions; Workflow detail | Gate ID, required evidence category, owner categories, rollback required, blocked actions. | Credentials, endpoints, live system IDs. | All dry-run and production blocked. | NO |
| `legacy_workflow_matrix` | Represent the 16 legacy workflows. | Legacy 16 Matrix; Overview | Workflow status, unknowns, partial evidence signals, owner/rollback status, next evidence target. | Raw manual reviews, generated tracker content, private identifiers. | Blocked or evidence needed. | NO |
| `future_platform_workflows` | Represent future planning-only workflows. | Future Platform Catalog; Workflows | Workflow IDs, names, domains, owner category, strict gate, status. | Live operational records or customer data. | `PLANNING_ONLY`. | NO |
| `workflow_blockers` | Represent blocker records. | Blocker Matrix; Issues | Blocker ID, category, severity, status, evidence needed, owner needed, rollback needed, safe summary. | Raw evidence, private logs, private references. | Blocking or unknown. | NO |
| `evidence_sources` | Represent sanitized evidence metadata. | Evidence Sources; Workflow detail | Source ID, source type, sanitized boundary, confidence, redaction status, safe summary. | Raw evidence, screenshots, exports, private URLs, credentials. | Safe metadata only. | NO |
| `manual_review_decisions` | Represent sanitized manual decision fields. | Manual Review Decisions; Legacy 16 Matrix | Decision ID, workflow ID, decision field/value, evidence basis type, unknowns, safe summary. | Generated review content, reviewer private notes, raw evidence. | Safe-for-design only when supported. | NO |
| `workflow_owners` | Represent owner category needs. | Owners & Rollback; Issues | Workflow ID, owner category, ownership status, approval required, safe summary. | Personal names, emails, accounts, permissions. | Unknown or planning-only. | NO |
| `rollback_requirements` | Represent rollback planning needs. | Owners & Rollback; Blockers | Workflow ID, rollback status, fallback system, stop condition, test status, safe summary. | Private runbooks, live URLs, credentials. | Rollback needed or unknown. | NO |
| `admin_issues` | Represent planning-only issue drafts. | Issues; Blocker Matrix | Issue ID, type, workflow, severity, owner category, evidence needed, safe summary. | GitHub issue IDs if not approved, private evidence, assignees. | Open/planning-only. | NO |
| `prohibited_actions` | Represent prohibited actions. | Prohibited Actions; Phase Gates | Action ID, action name, reason, severity, related workflows, approval required. | Internal escalation data, credentials. | Prohibited. | NO |
| `external_system_boundaries` | Represent read/write boundary planning. | Prohibited Actions; Workflow detail | External system category, read boundary, write boundary, credential boundary, dry-run boundary. | Endpoints, tokens, private IDs, live credentials. | Writes blocked; dry run blocked. | NO |
| `data_model_notes` | Represent conceptual model notes. | Data Model | Entity name, note type, safe fields, excluded fields, related workflows. | Raw examples, private records, private evidence. | Planning-only. | NO |
| `dashboard_view_configs` | Represent future view configuration ideas. | All dashboard views | View ID, title, columns, filters, safe display rule, safe summary. | User preferences, auth state, production settings. | Planning-only. | NO |

## 5. Future Fixture File Naming Plan

Conceptual future file names:

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

These files are not created in this phase. The names are planning candidates only and may be revised in a later approved build plan.

## 6. Fixture Location Planning

Conceptual future location:

`packages/dashboard/src/admin-v0/mock-data/`

This directory is not created now. No files are created now. The location is a planning candidate only. A later build plan must approve the final location before any directory or file creation.

## 7. Shared Fixture Field Rules

Shared safe fields for future fixtures may include:

- `id`
- `type`
- `workflow_id`
- `domain_id`
- `display_name`
- `status`
- `safe_summary`
- `severity`
- `owner_category`
- `strict_gate_profile`
- `dry_run_eligible`
- `production_behavior_allowed`
- `production_impact`
- `phase_gate_status`
- `source_of_truth_status`
- `safe_to_display`
- `raw_private_evidence_committed`
- `notes`

Conservative defaults:

- `dry_run_eligible`: `NO`
- `production_behavior_allowed`: `NO`
- `production_impact`: `NONE`
- `safe_to_display`: `YES` only for sanitized mock fields
- `raw_private_evidence_committed`: `NO`

Every fixture record created later should be reviewable without private context and should make blocked, unknown, partial, and not-approved states visible.

## 8. Excluded Fixture Data

The following data must never appear in mock fixtures:

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

## 9. Fixture Category Draft: `phase_gate_summary`

Future safe fields:

- `phase_gate_id`
- `phase_name`
- `gate_status`
- `dry_run_status`
- `readiness_score`
- `production_impact`
- `started`
- `required_approvals`
- `unresolved_blocker_count`
- `prohibited_action_count`
- `next_planning_action`
- `safe_summary`

Current expected mock values:

- `PHASE_3_BLOCKED`
- `NOT_APPROVED`
- `BLOCKED_PROGRESSING`
- `NONE`
- Phase 3 started: `NO`

## 10. Fixture Category Draft: `workflow_registry`

Future safe fields:

- `workflow_id`
- `workflow_name`
- `workflow_category`
- `primary_domain_id`
- `related_domain_ids`
- `legacy_migration_workflow`
- `future_platform_workflow`
- `status`
- `primary_owner_category`
- `strict_gate_profile`
- `source_of_truth_status`
- `dry_run_eligible`
- `production_behavior_allowed`
- `safe_summary`

The future fixture should include the 16 legacy workflows and selected future platform workflows only if explicitly approved later. No workflow registry fixture is created now.

## 11. Fixture Category Draft: `legacy_workflow_matrix`

Future safe fields:

- `workflow_id`
- `workflow_name`
- `status`
- `partial_evidence_signals`
- `handler_mode_status`
- `caller_route_form_trigger_job_status`
- `sheet_read_status`
- `sheet_write_status`
- `trigger_schedule_job_status`
- `owner_status`
- `rollback_status`
- `ingestion_decision`
- `dry_run_eligible`
- `production_behavior_allowed`
- `next_evidence_target`

All dry-run eligibility should remain `NO`. Production behavior allowed should remain `NO`. Unknown fields should remain `UNKNOWN` until verified through sanitized review.

## 12. Fixture Category Draft: `workflow_blockers`

Future safe fields:

- `blocker_id`
- `workflow_id`
- `blocker_category`
- `severity`
- `current_status`
- `evidence_needed`
- `owner_category_needed`
- `rollback_needed`
- `blocks_phase_3`
- `blocks_dry_run`
- `blocks_production`
- `safe_summary`

Blocker fixtures should support sorting by severity and filtering by workflow, domain, owner category, and gate impact.

## 13. Fixture Category Draft: `evidence_sources`

Future safe fields:

- `evidence_source_id`
- `source_type`
- `source_label`
- `sanitized_boundary`
- `private_boundary`
- `related_workflow_ids`
- `related_domain_ids`
- `confidence_level`
- `redaction_status`
- `safe_to_display`
- `raw_private_evidence_committed`
- `safe_summary`

Raw evidence is never included. Fixtures may indicate that a source exists or that evidence is needed, but must not embed screenshots, exports, logs, private URLs, private IDs, tokens, credentials, or generated private evidence.

## 14. Fixture Category Draft: `manual_review_decisions`

Future safe fields:

- `decision_id`
- `workflow_id`
- `decision_field`
- `decision_value`
- `evidence_basis_type`
- `safe_for_design`
- `safe_for_dry_run`
- `safe_for_production`
- `unknowns`
- `next_evidence_target`
- `safe_summary`

Defaults:

- `safe_for_dry_run`: `NO`
- `safe_for_production`: `NO`

Manual review fixtures may support non-production design only when values are sanitized and safe. They do not approve dry run or production behavior.

## 15. Fixture Category Draft: `owners_rollback`

Future safe fields for owner and rollback fixtures:

- `workflow_id`
- `owner_category`
- `ownership_status`
- `approval_required`
- `cutover_decision_required`
- `rollback_status`
- `rollback_owner_category`
- `rollback_path_needed`
- `rollback_test_status`
- `fallback_system`
- `stop_condition`
- `safe_summary`

This does not assign production owners. Owner categories are planning categories only and are not people, accounts, permissions, or approval authority.

## 16. Fixture Category Draft: `admin_issues`

Future safe fields:

- `admin_issue_id`
- `issue_type`
- `workflow_id`
- `domain_id`
- `blocker_category`
- `severity`
- `owner_category`
- `status`
- `evidence_needed`
- `rollback_needed`
- `production_impact`
- `phase_gate_impact`
- `safe_summary`

No GitHub issues are created by fixture planning. If future fixtures represent issue-like records, they should remain local/mock planning records only unless a later phase explicitly approves real GitHub issue integration.

## 17. Fixture Category Draft: `prohibited_actions`

Future safe fields:

- `prohibited_action_id`
- `action_name`
- `description`
- `related_workflow_ids`
- `related_domain_ids`
- `severity`
- `current_status`
- `why_prohibited`
- `approval_required_to_change`
- `safe_summary`

Prohibited actions include:

- do not start Phase 3
- do not deploy
- do not edit Apps Script
- do not write live Sheets
- do not send emails
- do not create invoices
- do not modify Stripe
- do not modify ScreenCloud
- do not modify YouTube
- do not change redirects
- do not create QR codes
- do not upload/import files
- do not calculate/pay revenue share
- do not create Firestore collections
- do not create BigQuery tables
- do not create Cloud Run services/jobs
- do not ingest production data

## 18. Fixture Validation Rules For Later Phase

Future validation expectations:

- fixture files must contain only mock/local/sanitized data
- no private IDs
- no private URLs
- no emails
- no tokens/secrets
- no raw logs
- no generated private evidence
- all dry-run eligible values default to `NO`
- all production behavior allowed values default to `NO`
- Phase 3 remains blocked
- unknowns remain visible
- partial does not imply approved
- fixtures must pass JSON syntax validation if created later
- fixtures must be reviewed before dashboard build

Additional later validation should compare fixture defaults against the dry-run guard, feature flag posture, and dashboard no-production-service-call tests.

## 19. Relationship To Admin Dashboard v0

Fixture planning supports:

- Overview: `phase_gate_summary`, blocker counts, prohibited action counts, and safe next planning actions.
- Workflow taxonomy browser: `workflow_registry`, `workflow_domains`, `owner_categories`, `status_lifecycle`, and `strict_gate_profiles`.
- Legacy 16 matrix: `legacy_workflow_matrix`, `manual_review_decisions`, `workflow_blockers`, and `rollback_requirements`.
- Future platform catalog: `future_platform_workflows`, `workflow_domains`, and `strict_gate_profiles`.
- Blocker matrix: `workflow_blockers`, `workflow_owners`, `rollback_requirements`, and `external_system_boundaries`.
- Evidence sources: `evidence_sources` and safe redaction/confidence metadata.
- Manual review decisions: `manual_review_decisions` and visible unknown fields.
- Owners & rollback: `workflow_owners` and `rollback_requirements`.
- Phase gates: `phase_gate_summary`, `strict_gate_profiles`, and approval requirements.
- Issues: `admin_issues` as local/mock planning records only.
- Prohibited actions: `prohibited_actions` and strict gate relationships.
- Data model planning view: `data_model_notes`, safe field lists, and private/excluded field categories.

## 20. Relationship To Future Static Build Plan

After this document is reviewed and merged, a later phase may create an Admin Dashboard v0 static build plan.

The static build plan may define:

- mock data import approach
- read-only page build order
- route implementation plan
- component boundaries
- test plan
- safety guards

This phase does not approve or create that build. It does not create mock fixtures, routes, UI, components, pages, schemas, JSON, seed files, APIs, jobs, or production resources.

## 21. What Remains Prohibited

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
- no mock JSON creation
- no seed file creation
- no GitHub issue template creation
- no GitHub issue creation
- no GitHub label creation
- no Phase 3 start

## 22. Recommended Next Phase 2 Actions

1. Merge this fixture planning document after review.
2. Create an Admin Dashboard v0 static build plan, still planning-only.
3. Only after explicit approval, create mock fixtures in a later non-production PR.
4. Keep Phase 3 blocked.

## Phase 2.44 Safety Confirmation

Production impact is `NONE`.

No live systems were queried or modified. No fixture files, JSON files, seed files, schemas, migrations, APIs, routes, route files, UI components, pages, GitHub issue templates, GitHub issues, GitHub labels, Apps Script files, triggers, live Sheets, Gmail, Stripe, ScreenCloud, YouTube, redirects, QR codes, uploads, imports, market intelligence data, provider records, advertiser records, vendor records, employer records, organization records, user records, campaign records, billing records, Firestore collections, BigQuery tables, Cloud Run services, GCP resources, DNS records, or production resources were created, queried, or modified by this document.

Phase 3 remains blocked. Phase 3 dry run remains `NOT_APPROVED`. Production behavior allowed remains `NO`.
