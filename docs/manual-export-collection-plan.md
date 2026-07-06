# Manual Export Collection Plan

## Scope

Phase 2.3 defines how Drip should collect private-source evidence needed to complete the Squarespace retirement and website migration inventory. This is documentation and evidence-intake planning only.

No production systems are changed in this phase. No DNS, Squarespace, website pages, forms, redirects, Apps Script, triggers, Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, production resources, live credentials, or Phase 3 dataset ingestion work is authorized here.

Phase 2.2 used only public evidence. Any private-source field remains `UNKNOWN` until Drip exports or provides evidence and the finding is summarized in sanitized documentation.

## Private Evidence Handling Policy

| Policy | Requirement |
| --- | --- |
| Do not commit secrets | Live credentials, API keys, private tokens, cookie values, OAuth tokens, Stripe keys, DNS provider tokens, and Apps Script deployment tokens must not be committed. |
| Redact private tokens | Replace tokens and deployment IDs with stable labels such as `REDACTED_APPS_SCRIPT_DEPLOYMENT_1`. |
| Redact customer/order/payment data | Raw order exports, payment records, invoices, customer emails, addresses, phone numbers, and payment IDs stay outside the repo unless aggregated and sanitized. |
| Redact personal data by default | Names, emails, phone numbers, form responses, and free-text messages should be removed unless a specific migration decision requires a minimal sample. |
| Store raw exports outside the repo | Sensitive exports should live in a Drip-controlled private evidence folder or vault, not in Git. |
| Commit sanitized summaries only | Repo docs should record source, export date, owner, decision, dependencies, and redacted identifiers, not raw private data. |
| Keep unknowns explicit | If a field is not verified from evidence, keep it marked `UNKNOWN`; do not infer from screenshots, memory, or public behavior alone. |
| Use least access | Prefer read-only account access, screenshots, CSV exports, or sanitized manifests over admin sessions or writable credentials. |

## Evidence Storage And Intake

| Evidence class | Storage location | Repo handling | Notes |
| --- | --- | --- | --- |
| Sanitized manifests | May be summarized in `docs/` after review. | Commit only non-sensitive findings. | Include export date, source system, owner, and reviewer. |
| Raw Squarespace exports | Drip private evidence folder outside the repo. | Do not commit raw exports if they include form settings, notifications, private URLs, customer data, or tokens. | Codex should consume only sanitized summaries unless Drip explicitly provides a redacted file. |
| Raw DNS zone exports | Drip private evidence folder outside the repo. | Commit record inventory only after verification and redaction of private verification values if needed. | Preserve exact values outside repo for future cutover runbook. |
| Raw Apps Script and Sheets evidence | Drip private evidence folder outside the repo. | Commit mode names, owners, route mappings, and parity status only. | Do not commit deployment tokens, Sheet IDs if sensitive, script properties, secrets, or form responses. |
| Analytics/Search Console exports | Drip private evidence folder outside the repo. | Commit route-level aggregate findings only. | Avoid user-level analytics exports. |
| Commerce/order exports | Drip private evidence folder outside the repo. | Commit sanitized product/settings summary only. | Remove order/customer/payment data before any repo summary. |

## Manual Export Checklist

