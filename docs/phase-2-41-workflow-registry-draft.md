# Phase 2.41 Workflow Registry Draft

## 1. Purpose

This document defines the static workflow registry draft for Admin Dashboard v0 and future Drip platform planning.

This is documentation and planning only. It does not create registry code. It does not create JSON fixtures. It does not create schemas. It does not create Firestore collections. It does not create BigQuery tables. It does not create APIs. It does not create jobs, routes, migrations, seed files, Cloud Run services, GCP resources, or production resources. It does not build the dashboard.

This document does not approve Phase 3. It does not approve a dry run. It does not approve production behavior. It does not approve live credentials, live queries, live writes, production ingestion, deploys, Apps Script edits, live Sheet edits, billing actions, email sends, redirect changes, QR creation, display-provider actions, YouTube actions, uploads, imports, or revenue-share calculations.

## 2. Inputs

This draft uses these sanitized planning inputs:

- Phase 2.37 blocker-resolution plan
- Phase 2.38 workflow taxonomy
- Phase 2.39 Admin Dashboard v0 product spec
- Phase 2.40 non-production data model draft
- the 16 manual workflow reviews
- the expanded 16-workflow readiness tracker
- existing evidence/gate tooling

This draft does not copy raw private evidence, generated private tracker output, generated private review content, private Sheet identifiers, private URLs, customer data, email addresses, screen identifiers, playlist identifiers, channel identifiers, Stripe identifiers, invoice identifiers, logs, uploaded data, tokens, secrets, screenshots, or live credentials.

## 3. Registry Principles

- stable workflow IDs
- stable domain IDs
- stable owner category IDs
- static planning first
- read-only display first
- no live credentials
- no private evidence committed
- no-PHI guardrails
- partial evidence is not production proof
- `UNKNOWN` remains blocking
- future platform workflows start as `PLANNING_ONLY`
- strict gates for billing, email, redirects, QR, ScreenCloud, YouTube, Stripe, uploads/imports, live Sheet writes, Apps Script changes, production ingestion, and external writes
- no workflow becomes dry-run eligible without explicit future approval
- no workflow becomes production-active without explicit future approval

The registry should help Admin Dashboard v0 organize workflows, gates, owners, blockers, evidence needs, rollback needs, prohibited actions, and safe display metadata. It should not become a control surface for live operations.

## 4. Registry Object Shape

The conceptual registry object shape is:

| Field | Meaning |
| --- | --- |
| `workflow_id` | Stable workflow identifier. |
| `workflow_name` | Safe display name. |
| `workflow_category` | Legacy migration, future platform, or shared planning category. |
| `primary_domain_id` | Primary domain identifier. |
| `related_domain_ids` | Optional related domain identifiers. |
| `legacy_migration_workflow` | Whether this is one of the blocker-tracked legacy workflows. |
| `future_platform_workflow` | Whether this belongs to the broader future platform taxonomy. |
| `status` | Current lifecycle state. |
| `primary_owner_category` | Primary planning owner category. |
| `related_owner_categories` | Supporting owner categories. |
| `user_types` | Role/user categories associated with the workflow. |
| `main_entities` | Conceptual entities involved. |
| `external_systems` | External system categories involved. |
| `strict_gate_required` | Whether stricter gate handling is required. |
| `source_of_truth_status` | Known, unknown, proposed, or blocked source-of-truth state. |
| `dry_run_eligible` | Current dry-run eligibility. Current default is `NO`. |
| `production_behavior_allowed` | Current production allowance. Current default is `NO`. |
| `phase_gate_id` | Related phase gate identifier. |
| `blocker_profile` | Summary of blocker categories. |
| `evidence_profile` | Summary of evidence needs and safe display status. |
| `rollback_profile` | Summary of rollback need and status. |
| `safe_display` | Whether safe dashboard display is allowed. |
| `notes` | Sanitized planning notes. |

This is conceptual only. It is not a schema, code contract, JSON fixture, seed file, migration, API type, Firestore collection, BigQuery table, or production record.

## 5. Domain Registry

