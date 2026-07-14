# Phase 2.37 Phase 3 Blocker-Resolution Plan

## 1. Purpose

This document is a Phase 2 planning artifact created after completion of the 16 manual Apps Script workflow reviews and the expanded 16-workflow Phase 3 readiness tracker.

This is a blocker-resolution roadmap only.

- Phase 3 is not approved.
- No limited dry run is approved.
- No production writes are approved.
- No live system changes are approved.
- No private evidence, generated tracker output, customer data, private identifiers, raw logs, credentials, or screenshots are included here.

The goal is to convert the 16 workflow reviews into a clear, conservative next-step plan for resolving evidence gaps before any later Drip/ChatGPT discussion of Phase 3 eligibility.

## 2. Current Status

| Field | Status |
| --- | --- |
| Manual workflow areas reviewed | 16 of 16 |
| Phase 3 readiness tracker scope | Supports all 16 manual reviews |
| Overall gate recommendation | PHASE_3_BLOCKED |
| Phase 3 dry-run status | NOT_APPROVED |
| Readiness score | BLOCKED_PROGRESSING |
| Production impact | NONE |
| Phase 3 started | NO |
| Workflow dry-run eligibility | NO for all workflows |

Manual review completion means available sanitized evidence has been organized. It does not mean production behavior is verified, owners are assigned, rollback is tested, or any dry-run scope is approved.

## 3. Global Blockers Across All Workflows

| Blocker category | Why it matters | Evidence needed | Applies to which workflows | Current status |
| --- | --- | --- | --- | --- |
| Active handler/mode | Drip must know which Apps Script entry point or workflow mode is actually active before rebuilding behavior. | Sanitized handler map, mode map, and reviewer confirmation. | All 16 workflows | UNKNOWN |
| Production caller/route/form/trigger/job proof | A route, form, trigger, job, or admin action must be proven current before migration priority or replacement behavior can be trusted. | Sanitized caller inventory, route/form/trigger/job mapping, and traffic or ownership confirmation. | All 16 workflows | UNKNOWN or PARTIAL only |
| Current Sheet read behavior | Rebuild data models need to know which Sheets/tabs are read and when. | Sanitized Sheet/table map, read path summaries, and tab/schema confirmation. | All 16 workflows | UNKNOWN |
| Current Sheet write behavior | Any current write behavior must be known before designing replacements or dry-run guards. | Sanitized write-path summaries, destination map, write frequency, and owner confirmation. | All 16 workflows | UNKNOWN |
| Trigger/schedule/job behavior | Scheduled or event-driven behavior can create hidden production effects. | Sanitized trigger inventory, schedule map, job map, and disabled/test boundary confirmation. | All 16 workflows | UNKNOWN |
| Data schema and event model | Firestore, BigQuery, and Admin Dashboard models need stable fields and event semantics. | Sanitized field inventory, lifecycle states, event names, and relationship rules. | All 16 workflows | UNKNOWN |
| Source-of-truth decision | Drip must decide whether legacy Sheets, future app/API data, Firestore, BigQuery, or another service owns each record type. | Source-of-truth decision per workflow and per entity. | All 16 workflows | UNKNOWN |
| Owner/cutover decision | A named role must approve what changes, when it changes, and how it is monitored. | Owner role, approval path, review checklist, and cutover decision record. | All 16 workflows | UNKNOWN |
| Rollback path | Migration cannot proceed without a safe way to revert or pause. | Rollback steps, fallback system, stop conditions, and expected recovery time. | All 16 workflows | UNKNOWN |
| Rollback owner/test status | A rollback plan is not enough unless someone owns and tests it. | Rollback owner role, tabletop result, and non-production test evidence. | All 16 workflows | UNKNOWN |
| Live-system boundary | Phase 2 work must not cross into live Apps Script, Sheets, billing, display, email, redirect, upload, or production systems. | Boundary statement and command-level dry-run/write guard review. | All 16 workflows | BLOCKING until explicitly approved later |
| Phase 3 ingestion decision | No workflow data should enter Phase 3 ingestion until reviewed and approved. | Ingestion inclusion/exclusion decision and schema readiness review. | All 16 workflows | UNKNOWN and blocked |
| Explicit Drip/ChatGPT approval | Approval must be explicit before any future limited dry-run review. | Written approval with scope, exclusions, owner, rollback, and test plan. | All 16 workflows | NOT_APPROVED |

