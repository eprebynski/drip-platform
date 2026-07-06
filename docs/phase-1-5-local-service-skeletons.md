# Phase 1.5 Local Service Skeletons

## Scope

Phase 1.5 creates local-only service skeletons that use the Phase 1 shared contracts. These modules use mock/local data only and do not deploy, modify Apps Script, change triggers, access live Sheets, write Firestore, write BigQuery, call Stripe, call ScreenCloud, create production resources, activate campaigns, or require live credentials.

Requested branch name for future source-control work: `rebuild/phase-1-5-local-service-skeletons`. This workspace is not a git checkout, so the branch name is recorded here but no branch was created locally.

## Unresolved Blockers Preserved

| Blocker | Phase 1.5 status |
| --- | --- |
| Deployed Apps Script parity unresolved | Preserved. |
| Apps Script runtime load order unresolved | Preserved. |
| Live Cloud Run/IAM state unresolved | Preserved. |
| BigQuery `targetable_providers` location unresolved | Preserved. |
| Approval owners unresolved | Preserved. |
| Secret Manager migration unresolved | Preserved. |
| Live route usage unresolved | Preserved. |

## Service Skeletons

| Service | Local source | Local handlers | Future safe production connection |
| --- | --- | --- | --- |
| admin-api | `packages/services/src/admin-api.js` | System health, jobs, errors, human review queue, Codex Review Queue, flags, dataset jobs, MI status, display status, backups, change requests. | Connect to authenticated AdminApi data sources after IAM, RBAC, and approval owners are confirmed. |
| intake-service | `packages/services/src/intake-service.js` | Validate raw intake and normalize provider, advertiser, patient campaign, Media Center campaign, and conference campaign drafts. | Connect approved Squarespace/Sheets readers after Apps Script parity, runtime order, and route usage are verified. |
| safety-service | `packages/services/src/safety-service.js` | URL shape checks, safety review draft, mock result, active-campaign safety enforcement. | Add managed URL/video/policy checks after Secret Manager and safety-policy approval. |
| redirect-service | `packages/services/src/redirect-service.js` | Redirect event builders, mock destination selection, experiment assignment events, variant safety enforcement. | Wire to Cloud Run redirect handlers only after route usage and source parity are measured. |
| display-service | `packages/services/src/display-service.js` | Local adapters for ScreenCloud, DirectDripPlayer, FutureProvider, ManualExport. | Replace with approved provider adapters after display/write approval owners, IAM, and rollback snapshots exist. |
| billing-service | `packages/services/src/billing-service.js` | Billing previews, readiness checks, draft campaign charges, provider revenue share, invoice preview. | Connect Stripe only after billing approval owners and Secret Manager migration are confirmed. |
| backup-service | `packages/services/src/backup-service.js` | Backup job drafts, target validation, dry-run summary, restore-test request draft. | Execute real backups only after targets, restore policy, and service account scopes are approved. |
| dataset-ingestion-service | `packages/services/src/dataset-ingestion-service.js` | Dataset metadata draft, dataset type validation, required metadata validation, dry-run BigQuery load plan, quality warning object. | Connect Cloud Storage/BigQuery only after production-load approval owners and live table map are confirmed. |
| intelligence-service | `packages/services/src/intelligence-service.js` | Market opportunity and advertiser recommendation drafts with Google Search/payor placeholders and freshness warnings. | Query live BigQuery only after `targetable_providers` location, Dataform, and IAM are verified. |
| daily-orchestrator | `packages/services/src/daily-orchestrator.js` | Local job definitions and dry-run job/error outputs for daily operating routines. | Add schedulers only after approval owners, rollback plans, source parity, and live service parity are confirmed. |
| Codex review generator | `packages/services/src/codex-review.js` | Phase 1.5 Codex Review Queue item generation. | Store in Admin Dashboard only after Codex Review Queue write path is approved. |

## Admin Dashboard Visibility Notes

| Service | Admin visibility needed |
| --- | --- |
| admin-api | System Health, Jobs & Errors, Human Review Queue, Codex Review Queue, Feature Flags, Change Requests. |
| intake-service | Intake drafts, validation failures, duplicate warnings, source system, normalization result. |
| safety-service | Safety status, check results, reviewer queue, blocked activation reason. |
| redirect-service | Redirect event preview, selected destination, route/campaign mapping, variant safety. |
| display-service | Placement status, dry-run diffs, adapter type, blocked writes, approval requirement. |
| billing-service | Billing readiness, preview totals, revenue share draft, invoice preview, approval requirement. |
| backup-service | Backup targets, dry-run summaries, restore-test requests, backup warnings. |
| dataset-ingestion-service | Dataset metadata, validation status, dry-run load plan, quality warnings. |
| intelligence-service | Recommendation draft, source freshness warnings, source dataset placeholders. |
| daily-orchestrator | Job log, error log, approvalRequired, rollbackNotes, next action. |

## Local Test Coverage

| Requirement | Covered by |
| --- | --- |
| Intake normalization with mock data | `packages/services/test/services.test.js`. |
| Campaign safety lifecycle enforcement | `packages/services/test/services.test.js`. |
| Redirect destination selection with mock data | `packages/services/test/services.test.js`. |
| Experiment variant safety enforcement | `packages/services/test/services.test.js`. |
| Display-provider dry-run enforcement | `packages/services/test/services.test.js`. |
| Billing preview generation with mock events | `packages/services/test/services.test.js`. |
| Backup dry-run summary generation | `packages/services/test/services.test.js`. |
| Dataset metadata validation | `packages/services/test/services.test.js`. |
| Market intelligence recommendation draft | `packages/services/test/services.test.js`. |
| Daily orchestrator dry-run job output | `packages/services/test/services.test.js`. |
| Codex Review Queue item generation | `packages/services/test/services.test.js`. |

## Codex Review Queue Output Format

```text
Codex Review Queue Item
Phase:
Title:
Summary:
Files changed:
Risk level:
Production impact:
Tests or validation:
Unresolved blockers:
Approvals needed:
Recommended next Codex prompt:
copyForChatGPT:
```

## Phase 1.5 Readiness

The package is ready for local review and contract refinement. It is not production-ready and does not resolve source parity, live IAM, BigQuery location, approval-owner, Secret Manager, or route-usage blockers.
