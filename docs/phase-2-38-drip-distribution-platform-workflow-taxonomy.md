# Phase 2.38 Drip Distribution Platform Workflow Taxonomy

## 1. Purpose

This document is a Phase 2 planning artifact that expands the product architecture view beyond the 16 legacy Apps Script and Google Sheets workflow reviews.

The 16 reviewed workflows remain the migration-readiness control layer. They are used to track blockers, evidence gaps, owner needs, rollback needs, and Phase 3 gating.

This document defines the future Drip distribution platform workflow taxonomy. It is a product and architecture planning map for marketing, sales, acquisition, campaign operations, distribution, billing, analytics, support, compliance, integrations, and internal admin workflows.

This document does not approve Phase 3. It does not approve a limited dry run. It does not approve production writes, live system changes, live credentials, live queries, deployments, Apps Script edits, live Sheet changes, billing actions, display-provider actions, email sending, redirect changes, QR creation, uploads, or production resource creation.

## 2. Relationship To The 16 Legacy Workflows

| Legacy workflow | Future platform domain it maps into | Remains blocker-tracked migration workflow? | Should influence future product design? | Notes |
| --- | --- | --- | --- | --- |
| Conference Campaigns | Campaign product workflows; conference sponsorship workflows; QR / redirect / attribution workflows | YES | YES | Future design should separate event sponsorship inventory, campaign setup, redirect tracking, reporting, and public event pages. |
| Patient Campaigns | Campaign product workflows; advertising operations workflows; analytics / reporting workflows | YES | YES | Future design should model campaign lifecycle, targeting, creative review, placement eligibility, performance, and related attribution events. |
| Provider Campaigns | Campaign product workflows; provider-facing tools; advertising operations workflows | YES | YES | Provider Campaigns are advertiser campaigns shown to provider organization users in provider-facing surfaces. They are distinct from provider display preferences. |
| ScreenCloud/display provider operations | Digital signage / screen distribution workflows; integration / external system workflows | YES | YES | Future design should use a provider abstraction and preserve no-write/dry-run guardrails until explicitly approved. |
| Provider display preferences | Provider display preference workflows; advertising operations workflows | YES | YES | These are provider-side preference signals used for patient campaign display eligibility. |
| Admin review workflows | Internal admin / operations workflows; compliance / policy / safety workflows | YES | YES | Future admin design should separate evidence/gate review from live approval actions. |
| Stripe invoicing | Billing / payments workflows; integration / external system workflows | YES | YES | Future billing design must keep invoice creation and Stripe writes behind strict approval gates. |
| Video/playback billing | Analytics / reporting workflows; billing / payments workflows; digital signage / screen distribution workflows | YES | YES | Future design should separate playback evidence, billing events, and revenue events. |
| Patient Campaign QR scan logging | QR / redirect / attribution workflows; analytics / reporting workflows | YES | YES | Future design should define attribution events without changing live redirect behavior. |
| Provider revenue share | Provider revenue share workflows; billing / payments workflows | YES | YES | Future design should keep calculations and payouts blocked until finance approval, source-of-truth, and rollback are clear. |
| YouTube/playlist operations | Digital signage / screen distribution workflows; integration / external system workflows | YES | YES | Future design should distinguish playlist metadata, scheduling intent, and external writes. |
| Provider signup | Provider acquisition workflows; notifications / communications workflows | YES | YES | Future design should model provider organizations, facilities, users, onboarding steps, and communication boundaries. |
| Advertiser/vendor/employer signup | Advertiser/vendor/employer acquisition workflows; sales workflows; billing / payments workflows | YES | YES | Future design should model organization/profile setup, workspace access, and billing setup as separate gated flows. |
| QR redirects | QR / redirect / attribution workflows; integration / external system workflows | YES | YES | Future design should separate route inventory, target maps, fallback behavior, attribution, and live redirect changes. |
| Market intelligence uploads | Market intelligence workflows; analytics / reporting workflows | YES | YES | Future design should keep upload/import behavior blocked while allowing schema and review planning. |
| Welcome emails | Notifications / communications workflows; provider and advertiser onboarding workflows | YES | YES | Future design should separate notification intent, template state, recipient state, and send authorization. |

