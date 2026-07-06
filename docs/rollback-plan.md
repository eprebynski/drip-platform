# Rollback Plan

## Rollback Principles

| Principle | Requirement |
| --- | --- |
| Feature flags first | Production-impacting changes must be disableable quickly. |
| Backup before cutover | Pre-deployment backup required before production rollout. |
| Dry-run evidence | External writes require dry-run preview before execution. |
| Audit trail | Rollback action writes audit log and change request status. |
| Restore is manual | Production restore never runs automatically. |

## Source-Verified Rollback Concerns

| Current system area | Rollback concern |
| --- | --- |
| Apps Script triggers | `setupTriggers` can delete all project triggers; rollback must never rely on running it casually. |
| Apps Script web app routes | Many public modes share one deployment URL; route-level rollback is difficult until Cloud Run splits routes. |
| Stripe webhook forwarding | Current Cloud Run webhook treats Apps Script redirect behavior specially; migration rollback must preserve Stripe retry semantics. |
| ScreenCloud sync/rebuild | Channel/playlist/content writes need pre-sync snapshots before any production migration. |
| Sheet-based billing | Sheet 2/6/7 billing state must be snapshotted before BillingService cutover. |
| Segment API | ZIP source includes public deployment posture and a persistent segment-create route; rollback must account for any BigQuery rows created during tests or production use. |
| Market intelligence Dataform | ZIP source defines `drip_marts.targetable_providers`; rollback needs table snapshots/exports before changing models or schedules. |

## Rollback By Area

| Area | Rollback action |
| --- | --- |
| Firestore operational workflows | Disable relevant feature flag and fall back to legacy read/write path if still preserved. |
| RedirectService | Revert QR routing to previous redirect page/service; preserve event logs. |
| IntakeProcessor | Disable Firestore intake writes; continue raw Sheets intake. |
| SafetyService | Disable automated decisions; route submissions to human review. |
| ActivationService | Disable activation job; use manual/admin process. |
| DisplayProviderService | Disable display sync; restore previous ScreenCloud snapshot through approval-gated process if needed. |
| Dataset ingestion | Stop production load; revert BigQuery table from snapshot/export. |
| Market recommendations | Disable recommendation publishing flag; show stale/unavailable warning. |
| Segment API | Disable write route/feature flag or restrict invoker IAM; preserve created segment rows for audit before cleanup. |
| BillingService | Stop Stripe execution; keep preview-only mode; reconcile manually. |
| Admin Dashboard | Disable write routes; retain read-only status if possible. |
| Advertiser Dashboard | Disable campaign submission flag; fall back to Squarespace forms. |
| Media Center | Disable preference writes; freeze existing display approvals. |

## Required Rollback Metadata

| Field | Purpose |
| --- | --- |
| rollbackId | Unique rollback event. |
| changeRequestId | Link to original change. |
| reason | Why rollback is needed. |
| impactedServices | Services/features affected. |
| backupRefs | Backup artifacts used. |
| actionsTaken | Flags changed, service reverted, data restored. |
| verification | Checks proving stable state. |
| approvedBy | Required for production rollback. |

Phase 1 adds a local `rollbackNotes` contract and includes `rollbackNotes` fields on job contracts. This does not perform rollback actions; it standardizes the metadata future rollback work must capture.

Phase 1.5 local services also include rollback notes in daily job outputs. Because no production writes occur, rollback remains documentation-only for this phase.

## Restore Rules

Restores require explicit human approval, backup artifact selection, impact assessment, dry-run where feasible, communications plan, verification checklist, and audit logs.
