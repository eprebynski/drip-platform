# Drip Healthcare Rebuild Blueprint

## Objective

Rebuild Drip Healthcare into an enterprise-grade, automation-first operating system with safety-first campaign activation, Firestore as the operational source of truth, BigQuery for analytics and market intelligence, Cloud Run for services and jobs, and the Drip Admin Dashboard as the control center.

## Source-Verified Phase 0 Update

The redacted aggregate verifies that the current backend is an Apps Script-centered operating system with an anonymous public web app router, 10 visible trigger entries, 1,161 parsed function declarations, direct Stripe invoice/customer writes, direct ScreenCloud content/channel writes, Sheet 1-7 operational state, Cloud Run helper services, and BigQuery market intelligence assets.

The uploaded repo ZIP validates a narrow market intelligence scaffold: Terraform for `drip_raw`, `drip_core`, `drip_marts`, Artifact Registry, and `drip-segment-api`; Dataform models that publish `drip_marts.targetable_providers`; a dry-run-default Medicaid ingest helper; and a FastAPI Segment API. It does not validate Apps Script deployed source parity, Apps Script runtime load order, live Cloud Run state, or sources for all Cloud Run services named in the aggregate.

Phase 1 should start with a non-production foundation package: schemas, service contracts, feature flags, job logs, audit logs, route classifications, external-write gates, and approval records needed to safely extract the current Apps Script workflows.

Phase 1 foundation package added locally: `packages/shared`. It includes schema descriptors, shared statuses, dry-run guards, display-provider stubs, policy validators, Codex Review Queue contracts, and credential-free tests. This remains a reviewable contract package, not production implementation.

Phase 1.5 local service skeleton package added locally: `packages/services`. It includes mock-only skeletons for Admin API, intake, safety, redirect, display, billing, backup, dataset ingestion, intelligence, daily orchestration, and Codex review output. These modules are not deployable production services.

## Rebuild Principles

| Principle | Design rule |
| --- | --- |
| Safety first | No campaign, variant, placement, or billing action reaches production without required gates. |
| Source-of-truth clarity | Firestore owns operational state; BigQuery owns analytics; Sheets are intake/review/migration bridge only. |
| Adapter boundaries | ScreenCloud, Stripe, Squarespace, and future providers are integrations behind service boundaries. |
| Dry-run before write | Every external write path supports preview, dry-run, audit log, and approval. |
| Human review by exception | Daily operations should run automatically and create review tasks only when necessary. |
| Reversible migration | Each phase needs rollback notes, feature flags, and acceptance tests. |
| Enterprise readiness | RBAC, least privilege, audit logs, backup policy, incident process, and restore tests are first-class requirements. |

## Target Architecture

| Layer | Target responsibility |
| --- | --- |
| Firestore | Campaigns, providers, advertisers, display approvals, placements, billing state, feature flags, job logs, review queues, backups, Codex rebuild tracking. |
| BigQuery | Market intelligence, campaign analytics, QR events, playback logs, Media Center engagement, reporting marts, recommendation history. |
| Cloud Run | APIs, redirects, intake processing, safety checks, display sync, billing orchestration, backups, dataset ingestion, rendering services. |
| Cloud Scheduler | Daily automation, backups, refresh jobs, pacing checks, health checks. |
| Cloud Storage | Dataset uploads, backup artifacts, exports, rendered creative assets, versioned snapshots. |
| Secret Manager | API keys, external provider tokens, Stripe secrets, ScreenCloud credentials. |
| Google Sheets | Raw Squarespace intake, admin review bridge, migration bridge, read-only legacy history. |
| Apps Script | Temporary bridge only; shrink after migration. |
| Drip Admin Dashboard | Human review, safety review, data uploads, job monitoring, feature flags, change requests, backups, Codex Review Queue. |
| Advertiser Dashboard | Campaign submission, market recommendations, reporting, budget/billing visibility. |
| Media Center | Provider profile, display preferences, provider-facing campaigns, display approval controls. |

## Campaign Model

| Campaign type | Purpose | Key requirements |
| --- | --- | --- |
| Patient Campaign | Patient-facing waiting room screen campaign with QR redirect. | Video URL, landing page URL, safety checks, provider display approval, placement records, QR event logging. |
| Media Center Campaign | Provider-facing advertiser content in Media Center. | User-facing terminology must be Media Center, not legacy marketplace/control center. |
| Conference Campaign | Conference screen and showcase placement. | Track screen QR scans, showcase page views, CTA clicks, and engagement. |

## Safety Lifecycle

Campaign lifecycle values: DRAFT, SUBMITTED, SAFETY_CHECKING, NEEDS_REVIEW, APPROVED, SCHEDULED, ACTIVE, PAUSED, EXPIRED, BLOCKED, ARCHIVED.

