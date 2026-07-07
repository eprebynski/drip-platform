# Private Evidence Automation Kit

## Scope

Phase 2.4 adds local-only tooling for organizing private export evidence needed for Squarespace retirement and website migration planning. Phase 2.5 adds a local inbox workflow so Drip can place mixed exports/screenshots/PDFs/CSVs/TXT/Markdown/JSON/notes into one private folder, then classify and copy them into the right private evidence folders. Phase 2.6 adds a local public evidence collector that can prefill the private inbox with public/read-only website, DNS, and RDAP observations.

This kit does not deploy, modify DNS, modify Squarespace, edit website pages/forms/redirects, submit forms, modify Apps Script or triggers, write to live Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, create production resources, use live credentials, use browser cookies, connect to private APIs, access private admin consoles, pull private data from live systems, or start Phase 3 dataset ingestion.

## Default Private Folder

The default private evidence folder is:

```text
~/Documents/Drip/private-evidence
```

That folder is intentionally outside the GitHub repo. The scripts refuse to use a private evidence root inside the repo.

Use `--root <path>` or `DRIP_PRIVATE_EVIDENCE_DIR` only for local testing or an approved alternate private storage location.

## Commands

Run these from the repo root.

| Command | Purpose |
| --- | --- |
| `npm run evidence:open` | Opens the private evidence root folder locally. |
| `npm run evidence:open-inbox` | Opens the private `inbox/` folder locally. |
| `npm run evidence:create-folders` | Creates the private folder structure and README files. |
| `npm run evidence:create-templates` | Creates folders, README files, summary stubs, manifest template, and redaction checklist. |
| `npm run evidence:collect-public` | Collects public/read-only website, DNS, and RDAP evidence into `inbox/`. |
| `npm run evidence:collect-public:dry-run` | Exercises the collector without fetching public resources or performing DNS/RDAP lookups. |
| `npm run evidence:import` | Classifies and copies files from `inbox/` into evidence folders or `review-needed/`, then writes an import manifest. |
| `npm run evidence:status` | Writes a private status report showing inbox files, imported files, review-needed files, missing categories, summary status, review-packet status, and the recommended next command. |
| `npm run evidence:summary-stubs` | Creates blank sanitized-summary templates for each export category. |
| `npm run evidence:scan` | Non-destructively scans private evidence text files and writes a redaction report. |
| `npm run evidence:draft-summaries` | Drafts sanitized summary files from sanitized/private local evidence and redaction reports. |
| `npm run evidence:review-packets` | Drafts local-only migration review packets from sanitized summaries and safe local evidence. |

Each command supports:

```text
-- --root /path/to/private-evidence
```

Template commands also support:

```text
-- --force
```

The scanner also supports:

```text
-- --safe-redact
```

`--safe-redact` writes redacted copies under `redaction-reports/redacted-copies`. It never modifies raw files in place.

The importer also supports:

```text
-- --move
```

The default is copy-only. `--move` removes an inbox original only after a successful copy. It does not modify file contents or redact raw files.

## Folder Structure

| Folder | Purpose |
| --- | --- |
| `inbox/` | Drop downloaded exports, screenshots, PDFs, CSVs, TXT files, markdown files, JSON files, and notes here before local import. |
| `squarespace/` | Page, form, code injection, redirect, asset, and related Squarespace exports. |
| `dns-registrar/` | Registrar ownership and DNS zone exports. |
| `apps-script/` | Apps Script deployments, source/version maps, modes, triggers, and route maps. |
| `sheets/` | Sheets destinations, tab schemas, and downstream dependency notes. |
| `analytics-search-console/` | GA and Search Console ownership, sitemap, indexing, and route reports. |
| `commerce/` | Commerce products, checkout settings, order-retention needs, and payment settings summaries. |
| `upload-service/` | upload.driphealthcare.com backend, storage, auth, moderation, retention, and rollback evidence. |
| `screencloud/` | ScreenCloud references and display-provider dependency notes. |
| `active-routes/` | QR, campaign, conference, provider, advertiser, and showcase route evidence. |
| `sanitized-summaries/` | Blank or reviewed sanitized summary stubs. |
| `redaction-reports/` | Redaction scanner reports and optional safe redacted copies. |
| `manifests/` | Evidence manifest, import manifest, status report, and redaction checklist templates. |
| `review-needed/` | Files the inbox importer could not classify confidently enough for an evidence folder. |
| `review-packets/` | Local-only migration review packets for Drip/ChatGPT review. |

