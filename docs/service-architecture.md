# Service Architecture

## Service Map

| Service | Runtime | Responsibility | Production write posture |
| --- | --- | --- | --- |
| IntakeProcessor | Cloud Run job/service | Read raw intake rows, normalize submissions, validate schema, upsert Firestore records. | Automated after idempotency tests. |
| SafetyService | Cloud Run service/job | Run video, landing page, policy, advertiser, provider approval, date, and billing checks. | Automated checks; human exceptions gated. |
| ActivationService | Cloud Run job | Move approved scheduled campaigns to ACTIVE and expire ended campaigns. | Feature-flagged and heavily tested. |
| RedirectService | Cloud Run service | Serve QR redirects and log scan events. | Staged cutover from legacy redirects. |
| DisplayProviderService | Cloud Run service/job | Abstract display provider operations. | Dry-run first; production writes approval-gated. |
| ScreenCloudAdapter | Cloud Run integration module | First display provider adapter for ScreenCloud. | Dry-run and preview before writes. |
| BillingService | Cloud Run service/job | Build billing previews, approval workflow, Stripe execution, revenue share calculations. | Dry-run until billing approval. |
| DatasetIngestionService | Cloud Run service/job | Upload validation, schema mapping, quality checks, BigQuery loading. | Production loads require approval. |
| MarketIntelligenceService | Cloud Run job | Refresh features and recommendations from BigQuery and search-interest signals. | Automated with freshness warnings. |
| BackupService | Cloud Run job | Coordinate backups, metadata, alerts, and restore-test records. | Backups automated; restores never automatic. |
| WebsiteFrontend | Firebase Hosting or GCP-first static hosting | Public marketing pages, static app shell assets, showcase pages, and preview channels. | Staged and DNS-cutover gated; no production change in Phase 2.1. |
| AdminApi | Cloud Run service | Drip Admin Dashboard API for reviews, flags, jobs, backups, Codex queue. | RBAC protected. |
| AdvertiserApi | Cloud Run service | Advertiser Dashboard submission, recommendations, reporting, billing visibility. | RBAC protected. |
| MediaCenterApi | Cloud Run service | Provider profile, display preferences, provider-facing campaigns. | RBAC protected. |

## Phase 1 Contract Package

| Contract area | Local source | Production posture |
| --- | --- | --- |
| Shared statuses and feature flags | `packages/shared/src/status/index.js` | Contract-only. |
| Entity schemas | `packages/shared/src/schemas/entities.js` | Local validation only. |
| Dry-run guard | `packages/shared/src/contracts/dry-run-guard.js` | Blocks future external writes unless explicit write approval is supplied. |
| Policy validators | `packages/shared/src/contracts/policies.js` | Local rule checks for campaigns, display preferences, and experiments. |
| Display provider abstraction | `packages/shared/src/contracts/display-provider.js` | Non-production adapter stubs only; no live ScreenCloud writes. |

## Phase 1.5 Local Service Skeletons

| Target service | Local source | Production posture |
| --- | --- | --- |
| AdminApi | `packages/services/src/admin-api.js` | Mock repository only. |
| IntakeProcessor | `packages/services/src/intake-service.js` | Normalizes drafts only; no live Sheets/Squarespace. |
| SafetyService | `packages/services/src/safety-service.js` | Shape checks and mock safety results only. |
| RedirectService | `packages/services/src/redirect-service.js` | Event builders and mock destination selection only. |
| DisplayProviderService | `packages/services/src/display-service.js` | Local adapters require explicit `dryRun=true`; no provider writes. |
| BillingService | `packages/services/src/billing-service.js` | Preview objects only; no Stripe. |
| BackupService | `packages/services/src/backup-service.js` | Dry-run metadata only; no backup execution. |
| DatasetIngestionService | `packages/services/src/dataset-ingestion-service.js` | Metadata and dry-run load plans only; no Cloud Storage/BigQuery. |
| MarketIntelligenceService | `packages/services/src/intelligence-service.js` | Draft recommendations only; no live BigQuery/search/payor data. |
| DailyOrchestrator | `packages/services/src/daily-orchestrator.js` | Local job logs only; no scheduler. |

## Phase 2.1 Website And Domain Planning

Squarespace is treated as a temporary public website/domain dependency, not a long-term service runtime. Admin tools, authenticated dashboards, billing workflows, campaign controls, internal review queues, redirect/event APIs, and dataset workflows must live behind Drip app/API service boundaries, not in Squarespace pages, forms, embeds, or scripts.

| Surface | Target service boundary |
| --- | --- |
| `driphealthcare.com`, `www.driphealthcare.com` | WebsiteFrontend for public marketing pages. |
| `admin.driphealthcare.com` | Admin Dashboard frontend plus AdminApi. |
| `app.driphealthcare.com` | Shared authenticated app frontend plus service APIs. |
| `app.driphealthcare.com/advertisers` | Advertiser Dashboard frontend plus AdvertiserApi. |
| `app.driphealthcare.com/media-center` | Media Center frontend plus MediaCenterApi. |
| `api.driphealthcare.com` | Cloud Run API boundary with auth/RBAC. |
| `go.driphealthcare.com` | RedirectService with event logging and rollback plan. |
| `showcase.driphealthcare.com` | WebsiteFrontend/showcase frontend plus event APIs where needed. |

