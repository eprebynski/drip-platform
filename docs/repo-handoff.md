# Repository Handoff

## Current Workspace Status

This handoff was first prepared in a generated Codex workspace and then imported into the real `eprebynski/drip-platform` repository on the target branch.

Target repo: `eprebynski/drip-platform`

Target branch: `rebuild/phase-0-1-1-5-foundation`

Initial generated workspace git status:

| Check | Result |
| --- | --- |
| `git status --short` | Failed: not a git repository. |
| `git remote -v` | Failed: not a git repository. |
| Branch created in generated workspace | No. |
| Commit created in generated workspace | No. |

Real repo import status:

| Check | Result |
| --- | --- |
| Repository access | Confirmed through GitHub connector with push/admin permissions. |
| Default branch | `main`. |
| Target branch | `rebuild/phase-0-1-1-5-foundation`. |
| Production resources | None created. |

This document remains the durable handoff record for the imported branch.

## Handoff Artifacts

The user-facing handoff artifacts were written under `outputs/` in the original Codex workspace:

| Artifact | Purpose |
| --- | --- |
| `outputs/drip-platform-phase-0-1-1-5-foundation-handoff.zip` | Repo-ready `docs/` and `packages/` files. Preferred import path. |
| `outputs/drip-platform-phase-0-1-1-5-file-manifest.txt` | Plain text manifest of every repo file in the handoff. |
| `outputs/drip-platform-phase-0-1-1-5-foundation.patch` | Review/import patch generated from an empty baseline. Useful for inspection; copying the zip contents is safer if the real repo already has overlapping docs. |

## Production Safety Status

No production systems were changed. No deploys, Apps Script edits, trigger changes, live Google Sheets writes, Firestore writes, BigQuery writes, Stripe actions, ScreenCloud/display-provider writes, campaign lifecycle changes, legacy code deletions, production resources, or live credential use occurred.

## Generated File Manifest

The generated handoff contains 52 repo files: 22 docs files and 30 package/test files.

```text
docs/acceptance-tests.md
docs/admin-dashboard-spec.md
docs/advertiser-dashboard-spec.md
docs/automation-plan.md
docs/backend-audit.md
docs/bigquery-schema.md
docs/codex-task-plan.md
docs/daily-automation-plan.md
docs/data-model.md
docs/display-provider-abstraction.md
docs/legacy-apps-script-retirement-plan.md
docs/market-intelligence-ingestion-plan.md
docs/media-center-spec.md
docs/migration-plan.md
docs/phase-1-5-local-service-skeletons.md
docs/phase-1-foundation-contracts.md
docs/rebuild-blueprint.md
docs/repo-handoff.md
docs/risk-register.md
docs/rollback-plan.md
docs/service-architecture.md
docs/source-verified-inventory.md
packages/services/README.md
packages/services/package.json
packages/services/src/admin-api.js
packages/services/src/backup-service.js
packages/services/src/billing-service.js
packages/services/src/codex-review.js
packages/services/src/daily-orchestrator.js
packages/services/src/dataset-ingestion-service.js
packages/services/src/display-service.js
packages/services/src/index.js
packages/services/src/intake-service.js
packages/services/src/intelligence-service.js
packages/services/src/local-utils.js
packages/services/src/mock-repository.js
packages/services/src/redirect-service.js
packages/services/src/safety-service.js
packages/services/test/services.test.js
packages/shared/README.md
packages/shared/package.json
packages/shared/src/contracts/display-provider.js
packages/shared/src/contracts/dry-run-guard.js
packages/shared/src/contracts/index.js
packages/shared/src/contracts/policies.js
packages/shared/src/index.js
packages/shared/src/schemas/entities.js
packages/shared/src/schemas/index.js
packages/shared/src/schemas/validator.js
packages/shared/src/status/index.js
packages/shared/src/types/index.d.ts
packages/shared/test/contracts.test.js
```

## Validation Run

Validation was run locally with the bundled Node runtime and no live credentials.

