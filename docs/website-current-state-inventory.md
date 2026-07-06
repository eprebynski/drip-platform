# Website Current State Inventory

## Scope

Phase 2.2 is a read-only inventory for planning the Drip Healthcare migration away from Squarespace. No Squarespace admin access, DNS console access, Apps Script editor access, Google Sheets access, deploy access, or live credentials were used.

The inventory was collected on July 6, 2026 from public `GET` requests, the public sitemap and robots files, public DNS lookups, public RDAP data, and public page source. Fields that require private Squarespace, DNS, Apps Script, Sheets, analytics, commerce, or registrar access are marked `UNKNOWN`.

No production systems were changed.

## Evidence Sources

| Source | Read-only evidence collected | Production change |
| --- | --- | --- |
| `https://www.driphealthcare.com/` | Squarespace homepage, page source, navigation, static context, analytics ID, canonical host. | None |
| `https://www.driphealthcare.com/sitemap.xml` | 28 public sitemap URLs. | None |
| `https://www.driphealthcare.com/robots.txt` | Squarespace robots rules and sitemap pointer. | None |
| Public route fetches | Sitemap pages, `/cart`, and linked `/providers/control-center`. | None |
| Public DNS | A, CNAME, NS, SOA, MX, TXT, and `upload.driphealthcare.com` observations. | None |
| Public RDAP | Registrar and registration metadata for `driphealthcare.com`. | None |

## Public Platform Summary

| Area | Observation | Migration implication |
| --- | --- | --- |
| Current host | Public source and headers identify Squarespace; homepage uses Squarespace template 7.1 and primary `www.driphealthcare.com`. | Keep Squarespace live until replacement routes, forms, redirects, and rollback are approved. |
| Public pages | Sitemap lists 28 public URLs; all fetched routes returned 200 during inventory. | Build route-by-route rebuild, retain, retire, or redirect decisions. |
| Custom code | Several public pages call live Apps Script modes and `upload.driphealthcare.com`. | Do not cut over those pages until app/API parity exists and is reviewed. |
| Forms | Multiple standard Squarespace form blocks are visible; field lists and destinations are mostly not public. | Drip must export form configuration before migration. |
| Commerce | `/store` and `/cart` are live Squarespace commerce surfaces; `/cart` is noindex. | Retire only after product/order/payment decision and approval. |
| Analytics | Google Analytics measurement ID `G-GS2QQQCDFN` appears in public source. | Confirm owner, consent posture, and staging/prod split before cutover. |
| DNS | Apex and `www` point to Squarespace; Google Workspace MX exists; Google verification TXT records exist. | Preserve mail and verification records exactly during future DNS work. |

## Page Inventory