| `domain_id` | Domain name | Description | Primary owner category | Strict gate default | Production behavior allowed now |
| --- | --- | --- | --- | --- | --- |
| `marketing` | Marketing workflows | Public acquisition, website, funnel, SEO, and conversion planning. | `marketing_owner` | `standard_planning_gate` | NO |
| `sales` | Sales workflows | Lead, opportunity, proposal, contract, follow-up, renewal, and upsell planning. | `sales_owner` | `standard_planning_gate` | NO |
| `provider_acquisition` | Provider acquisition workflows | Provider organization, facility, user, and onboarding planning. | `provider_success_owner` | `standard_planning_gate` | NO |
| `advertiser_vendor_employer_acquisition` | Advertiser/vendor/employer acquisition workflows | Buyer-side organization, profile, workspace, and setup planning. | `advertiser_vendor_success_owner` | `standard_planning_gate` | NO |
| `campaign_product` | Campaign product workflows | Campaign creation, package, targeting, creative, review, lifecycle, renewal, and cancellation planning. | `product_owner` | `migration_blocker_gate` | NO |
| `advertising_operations` | Advertising operations workflows | Placement, eligibility, scheduling, inventory, monitoring, and escalation planning. | `campaign_operations_owner` | `migration_blocker_gate` | NO |
| `digital_signage_distribution` | Digital signage / screen distribution workflows | Screen inventory, status, playlist, adapter, and proof-of-play planning. | `display_operations_owner` | `display_youtube_gate` | NO |
| `qr_redirect_attribution` | QR / redirect / attribution workflows | QR, redirect, scan, click, attribution, and reporting planning. | `campaign_operations_owner` | `redirect_qr_gate` | NO |
| `conference_sponsorship` | Conference sponsorship workflows | Event inventory, sponsorship slot, reservation, asset, invoice, and reporting planning. | `sales_owner` | `standard_planning_gate` | NO |
| `provider_display_preferences` | Provider display preference workflows | Provider-side display preference and eligibility planning. | `provider_success_owner` | `migration_blocker_gate` | NO |
| `billing_payments` | Billing / payments workflows | Billing account, Stripe, invoice, payment, credit, refund, and hold planning. | `billing_owner` | `billing_payment_gate` | NO |
| `provider_revenue_share` | Provider revenue share workflows | Revenue share calculation, statement, payout review, adjustment, and offset planning. | `billing_owner` | `revenue_share_gate` | NO |
| `customer_support` | Customer support workflows | Support ticket, issue intake, escalation, and resolution planning. | `operations_owner` | `standard_planning_gate` | NO |
| `internal_admin_operations` | Internal admin / operations workflows | Review queue, issue tracker, owner, rollback, and operational dashboard planning. | `operations_owner` | `migration_blocker_gate` | NO |
| `evidence_gate_migration` | Evidence / gate / migration workflows | Manual review, evidence source, blocker, gate, and prohibited action planning. | `engineering_owner` | `migration_blocker_gate` | NO |
| `analytics_reporting` | Analytics / reporting workflows | Campaign, QR, landing page, playback, billing, sales, marketing, and market reporting planning. | `data_analytics_owner` | `production_ingestion_gate` | NO |
| `market_intelligence` | Market intelligence workflows | Upload/import, enrichment, mapping, scoring, and prioritization planning. | `data_analytics_owner` | `upload_import_gate` | NO |
| `compliance_policy_safety` | Compliance / policy / safety workflows | Policy, healthcare advertising safety, no-PHI, terms, and audit planning. | `compliance_policy_owner` | `compliance_policy_gate` | NO |
| `notifications_communications` | Notifications / communications workflows | Welcome, status, billing, issue, internal, renewal, and sponsorship reminder planning. | `operations_owner` | `email_notification_gate` | NO |
| `integration_external_systems` | Integration / external system workflows | Stripe, ScreenCloud, YouTube, Sheets, Firestore, BigQuery, Cloud Run, Scheduler, and Secret Manager planning. | `engineering_owner` | `external_system_gate` | NO |

## 6. Owner Category Registry

These owner categories are planning roles only. They are not production user accounts, permissions, or authority assignments.

