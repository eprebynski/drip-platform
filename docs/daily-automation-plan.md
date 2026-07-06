# Daily Automation Plan

## Objective

Run Drip daily with minimal human input. Automation should process routine work and create human review tasks only for exceptions or approval-gated actions.

## Source-Verified Current Automations

The aggregate trigger list shows time-based jobs for `checkConferenceFundingDeadlines`, `runWeeklyCampaignAnalyticsScheduled`, `finalizeSquarespaceRows`, `expireConferencePurchaseHolds`, and `finalizeUnfinalizedProviderConferenceCampaignRows`; spreadsheet edit triggers for Sheets 1, 2, 3, 4, and Sheet 7 are visible.

Additional trigger creator functions exist for dashboard refresh, retry invoice emails, held row cleanup, weekly analytics, welcome emails, Stripe customer sync, Sheet 2 billing sync, and digital signage provider checks.

High-risk rule: no Apps Script trigger creator/reset function should be run during Phase 0 or Phase 1 without explicit approval, because `setupTriggers` deletes all project triggers before recreating a subset.

Repo ZIP note: the market intelligence scaffold includes Dataform models and a dry-run-default Medicaid ingest helper, but it does not verify any live Dataform schedule. Do not add or run production refresh automation until table location, IAM, source freshness, and approval owners are confirmed.

Phase 1 adds a local `jobs` schema and dry-run guard. Future automation should use the `jobId`, `jobType`, `dryRun`, `status`, timestamps, record counts, warnings, approval requirement, and rollback notes shape before any production scheduler is introduced.

Phase 1.5 adds local job definitions in `packages/services/src/daily-orchestrator.js`. These produce dry-run job logs only and do not schedule or execute real jobs.

## Daily Job Schedule

| Job | Frequency | Safe to automate | Human review trigger |
| --- | --- | --- | --- |
| Process new intake submissions | Hourly/daily | Yes | Schema mismatch, duplicate ambiguity, missing required fields. |
| Run campaign safety checks | Hourly/daily | Yes | Medical claims risk, PHI risk, malware/phishing warning, unsupported video, advertiser eligibility issue. |
| Activate approved scheduled campaigns | Daily/hourly | Yes after Phase 4 acceptance | Safety/date/billing/placement/provider approval mismatch. |
| Expire ended campaigns | Daily/hourly | Yes | Expiration failure or external sync failure. |
| Sync eligible display placements | Daily/hourly | Dry-run safe; production gated initially | Provider API error, content mismatch, write required. |
| Ingest playback logs | Daily | Yes | Missing provider logs, schema failure. |
| Update campaign summaries | Daily | Yes | Metric reconciliation failure. |
| Refresh market intelligence | Daily/weekly depending on source | Yes | Stale data, failed source, quality failure. |
| Refresh search-interest signals | Daily/weekly | Yes | API/source failure, abnormal trend. |
| Generate advertiser recommendations | Daily | Yes | Missing features, stale inputs. |
| Check budget pacing | Daily | Yes | Overspend risk, underdelivery, billing mismatch. |
| Check billing readiness | Daily | Yes for checks; execution gated | Billing approval needed. |
| Run backups | Daily | Yes | Backup failure or stale restore test. |
| Detect failed jobs | Continuous/daily | Yes | Creates humanReviewTasks. |

## Human Input Only When Needed

| Situation | Required role |
| --- | --- |
| Safety review exception | Drip Campaign Reviewer |
| Dataset schema mapping | Drip Super Admin or Analyst |
| Production dataset load approval | Drip Super Admin |
| Failed external sync | Drip Support / Reviewer or Super Admin |
| Billing approval | Drip Billing Admin |
| Production feature flag activation | Drip Super Admin |
| Experiment approval | Drip Super Admin or Campaign Reviewer |
| Restore operation | Drip Super Admin |
| High-risk change request | Drip Super Admin |
| Legacy code deletion | Drip Super Admin |
| Production cutover | Drip Super Admin |

## JobRun Standard

Every automation writes a jobRuns record with jobType, dryRun, status, startedAt, completedAt, counts, warnings, errors, createdReviewTasks, and auditLogRefs.

## Acceptance Criteria

| Area | Criteria |
| --- | --- |
| Idempotency | Re-running a job does not duplicate campaigns, placements, billing items, or recommendations. |
| Visibility | Each job appears in Admin Dashboard Jobs & Errors. |
| Exceptions | Failures create humanReviewTasks with owner role and suggested action. |
| Approval gates | Approval-gated jobs do not execute production writes without approval. |
| Alerts | Failed critical jobs alert admins and appear on System Health. |