## 4. Workflow Blocker Matrix

| Workflow | Current review status | Partial evidence signals | Hard blockers | Primary risk | Suggested next evidence target | Early non-production design eligibility | Phase 3 dry-run eligibility |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Conference Campaigns | PARTIAL | Route/context signal only | Handler, caller proof, Sheet behavior, trigger behavior, owner, rollback, ingestion decision | Campaign routes and redirects could affect public campaign flows | Sanitized handler and route-owner map | YES, evidence/status design only | NO |
| Patient Campaigns | PARTIAL | Route/context signal only | Handler, caller proof, display dependency, QR logging, billing, revenue share, Sheet behavior, owner, rollback | Patient-facing campaign and downstream billing/display dependencies | Sanitized dependency map across campaign, QR, playback, display, and billing | YES, evidence/status design only | NO |
| Provider Campaigns | PARTIAL | No production-confirmed caller | Provider-facing route/caller proof, Sheet behavior, media/billing/admin dependencies, owner, rollback | Provider Media Center behavior could be mixed with other workflows | Sanitized Provider Media Center workflow split | YES, evidence/status design only | NO |
| ScreenCloud/display provider operations | PARTIAL | Display-provider dependency signal | Handler, caller, live provider behavior, Sheet behavior, external-system boundary, owner, rollback | External display provider mutation risk | Sanitized display-provider boundary and adapter behavior map | YES, read-only status design only | NO |
| Provider display preferences | PARTIAL | Display eligibility dependency signal | Handler, caller, Sheet/tab ownership, schema, form destinations, owner, rollback | Preference signals may affect patient campaign eligibility | Sanitized preference schema and eligibility decision map | YES, evidence/status design only | NO |
| Admin review workflows | PARTIAL | Admin route/context signal | Handler, active admin caller proof, Sheet behavior, approval states, owner, rollback | Admin actions could imply live campaign approval | Sanitized admin workflow state map | YES, evidence/gate design first | NO |
| Stripe invoicing | PARTIAL | Billing dependency planning signal | Handler, caller/webhook/manual trigger proof, Sheet behavior, Stripe boundary, owner, rollback | Billing and invoice mutation risk | Sanitized billing boundary and no-write dry-run design | NO for operations; YES for blocker status only | NO |
| Video/playback billing | PARTIAL | Playback metric dependency planning signal | Handler, job/source proof, playback log source, Sheet behavior, schema, owner, rollback | Playback metrics may feed billing or revenue share | Sanitized event model and source-of-truth decision | YES, event model design only | NO |
| Patient Campaign QR scan logging | PARTIAL | Route/context signal | Handler, redirect/logging behavior, Sheet behavior, event schema, owner, rollback | Redirect or scan logging could alter attribution | Sanitized QR event schema and route ownership map | YES, event/status design only | NO |
| Provider revenue share | PARTIAL | Route/context and planning signal only | Handler, caller/job/payment behavior, calculation logic, Sheet behavior, owner, rollback | Payment and revenue-share calculation risk | Sanitized calculation boundary and exclusion rules | NO for calculations; YES for blocker status only | NO |
| YouTube/playlist operations | PARTIAL | Planning/intake context only | Handler, playlist sync proof, URL read/write behavior, Sheet behavior, external-system boundary, owner, rollback | YouTube playlist mutation risk | Sanitized playlist read/write boundary map | YES, read-only status design only | NO |
| Provider signup | PARTIAL | Route/form-intake context only | Handler, caller/form/trigger/job behavior, record creation, welcome email dependency, owner, rollback | Onboarding could create users/orgs or send emails | Sanitized intake and record-creation map | YES, intake model design only | NO |
| Advertiser/vendor/employer signup | PARTIAL | Route/form-intake context only | Handler, caller/form/trigger/job behavior, org/user/billing setup, owner, rollback | Onboarding and billing setup risk | Sanitized intake and org/user creation map | YES, intake model design only | NO |
| QR redirects | PARTIAL | Route/context signal only | Handler, live route behavior, target map, logging behavior, owner, rollback | Redirect target changes could affect live QR traffic | Sanitized target-map inventory and fallback rules | YES, status/design only | NO |
| Market intelligence uploads | PARTIAL | Planning/upload context only | Handler, upload/import job, Sheet/storage behavior, schema, owner, rollback | File import or data mutation risk | Sanitized upload boundary and schema draft | NO for imports; YES for blocker status only | NO |
| Welcome emails | PARTIAL | Notification planning signal only | Handler, caller/trigger/job behavior, template/source, send boundary, Sheet behavior, owner, rollback | Live email sending risk | Sanitized notification trigger and no-send boundary map | YES, status/design only | NO |