| `owner_category_id` | Owner category name | Likely domains | v0 role | Production authority now |
| --- | --- | --- | --- | --- |
| `product_owner` | Product owner | `campaign_product`, `internal_admin_operations`, `provider_display_preferences` | Review product scope, lifecycle, and dashboard planning. | NO |
| `operations_owner` | Operations owner | `internal_admin_operations`, `customer_support`, `notifications_communications` | Review blockers, issues, owners, rollback, and support planning. | NO |
| `billing_owner` | Billing owner | `billing_payments`, `provider_revenue_share` | Review billing and revenue-share blockers without live billing actions. | NO |
| `display_operations_owner` | Display operations owner | `digital_signage_distribution`, `integration_external_systems` | Review display, playlist, proof-of-play, and adapter planning. | NO |
| `campaign_operations_owner` | Campaign operations owner | `advertising_operations`, `campaign_product`, `qr_redirect_attribution` | Review campaign operations, placement, QR, and attribution planning. | NO |
| `provider_success_owner` | Provider success owner | `provider_acquisition`, `provider_display_preferences` | Review provider onboarding and preference planning. | NO |
| `advertiser_vendor_success_owner` | Advertiser/vendor success owner | `advertiser_vendor_employer_acquisition`, `campaign_product` | Review buyer-side onboarding and campaign access planning. | NO |
| `sales_owner` | Sales owner | `sales`, `conference_sponsorship` | Review lead, opportunity, sponsor, and renewal planning. | NO |
| `marketing_owner` | Marketing owner | `marketing` | Review public website, funnel, SEO, and attribution planning. | NO |
| `data_analytics_owner` | Data/analytics owner | `analytics_reporting`, `market_intelligence` | Review analytics, reporting, event, and market data planning. | NO |
| `engineering_owner` | Engineering owner | `evidence_gate_migration`, `integration_external_systems`, `analytics_reporting` | Review boundaries, data model, dry-run guards, and implementation readiness planning. | NO |
| `compliance_policy_owner` | Compliance/policy owner | `compliance_policy_safety`, `campaign_product` | Review safety, no-PHI, policy, terms, and audit planning. | NO |
| `drip_founder_operator` | Drip founder/operator | All domains | Review gate posture and future approvals at a planning level. | NO |

## 7. Status Lifecycle Registry

Only planning/design statuses are allowed now. Movement into dry-run or production-related statuses is blocked without future explicit approval.

| Status | Meaning | Allowed now? | Requires explicit approval? | Dashboard v0 display allowed? | Production behavior allowed? |
| --- | --- | --- | --- | --- | --- |
| `PLANNING_ONLY` | Workflow exists only as planning/taxonomy. | YES | NO | YES | NO |
| `EVIDENCE_NEEDED` | Workflow needs sanitized evidence before assumptions can be trusted. | YES | NO | YES | NO |
| `DESIGN_READY_NON_PRODUCTION` | Workflow may inform non-production design only. | YES | NO | YES | NO |
| `BLOCKED_BY_UNKNOWN_DEPENDENCIES` | Workflow has unresolved blockers or unknowns. | YES | NO | YES | NO |
| `READY_FOR_OWNER_REVIEW` | Workflow is ready for planning owner category review. | YES | NO | YES | NO |
| `READY_FOR_NON_PRODUCTION_BUILD` | Workflow may be considered for a later mock/local build. | YES, only as planning status | YES | YES | NO |
| `READY_FOR_LIMITED_DRY_RUN_REVIEW` | Workflow may be considered for dry-run review. | NO | YES | YES | NO |
| `APPROVED_FOR_LIMITED_DRY_RUN` | Workflow has explicit future dry-run approval. | NO | YES | YES | NO |
| `READY_FOR_PRODUCTION_REVIEW` | Workflow may be reviewed for production readiness. | NO | YES | YES | NO |
| `APPROVED_FOR_PRODUCTION` | Workflow has explicit production approval. | NO | YES | YES | NO |
| `ACTIVE` | Workflow is production-active. | NO | YES | YES only if later safe source exists | NO |
| `PAUSED` | Workflow is paused. | NO | YES | YES only if later safe source exists | NO |
| `RETIRED` | Workflow is retired. | NO | YES | YES only if later safe source exists | NO |

## 8. Strict Gate Profile Registry