| Export category | Owner | Access needed | Exact export steps | Safe file format | Sensitive values to redact | Evidence storage | How Codex should consume | Blocks Squarespace retirement | Blocks Phase 3 | Rollback relevance |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Squarespace page list and page settings | Drip website owner | Read-only Squarespace admin or exported settings screenshots | Export all pages, URLs, slugs, navigation status, disabled pages, page titles, SEO titles/descriptions, canonicals, page passwords, and page-level code/settings. | CSV, PDF print, or redacted screenshots plus manifest. | Private page passwords, unpublished sensitive copy, customer data in page blocks. | Private evidence folder; sanitized route table may be committed. | Update page inventory, rebuild/retain/retire decisions, SEO map, and redirect plan. | Yes | No, unless pages contain dataset intake dependencies. | High; identifies routes to restore or redirect if cutover fails. |
| Squarespace form list, fields, destinations, notifications, storage, spam settings | Drip website owner and operations owner | Read-only Squarespace form settings access | For each form block, capture form name, page, fields, required flags, validation, hidden fields, storage destination, email notifications, integrations, spam controls, and confirmation behavior. | CSV or redacted PDF/screenshots per form. | Notification emails if private, form response data, customer/patient details, tokens in webhook URLs. | Private evidence folder; sanitized form dependency map may be committed. | Yes | Maybe; blocks Phase 3 if form outputs feed datasets or market-intelligence inputs. | High; supports temporary form fallback and intake verification. |
| Squarespace custom code/header/footer/injection settings | Drip website owner and engineering owner | Read-only Squarespace code injection/page code access | Export site-wide header/footer injection, page-level code blocks, embed blocks, script tags, external URLs, mode names, and pages using custom code. | Redacted text file, CSV inventory, or PDF/screenshots. | Apps Script deployment tokens, API keys, auth tokens, webhook secrets, private URLs. | Private evidence folder; sanitized dependency inventory may be committed. | Yes | Maybe; blocks Phase 3 if scripts feed datasets or automation. | High; identifies scripts to restore or disable during rollback. |
| Squarespace redirects/URL mappings | Drip website owner | Read-only Squarespace URL mappings/settings access | Export every redirect/source, destination, status behavior if visible, wildcard rule, disabled rule, and owner note. | CSV or redacted settings export/screenshots. | Private destinations, campaign tokens, signed URLs. | Private evidence folder; sanitized redirect map may be committed. | Yes | No | Critical; rollback depends on preserving public and campaign routes. |
| Squarespace assets/downloads/files/media | Drip website owner and brand/content owner | Read-only Squarespace asset library access | Export file list, image/video/PDF URLs, page usage, alt text, original filenames, upload dates, and license/rights notes. | CSV manifest plus exported files in private folder. | Private files, file URLs with tokens, personal data in images/PDFs. | Raw assets in private asset archive; sanitized manifest may be committed. | Update asset inventory, rebuild pages, and identify retire/replace assets. | Yes | No | Medium; supports restoring images/downloads after cutover. |
| Squarespace commerce/products/orders/payment settings | Billing owner | Read-only Squarespace commerce access | Export products/services, SKUs, prices, tax/shipping, checkout settings, payment processor status, order-history retention needs, and refund/fulfillment settings. | Redacted CSV/PDF summary; raw order exports outside repo only. | Customer data, order IDs if sensitive, payment IDs, Stripe/account tokens, addresses, emails. | Private billing evidence folder; sanitized commerce decision summary may be committed. | Summarize product/cart dependencies and business decision. | Yes, if `/store` or `/cart` remains needed. | No | High; preserves checkout/order access and rollback to Squarespace cart if needed. |
| Domain registrar account ownership | Domain owner or operations owner | Registrar admin read-only view or owner-provided screenshots | Capture registrar, account owner, renewal date, billing owner, domain lock status, MFA/recovery posture, transfer policy, and support contacts. | Redacted PDF/screenshots and owner attestation. | Account emails if private, recovery methods, support PINs, billing details. | Private domain evidence folder; sanitized ownership summary may be committed. | Update hosting/domain architecture and cutover approval owner. | Yes | No | Critical; needed for rollback and emergency support. |
| DNS zone export including A, CNAME, MX, TXT, SPF, DKIM, DMARC, verification records, TTLs | DNS owner or operations owner | Read-only DNS provider access | Export full authoritative zone with host, type, value, TTL, priority, routing/proxy status, and notes for mail, verification, DKIM/SPF/DMARC, upload, apex, and `www`. | Provider CSV export or redacted zone file. | Verification values, DKIM private material if present, provider tokens, internal notes with secrets. | Private DNS evidence folder; sanitized dependency table may be committed. | Yes | No | Critical; rollback and email preservation depend on exact records. |
| Google Analytics property ownership and current measurement IDs | Analytics owner | Read-only GA property/admin access | Capture account/property owner, measurement IDs, streams, filters, consent mode/tag setup, current traffic by route, and staging/prod separation decision. | CSV route report plus redacted screenshots. | User-level data, private owner emails, API tokens. | Private analytics evidence folder; aggregate route findings may be committed. | Yes | No | Medium; validates post-cutover traffic and tracking rollback. |
| Google Search Console ownership and sitemap/indexing data | SEO/analytics owner | Read-only Search Console access | Export property ownership, sitemap status, indexed pages, top pages/queries, coverage issues, and manual actions if any. | CSV exports and redacted screenshots. | User queries if sensitive, owner emails, verification token values. | Private SEO evidence folder; aggregate SEO findings may be committed. | Yes | No | High; supports redirect priorities and index recovery. |
| Apps Script deployment URLs and deployed source/version mapping | Apps Script owner and engineering owner | Read-only Apps Script project access | Export deployed web-app versions, deployment descriptions, access settings, active URLs with tokens redacted, version-to-source mapping, and deployment owner. | Redacted text/PDF inventory; source archive outside repo if sensitive. | Deployment tokens, script properties, credentials, Sheet IDs if sensitive. | Private Apps Script evidence folder; sanitized mode/source mapping may be committed. | Yes | Maybe; blocks Phase 3 if Phase 3 needs legacy dataset/source parity. | Critical; cutover and rollback require parity with deployed behavior. |
| Apps Script modes called by website pages | Apps Script owner and engineering owner | Read-only Apps Script source plus website script inventory | Map every public page route to Apps Script `mode`/action names, read/write classification, target Sheets/services, auth assumptions, and replacement service owner. | CSV mapping or redacted markdown summary. | Deployment tokens, secrets, private Sheet IDs, customer data. | Private evidence folder; sanitized mode map may be committed. | Yes | Maybe; blocks Phase 3 if modes produce dataset inputs. | Critical; rollback depends on knowing which modes must remain live. |
| Google Sheets destinations used by website forms | Operations owner and Apps Script owner | Read-only Sheets metadata access, not cell editing | Map every Squarespace form/custom mode to Sheet file, tab, columns, downstream formulas/triggers, notification owner, and retention need. | Redacted CSV schema/metadata; no row exports unless approved. | Sheet IDs if sensitive, form responses, personal data, emails, phone numbers. | Private Sheets evidence folder; sanitized schema/dependency map may be committed. | Yes | Yes, if Sheets feed dataset ingestion or market intelligence. | High; supports temporary Sheets bridge rollback. |
| `upload.driphealthcare.com` backend ownership, storage, auth, retention, moderation, and rollback | Engineering/operations owner | Read-only hosting/storage/config evidence from owner | Capture host provider, code owner, storage bucket/path, auth/rate limits, file types, retention, moderation/safety review, backup, rollback target, and logs owner. | Redacted architecture note and screenshots; storage listing summary. | Credentials, signed URLs, bucket tokens, uploaded customer images if private. | Private upload evidence folder; sanitized dependency summary may be committed. | Yes | No | High; campaign image upload rollback depends on storage and host owner. |
| ScreenCloud references embedded in public pages | Display operations owner | Read-only website source plus ScreenCloud/account owner confirmation | Inventory public pages/scripts/UTMs that reference ScreenCloud, display locations if needed, account owner, and whether any public route can affect display state. | Redacted CSV or markdown summary. | ScreenCloud credentials, screen IDs if sensitive, location data if private. | Private display evidence folder; sanitized dependency map may be committed. | Yes | No | Medium; prevents display-related regressions during website cutover. |
| Active QR/campaign/conference routes and traffic assumptions | Marketing/operations owner and analytics owner | Read-only route inventory, GA/Search Console, QR/campaign source records | Export active routes, query parameters, QR destinations, conference/showcase links, campaign landing URLs, route traffic, owner, expiration/retain decision, and criticality. | CSV route manifest and aggregate traffic report. | Customer/campaign private data, signed URLs, billing IDs, tokens. | Private route evidence folder; sanitized route/cutover priority table may be committed. | Yes | Maybe; blocks Phase 3 if routes feed dataset or market signals. | Critical; rollback needs exact high-traffic route behavior. |

