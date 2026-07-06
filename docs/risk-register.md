# Risk Register

## Top Risks

| ID | Risk | Severity | Likelihood | Impact | Mitigation | Owner |
| --- | --- | --- | --- | --- | --- | --- |
| R1 | Repo ZIP validates only the market intelligence scaffold, not deployed Apps Script parity or runtime load order. | High | High | Implementation could miss Apps Script override behavior, tests, branch state, or deployed differences. | Verify deployed Apps Script source/order, full repo state, and missing service sources before production-connected Phase 1 implementation. | Drip Super Admin |
| R2 | Campaigns can become ACTIVE without complete safety/date/billing/placement gates. | Critical | Medium | Unsafe content or unauthorized display. | Central ActivationService with mandatory guards and tests. | Engineering |
| R3 | Provider signup may be treated as display approval. | Critical | Medium | Provider consent issue. | Enforce displayApprovals only from Media Center checkbox. | Product/Engineering |
| R4 | Production external writes lack dry-run/approval. | High | Medium | Accidental ScreenCloud, Stripe, or data changes. | Require dry-run, preview, approval, audit log. | Engineering |
| R5 | Sheets remain operational source of truth too long. | High | High | Fragile automation and hard-to-audit state. | Move operational state to Firestore; keep Sheets as intake/bridge only. | Engineering |
| R6 | Legacy Sheet 1 dependencies are unknown. | High | High | Cutover breaks old workflows or data access. | Build dependency map and retirement plan. | Engineering |
| R7 | Hard-coded pricing assumptions persist. | High | Medium | Billing and strategy limitations. | Add budget/dynamic pricing fields and BillingService. | Product/Billing |
| R8 | ScreenCloud-specific logic prevents future provider migration. | High | Medium | Vendor lock-in and brittle sync. | DisplayProviderService and internal placement records. | Engineering |
| R9 | Backup exists but restore is untested. | High | Medium | Disaster recovery failure. | Quarterly restore tests and backup metadata. | Operations |
| R10 | Market recommendations rely on stale or low-quality data. | Medium | Medium | Bad advertiser guidance. | Data freshness warnings and quality checks. | Data/Analytics |
| R11 | Codex-generated changes bypass human approval. | High | Low | Unreviewed production changes. | Codex Review Queue and approval gates. | Drip Super Admin |
| R12 | Secrets/config values may be stored in code. | High | Unknown | Credential exposure. | Source scan and Secret Manager migration. | Security/Engineering |
| R13 | Anonymous Apps Script web app exposes many modes that mutate sheets and billing state. | Critical | High | Unauthorized or malformed requests could affect campaigns, billing, or approvals. | Move routes to Cloud Run with auth, validation, rate limiting, and audit logs. | Engineering/Security |
| R14 | `setupTriggers` deletes all project triggers. | Critical | Medium | Accidental trigger loss and production automation outage. | Do not run; replace with IaC/Cloud Scheduler. | Engineering |
| R15 | Billing webhook currently forwards from Cloud Run to Apps Script. | Critical | Medium | Financial state depends on two runtimes and redirect behavior. | Move webhook handling fully into BillingService. | Engineering/Billing |
| R16 | `drip-segment-api` source can be deployed publicly while `POST /segments/create` writes BigQuery rows. | Critical | Medium | Unauthenticated callers could create segment records or expose provider lists if the source matches production. | Require IAM/auth/RBAC, rate limits, audit logs, and approval policy before production use. | Engineering/Security |
| R17 | Phase 1 contracts could be mistaken for production-ready implementation. | Medium | Medium | Reviewers may assume schemas/stubs resolve live parity or approval-owner blockers. | Keep blockers explicit; require production-readiness review before implementation or deploy. | Drip Super Admin |
| R18 | Phase 1.5 local skeletons could be mistaken for deployable services. | Medium | Medium | Mock handlers could be promoted before live IAM, source parity, approval owners, and secrets are ready. | Keep package local-only; require production implementation review and new approval before deployment work. | Engineering |
| R19 | Phase 2 dashboard status changes could be mistaken for production approvals. | Medium | Medium | Local review state could be interpreted as authorization to connect live services or cut over legacy systems. | Label dashboard as local-only, keep status changes in memory, and require separate rebuildApprovals before production-connected work. | Drip Super Admin |
| R20 | Squarespace remains a hidden operational dependency after app/API rebuild. | High | Medium | Public pages, forms, embeds, redirects, or scripts could keep production workflows outside GitHub/GCP control. | Inventory all Squarespace pages/forms/scripts/redirects and cut over only after replacements, staging, and rollback pass. | Engineering/Product |
| R21 | DNS or website cutover breaks public website, forms, email records, redirects, or SEO. | High | Medium | Lead intake, campaign pages, email verification, and indexed traffic could fail. | Require DNS export, TTL plan, staging validation, rollback target, monitoring, and separate production approval before any DNS change. | Engineering/Operations |
| R22 | Public Squarespace custom code calls live Apps Script modes for media center, conference, campaign, display preference, invoice, showcase, and QR flows. | Critical | High | Retiring or rebuilding pages without parity could break operational workflows or expose write-like behavior outside the app/API guardrails. | Use `docs/website-current-state-inventory.md`, export deployed Apps Script source, map every mode to a service owner, and require parity tests before cutover. | Engineering/Security |
| R23 | Squarespace commerce/cart and upload host dependencies may be missed during website retirement. | High | Medium | Campaign image uploads, checkout, historical orders, or payment-related settings could fail or be lost. | Export commerce settings/orders/products and inventory `upload.driphealthcare.com` backend/storage before retiring Squarespace commerce or custom campaign submit pages. | Billing/Operations |
| R24 | Private export evidence may expose secrets, tokens, personal data, or payment/order data if handled like ordinary docs. | High | Medium | Sensitive data could be committed to Git or shared with broader reviewers. | Follow `docs/manual-export-collection-plan.md`: raw exports stay outside the repo, tokens and personal data are redacted, and only sanitized findings are committed. | Security/Operations |