Every strict gate profile is dry-run blocked now and production blocked now.

| Gate profile | Applies to | Why strict | Required evidence | Owner categories required | Rollback required? | Dry-run allowed now? | Production allowed now? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `standard_planning_gate` | Low-risk planning workflows. | Still needs owner, source-of-truth, and safe display review. | Sanitized workflow description and owner category. | `product_owner` or relevant domain owner | YES before build | NO | NO |
| `migration_blocker_gate` | Legacy migration workflows and migration-dependent workflows. | Unknown handlers, callers, Sheet behavior, triggers, owners, rollback, and ingestion status remain blockers. | Sanitized review, blocker, owner, rollback, and gate evidence. | `engineering_owner`, `operations_owner`, `drip_founder_operator` | YES | NO | NO |
| `external_system_gate` | Workflows touching external systems or adapters. | External reads/writes and credentials can affect production systems. | Boundary map, credential plan, no-write guard, rollback plan. | `engineering_owner`, domain owner | YES | NO | NO |
| `billing_payment_gate` | Billing, Stripe, invoice, refund, and payment workflows. | Financial mutation and customer billing risk. | Billing boundary, finance review, invoice/payment no-write proof, rollback plan. | `billing_owner`, `engineering_owner`, `drip_founder_operator` | YES | NO | NO |
| `email_notification_gate` | Email and notification workflows. | Wrong recipient/content or live send risk. | Template/source review, no-send guard, recipient boundary, rollback plan. | `operations_owner`, `compliance_policy_owner`, `engineering_owner` | YES | NO | NO |
| `redirect_qr_gate` | Redirect, QR, attribution, and route workflows. | Live route or target changes can break campaign traffic and attribution. | Target map, fallback, route owner, no-live-change guard. | `campaign_operations_owner`, `engineering_owner` | YES | NO | NO |
| `display_youtube_gate` | ScreenCloud, display provider, playlist, and YouTube workflows. | External display or playlist mutation risk. | Adapter boundary, playlist/display write guard, rollback/fallback plan. | `display_operations_owner`, `engineering_owner` | YES | NO | NO |
| `upload_import_gate` | Uploads, imports, market intelligence, and file processing workflows. | File ingestion and data mutation risk. | Upload boundary, schema review, storage rules, no-import guard. | `data_analytics_owner`, `engineering_owner` | YES | NO | NO |
| `production_ingestion_gate` | Analytics, reporting, BigQuery, and event ingestion workflows. | Production data ingestion can expose or corrupt reporting. | Source-of-truth, schema, privacy, ingestion, and rollback review. | `data_analytics_owner`, `engineering_owner`, `compliance_policy_owner` | YES | NO | NO |
| `revenue_share_gate` | Revenue share calculation, statement, payout, and adjustment workflows. | Financial calculation and payout risk. | Calculation boundary, finance review, no-payment guard, rollback plan. | `billing_owner`, `drip_founder_operator`, `engineering_owner` | YES | NO | NO |
| `compliance_policy_gate` | Policy, safety, no-PHI, terms, and audit workflows. | Healthcare advertising, privacy, and policy risk. | Policy review, audit model, no-PHI confirmation, owner approval. | `compliance_policy_owner`, `product_owner`, `engineering_owner` | YES | NO | NO |

## 9. Legacy 16 Workflow Registry Entries

These entries are conceptual registry entries only. They are not code, JSON fixtures, seed data, migrations, collections, tables, or production records.

