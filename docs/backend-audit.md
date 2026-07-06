# Drip Healthcare Backend Audit

## Scope

This is a non-destructive Phase 0 audit and planning artifact. It does not modify production systems, deploy services, delete code, modify Apps Script triggers, write to live Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, Cloud Run, Squarespace, or create live invoices.

## Evidence Status

| Source | Status | Audit impact |
| --- | --- | --- |
| Attached rebuild brief | Available and reviewed | Used as the primary source for architecture, constraints, target state, required deliverables, and risk model. |
| Redacted aggregate Drip system audit file | Available and reviewed | Used for source-verified inventory of Apps Script files, functions, triggers, web routes, sheet IDs/tabs/headers, Cloud Run services, BigQuery references, Stripe, ScreenCloud, redirects, billing, and market intelligence status. |
| Uploaded repo ZIP | Available and reviewed read-only | Validates a compact `drip-platform-main` market intelligence scaffold at archive commit `0a6b3ad49657e059ec830d627ce89d45fa3e8a44`: Terraform, Dataform, Medicaid ingest helper, Segment API, and Cloud Build. It does not include Apps Script source or prove deployed service parity. |
| Current working folder | Contains docs only for this task | No production repo checkout or live GitHub access was assumed. |
| Live services | Intentionally not accessed | No live production state was queried, changed, or validated. |

Detailed source-verified inventory is in [source-verified-inventory.md](/Users/crashdavis/Documents/Codex/2026-07-02/use-the-best-codex-model-available/docs/source-verified-inventory.md).

Phase 1 foundation contracts are documented in [phase-1-foundation-contracts.md](/Users/crashdavis/Documents/Codex/2026-07-02/use-the-best-codex-model-available/docs/phase-1-foundation-contracts.md). They are local, non-production schema/service contracts only and do not resolve deployed Apps Script parity, runtime load order, live Cloud Run/IAM, live BigQuery state, or approval-owner blockers.

Phase 1.5 local service skeletons are documented in [phase-1-5-local-service-skeletons.md](/Users/crashdavis/Documents/Codex/2026-07-02/use-the-best-codex-model-available/docs/phase-1-5-local-service-skeletons.md). They use mock repositories only and do not resolve deployed parity, IAM, BigQuery, approval-owner, Secret Manager, or route-usage blockers.

## Executive Findings

| Finding | Severity | Evidence | Recommendation |
| --- | --- | --- | --- |
| The system appears to depend on multiple production surfaces without a single operational source of truth. | Critical | Brief identifies Apps Script, Sheets, Cloud Run, ScreenCloud, Stripe, BigQuery, Squarespace forms, and redirect pages. | Establish Firestore as operational source of truth before expanding automation. |
| Campaign activation needs a hard safety gate. | Critical | Brief requires no campaign becomes ACTIVE unless safety, date, billing, and placement rules pass. | Implement lifecycle enforcement in a Cloud Run safety/activation service with audit logs and feature flags. |
| Google Sheets should be reduced to intake/admin/migration bridge only. | High | Brief states Sheets should no longer be the operating database. | Build a normalized intake processor and stop adding new workflows against Sheets. |
| Display placement is at risk of vendor lock-in. | High | Brief requires display-provider independence and ScreenCloud as first adapter. | Introduce DisplayProviderService and internal placement records before rebuilding ScreenCloud sync. |
| Billing workflows need dry-run, approval, preview, and rollback notes. | High | Brief requires budget/dynamic pricing readiness and approval gates. | Separate billing calculation, approval, invoice/charge execution, and rollback documentation. |
| Backups are a launch blocker until restore-tested. | High | Brief requires daily, weekly, monthly, pre-deployment backups and quarterly restore tests. | Build backup metadata collection, alerts, and restore rehearsal process before production cutover. |
| The aggregate confirms a large Apps Script global namespace with duplicate functions/constants. | High | 1,161 parsed function declarations; duplicate billing, conference, helper, and HTML functions observed. | De-duplicate during service extraction; do not delete until replacement and tests exist. |
| Anonymous Apps Script web app is a broad mutation/router surface. | Critical | Manifest access is anonymous; `doGet`/`doPost` route directory, QR, conference, billing, and display flows. | Move public routes to Cloud Run services with explicit auth/validation and event logging. |
| Direct ScreenCloud and Stripe write functions exist in Apps Script. | Critical | ScreenCloud sync/rebuild and Stripe invoice/customer functions are source-verified. | Require dry-run/approval before use and migrate to Cloud Run services with Secret Manager. |
| The uploaded repo ZIP validates only part of the backend. | High | ZIP includes market intelligence scaffold and `drip-segment-api`; it excludes Apps Script source and several Cloud Run services named in the aggregate. | Treat deployed Apps Script parity, runtime load order, and missing service source as Phase 1 blockers. |
| `drip-segment-api` source is public-write risky if deployed as shown. | Critical | Cloud Build uses `--allow-unauthenticated`; Terraform grants `allUsers` invoker; `POST /segments/create` persists BigQuery rows. | Add auth/RBAC/rate limiting and approval/audit policy before production use. |
| Phase 1 contracts are intentionally non-production. | Medium | `packages/shared` contains schemas, dry-run guards, and stubs only. | Review and test locally before any implementation task; do not treat contracts as deployment readiness. |
| Phase 1.5 service skeletons are intentionally local-only. | Medium | `packages/services` contains mock handlers and dry-run skeletons only. | Review locally before any production-connected service implementation. |