## 5. Suggested Resolution Order

This order prioritizes low production-write risk, high architecture value, low billing/payment risk, low external-system mutation risk, and usefulness for Admin Dashboard v0.

1. Evidence/gate Admin Dashboard v0
2. Provider signup
3. Advertiser/vendor/employer signup
4. Provider display preferences
5. QR redirects
6. Admin review workflows
7. Patient Campaigns
8. Provider Campaigns
9. Conference Campaigns
10. YouTube/playlist operations
11. ScreenCloud/display provider operations
12. Patient Campaign QR scan logging
13. Video/playback billing
14. Stripe invoicing
15. Provider revenue share
16. Welcome emails
17. Market intelligence uploads

Provider and advertiser/vendor/employer signup come early because intake modeling has high architecture value and can be designed without live onboarding. Billing, revenue share, display-provider mutation, YouTube mutation, email sending, uploads, and market intelligence imports remain later because they carry higher external-system, financial, communication, or data mutation risk.

## 6. Non-Production Admin Dashboard v0 Scope

Admin Dashboard v0 should be internal-only and non-production. It should help Drip see what is blocked, what evidence exists, what owners are needed, and what must not proceed.

Allowed v0 areas:

- Evidence/gate status panel
- Manual review matrix
- Dependency matrix
- Blocker matrix
- Issue tracker
- Workflow detail pages
- Owner-needed flags
- Rollback-needed flags
- Phase 3 eligibility flags
- "Do not proceed" warnings

Explicitly excluded from Admin Dashboard v0:

- live campaign approval
- live provider onboarding
- live advertiser/vendor/employer onboarding
- live billing
- live invoice creation
- live revenue-share calculation
- live redirect changes
- live QR creation
- live email sending
- live ScreenCloud changes
- live YouTube changes
- live Sheet writes
- live Apps Script changes

## 7. Data Model Planning Sequence

This is a design sequence only. It does not approve ingestion, live reads, live writes, Firestore resources, BigQuery resources, or production services.

1. `workflow_reviews`
2. `workflow_blockers`
3. `evidence_sources`
4. `manual_review_decisions`
5. `phase_gates`
6. `admin_issues`
7. `organizations`
8. `users`
9. `provider_facilities`
10. `advertiser_profiles`
11. `provider_display_preferences`
12. `campaigns`
13. `redirects`
14. `events`
15. `billing_events`
16. `revenue_share_events`

The first six models support evidence, blockers, decisions, and gates. Entity models come next only as sanitized design drafts. Campaign, redirect, event, billing, and revenue-share models should remain blocked from ingestion until source-of-truth, schema, owner, and rollback decisions are explicitly approved.

