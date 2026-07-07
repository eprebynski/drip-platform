# Phase 2.9: Sanitized Migration Review Packets

## Scope

Phase 2.9 adds local-only tooling that turns already-drafted sanitized summaries and safe local evidence into human review packets for migration planning. It does not deploy, modify DNS, modify Squarespace, modify website pages/forms/redirects, modify Apps Script or triggers, write to live Google Sheets, Firestore, BigQuery, Stripe, ScreenCloud, create production resources, use live credentials, connect to private APIs, pull live-system data, or start Phase 3 dataset ingestion.

## Command

```text
npm run evidence:review-packets
```

The command writes packets under:

```text
~/Documents/Drip/private-evidence/review-packets
```

The private evidence root must remain outside the repo. Packets are local/private and are not promoted into repo docs automatically.

## Generated Packets

- `active-routes-review-packet.md`
- `google-sheets-destinations-review-packet.md`
- `apps-script-review-packet.md`
- `squarespace-forms-review-packet.md`
- `analytics-search-console-review-packet.md`
- `migration-blockers-review-packet.md`

Each packet includes evidence boundary, safe findings, actionable migration questions, retain/rebuild/redirect/retire/unknown planning tables, production dependencies, redaction concerns, remaining `UNKNOWN` fields, manual verification steps, Phase 3 readiness impact, and a raw-evidence warning.

## Status Reporting

`npm run evidence:status` now reports:

- review packets present
- review packets needing manual review
- `npm run evidence:review-packets` as the recommended next command when summaries exist but packets are missing

## Safety

The packet builder reads sanitized summaries, selected manifests, safe redacted copies, and the sanitized Sheets audit file when present. It omits secrets, tokens, cookies, private deployment IDs, raw form responses, private screenshots, customer data, order data, and payment data. Unverified facts remain `UNKNOWN`.

Production impact remains `NONE`, and Phase 3 started remains `NO`.

## Acceptance Checks

- `npm run evidence:review-packets` creates all six packets locally.
- `npm run evidence:status` reports packet presence and manual-review needs.
- Existing `evidence:scan`, `evidence:draft-summaries`, and `evidence:status` still work.
- Dotfiles, `.DS_Store`, and README files remain ignored.
- Repo secret-pattern scan is clean.
- No production systems are changed.

## Codex Review Queue Item

Phase: Phase 2.9

Title: Sanitized Migration Review Packets

Summary: Adds local-only tooling that generates six sanitized migration review packets from already-drafted sanitized summaries and safe local evidence. The packets organize route, Sheets, Apps Script, Squarespace forms, analytics/Search Console, and migration blocker review questions without copying raw sensitive evidence.

Production impact: None. No deploys, DNS changes, Squarespace changes, Apps Script changes, live credentials, private API calls, live-system writes, raw evidence commits, or Phase 3 dataset ingestion.

Unresolved blockers: All packets still require Drip/ChatGPT manual review. `UNKNOWN` fields must stay unresolved until verified from private evidence.

Approvals needed: Drip/ChatGPT approval before trusting packet findings, promoting sanitized findings, changing production systems, retiring Squarespace surfaces, or starting Phase 3.

Recommended next Codex prompt:

```text
Review Phase 2.9 with Drip and ChatGPT; run npm run evidence:review-packets locally, review all six packets, verify UNKNOWN fields from private evidence, approve or revise migration classifications, and do not start Phase 3 or change production systems.
```