Recommended hosting is Firebase Hosting or equivalent GCP-first static hosting for public/static frontends, with Cloud Run APIs for dynamic behavior. DNS migration, Squarespace edits, and production hosting resources are explicitly out of scope until a separately approved cutover task.

## Source-Verified Extraction Targets

| Current Apps Script surface | Target service |
| --- | --- |
| `doGet`/`doPost` anonymous web app router | RedirectService, public campaign APIs, AdminApi, MediaCenterApi, BillingService endpoints. |
| `finalizeSquarespaceRows`, Sheet 1/2/4/5/6/7 finalizers | IntakeProcessor and CampaignService. |
| Sheet 1 Redirect Pools and QR/click handlers | RedirectService and PlacementService. |
| Sheet 5 directory handlers | MediaCenterApi and RedirectService. |
| Sheet 6 video campaign, placement, QR, ScreenCloud, playback functions | CampaignService, DisplayProviderService, PlaybackIngestionService, BillingService. |
| Sheet 7 conference event, purchase, campaign, showcase, screen functions | ConferenceService, BillingService, DisplayProviderService, ReportingService. |
| Apps Script Stripe helpers and Cloud Run Stripe webhook forwarder | BillingService with direct webhook processing and Secret Manager. |
| Market/search score helpers and segment services | MarketIntelligenceService and BigQuery jobs. |

## Repo ZIP Validated Service Surface

| Current source | Validated behavior | Target treatment |
| --- | --- | --- |
| `services/segment-api/main.py` | FastAPI app reads `drip_marts.targetable_providers` for segment preview and provider listing. | Fold into MarketIntelligenceService or protect as an authenticated service. |
| `services/segment-api/main.py` | `POST /segments/create` writes `drip_marts.segments` and `drip_marts.segment_membership`. | Require auth, audit logs, idempotency, and approval/role policy before production writes. |
| `cloudbuild.yaml` | Builds and deploys `drip-segment-api` with `--allow-unauthenticated`. | Replace with environment-specific deploy approvals and explicit IAM posture. |
| `infra/terraform/main.tf` | Grants `allUsers` invoker on `drip-segment-api`. | Review and likely restrict before any enterprise rollout. |
| `jobs/ingest/medicaid_to_gcs_bq.py` | Dry-run-default local CSV to GCS/BigQuery loader. | Keep as reference for DatasetIngestionService; production loads require approval. |

## Shared Service Requirements

| Requirement | Standard |
| --- | --- |
| Authentication | Use managed identity/auth provider and map users to Firestore RBAC roles. |
| Authorization | Enforce least-privilege role checks per route and action. |
| Secrets | Load provider credentials from Secret Manager only. |
| Logging | Structured logs with requestId, actorId, entityId, jobRunId, and riskLevel where relevant. |
| Audit logs | Required for state transitions, approvals, external writes, billing, feature flags, restore, and deletion proposals. |
| Idempotency | Required for intake, billing preview, display sync, backups, dataset loads, and scheduled jobs. |
| Dry-run | Required for external writes, billing, dataset production loads, display sync, migration, and legacy retirement. |
| Alerts | Failed jobs and risky states create humanReviewTasks and admin alerts. |

## API Boundary

| API | Example routes |
| --- | --- |
| AdminApi | /admin/jobs, /admin/review-tasks, /admin/campaign-safety, /admin/feature-flags, /admin/backups, /admin/codex-review-items |
| AdvertiserApi | /advertiser/campaigns, /advertiser/recommendations, /advertiser/reports, /advertiser/billing |
| MediaCenterApi | /media-center/provider, /media-center/display-preferences, /media-center/campaigns |
| RedirectService | /r/{qrCodeId}, /events/redirect |
| IntakeProcessor | /intake/squarespace, /intake/sheets/dry-run |
| DisplayProviderService | /display/placements/preview, /display/placements/sync, /display/playback-logs |
| BillingService | /billing/preview, /billing/approve, /billing/execute |
| WebsiteFrontend | /, /advertisers, /media-center, /contact, /privacy, /terms, /showcase |

## Environment Separation

| Environment | Purpose | Allowed operations |
| --- | --- | --- |
| Local | Development and unit tests. | No live external writes. |
| Staging | Integration testing with test data and test provider accounts. | Dry-run plus controlled test writes. |
| Production | Live Drip operations. | Approval-gated writes and monitored scheduled jobs. |

## CI/CD Recommendation

| Stage | Requirement |
| --- | --- |
| Pull request | Lint, type checks, unit tests, schema validation, lifecycle tests, security scan. |
| Staging deploy | Automatic after approved merge if tests pass. |
| Staging acceptance | Run job dry-runs, dashboard smoke tests, API contract tests. |
| Production approval | Manual approval with release notes, backup confirmation, rollback plan, and feature flag plan. |
| Production deploy | Controlled deployment, health checks, alert watch, rollback readiness. |

## Monitoring

| Signal | Dashboard visibility |
| --- | --- |
| Job failures | Jobs & Errors module and human review task. |
| Campaigns blocked by safety | Campaign Safety Review module. |
| Dataset load failures | Dataset Uploads module. |
| Recommendation freshness | Market Intelligence module. |
| Display sync drift | Display Placements module. |
| Billing preview/approval status | Billing Review module. |
| Backup failure or stale restore test | Backup & Restore module. |
| Codex-generated outputs needing review | Codex Review Queue. |
