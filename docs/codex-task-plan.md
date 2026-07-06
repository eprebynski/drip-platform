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

## Phase 2.2 Website Current-State Inventory Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-2-2-website-inventory`. |
| Inventory doc | Added `docs/website-current-state-inventory.md`. |
| Evidence boundary | Public website, sitemap, robots, DNS, RDAP, and page source only; private exports remain `UNKNOWN`. |
| Key finding | Several public Squarespace pages call a live Apps Script web app for media center, display preference, digital signage, conference invoice, campaign submit/edit/archive/order, showcase, and QR redirect flows. |
| DNS finding | Public DNS points apex and `www` to Squarespace, with Google Workspace MX records and Google verification TXT records that must be preserved. |
| Commerce/upload finding | `/store`, `/cart`, and `upload.driphealthcare.com/upload` are live dependencies requiring export/owner review. |
| Production impact | None. No deploys, DNS, Squarespace, website/page/form/redirect edits, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 status | Still blocked until ChatGPT/Drip review. |

## Phase 2.3 Manual Export Collection Plan Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-2-3-manual-export-review-plan`. |
| Manual export plan | Added `docs/manual-export-collection-plan.md`. |
| Evidence boundary | Planning only; raw private exports stay outside the repo unless sanitized and approved for documentation. |
| Private-source coverage | Squarespace pages/forms/code/redirects/assets/commerce, registrar/DNS, GA/Search Console, Apps Script, Sheets, upload service, ScreenCloud references, and active QR/campaign/conference routes. |
| Sensitive-data policy | Secrets, private tokens, customer/order/payment data, and personal data must be redacted or kept outside Git. |
| `UNKNOWN` handling | Phase 2.2 `UNKNOWN` categories map to safe manual export steps and remain `UNKNOWN` until verified. |
| Production impact | None. No deploys, DNS, Squarespace, website/page/form/redirect edits, Apps Script, triggers, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes. |
| Phase 3 status | Still blocked until Drip/ChatGPT review of the sanitized evidence package. |

## Phase 2.4 Private Evidence Automation Kit Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-2-4-private-evidence-automation-kit`. |
| Local scripts | Added local-only evidence folder, template, summary-stub, and redaction-scan scripts under `scripts/`. |
| Package scripts | Added root `npm run evidence:create-folders`, `evidence:create-templates`, `evidence:scan`, and `evidence:summary-stubs`. |
| Private folder default | `~/Documents/Drip/private-evidence`; scripts refuse roots inside the repo. |
| Evidence outputs | README files, sanitized-summary stubs, manifest template, redaction checklist, and redaction reports. |
| Sensitive-data posture | Scanner is non-destructive; raw exports stay outside Git; findings are masked in reports; `UNKNOWN` remains until verified. |
| Production impact | None. No deploys, DNS, Squarespace, website/page/form/redirect edits, Apps Script, triggers, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, live credentials, private API calls, or Phase 3 dataset ingestion. |
| Phase 3 status | Still blocked until Drip/ChatGPT review. |

## Phase 2.5 Private Evidence Inbox Workflow Status

| Item | Status |
| --- | --- |
| Branch name requested | `rebuild/phase-2-5-private-evidence-inbox-workflow`. |
| Local inbox workflow | Added `inbox/` and `review-needed/` to the private evidence folder structure. |
| Importer | Added local-only inbox importer that classifies by filename, extension, and safe text snippets, copies files into evidence folders, sends uncertain files to `review-needed/`, deduplicates by hash, and writes import manifests. |
| Status report | Added local-only status report showing inbox files, imported files by category, review-needed files, missing categories, `UNKNOWN` summary stubs, latest redaction report, and recommended next command. |
| Folder opener | Added local opener commands for the private root and inbox folder. |
| Production impact | None. No deploys, DNS, Squarespace, website/page/form/redirect edits, Apps Script, triggers, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, live credentials, private API calls, or Phase 3 dataset ingestion. |
| Phase 3 status | Still blocked until Drip/ChatGPT review. |

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
| 2.2 | Inventory current Squarespace website, forms, scripts, redirects, assets, SEO, analytics, DNS, and migration risks in read-only mode. |
| 2.3 | Plan manual private-source exports, redaction, evidence storage, and review steps for resolving website migration `UNKNOWN` fields. |
| 2.4 | Add local-only private evidence automation for folders, templates, manifests, redaction reports, and sanitized summary stubs. |
| 2.5 | Add local-only private evidence inbox import, auto-classification, review-needed routing, import manifests, and status reports. |
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

