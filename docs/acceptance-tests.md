# Acceptance Tests

## Phase Acceptance Criteria

| Phase | Acceptance tests |
| --- | --- |
| 0 Audit/blueprint | All requested docs exist; source-verified inventory is added; uploaded repo ZIP is reviewed read-only; secret values are not exposed; deployed source parity gaps are marked; no production systems changed. |
| 1 Foundation | Shared schemas validate required fields; lifecycle enum tests pass; jobRun and auditLog contracts exist; feature flags default off for production-impacting flows; dry-run guard blocks omitted/unauthorized writes; display provider adapters are stubs only. |
| 1.5 Local service skeletons | Local services use shared contracts, mock repositories, dry-run guards, and feature flags OFF; all skeleton tests pass without credentials. |
| 2 Admin Dashboard MVP | Admin can view System Health, Jobs & Errors, Human Review Queue, Codex Review Queue; status changes write audit logs. |
| 3 Dataset ingestion/MI | Dataset upload validates schema; staging load succeeds; production load requires approval; recommendations include required scores and freshness warnings. |
| 4 Daily automation | Jobs are idempotent; failed jobs create humanReviewTasks; activation cannot bypass safety/date/billing/placement/provider approval checks. |
| 5 Display abstraction | DisplayProviderService contract tests pass; ScreenCloud dry-run produces expected diff; production sync requires approval. |
| 6 Backup/restore | Backup metadata is written; failed backup creates alert; restore test is documented; production restore cannot run automatically. |
| 7 Advertiser Dashboard | Advertiser can submit campaign; campaign enters correct lifecycle; recommendations display reasoning; billing preview is visible but gated. |
| 8 Media Center | Provider signup does not create display approval; checkbox creates providerId + advertiserId approval; revocation blocks future placements. |
| 9 Billing | Billing preview reconciles with campaign events; Stripe execution requires billing approval; rollback notes are captured. |
| 10 Legacy retirement | Source-verified zero dependency evidence exists; backup exists; deletion is approval-gated; rollback path documented. |

## Safety Tests

| Test | Expected result |
| --- | --- |
| Campaign without APPROVED safetyStatus attempts activation | Activation blocked and review task created. |
| Campaign outside start/end date attempts activation | Activation blocked. |
| Campaign with billing not ready attempts activation | Activation blocked. |
| Patient campaign without provider display approval attempts placement | Placement blocked. |
| Experiment variant without APPROVED safetyStatus receives traffic | Traffic blocked. |
| Unsupported video URL submitted | Campaign enters NEEDS_REVIEW or BLOCKED. |
| Landing page unreachable | Campaign enters NEEDS_REVIEW or BLOCKED. |

## Automation Tests

| Test | Expected result |
| --- | --- |
| Intake job rerun | No duplicate campaign/provider/advertiser records. |
| Display dry-run | No external ScreenCloud write occurs. |
| Billing dry-run | No Stripe invoice/charge is created. |
| Dataset staging load failure | No production table modified; review task created. |
| Backup failure | Alert and humanReviewTask created. |

## Source-Verified Regression Tests Needed For Phase 1

| Test | Expected result |
| --- | --- |
| Route parity inventory | Every current `doGet`/`doPost` mode has a target service owner and auth/write classification. |
| Trigger safety | No Phase 1 code can delete or modify Apps Script triggers. |
| Stripe dry-run | BillingService can reproduce Sheet 2/6/7 billing previews without creating Stripe objects. |
| ScreenCloud dry-run | DisplayProviderService can produce a diff for Sheet 6 and Sheet 7 placements without external writes. |
| Display approval migration | Sheet 3 and Sheet 6 approval-like records map to one `displayApprovals` rule without provider signup auto-approval. |
| Secret Manager readiness | All Script Property/env/code config names have Secret Manager destinations and rotation owners. |
| Repo ZIP parity boundary | ZIP-validated files are documented separately from unresolved deployed Apps Script/Cloud Run/BigQuery state. |
| Segment API write gate | `POST /segments/create` cannot be production-enabled without auth/RBAC, audit logging, and explicit write approval. |
| Market table alignment | All market-intelligence callers use the confirmed live targeting mart, expected to be `drip_marts.targetable_providers` if production matches source. |

## Phase 1 Local Contract Tests

| Test | Expected result |
| --- | --- |
| Shared schema validation | Core campaign, dataset, job, feature flag, and Codex review item shapes validate locally. |
| Campaign date validation | Campaign start date after end date is rejected. |
| Campaign lifecycle validation | ACTIVE campaign without approved safety/billing is rejected. |
| Provider display preference rule | Provider signup source cannot create display approval. |
| Experiment safety rule | Variant with traffic and non-approved safety status is rejected. |
| Dry-run guard behavior | Omitted `dryRun` defaults to blocked dry-run; explicit writes require approval. |
| Display provider stubs | ScreenCloud stub can preview but cannot live-write. |
| Feature flag validation | Default production-impacting flags are off. |
| Job log shape | Standard job fields validate. |
| Codex Review Queue shape | `copyForChatGPT` is required. |
| Dataset ingestion metadata | Dataset upload/load metadata validates without credentials. |

## Dashboard Visibility Tests

Every major workflow must expose status, last run, owner, errors, approval status, rollback notes, and next recommended action in the Admin Dashboard.

## Phase 1.5 Local Service Tests

| Test | Expected result |
| --- | --- |
| Intake normalization with mock data | Draft provider, advertiser, and campaign records are created without live Sheets. |
| Campaign safety lifecycle enforcement | ACTIVE campaign is blocked unless safety and billing gates pass. |
| Redirect destination selection | Safe mock destination is selected; unsafe variants are blocked. |
| Display-provider dry-run enforcement | Write-like display adapter methods require explicit `dryRun=true`. |
| Billing preview generation | Draft charges and invoice preview are created without Stripe. |
| Backup dry-run summary | Backup target validation and restore-test request draft are local only. |
| Dataset metadata validation | Dataset metadata and dry-run BigQuery load plan validate without BigQuery. |
| Market recommendation draft | Recommendation includes source freshness warnings and placeholders. |
| Daily orchestrator dry-run output | All local jobs return job logs with approvalRequired and rollbackNotes. |
| Codex Review Queue item | Phase 1.5 review item validates and includes `copyForChatGPT`. |