## Current State Summary

The current state below is now source-verified from the redacted aggregate. Direct live production state was not queried.

| Area | Current state described | Audit status |
| --- | --- | --- |
| Apps Script | Manifest plus major source sections for Code, directory, welcome email, Sheet 6 video, playback billing, invoice integration, monthly billing, Sheet 7 conference, Stripe customer sync, unified conference campaigns, and embedded HTML pages. | Source-verified from aggregate. |
| Google Sheets | Sheets 1-7 plus operational tabs for intake, approvals, redirects, billing, placements, playback, and conference flows. | Source-verified from aggregate. |
| Cloud Run | Aggregate lists `cloud-run-health-test`, `conference-image-upload`, `drip-creative-player`, `drip-segment-api`, `drip-segment-proxy`; Stripe webhook forwarder code included. ZIP source validates `drip-segment-api` only. | Partially source-verified; missing service sources and live deploy parity unresolved. |
| ScreenCloud | Sheet 6 and Sheet 7 contain direct GraphQL read/write, playlist, channel, content, rebuild, playback ingestion, and dry-run helpers. | Source-verified from aggregate. |
| Stripe | Apps Script creates customers, invoices, invoice items, finalizes/sends invoices; Cloud Run verifies Stripe webhook and forwards to Apps Script. | Source-verified from aggregate. |
| BigQuery | Project `drip-platform-prod`; datasets `drip_raw`, `drip_core`, `drip_marts`; aggregate observes `provider_procedure_mix` and `targetable_providers`. ZIP Dataform defines `drip_marts.targetable_providers`, `drip_marts.segments`, and `drip_marts.segment_membership`. | Source-verified from aggregate and ZIP; live table existence and caller alignment unresolved. |
| Squarespace forms | Sheets 1, 2, 4, 5, 6, and 7 are form/intake sources. | Source-verified from aggregate. |
| Website redirect pages | Conference and patient campaign redirect HTML pages call Apps Script modes via hardcoded web app URL / JSONP. | Source-verified from aggregate. |

## Required Inventory Status

| Requirement | Current status | Next evidence needed |
| --- | --- | --- |
| Apps Script files, functions, constants, triggers, web routes | Source-verified from aggregate | Deployed source parity and Apps Script runtime load order remain unresolved. |
| Duplicate function names and duplicate constants | Source-verified from aggregate | Runtime source order should be validated from deployed Apps Script project before edits. |
| Sheet IDs, tabs, headers | Source-verified from aggregate | Live sheet sampling should be read-only and approval-gated if needed. |
| Legacy Sheet 1 dependencies | Source-verified as broad | Need traffic/recent-use evidence before retirement. |
| Patient campaign dependencies | Source-verified across Sheet 1, Sheet 6, Redirect Pools, QR flows, ScreenCloud, billing. | Need migration reconciliation counts. |
| Media Center campaign dependencies | Source-verified across Sheet 3, Sheet 5, Sheet 6 Approval Map, directory routes. | Need canonical approval migration plan. |
| Conference campaign dependencies | Source-verified across Sheet 7, HTML pages, showcase, screen placements, Stripe, ScreenCloud. | Need production traffic and event inventory review. |
| Stripe billing functions/webhooks | Source-verified | Need billing dry-run reconciliation and approval owner. |
| ScreenCloud functions/dry-run/external writes | Source-verified | Need display sync owner and rollback snapshots. |
| Redirect and QR scan flows | Source-verified | Need event count reconciliation before cutover. |
| Functions to move to Cloud Run | Source-verified candidates listed | Need Phase 1 service contracts. |
| Functions that can remain temporarily in Apps Script | Source-verified candidates listed | Need flag/read-only bridge policy. |
| Functions to eventually delete | Source-verified candidates listed | Need zero-dependency evidence. |
| Secrets/config values stored in code/properties/env | Source-verified names/locations only | Need Secret Manager migration and rotation plan. |
| Current Cloud Run services | Aggregate list source-verified; ZIP validates `drip-segment-api` only | Need source/deploy validation for missing services before deploy planning. |
| Market intelligence repo/branch/BigQuery datasets/uncommitted changes | ZIP snapshot reviewed; branch, uncommitted changes, and live BigQuery state not verifiable from archive | Need full repo/branch status and BigQuery dataset/table confirmation. |
| Dataset ingestion or Google Search logic | ZIP validates Medicaid local-to-GCS/BigQuery helper and Dataform model chain; Sheets search helpers remain aggregate-only | Need production ingestion approval flow and search source implementation details. |