The legacy 16 are not the full product taxonomy. They are the current migration-control inputs. Future platform workflows may be added to the taxonomy without becoming migration-approved or Phase 3-approved.

## 3. Platform Workflow Domains

| Domain | Description | Example workflows | Primary users | Main entities | Key risks | Non-production design allowed? | Production behavior allowed now? |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Marketing workflows | Public acquisition and website conversion workflows. | Website page planning, landing pages, SEO, contact/demo intake, conversion tracking. | Marketing, sales, prospects. | Pages, forms, leads, campaigns, attribution events. | Public route changes, tracking errors, form routing mistakes. | YES | NO |
| Sales workflows | Prospect, opportunity, proposal, contract, and follow-up workflows. | Lead qualification, opportunity tracking, proposals, contract status, renewals. | Sales, operations. | Leads, accounts, opportunities, tasks, contracts. | Premature CRM source-of-truth decisions and private data handling. | YES | NO |
| Provider acquisition workflows | Provider organization, facility, user, and onboarding workflows. | Provider signup, facility setup, user invitation, onboarding checklist. | Providers, provider success, operations. | Organizations, facilities, users, onboarding tasks. | User/org creation, welcome emails, live form writes. | YES | NO |
| Advertiser/vendor/employer acquisition workflows | Buyer-side organization and workspace onboarding. | Signup, profile setup, advertiser workspace access, billing setup. | Advertisers, vendors, employers, sales, operations. | Organizations, users, advertiser profiles, billing accounts. | Billing setup, account creation, private intake data. | YES | NO |
| Campaign product workflows | Campaign lifecycle and product experience workflows. | Patient, Provider, and Conference Campaign creation, review, renewal, cancellation. | Advertisers, providers, admins. | Campaigns, creatives, packages, budgets, statuses. | Live campaign approval, targeting, refunds, billing dependencies. | YES | NO |
| Advertising operations workflows | Matching, placement, scheduling, inventory, monitoring, and issue workflows. | Placement eligibility, preference matching, scheduling, inventory, escalation. | Campaign operations, display operations. | Placements, schedules, preferences, issues, campaigns. | Incorrect eligibility, live display changes, under/over-delivery. | YES | NO |
| Digital signage / screen distribution workflows | Screen inventory, status, playlist, scheduling, and proof-of-play workflows. | Screen inventory, playlist assignment, provider adapter, proof-of-play intake. | Display operations, providers, admins. | Screens, placements, playlists, playback events. | ScreenCloud or YouTube mutation, stale playback data. | YES | NO |
| QR / redirect / attribution workflows | Redirect target, QR, scan, click, and attribution workflows. | QR generation, target management, scan logging, deduplication, reporting. | Campaign operations, marketing, analytics. | Redirects, QR codes, attribution events, campaigns. | Live redirect breakage, target mistakes, attribution errors. | YES | NO |
| Conference sponsorship workflows | Event inventory, sponsor slots, reservations, assets, invoicing, and reporting. | Event inventory, sponsorship slots, waitlists, asset submission, reporting. | Sales, sponsors, operations. | Events, sponsorship slots, sponsors, assets, invoices. | Public event changes, invoice actions, asset handling. | YES | NO |
| Provider display preference workflows | Provider-side display eligibility and preference workflows. | Preference setup, review, matching, eligibility flags. | Providers, provider success, campaign operations. | Provider facilities, preferences, campaigns, eligibility rules. | Incorrect campaign display eligibility or implied endorsement. | YES | NO |
| Billing / payments workflows | Billing account, invoice, payment, credit, refund, and hold workflows. | Billing setup, Stripe customer setup, invoice review, payment sync, refunds. | Billing, operations, advertisers. | Billing accounts, invoices, payments, credits, holds. | Stripe writes, invoice creation, financial accuracy. | YES for planning only | NO |
| Provider revenue share workflows | Provider revenue share calculation, statement, payout review, and adjustment workflows. | Eligible revenue calculation, share rates, statements, payouts, disputes. | Billing, providers, operations. | Revenue share events, statements, payout reviews, providers. | Payment calculation, payout accuracy, finance approval. | YES for planning only | NO |
| Customer support workflows | Support intake, escalation, resolution, and status tracking. | Support tickets, issue intake, billing/display/campaign issue handling. | Support, operations, providers, advertisers. | Tickets, issues, accounts, campaigns, statuses. | Private data, incorrect routing, unresolved live issues. | YES | NO |
| Internal admin / operations workflows | Admin review, issue, owner, rollback, and operational dashboard workflows. | Admin review queue, issue tracker, blocker tracking, dashboard views. | Admins, operations, engineering. | Reviews, issues, owners, blockers, gates. | Accidental live approvals or operational writes. | YES | NO |
| Evidence / gate / migration workflows | Migration evidence, blocker, decision, and phase gate workflows. | Manual review matrix, dependency matrix, blocker matrix, dry-run eligibility. | Drip, ChatGPT, engineering, operations. | Evidence sources, reviews, blockers, gates, decisions. | Treating partial evidence as production proof. | YES | NO |
| Analytics / reporting workflows | Performance, funnel, attribution, billing, revenue, market, and conference reporting. | Campaign, QR, landing page, playback, billing, sales, marketing reports. | Analytics, sales, operations, leadership. | Events, reports, metrics, campaigns, accounts. | Bad source data, privacy, premature ingestion. | YES | NO |
| Market intelligence workflows | Market list, enrichment, segmentation, scoring, and prioritization workflows. | Upload/import, target enrichment, market mapping, opportunity scoring. | Sales, marketing, analytics. | Market lists, prospects, categories, scores. | Upload/import mutation, stale sources, private data. | YES for planning only | NO |
| Compliance / policy / safety workflows | Policy review, healthcare advertising safety, privacy, terms, and audit workflows. | Campaign policy review, no-PHI guardrails, terms tracking, audit trails. | Compliance, admin, operations. | Policies, reviews, terms, audit events. | Policy gaps, privacy violations, implied endorsements. | YES | NO |
| Notifications / communications workflows | Email, reminder, status, and internal notification workflows. | Welcome emails, campaign updates, billing notices, renewal reminders. | Providers, advertisers, admins, support. | Notifications, templates, recipients, events. | Sending live emails, wrong recipients, private content. | YES for planning only | NO |
| Integration / external system workflows | External system adapters, bridges, jobs, and integration state workflows. | Stripe, ScreenCloud, YouTube, Sheets bridge, Firestore, BigQuery, Cloud Run jobs. | Engineering, operations, admins. | Integrations, jobs, credentials, sync states. | External writes, credential exposure, production mutation. | YES for planning only | NO |

