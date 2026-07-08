# Drip Healthcare Next-Generation System Design Brief

This brief is the planning source of truth for the intended next-generation Drip Healthcare platform. It is documentation only. It does not authorize production changes, deploys, DNS changes, live credential use, Apps Script changes, Google Sheets edits, ScreenCloud changes, Stripe changes, or Phase 3 dataset ingestion.

## Core Goals

The next-generation system should optimize for:

- Safety
- Speed
- Stability
- Easy user experience for providers, vendors, and employers
- Clean migration away from spreadsheet-shaped architecture
- Strong backup, audit, admin, and data intelligence foundations

## Core Architecture Principle

Drip should not rebuild the old spreadsheet system inside Firestore.

The permanent platform should be organized around:

- Organizations
- Users
- Provider display preferences
- Campaigns
- Campaign eligibility
- Screens and placements
- Events
- Billing
- Revenue share
- Conference inventory
- Market intelligence
- Admin workflows
- Audit logs
- Backups

Google Sheets may remain temporary intake and admin bridges during migration. They should not define the permanent architecture. Apps Script may also remain a temporary bridge during migration, but it should not be the permanent application runtime.

## Legacy Sheet 1 Campaigns

Old Sheet 1 campaigns are retired as a future product model.

Old Sheet 1 should be treated as:

- Legacy archive
- Historical campaign reference
- Historical click and billing reference
- Legacy redirect risk review
- Optional historical BigQuery import

Old Sheet 1 should not become an active future campaign model. Future campaigns must use explicit campaign types, eligibility rules, safety review, billing checks, and audit logs.

## Future Logical Sheet Organization

This is a logical future model only. Do not physically rename live Sheets during Phase 2.11.

| Logical area | Purpose | Permanent-system direction |
| --- | --- | --- |
| Legacy Archive: Old Sheet 1 Campaigns | Historical campaign, click, billing, and redirect reference | Retire/archive only; optional historical BigQuery import |
| Sheet 1: Provider Intake | Provider signup, facility onboarding, provider user creation, affiliate/referral links, welcome workflow | Future app/API intake into organization and provider collections |
| Sheet 2: Advertiser Intake | Vendor/employer signup, advertiser profile, billing bridge, promo/invoice bridge during migration | Future app/API intake into advertiser and billing collections |
| Sheet 3: Provider Display Preferences | Provider users set display preferences for vendors/employers | Future provider display preference and preference-event collections |
| Sheet 4: Provider Campaigns | Campaigns shown only to provider organization users in the Provider Media Center | Future campaign collections with provider-user audience targeting |
| Sheet 5: Conference Campaigns | Conference inventory, reservations, holds, waitlists, purchase log, funding status, refund review, showcase pages | Future conference inventory, reservation, purchase, campaign, and billing collections |
| Sheet 6: Patient Campaigns | Campaigns shown only to patients on provider screens by QR, video, or QR plus video | Future campaigns, placements, eligibility, screen events, billing, and revenue share collections |

Live migration must wait for later reviewed phases with backup, rollback, owner approval, and dry-run validation.

## Sheet 1: Provider Intake

Purpose:

- Provider organization signup
- Facility onboarding
- Provider user creation
- Provider affiliate/referral link generation
- Provider welcome workflow

Future targets may include:

- `organizations`
- `providerOrganizations`
- `providerFacilities`
- `users`
- `organizationMemberships`
- `providerUserAffiliateLinks`

## Sheet 2: Advertiser Intake

Purpose:

- Vendor signup
- Employer signup
- Advertiser organization profile
- Billing bridge
- Promo/invoice bridge during migration

Future targets may include:

- `organizations`
- `advertiserOrganizations`
- `advertiserProfiles`
- `billingAccounts`
- `billingEvents`
- `invoiceEvents`
- `promoCodes`

## Sheet 3: Provider Display Preferences

Purpose:

- Provider users set display preferences for vendors/employers.
- Display preferences apply only to Patient Campaigns.
- Checkmarked vendors/employers may be eligible for patient screen display.

Future targets may include:

- `providerDisplayPreferences`
- `providerUserPreferenceSignals`
- `displayPreferenceChangeEvents`

Preferred wording:

- Set display preferences
- Checkmarked for patient campaign display
- Not checkmarked
- Excluded from patient campaign display
- Display eligibility

Avoid wording:

- Provider approval
- Approved vendor
- Provider-approved vendor
- Campaign approval
- Provider endorsement

## Sheet 4: Provider Campaigns

Purpose:

- Campaigns shown only to provider organization users.
- Campaigns displayed inside the Provider Media Center.
- Campaigns not shown to patients.
- Campaigns not displayed on provider screens.