| `workflow_id` | Workflow name | `workflow_category` | `primary_domain_id` | Related domains | `legacy_migration_workflow` | `future_platform_workflow` | Status | Primary owner category | Related owner categories | Main entities | External systems | Strict gate profile | Source-of-truth status | Dry-run eligible | Production behavior allowed | Recommended next evidence target |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `legacy_conference_campaigns` | Conference Campaigns | legacy_migration | `campaign_product` | `conference_sponsorship`, `qr_redirect_attribution` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `campaign_operations_owner` | `sales_owner`, `engineering_owner` | campaigns, redirects, events | Apps Script, Sheets, redirects | `migration_blocker_gate` | UNKNOWN | NO | NO | Sanitized handler and route-owner map |
| `legacy_patient_campaigns` | Patient Campaigns | legacy_migration | `campaign_product` | `advertising_operations`, `analytics_reporting` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `campaign_operations_owner` | `display_operations_owner`, `billing_owner`, `engineering_owner` | campaigns, placements, events | Apps Script, Sheets, redirects | `migration_blocker_gate` | UNKNOWN | NO | NO | Cross-workflow dependency map |
| `legacy_provider_campaigns` | Provider Campaigns | legacy_migration | `campaign_product` | `provider_acquisition`, `advertising_operations` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `campaign_operations_owner` | `provider_success_owner`, `engineering_owner` | campaigns, organizations, users | Apps Script, Sheets | `migration_blocker_gate` | UNKNOWN | NO | NO | Provider Media Center workflow split |
| `legacy_screencloud_display_provider_ops` | ScreenCloud/display provider operations | legacy_migration | `digital_signage_distribution` | `integration_external_systems` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `display_operations_owner` | `engineering_owner` | screens, placements, playlists | ScreenCloud, Apps Script, Sheets | `display_youtube_gate` | UNKNOWN | NO | NO | Display-provider boundary map |
| `legacy_provider_display_preferences` | Provider display preferences | legacy_migration | `provider_display_preferences` | `advertising_operations` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `provider_success_owner` | `campaign_operations_owner`, `engineering_owner` | provider facilities, preferences, campaigns | Apps Script, Sheets | `migration_blocker_gate` | UNKNOWN | NO | NO | Preference schema and eligibility decision map |
| `legacy_admin_review_workflows` | Admin review workflows | legacy_migration | `internal_admin_operations` | `compliance_policy_safety`, `evidence_gate_migration` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `operations_owner` | `product_owner`, `engineering_owner` | reviews, gates, issues | Apps Script, Sheets | `migration_blocker_gate` | UNKNOWN | NO | NO | Admin workflow state map |
| `legacy_stripe_invoicing` | Stripe invoicing | legacy_migration | `billing_payments` | `integration_external_systems` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `billing_owner` | `engineering_owner`, `drip_founder_operator` | billing accounts, invoices | Stripe, Apps Script, Sheets | `billing_payment_gate` | UNKNOWN | NO | NO | Billing boundary and no-write design |
| `legacy_video_playback_billing` | Video/playback billing | legacy_migration | `analytics_reporting` | `billing_payments`, `digital_signage_distribution` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `data_analytics_owner` | `billing_owner`, `display_operations_owner`, `engineering_owner` | playback events, billing events | Apps Script, Sheets | `production_ingestion_gate` | UNKNOWN | NO | NO | Playback event model |
| `legacy_patient_campaign_qr_scan_logging` | Patient Campaign QR scan logging | legacy_migration | `qr_redirect_attribution` | `analytics_reporting`, `campaign_product` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `campaign_operations_owner` | `data_analytics_owner`, `engineering_owner` | redirects, QR events, campaigns | Apps Script, Sheets, redirects | `redirect_qr_gate` | UNKNOWN | NO | NO | QR event schema and route ownership |
| `legacy_provider_revenue_share` | Provider revenue share | legacy_migration | `provider_revenue_share` | `billing_payments`, `analytics_reporting` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `billing_owner` | `data_analytics_owner`, `engineering_owner`, `drip_founder_operator` | revenue share events, statements | Apps Script, Sheets | `revenue_share_gate` | UNKNOWN | NO | NO | Calculation boundary and exclusion rules |
| `legacy_youtube_playlist_operations` | YouTube/playlist operations | legacy_migration | `digital_signage_distribution` | `integration_external_systems` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `display_operations_owner` | `engineering_owner` | playlists, media assets | YouTube, Apps Script, Sheets | `display_youtube_gate` | UNKNOWN | NO | NO | Playlist read/write boundary |
| `legacy_provider_signup` | Provider signup | legacy_migration | `provider_acquisition` | `notifications_communications` | YES | YES | EVIDENCE_NEEDED | `provider_success_owner` | `operations_owner`, `engineering_owner` | organizations, facilities, users | Apps Script, Sheets, email | `migration_blocker_gate` | UNKNOWN | NO | NO | Intake and record-creation map |
| `legacy_advertiser_vendor_employer_signup` | Advertiser/vendor/employer signup | legacy_migration | `advertiser_vendor_employer_acquisition` | `sales`, `billing_payments` | YES | YES | EVIDENCE_NEEDED | `advertiser_vendor_success_owner` | `sales_owner`, `billing_owner`, `engineering_owner` | organizations, users, profiles | Apps Script, Sheets, Stripe | `migration_blocker_gate` | UNKNOWN | NO | NO | Intake and org/user creation boundary |
| `legacy_qr_redirects` | QR redirects | legacy_migration | `qr_redirect_attribution` | `campaign_product`, `analytics_reporting` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `campaign_operations_owner` | `engineering_owner`, `data_analytics_owner` | redirects, QR codes, events | Apps Script, redirects | `redirect_qr_gate` | UNKNOWN | NO | NO | Target-map inventory and fallback rules |
| `legacy_market_intelligence_uploads` | Market intelligence uploads | legacy_migration | `market_intelligence` | `analytics_reporting` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `data_analytics_owner` | `sales_owner`, `engineering_owner` | market lists, prospects, scores | Apps Script, Sheets, uploads | `upload_import_gate` | UNKNOWN | NO | NO | Upload boundary and schema draft |
| `legacy_welcome_emails` | Welcome emails | legacy_migration | `notifications_communications` | `provider_acquisition`, `advertiser_vendor_employer_acquisition` | YES | YES | BLOCKED_BY_UNKNOWN_DEPENDENCIES | `operations_owner` | `provider_success_owner`, `advertiser_vendor_success_owner`, `engineering_owner` | notifications, templates, recipients | Gmail/email, Apps Script, Sheets | `email_notification_gate` | UNKNOWN | NO | NO | Notification trigger and no-send boundary |