## Phase 2.2 Codex Review Queue Item

```text
Codex Review Queue Item
Phase: Phase 2.2
Title: Read-Only Squarespace Website Inventory
Summary: Documentation-only current-state inventory of public Drip Healthcare Squarespace pages, forms, scripts, redirects, assets, SEO/analytics, DNS/registrar observations, operational dependencies, rebuild/retain/retire decisions, cutover risks, and manual export steps. Private Squarespace/DNS/Apps Script/Sheets/analytics/commerce fields are marked UNKNOWN where read-only public evidence is insufficient.
Files changed: docs/website-current-state-inventory.md, docs/website-platform-simplification-plan.md, docs/hosting-domain-architecture.md, docs/risk-register.md, docs/acceptance-tests.md, docs/codex-task-plan.md
Risk level: MEDIUM
Production impact: None. No deploys, DNS changes, Squarespace changes, website/page/form/redirect edits, Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production-resource, or live credential changes.
Tests or validation: Read-only public website/sitemap/robots/DNS/RDAP checks, documentation review, local package tests where available, and secret-pattern scan.
Approvals needed: Drip/ChatGPT review before any Squarespace, DNS, hosting, Apps Script, redirect, upload, commerce, analytics, or production-resource changes. Phase 3 dataset ingestion remains blocked.
Open questions: Who owns Squarespace/registrar/DNS/analytics/upload/commerce today, where each form writes, which Apps Script deployment/source is live, and which custom routes have current traffic.
Recommended next Codex prompt: Review Phase 2.2 inventory with Drip and ChatGPT; collect read-only Squarespace admin exports, DNS zone export, Apps Script deployment/source, form destinations, upload-service ownership, commerce settings, and analytics/Search Console reports; do not change production systems or start Phase 3.
```

## Phase 2.3 Codex Review Queue Item

```text
Codex Review Queue Item
Phase: Phase 2.3
Title: Manual Export Collection and Private-Source Inventory Review Plan
Summary: Documentation-only plan for Drip to safely collect, redact, store, and review private-source evidence needed to resolve Phase 2.2 website migration UNKNOWN fields before Squarespace retirement planning advances.
Files changed: docs/manual-export-collection-plan.md, docs/website-current-state-inventory.md, docs/website-platform-simplification-plan.md, docs/hosting-domain-architecture.md, docs/risk-register.md, docs/acceptance-tests.md, docs/codex-task-plan.md
Risk level: MEDIUM
Production impact: None. No deploys, DNS changes, Squarespace changes, website/page/form/redirect edits, Apps Script changes, trigger changes, live Sheets/Firestore/BigQuery/Stripe/ScreenCloud writes, production resources, live credentials, or Phase 3 dataset ingestion.
Tests or validation: Documentation review, acceptance checklist coverage, local package tests where available, and secret-pattern scan.
Approvals needed: Drip/ChatGPT review before private evidence is converted into migration decisions, before Squarespace/DNS/hosting/App Script/app/API changes, and before Phase 3 dataset ingestion.
Open questions: Who owns each export category, where Drip wants private evidence stored, which private exports can be summarized into repo docs, and which unresolved dependencies block Phase 3.
Recommended next Codex prompt: Review the Phase 2.3 manual export plan with Drip and ChatGPT; collect sanitized evidence summaries for Squarespace pages/forms/code/redirects/assets/commerce, registrar/DNS, GA/Search Console, Apps Script, Sheets, upload service, ScreenCloud references, and active QR/campaign/conference routes; keep raw secrets/private data outside the repo and do not start Phase 3.
```

## Phase 2.4 Codex Review Queue Item