Activation rule: a campaign can become ACTIVE only when safetyStatus is APPROVED and date, billing, placement, and provider approval rules pass.

## Phase Order

| Phase | Name | Goal | Production posture |
| --- | --- | --- | --- |
| 0 | Non-destructive audit and blueprint | Document architecture, risks, and migration plan. | Documentation only. |
| 1 | Foundation schemas and service skeletons | Create Firestore schemas, job logs, feature flags, rebuild tracking collections, service contracts. | No production writes except approved infrastructure setup in future implementation. |
| 2 | Admin Dashboard MVP | Build control center with Codex Review Queue and human review queues. | Staging first, approval-gated prod. |
| 3 | Dataset ingestion and market intelligence | Upload, validate, load, and refresh datasets. | Dry-run and approval for production loads. |
| 4 | Daily self-sufficient automation | Automate intake, safety, activation, expiration, pacing, summaries, alerts. | Feature-flagged and review-gated. |
| 5 | Display provider abstraction | Build DisplayProviderService and ScreenCloudAdapter. | Dry-run first, external writes approval-gated. |
| 6 | Backup and restore automation | Automate backups and document restore tests. | Restore never automatic in production. |
| 7 | Advertiser Dashboard | Campaign submission, recommendations, reporting, budget visibility. | Staged rollout. |
| 8 | Media Center | Provider preferences, display approvals, provider-facing campaigns. | Staged rollout. |
| 9 | Billing and revenue share | Stripe billing, approvals, previews, reconciliation. | Dry-run until manually approved. |
| 10 | Legacy Apps Script retirement | Retire legacy Sheet 1 and old Apps Script paths. | Requires explicit deletion approval. |

## Phase 1 Recommended Implementation Task

Build the non-production foundation package:

| Work item | Output |
| --- | --- |
| Firestore schema definitions | Collections for campaigns, providers, advertisers, display approvals, placements, jobRuns, featureFlags, changeRequests, auditLogs, backups, codexTasks, codexReviewItems. |
| Service skeletons | IntakeProcessor, SafetyService, ActivationService, DisplayProviderService, BillingService, MarketIntelligenceService, BackupService. |
| Job log contract | Common jobRun schema with dryRun, startedAt, completedAt, status, counts, errors, relatedReviewItems. |
| Feature flag contract | Flags for Firestore campaigns, Cloud Run redirects, safety checks, display sync, pricing, experiments, recommendations, billing. |
| Rebuild tracking | Codex Review Queue schema and task packet format. |
| Acceptance tests | Schema validation, lifecycle guard tests, dry-run enforcement, audit log tests. |
| BigQuery schema plan | Non-production table definitions in `docs/bigquery-schema.md`; no live tables created or changed. |
| Local service skeletons | Mock-only handlers under `packages/services`; no live credentials or production writes. |

Source-verified priority additions:

| Addition | Why it is needed |
| --- | --- |
| Apps Script route contract map | `doGet`/`doPost` currently multiplex conference, directory, QR, billing webhook, signage, and creative routes. |
| External write guard contract | Stripe and ScreenCloud write functions exist and must move behind dry-run/approval semantics. |
| Display approval migration contract | Sheet 3 Business Approvals and Sheet 6 Approval Map both represent provider/advertiser approval state. |
| Billing reconciliation contract | Billing spans Sheet 2 Billing Config/Summary/Invoice Log, Sheet 6 video billing, Sheet 7 purchase log, Stripe, and Cloud Run webhook forwarding. |
| Secret Manager migration plan | Stripe, ScreenCloud, Safe Browsing, Vision, Vimeo, webhook/token secrets, and web app URL config are currently in code/properties/env patterns. |
| Segment API hardening contract | Repo ZIP shows public `drip-segment-api` deployment posture and a persistent `POST /segments/create` route. |
| Market intelligence table contract | ZIP source defines `drip_marts.targetable_providers`; aggregate notes `drip_core.targetable_providers` was not found. |

## Approval Gates

| Gate | Required before |
| --- | --- |
| Architecture approval | Phase 1 implementation starts. |
| Source parity approval | Any production implementation relies on deployed Apps Script source order, Cloud Run source/deploy parity, and live BigQuery table map. |
| Schema approval | Data migration or dashboard writes begin. |
| Safety policy approval | Automated campaign activation is enabled. |
| Dataset approval | Production dataset load into BigQuery. |
| Display sync approval | Production ScreenCloud writes. |
| Billing approval | Stripe invoice/charge execution. |
| Restore approval | Any production restore. |
| Legacy retirement approval | Any deletion or trigger removal. |

## Rollback Strategy

Each phase should ship behind feature flags, preserve legacy read paths until acceptance tests pass, write audit logs for every state transition, and include a rollback checklist. Migration should prefer dual-write or read-only shadow mode before cutover where safe.
