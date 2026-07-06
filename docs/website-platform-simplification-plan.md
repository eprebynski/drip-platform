# Website Platform Simplification And Squarespace Retirement Plan

## Purpose

Phase 2.1 defines a documentation-only plan for removing Squarespace as a required website and application platform for Drip Healthcare. No DNS, Squarespace, Apps Script, Google, Stripe, ScreenCloud, production resource, or live credential change is part of this phase.

## Recommendation

Squarespace is not needed long term as the Drip Healthcare website or application platform. The rebuild should move public pages, authenticated app surfaces, admin dashboards, redirect services, API routes, and showcase pages into the Drip GitHub/GCP stack.

Squarespace should remain temporary only while replacement pages are inventoried, rebuilt, tested, staged, and safely cut over. If the domain is registered through Squarespace Domains, DNS registration can remain there temporarily while the hosting target changes. Domain registration and website hosting should be treated as separate decisions.

## Why Squarespace Is Not Needed Long Term

| Reason | Explanation |
| --- | --- |
| Product surfaces are becoming software | Admin, advertiser, provider, redirect, billing, review, and analytics workflows need app/API controls, RBAC, audit logs, dry-run guards, and tests. |
| GitHub/GCP is the rebuild source of truth | Codex, pull requests, CI checks, Cloud Run, Firestore, BigQuery, Cloud Storage, and Secret Manager should control deployable behavior. |
| Manual website-builder maintenance adds risk | A separate builder increases drift between marketing copy, app routes, intake forms, scripts, and operational workflows. |
| Squarespace is not suitable for internal tools | Admin tools and authenticated dashboards need least-privilege access, structured logs, change review, and rollback paths. |
| Form intake should become API-backed | Intake should move from ad hoc website/forms/Sheets flows into validated app/API intake with schema checks, idempotency, and review queues. |

## What Should Never Be Hosted In Squarespace

| Surface | Reason |
| --- | --- |
| Drip Admin Dashboard | Requires RBAC, audit logs, internal review queues, feature flags, backups, and production-write guards. |
| Advertiser Dashboard | Requires authenticated campaign submission, recommendation logic, billing visibility, and account-level authorization. |
| Provider Media Center | Requires provider identity, display preferences, consent history, and campaign visibility rules. |
| Campaign billing workflows | Stripe previews, approvals, invoices, webhook handling, and revenue-share logic must stay behind service boundaries. |
| Internal review queues | Human Review Queue and Codex Review Queue are operational controls, not public website content. |
| Campaign activation/deactivation controls | These are production operations and must remain approval-gated in the Drip app/API layer. |
| Redirect/event APIs | QR and campaign redirect routes need observable, testable service behavior and cannot depend on website-builder scripts. |
| Dataset upload/admin workflows | Dataset staging, validation, and future BigQuery load approval require service contracts and audit logs. |

## Temporary Squarespace Role

| Component | Temporary posture |
| --- | --- |
| Public marketing website | May remain live until equivalent public pages are built, reviewed, and staged in the Drip repo. |
| Public forms | May remain only until each form has an inventoried owner, replacement intake flow, and migration plan. |
| Domain registration | May remain if the domain is registered there; domain registration does not require website hosting there. |
| DNS management | May remain temporarily if current DNS is managed there, but all DNS changes require a separate approved cutover task. |
| Historical page content | Can be used as read-only source material for rebuilt repo-controlled pages. |

## Required Inventory Before Migration

Before any cutover, create a source-verified inventory of current Squarespace assets.

| Inventory area | Required details |
| --- | --- |
| Pages | URL, page purpose, owner, current copy/media, SEO title/description, canonical path, dependencies, replacement route. |
| Forms | Form name, fields, validation, destination, notification recipients, Sheets/Apps Script dependencies, spam controls, replacement intake route. |
| Scripts and embeds | Inline scripts, tracking snippets, scheduling widgets, payment embeds, analytics, redirects, custom code, risk classification. |
| Redirects | Source URL, destination URL, status code if known, campaign dependency, replacement owner. |
| Domains/DNS | Registrar, nameservers, DNS records, mail records, verification records, current hosting target, TTLs. |
| Assets | Images, videos, PDFs, downloadable files, licenses, owners, required alt text. |
| SEO and analytics | Current sitemap, indexed pages, tracking IDs, Search Console ownership, analytics ownership. |

