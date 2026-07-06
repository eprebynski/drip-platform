# Migration Plan

## Strategy

Migrate incrementally with feature flags, dry-runs, audit logs, backups, and approval gates. Do not delete legacy code or disable triggers until dependencies are proven retired and Drip approves.

## Source-Verified Migration Starting Point

| Domain | Current source |
| --- | --- |
| Patient legacy campaigns | Sheet 1, Redirect Pools, Sheet 1 click/billing functions. |
| Advertiser intake and billing config | Sheet 2, Billing Config, Invoice Log, Monthly Billing tabs, Stripe customer sync. |
| Provider display approvals | Sheet 3 Business Approvals and Sheet 6 Approval Map. |
| Provider/facility intake | Sheet 4 and affiliate/redirect setup. |
| Media Center campaigns | Sheet 5 Directory Campaigns and directory routes. |
| Patient screen campaigns | Sheet 6 Video Campaigns, placements, QR logs, ScreenCloud, playback, billing, revenue share. |
| Conference campaigns | Sheet 7 events, purchases, submissions, showcase, screens, ScreenCloud, Stripe. |

## Phase Plan

| Phase | Migration focus | Acceptance criteria | Rollback |
| --- | --- | --- | --- |
| 0 | Audit and blueprint | Docs completed, risks identified, evidence gaps listed. | No production change. |
| 1 | Foundation schemas/services | Firestore schemas, service contracts, job logs, feature flags, Codex tracking collections tested. | Remove non-production artifacts or disable flags. |
| 2 | Admin Dashboard MVP | Admin can view jobs, review tasks, flags, Codex queue. | Disable dashboard routes/flags. |
| 3 | Dataset ingestion/MI | Dataset dry-run, staging load, approval-gated production load, recommendation refresh. | Use previous BigQuery tables/snapshots; disable new recommendations flag. |
| 4 | Daily automation | Intake, safety, activation, expiration, summaries, alerts run in dry-run/shadow mode before production. | Disable automation flags and fall back to legacy process. |
| 5 | Display abstraction | ScreenCloudAdapter dry-run matches expected placement changes. | Disable display sync flag; preserve ScreenCloud existing state. |
| 6 | Backup/restore | Daily backup metadata and restore test documented. | Keep existing backup process until restore acceptance. |
| 7 | Advertiser Dashboard | Advertisers can submit campaigns and view recommendations/reporting in staged rollout. | Disable advertiser dashboard flags; keep Squarespace intake. |
| 8 | Media Center | Providers manage display preferences; signup does not create approvals. | Disable Media Center write flags; preserve existing provider records. |
| 9 | Billing/revenue share | Billing previews reconcile and Stripe execution is approval-gated. | Disable billing execution; keep previews only. |
| 10 | Legacy retirement | Legacy Sheet 1 and Apps Script dependencies removed only after approval. | Restore from backups and source snapshots if needed. |

## Migration Workstreams

| Workstream | Key tasks |
| --- | --- |
| Source inventory | Use completed aggregate inventory and reviewed repo ZIP for market intelligence scaffold; still verify deployed Apps Script source order, missing service sources, branch state, and tests before implementation. |
| Data migration | Map Sheets to Firestore, preserve legacy Sheet 1 history, validate counts and samples. |
| Service migration | Move high-risk logic to Cloud Run services with dry-run and job logs. |
| Dashboard migration | Replace admin sheet operations with Admin Dashboard queues and approvals. |
| Redirect migration | Stage Cloud Run redirects, compare event logging, cut over QR routing carefully. |
| Display migration | Build placements from internal records and adapter dry-runs. |
| Billing migration | Separate calculations, previews, approvals, and Stripe execution. |
| Legacy cleanup | Delete only after zero dependency evidence and explicit approval. |

## Phase 1 Foundation Deliverables

| Deliverable | Status |
| --- | --- |
| Shared statuses and enums | Added in `packages/shared/src/status/index.js`. |
| Entity schemas | Added in `packages/shared/src/schemas/entities.js`. |
| Dry-run guard | Added in `packages/shared/src/contracts/dry-run-guard.js`. |
| Display provider contracts/stubs | Added in `packages/shared/src/contracts/display-provider.js`. |
| Policy validators | Added in `packages/shared/src/contracts/policies.js`. |
| Local tests | Added in `packages/shared/test/contracts.test.js`. |
| BigQuery schema plan | Added in `docs/bigquery-schema.md`. |
| Local service skeletons | Added in `packages/services` for Admin API, intake, safety, redirect, display, billing, backup, dataset ingestion, intelligence, daily orchestration, and Codex review output. |

These deliverables are not a cutover and do not change production state.

## Production Cutover Checklist

| Item | Required |
| --- | --- |
| Backup completed | Yes |
| Restore path documented | Yes |
| Feature flags configured | Yes |
| Dry-run results reviewed | Yes |
| Acceptance tests passed | Yes |
| Monitoring and alerts active | Yes |
| Rollback owner assigned | Yes |
| Drip approval recorded | Yes |

## Blocked Until Source Parity Is Verified

Aggregate-based Apps Script verification and ZIP-based market intelligence verification are complete enough for local contracts and planning. Production-connected Phase 1 implementation should not start until deployed Apps Script source parity, runtime load order, live Cloud Run service parity, live BigQuery table map, and approval owners are confirmed.
