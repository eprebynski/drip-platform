# Phase 2.40 Non-Production Data Model Draft

## 1. Purpose

This document is a conceptual non-production data model draft for Admin Dashboard v0 and workflow/evidence planning.

This is documentation and planning only. It does not create schemas. It does not create Firestore collections. It does not create BigQuery tables. It does not create APIs. It does not create jobs, routes, migrations, fixtures, Cloud Run services, GCP resources, or production resources. It does not build the dashboard.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, or revenue-share calculations.

## 2. Inputs

This draft uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This draft does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Modeling Principles

- model status and evidence before operations
- read-only planning first
- static/mock/local data first
- no live credentials
- no private evidence committed
- no-PHI guardrails
- partial evidence is not production proof
- `UNKNOWN` remains blocking
- every workflow needs owner, rollback, source-of-truth, and approval before build
- future platform workflows start as `PLANNING_ONLY`
- strict gates for billing, email, redirects, ScreenCloud, YouTube, Stripe, uploads/imports, live Sheet writes, Apps Script changes, and production ingestion

The model should help Admin Dashboard v0 explain status, blockers, evidence, gates, owners, rollback needs, prohibited actions, and planning issues. It should not power live operations.

## 4. Conceptual Entity List

| Entity | Purpose | Example future use in Admin Dashboard v0 | Safe display fields | Private/excluded fields | Related entities | Production behavior allowed now? |
| --- | --- | --- | --- | --- | --- | --- |
| `workflow_registry` | Catalog legacy and future workflows. | Taxonomy browser and workflow detail pages. | IDs, names, domains, status, owner categories, safe notes. | Raw evidence, private IDs, live URLs, customer data. | `workflow_domains`, `workflow_reviews`, `workflow_blockers`, `workflow_owners` | NO |
| `workflow_domains` | Define top-level product/workflow domains. | Domain filters and domain summaries. | Domain ID, name, description, examples, risks. | Private evidence and source files. | `workflow_registry`, `evidence_sources` | NO |
| `workflow_reviews` | Track sanitized review status for workflows. | Legacy 16 matrix and review status views. | Review status, phase, recommendations, safe summary. | Generated review files and raw private evidence. | `workflow_registry`, `manual_review_decisions`, `phase_gates` | NO |
| `workflow_blockers` | Track blockers that prevent dry run or production. | Blocker matrix and workflow detail pages. | Category, severity, current status, evidence needed, safe summary. | Raw logs, private exports, private identifiers. | `workflow_registry`, `admin_issues`, `phase_gates` | NO |
| `manual_review_decisions` | Capture sanitized decision fields from review work. | Manual Review Decision Matrix. | Decision field, value, safe design/dry-run/prod flags. | Generated private review content and reviewer private notes. | `workflow_reviews`, `workflow_blockers`, `evidence_sources` | NO |
| `evidence_sources` | Track sanitized evidence source metadata. | Evidence Source Registry. | Source type, sanitized boundary, confidence, redaction status, safe summary. | Raw evidence, private links, tokens, screenshots, exports. | `workflow_registry`, `manual_review_decisions`, `phase_gates` | NO |
| `phase_gates` | Summarize phase readiness and approvals. | Overview / Gate Status and Phase Gate Detail. | Gate status, dry-run status, readiness, impact, blockers. | Generated private tracker content. | `workflow_blockers`, `workflow_reviews`, `prohibited_actions` | NO |
| `admin_issues` | Track planning-only issues and blocker tasks. | Issue Tracker. | Issue ID, workflow, category, severity, status, safe summary. | Production ticket links unless explicitly approved later. | `workflow_blockers`, `workflow_owners`, `rollback_requirements` | NO |
| `workflow_owners` | Track needed owner categories. | Owner Needed Queue. | Owner category, status, approval required, safe summary. | Individual names, accounts, emails, private assignments. | `workflow_registry`, `admin_issues` | NO |
| `rollback_requirements` | Track rollback needs by workflow. | Rollback Needed Queue and workflow detail pages. | Rollback status, owner category, fallback system, stop condition. | Private runbooks or live system URLs. | `workflow_registry`, `workflow_blockers`, `admin_issues` | NO |
| `prohibited_actions` | Track actions v0 must warn against. | Prohibited Actions Panel. | Action name, severity, current status, why prohibited. | Live credentials or internal escalation details. | `phase_gates`, `workflow_registry` | NO |
| `workflow_status_history` | Track conceptual status changes. | Future status timeline and audit-like planning view. | From/to status, category of changer, reason, safe summary. | User accounts, emails, private approval artifacts. | `workflow_registry`, `phase_gates` | NO |
| `external_system_boundaries` | Track read/write/dry-run boundaries for external systems. | Integration boundary panel and workflow details. | External system, boundary type, read/write/dry-run flags. | Credentials, endpoints, private IDs, tokens. | `workflow_registry`, `prohibited_actions` | NO |
| `data_model_notes` | Store planning notes about future model needs. | Data Model Planning View. | Entity name, note type, status, safe summary. | Raw evidence and private examples. | All conceptual entities | NO |
| `dashboard_view_configs` | Describe future dashboard views. | Admin Dashboard v0 IA and view planning. | View name, purpose, included entities, filters, safe summary. | User permissions, live route configs, private data. | All dashboard-facing entities | NO |