Future targets may include:

- `campaigns`
- `campaignCreatives`
- `campaignAudienceTargets`
- `campaignEvents`
- `billingEvents`

## Sheet 5: Conference Campaigns

Purpose:

- Conference inventory
- Conference sponsorship reservations
- Holds
- Waitlist
- Purchase log
- Funding status
- Refund review
- Showcase pages

Future targets may include:

- `conferenceEvents`
- `conferenceSponsorshipInventory`
- `conferenceReservations`
- `conferenceWaitlistEntries`
- `conferencePurchaseEvents`
- `campaigns`
- `billingEvents`

## Sheet 6: Patient Campaigns

Purpose:

- Campaigns shown only to patients on provider screens.
- QR, video, or QR plus video delivery.
- Provider display preference eligibility.
- Drip safety review.

Future targets may include:

- `campaigns`
- `campaignCreatives`
- `campaignPlacements`
- `campaignPlacementEligibility`
- `patientScreenQrScanEvents`
- `patientScreenPlaybackEvents`
- `billingEvents`
- `providerRevenueShareEvents`

## Campaign Types

Advertisers cannot submit one campaign for both patients and providers.

Campaign types must be explicit:

- Patient Campaign
- Provider Campaign
- Conference Campaign

Internal enums:

- `PATIENT_CAMPAIGN`
- `PROVIDER_CAMPAIGN`
- `CONFERENCE_CAMPAIGN`

One campaign equals one primary audience and one primary eligibility model.

## Patient Campaigns

Patient Campaigns are shown only to patients on provider screens.

Delivery formats:

- QR
- Video
- QR and video

Patient Campaigns require:

- Drip safety review
- Active campaign dates
- Valid QR/video assets
- Valid billing/budget
- Active provider screen participation
- Provider display preference eligibility
- No compliance block

Provider display preferences apply only to Patient Campaigns. A vendor or employer must be checkmarked by the provider before that vendor or employer's Patient Campaigns may be eligible to display on that provider's screens.

Provider checkmark does not make a campaign live by itself. The campaign must still pass Drip safety review and all system eligibility rules.

## Provider Campaigns

Provider Campaigns are shown only to provider organization users inside the Provider Media Center.

Provider Campaigns are not shown to patients and are not displayed on provider screens.

Provider Campaigns can target provider organization users by:

- Job role
- Department
- Facility type
- Specialty
- State
- Market
- DMA
- Organization type

Provider display preferences do not apply to Provider Campaigns.

Provider Campaigns still require Drip safety review, active dates, valid billing/budget, and no compliance block.

## Conference Campaigns

Conference Campaigns are tied to conference sponsorship inventory, event visibility, reservation holds, waitlists, funding status, payment status, refund review, and conference showcase pages.

Conference Campaigns are separate from Patient Campaigns and Provider Campaigns.

If an advertiser wants conference-related patient screen visibility, that should be submitted separately as a Patient Campaign.

If an advertiser wants conference-related provider dashboard visibility, that should be submitted separately as a Provider Campaign.

## Provider Media Center

The Provider Media Center is the dashboard used by provider organizations.

Primary sections:

- Overview
- Facilities & Screens
- Vendor / Employer Display Preferences
- Provider Campaigns
- Patient Screen Activity
- Revenue Share
- Performance
- Users & Access
- Settings
- Support / Issues

Provider users should be able to:

- Log in by magic link
- View Provider Campaigns
- Set display preferences for vendors/employers
- View screen activity
- View eligible patient campaign activity
- View revenue share, depending on role
- Use their provider-user affiliate/referral link

Provider admins should additionally be able to:

- Invite provider users
- Manage organization settings
- Manage facility/screen participation
- Manage user access
- Transfer admin role
- Manage billing/revenue share settings

Only one Provider Admin should exist per provider organization ID.

## Advertiser Dashboard

The Advertiser Dashboard is used by vendors and employers.

Primary sections:

- Overview
- Campaigns
- Create Campaign
- Billing
- Creative Library
- Organization Profile
- Support / Issues

Campaign creation should ask: "What type of campaign do you want to create?"

Options:

1. Patient Campaign: Reach patients on provider screens using QR, video, or both.
2. Provider Campaign: Reach provider organization users inside the Provider Media Center.
3. Conference Campaign: Reserve visibility tied to a healthcare conference.

Advertisers must submit separate campaigns for separate audiences.

## Login And User Access

Drip should use email magic link login.

No Google sign-in.

Magic link flow:

1. User enters email.
2. Drip sends a secure one-time login link.
3. User clicks the link.
4. Drip verifies the token.
5. User is signed into the dashboard.

Recommended settings:

- Magic link expiration: 20 minutes
- Magic link use: one-time only
- Dashboard session duration: approximately 14 days
- Sensitive actions may require re-authentication

Every organization should have an organization ID. Every user should have an individual user account. Organization ID identifies the organization. User login identifies the individual person. Membership defines what that person can access.

## Provider Users

Each provider user should have:

- `userId`
- `email`
- `name`
- `providerOrganizationId`
- `permissionRole`
- `jobRole`
- `department`
- `facilityAccess`
- `affiliateCode`
- `affiliateLink`
- `status`
- `createdAt`
- `lastLoginAt`

Each provider user should receive one provider-user affiliate/referral link at signup.

Affiliate links are not login links.

Magic link means secure login. Affiliate link means referral and attribution tracking.

## Provider User Roles

Provider permission roles:

- `PROVIDER_ADMIN`
- `PROVIDER_USER`
- `PROVIDER_BILLING`
- `PROVIDER_READ_ONLY`

Only one `PROVIDER_ADMIN` may exist per provider organization ID.

All active provider users except read-only users may set display preferences, unless Drip later chooses to allow read-only users to submit non-binding preference signals.

Provider job roles should include Administrator, Practice Manager, Operations, Purchasing, Procurement, Supply Chain, Materials Management, Value Analysis, Billing / Finance, Marketing, Community Relations, IT / Technology, Facilities Management, Clinical Leadership, Physician, Surgeon, Nurse, OR Director, Surgical Services, Sterile Processing, SPD Manager, Imaging / Radiology, Lab, Pharmacy, Physical Therapy / Rehab, Front Desk / Patient Access, Human Resources, Compliance / Legal, and Other.

Provider job roles support Provider Campaign targeting and market intelligence.

## Campaign Eligibility Engine

Drip should have a campaign eligibility engine.

Patient Campaign display eligibility requires:

- Campaign type is Patient Campaign.
- Advertiser organization is active.
- Vendor/employer is checkmarked by provider display preferences.
- Campaign passed Drip safety review.
- Campaign start date has arrived.
- Campaign end date has not passed.
- Current display time is within the campaign date window.
- Screen/facility is active and participating.
- QR/video assets are valid.
- Billing/budget is valid.
- No compliance block exists.

Provider Campaign eligibility requires:

- Campaign type is Provider Campaign.
- Advertiser organization is active.
- Campaign passed Drip safety review.
- Campaign start date has arrived.
- Campaign end date has not passed.
- Provider user matches campaign targeting.
- Creative/landing page is valid.
- Billing/budget is valid.
- No compliance block exists.

Conference Campaign eligibility requires:

- Event is active.
- Inventory is available or reservation is valid.
- Hold/payment rules are valid.
- Campaign passed applicable Drip safety review.
- Dates are valid.
- Billing/payment status is valid.
- No compliance block exists.

## Safety Review

All campaign types require Drip safety review.

Safety review applies to claims, creative, landing pages, QR destinations, video content, conference creative, Provider Campaign creative, and Patient Campaign creative.

No campaign should display before passing required safety checks. No A/B test variant should receive traffic unless that variant passes safety review.

## A/B Testing

A/B testing should be supported inside Admin Dashboard and campaign tooling.

A/B testing may apply to:

- Landing page variants
- QR destination variants
- Headlines
- Provider Campaign creatives
- Patient Campaign creatives
- Conference showcase pages

Every A/B test should have:

- `testId`
- `campaignId`
- `variantIds`
- `safetyStatus`
- `trafficSplit`
- `startDate`
- `endDate`
- `successMetric`
- `createdBy`
- `reviewedBy`
- `auditLog`

A/B testing must not bypass campaign safety rules.

## Admin Dashboard

The Admin Dashboard should be the Drip control tower.

Primary sections:

- Overview
- Organizations
- Users & Access
- Provider Media Center Admin
- Advertiser Campaign Admin
- Provider Display Preferences
- Campaign Safety Review
- Campaign Eligibility
- Billing & Revenue Share
- Conference Campaign Admin
- Screen / Display Provider Operations
- Market Intelligence
- Data Uploads
- A/B Testing
- Issue Resolution
- Audit Logs
- Backups & Restore
- Codex Review Queue
- System Settings

Admin Dashboard should support easy edits with audit logs, issue resolution, campaign safety review, billing review, revenue share review, display preference inspection, screen/display provider troubleshooting, A/B testing controls, uploading payor datasets and market intelligence spreadsheets, reviewing migration packets, managing Codex review items, and backup/restore monitoring.