## Immediate Safety Issues

| Risk | Why it matters | Recommended control |
| --- | --- | --- |
| Campaign activation may be possible before complete safety review. | Patient-facing display and QR flows can expose unsafe or noncompliant content. | Central activation service must require APPROVED safety status plus date, billing, placement, and provider approval checks. |
| Provider signup could be conflated with provider display approval. | Advertisers may be displayed for providers that did not explicitly opt in. | Model display approval as providerId + advertiserId + displayApproved only after Media Center checkbox action. |
| Hard-coded pricing assumptions may conflict with future budget/dynamic pricing. | Billing and reporting may become inaccurate or hard to migrate. | Campaign schema must include budget, budgetRange, rateType, rateAmount, pricingTier, dynamicPricingInputs, billingStatus, campaignStartDate, and campaignEndDate. |
| Screens may depend on ScreenCloud-specific names as source of truth. | Placement rebuilds and future display-provider migrations become fragile. | Internal placement records must own placement state and store external IDs only as adapter metadata. |
| Live external writes may lack dry-run and approval gates. | Display sync, billing, and campaign changes could affect production without review. | All production-impacting jobs must support dryRun, preview, approval, audit log, and rollback notes. |

## Functions That Should Move To Cloud Run

This classification is now source-verified at the workflow/category level from the aggregate. Function-level candidates are listed in `source-verified-inventory.md`.

| Function category | Move to Cloud Run? | Reason |
| --- | --- | --- |
| Intake normalization from Squarespace Sheets to Firestore | Yes | Needs validation, idempotency, retry handling, logging, and schema evolution. |
| Campaign safety checks | Yes | Requires external calls, queueing, policy enforcement, and auditability. |
| Campaign activation/expiration | Yes | Production state transitions need centralized gates and job logs. |
| Redirect and QR event logging | Yes | Needs low latency, robust analytics, and controlled redirects. |
| Display placement sync and playback ingestion | Yes | External provider adapter, dry-run mode, retries, and operational visibility. |
| Billing orchestration | Yes | Approval gates, dry-run previews, Stripe integration, and audit trails. |
| Dataset ingestion and BigQuery loading | Yes | Large uploads, schema validation, data quality checks, and repeatable jobs. |
| Market intelligence refresh | Yes | Scheduled compute, reproducibility, and reporting lineage. |
| Backup orchestration | Yes | Cross-service export metadata, alerts, and restore-test tracking. |

## Functions That May Remain Temporarily In Apps Script

| Function category | Temporary status | Exit condition |
| --- | --- | --- |
| Raw form intake sheet receiving | Keep temporarily | Dashboard submissions and intake processor fully replace sheet dependency. |
| Admin review sheet bridge | Keep temporarily | Drip Admin Dashboard supports review queues, notes, approvals, and exports. |
| Migration read/export helpers | Keep temporarily | Firestore migration validated and legacy dependencies retired. |
| Legacy read-only reports | Keep temporarily | Rebuilt dashboard/report exports accepted by Drip. |

## Functions That Should Eventually Be Deleted

Delete only after explicit human approval, dependency proof, backup, and rollback plan.

| Category | Delete after |
| --- | --- |
| Legacy Sheet 1 patient print media workflows | Patient Campaigns are migrated, historical data is preserved, and traffic is zero. |
| Duplicate Apps Script functions/constants | Canonical implementation exists and tests prove behavior. |
| Direct production write helpers without dry-run | Cloud Run replacements are deployed, gated, and monitored. |
| ScreenCloud-specific business logic embedded outside adapter | DisplayProviderService owns all provider operations. |
| Hard-coded pricing calculations | New budget/dynamic pricing billing model is accepted. |
| Old provider marketplace/control center naming | User-facing terminology is fully migrated to Media Center. |

## Human Approval Required

| Action | Approval required |
| --- | --- |
| Production dataset load | Yes |
| Production feature flag activation | Yes |
| Billing approval or invoice/charge execution | Yes |
| Experiment launch | Yes |
| Restore operation | Yes |
| External display sync write | Yes, until adapter is proven and flag-gated |
| Legacy code deletion | Yes |
| Production cutover | Yes |

## Safe To Automate

| Action | Automation conditions |
| --- | --- |
| Intake normalization | Idempotent, logged, retryable, no activation side effects. |
| Safety checks | Automated checks may classify; exceptions go to human review. |
| Expiration of ended campaigns | Only when lifecycle rules and audit logging are enforced. |
| Daily backups | Restore is never automatic in production. |
| Market intelligence refresh | Data freshness and quality warnings must be surfaced. |
| Job failure detection | Creates human review items instead of mutating production state. |

## Next Audit Pass

The next audit pass should verify deployed Apps Script source parity and exact runtime source order, plus live Cloud Run/BigQuery state, before any production-connected Phase 1 implementation. The uploaded repo ZIP improves market intelligence source confidence but is not enough to proceed to production implementation.