| Validation | Result |
| --- | --- |
| Shared contract tests | Passed. |
| Local service skeleton tests | Passed. |
| Combined Node test count | 27 passed, 0 failed. |
| Secret-pattern scan | Clean: no matches for high-risk secret-looking patterns. |
| Production-impacting feature flags | Confirmed OFF by default. |
| Dry-run guard | Confirmed external writes are blocked by default when `dryRun` is omitted. |
| Git repo check | Not connected to a repo. |

Reproduce tests from the repo root after importing:

```bash
node --test packages/shared/test/contracts.test.js packages/services/test/services.test.js
```

If using the Codex bundled runtime in this workspace:

```bash
/Users/crashdavis/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node --test packages/shared/test/contracts.test.js packages/services/test/services.test.js
```

Reproduce the secret-pattern scan with the current organization-approved pattern set. Example shape:

```bash
rg -n "<secret-patterns>" docs packages
```

Reproduce feature flag and dry-run guard checks:

```bash
node -e "import('./packages/shared/src/index.js').then(m=>{const off=Object.values(m.DefaultFeatureFlags).every(v=>v===false); if(!off){process.exit(1)} console.log('feature-flags-off=true')})"
node -e "import('./packages/shared/src/index.js').then(m=>{const d=m.evaluateExternalWrite({operation:'check',targetSystem:m.ExternalWriteSystem.STRIPE}); if(d.allowed || d.dryRun!==true){process.exit(1)} console.log('dry-run-guard-default-block=true')})"
```

## How To Apply To The Real Repo

If this document is being reviewed before import, use these steps. If you are reading this in the imported branch, the files have already been applied and these steps are retained for reproducibility.

1. Clone or open the real repo:

```bash
git clone git@github.com:eprebynski/drip-platform.git
cd drip-platform
```

2. Create the target branch:

```bash
git checkout -b rebuild/phase-0-1-1-5-foundation
```

3. Copy the handoff package contents into the repo root so that `docs/` and `packages/` land at the repo root.

Preferred zip import:

```bash
unzip /path/to/drip-platform-phase-0-1-1-5-foundation-handoff.zip -d .
```

Patch review/import option:

```bash
patch -p0 < /path/to/drip-platform-phase-0-1-1-5-foundation.patch
```

The patch was generated as additions from an empty baseline. If the real repo already contains overlapping files under `docs/` or `packages/`, use the zip/copy method on a clean branch and review `git diff` carefully.

4. Run validation:

```bash
node --test packages/shared/test/contracts.test.js packages/services/test/services.test.js
rg -n "<secret-patterns>" docs packages
```

5. Review changed files:

```bash
git status --short
git diff --stat
```

6. Commit:

```bash
git add docs packages
git commit -m "Add Phase 0-1.5 rebuild foundation docs and local contracts"
```

7. Push and open a draft PR:

```bash
git push -u origin rebuild/phase-0-1-1-5-foundation
```

Draft PR title:

```text
Phase 0-1.5 rebuild foundation docs and local contracts
```

Draft PR summary:

```text
Adds non-production Phase 0 audit docs, Phase 1 shared contracts, and Phase 1.5 local-only service skeletons. Includes credential-free tests and preserves unresolved production blockers. No deploys, live service writes, Apps Script edits, trigger changes, or production resources are included.
```

## Unresolved Production Blockers

| Blocker | Status |
| --- | --- |
| Deployed Apps Script parity | Unresolved. |
| Apps Script runtime load order | Unresolved. |
| Live Cloud Run/IAM state | Unresolved. |
| BigQuery `targetable_providers` location | Unresolved. |
| Approval owners | Unresolved. |
| Secret Manager migration | Unresolved. |
| Live route usage | Unresolved. |

## Safe To Proceed To Phase 2?

Not until the import branch has passing validation in the real repo and a draft PR exists for review. After the PR is open, Phase 2 may proceed only as non-production/local or staging-safe work and only after Drip/ChatGPT review of this foundation package.

After repo persistence, Phase 2 should remain non-production and local/staging-only until the unresolved production blockers are resolved.

## Next Recommended Task

Apply this handoff package to `eprebynski/drip-platform` on branch `rebuild/phase-0-1-1-5-foundation`, run local validation in the real repo, commit, push, and open a draft PR. Do not continue Phase 2 feature work until that persistence step is complete.