## 5. Entity Field Drafts

Field names below are conceptual only. Do not create schema files, migrations, fixtures, collections, tables, APIs, jobs, routes, or services from this document.

### `workflow_registry`

| Field | Meaning |
| --- | --- |
| `workflow_id` | Stable workflow identifier for planning. |
| `workflow_name` | Safe workflow display name. |
| `workflow_type` | Legacy migration, future platform, or both. |
| `primary_domain_id` | Main domain from the workflow taxonomy. |
| `related_domain_ids` | Optional related domains. |
| `legacy_migration_workflow` | Whether the workflow is one of the blocker-tracked legacy workflows. |
| `future_platform_workflow` | Whether the workflow belongs to the broader future platform taxonomy. |
| `status` | Current lifecycle state. |
| `primary_owner_category` | Proposed accountable owner category, not a person. |
| `related_owner_categories` | Supporting owner categories. |
| `user_types` | Role/user categories affected by the workflow. |
| `main_entities` | Conceptual entities touched by the workflow. |
| `external_systems` | External systems or integrations involved, if any. |
| `strict_gate_required` | Whether stricter approval gates are required. |
| `source_of_truth_status` | Known, unknown, proposed, or blocked source-of-truth state. |
| `dry_run_eligible` | Current dry-run eligibility. Defaults to `NO`. |
| `production_behavior_allowed` | Current production allowance. Defaults to `NO`. |
| `notes` | Sanitized planning notes only. |

### `workflow_domains`

| Field | Meaning |
| --- | --- |
| `domain_id` | Stable domain identifier. |
| `domain_name` | Safe domain name. |
| `description` | Domain description. |
| `example_workflows` | Sanitized example workflows. |
| `primary_user_types` | Role/user categories associated with the domain. |
| `main_entities` | Conceptual entities commonly involved. |
| `key_risks` | Sanitized risk categories. |
| `non_production_design_allowed` | Whether non-production design is allowed. |
| `production_behavior_allowed` | Current production allowance. Defaults to `NO`. |

### `workflow_reviews`

| Field | Meaning |
| --- | --- |
| `review_id` | Stable review identifier. |
| `workflow_id` | Related workflow. |
| `review_phase` | Phase or source of the review. |
| `review_status` | Sanitized review status such as `PARTIAL` or `UNKNOWN`. |
| `manual_review_file_present` | Whether local/private review evidence exists, as metadata only. |
| `reviewed_at` | Sanitized review timestamp or status. |
| `reviewer_type` | Reviewer role/category, not a person. |
| `production_impact` | Expected value is `NONE`. |
| `phase_3_started` | Expected value is `NO`. |
| `dry_run_decision` | Current dry-run decision, expected `NOT_APPROVED` or `NO`. |
| `overall_recommendation` | Gate recommendation such as `PHASE_3_BLOCKED`. |
| `safe_summary` | Sanitized summary without private evidence. |

### `workflow_blockers`