## UNKNOWN Coverage Map

| Phase 2.2 `UNKNOWN` or evidence gap | Matching export category |
| --- | --- |
| Squarespace form fields, destinations, notifications, storage, spam settings | Squarespace form list, fields, destinations, notifications, storage, spam settings |
| Squarespace page settings, disabled pages, page SEO, page-level code | Squarespace page list and page settings |
| Squarespace redirect settings and URL mappings | Squarespace redirects/URL mappings |
| Squarespace files, PDFs, downloads, source media, and asset rights | Squarespace assets/downloads/files/media |
| Squarespace commerce products, orders, payment settings, store/cart decision | Squarespace commerce/products/orders/payment settings |
| Registrar account owner, renewal, MFA, lock, billing, and transfer policy | Domain registrar account ownership |
| Authoritative DNS records, TTLs, DKIM, SPF, DMARC, mail, verification, and host records | DNS zone export including A, CNAME, MX, TXT, SPF, DKIM, DMARC, verification records, TTLs |
| Google Analytics property owner, traffic by route, and measurement ID stewardship | Google Analytics property ownership and current measurement IDs |
| Search Console owner, sitemap status, indexed pages, and SEO issues | Google Search Console ownership and sitemap/indexing data |
| Deployed Apps Script source parity, deployment URL, version, access settings, and owner | Apps Script deployment URLs and deployed source/version mapping |
| Apps Script modes called by media center, conference, showcase, billing, campaign, and QR pages | Apps Script modes called by website pages |
| Google Sheets destinations and downstream dependencies for forms/custom modes | Google Sheets destinations used by website forms |
| `upload.driphealthcare.com` backend, storage, auth, moderation, retention, and rollback | `upload.driphealthcare.com` backend ownership, storage, auth, retention, moderation, and rollback |
| ScreenCloud/display references embedded in public pages | ScreenCloud references embedded in public pages |
| Active campaign, QR, conference, provider, advertiser, and showcase routes and traffic assumptions | Active QR/campaign/conference routes and traffic assumptions |