## 4. Future Workflow Catalog

### Marketing Workflows

- Public website page management
- Provider landing page funnel
- Vendor/employer landing page funnel
- Conference/event landing page funnel
- SEO/content page planning
- Contact/demo request intake
- Website conversion tracking
- Marketing source attribution

### Sales Workflows

- Lead intake
- Lead qualification
- Provider prospect pipeline
- Vendor/employer prospect pipeline
- Conference sponsor prospect pipeline
- Sales opportunity tracking
- Proposal/quote generation
- Contract status tracking
- Sales follow-up tasks
- Renewal/upsell pipeline

### Provider Acquisition And Onboarding Workflows

- Provider signup
- Provider organization record creation
- Facility/location creation
- Provider user invitation
- Provider onboarding checklist
- Provider Control Center access
- Provider screen participation setup
- Provider display preference setup

### Advertiser/Vendor/Employer Acquisition Workflows

- Advertiser/vendor/employer signup
- Organization/profile creation
- Advertiser workspace access
- Vendor/employer profile setup
- Billing configuration setup
- Campaign access setup
- Marketplace/directory listing setup

### Campaign Product Workflows

- Patient Campaign creation
- Provider Campaign creation
- Conference Campaign creation
- Campaign package selection
- Campaign budget setup
- Campaign targeting setup
- Campaign creative upload
- Campaign creative review
- Campaign safety review
- Campaign status lifecycle
- Campaign renewal
- Campaign cancellation/refund workflow

