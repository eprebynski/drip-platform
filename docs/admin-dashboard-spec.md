# Drip Admin Dashboard Specification

## Purpose

The Drip Admin Dashboard is the rebuild control center and future operations console. It should answer what needs attention today, what failed, what is blocked, what needs approval, and what Codex generated that needs review.

## Source-Verified MVP Priorities

| Priority | Required visibility/action |
| --- | --- |
| Apps Script trigger inventory | Show current trigger owners, handler names, error rates, and replacement status. |
| Route inventory | Show public `doGet`/`doPost` modes and whether each is read-only, logging, billing, display, or mutation. |
| External writes | Show Stripe and ScreenCloud write candidates with dry-run/approval status. |
| Provider display approvals | Show Sheet 3 / Sheet 6 approval migration status and conflicts. |
| Billing review | Show Sheet 2/6/7 billing sources, Stripe invoice creation readiness, and webhook status. |
| Secret/config migration | Show outstanding Script Properties/env/code constants that must move to Secret Manager. |
| Market intelligence source parity | Show repo ZIP evidence, live BigQuery table map, Dataform run status, and Segment API IAM/deploy status. |
| Public API exposure | Show any public unauthenticated route that can write data, including `POST /segments/create` if deployed as shown. |

## Phase 1 Data Contracts By Module

| Module | Contract records |
| --- | --- |
| System Health | `jobs`, `errors`, `featureFlags`, `backups`, `humanReviewTasks`. |
| Jobs & Errors | `jobs`, `errors`, `auditLogs`, `rollbackNotes`. |
| Human Review Queue | `humanReviewTasks`, `rebuildApprovals`, `changeRequests`. |
| Campaign Safety Review | `campaigns`, `safetyReviews`, `campaignCreatives`, `humanReviewTasks`. |
| Dataset Uploads | `datasets`, `datasetIngestionJobs`, `auditLogs`. |
| Market Intelligence | `marketIntelligenceOutputs`, `intelligenceRefreshJobs`, `datasets`. |
| A/B Testing | `experiments`, `experimentVariants`, `experimentAssignments`, `experimentEvents`. |
| Feature Flags | `featureFlags`, `changeRequests`, `auditLogs`. |
| Display Placements | `placements`, `displayProviders`, `displayProviderAccounts`, `jobs`. |
| Billing Review | `billingAccounts`, `invoices`, `rebuildApprovals`, `auditLogs`. |
| Backup & Restore | `backups`, `rollbackNotes`, `rebuildApprovals`. |
| Legacy Migration | `changeRequests`, `auditLogs`, `codexTasks`, `codexReviewItems`. |
| Codex Review Queue / Rebuild Control Center | `codexTasks`, `codexReviewItems`, `codexArtifacts`, `codexPromptHistory`, `rebuildApprovals`. |

## Phase 1.5 Local Handler Visibility

| Future module | Local skeleton source | Dashboard visibility note |
| --- | --- | --- |
| System Health | `admin-api` | Show local-only mode, blockers, job count, error count, review count, and flags-off status. |
| Jobs & Errors | `daily-orchestrator` | Show dryRun, approvalRequired, rollbackNotes, warnings, and errorLogs. |
| Human Review Queue | `admin-api` | Show mock review tasks and owner roles. |
| Codex Review Queue | `codex-review` | Show generated Phase 1.5 review item and `copyForChatGPT`. |
| Feature Flags | `admin-api` | Confirm production-impacting flags remain OFF. |
| Dataset Uploads | `dataset-ingestion-service` | Show metadata validation, dry-run BigQuery load plan, and warnings. |
| Market Intelligence | `intelligence-service` | Show recommendation draft and source freshness warnings. |
| Display Placements | `display-service` | Show dry-run-only adapter output and blocked write attempts. |
| Billing Review | `billing-service` | Show preview totals and readiness errors without Stripe. |
| Backup & Restore | `backup-service` | Show backup target validation and restore-test request drafts. |

## Modules

