# Acceptance Tests

## Phase Acceptance Criteria

| Phase | Acceptance tests |
| --- | --- |
| 0 Audit/blueprint | All requested docs exist; source-verified inventory is added; uploaded repo ZIP is reviewed read-only; secret values are not exposed; deployed source parity gaps are marked; no production systems changed. |
| 1 Foundation | Shared schemas validate required fields; lifecycle enum tests pass; jobRun and auditLog contracts exist; feature flags default off for production-impacting flows; dry-run guard blocks omitted/unauthorized writes; display provider adapters are stubs only. |
| 1.5 Local service skeletons | Local services use shared contracts, mock repositories, dry-run guards, and feature flags OFF; all skeleton tests pass without credentials. |
| 2 Admin Dashboard MVP | Admin can view System Health, Jobs & Errors, Human Review Queue, Codex Review Queue, Feature Flags, Dataset Uploads, Market Intelligence, Display Placements, Billing Review, Backup & Restore, and Legacy Migration; local status changes remain in memory; no production systems changed. |
| 2.1 Website platform simplification | Squarespace retirement plan, hosting/domain architecture, staging plan, DNS migration plan, rollback plan, and cutover checklist are documented; no DNS, Squarespace, deploy, credential, or production-resource changes occur; Phase 3 remains blocked. |
| 2.2 Website current-state inventory | Public website, form, script/embed, redirect, asset, SEO/analytics, DNS/registrar, dependency, rebuild/retain/retire, cutover-risk, and manual-info tables are documented from read-only evidence or marked `UNKNOWN`; no DNS, Squarespace, deploy, credential, or production-resource changes occur; Phase 3 remains blocked. |
| 2.3 Manual export review plan | Manual export checklist and sensitive evidence handling policy are documented; every Phase 2.2 `UNKNOWN` category maps to a safe export step; no live credentials, production changes, DNS changes, Squarespace changes, or Phase 3 dataset ingestion occur. |
| 2.4 Private evidence automation kit | Local scripts create private evidence folders outside the repo, generate README files/templates/manifests/redaction checklists, scan for sensitive patterns non-destructively, write private redaction reports, preserve `UNKNOWN` defaults, and require no live credentials or production calls. |
| 2.5 Private evidence inbox workflow | Local scripts create `inbox/` and `review-needed/`, classify/copy inbox files, deduplicate by hash, generate import manifests/status reports, preserve inbox originals by default, preserve `UNKNOWN` defaults, and require no live credentials, private APIs, production calls, or Phase 3 ingestion. |
| 2.6 Public evidence auto-collector | Local script collects public/read-only website, DNS, and RDAP evidence into the private inbox only, generates a manifest, handles missing hosts/routes gracefully, preserves import/scan/status workflow, and requires no live credentials, cookies, private APIs, production writes, or Phase 3 ingestion. |
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

## Phase 2 Local Dashboard Tests

| Test | Expected result |
| --- | --- |
| Dashboard data loading | Dashboard snapshot loads from mock repositories and local service skeletons. |
| Codex Review Queue display shape | Review items expose phase, title, summary, files changed, risk level, production impact, tests, unresolved blockers, `copyForChatGPT`, and `promptBackToCodex`. |
| `copyForChatGPT` required | Codex review item schema rejects items missing `copyForChatGPT`. |
| `promptBackToCodex` local edit | Dashboard store can edit and retain `promptBackToCodex` in memory. |
| Feature flags OFF | Every production-impacting feature flag remains false and dashboard enablement is locked. |
| Dry-run status visible | Jobs, BigQuery load plans, display dry-run, billing preview, and backup summary expose dryRun status. |
| Unresolved blockers visible | System Health and Legacy Migration show Apps Script parity, runtime order, live route usage, Secret Manager, approval owner, and BigQuery table-map blockers. |
| No production credentials required | Dashboard declares no live credential requirements or environment variable dependencies. |
| No production service calls | Dashboard policy marks Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, display provider, and deploy calls disabled. |

## Phase 2.1 Website Platform Planning Tests