| URL/path | Status | Observed purpose | Forms/custom dependencies | Migration note |
| --- | --- | --- | --- | --- |
| `/` apex | 301 | Apex alias to `https://www.driphealthcare.com/`. | Squarespace hosting. | Preserve apex behavior during cutover. |
| `/` on `www` | 200 | Public home page. | Squarespace, GA, commerce/cart context. | Rebuild as repo-controlled public home. |
| `/newsfeed` | 200 | Newsroom/feed. | Squarespace assets. | Rebuild or retire with redirect decision. |
| `/medical-venue/home` | 200 | Medical venue landing. | `Doctor Home Page Questions`; YouTube/custom code observed. | Export form before migration. |
| `/scheduling` | 200 | Demo scheduling. | No public form observed. | Rebuild as request-demo or redirect. |
| `/new-business-recommendation-from-doctors` | 200 | Doctor recommendation intake. | `New Business Recommendation From Doctors`; destination `UNKNOWN`. | Move to API-backed intake. |
| `/contact` | 200 | Contact page. | `Doctor Contact Page Form 2`; `Doctor Contact Page Form 2 2`. | Export forms and rebuild. |
| `/patients` | 200 | Patient/therapist signup. | `Patient Signup`; `Therapist Signup`. | Drip decision needed on retain/retire. |
| `/employers/new-signup` | 200 | Employer/business signup. | `New Business Information`. | Move to advertiser/business intake. |
| `/doctor/terms-and-conditions` | 200 | Doctor/affiliate terms. | None observed. | Retain legal content after review. |
| `/medical-clinics` | 200 | Medical clinics/provider marketing. | YouTube and ScreenCloud references. | Rebuild provider marketing. |
| `/providers/new-signup` | 200 | Provider signup. | `New Medical Venue Signup Form`. | Move to provider onboarding/API. |
| `/terms-and-conditions` | 200 | General terms. | None observed. | Retain legal content after review. |
| `/employers` | 200 | Employer/community partner marketing. | YouTube/custom assets. | Rebuild or redirect to advertiser/business route. |
| `/healthcare-information` | 200 | Healthcare information content. | YouTube/custom assets. | Rebuild, archive, or redirect after content review. |
| `/ad-campaigns` | 200 | Advertising/campaign marketing. | `Employers Form`; `Video Campaigns`; `Business Advertising Campaign`. | Move submissions to advertiser dashboard/API. |
| `/providers/media-center` | 200 | Provider media center/directory. | Live Apps Script modes for directory, display preferences, logs, digital signage status/toggle. | High-risk dependency; replace with authenticated Media Center. |
| `/providers-2` | 200 | Alternate provider marketing. | YouTube and ScreenCloud references. | Consolidate with `/providers`. |
| `/vendors` | 200 | Vendor/advertiser marketing. | YouTube/custom assets. | Rebuild advertiser marketing. |
| `/providers` | 200 | Provider landing page. | Canonical appears to point to homepage; ScreenCloud refs. | Fix canonical/route strategy during rebuild. |
| `/rewards-program` | 200 | Provider rewards program. | None observed. | Rebuild or redirect based on product decision. |
| `/providers/revenue-sharing` | 200 | Provider revenue share signup. | `Providers Revenue Sharing Signup`. | Move to provider review flow. |
| `/new-provider-conference-event` | 200 | Conference event provider intake. | `New Provider Conference Event Form`. | Move to event/showcase admin intake. |
| `/vendors/conferences` | 200 | Conference sponsorship marketplace. | Live Apps Script modes for event JSON, org lookup, invoice creation. | Replace before cutover; billing risk. |
| `/redirect/conference-campaign` | 200 | Conference payment/campaign redirect. | Live Apps Script redirect/click tracking modes. | Replace with `go` redirect service after parity. |
| `/conference-campaign-submit` | 200 | Campaign manager/submission. | Custom `drip-conf-form`; Apps Script modes; `upload.driphealthcare.com/upload`. | Replace with authenticated campaign flow. |
| `/conference-campaign-preview` | 200 | Single-purchase conference preview. | Live Apps Script showcase JSON mode. | Replace with showcase preview/API. |
| `/conference-showcase` | 200 | Public conference showcase. | Live Apps Script showcase JSON mode. | Rebuild as `showcase` route or subdomain. |
| `/redirect/patient-campaign` | 200 | Patient/video QR redirect. | Live Apps Script QR mode with ScreenCloud UTM metadata. | Replace with `go` redirect service. |
| `/store` | 200 | Squarespace store. | Squarespace commerce. | Inventory products/orders before retire decision. |
| `/cart` | 200 noindex | Squarespace cart. | Squarespace commerce and Stripe country context. | Keep until commerce decision approved. |
| `/providers/control-center` | 404 | Publicly linked but not live. | Squarespace 404. | Remove or redirect after owner approval. |

## Form Inventory