## Supported Evidence Categories

The generated sanitized-summary stubs cover:

| Category | Default folder |
| --- | --- |
| Squarespace pages and page settings | `squarespace/` |
| Squarespace forms, fields, destinations, notifications, storage, spam settings | `squarespace/` |
| Squarespace custom code/header/footer/page injection | `squarespace/` |
| Squarespace redirects/URL mappings | `squarespace/` |
| Squarespace assets/downloads/files/media | `squarespace/` |
| Squarespace commerce/products/orders/payment settings | `commerce/` |
| Domain registrar ownership | `dns-registrar/` |
| DNS zone export | `dns-registrar/` |
| Google Analytics | `analytics-search-console/` |
| Google Search Console | `analytics-search-console/` |
| Apps Script deployments/source/version mapping | `apps-script/` |
| Apps Script modes called by website pages | `apps-script/` |
| Google Sheets destinations used by forms/custom modes | `sheets/` |
| upload.driphealthcare.com backend/storage/auth/moderation/retention | `upload-service/` |
| ScreenCloud references | `screencloud/` |
| active QR/campaign/conference routes | `active-routes/` |

## Redaction Scanner

The scanner is non-destructive. It reads local text-like files under the private evidence root, skips `redaction-reports/`, and writes a timestamped Markdown report under `redaction-reports/`.

It looks for obvious sensitive patterns, including:

- API keys and generic key assignments.
- Stripe keys.
- OAuth tokens.
- Bearer tokens.
- Private keys.
- Apps Script deployment URLs and tokens.
- Google API keys.
- Webhook secrets.
- Email addresses.
- Phone numbers.
- Payment, order, and customer identifiers.
- DNS verification values.
- Signed URLs.
- Cookie and session values.

The report masks matched values. It recommends redaction but does not change raw evidence. If findings exist, the script exits non-zero to prevent accidental promotion of sensitive material.

## Inbox Importer

The inbox importer reads local files from:

```text
~/Documents/Drip/private-evidence/inbox
```

It classifies each file using filename, extension, and safe text sniffing for text-like files. It copies likely matches into `squarespace/`, `dns-registrar/`, `apps-script/`, `sheets/`, `analytics-search-console/`, `commerce/`, `upload-service/`, `screencloud/`, or `active-routes/`.

Low-confidence and unknown files go to `review-needed/`. The importer does not delete or modify inbox originals by default, does not call external APIs, does not use live credentials, does not redact raw files, and does not commit anything.

The importer deduplicates by file hash so repeated imports do not create unnecessary duplicate copies. Copied files receive an import-date and detected-category prefix. Each run writes an import manifest under `manifests/` with original path, copied path, category, confidence, classification reason, file hash, action, scan recommendation, and whether the related evidence category remains `UNKNOWN`.

Confidence is intentionally conservative:

| Confidence | Meaning |
| --- | --- |
| HIGH | Filename and text snippet both match one category. |
| MEDIUM | Filename or text snippet strongly matches one category. |
| LOW | Multiple categories match closely or only weak terms are present; file is sent to `review-needed/`. |
| UNKNOWN | No reliable match; file is sent to `review-needed/`. |

## Public Evidence Collector

`npm run evidence:collect-public` writes timestamped public evidence files into:

```text
~/Documents/Drip/private-evidence/inbox
```