| Test | Expected result |
| --- | --- |
| Squarespace long-term recommendation | Docs state Squarespace is not needed long term as the website/application platform. |
| Temporary Squarespace role | Docs state Squarespace may remain temporarily for current public pages/forms and possibly domain registration/DNS until safe cutover. |
| Never-host-in-Squarespace list | Docs block admin tools, authenticated dashboards, billing workflows, internal review queues, redirects/APIs, and dataset workflows from Squarespace hosting. |
| Inventory requirements | Docs require current Squarespace pages, forms, scripts, redirects, assets, SEO, analytics, and DNS records to be inventoried before migration. |
| Hosting recommendation | Docs compare Firebase Hosting plus Cloud Run, Cloud Run behind load balancer, static frontend with API backend, and GCP static hosting, with a recommended simple option. |
| DNS and staging plan | Docs include DNS migration guardrails, staging domain plan, production cutover checklist, and rollback plan. |
| No production change | Validation confirms no deploy, DNS, Squarespace, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 remains blocked | Codex task plan and review packet keep dataset ingestion blocked until ChatGPT/Drip review. |

## Phase 2.2 Website Inventory Tests

| Test | Expected result |
| --- | --- |
| Current inventory doc exists | `docs/website-current-state-inventory.md` exists and states the work is read-only. |
| Required inventory tables | Page, form, script/embed, redirect, asset, SEO/analytics, DNS/registrar, dependency, rebuild/retain/retire, cutover-risk, and manual-info tables are present. |
| Unknowns are explicit | Fields requiring private Squarespace, DNS, Apps Script, Sheets, analytics, registrar, upload-service, or commerce access are marked `UNKNOWN`. |
| Public evidence is source-labeled | Sitemap, robots, public fetches, DNS, and RDAP evidence are distinguished from assumptions. |
| Custom code dependencies visible | Apps Script, upload, commerce, ScreenCloud, analytics, and QR/campaign redirect dependencies are documented. |
| No live endpoint token committed | Active Apps Script deployment token is not repeated in repo docs. |
| DNS guardrails preserved | DNS migration requires authoritative export, mail/verification preservation, staging validation, rollback, and separate approval. |
| No production change | Validation confirms no deploy, DNS, Squarespace, website, form, redirect, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 remains blocked | Codex task plan and review packet keep dataset ingestion blocked until ChatGPT/Drip review. |

## Phase 2.3 Manual Export Plan Tests

| Test | Expected result |
| --- | --- |
| Manual export plan exists | `docs/manual-export-collection-plan.md` exists and states the work is planning/evidence-intake only. |
| Export checklist coverage | Checklist covers Squarespace pages, forms, custom code, redirects, assets, commerce, registrar, DNS records, analytics, Search Console, Apps Script deployments, Apps Script modes, Sheets destinations, upload service, ScreenCloud references, and active QR/campaign/conference routes. |
| Required fields per category | Each export category documents owner, access needed, export steps, safe file format, redactions, storage, Codex consumption, Squarespace-retirement blocker status, Phase 3 blocker status, and rollback relevance. |
| Sensitive evidence policy | Docs require secrets, tokens, private customer/order/payment data, and personal data to be redacted or stored outside the repo. |
| Unknown coverage map | Every Phase 2.2 `UNKNOWN` category has a matching manual export step. |
| No production credential requirement | Docs require read-only exports or sanitized summaries and do not require live credentials in the repo. |
| No production change | Validation confirms no deploy, DNS, Squarespace, website, form, redirect, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 remains blocked | Codex task plan and review packet keep dataset ingestion blocked until Drip/ChatGPT review of the sanitized evidence package. |

## Phase 2.4 Private Evidence Automation Kit Tests