| Page | Form name or ID | Public field status | Destination/storage | Replacement direction |
| --- | --- | --- | --- | --- |
| `/medical-venue/home` | `Doctor Home Page Questions` | `UNKNOWN`; public source exposes form name only. | `UNKNOWN`; requires Squarespace export. | Provider/venue intake API or retire. |
| `/new-business-recommendation-from-doctors` | `New Business Recommendation From Doctors` | `UNKNOWN` | `UNKNOWN`; check Squarespace, Sheets, Apps Script routing. | Business recommendation intake flow. |
| `/contact` | `Doctor Contact Page Form 2` | `UNKNOWN` | `UNKNOWN` | Public contact endpoint. |
| `/contact` | `Doctor Contact Page Form 2 2` | `UNKNOWN` | `UNKNOWN` | Public contact endpoint. |
| `/patients` | `Patient Signup` | `UNKNOWN` | `UNKNOWN` | Retain only if Drip confirms patient intake purpose. |
| `/patients` | `Therapist Signup` | `UNKNOWN` | `UNKNOWN` | Retain only if Drip confirms therapist workflow. |
| `/employers/new-signup` | `New Business Information` | `UNKNOWN` | `UNKNOWN` | Advertiser/business onboarding API. |
| `/providers/new-signup` | `New Medical Venue Signup Form` | `UNKNOWN` | `UNKNOWN` | Provider onboarding/API. |
| `/ad-campaigns` | `Employers Form` | `UNKNOWN` | `UNKNOWN` | Advertiser intake/review queue. |
| `/ad-campaigns` | `Video Campaigns` | `UNKNOWN` | `UNKNOWN` | Campaign submission flow. |
| `/ad-campaigns` | `Business Advertising Campaign` | `UNKNOWN` | `UNKNOWN` | Campaign submission flow. |
| `/providers/revenue-sharing` | `Providers Revenue Sharing Signup` | `UNKNOWN` | `UNKNOWN` | Provider revenue-share review flow. |
| `/new-provider-conference-event` | `New Provider Conference Event Form` | `UNKNOWN` | `UNKNOWN` | Event/showcase admin intake. |
| `/conference-campaign-submit` | Custom `drip-conf-form` | Public fields include campaign name, video URL, image file, landing URL, headline, description, CTA, contact name, contact email, and query-derived hidden IDs. | Live Apps Script JSONP plus upload endpoint; exact token intentionally not repeated. | Authenticated advertiser dashboard/campaign submission flow. |

## Script/Embed Inventory

| Area | Public evidence | Risk | Migration action |
| --- | --- | --- | --- |
| Squarespace platform scripts | Template 7.1, Squarespace assets, static context, forms, commerce scripts. | Medium | Replace with repo-owned frontend assets. |
| Google Analytics | `G-GS2QQQCDFN` appears in public source. | Medium | Confirm owner, consent, staging/prod separation. |
| Facebook app context | Public Squarespace context includes Facebook app ID. | Low/Medium | Confirm social integrations needed. |
| Fonts/assets | Typekit, Google Fonts, Squarespace CDN images/assets. | Medium | Export licensed assets and rebuild asset pipeline. |
| YouTube embeds | Observed on provider/employer/healthcare pages. | Medium | Inventory video URLs and owners. |
| ScreenCloud references | Observed on provider/media/QR pages. | High | Preserve display abstraction; no live writes. |
| `/providers/media-center` custom code | Live Apps Script modes for directory, videos, campaigns, display preferences, logs, and digital signage toggles. | High | Replace with authenticated Media Center APIs and review gates. |
| `/vendors/conferences` custom code | Live Apps Script modes for conference events, org lookup, invoice creation. | High | Replace with advertiser/event workflow; verify Stripe/email behavior. |
| `/redirect/conference-campaign` custom code | Live Apps Script invoice redirect and click tracking modes. | High | Replace with billing-safe redirect service. |
| `/conference-campaign-submit` custom code | Live Apps Script manager/submit/edit/archive/order modes and upload endpoint. | High | Replace with authenticated campaign manager and content safety checks. |
| `/conference-campaign-preview` and `/conference-showcase` | Live Apps Script showcase JSON mode. | High | Replace with showcase API and static/hybrid frontend. |
| `/redirect/patient-campaign` custom code | Live Apps Script QR mode with ScreenCloud UTM metadata. | High | Replace with `go` redirect service and event logging. |

The active public Apps Script web-app URL appears in page source. This document records dependency patterns and modes but does not repeat the deployment token in repo docs.

## Redirect Inventory

