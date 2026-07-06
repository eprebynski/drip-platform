# Automation Plan

## CI/CD

| Area | Recommendation |
| --- | --- |
| Pull requests | Require lint, type checks, unit tests, schema tests, lifecycle guard tests, and security scan. |
| Staging deploy | Automatically deploy after merge to main or release branch. |
| Production deploy | Manual approval with release notes, backup confirmation, feature flag plan, and rollback plan. |
| PR summaries | Create Codex Review Queue items for generated changes and risk findings. |

## Source-Verified Automation Replacements

| Current automation | Replacement |
| --- | --- |
| Apps Script time triggers for finalization, conference deadlines, purchase holds, weekly analytics | Cloud Scheduler invoking Cloud Run jobs with `jobRuns` records. |
| Apps Script onEdit triggers for Sheets 1-4 and 7 | IntakeProcessor/Admin workflows; no trigger mutation from code. |
| Apps Script trigger creator/reset functions | Infrastructure-as-code and Admin Dashboard controlled scheduler registry. |
| Apps Script billing/invoice send functions | BillingService preview, approval, execute, webhook, and reconciliation jobs. |
| ScreenCloud sync/rebuild functions | DisplayProviderService dry-run and approval-gated sync jobs. |
| Playback rollups from ScreenCloud logs | PlaybackIngestionService to BigQuery, then billing/reporting jobs. |
| Search Interest Scores and Google Ads Scores sheet helpers | MarketIntelligenceService ingestion and feature refresh. |

## Cloud Run Deployment Automation

Use separate services/jobs for APIs and scheduled operations. Deploy with environment-specific configuration, least-privilege service accounts, Secret Manager references, and health checks.

Source-verified ZIP note: the archived `cloudbuild.yaml` builds and deploys only `drip-segment-api`, sets `BQ_MARTS_DATASET=drip_marts`, and uses `--allow-unauthenticated`. Treat this as source evidence, not production truth; Phase 1 should require explicit IAM review and deployment approval before reusing the pipeline.

Phase 1 adds contract-only automation primitives: `featureFlags`, `jobs`, `errors`, `auditLogs`, `changeRequests`, `rollbackNotes`, `rebuildApprovals`, and the dry-run guard. These primitives do not create schedulers, deployments, or production resources.

Phase 1.5 adds a local daily orchestrator skeleton with job definitions and dry-run job/error outputs only. No Cloud Scheduler, Cloud Run job, Apps Script trigger, or production resource is created.

## Schema Automation

| Schema | Automation |
| --- | --- |
| Firestore | Versioned schema definitions, validation tests, index definitions, security rules tests. |
| BigQuery | Versioned table definitions, staging/prod datasets, migration scripts, data quality checks. |
| Feature flags | Seed defaults through approved config, never ad hoc production edits. |

## Backup Automation

| Target | Schedule |
| --- | --- |
| Firestore | Daily operational, weekly full, monthly archive, pre-deployment. |
| BigQuery | Daily snapshots or exports for critical datasets. |
| Google Sheets | Daily export while used as intake/bridge. |
| Apps Script source | Daily or pre-deployment source snapshot. |
| Cloud Run service definitions | Pre-deployment and weekly. |
| GitHub repo snapshot | Pre-deployment and weekly. |
| ScreenCloud placement snapshots | Daily while screens are active. |
| Stripe metadata/log references | Daily metadata export/reference log. |
| Feature flags/change requests | Daily. |

## Migration Automation

| Flow | Automation mode |
| --- | --- |
| Sheet to Firestore migration | Dry-run counts, sample validation, approved write. |
| Legacy dependency detection | Source scan and dashboard report. |
| Redirect migration | Shadow logging and staged feature flag. |
| Display placement rebuild | Dry-run diff and approval-gated sync. |
| Billing migration | Preview and reconciliation before Stripe execution. |

## Phase 1.5 Local Job Definitions

`packages/services/src/daily-orchestrator.js` defines local-only dry-run jobs for intake, safety, activation checks, expiration checks, display sync previews, playback ingestion placeholders, campaign summaries, market intelligence refresh placeholders, Google Search signal placeholders, advertiser recommendations, budget pacing, billing readiness, backups, failed job detection, and human review task creation.

## External Provider Modes

| Provider | Dry-run | Production |
| --- | --- | --- |
| ScreenCloud | Preview content/playlist changes and diffs. | Approval-gated sync through adapter. |
| Stripe | Calculate billing preview and invoice/charge plan. | Billing admin approval required. |
| BigQuery | Load staging tables and validate. | Production dataset approval required. |
| Google Search/search-interest | Fetch and stage signal refresh. | Publish into recommendation features after quality checks. |

## Admin Alerts

Create humanReviewTasks and alerts for failed critical jobs, stale backups, blocked safety reviews, display sync failures, billing readiness issues, stale market intelligence, and Codex review items requiring approval.