## 10. Future Platform Workflow Registry Examples

These examples are conceptual registry examples only. They are not fixtures, seed data, implementation scope, dry-run approval, or production approval.

| `workflow_id` | Workflow name | Primary domain | Related domains | Primary owner category | Strict gate profile | Status | Dry-run eligible | Production behavior allowed | v0 visible? |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `future_public_website_page_management` | Public website page management | `marketing` | `analytics_reporting` | `marketing_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_lead_intake` | Lead intake | `sales` | `marketing` | `sales_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_provider_onboarding_checklist` | Provider onboarding checklist | `provider_acquisition` | `notifications_communications` | `provider_success_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_advertiser_workspace_access` | Advertiser workspace access | `advertiser_vendor_employer_acquisition` | `campaign_product` | `advertiser_vendor_success_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_campaign_creative_review` | Campaign creative review | `campaign_product` | `compliance_policy_safety` | `campaign_operations_owner` | `compliance_policy_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_campaign_scheduling` | Campaign scheduling | `advertising_operations` | `digital_signage_distribution` | `campaign_operations_owner` | `migration_blocker_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_screen_status_monitoring` | Screen status monitoring | `digital_signage_distribution` | `integration_external_systems` | `display_operations_owner` | `display_youtube_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_qr_attribution_reporting` | Attribution reporting | `qr_redirect_attribution` | `analytics_reporting` | `data_analytics_owner` | `redirect_qr_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_sponsorship_slot_configuration` | Sponsorship slot configuration | `conference_sponsorship` | `sales` | `sales_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_invoice_review_queue` | Invoice review queue | `billing_payments` | `internal_admin_operations` | `billing_owner` | `billing_payment_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_provider_payout_review` | Provider payout review | `provider_revenue_share` | `billing_payments` | `billing_owner` | `revenue_share_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_support_ticket_intake` | Support ticket intake | `customer_support` | `internal_admin_operations` | `operations_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_admin_issue_tracker` | Issue tracker | `internal_admin_operations` | `evidence_gate_migration` | `operations_owner` | `standard_planning_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_phase_gate_tracker` | Phase gate tracker | `evidence_gate_migration` | `internal_admin_operations` | `engineering_owner` | `migration_blocker_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_campaign_performance_reporting` | Campaign performance reporting | `analytics_reporting` | `campaign_product` | `data_analytics_owner` | `production_ingestion_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_market_opportunity_scoring` | Market opportunity scoring | `market_intelligence` | `sales` | `data_analytics_owner` | `upload_import_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_campaign_policy_review` | Campaign policy review | `compliance_policy_safety` | `campaign_product` | `compliance_policy_owner` | `compliance_policy_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_campaign_status_notifications` | Campaign status notifications | `notifications_communications` | `campaign_product` | `operations_owner` | `email_notification_gate` | PLANNING_ONLY | NO | NO | YES |
| `future_display_provider_integration` | ScreenCloud/display provider integration | `integration_external_systems` | `digital_signage_distribution` | `engineering_owner` | `external_system_gate` | PLANNING_ONLY | NO | NO | YES |