| Test | Expected result |
| --- | --- |
| Automation kit doc exists | `docs/private-evidence-automation-kit.md` explains local-only usage, defaults, commands, folder structure, redaction scanning, and safety boundaries. |
| Package scripts exist | Root package scripts expose `evidence:create-folders`, `evidence:create-templates`, `evidence:scan`, and `evidence:summary-stubs`. |
| Private folder outside repo | Scripts default to `~/Documents/Drip/private-evidence` and refuse a root path inside the repository. |
| Folder creation | Smoke check creates all required private evidence subfolders and README files in a non-repo test location. |
| Summary templates | Smoke check creates sanitized summary stubs for every Phase 2.3 evidence category. |
| Manifest and checklist | Smoke check creates an evidence manifest template and redaction checklist. |
| Redaction scanner | Scanner writes a private redaction report, masks matched values, and does not modify raw files. |
| `UNKNOWN` defaults | Generated templates preserve `UNKNOWN` fields until verified by evidence. |
| No production credential requirement | Scripts run locally without live credentials, private APIs, or production systems. |
| No production change | Validation confirms no deploy, DNS, Squarespace, website, form, redirect, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 remains blocked | Codex task plan and review packet keep dataset ingestion blocked until Drip/ChatGPT review. |

## Phase 2.5 Private Evidence Inbox Workflow Tests

| Test | Expected result |
| --- | --- |
| Inbox folders created | `inbox/` and `review-needed/` are included in the required private evidence folder structure. |
| Package scripts exist | Root package scripts expose `evidence:open`, `evidence:open-inbox`, `evidence:import`, and `evidence:status` alongside existing evidence commands. |
| Importer copy default | Importer copies files from `inbox/` without deleting or modifying originals by default. |
| Optional move is explicit | Importer removes an inbox original only when `--move` is passed and a copy succeeded. |
| Classification coverage | Importer can classify likely DNS/registrar, Squarespace, Apps Script, Sheets, analytics/Search Console, commerce, upload-service, ScreenCloud, and active-route evidence from filename and safe text snippets. |
| Uncertain files routed to review | LOW and UNKNOWN confidence files are copied to `review-needed/`. |
| Duplicate imports skipped | Repeated imports deduplicate by file hash and do not create unnecessary duplicate copies. |
| Import manifest generated | Importer writes a manifest under `manifests/` with import date, original path, copied path, detected category, confidence, reason, hash, action, scan recommendation, and UNKNOWN status. |
| Status report generated | Status report lists inbox files, imported file counts by category, files needing review, categories with no evidence, UNKNOWN summaries, latest redaction report, and recommended next command. |
| Scanner remains non-destructive | Scanner still writes reports and optional safe redacted copies without modifying raw evidence. |
| No production credential requirement | Inbox workflow runs locally without live credentials, private APIs, or production systems. |
| No production change | Validation confirms no deploy, DNS, Squarespace, website, form, redirect, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, live credential, private API, or Phase 3 dataset-ingestion changes. |

## Phase 2.6 Public Evidence Collector Tests

| Test | Expected result |
| --- | --- |
| Package scripts exist | Root package scripts expose `evidence:collect-public` and `evidence:collect-public:dry-run`. |
| Private inbox only | Collector refuses a private evidence root inside the repository and writes generated files only under `private-evidence/inbox/`. |
| Manifest generated | Collector writes a timestamped manifest with collection date, URLs fetched, DNS lookups, files written, errors, skipped resources, production impact `NONE`, credentials `NO`, private APIs `NO`, forms submitted `NO`, and Phase 3 `NO`. |
| Public page inventories | Collector writes timestamped CSVs for page list, route inventory, forms, scripts, external links, assets/media, SEO/meta/canonical data, public Apps Script references, upload references, ScreenCloud references, Google Analytics references, and active route candidates. |
| Public DNS/domain inventories | Collector writes public DNS records and summary, and writes or explicitly skips RDAP JSON when unavailable without credentials. |
| Dry-run behavior | `evidence:collect-public:dry-run` exercises output generation without public fetches or DNS/RDAP lookups. |
| Missing hosts/routes handled | Missing sitemap pages, subdomains, DNS records, and RDAP data are recorded as skipped or errors without stopping the whole run. |
| No credential/cookie usage | Collector does not read keychains, browser cookies, saved sessions, live credentials, private APIs, or authenticated admin pages. |
| No form submissions | Collector records public form source only and never submits forms or calls Apps Script modes. |
| Existing inbox workflow still works | Public collector output can pass through `evidence:import`, `evidence:scan`, and `evidence:status` locally. |
| No production change | Validation confirms no deploy, DNS, Squarespace, website, form, redirect, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, live credential, private API, authenticated access, or Phase 3 dataset-ingestion changes. |