### Advertising Operations Workflows

- Placement eligibility
- Provider display preference matching
- Campaign scheduling
- Campaign inventory management
- Digital signage placement management
- QR placement management
- Campaign performance monitoring
- Issue escalation

### Digital Signage / Screen Distribution Workflows

- Provider screen inventory
- Screen status monitoring
- Screen playlist assignment
- ScreenCloud/display provider adapter
- YouTube/provider playlist operations
- Patient screen content scheduling
- Right-rail QR display management
- Proof-of-play evidence intake

### QR / Redirect / Attribution Workflows

- QR code generation
- QR redirect target management
- Patient Campaign QR scan logging
- Conference Campaign redirect tracking
- Provider affiliate/referral redirect tracking
- Campaign landing page view tracking
- Attribution event deduplication
- Attribution reporting

### Conference Sponsorship Workflows

- Conference/event inventory intake
- Event profile management
- Sponsorship slot configuration
- Vendor sponsor reservation
- Hold/waitlist management
- Sponsorship invoice workflow
- Sponsorship asset submission
- Conference campaign reporting

### Billing / Payments Workflows

- Billing account setup
- Stripe customer setup
- Invoice review queue
- Invoice creation
- Payment status sync
- Promo/discount handling
- Refund/credit handling
- Subscription or screen fee offset
- Billing hold resolution

### Provider Revenue Share Workflows

- Eligible screen revenue calculation
- Provider share rate configuration
- Revenue share statement generation
- Payment threshold tracking
- Provider payout review
- Revenue share dispute/adjustment
- Provider screen subscription offset

### Customer Support Workflows

- Support ticket intake
- Campaign issue intake
- Provider issue intake
- Billing issue intake
- Screen/display issue intake
- Redirect/QR issue intake
- Escalation workflow
- Resolution tracking

### Internal Admin / Operations Workflows

- Admin review queue
- Campaign safety review
- Provider display preference review
- Billing review
- Issue tracker
- Owner assignment
- Rollback assignment
- Workflow blocker tracking
- Operational dashboard views

### Evidence / Gate / Migration Workflows

- Manual review matrix
- Dependency matrix
- Blocker matrix
- Phase gate tracker
- Evidence source registry
- Migration issue tracker
- Dry-run eligibility review
- Prohibited action guardrails

### Analytics / Reporting Workflows

- Campaign performance reporting
- QR scan reporting
- Landing page view reporting
- Screen playback reporting
- Provider revenue share reporting
- Billing reporting
- Sales funnel reporting
- Marketing funnel reporting
- Market opportunity reporting
- Conference sponsorship reporting

### Market Intelligence Workflows

- Market list upload/import
- Provider target list enrichment
- Vendor/employer target list enrichment
- DMA/state/market mapping
- Specialty/category mapping
- Conference targeting research
- Market opportunity scoring
- Prospect prioritization

### Compliance / Policy / Safety Workflows

- Campaign policy review
- Prohibited category screening
- Healthcare advertising safety review
- Provider non-endorsement guardrails
- Privacy/no-PHI guardrails
- Terms acceptance tracking
- Revenue share agreement tracking
- Audit trail planning

### Notifications / Communications Workflows

- Provider welcome emails
- Advertiser/vendor/employer welcome emails
- Campaign status notifications
- Billing notifications
- Issue/status notifications
- Internal admin notifications
- Renewal reminders
- Conference sponsorship reminders

### Integration / External System Workflows

- Stripe integration
- ScreenCloud/display provider integration
- YouTube integration
- Squarespace form/route integration
- Gmail/notification integration
- Google Sheets bridge
- Firestore operational data layer
- BigQuery analytics layer
- Cloud Run API/job layer
- Cloud Scheduler job layer
- Secret Manager integration