## Pages To Rebuild In The Drip Repo

| Surface | Recommended route |
| --- | --- |
| Public home page | `https://driphealthcare.com/` and `https://www.driphealthcare.com/` |
| About/value proposition | `/about` or homepage sections |
| Advertiser marketing | `/advertisers` |
| Provider/media-center marketing | `/media-center` |
| Conference/showcase overview | `/showcase` or `https://showcase.driphealthcare.com/` |
| Contact/request demo | `/contact` backed by future intake API |
| Privacy/terms | `/privacy`, `/terms` |
| Campaign landing pages | Repo-managed templates or app-managed pages, not Squarespace scripts |
| Showcase pages | `https://showcase.driphealthcare.com/...` |

## Forms To Move Into Future App/API Intake

| Current likely form category | Future owner |
| --- | --- |
| Advertiser inquiry/request demo | Advertiser intake API with validation and review task creation. |
| Campaign submission | Advertiser Dashboard submission flow, not a generic website form. |
| Provider/media-center signup | Media Center provider onboarding with explicit display preference and consent logic. |
| Conference interest/sponsor inquiry | Conference/showcase intake route with source attribution. |
| General contact | Public website contact endpoint with spam controls and audit-safe routing. |
| Billing or purchase-related forms | BillingService preview/approval flow; never raw Squarespace form submission. |

## Recommended Future Surfaces

| Surface | Purpose | Recommended host pattern |
| --- | --- | --- |
| `driphealthcare.com` | Public marketing website | Static frontend hosted by GCP-first hosting. |
| `www.driphealthcare.com` | Public marketing website alias | Redirect or same static frontend. |
| `admin.driphealthcare.com` | Drip Admin Dashboard | Authenticated app backed by AdminApi. |
| `app.driphealthcare.com` | Shared authenticated app shell | Authenticated frontend with app APIs. |
| `app.driphealthcare.com/advertisers` or `advertisers.driphealthcare.com` | Advertiser Dashboard | Prefer path under shared app shell until separate subdomain is justified. |
| `app.driphealthcare.com/media-center` or `media.driphealthcare.com` | Provider Media Center | Prefer path under shared app shell until separate subdomain is justified. |
| `api.driphealthcare.com` | API layer | Cloud Run services behind managed HTTPS and auth policy. |
| `go.driphealthcare.com` | Campaign/QR redirect service | Dedicated RedirectService with logging, rate limits, and rollback. |
| `showcase.driphealthcare.com` | Conference showcase pages | Static or hybrid frontend with API-backed events. |

## Hosting Options

| Option | Fit | Tradeoffs |
| --- | --- | --- |
| Firebase Hosting plus Cloud Run | Best simple default for public/static pages and routed dynamic APIs. | Requires Firebase project setup and rewrite discipline, but keeps frontend hosting simple. |
| Cloud Run behind external HTTPS load balancer | Strong for one platform and advanced routing. | More infrastructure to manage than needed for simple public pages. |
| Static frontend with API backend | Good principle regardless of host; public pages stay static, APIs stay Cloud Run. | Needs a chosen static host and routing plan. |
| Cloud Storage static website plus CDN/load balancer | GCP-native and low cost. | More manual HTTPS/load-balancer setup; less ergonomic than Firebase Hosting for preview/cutover. |

## Recommended Option For Simplicity

Use Firebase Hosting for public/static frontends with rewrites to Cloud Run APIs where needed, and keep APIs on Cloud Run.

This keeps public pages simple, supports preview/staging channels, allows static assets to be repo-controlled, and keeps operational logic in Cloud Run services. If Firebase Hosting is not desired, the fallback is Cloud Run behind an HTTPS load balancer for all frontend/app/API surfaces, but that should be chosen only if the team wants one routing layer for every surface.