## 8. Workflow-Specific Blocker Details

### Conference Campaigns

- Known partial evidence: route/context signal only.
- Unknowns that block migration: active handler, active production caller, Sheet read/write behavior, trigger behavior, route ownership, traffic priority, owner, rollback, ingestion decision.
- Evidence needed next: sanitized handler map, route-owner decision, Sheet read/write summary, trigger inventory, rollback plan.
- Owner decision needed: campaign owner and cutover approver.
- Rollback decision needed: fallback route/content behavior and rollback owner.
- Data model implications: campaign, redirect, event, gate, and admin issue drafts.
- Non-production design allowed? YES, evidence/status design only.
- Phase 3 dry-run allowed? NO.

### Patient Campaigns

- Known partial evidence: route/context signal only.
- Unknowns that block migration: active handler, caller proof, display eligibility, QR logging, playback billing, revenue-share dependency, Sheet behavior, trigger behavior, owner, rollback, ingestion decision.
- Evidence needed next: dependency map spanning campaign, display preference, QR, playback, billing, and revenue-share workflows.
- Owner decision needed: patient campaign owner and dependency owners.
- Rollback decision needed: campaign fallback, redirect fallback, and data-write rollback boundary.
- Data model implications: campaigns, redirects, events, billing events, revenue-share events, and phase gates.
- Non-production design allowed? YES, evidence/status design only.
- Phase 3 dry-run allowed? NO.

### Provider Campaigns

- Known partial evidence: provider-facing context exists, but production caller remains unconfirmed.
- Unknowns that block migration: active handler, specific public/admin caller, Provider Media Center workflow split, Sheet behavior, media dependency, billing dependency, owner, rollback.
- Evidence needed next: sanitized Provider Media Center workflow split and provider-campaign-specific caller map.
- Owner decision needed: provider campaign owner and media center owner.
- Rollback decision needed: provider-facing campaign disable/fallback path.
- Data model implications: campaigns, organizations, users, provider facilities, admin issues, and phase gates.
- Non-production design allowed? YES, evidence/status design only.
- Phase 3 dry-run allowed? NO.

### ScreenCloud/display Provider Operations

- Known partial evidence: display-provider dependency signal.
- Unknowns that block migration: active handler, live route/caller behavior, external provider write boundary, Sheet behavior, owner, rollback.
- Evidence needed next: sanitized display-provider boundary map and proof of read-only/dry-run adapter behavior.
- Owner decision needed: display operations owner.
- Rollback decision needed: display-provider fallback and no-write stop condition.
- Data model implications: placements, events, workflow blockers, and phase gates.
- Non-production design allowed? YES, read-only status design only.
- Phase 3 dry-run allowed? NO.

### Provider Display Preferences

- Known partial evidence: display eligibility dependency signal.
- Unknowns that block migration: active handler, production caller, Sheet/tab ownership, active form destinations, schema, owner, rollback.
- Evidence needed next: sanitized preference schema and eligibility decision map.
- Owner decision needed: provider preference owner and campaign eligibility approver.
- Rollback decision needed: eligibility fallback and preference source fallback.
- Data model implications: provider display preferences, provider facilities, campaigns, events, and phase gates.
- Non-production design allowed? YES, evidence/status design only.
- Phase 3 dry-run allowed? NO.

### Admin Review Workflows

- Known partial evidence: admin route/context and admin safety/status dependency signals.
- Unknowns that block migration: active handler, active admin caller, approval states, Sheet behavior, trigger behavior, owner, rollback.
- Evidence needed next: sanitized admin state map and approval workflow boundary.
- Owner decision needed: admin review owner and approval owner.
- Rollback decision needed: approval-state rollback and no-live-approval boundary.
- Data model implications: workflow reviews, manual review decisions, phase gates, admin issues, and campaign status drafts.
- Non-production design allowed? YES, evidence/gate design first.
- Phase 3 dry-run allowed? NO.