| Field | Meaning |
| --- | --- |
| `blocker_id` | Stable blocker identifier. |
| `workflow_id` | Related workflow. |
| `blocker_category` | Handler, caller, read/write, owner, rollback, ingestion, or approval category. |
| `severity` | Conservative severity such as `MEDIUM`, `HIGH`, or `CRITICAL`. |
| `current_status` | `UNKNOWN`, `BLOCKING`, `PARTIAL`, or similar safe status. |
| `evidence_needed` | Sanitized evidence need. |
| `owner_category_needed` | Owner category needed to resolve. |
| `rollback_needed` | Whether rollback evidence is needed. |
| `suggested_next_action` | Planning-only next action. |
| `blocks_phase_3` | Whether this blocks Phase 3. |
| `blocks_dry_run` | Whether this blocks dry-run review. |
| `blocks_production` | Whether this blocks production behavior. |
| `safe_summary` | Sanitized summary. |

### `manual_review_decisions`

| Field | Meaning |
| --- | --- |
| `decision_id` | Stable decision identifier. |
| `workflow_id` | Related workflow. |
| `review_id` | Related review. |
| `decision_field` | Decision field name. |
| `decision_value` | Sanitized decision value. |
| `evidence_basis_type` | Public evidence, private summary, manifest, redaction report, or unknown basis. |
| `safe_for_design` | Whether it may inform non-production design. |
| `safe_for_dry_run` | Whether it supports dry-run review. Current default: `NO`. |
| `safe_for_production` | Whether it supports production behavior. Current default: `NO`. |
| `unknowns` | Sanitized unresolved unknowns. |
| `next_evidence_target` | Next evidence needed. |
| `safe_summary` | Sanitized summary. |

### `evidence_sources`

| Field | Meaning |
| --- | --- |
| `evidence_source_id` | Stable evidence source identifier. |
| `source_type` | Summary, manifest, report, public source, or manual review type. |
| `source_label` | Safe label. |
| `sanitized_boundary` | What may be displayed. |
| `private_boundary` | What must remain outside the repo/dashboard. |
| `related_workflow_ids` | Related workflows. |
| `related_domain_ids` | Related domains. |
| `last_reviewed_at` | Sanitized review timestamp or status. |
| `reviewer_decision` | Sanitized reviewer decision. |
| `confidence_level` | Confidence such as `HIGH`, `MEDIUM`, `LOW`, or `UNKNOWN`. |
| `redaction_status` | Redaction state. |
| `safe_to_display` | Whether v0 may display the source metadata. |
| `raw_private_evidence_committed` | Expected value: `NO`. |
| `safe_summary` | Sanitized summary only. |

### `phase_gates`

| Field | Meaning |
| --- | --- |
| `phase_gate_id` | Stable gate identifier. |
| `phase_name` | Phase name. |
| `gate_status` | Gate state such as `PHASE_3_BLOCKED`. |
| `dry_run_status` | Dry-run state such as `NOT_APPROVED`. |
| `readiness_score` | Readiness score such as `BLOCKED_PROGRESSING`. |
| `production_impact` | Expected value: `NONE`. |
| `started` | Whether the phase has started. Phase 3 expected value: `NO`. |
| `required_approvals` | Approval categories required. |
| `unresolved_blocker_count` | Count only, no raw private detail. |
| `prohibited_actions` | Related prohibited action identifiers. |
| `next_planning_action` | Planning-only next action. |
| `safe_summary` | Sanitized summary. |

### `admin_issues`

| Field | Meaning |
| --- | --- |
| `admin_issue_id` | Stable planning issue identifier. |
| `workflow_id` | Related workflow. |
| `domain_id` | Related domain. |
| `blocker_id` | Related blocker. |
| `issue_type` | Evidence, owner, rollback, model, gate, or policy issue type. |
| `severity` | Conservative severity. |
| `owner_category` | Role category, not a person. |
| `status` | Planning issue status. |
| `evidence_needed` | Sanitized evidence need. |
| `rollback_needed` | Whether rollback planning is needed. |
| `due_date_placeholder` | Placeholder only; no production commitment. |
| `production_impact` | Expected value: `NONE`. |
| `phase_gate_impact` | Gate impact summary. |
| `safe_summary` | Sanitized summary. |

### `workflow_owners`

| Field | Meaning |
| --- | --- |
| `workflow_owner_id` | Stable owner requirement identifier. |
| `workflow_id` | Related workflow. |
| `owner_category` | Owner role category. |
| `ownership_status` | Needed, proposed, reviewed, or unknown. |
| `approval_required` | Whether approval is required. |
| `cutover_decision_required` | Whether cutover decision is required. |
| `escalation_category` | Escalation role category. |
| `safe_summary` | Sanitized summary. |