## DNS Migration Plan

No DNS changes happen in Phase 2.1. Future DNS migration should be handled as a separate approved cutover task.

1. Inventory registrar, nameservers, DNS records, mail records, verification records, and TTLs.
2. Decide whether Squarespace remains registrar/DNS temporarily or whether DNS moves to Cloud DNS.
3. Build replacement pages and app surfaces in staging.
4. Create staging records or preview URLs without affecting production.
5. Lower TTLs before approved production cutover.
6. Cut over one surface at a time, starting with low-risk public marketing pages.
7. Monitor HTTPS, redirects, forms, analytics, SEO, and route health.
8. Keep rollback records ready until post-cutover acceptance passes.

## Staging Domain Plan

| Staging surface | Purpose |
| --- | --- |
| `staging.driphealthcare.com` | Public website staging and stakeholder review. |
| `staging-admin.driphealthcare.com` | Admin Dashboard staging after auth exists. |
| `staging-app.driphealthcare.com` | Shared app shell staging. |
| `staging-api.driphealthcare.com` | API staging with test data only. |
| `staging-go.driphealthcare.com` | Redirect staging for QR/event flow testing. |
| Firebase preview URLs | PR-level page review before any DNS record exists. |

Staging must use test data, test credentials, and non-production GCP resources. Phase 2.1 does not create any of these resources.

## Production Cutover Checklist

| Check | Required before cutover |
| --- | --- |
| Page inventory complete | Every Squarespace page has a mapped replacement, archive decision, or redirect. |
| Form inventory complete | Every form has a replacement intake route or approved temporary keep decision. |
| DNS inventory complete | Registrar, nameservers, DNS records, TTLs, mail, and verification records are documented. |
| Replacement pages reviewed | Copy, media, SEO, accessibility, and mobile behavior approved. |
| Staging validated | Staging pages, forms, redirects, and analytics pass acceptance tests. |
| Rollback plan approved | DNS rollback targets, old Squarespace page availability, and decision owner are documented. |
| Monitoring ready | Uptime checks, logs, redirect checks, Search Console/analytics checks, and owner alerts are ready. |
| No Phase 3 dependency | Dataset ingestion remains blocked until ChatGPT/Drip review. |
| Production approval captured | Cutover is approved separately from this documentation task. |

## Rollback Plan

| Scenario | Rollback action |
| --- | --- |
| Public website issue | Restore DNS record to Squarespace hosting target or previous hosting target while investigating. |
| Form submission failure | Re-enable temporary Squarespace form or fallback contact path if previously approved. |
| Redirect issue | Restore `go.driphealthcare.com` to prior route target and pause further route cutovers. |
| Authenticated app issue | Keep app/admin DNS pointed away from production until staging acceptance passes. |
| SEO/indexing issue | Restore key redirects/canonicals, resubmit sitemap, and monitor indexed URLs. |

Rollback requires the old Squarespace pages or prior hosting targets to remain available until the migration is accepted.

## What Must Be True Before Squarespace Is Retired

| Requirement | Exit condition |
| --- | --- |
| Replacement public pages live | Home, core marketing, contact, privacy/terms, and any active campaign/showcase pages are repo-controlled. |
| Forms migrated | No required operational intake depends on Squarespace forms or direct Sheets-only workflows. |
| Redirects mapped | Existing public/campaign redirects are preserved or intentionally retired. |
| DNS ownership clear | Registrar, DNS host, records, and rollback owner are documented. |
| SEO preserved | Sitemap, redirects, canonicals, metadata, and analytics are verified. |
| App surfaces separated | Admin/app/API/redirect surfaces are hosted in the Drip GitHub/GCP architecture. |
| Stakeholder approval | Drip approves retirement and confirms no current Squarespace-only workflow remains. |

## Phase 2.1 Acceptance

This phase is complete when the plan is reviewed, the docs identify the temporary role for Squarespace, and Phase 3 remains blocked until ChatGPT/Drip review. It does not approve or perform production hosting, DNS, Squarespace, or app/API changes.