| Module | Purpose | Key records |
| --- | --- | --- |
| System Health | Summary of services, jobs, alerts, backups, and flags. | jobRuns, backups, featureFlags, humanReviewTasks |
| Jobs & Errors | Inspect scheduled jobs, retries, failures, and dry-run results. | jobRuns, auditLogs |
| Human Review Queue | Unified exception and approval queue. | humanReviewTasks, rebuildApprovals |
| Campaign Safety Review | Review blocked campaigns, safety checks, and manual exceptions. | campaigns, campaignSafetyReviews |
| Dataset Uploads | Upload, validate, map, approve, and monitor datasets. | datasetUploads, jobRuns |
| Market Intelligence | See refresh health, data freshness, recommendation outputs. | marketRecommendations, BigQuery summaries |
| A/B Testing | Review, approve, pause, and inspect experiments. | experiments, experimentVariants |
| Feature Flags | Manage staged rollout flags and approval status. | featureFlags, changeRequests |
| Display Placements | Preview, dry-run, sync, and inspect provider display placements. | placements, jobRuns |
| Billing Review | Review billing previews, approvals, revenue share, Stripe references. | billingItems, revenueShareItems |
| Backup & Restore | Monitor backups, backup artifacts, restore tests, restore approvals. | backups, rebuildApprovals |
| Legacy Migration | Track legacy dependencies and retirement readiness. | migrationTasks, auditLogs |
| Change Requests | Review proposed production changes and rollback plans. | changeRequests |
| Codex Review Queue | Human/ChatGPT review handoff for Codex-generated work. | codexTasks, codexReviewItems, codexArtifacts, codexPromptHistory |

## Codex Review Queue

Every Codex task should produce a dashboard-readable review packet.

| Field | Purpose |
| --- | --- |
| reviewItemId | Unique review item ID. |
| codexTaskId | Links to the originating task. |
| rebuildPhase | Phase number/name. |
| title | Short review title. |
| summary | Human-readable summary. |
| fullOutput | Complete Codex output or linked artifact. |
| filesChanged | Documentation/code files changed. |
| relatedPR | Pull request link if applicable. |
| riskLevel | LOW, MEDIUM, HIGH, CRITICAL. |
| requiresHumanApproval | Blocks production-impacting action. |
| suggestedReviewer | Drip role or person/team. |
| suggestedNextAction | Approve, request changes, send to ChatGPT, send back to Codex. |
| copyForChatGPT | Copy-ready review packet. |
| promptBackToCodex | Next prompt generated by ChatGPT or Drip. |
| status | NEW, NEEDS_CHATGPT_REVIEW, NEEDS_DRIP_APPROVAL, APPROVED, CHANGES_REQUESTED, SENT_BACK_TO_CODEX, RESOLVED, ARCHIVED. |

## Minimum MVP For Phase 2

| Capability | Acceptance criteria |
| --- | --- |
| Dashboard shell | Authenticated Drip admin can access System Health, Human Review Queue, Jobs & Errors, Codex Review Queue. |
| Codex review item view | Admin can view summary, files changed, risks, copyForChatGPT, promptBackToCodex. |
| Approval status | Admin can mark review item approved, changes requested, or sent back to Codex. |
| Job log view | Admin can see last run, status, dry-run flag, errors, and related review tasks. |
| Feature flag list | Admin can view flag status and approval requirement. |
| Audit trail | Status changes write auditLogs. |

## RBAC

| Role | Access |
| --- | --- |
| Drip Super Admin | Full admin access and approval authority. |
| Drip Campaign Reviewer | Campaign safety, human review, limited campaign data. |
| Drip Billing Admin | Billing review, revenue share, Stripe references, billing approvals. |
| Drip Support / Reviewer | Human review queue and non-sensitive operational notes. |
| Read-only Analyst | Reports, job history, recommendations, no writes. |

## Production Approval Rules

No production-impacting action should execute directly from a Codex output. Production actions require an approved change request, required role approval, recent backup where applicable, dry-run result, audit log, and rollback notes.