### Stripe Invoicing

- Known partial evidence: Stripe invoice dependency planning signal.
- Unknowns that block migration: handler, caller/webhook/manual trigger, Sheet behavior, invoice creation boundary, billing owner, rollback.
- Evidence needed next: sanitized billing boundary map and proof no invoice creation occurs in non-production planning.
- Owner decision needed: billing owner and finance approver.
- Rollback decision needed: no-invoice dry-run boundary and invoice fallback owner.
- Data model implications: billing events, organizations, campaigns, phase gates, and admin issues.
- Non-production design allowed? NO for billing operations; YES for blocker status only.
- Phase 3 dry-run allowed? NO.

### Video/Playback Billing

- Known partial evidence: playback metric dependency planning signal.
- Unknowns that block migration: handler, playback source, job/trigger behavior, Sheet behavior, event schema, billing dependency, owner, rollback.
- Evidence needed next: sanitized playback event model and source-of-truth decision.
- Owner decision needed: playback/billing metric owner.
- Rollback decision needed: metric import exclusion and billing-calculation stop condition.
- Data model implications: events, billing events, campaigns, workflow blockers, and phase gates.
- Non-production design allowed? YES, event model design only.
- Phase 3 dry-run allowed? NO.

### Patient Campaign QR Scan Logging

- Known partial evidence: route/context and QR event dependency signals.
- Unknowns that block migration: handler, redirect/logging behavior, Sheet behavior, event schema, owner, rollback.
- Evidence needed next: sanitized QR event schema and route ownership map.
- Owner decision needed: QR/logging owner.
- Rollback decision needed: logging disable/fallback and attribution rollback.
- Data model implications: redirects, events, campaigns, billing events, and phase gates.
- Non-production design allowed? YES, event/status design only.
- Phase 3 dry-run allowed? NO.

### Provider Revenue Share

- Known partial evidence: planning/context signal only.
- Unknowns that block migration: handler, caller/job/payment behavior, calculation method, Sheet behavior, billing dependency, owner, rollback.
- Evidence needed next: sanitized calculation boundary, exclusion rules, and source-of-truth decision.
- Owner decision needed: revenue-share owner and finance approver.
- Rollback decision needed: no-payment stop condition and calculation rollback owner.
- Data model implications: revenue-share events, billing events, organizations, campaigns, and phase gates.
- Non-production design allowed? NO for calculations; YES for blocker status only.
- Phase 3 dry-run allowed? NO.

### YouTube/Playlist Operations

- Known partial evidence: planning/intake context only.
- Unknowns that block migration: handler, playlist sync process, URL read/write behavior, Sheet behavior, external-system boundary, owner, rollback.
- Evidence needed next: sanitized YouTube read/write boundary and no-playlist-update guard.
- Owner decision needed: media/playlist owner.
- Rollback decision needed: no-update boundary and playlist fallback owner.
- Data model implications: media assets, campaigns, workflow blockers, and phase gates.
- Non-production design allowed? YES, read-only status design only.
- Phase 3 dry-run allowed? NO.

### Provider Signup

- Known partial evidence: route/form-intake context only.
- Unknowns that block migration: handler, caller/form/trigger/job behavior, organization/user creation, welcome-email dependency, Sheet behavior, owner, rollback.
- Evidence needed next: sanitized intake map, record-creation map, and no-email boundary.
- Owner decision needed: provider onboarding owner.
- Rollback decision needed: intake fallback and account-creation stop condition.
- Data model implications: organizations, users, provider facilities, evidence sources, and phase gates.
- Non-production design allowed? YES, intake model design only.
- Phase 3 dry-run allowed? NO.

### Advertiser/Vendor/Employer Signup