Sensitive edits should require:

- Reason for change
- Before/after audit log
- User attribution
- Timestamp
- Rollback path where possible

## Market Intelligence Layer

Drip should support admin upload of data intelligence sources, including payor data spreadsheets.

Market intelligence upload flow:

1. Upload dataset.
2. Store raw file in Cloud Storage.
3. Create dataset upload record.
4. Classify columns.
5. Preview mapping.
6. Human review.
7. Normalize into staging tables.
8. Promote approved data into BigQuery.
9. Use for market intelligence and advertiser opportunity scoring.

No patient PHI should be uploaded. Raw spreadsheets should not directly mutate production operational data.

## Data And Backup Architecture

Operational source of truth:

- Firestore

Analytics and intelligence:

- BigQuery

Files, uploads, evidence, and backups:

- Cloud Storage

Secrets:

- Secret Manager

Jobs and scheduled workflows:

- Cloud Scheduler / Cloud Run jobs

Source control and deployment:

- GitHub / CI/CD

Everything important should be backed up.

Backup scope should include Firestore operational data, BigQuery datasets, Cloud Storage assets, campaign creatives, uploaded datasets, evidence manifests, admin config, feature flags, A/B test configs, audit logs, Apps Script source while still used, Google Sheets snapshots while still used, screen/display provider placement snapshots, Stripe invoice/payment metadata references, GitHub repo state, Cloud Run service configuration, and Secret Manager metadata, not plain-text secrets.

Restore should not be automatic in production.

Restore workflow:

1. Restore request.
2. Preview impact.
3. Human approval.
4. Limited-scope restore.
5. Audit log.
6. Post-restore verification.

## Recommended Core Collections

Suggested Firestore operational collections:

- `organizations`
- `users`
- `organizationMemberships`
- `organizationInvites`
- `providerFacilities`
- `providerScreens`
- `providerDisplayPreferences`
- `providerUserAffiliateLinks`
- `advertiserProfiles`
- `campaigns`
- `campaignCreatives`
- `campaignAudienceTargets`
- `campaignPlacements`
- `campaignPlacementEligibility`
- `campaignEvents`
- `conferenceEvents`
- `conferenceSponsorshipInventory`
- `conferenceReservations`
- `conferenceWaitlistEntries`
- `conferencePurchaseEvents`
- `billingAccounts`
- `billingEvents`
- `invoiceEvents`
- `providerRevenueShareEvents`
- `datasetUploads`
- `marketIntelligenceSources`
- `abTests`
- `issues`
- `auditLogs`
- `backups`
- `codexReviewItems`

## Naming Conventions

User-facing campaign names:

- Patient Campaign
- Provider Campaign
- Conference Campaign

Internal campaign type enums:

- `PATIENT_CAMPAIGN`
- `PROVIDER_CAMPAIGN`
- `CONFERENCE_CAMPAIGN`

Preferred provider-side wording:

- Set display preferences
- Checkmarked for patient campaign display
- Excluded from patient campaign display
- Display eligibility

Avoid:

- Provider approval
- Approved vendor
- Campaign approval
- Provider endorsement

## Final Operating Rules

1. Old Sheet 1 campaigns are retired/archive only.
2. Advertisers submit explicit campaign types.
3. Advertisers cannot submit one campaign for both patients and providers.
4. Patient Campaigns display only on provider screens to patients.
5. Provider Campaigns display only inside the Provider Media Center to provider organization users.
6. Conference Campaigns are separate conference inventory/sponsorship campaigns.
7. Provider display preferences apply only to Patient Campaigns.
8. Checkmarked vendors/employers may be eligible for Patient Campaign display.
9. Patient Campaigns require Drip safety review.
10. Provider Campaigns require Drip safety review.
11. Conference Campaigns require safety review where advertiser creative, claims, or landing pages are involved.
12. Campaign start/end dates must be active for any campaign to display.
13. Magic link login is used.
14. Google sign-in is not used.
15. Every organization has an organization ID.
16. Every individual user has a user account.
17. Every provider user receives one affiliate/referral link at signup.
18. Only one Provider Admin exists per provider organization ID.
19. Admin Dashboard is the control tower for edits, safety, issue resolution, A/B testing, data intelligence, backups, and Codex review.
20. Firestore is operational source of truth.
21. BigQuery is analytics and intelligence layer.
22. Cloud Storage stores uploads, assets, evidence, and backups.
23. Sheets remain temporary bridges only during migration.
24. Apps Script remains temporary bridge only during migration.
25. No production cutover occurs without review, backup, and rollback path.