## 5. Workflow Ownership Model

Owner categories are roles, not individual people.

| Owner category | Likely domains |
| --- | --- |
| Product owner | Campaign product, Admin Dashboard, provider tools, advertiser tools, workflow taxonomy. |
| Operations owner | Internal admin, advertising operations, support escalation, blocker resolution. |
| Billing owner | Billing/payments, provider revenue share, invoice review, refunds/credits. |
| Display operations owner | Digital signage, ScreenCloud/display provider, YouTube/playlist operations, proof-of-play. |
| Campaign operations owner | Campaign setup, creative review, scheduling, placement, campaign issue escalation. |
| Provider success owner | Provider acquisition, onboarding, facilities, display preferences, provider support. |
| Advertiser/vendor success owner | Advertiser/vendor/employer acquisition, profile setup, campaign access, buyer support. |
| Sales owner | Lead intake, qualification, opportunity, sponsor pipeline, proposals, renewals. |
| Marketing owner | Public website, funnels, SEO/content, conversion tracking, marketing attribution. |
| Data/analytics owner | Reporting, attribution, event models, BigQuery planning, market intelligence. |
| Engineering owner | Integration boundaries, Cloud Run, Firestore, jobs, dry-run guards, workflow registry implementation. |
| Compliance/policy owner | Campaign safety, no-PHI guardrails, healthcare advertising policy, terms, audit trails. |

Every workflow should have one accountable owner category, optional supporting owner categories, and an explicit escalation path before it moves beyond planning.

## 6. Extensibility Rules For Adding New Workflows

- Every workflow must have a stable workflow ID.
- Every workflow must belong to one primary domain.
- Every workflow may declare related domains.
- Every workflow must declare user type, owner category, source of truth, read paths, write paths, external systems, risks, rollback, and phase gate.
- New workflows start as `PLANNING_ONLY`.
- No workflow becomes production-active without explicit Drip/ChatGPT approval.
- Billing, email, redirect, ScreenCloud, YouTube, Stripe, and upload workflows require stricter gates.
- All workflows must respect no-PHI guardrails.
- Any workflow that touches external systems must declare read-only, dry-run, and write boundaries separately.
- Any workflow that can affect money, public routes, provider display eligibility, campaign delivery, customer communication, or attribution must include an owner and rollback decision before build.
- Adding a future workflow to this taxonomy does not add it to Phase 3 scope.

## 7. Proposed Workflow Status Lifecycle

| Status | Meaning |
| --- | --- |
| PLANNING_ONLY | Workflow exists as a concept or taxonomy item only. |
| EVIDENCE_NEEDED | Workflow needs sanitized evidence before design assumptions can be trusted. |
| DESIGN_READY_NON_PRODUCTION | Workflow has enough sanitized planning context for mock/local design. |
| BLOCKED_BY_UNKNOWN_DEPENDENCIES | Workflow has unresolved dependency, owner, source-of-truth, or rollback blockers. |
| READY_FOR_OWNER_REVIEW | Workflow is ready for owner category review, not production execution. |
| READY_FOR_NON_PRODUCTION_BUILD | Workflow may be built with mock/local data and no live credentials. |
| READY_FOR_LIMITED_DRY_RUN_REVIEW | Workflow may be reviewed for possible future dry-run scope, but is not approved. |
| APPROVED_FOR_LIMITED_DRY_RUN | A later explicit approval would be required; no current workflow has this status. |
| READY_FOR_PRODUCTION_REVIEW | Workflow may be reviewed for production only after dry-run evidence and approvals. |
| APPROVED_FOR_PRODUCTION | A later explicit production approval would be required; no current workflow has this status. |
| ACTIVE | Workflow is production-active. This taxonomy does not mark any workflow active. |
| PAUSED | Workflow is intentionally paused. |
| RETIRED | Workflow is intentionally retired with redirect/archive/rollback notes. |