## 11. Registry Relationship To Blockers

Each workflow registry entry should conceptually link to:

- `workflow_blockers` for blocker category, severity, current status, evidence needed, and whether it blocks Phase 3, dry run, or production.
- `manual_review_decisions` for sanitized decision values, design safety, dry-run safety, production safety, and unknowns.
- `evidence_sources` for sanitized evidence source metadata, confidence levels, redaction status, and safe summaries.
- `phase_gates` for current gate status, dry-run status, readiness score, production impact, and started flag.
- `admin_issues` for planning-only issue records tied to workflows and blockers.
- `workflow_owners` for owner category needs and approval requirements.
- `rollback_requirements` for rollback path, rollback owner category, fallback system, and stop conditions.
- `external_system_boundaries` for read/write/dry-run/production boundaries around external systems.
- `prohibited_actions` for actions the workflow must not expose or execute.

Do not create records in this phase. These are relationships only.

## 12. Registry Relationship To Admin Dashboard v0

The registry supports:

- Overview / Gate Status by providing counts and gate-related workflow states.
- Workflow Taxonomy Browser by providing workflow ID, domain, owner category, status, and gate profile.
- Legacy 16 Workflow Matrix by identifying the blocker-tracked migration workflows.
- Future Platform Workflow Catalog by identifying planning-only future platform workflows.
- Blocker Matrix by linking registry entries to blocker categories.
- Evidence Source Registry by linking workflows to sanitized evidence metadata.
- Manual Review Decision Matrix by linking workflows to safe decision fields.
- Owner/Rollback Queue by linking workflows to missing owner and rollback requirements.
- Phase Gate Detail by linking workflows to `PHASE_3_BLOCKED`, `NOT_APPROVED`, and related gate metadata.
- Issue Tracker by linking workflows to planning-only issue drafts.
- Prohibited Actions Panel by linking workflows to prohibited action warnings.
- Data Model Planning View by showing how conceptual entities relate.

Admin Dashboard v0 should display registry information. It must not mutate registry state in a way that implies dry-run approval, production approval, or live operational authority.

## 13. Registry Safe Display Rules

Allowed in v0:

- workflow IDs
- workflow names
- domain IDs and names
- owner category IDs and names
- status
- strict gate profile
- safe summaries
- blocker categories
- external system categories
- dry-run eligibility
- production behavior allowed
- recommended next evidence target

Prohibited in v0:

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

## 14. Future Implementation Notes

A later implementation may create static/mock/local registry fixtures only after explicit approval.

Future build should start with:

- static/mock/local JSON fixtures
- no live credentials
- no external system access
- no private evidence
- no production writes
- clear blocked/dry-run/prohibited labels
- tests
- safe defaults

Do not create fixtures now.

## 15. What Remains Prohibited

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
- no workflow registry code
- no registry fixture creation
- no Phase 3 start

## 16. Recommended Next Phase 2 Actions

1. Merge this workflow registry draft after review.
2. Create Admin Dashboard v0 wireframe or route plan using static/mock data only.
3. Create issue template drafts for workflow blocker resolution.
4. Consider local/mock JSON fixture planning in a later phase.
5. Keep Phase 3 blocked.

## Phase 2.41 Safety Confirmation

| Field | Confirmation |
| --- | --- |
| Documentation/planning only | YES |
| Registry code created | NO |
| JSON fixtures created | NO |
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
