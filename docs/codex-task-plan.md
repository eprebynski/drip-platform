# Codex Task Plan

## Purpose

Codex should produce reviewable, dashboard-readable rebuild work packets. No production-impacting action should execute directly from a Codex output unless required approvals have passed.

## Source-Verified Phase 0 Completion Criteria

| Required item | Status |
| --- | --- |
| Aggregate-based source inventory | Complete in `docs/source-verified-inventory.md`. |
| Repo ZIP validation | Complete for the uploaded `drip-platform-main.zip` market intelligence scaffold; does not include Apps Script source or prove deployed parity. |
| Secret values protected | Values are not repeated; locations and names only. |
| Top risks and blockers | Updated in risk/migration/audit docs. |
| Phase 1 readiness | Marked `NOT_READY` until deployed Apps Script source parity/runtime order, live Cloud Run/BigQuery state, and approval owners are confirmed. |
| Production action status | None executed. |

## Phase 1 Contract Package Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-1-foundation-contracts`; recorded in docs because this workspace is not a git checkout. |
| Shared contracts | Added under `packages/shared`. |
| Codex Review Queue schemas | Added for `codexTasks`, `codexReviewItems`, `codexArtifacts`, `codexPromptHistory`, and `rebuildApprovals`. |
| `copyForChatGPT` | Required by `CodexReviewItemSchema`. |
| Local tests | Added under `packages/shared/test`. |

## Phase 1.5 Local Service Skeleton Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-1-5-local-service-skeletons`; recorded in docs because this workspace is not a git checkout. |
| Local service skeletons | Added under `packages/services`. |
| Mock/local repositories | Added in `packages/services/src/mock-repository.js`. |
| Daily orchestrator skeleton | Added in `packages/services/src/daily-orchestrator.js`; no scheduler. |
| Codex Review Queue generator | Added in `packages/services/src/codex-review.js`. |
| Local tests | Added under `packages/services/test`. |

## Phase 2 Admin Dashboard MVP Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-2-admin-dashboard-mvp`. |
| Local dashboard app | Added under `packages/dashboard`. |
| Dashboard modules | System Health, Jobs & Errors, Human Review Queue, Codex Review Queue, Feature Flags, Dataset Uploads, Market Intelligence, Display Placements, Billing Review, Backup & Restore, and Legacy Migration. |
| Data sources | Phase 1.5 mock repositories and local service skeletons only. |
| Review status changes | In-memory local dashboard store only. |
| `copyForChatGPT` | Required and displayed for Codex Review Queue items. |
| `promptBackToCodex` | Editable and stored locally. |
| Production impact | None. No deploys, live credentials, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, display-provider, campaign-state, or production-resource writes. |
| Local tests | Added under `packages/dashboard/test`. |

## Phase 2.1 Website Platform Simplification Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-2-1-website-platform-simplification`. |
| Squarespace recommendation | Retire Squarespace as a required website/application platform after safe migration. |
| Temporary Squarespace role | Keep temporarily for current public pages/forms and, if applicable, domain registration/DNS until replacements pass staging and cutover approval. |
| Hosting/domain docs | Added `docs/website-platform-simplification-plan.md` and `docs/hosting-domain-architecture.md`. |
| Recommended hosting | Firebase Hosting or equivalent GCP-first static hosting for public/static frontends, with Cloud Run APIs. |
| Production impact | None. No deploys, DNS, Squarespace, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 status | Still blocked until ChatGPT/Drip review. |

## Task Packet Standard

Every Codex task should include:

| Field | Purpose |
| --- | --- |
| codexTaskId | Stable ID for task tracking. |
| phase | Rebuild phase. |
| title | Task title. |
| prompt | Original user prompt. |
| filesChanged | Files created or modified. |
| summary | What changed. |
| riskLevel | LOW, MEDIUM, HIGH, CRITICAL. |
| testsRun | Verification performed. |
| productionImpact | None, proposed, or executed. Executed should be disallowed without approval. |
| approvalsNeeded | Required human approvals. |
| nextRecommendedTask | Follow-on work. |
| copyForChatGPT | Paste-ready review summary. |
| promptBackToCodex | Next prompt field. |

## Phase Task Queue

| Phase | Codex tasks |
| --- | --- |
| 0 | Complete docs, identify evidence gaps, create review packet. |
| 1 | Draft Firestore schemas, service contracts, feature flag defaults, jobRun schema, test plan. |
| 2 | Build Admin Dashboard MVP and Codex Review Queue. |
| 2.1 | Document website platform simplification and Squarespace retirement plan. |
| 3 | Implement dataset upload, validation, staging load, recommendation refresh skeleton. |
| 4 | Implement daily automation jobs in dry-run/shadow mode. |
| 5 | Implement DisplayProviderService and ScreenCloudAdapter dry-run. |
| 6 | Implement backup metadata, backup jobs, restore-test documentation. |
| 7 | Build Advertiser Dashboard campaign submission and recommendation view. |
| 8 | Build Media Center provider preferences and display approvals. |
| 9 | Build BillingService preview, approval, Stripe execution gates. |
| 10 | Produce source-verified legacy retirement candidates, then wait for approval. |

## Codex Review Queue Status Flow

NEW -> NEEDS_CHATGPT_REVIEW -> NEEDS_DRIP_APPROVAL -> APPROVED -> RESOLVED.

Alternative paths: CHANGES_REQUESTED -> SENT_BACK_TO_CODEX -> NEW; any resolved item may become ARCHIVED.

## Copy-Ready Review Packet Template

```text
Codex Review Queue Item
Phase:
Title:
Summary:
Files changed:
Risk level:
Production impact:
Tests or validation:
Approvals needed:
Open questions:
Recommended next Codex prompt:
```

## Phase 2 Codex Review Queue Item

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

## Phase 2.1 Codex Review Queue Item

```text
Codex Review Queue Item
Phase: Phase 2.1
Title: Website Platform Simplification and Squarespace Retirement Plan
Summary: Documentation-only plan to retire Squarespace as a required website/application platform after safe migration, consolidate public website/app/API/redirect/showcase hosting into the Drip GitHub/GCP stack, and keep Squarespace temporary for public pages/forms/domain management until replacement pages, staging, DNS guardrails, and rollback are approved.
Files changed: docs/website-platform-simplification-plan.md, docs/hosting-domain-architecture.md, docs/rebuild-blueprint.md, docs/service-architecture.md, docs/admin-dashboard-spec.md, docs/risk-register.md, docs/acceptance-tests.md, docs/codex-task-plan.md
Risk level: MEDIUM
Production impact: None. No deploys, DNS changes, Squarespace changes, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes.
Tests or validation: Documentation review, git diff check, secret-pattern scan, and PR scope verification.
Approvals needed: Drip/ChatGPT review of Squarespace retirement plan before any DNS, hosting, Squarespace, or production-resource work. Phase 3 dataset ingestion remains blocked.
Open questions: Who controls registrar/DNS today, which Squarespace forms feed live Sheets or Apps Script flows, and which current pages require SEO-preserving redirects?
Recommended next Codex prompt: Review Phase 2.1 docs, then inventory current Squarespace pages/forms/scripts/DNS records in read-only mode; do not change DNS, Squarespace, deploys, credentials, or production systems, and keep Phase 3 blocked until Drip/ChatGPT approval.
```

## Approval Policy

Codex may create documentation, tests, schemas, and non-production skeletons. Codex must not deploy, modify triggers, delete code, write to live services, run billing, sync live displays, or cut over production without explicit Drip approval captured in rebuildApprovals.