## Risky Production Items

| Item | Risk | Gate |
| --- | --- | --- |
| Apps Script trigger changes | Can change live behavior. | Do not modify until approved migration phase. |
| Google Sheets writes | Can alter live intake/admin data. | Read-only audit or approved migration only. |
| Firestore writes | Can alter operational source of truth. | Feature-flagged and approved. |
| BigQuery production loads | Can pollute analytics/MI outputs. | Dataset approval and staging validation. |
| Stripe actions | Can create financial impact. | Billing approval and dry-run preview. |
| ScreenCloud writes | Can affect live screens. | Display sync approval and preview. |
| Cloud Run deploys | Can change APIs/jobs/redirects. | CI/CD approval, backup, rollback. |
| Public Segment API routes | Can expose provider targeting data or persist segment records. | Auth/IAM review and write approval policy. |
| Contract package changes | Can influence future implementation assumptions. | ChatGPT/Drip review before production coding. |
| Local service skeletons | Can influence future service boundaries. | ChatGPT/Drip review before production-connected coding. |
| Local dashboard review state | Can influence human workflow assumptions. | In-memory only; not a production approval source. |
| Squarespace/DNS changes | Can affect public website availability, forms, redirects, SEO, custom Apps Script flows, commerce, uploads, and email/verification records. | Separate hosting cutover approval; no changes in Phase 2.1, Phase 2.2, or Phase 2.3. |
| Public website custom code | Can call live Apps Script modes or upload endpoints from public pages. | Source-verified inventory, app/API parity tests, auth/RBAC review, and cutover approval. |
| Private export files | Can contain secrets, tokens, customer/order/payment data, form responses, or private account details. | Store raw exports outside the repo; commit only sanitized summaries after review. |
| Legacy code deletion | Can break hidden dependencies. | Zero dependency proof and explicit approval. |

## Open Risks Due To Evidence Gap

The aggregate and repo ZIP resolved many earlier planning unknowns. Phase 2.2 reduces the Squarespace evidence gap with a public read-only inventory, and Phase 2.3 defines the private-source export plan. Private exports are still required before migration decisions can be finalized. Remaining unmeasured risks are direct deployed Apps Script source parity, Apps Script runtime source order, live traffic volume by route, live trigger health beyond the aggregate snapshot, current secret values/rotation status, live BigQuery table location/row freshness, Cloud Run IAM/deployed image parity, full branch/uncommitted repo state, Squarespace form destinations/notifications, Squarespace redirect settings, Squarespace commerce configuration/orders, upload service backend/storage, authoritative DNS TTLs, registrar account ownership, analytics/Search Console ownership, current DNS record dependencies not visible from public lookups, and whether raw private exports can be safely redacted into commit-worthy summaries.