| Source route | Observed behavior | Destination | Replacement owner |
| --- | --- | --- | --- |
| `http://driphealthcare.com` and `https://driphealthcare.com` | Redirect to `https://www.driphealthcare.com/`. | `www` Squarespace site. | Hosting/DNS cutover owner. |
| `/redirect/conference-campaign?flow=conference-sponsor-payment...` | Browser redirects through live Apps Script payment redirect mode. | Apps Script, then likely Stripe/payment page. | BillingService and RedirectService. |
| `/redirect/conference-campaign?cid=...` | JSONP click tracking, then redirect to campaign landing URL. | Apps Script-selected destination. | RedirectService. |
| `/redirect/patient-campaign?...` | JSONP QR redirect with ScreenCloud UTM values. | Apps Script-selected destination. | RedirectService. |
| `/conference-campaign-submit` preview action | Opens `/conference-campaign-preview` with purchase/event/org query params. | Squarespace preview route. | Showcase/API owner. |
| `/cart` | Live Squarespace cart route, noindex. | Squarespace commerce. | Billing/commerce owner. |
| `/providers/control-center` | Publicly linked but returns 404. | Squarespace 404 page. | Product/website owner. |
| Squarespace redirect settings | `UNKNOWN`; requires Squarespace admin export. | `UNKNOWN` | Website migration owner. |

## Asset Inventory

| Asset area | Public evidence | Export need |
| --- | --- | --- |
| Logo/favicon | Drip logo and favicon served from Squarespace CDN. | Export originals and confirm license/source file. |
| Marketing images | Lobby, therapy, doctor/patient, clinic, target/performance, and analytics imagery observed. | Export originals, filenames, alt text, and rights. |
| Provider/media assets | Provider print media, website snapshots, operations and revenue imagery. | Export and map to replacement pages. |
| Compliance/feature icons | HIPAA, SOC 2, GDPR, FHIR, QR, checkmark, and dollar icons observed. | Confirm claims and legal approval before reuse. |
| Conference/showcase campaign images | Dynamic records returned by Apps Script; exact records `UNKNOWN`. | Export from Apps Script/Sheets/storage before cutover. |
| Upload endpoint assets | `upload.driphealthcare.com/upload` is used for campaign image upload. | Inventory backend, storage, moderation, retention, rollback. |
| PDFs/downloads | `UNKNOWN`; not proven from public crawl. | Export Squarespace files/downloads list. |

## SEO/Analytics Inventory

| Area | Current public evidence | Needed before cutover |
| --- | --- | --- |
| Canonical host | `www.driphealthcare.com` is primary; apex redirects to `www`. | Decide final apex vs `www` canonical. |
| Sitemap | 28 sitemap URLs observed. | Rebuild sitemap and redirect map. |
| Robots | Squarespace robots disallows admin/config/search/account/api/static/query variants and points to sitemap. | Rebuild robots for new host and preserve noindex rules where needed. |
| Homepage meta description | Public description describes Drip Healthcare digital signage and partnerships. | Review copy and metadata for every rebuilt page. |
| `/providers` canonical | Public page canonical appears to point to homepage. | Decide self-canonical, merge, or redirect. |
| `/cart` | Public cart route has `NOINDEX`. | Preserve noindex if cart remains, or retire with redirect. |
| Analytics | Google Analytics measurement ID `G-GS2QQQCDFN` observed. | Confirm property owner, consent requirements, staging/prod tracking split. |
| Search Console verification | Public DNS has Google verification TXT records; exact values not repeated here. | Preserve exact TXT values from DNS export. |
| Redirect/UTM tracking | Patient QR and conference redirects track source/clicks. | Preserve UTM/event schema in RedirectService. |

## DNS/Registrar Inventory