### `rollback_requirements`

| Field | Meaning |
| --- | --- |
| `rollback_requirement_id` | Stable rollback requirement identifier. |
| `workflow_id` | Related workflow. |
| `rollback_status` | Unknown, needed, drafted, reviewed, or blocked. |
| `rollback_owner_category` | Owner category for rollback. |
| `rollback_path_needed` | Whether a rollback path is needed. |
| `rollback_test_status` | Non-production test status. |
| `fallback_system` | Sanitized fallback category, not private system details. |
| `stop_condition` | Safe stop condition summary. |
| `safe_summary` | Sanitized summary. |

### `prohibited_actions`

| Field | Meaning |
| --- | --- |
| `prohibited_action_id` | Stable prohibited action identifier. |
| `action_name` | Safe action name. |
| `description` | Why the action is prohibited. |
| `related_workflow_ids` | Related workflows. |
| `related_domain_ids` | Related domains. |
| `severity` | Conservative severity. |
| `current_status` | Current prohibition status. |
| `why_prohibited` | Sanitized rationale. |
| `approval_required_to_change` | Approval required to change this prohibition. |
| `safe_summary` | Sanitized summary. |

### `workflow_status_history`

| Field | Meaning |
| --- | --- |
| `workflow_status_history_id` | Stable status history identifier. |
| `workflow_id` | Related workflow. |
| `from_status` | Previous status. |
| `to_status` | New status. |
| `changed_at` | Timestamp or planning placeholder. |
| `changed_by_category` | Role category, not a person. |
| `reason` | Sanitized reason. |
| `approval_reference_required` | Whether an approval reference would be required. |
| `safe_summary` | Sanitized summary. |

### `external_system_boundaries`

| Field | Meaning |
| --- | --- |
| `external_boundary_id` | Stable boundary identifier. |
| `workflow_id` | Related workflow. |
| `external_system` | External system category. |
| `boundary_type` | Read, write, dry-run, credential, or production boundary. |
| `read_allowed_now` | Whether reads are allowed now. Default: `NO` unless explicitly local/sanitized. |
| `write_allowed_now` | Whether writes are allowed now. Default: `NO`. |
| `dry_run_allowed_now` | Whether dry run is allowed now. Default: `NO`. |
| `production_allowed_now` | Whether production behavior is allowed now. Default: `NO`. |
| `strict_gate_required` | Whether stricter gate is required. |
| `safe_summary` | Sanitized summary. |

### `data_model_notes`

| Field | Meaning |
| --- | --- |
| `data_model_note_id` | Stable planning note identifier. |
| `entity_name` | Conceptual entity name. |
| `workflow_id` | Related workflow, if any. |
| `domain_id` | Related domain, if any. |
| `note_type` | Design, blocker, risk, relationship, or implementation note type. |
| `note` | Sanitized planning note. |
| `status` | Planning note status. |
| `safe_summary` | Sanitized summary. |

### `dashboard_view_configs`

| Field | Meaning |
| --- | --- |
| `dashboard_view_config_id` | Stable view config identifier. |
| `view_name` | View name. |
| `view_purpose` | Planning purpose of the view. |
| `included_entities` | Conceptual entities displayed. |
| `allowed_actions` | View, filter, sort, planning notes. |
| `prohibited_actions` | Live or production actions blocked by the view. |
| `default_filters` | Safe default filters. |
| `safe_summary` | Sanitized summary. |

## 6. Relationships

- One workflow belongs to one primary domain.
- One workflow may relate to many domains.
- One workflow may have many blockers.
- One workflow may have many manual review decisions.
- One workflow may have many evidence sources.
- One workflow may have many admin issues.
- One workflow may have owner requirements.
- One workflow may have rollback requirements.
- One workflow may have many status history entries.
- One phase gate summarizes many workflows.
- One phase gate may summarize many blockers and prohibited actions.
- One evidence source may relate to many workflows.
- One evidence source may support many manual review decisions.
- One prohibited action may apply to many workflows.
- One external system boundary may apply to many workflows or one workflow.
- One dashboard view config may include many conceptual entities.

## 7. Legacy 16 Workflow Seed Records

These are conceptual seed records only. They are not fixture data, schemas, migrations, collections, tables, or production records.