## Safe Collection Workflow

1. Assign an owner for each export category.
2. Create a private Drip evidence folder outside the repo with subfolders for Squarespace, DNS, registrar, Apps Script, Sheets, analytics, commerce, upload, display, and route traffic.
3. Export evidence read-only; do not publish, save changes, run scripts, alter DNS, update redirects, edit pages, change forms, or write to live Sheets.
4. Name each export with source system, category, owner, and export date.
5. Redact sensitive values before sharing with Codex or committing any summary.
6. Create a sanitized manifest that states what was exported, what remains `UNKNOWN`, what blocks Squarespace retirement, what blocks Phase 3, and what matters for rollback.
7. Have Drip and ChatGPT review the sanitized manifest before any follow-on implementation prompt.
8. Update repo docs only with verified sanitized findings.

## Phase 2.4 Automation Kit

Phase 2.4 adds local-only scripts and documentation in `docs/private-evidence-automation-kit.md` to help Drip create the private evidence folder structure, generate README files, create sanitized-summary stubs, create manifest and redaction checklist templates, and run non-destructive secret-pattern scans.

| Command | Purpose |
| --- | --- |
| `npm run evidence:create-folders` | Creates the private evidence folders and README files outside the repo. |
| `npm run evidence:create-templates` | Creates folders, README files, summary stubs, manifest template, and redaction checklist. |
| `npm run evidence:summary-stubs` | Creates blank sanitized-summary templates with `UNKNOWN` defaults. |
| `npm run evidence:scan` | Writes a private redaction report and recommends redaction without modifying raw files. |

