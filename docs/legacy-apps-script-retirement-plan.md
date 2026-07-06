# Legacy Apps Script Retirement Plan

## Objective

Drastically reduce Apps Script after safe migration while preserving historical data and avoiding hidden production breakage.

## Source-Verified Retirement Context

The aggregate confirms 1,161 parsed function declarations and a broad Apps Script global namespace. Retirement should focus on workflows rather than deleting helper functions one by one. Highest-risk retirement groups are Sheet 1 legacy patient campaigns, Redirect Pools, Apps Script billing, public `doGet`/`doPost` routes, ScreenCloud mutation helpers, and Sheet 7 conference billing/display logic.

The uploaded repo ZIP validates market intelligence source only. It does not contain the Apps Script source tree and cannot verify deployed Apps Script parity or runtime load order, so Apps Script retirement remains blocked until those are confirmed.

Phase 1 shared contracts do not retire or modify Apps Script. They only define target schemas, dry-run guards, and service boundaries that future replacement work can use after source parity and runtime load order are verified.

Phase 1.5 local service skeletons also do not retire or modify Apps Script. They prepare mock replacement boundaries only; no trigger, route, deployment, or legacy code change is included.

## Retirement Principles

| Principle | Requirement |
| --- | --- |
| No deletion before proof | Legacy code remains until dependencies are source-verified and traffic is zero. |
| Sheet 1 preserved | Old Sheet 1 remains historical/legacy data until migration is complete. |
| Apps Script shrinks into bridge role | Only raw intake, admin review bridge, migration helpers, or read-only legacy reporting may remain temporarily. |
| Human approval required | Trigger removal, code deletion, and production cutover require Drip approval. |

## Retirement Workplan

| Step | Action | Output |
| --- | --- | --- |
| 1 | Verify deployed Apps Script source tree and runtime file order. | Runtime-order and implementation validation input. |
| 2 | Inventory Apps Script files/functions/constants/triggers/web routes. | Inventory table with file/function/trigger/route references. |
| 3 | Identify duplicates and hard-coded config/secrets. | Cleanup and Secret Manager migration list. |
| 4 | Map Sheet IDs, tabs, headers, and Sheet 1 dependencies. | Dependency graph. |
| 5 | Classify functions. | Move to Cloud Run, keep temporarily, delete eventually. |
| 6 | Build Cloud Run replacements behind flags. | Tested service replacements. |
| 7 | Run shadow/dry-run comparisons. | Evidence that new services match or improve behavior. |
| 8 | Cut over one workflow at a time. | Approved change request and rollback plan. |
| 9 | Monitor zero usage. | Job logs, analytics, trigger logs, dashboard status. |
| 10 | Retire/delete with approval. | Approved deletion PR and backup reference. |

## Classification Template

| Function | Current role | Risk | Target | Retirement condition |
| --- | --- | --- | --- | --- |
| Sheet 1 legacy finalizers/redirects | Patient/community campaign intake and click tracking. | Critical | LEGACY_ARCHIVE / DELETE_AFTER_CUTOVER | Patient Campaign migration accepted and QR traffic moved. |
| Apps Script Stripe invoice helpers | Customer/invoice creation and webhook sync. | Critical | MOVE_TO_CLOUD_RUN | BillingService live and reconciled. |
| ScreenCloud mutation helpers | Create content, assign channels, rebuild playlists. | Critical | MOVE_TO_CLOUD_RUN | DisplayProviderService live with approval gates. |
| Sheet 7 conference purchase/display helpers | Conference marketplace, invoice holds, showcase, screen sync. | Critical | MOVE_TO_CLOUD_RUN | ConferenceService and BillingService accepted. |

## Likely Cloud Run Migration Targets

| Category | Reason |
| --- | --- |
| Intake normalization | Needs idempotency, validation, and logs. |
| Safety checks | Needs external calls and policy orchestration. |
| Redirect/event logging | Needs low latency and analytics pipeline. |
| Display sync | Needs adapter boundary and dry-run. |
| Billing | Needs approvals and Stripe isolation. |
| Dataset ingestion | Needs BigQuery load and quality checks. |
| Backups | Needs cross-service orchestration. |

## Deletion Approval Checklist

| Item | Required |
| --- | --- |
| Source function identified | Yes |
| Replacement live and accepted | Yes |
| Trigger disabled only after approval | Yes |
| Zero dependency evidence | Yes |
| Backup/source snapshot | Yes |
| Rollback plan | Yes |
| Drip approval | Yes |