| `workflow_id` | `workflow_name` | `primary_domain_id` | `legacy_migration_workflow` | `future_platform_workflow` | `status` | `dry_run_eligible` | `production_behavior_allowed` | `strict_gate_required` |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy_conference_campaigns` | Conference Campaigns | `campaign_product` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_patient_campaigns` | Patient Campaigns | `campaign_product` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_provider_campaigns` | Provider Campaigns | `campaign_product` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_screencloud_display_provider_ops` | ScreenCloud/display provider operations | `digital_signage_distribution` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_provider_display_preferences` | Provider display preferences | `provider_display_preferences` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_admin_review_workflows` | Admin review workflows | `internal_admin_operations` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_stripe_invoicing` | Stripe invoicing | `billing_payments` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_video_playback_billing` | Video/playback billing | `analytics_reporting` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_patient_campaign_qr_scan_logging` | Patient Campaign QR scan logging | `qr_redirect_attribution` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_provider_revenue_share` | Provider revenue share | `provider_revenue_share` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_youtube_playlist_operations` | YouTube/playlist operations | `digital_signage_distribution` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_provider_signup` | Provider signup | `provider_acquisition` | YES | YES | EVIDENCE_NEEDED | NO | NO | YES |
| `legacy_advertiser_vendor_employer_signup` | Advertiser/vendor/employer signup | `advertiser_vendor_employer_acquisition` | YES | YES | EVIDENCE_NEEDED | NO | NO | YES |
| `legacy_qr_redirects` | QR redirects | `qr_redirect_attribution` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_market_intelligence_uploads` | Market intelligence uploads | `market_intelligence` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |
| `legacy_welcome_emails` | Welcome emails | `notifications_communications` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | NO | NO | YES |

## 8. Future Platform Workflow Examples

These examples are conceptual only. They are not fixture data, implementation scope, or Phase 3 approval.

| `workflow_id` | `domain_id` | `workflow_name` | `legacy_migration_workflow` | `future_platform_workflow` | `status` | `dry_run_eligible` | `production_behavior_allowed` |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `future_public_website_page_management` | `marketing` | Public website page management | NO | YES | PLANNING_ONLY | NO | NO |
| `future_lead_intake` | `sales` | Lead intake | NO | YES | PLANNING_ONLY | NO | NO |
| `future_provider_onboarding_checklist` | `provider_acquisition` | Provider onboarding checklist | NO | YES | PLANNING_ONLY | NO | NO |
| `future_advertiser_workspace_access` | `advertiser_vendor_employer_acquisition` | Advertiser workspace access | NO | YES | PLANNING_ONLY | NO | NO |
| `future_campaign_creative_review` | `campaign_product` | Campaign creative review | NO | YES | PLANNING_ONLY | NO | NO |
| `future_campaign_scheduling` | `advertising_operations` | Campaign scheduling | NO | YES | PLANNING_ONLY | NO | NO |
| `future_screen_status_monitoring` | `digital_signage_distribution` | Screen status monitoring | NO | YES | PLANNING_ONLY | NO | NO |
| `future_qr_attribution_reporting` | `qr_redirect_attribution` | Attribution reporting | NO | YES | PLANNING_ONLY | NO | NO |
| `future_sponsorship_slot_configuration` | `conference_sponsorship` | Sponsorship slot configuration | NO | YES | PLANNING_ONLY | NO | NO |
| `future_invoice_review_queue` | `billing_payments` | Invoice review queue | NO | YES | PLANNING_ONLY | NO | NO |
| `future_provider_payout_review` | `provider_revenue_share` | Provider payout review | NO | YES | PLANNING_ONLY | NO | NO |
| `future_support_ticket_intake` | `customer_support` | Support ticket intake | NO | YES | PLANNING_ONLY | NO | NO |
| `future_admin_issue_tracker` | `internal_admin_operations` | Issue tracker | NO | YES | PLANNING_ONLY | NO | NO |
| `future_phase_gate_tracker` | `evidence_gate_migration` | Phase gate tracker | NO | YES | PLANNING_ONLY | NO | NO |
| `future_campaign_performance_reporting` | `analytics_reporting` | Campaign performance reporting | NO | YES | PLANNING_ONLY | NO | NO |
| `future_market_opportunity_scoring` | `market_intelligence` | Market opportunity scoring | NO | YES | PLANNING_ONLY | NO | NO |
| `future_campaign_policy_review` | `compliance_policy_safety` | Campaign policy review | NO | YES | PLANNING_ONLY | NO | NO |
| `future_campaign_status_notifications` | `notifications_communications` | Campaign status notifications | NO | YES | PLANNING_ONLY | NO | NO |
| `future_display_provider_integration` | `integration_external_systems` | ScreenCloud/display provider integration | NO | YES | PLANNING_ONLY | NO | NO |

## 9. Status Lifecycle Mapping

Status lifecycle from Phase 2.38:

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

Current allowed planning transitions only:

- `PLANNING_ONLY` -> `EVIDENCE_NEEDED`
- `EVIDENCE_NEEDED` -> `DESIGN_READY_NON_PRODUCTION`
- `EVIDENCE_NEEDED` -> `BLOCKED_BY_UNKNOWN_DEPENDENCIES`
- `BLOCKED_BY_UNKNOWN_DEPENDENCIES` -> `READY_FOR_OWNER_REVIEW`
- `READY_FOR_OWNER_REVIEW` -> `READY_FOR_NON_PRODUCTION_BUILD`

Blocked transitions without future explicit approval:

- to `READY_FOR_LIMITED_DRY_RUN_REVIEW`
- to `APPROVED_FOR_LIMITED_DRY_RUN`
- to `READY_FOR_PRODUCTION_REVIEW`
- to `APPROVED_FOR_PRODUCTION`
- to `ACTIVE`

Any transition toward dry run or production requires future explicit Drip/ChatGPT approval, owner assignment, rollback planning, source-of-truth review, evidence review, and dry-run/write guard review.

## 10. Safe Display Rules

Admin Dashboard v0 may display:

- sanitized workflow names
- sanitized domain names
- decision statuses
- blocker categories
- owner categories
- rollback-needed flags
- evidence source metadata
- confidence levels
- safe summaries
- phase gate statuses
- prohibited action warnings

Admin Dashboard v0 must not display:

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
- tokens/secrets
- screenshots
- generated private tracker content
- generated private review content

## 11. Future Implementation Notes

A later build should start with:

- static/mock/local JSON fixtures
- no live credentials
- no external system access
- no private evidence
- no production writes
- clear blocked/dry-run/prohibited labels
- tests
- safe defaults

Do not create fixtures yet unless explicitly asked in a later phase.

## 12. Relationship To Firestore, BigQuery, And Cloud Run

Firestore may later store operational/workflow state after approval. BigQuery may later store analytics/event models after ingestion approval. Cloud Run may later serve APIs/jobs after explicit build approval.

The current phase creates none of these. This data model draft is not a schema migration. It is not resource creation. It is not Phase 3. It does not create Firestore collections, BigQuery tables, Cloud Run services, APIs, jobs, triggers, scheduled tasks, routes, or production resources.

## 13. Relationship To Admin Dashboard v0

This conceptual model supports:

- Overview / Gate Status
- Workflow Taxonomy Browser
- Legacy 16 Workflow Matrix
- Future Platform Workflow Catalog
- Blocker Matrix
- Evidence Source Registry
- Manual Review Decision Matrix
- Owner/Rollback Queue
- Phase Gate Detail
- Issue Tracker
- Prohibited Actions Panel
- Data Model Planning View

Admin Dashboard v0 should use the model to explain status, not to mutate operations.

## 14. What Remains Prohibited

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
- no Phase 3 start

## 15. Recommended Next Phase 2 Actions

1. Merge this data model draft after review.
2. Create workflow registry draft using static documentation only.
3. Create Admin Dashboard v0 wireframe or route plan using static/mock data only.
4. Create issue templates for workflow blocker resolution.
5. Consider local/mock JSON fixture planning in a later phase.
6. Keep Phase 3 blocked.

## Phase 2.40 Safety Confirmation

| Field | Confirmation |
| --- | --- |
| Documentation/planning only | YES |
| Schemas created | NO |
| Firestore collections created | NO |
| BigQuery tables created | NO |
| APIs created | NO |
| Jobs/routes/fixtures/migrations/resources created | NO |
| Dashboard built | NO |
| Production impact | NONE |
| Live systems queried or modified | NO |
| Generated private tracker committed | NO |
| Raw private evidence committed | NO |
| Phase 3 started | NO |
| Limited dry run approved | NO |
| Production behavior approved | NO |