```text
Codex Review Queue Item
Phase: Phase 2.4
Title: Private Evidence Automation Kit
Summary: Local-only scripts and documentation that help Drip create the private evidence folder structure outside the repo, generate README files, blank sanitized-summary stubs, manifest and redaction checklist templates, and run a non-destructive sensitive-pattern scanner that writes private redaction reports.
Files changed: package.json, .gitignore, scripts/private-evidence-kit-common.js, scripts/create-private-evidence-folders.js, scripts/generate-private-evidence-templates.js, scripts/generate-sanitized-summary-stubs.js, scripts/scan-private-evidence-for-secrets.js, docs/private-evidence-automation-kit.md, docs/manual-export-collection-plan.md, docs/acceptance-tests.md, docs/risk-register.md, docs/codex-task-plan.md
Risk level: MEDIUM
Production impact: None. No deploys, DNS changes, Squarespace changes, website/page/form/redirect edits, Apps Script changes, trigger changes, live Sheets/Firestore/BigQuery/Stripe/ScreenCloud writes, production resources, live credentials, private API calls, or Phase 3 dataset ingestion.
Tests or validation: Local script smoke checks, package tests where available, diff check, secret-pattern scan, and PR scope verification.
Approvals needed: Drip/ChatGPT review before using sanitized summaries for migration decisions or starting Phase 3.
Open questions: Where Drip wants the private evidence folder stored long term, who owns each export category, and which sanitized summaries can be reviewed for repo documentation.
Recommended next Codex prompt: Review Phase 2.4 with Drip and ChatGPT; run the private evidence automation kit locally to create folders and templates, collect private exports outside Git, run the scanner, fill only sanitized summaries, keep UNKNOWN fields until verified, and do not start Phase 3 or change production systems.
```

## Phase 2.5 Codex Review Queue Item

```text
Codex Review Queue Item
Phase: Phase 2.5
Title: Private Evidence Inbox and Auto-Classification Workflow
Summary: Local-only inbox workflow that lets Drip place mixed private exports/screenshots/PDFs/CSVs/TXT/Markdown/JSON/notes into `inbox/`, classify and copy them into private evidence folders, route uncertain files to `review-needed/`, deduplicate by hash, generate import manifests, and produce local status reports.
Files changed: package.json, scripts/private-evidence-kit-common.js, scripts/create-private-evidence-folders.js, scripts/generate-private-evidence-templates.js, scripts/scan-private-evidence-for-secrets.js, scripts/import-private-evidence-inbox.js, scripts/generate-private-evidence-status-report.js, scripts/open-private-evidence-folder.js, docs/private-evidence-automation-kit.md, docs/manual-export-collection-plan.md, docs/acceptance-tests.md, docs/risk-register.md, docs/codex-task-plan.md
Risk level: MEDIUM
Production impact: None. No deploys, DNS changes, Squarespace changes, website/page/form/redirect edits, Apps Script changes, trigger changes, live Sheets/Firestore/BigQuery/Stripe/ScreenCloud writes, production resources, live credentials, private API calls, or Phase 3 dataset ingestion.
Tests or validation: Local importer/status/folder/template/scanner smoke checks, existing package tests where available, syntax checks, secret-pattern scan, .DS_Store scan, and PR scope verification.
Approvals needed: Drip/ChatGPT review before trusting classifications for migration decisions, converting private evidence into repo docs, or starting Phase 3.
Open questions: Which private evidence folder location Drip prefers long term, who reviews `review-needed/`, and which sanitized summaries can be promoted into repo documentation after redaction review.
Recommended next Codex prompt: Review Phase 2.5 with Drip and ChatGPT; use `npm run evidence:open-inbox`, place private exports into the inbox, run `npm run evidence:import`, run `npm run evidence:scan`, review `review-needed/` and redaction reports, fill sanitized summaries only, keep UNKNOWN fields until verified, and do not start Phase 3 or change production systems.
```

## Approval Policy

Codex may create documentation, tests, schemas, and non-production skeletons. Codex must not deploy, modify triggers, delete code, write to live services, run billing, sync live displays, or cut over production without explicit Drip approval captured in rebuildApprovals.
