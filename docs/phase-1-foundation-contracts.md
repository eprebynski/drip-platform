# Phase 1 Foundation Contracts

## Scope

Phase 1 creates non-production contracts only. It does not deploy, modify Apps Script, change triggers, write live Sheets, write Firestore, write BigQuery, call Stripe, call ScreenCloud, create production resources, activate campaigns, or delete legacy code.

Branch requested for future source-control work: `rebuild/phase-1-foundation-contracts`. This workspace is not a git checkout, so the branch name is recorded here but no branch was created locally.

## Unresolved Blockers Preserved

| Blocker | Phase 1 status |
| --- | --- |
| Deployed Apps Script parity unresolved | Preserved. |
| Apps Script runtime load order unresolved | Preserved. |
| Live Cloud Run/IAM state unresolved | Preserved. |
| BigQuery `targetable_providers` location unresolved | Preserved. |
| Billing approval owners unresolved | Preserved. |
| Display/write approval owners unresolved | Preserved. |
| Dataset production-load approval owners unresolved | Preserved. |
| Secret Manager migration not confirmed | Preserved. |
| Live traffic/route usage not measured | Preserved. |

## Package Added

| Path | Purpose |
| --- | --- |
| `packages/shared/package.json` | Local dependency-free shared package metadata and test script. |
| `packages/shared/src/status/index.js` | Shared status enums, feature flag keys, external write systems, and Phase 1 blocker constants. |
| `packages/shared/src/schemas/validator.js` | Lightweight local schema validator used by tests and future contracts. |
| `packages/shared/src/schemas/entities.js` | Entity schema descriptors for providers, advertisers, campaigns, placements, display providers, events, safety, experiments, billing, jobs, errors, flags, changes, backups, datasets, intelligence jobs, audit logs, users, organizations, Codex review queue, and approvals. |
| `packages/shared/src/contracts/dry-run-guard.js` | Shared dry-run guard for future external writes. |
| `packages/shared/src/contracts/policies.js` | Campaign lifecycle, provider display preference, and experiment safety validation helpers. |
| `packages/shared/src/contracts/display-provider.js` | DisplayProviderService method contract and non-production adapter stubs. |
| `packages/shared/src/types/index.d.ts` | TypeScript declaration surface for key contracts. |
| `packages/shared/test/contracts.test.js` | Credential-free local tests. |

## Core Safety Rules

| Rule | Contract location |
| --- | --- |
| Provider signup does not create display approval. | `validateProviderDisplayPreferenceRule`. |
| Display approval requires active Media Center checkbox source. | `validateProviderDisplayPreferenceRule`. |
| ACTIVE campaigns require approved safety and billing readiness. | `validateCampaignLifecycle`. |
| Experiment variants cannot receive traffic unless safety is APPROVED. | `validateExperimentSafetyRule`. |
| External writes default to blocked dry-run when `dryRun` is omitted. | `evaluateExternalWrite`. |
| External writes require `dryRun=false` and an approval reference. | `evaluateExternalWrite` and `assertExternalWriteAllowed`. |
| Display-provider adapters are stubs and cannot perform live writes. | `createNonProductionDisplayAdapter`. |

## Local Tests

Run with the bundled/local Node runtime:

```bash
node --test packages/shared/test/contracts.test.js
```

Coverage includes schema validation, campaign date validation, lifecycle guards, provider display approval source rule, experiment safety rule, dry-run guard behavior, feature flag validation, job log shape, Codex Review Queue shape, and dataset ingestion metadata validation.

## Phase 1 Readiness

The package is ready for local review as a contract baseline. It is not production-ready and does not resolve source parity, live IAM, live BigQuery, approval ownership, Secret Manager, or traffic measurement blockers.