- Known partial evidence: route/form-intake context only.
- Unknowns that block migration: handler, caller/form/trigger/job behavior, organization/user creation, billing setup, Sheet behavior, owner, rollback.
- Evidence needed next: sanitized intake map and organization/user creation boundary.
- Owner decision needed: advertiser/vendor/employer onboarding owner.
- Rollback decision needed: intake fallback and billing setup stop condition.
- Data model implications: organizations, users, advertiser profiles, admin issues, and phase gates.
- Non-production design allowed? YES, intake model design only.
- Phase 3 dry-run allowed? NO.

### QR Redirects

- Known partial evidence: route/context signal only.
- Unknowns that block migration: handler, live route behavior, redirect target map, logging behavior, owner, rollback.
- Evidence needed next: sanitized target-map inventory, fallback rules, and route ownership confirmation.
- Owner decision needed: redirect/QR owner.
- Rollback decision needed: target rollback and no-live-redirect-change boundary.
- Data model implications: redirects, events, campaigns, workflow blockers, and phase gates.
- Non-production design allowed? YES, status/design only.
- Phase 3 dry-run allowed? NO.

### Market Intelligence Uploads

- Known partial evidence: planning/upload context only.
- Unknowns that block migration: handler, upload/import job, Sheet/storage behavior, schema, owner, rollback, ingestion eligibility.
- Evidence needed next: sanitized upload boundary, file handling rules, and schema draft.
- Owner decision needed: market intelligence data owner.
- Rollback decision needed: no-import stop condition and data deletion/restore boundary for future non-production tests.
- Data model implications: evidence sources, events, workflow blockers, and future dataset models only after approval.
- Non-production design allowed? NO for imports; YES for blocker status only.
- Phase 3 dry-run allowed? NO.

### Welcome Emails

- Known partial evidence: notification planning signal only.
- Unknowns that block migration: handler, caller/trigger/job behavior, template/source, send boundary, Sheet behavior, owner, rollback.
- Evidence needed next: sanitized notification trigger map and no-send boundary.
- Owner decision needed: communications/onboarding owner.
- Rollback decision needed: no-email send guard and template fallback owner.
- Data model implications: users, organizations, events, admin issues, and phase gates.
- Non-production design allowed? YES, status/design only.
- Phase 3 dry-run allowed? NO.

## 9. What Would Move A Workflow Toward Limited Dry-Run Review

A workflow cannot be considered for any later limited dry-run review until all of the following exist and are reviewed:

- handler/mode confirmed
- caller/route/form/trigger/job confirmed
- current read/write behavior confirmed
- schema confirmed
- source of truth selected
- no live mutation in dry-run
- rollback documented
- owner assigned
- private evidence reviewed
- Drip/ChatGPT explicit approval

Even after those conditions are met, a workflow would move only to a later review conversation. This document does not approve the dry run.

## 10. What Remains Prohibited

- no deploy
- no Apps Script edits
- no live Sheets writes
- no trigger changes
- no emails
- no invoices
- no Stripe changes
- no ScreenCloud changes
- no YouTube changes
- no redirect changes
- no QR creation
- no uploads/imports
- no revenue share calculation/payment
- no Phase 3 start

## 11. Recommended Next Phase 2 Actions

1. Merge this blocker-resolution plan only after review.
2. Create Admin Dashboard v0 product spec for evidence/gate/status only.
3. Create non-production data model draft for workflow review/blocker tracking.
4. Identify proposed owner categories for each workflow.
5. Create issue templates for blocker resolution.
6. Re-run tracker after new evidence appears.
7. Keep Phase 3 blocked.

## Phase 2.37 Safety Confirmation

| Field | Confirmation |
| --- | --- |
| Production impact | NONE |
| Live systems queried or modified | NO |
| Generated private tracker committed | NO |
| Raw private evidence committed | NO |
| Phase 3 started | NO |
| Limited dry run approved | NO |
| Apps Script modified | NO |
| Live Sheets modified | NO |
| External provider systems modified | NO |