The default private evidence folder is `~/Documents/Drip/private-evidence`. The scripts refuse to use a target inside this repository. Raw exports still stay outside Git, and unverified fields still remain `UNKNOWN`.

## Phase 2.5 Inbox Workflow

Phase 2.5 adds a local-only inbox workflow for easier private evidence intake. Drip can place downloaded exports, screenshots, PDFs, CSVs, TXT files, markdown files, JSON files, and notes into `~/Documents/Drip/private-evidence/inbox`, then run an importer that classifies and copies files into the most likely evidence folder.

| Command | Purpose |
| --- | --- |
| `npm run evidence:open` | Opens the private evidence root locally. |
| `npm run evidence:open-inbox` | Opens the private inbox folder locally. |
| `npm run evidence:import` | Copies inbox files into categorized private folders or `review-needed/`, deduplicates by hash, and writes an import manifest. |
| `npm run evidence:status` | Writes a private status report showing inbox files, imported files, review-needed files, missing evidence categories, `UNKNOWN` summaries, and the recommended next local command. |

Importer output remains private and outside the repo. It does not delete inbox originals by default, does not call external APIs, does not use live credentials, does not redact raw files automatically, and does not commit files. Low-confidence or unclassified evidence goes to `review-needed/` until a human reviews it.

The recommended evidence collection workflow is:

1. Run `npm run evidence:open-inbox`.
2. Download or drag all private exports and screenshots into `inbox/`.
3. Run `npm run evidence:import`.
4. Run `npm run evidence:scan`.
5. Review the private redaction report.
6. Run `npm run evidence:status`.
7. Fill sanitized summaries only.
8. Keep raw files outside the repo.
9. Keep `UNKNOWN` fields until verified.
10. Do not start Phase 3 from raw imports or importer output alone.

## Codex Intake Rules

| Situation | Codex behavior |
| --- | --- |
| Raw export contains secrets or personal data | Do not commit it; ask for a sanitized summary or redact before documenting. |
| Evidence is incomplete | Keep field `UNKNOWN` and list the exact missing export. |
| Evidence conflicts with public inventory | Record both sources, mark conflict unresolved, and request owner review. |
| Evidence suggests live production dependency | Add it to risk register and cutover blockers; do not modify the dependency. |
| Evidence identifies Phase 3 dependency | Keep Phase 3 blocked until Drip/ChatGPT review explicitly approves the next phase. |

## Phase 3 Gate

Phase 3 dataset ingestion remains blocked until Drip and ChatGPT review the sanitized Phase 2.3 evidence package. The minimum gate is:

| Gate | Required status |
| --- | --- |
| Form-to-Sheets/API dependencies | Known or explicitly marked non-blocking by Drip. |
| Apps Script modes and deployed source/version mapping | Known for website-touching routes, or blocking risk accepted by Drip. |
| DNS/registrar evidence | Exported and stored privately for future cutover planning. |
| Analytics/Search Console route priorities | Exported or explicitly deferred by Drip. |
| Upload, commerce, and route traffic dependencies | Known or explicitly retained in Squarespace until replacement. |
| Sensitive-data handling | Raw exports stored outside repo; sanitized summaries only. |

## Phase 2.3 Acceptance

Phase 2.3 is complete when this checklist exists, every Phase 2.2 `UNKNOWN` category has a matching safe export step, sensitive-data handling is documented, no production systems are changed, and Phase 3 remains blocked pending Drip/ChatGPT review.

## Phase 2.4 Acceptance

Phase 2.4 is complete when the local automation kit can create the private folder structure outside the repo, generate templates and redaction checklists, produce redaction reports, keep raw exports out of Git, preserve `UNKNOWN` defaults until verified, and pass local smoke checks without live credentials or production connections.