Current workflows should not be promoted beyond safe planning/design statuses unless future sanitized evidence exists and Drip/ChatGPT explicitly approve the scope. The 16 legacy workflows remain blocked by the Phase 2.37 blocker-resolution plan and the Phase 3 readiness tracker.

## 8. Admin Dashboard Implications

Admin Dashboard v0 should focus on non-production evidence, gate, and status workflows:

- evidence/gate status
- manual review matrix
- blocker matrix
- workflow taxonomy browser
- workflow detail pages
- issue tracker
- owner-needed flags
- rollback-needed flags
- prohibited action warnings

Admin Dashboard v1 or later may later support operational functions:

- campaign review queues
- signup review queues
- billing review queues
- display operations status
- support tickets
- analytics dashboards

Those later operational functions remain blocked until workflows are designed, owner-reviewed, rollback-reviewed, and explicitly approved. Admin Dashboard v0 must not perform live campaign approvals, provider onboarding, advertiser/vendor/employer onboarding, billing actions, invoice creation, revenue-share calculations, redirect changes, QR creation, email sending, ScreenCloud changes, YouTube changes, live Sheet writes, or Apps Script changes.

## 9. Data Architecture Implications

The taxonomy should guide future Firestore, BigQuery, Cloud Run, and dashboard design conceptually. It does not create schema files, resources, jobs, databases, services, or production integrations.

| Conceptual grouping | Purpose | Example future entities |
| --- | --- | --- |
| Operational entities | Core app records used by product workflows. | Organizations, users, facilities, campaigns, creatives, screens, placements. |
| Workflow state entities | Track workflow status, owner, blockers, and lifecycle. | Workflow registry, workflow states, owner assignments, rollback assignments. |
| Evidence/gate entities | Preserve migration and readiness decisions. | Evidence sources, manual review decisions, blocker records, phase gates. |
| Event/analytics entities | Support reporting and attribution. | Page views, QR scans, playback events, campaign events, funnel events. |
| Billing/revenue entities | Support billing and revenue-share planning. | Billing accounts, invoice previews, billing events, revenue-share events. |
| Integration state entities | Track external system boundaries and sync state. | Integration configs, adapter status, dry-run logs, job states. |
| Audit/compliance entities | Preserve policy, approval, safety, and audit trails. | Policy reviews, terms acceptance, audit events, prohibited-action flags. |

Firestore design should prioritize operational and workflow state entities for app surfaces. BigQuery design should prioritize analytics/event models only after source-of-truth and ingestion approvals exist. Cloud Run design should separate API handlers, local-only dry-run jobs, future scheduled jobs, and external adapter boundaries. Dashboard design should surface workflow status before offering operational controls.

## 10. Relationship To Phase 3

This taxonomy does not start Phase 3. It does not approve ingestion. It helps identify future scope candidates and product architecture categories.

The legacy 16 workflow tracker remains the source of migration gating. Future platform workflows may be added to the taxonomy without becoming migration-approved. Any Phase 3 scope requires explicit Drip/ChatGPT approval, a defined owner, confirmed source-of-truth, confirmed read/write behavior, rollback planning, and dry-run guard review.

Until that happens:

- Overall gate recommendation remains `PHASE_3_BLOCKED`.
- Phase 3 dry-run status remains `NOT_APPROVED`.
- Production impact remains `NONE`.
- Phase 3 started remains `NO`.

## 11. Recommended Next Phase 2 Actions

1. Merge this taxonomy after review.
2. Create Admin Dashboard v0 product spec using this taxonomy and the Phase 2.37 blocker plan.
3. Create non-production data model draft for evidence/gate/workflow tracking.
4. Create workflow registry draft.
5. Create issue templates for workflow blocker resolution.
6. Keep Phase 3 blocked.

## Phase 2.38 Safety Confirmation

| Field | Confirmation |
| --- | --- |
| Production impact | NONE |
| Live systems queried or modified | NO |
| Generated private tracker committed | NO |
| Raw private evidence committed | NO |
| Phase 3 started | NO |
| Limited dry run approved | NO |
| Production behavior approved | NO |