The collector uses public GET requests only, does not use credentials, does not use cookies or saved sessions, does not access private admin consoles, does not submit forms, does not call Apps Script modes, and does not modify production systems. It refuses to use an evidence root inside the repo and writes only to `inbox/`.

Collected website evidence includes homepage HTML, `robots.txt`, `sitemap.xml`, sitemap page HTML snapshots, page inventory, route inventory, form inventory, script inventory, external link inventory, asset/media inventory, SEO/meta/canonical inventory, Apps Script reference snippets, upload host references, ScreenCloud references, Google Analytics/tag references, and active route candidates for campaign/conference/provider/vendor/advertiser-style paths.

Collected public DNS/domain evidence includes A, AAAA, CNAME, MX, TXT, SPF, DMARC, NS, SOA, and CAA lookup results for known Drip hosts, plus a public RDAP/domain JSON summary when available without credentials.

Useful local test options:

```text
-- --dry-run --skip-dns --skip-rdap
-- --base-url http://127.0.0.1:PORT --domain example.test --skip-dns --skip-rdap
```

The collector output is a prefill aid. It does not replace private Squarespace exports, registrar/DNS exports, Apps Script source/version mapping, Sheets destination maps, analytics/Search Console exports, commerce settings, upload-service ownership evidence, or Drip/ChatGPT review. Any private-source field remains `UNKNOWN` until verified from sanitized private evidence.

After collection, run:

```text
npm run evidence:import
npm run evidence:scan
npm run evidence:status
```

## Status Report

`npm run evidence:status` writes a local report under `manifests/` showing:

- files in `inbox/`
- files imported by category
- files needing review
- categories with no evidence yet
- sanitized summary files present, drafted, and needing review
- migration review packets present and needing review
- latest redaction report path
- recommended next local command

## Migration Review Packets

`npm run evidence:review-packets` writes six local-only packets under:

```text
~/Documents/Drip/private-evidence/review-packets
```

The packet builder reads sanitized summaries, selected manifests, safe redacted copies, and the sanitized Sheets audit file when present. It does not read from live systems, use credentials, call private APIs, or promote packet contents into repo docs.

Generated packets:

- `active-routes-review-packet.md`
- `google-sheets-destinations-review-packet.md`
- `apps-script-review-packet.md`
- `squarespace-forms-review-packet.md`
- `analytics-search-console-review-packet.md`
- `migration-blockers-review-packet.md`

Each packet keeps unresolved facts marked `UNKNOWN`, reports production impact as `NONE`, and keeps Phase 3 started as `NO`.

## Safe Workflow

1. Run `npm run evidence:create-templates`.
2. Optionally run `npm run evidence:collect-public` to prefill public/read-only evidence.
3. Run `npm run evidence:open-inbox`.
4. Download or drag exports/screenshots/PDFs/CSVs/TXT/Markdown/JSON/notes into `inbox/`.
5. Run `npm run evidence:import`.
6. Run `npm run evidence:scan`.
7. Review the redaction report in the private `redaction-reports/` folder.
8. Run `npm run evidence:draft-summaries` to draft sanitized summaries.
9. Run `npm run evidence:review-packets` to draft local migration review packets.
10. Run `npm run evidence:status` to see missing categories, summary status, review-packet status, and remaining review needs.
11. Review summaries and packets manually with Drip/ChatGPT.
12. Keep any unverified field marked `UNKNOWN`.
13. Commit only sanitized documentation after Drip/ChatGPT review.

## Git Safety

The repo `.gitignore` includes backup guards for accidental local folders named `private-evidence/`, `redaction-reports/`, and `sanitized-summaries/`. The primary protection is still the script guard that refuses private evidence roots inside the repo.

Never commit raw exports, secrets, tokens, form responses, customer data, order data, payment data, private DNS tokens, Apps Script deployment tokens, or live credentials.

## Phase 3 Gate

This kit does not unblock Phase 3 by itself. Phase 3 remains blocked until Drip and ChatGPT review sanitized evidence summaries and explicitly approve a next dataset-ingestion prompt.
