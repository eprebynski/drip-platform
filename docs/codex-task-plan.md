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

## Approval Policy

Codex may create documentation, tests, schemas, and non-production skeletons. Codex must not deploy, modify triggers, delete code, write to live services, run billing, sync live displays, or cut over production without explicit Drip approval captured in rebuildApprovals.
