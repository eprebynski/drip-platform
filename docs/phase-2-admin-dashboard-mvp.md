# Phase 2 Admin Dashboard MVP

## Scope

Phase 2 adds a local-only Drip Admin Dashboard MVP under `packages/dashboard`. It is a rebuild control center for mock operations visibility, human review, Codex review, dry-run job output, feature flags, dataset drafts, market intelligence placeholders, display placement previews, billing previews, backup drafts, and legacy migration blockers.

## Non-Production Boundary

The dashboard does not deploy, does not require live credentials, and does not call production systems. It does not modify Apps Script, Apps Script triggers, live Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, display providers, campaign state, legacy code, or production resources.

| Boundary | Phase 2 status |
| --- | --- |
| App runtime | Local Node HTTP server only. |
| Data source | Phase 1.5 mock repository and local service skeletons. |
| Status changes | In-memory dashboard store only. |
| Feature flags | Production-impacting flags remain OFF and locked from dashboard enablement. |
| Dry-run guards | Preserved and visible across jobs, BigQuery plans, display, billing, and backup modules. |
| Credentials | None required. |
| Deploys | None. |

## Modules

| Module | MVP visibility |
| --- | --- |
| System Health | Local mode, unresolved blockers, mock service health, daily dry-run status, failed jobs, and review queue counts. |
| Jobs & Errors | Mock jobs, dryRun, status, warnings, rollback notes, approvalRequired, and mock error logs. |
| Human Review Queue | Mock review tasks with reason, riskLevel, ownerRole, suggestedNextAction, and local-only status changes. |
| Codex Review Queue / Rebuild Control Center | Review items with phase, title, summary, files changed, risk level, production impact, tests, blockers, `copyForChatGPT`, `promptBackToCodex`, and local-only status changes. |
| Feature Flags | Production-impacting flags shown OFF and locked. |
| Dataset Uploads | Local dataset metadata drafts, supported dataset types, and dry-run BigQuery load plans. |
| Market Intelligence | Mock recommendation output, source freshness warnings, Google Search/search-interest placeholder, and payor dataset placeholder. |
| Display Placements | Mock placements, display-provider abstraction, and ScreenCloudAdapter stub/dry-run state. |
| Billing Review | Mock billing and invoice previews with approvalRequired and no Stripe access. |
| Backup & Restore | Mock backup job status, backup draft, and restore-test request draft. |
| Legacy Migration | Cutover blocked by deployed Apps Script parity, Apps Script runtime load order, live route usage, Secret Manager migration, approval owners, and BigQuery table-map blockers. |

## Local Run

```bash
cd packages/dashboard
node ./src/server.js
```

The local dashboard serves on `http://127.0.0.1:5174` unless `PORT` is set.

## Tests

```bash
cd packages/dashboard
node --test
```

The Phase 2 test suite covers dashboard data loading, Codex Review Queue item shape, required `copyForChatGPT`, editable local `promptBackToCodex`, feature flags OFF, dry-run visibility, unresolved blocker visibility, no credential requirement, and no production service calls.

## Codex Review Queue Item

```text
Codex Review Queue Item
Phase: Phase 2
Title: Drip Admin Dashboard MVP with Codex Review Queue
Summary: Local-only dashboard shell backed by Phase 1 shared contracts, Phase 1.5 mock services, in-memory review status updates, and no live credentials.
Files changed: packages/dashboard, docs/admin-dashboard-spec.md, docs/codex-task-plan.md, docs/acceptance-tests.md, docs/risk-register.md, docs/phase-2-admin-dashboard-mvp.md
Risk level: MEDIUM
Production impact: None. No deploys, no live credentials, no Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, display-provider, or campaign-state writes.
Tests or validation: Dashboard tests, shared/service tests, local app smoke check, and secret-pattern scan.
Approvals needed: Drip review and ChatGPT review before Phase 3. Production approvals remain blocked by unresolved legacy/parity items.
Open questions: Who owns approval decisions, and which deployed Apps Script/routes remain live?
Recommended next Codex prompt: After Phase 2 review, implement Phase 3 dataset ingestion and market intelligence staging using local mocks first; keep production writes blocked.
```