| Record/dependency | Public observation | Migration requirement |
| --- | --- | --- |
| Registrar | RDAP lists Squarespace Domains LLC. | Confirm account owner, billing owner, MFA/recovery, and transfer policy. |
| Registration dates | Created 2023-03-23; expires 2027-03-23 per RDAP. | Confirm renewal status and owner email in registrar portal. |
| Domain statuses | Client delete/transfer/update prohibited. | Plan unlock/transfer only if needed; no change in Phase 2.2. |
| Nameservers | NSOne and Squarespace DNS nameservers observed. | Export authoritative DNS zone before any change. |
| SOA | Public SOA observed from NSOne; SOA pool differs from NS list and must be confirmed. | Treat as export-required discrepancy. |
| Apex A | Four Squarespace IPs observed: `198.185.159.145`, `198.49.23.144`, `198.49.23.145`, `198.185.159.144`. | Preserve until approved hosting cutover. |
| `www` | CNAME to `ext-sq.squarespace.com`; resolves to Squarespace IPs. | Preserve until approved hosting cutover. |
| MX | Google Workspace MX records observed. | Preserve exactly; email must not be interrupted. |
| TXT | Google site verification TXT records observed; exact values not repeated here. | Preserve exact values from DNS export. |
| AAAA | No apex IPv6 record observed publicly. | Confirm in DNS export. |
| `upload.driphealthcare.com` | Public A record resolves to `8.233.96.119`. | Inventory hosting owner, API behavior, storage, auth, and rollback. |
| DKIM/SPF/DMARC | `UNKNOWN` from limited public lookup set. | Export all TXT/CNAME mail-auth records before cutover. |

## Dependency Inventory

| Dependency | Evidence | Owner/status | Cutover need |
| --- | --- | --- | --- |
| Squarespace hosting | Server headers and page source identify Squarespace. | Current public website platform. | Keep until replacement pages pass staging. |
| Squarespace forms | Multiple public forms exposed by page source. | Destinations/notifications `UNKNOWN`. | Export fields, storage, notifications, automations. |
| Squarespace commerce | `/store` and `/cart` are live. | Product/order/payment details `UNKNOWN`. | Export settings/orders/products before retirement. |
| Apps Script web app | Public custom code calls live Apps Script modes. | Active operational dependency. | Replace with Cloud Run/API services after parity. |
| Google Sheets | Not directly proven publicly; likely bridged by Apps Script based on prior context. | `UNKNOWN`; source verification required. | Export Apps Script/Sheet dependency map. |
| Upload service | `upload.driphealthcare.com/upload` used for campaign images. | Backend/storage `UNKNOWN`. | Inventory auth, moderation, storage, retention. |
| Stripe | Conference/payment routes and cart imply payment dependency. | Live access not used. | Replace with BillingService preview/approval flow. |
| ScreenCloud/display provider | Public content and QR UTM values reference display use. | Live access not used. | Preserve display-provider dry-run guard. |
| GA/Search Console | GA ID and verification records observed. | Ownership `UNKNOWN`. | Confirm owners and tracking migration plan. |
| Google Workspace email | MX records observed. | Active email dependency. | Preserve DNS records during cutover. |

## Rebuild/Retain/Retire Decision Table

| Surface | Recommendation | Reason |
| --- | --- | --- |
| Public home page | Rebuild | Core marketing should be repo-controlled. |
| Provider marketing pages | Rebuild/consolidate | Several overlapping provider routes exist. |
| Advertiser/vendor pages | Rebuild/consolidate | Future advertiser dashboard should own operational flows. |
| Contact/demo/scheduling | Rebuild | Move intake to future API-backed forms. |
| Legal pages | Retain content, rebuild route | Preserve terms with legal review. |
| Patient/therapist pages | Drip decision needed | Purpose and owner are `UNKNOWN`. |
| Squarespace standard forms | Replace or retire | Destinations and automations must be exported first. |
| Provider media center custom code | Replace | Current public page can mutate display preferences/signage via Apps Script. |
| Conference marketplace/custom pages | Replace | Current flow touches invoices, submissions, images, and showcase data. |
| QR/campaign redirects | Replace | Redirects need service logging, safety, rollback, and testability. |
| Store/cart | Drip decision needed | Commerce settings/orders/products must be inventoried. |
| `/providers/control-center` | Retire or redirect | Public link returns 404. |
| Squarespace registrar | Temporarily retain if easiest | Domain registration is separate from website hosting. |
| Squarespace DNS | Temporarily retain until cutover | DNS migration requires separate approval and full export. |

## Cutover Risk Table

