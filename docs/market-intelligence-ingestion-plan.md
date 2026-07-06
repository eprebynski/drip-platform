# Market Intelligence Ingestion Plan

## Objective

Create an ingestion and refresh layer that supports new datasets, validates schemas, loads BigQuery, refreshes recommendations, and surfaces data freshness warnings in the Advertiser Dashboard and Admin Dashboard.

## Source-Verified Current State

| Current item | Source-verified status | Migration implication |
| --- | --- | --- |
| Cloud Run services | Aggregate lists `drip-segment-api` and `drip-segment-proxy` in `drip-platform-prod`; repo ZIP source validates `drip-segment-api` only. | Treat proxy/source parity for other services as unresolved. |
| Segment API | ZIP source exposes `GET /healthz`, `POST /segments/preview`, `POST /segments/create`, and `GET /segments/{segment_id}/providers`. | Preview/list can inform target API contracts; create route must be auth/approval-gated before production use. |
| BigQuery datasets | `drip_raw`, `drip_core`, `drip_marts`; Terraform in ZIP provisions these datasets. | Use as current warehouse baseline, but live existence/permissions were not queried. |
| BigQuery tables | Aggregate observes `provider_procedure_mix` and `targetable_providers`; Dataform source defines `drip_marts.targetable_providers`, `drip_marts.segments`, and `drip_marts.segment_membership`. | Align callers to `drip_marts.targetable_providers` after live confirmation. |
| BigQuery issue | `drip_core.targetable_providers` returned not found in the aggregate note, while ZIP source defines the table in `drip_marts`. | Phase 1/3 blocker until live table location and all callers are confirmed. |
| Repo state | ZIP snapshot root is `drip-platform-main/` at archive commit `0a6b3ad49657e059ec830d627ce89d45fa3e8a44`; no `.git` metadata or live GitHub access assumed. | Branch state, merged PR state, tests, and uncommitted Cloud Shell changes cannot be verified from the ZIP. |
| Dataform model chain | ZIP defines raw mappings for Medicaid, NPPES, referral edges, core utilization/procedure/influence tables, and targeting marts. | Good source baseline for Phase 3 design; live schedules and data quality remain unresolved. |
| Ingest helper | `medicaid_to_gcs_bq.py` dry-runs by default and writes GCS/BigQuery only with `--execute`. | Keep production dataset loads approval-gated. |
| Cloud Build/Terraform posture | Source builds/deploys `drip-segment-api` and configures public Cloud Run invocation. | Requires auth/IAM review before use. |
| Sheet search signals | Sheet 1 contains Search Interest Scores and Google Ads Scores tabs; Apps Script has search score attachment/upsert helpers. | Move to BigQuery ingestion/feature pipeline. |

## Repo ZIP Validation Notes

The ZIP improves source confidence for the market intelligence scaffold, but it does not prove deployed parity. Do not treat the archived `cloudbuild.yaml`, Terraform, or Dataform files as live production truth until Cloud Run service metadata, BigQuery tables, Dataform schedules, IAM, and service account permissions are verified through an approved read-only production review.

Phase 1 adds local contracts for `datasets`, `datasetIngestionJobs`, `intelligenceRefreshJobs`, and `marketIntelligenceOutputs` in `packages/shared/src/schemas/entities.js`. These contracts support review and local tests only; they do not load production datasets or refresh live recommendations.

Phase 1.5 adds local skeletons for dataset ingestion and intelligence recommendations in `packages/services/src/dataset-ingestion-service.js` and `packages/services/src/intelligence-service.js`. They create metadata drafts, dry-run BigQuery load plans, recommendation drafts, and source freshness warnings only.

## Supported Dataset Sources

| Source category | Examples |
| --- | --- |
| Government payor datasets | Medicare, Medicaid, public payor data. |
| Commercial payor datasets | Commercial coverage and market files. |
| Provider datasets | Provider directories, facilities, affiliations. |
| Claims/procedure mix | Procedure, specialty, utilization, claims mix. |
| Facility taxonomy | Facility type, specialty, geography, screen inventory. |
| Conference/event datasets | Conference metadata, sponsors, sessions, exhibitor lists. |
| Search-interest data | Google Search/search-interest signals. |
| Campaign performance | QR scans, clicks, conversions where available. |
| Screen inventory | Provider/facility/screen placement capacity. |
| Playback logs | Display proof-of-play and playback summaries. |
| Media Center engagement | Provider views, clicks, CTA activity. |
| Custom datasets | Admin-uploaded CSV/XLSX or cloud storage files. |

## Ingestion Workflow

| Step | Automation | Human approval |
| --- | --- | --- |
| Upload dataset | Admin uploads file and metadata. | Required for production dataset loads. |
| Detect schema | Automated inference and known-template matching. | Human mapping required when ambiguous. |
| Validate schema | Required fields, types, ranges, uniqueness. | Human review if validation fails. |
| Data quality checks | Deduplication, null thresholds, outliers, date coverage, source metadata. | Human review for severe warnings. |
| Load staging table | Automated after validation. | No production impact. |
| Approve production load | Not automated. | Required. |
| Load production BigQuery tables | Automated after approval. | Approval already captured. |
| Refresh features | Automated. | Review if freshness or quality warnings. |
| Generate recommendations | Automated. | Review if model/rules changed. |
| Publish dashboard outputs | Automated with freshness warnings. | Approval required for major logic changes. |

## Dataset Upload Metadata

| Field | Purpose |
| --- | --- |
| datasetUploadId | Unique upload record. |
| sourceType | Dataset source category. |
| sourceName | Human-readable source name. |
| fileRef | Cloud Storage object path. |
| schemaVersion | Expected or inferred schema version. |
| sourceDateRange | Dates covered by dataset. |
| uploadedBy | Admin user. |
| approvalStatus | Pending, approved, rejected. |
| qualityStatus | Passed, warning, failed. |
| loadStatus | Pending, staging_loaded, production_loaded, failed. |
| freshnessWarning | Warning shown to dashboards. |

## Recommendation Outputs

| Output | Required |
| --- | --- |
| marketOpportunityScore | Yes |
| specialtyOpportunityScore | Yes |
| payorOpportunityScore | Yes |
| advertiserFitScore | Yes |
| recommendedCampaignType | Yes |
| suggestedMarkets | Yes |
| suggestedSpecialties | Yes |
| suggestedBudgetRange | Yes |
| reasoningText | Yes |
| dataFreshnessWarnings | Yes |

## Acceptance Criteria

| Phase | Criteria |
| --- | --- |
| Phase 3 MVP | Admin can upload a dataset, validate schema, dry-run load, approve production load, and see job logs. |
| Refresh | Market intelligence refresh writes recommendation outputs with freshness warnings. |
| Dashboard | Advertiser/Admin dashboards show recommendations and warnings. |
| Audit | Dataset approvals, loads, and refreshes write audit logs and jobRuns. |
| Source parity | Live BigQuery table map, Dataform schedule, and Segment API IAM/deployment match approved source. |
| Contract validation | Dataset and market-intelligence contracts validate locally without live credentials. |
| Local skeleton validation | Dataset and intelligence services produce dry-run drafts without Cloud Storage, BigQuery, Google Search, or payor data access. |