| Risk | Impact | Mitigation |
| --- | --- | --- |
| Hidden Squarespace form destinations are not exported. | Lead intake or notifications can fail. | Export all forms, fields, storage, notifications, and connected Sheets before rebuild. |
| Apps Script modes are replaced without parity. | Campaign submissions, invoices, redirects, display preferences, or showcase pages can break. | Inventory deployed Apps Script source and create parity tests before production route changes. |
| DNS cutover omits mail/verification records. | Email, Search Console, or verification can fail. | Preserve MX/TXT/CNAME records from authoritative export. |
| Upload service is not migrated. | Conference campaign image upload can fail. | Inventory `upload.driphealthcare.com` backend and storage. |
| Store/cart is retired without order/product decision. | Checkout or historical order access can break. | Export commerce configuration and get business approval. |
| Canonicals/redirects are not mapped. | SEO and indexed traffic can degrade. | Create route-by-route redirect and canonical map. |
| Public 404 link remains. | Users continue reaching dead control-center path. | Remove or redirect after owner approval. |
| Analytics ownership is not confirmed. | Traffic measurement can be lost or polluted. | Confirm GA/Search Console owners and staging/prod IDs. |
| Phase 3 starts before review. | Dataset work may proceed without website dependency decisions. | Keep Phase 3 blocked until ChatGPT/Drip review. |

## Manual Information Needed From Drip

| Needed item | How to collect safely |
| --- | --- |
| Squarespace pages export | Export page list, URLs, titles, navigation, disabled pages, SEO settings, and page settings without editing content. |
| Squarespace forms export | For every form block, export field list, validation, storage destination, notification recipients, Zapier/automation settings, and spam settings. |
| Custom code inventory | Export site header/footer injection, page-level code blocks, and code injection settings. |
| Redirect settings | Export URL, mappings/redirects from Squarespace settings. |
| Asset library | Export files/images/videos/PDFs and usage rights. |
| Commerce settings | Export products, services, SKUs, checkout/payment/tax/shipping settings, needed order history, and Stripe connection status. |
| DNS zone export | Export every DNS record with name, type, value, TTL, proxy/CDN status, and owner notes. |
| Registrar ownership | Confirm registrar account owner, MFA, renewal, billing, lock status, and recovery email. |
| Analytics/search ownership | Confirm GA property, Search Console property, tag managers, consent requirements, and owners. |
| Apps Script source/deployment | Provide deployed source, deployment IDs, web-app access settings, trigger list, and connected Sheet IDs in read-only form. |
| Google Sheets mapping | Map each website form/custom mode to its Sheet tab, notification owner, and downstream automation. |
| Route traffic | Export Search Console/analytics top routes and query params for at least the last 90 days. |

## Safe Manual Collection Steps

1. Create a read-only export folder outside production runtime systems.
2. Export Squarespace pages, navigation, forms, redirects, assets, commerce settings, and code injection without editing or publishing.
3. Export DNS records from the authoritative DNS host without changing TTLs or values.
4. Export registrar metadata screenshots or CSVs without unlocking or transferring the domain.
5. Export GA/Search Console route reports without changing tracking IDs.
6. Export Apps Script source, deployments, triggers, and connected Sheet IDs read-only; do not run scripts.
7. Export relevant Sheets schema/tab names read-only; do not edit cells or trigger recalculation workflows.
8. Mark all files with export date, owner, source system, and whether the data includes sensitive material.
9. Review exports with Drip and ChatGPT before any staging build, DNS task, or production cutover task.

## Current Blockers

| Blocker | Status |
| --- | --- |
| Squarespace admin page/form/settings export | `UNKNOWN` and required. |
| Authoritative DNS zone export with TTLs | `UNKNOWN` and required. |
| Apps Script deployed source and mode parity | `UNKNOWN` and required. |
| Google Sheets dependencies for forms/custom modes | `UNKNOWN` and required. |
| Store/cart business decision | `UNKNOWN` and required. |
| Analytics/Search Console ownership | `UNKNOWN` and required. |
| Upload service backend/storage owner | `UNKNOWN` and required. |
| Production cutover approval | Not requested; blocked. |
| Phase 3 dataset ingestion | Blocked until ChatGPT/Drip review. |
