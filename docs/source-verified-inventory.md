# Source-Verified Inventory

## Evidence

Sources:

- `/Users/crashdavis/Downloads/drip-system-audit-redacted-for-codex.md`, generated 2026-07-02 from `system audit 06_30_2026.rtf`.
- `/Users/crashdavis/Downloads/drip-platform-main.zip`, reviewed as a read-only repo ZIP snapshot. The ZIP archive comment identifies commit `0a6b3ad49657e059ec830d627ce89d45fa3e8a44`.

No live production service was queried or modified. Secret-like values are not repeated here. The repo ZIP validates source files present in the archive only; it does not verify live GitHub state, deployed Cloud Run state, deployed Apps Script parity, or Apps Script runtime load order.

## Source Summary

| Item | Source-verified count/detail |
| --- | --- |
| Apps Script manifest | `Appsscript.json` with YouTube advanced service, broad spreadsheet/drive/mail/external request scopes, Stackdriver logging, V8 runtime, web app executing as deploying user and accessible to anonymous users. |
| Apps Script / HTML / Cloud Run source sections | `Code.gs`, `BusinessDirectory.gs`, `WelcomeEmails.gs`, `Sheet6VideoCampaigns.gs`, `ScreenCloudPlaybackBilling.gs`, `Sheet6VideoInvoiceIntegration.gs`, `MonthlyBillingVideoIntegrated.gs`, `Sheet7ProviderConferenceCampaigns.gs`, `StripeCustomerSync.gs`, `Sheet7ConferenceCampaignsUnified.gs`, four conference HTML pages, Cloud Run Stripe webhook `index.js`, `package.json`. |
| Parsed function declarations | 1,161 total across Apps Script, embedded HTML, and Cloud Run JS. |
| Apps Script-heavy files by parsed function count | `Code.gs` 314, `Sheet6VideoCampaigns.gs` 236, `Sheet7ConferenceCampaignsUnified.gs` 240, `Sheet7ProviderConferenceCampaigns.gs` 125, `BusinessDirectory.gs` 57, `ScreenCloudPlaybackBilling.gs` 44. |
| Current trigger list in aggregate | 10 visible trigger entries. |
| Current Cloud Run services | `cloud-run-health-test`, `conference-image-upload`, `drip-creative-player`, `drip-segment-api`, `drip-segment-proxy`. |
| BigQuery datasets observed | `drip_raw`, `drip_core`, `drip_marts`. |
| BigQuery tables observed | `provider_procedure_mix`, `targetable_providers`; `drip_core.targetable_providers` returned not found in aggregate note. The repo ZIP Dataform source defines `targetable_providers` in `drip_marts`, not `drip_core`. |
| Repo ZIP source coverage | Market intelligence scaffold only: Terraform, Dataform, Medicaid ingest helper, Segment API, Cloud Build. No Apps Script source tree is present in the ZIP. |
| Repo ZIP service coverage | Source validates `drip-segment-api`; it does not include source for `drip-segment-proxy`, `drip-creative-player`, `conference-image-upload`, or `cloud-run-health-test`. |

## Duplicate Function Findings

| duplicateFunction | occurrences | source locations |
| --- | ---: | --- |
| `cleanup` | 6 | Conference HTML pages. |
| `escapeHtml` | 6 | Conference HTML pages. |
| `jsonp` | 5 | Conference HTML pages. |
| `get` | 4 | `Sheet7ConferenceCampaignsUnified.gs` nested/local helper declarations. |
| `setStatus` | 4 | Conference HTML pages. |
| `escapeHtml_` | 3 | `WelcomeEmails.gs`, `Sheet6VideoCampaigns.gs`. |
| `render`, `renderCard` | 3 each | Conference HTML/pages. |
| `roundCurrency_` | 3 | `Code.gs`, `ScreenCloudPlaybackBilling.gs`. |
| `_normMarketKey_` | 2 | `Code.gs`. |
| `ensureStripeCustomerForOrganization_` | 2 | `Code.gs`, `StripeCustomerSync.gs`. |
| `evaluateSheet1RedirectUrl_` | 2 | `Code.gs`. |
| `formatCampaignEndDateForDisplay_` | 2 | `Code.gs`. |
| `buildMonthlyBillingEmailDraftBody_` | 2 | `Code.gs`, `MonthlyBillingVideoIntegrated.gs`. |
| `createStripeInvoicesFromMonthlyBillingSummary_` | replaced/overridden pattern | `Code.gs` legacy and `MonthlyBillingVideoIntegrated.gs` replacement. |
| `rollupConferenceScreenPlaybackStatsFromScreenCloudLog*` | duplicate safe/live variants | `Sheet7ConferenceCampaignsUnified.gs`. |

## Duplicate Constant Findings

| duplicateConstant | occurrences | risk |
| --- | ---: | --- |
| `WEB_APP_URL` | 6 | Hardcoded web app URL repeated in HTML pages; move to config/env and generate pages from one source. |
| `JSON_MODE` | 2 | Low risk; duplicate page-local constants. |
| `SAME_MARKET_ORG_BOOST` | 2 | Medium; duplicated scoring weight can drift. |
| `STRIPE_SECRET_KEY` | 2 | High; secret accessor/global shadowing should move behind one secret service. |
| `TARGET_COL` | 2 | Medium; duplicate local column constants can cause sheet-write mistakes. |

## A. Apps Script Functions

This table lists the source-verified operational functions that drive triggers, web routes, external writes, billing, ScreenCloud, redirects, market intelligence, and migration disposition. The aggregate contains additional low-level render/helper/test functions; those are summarized above and should be mechanically indexed during Phase 1 repository import.

| functionName | sourceFile | purpose | current workflow | readsFrom | writesTo | externalServicesUsed | riskLevel | targetDisposition |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `setupTriggers` | `Code.gs` | Removes project triggers and creates Sheet 1-4/finalizer triggers. | Trigger setup. | Script project triggers, Sheet IDs. | Apps Script triggers. | Apps Script trigger API. | Critical | MOVE_TO_ADMIN_DASHBOARD |
| `onEdit_Sheet1` | `Code.gs` | Marks Sheet 1 rows pending after edit. | Legacy patient/community campaign intake. | Sheet 1. | Sheet 1 flag/market columns. | Google Sheets. | High | LEGACY_ARCHIVE |
| `onEdit_Sheet2` | `Code.gs` | Finalizes advertiser/business signup fields and IDs. | Squarespace advertiser intake. | Sheet 2. | Sheet 2, Billing Config, Stripe customer sync. | Sheets, Stripe helper. | High | MOVE_TO_CLOUD_RUN |
| `onEdit_Sheet3` | `Code.gs` | Consolidates business approval markets. | Media Center/display approval bridge. | Sheet 3. | Sheet 3. | Sheets. | Medium | MOVE_TO_ADMIN_DASHBOARD |
| `onEdit_Sheet4` | `Code.gs` | Finalizes provider IDs and affiliate links. | Provider intake. | Sheet 4. | Sheet 4. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `onEdit_Sheet5` | `BusinessDirectory.gs` | Handles directory campaign edits. | Sheet 5 provider-facing campaign intake. | Sheet 5. | Sheet 5. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `onEdit_Sheet6` | `BusinessDirectory.gs` | Handles Sheet 6 video campaign edits. | Patient screen video campaigns. | Sheet 6. | Sheet 6. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `onEdit_Sheet7ProviderConferenceCampaigns` | `Sheet7ProviderConferenceCampaigns.gs` | Finalizes conference event rows and approval edits. | Conference event intake/admin. | Sheet 7 Provider Conference Campaigns. | Sheet 7 fields. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `finalizeSquarespaceRows` | `Code.gs` | Batch finalizes Sheet 1/2 rows. | Raw form normalization. | Sheets 1/2. | Sheets 1/2, billing config. | Sheets, Stripe helper, URL checks. | High | MOVE_TO_CLOUD_RUN |
| `finalizeSheet1Rows_` | `Code.gs` | Validates Sheet 1 campaigns and adds eligible rows to redirect pools. | Legacy patient campaign finalizer. | Sheet 1, Sheet 3, Sheet 4. | Sheet 1, Redirect Pools. | Sheets, Safe Browsing, UrlFetch. | High | LEGACY_ARCHIVE |
| `finalizeSheet2Rows_` | `Code.gs` | Normalizes advertiser signups and validates YouTube URL. | Advertiser intake. | Sheet 2. | Sheet 2, Billing Config. | Sheets, Safe Browsing, YouTube URL logic, Stripe helper. | High | MOVE_TO_CLOUD_RUN |
| `finalizeUnfinalizedProviderConferenceCampaignRows` | `Sheet7ProviderConferenceCampaigns.gs` | Finalizes conference event rows missing helper fields. | Conference event maintenance. | Sheet 7. | Sheet 7. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `checkConferenceFundingDeadlines` | `Sheet7ProviderConferenceCampaigns.gs` | Checks conference funding/deadline status. | Conference daily automation. | Sheet 7. | Sheet 7 purchase/event status. | Sheets, MailApp. | High | MOVE_TO_CLOUD_RUN |
| `expireConferencePurchaseHolds` | `Sheet7ProviderConferenceCampaigns.gs` | Releases expired conference invoice holds. | Conference billing/hold lifecycle. | Conference Purchase Log. | Purchase Log, event inventory fields. | Sheets, possibly Stripe helpers. | High | MOVE_TO_CLOUD_RUN |
| `runWeeklyCampaignAnalyticsScheduled` | `Code.gs` | Weekly analytics email runner. | Campaign reporting. | Sheets 1/4/5/6. | Email/log/status props. | Sheets, MailApp. | Medium | MOVE_TO_CLOUD_RUN |
| `doGet` | `Code.gs` | Anonymous web app router for redirects, JSON/JSONP, campaign pages, directory, signage, conference, QR. | Public web app/API gateway. | All campaign/provider sheets. | Logs, counters, click rows, sheet state. | Sheets, HtmlService, UrlFetch. | Critical | MOVE_TO_CLOUD_RUN |
| `doPost` | `Code.gs` | POST router for saves and billing webhook. | Public web app mutation gateway. | Request payloads. | Sheets, invoice logs, campaign submissions. | Sheets, Stripe webhook forwarded payloads. | Critical | MOVE_TO_CLOUD_RUN |
| `handleBillingWebhook_` | `Code.gs` | Handles forwarded Stripe events. | Billing status sync. | Apps Script POST payload. | Invoice Log, purchase logs, audit logs. | Stripe via Cloud Run forwarder. | Critical | MOVE_TO_CLOUD_RUN |
| `createStripeInvoiceForClicks_` | `Code.gs` | Creates/finalizes/sends Stripe click invoices. | Legacy click billing. | Billing config and usage. | Stripe invoices, Invoice Log. | Stripe API. | Critical | MOVE_TO_CLOUD_RUN |
| `createStripeInvoicesFromMonthlyBillingSummary_LEGACY_CLICK_ONLY_` | `Code.gs` | Legacy monthly Stripe invoice creation. | Monthly click billing. | Monthly Billing Summary. | Stripe, Monthly Billing Summary, Invoice Log. | Stripe API. | Critical | DELETE_AFTER_CUTOVER |
| `createStripeInvoicesFromMonthlyBillingSummary_` | `MonthlyBillingVideoIntegrated.gs` | Creates invoices with patient/provider/video categories. | Integrated monthly billing. | Monthly Billing Summary, Video Billing Summary. | Stripe, Invoice Log, billing summary rows. | Stripe API. | Critical | MOVE_TO_CLOUD_RUN |
| `createStripeInvoiceForMonthlyBillingSummary_` | `MonthlyBillingVideoIntegrated.gs` | Creates multi-line Stripe invoice. | Integrated billing. | Summary rows. | Stripe invoice/items. | Stripe API. | Critical | MOVE_TO_CLOUD_RUN |
| `ensureStripeCustomerForOrganization_` | `Code.gs` and `StripeCustomerSync.gs` | Ensures Stripe customer exists and is synced. | Billing customer setup. | Billing Config, Sheet 2. | Billing Config, Stripe customer. | Stripe API. | Critical | MOVE_TO_CLOUD_RUN |
| `syncAllStripeCustomersFromBillingConfig` | `StripeCustomerSync.gs` | Batch syncs customers. | Billing maintenance. | Billing Config. | Stripe customer, Billing Config. | Stripe API. | High | MOVE_TO_CLOUD_RUN |
| `syncRecentSheet2SignupsToBillingConfig` | `StripeCustomerSync.gs` | Syncs recent Sheet 2 signups into Billing Config. | Signup-to-billing bridge. | Sheet 2. | Billing Config, Stripe. | Stripe API. | High | MOVE_TO_CLOUD_RUN |
| `handleDirectoryJson_` | `Code.gs` | Returns directory payload. | Media Center/provider directory API. | Sheets 2/3/4/5/6. | Response only. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `handleDirectoryFacilityJson_` | `BusinessDirectory.gs` | Returns facility directory data. | Media Center page/API. | Sheets 2/3/4/5/6. | Response only. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `handleDirectoryDisplayPref_` | `BusinessDirectory.gs` | Saves provider display preference checkbox. | Media Center approval. | Request params, Sheet 3. | Sheet 3 approvals. | Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `handleDirectoryCampaignGo_` | `BusinessDirectory.gs` | Chooses provider-facing directory campaign and redirects/logs click. | Media Center campaign redirect. | Sheets 2/3/4/5. | Sheet 5 clicks/audit. | Sheets, HtmlService. | High | MOVE_TO_CLOUD_RUN |
| `handleDirectoryCampaignContinueLog_` | `BusinessDirectory.gs` | Logs intermediate page continuation. | Directory campaign redirect logging. | Token properties/params. | Sheet 5 audit/clicks. | Sheets, PropertiesService. | High | MOVE_TO_CLOUD_RUN |
| `handleDirectoryVideoGo_` | `BusinessDirectory.gs` | Chooses active Sheet 6 video campaign in directory context. | Provider Media Center to video campaign. | Sheets 2/3/4/6. | Sheet 6 click/log state. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `handleDirectoryEnterLog_` | `BusinessDirectory.gs` | Logs directory page entry. | Media Center analytics. | Request params. | Directory events / audit log. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `refreshDirectoryOfferDashboard_` | `BusinessDirectory.gs` | Refreshes directory dashboard. | Directory operations. | Sheets 2/3/4/5. | Sheet 5 System Dashboard. | Sheets. | Medium | MOVE_TO_BIGQUERY_JOB |
| `buildDirectoryGeoBaseIndex_` | `BusinessDirectory.gs` | Builds provider/business geo index. | Directory performance helper. | Sheets 2/4/5. | Sheet/cache. | Sheets. | Medium | MOVE_TO_BIGQUERY_JOB |
| `upsertSearchInterestRows_` | `Code.gs` | Updates Search Interest Scores. | Market intelligence signal bridge. | Input rows. | Sheet 1 Search Interest Scores. | Sheets. | Medium | MOVE_TO_BIGQUERY_JOB |
| `attachSearchScoresToCampaigns_` | `Code.gs` | Applies search scores to campaign selection. | Patient campaign weighting. | Search Interest Scores, Sheet 1 metadata. | In-memory selection. | Sheets. | Medium | MOVE_TO_BIGQUERY_JOB |
| `addCampaignToRotationIfEligible_` | `Code.gs` | Adds Sheet 1 campaigns to redirect pool if facility/business approval matches. | Legacy patient campaign placement. | Sheets 1/3/4. | Redirect Pools. | Sheets. | High | LEGACY_ARCHIVE |
| `rebuildRedirectPoolsFromSheet1` | `Code.gs` | Rebuilds legacy redirect pools from Sheet 1. | Legacy patient campaign repair. | Sheet 1, Sheet 3, Sheet 4. | Redirect Pools. | Sheets. | High | DELETE_AFTER_CUTOVER |
| `handleVideoCampaignQrScan_` | `Sheet6VideoCampaigns.gs` | Logs on-screen QR scan and redirects. | Patient Campaign QR redirect. | Sheet 6 rows. | QR Scan Log, Sheet 6 counters. | Sheets, HtmlService. | Critical | MOVE_TO_CLOUD_RUN |
| `handleVideoCampaignQrJson_` | `Sheet6VideoCampaigns.gs` | JSONP QR scan/redirect endpoint. | Patient Campaign QR redirect. | Sheet 6 rows. | QR Scan Log, counters. | Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `handleVideoCampaignQrContinue_` | `Sheet6VideoCampaigns.gs` | Intermediate QR redirect continuation. | Patient Campaign QR redirect. | Sheet 6 row/placement params. | Click log/counters. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `backfillSheet6QrTrackingUrls` | `Sheet6VideoCampaigns.gs` | Generates QR tracking URLs for Sheet 6 campaigns. | QR migration/backfill. | Sheet 6. | Sheet 6 QR URL columns. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `handleProviderPlaylistQr_` | `Sheet6VideoCampaigns.gs` | Handles provider playlist QR redirects. | Provider playlist QR flow. | ScreenCloud Provider Screens. | Response/logs. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `generateProviderPlaylistQrAssetsForAllProviderScreens` | `Sheet6VideoCampaigns.gs` | Generates provider playlist QR assets. | Display/provider setup. | ScreenCloud Provider Screens. | Sheet 6 provider screen columns, QR image URL. | Sheets, QR/image endpoint. | High | MOVE_TO_CLOUD_RUN |
| `setupVideoBillingInfrastructure` | `Sheet6VideoCampaigns.gs` | Creates Sheet 6 billing tabs/headers. | Setup/migration. | Sheet 6. | Sheet 6 tabs/headers. | Sheets. | Medium | MOVE_TO_ADMIN_DASHBOARD |
| `normalizeSheet6VideoRow_` | `Sheet6VideoCampaigns.gs` | Normalizes Sheet 6 campaign row, IDs, rate defaults, registry. | Patient video campaign intake. | Sheet 6. | Sheet 6, Video Campaign Registry. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `generateVideoCampaignPlacements` | `Sheet6VideoCampaigns.gs` | Builds placement rows from campaigns, approvals, provider screens. | Screen placement generation. | Sheet 6, Approval Map, Provider Screens. | Video Campaign Placements. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `validateVideoCampaignPlacementsDryRun` | `Sheet6VideoCampaigns.gs` | Validates placement readiness. | Display dry-run. | Video Campaign Placements, Provider Screens. | Logs/status. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `getScreenCloudConfig_` | `Sheet6VideoCampaigns.gs` | Reads ScreenCloud GraphQL/token/app config. | ScreenCloud integration. | Script Properties. | None. | ScreenCloud config. | High | MOVE_TO_CLOUD_RUN |
| `screenCloudGraphql_` | `Sheet6VideoCampaigns.gs` | Calls ScreenCloud GraphQL. | ScreenCloud integration. | Script Properties. | ScreenCloud reads/writes depending query. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `dryRunSyncReadyVideoPlacementsToScreenCloud` | `Sheet6VideoCampaigns.gs` | Logs what would be created. | Sheet 6 ScreenCloud dry-run. | Video Campaign Placements. | Logger only. | Sheets. | Medium | KEEP_TEMPORARILY |
| `syncReadyVideoPlacementsToScreenCloud` | `Sheet6VideoCampaigns.gs` | Creates ScreenCloud campaign content and adds to playlist. | Sheet 6 ScreenCloud sync. | Video Campaign Placements. | ScreenCloud content/playlist, placement status columns. | ScreenCloud API, Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `createScreenCloudCampaignVideoLink_` | `Sheet6VideoCampaigns.gs` | Creates ScreenCloud campaign video/link content. | Display sync. | Placement/campaign data. | ScreenCloud. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `addCampaignVideoLinkToProviderMainZone_` | `Sheet6VideoCampaigns.gs` | Adds campaign content to provider main zone. | Display sync. | Placement/provider route. | ScreenCloud channel/zone. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `runVideoCampaignScreenCloudSync` | `Sheet6VideoCampaigns.gs` | Runs video campaign screen sync. | Display sync orchestration. | Video placements/provider screens. | ScreenCloud, Sheet statuses. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `runAtomicVideoCampaignScreenCloudSync` | `Sheet6VideoCampaigns.gs` | Atomic screen sync variant. | Display sync. | Placements/screens/campaigns. | ScreenCloud. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `rebuildScreenCloudMainZoneFromScratch_` | `Sheet6VideoCampaigns.gs` | Rebuilds ScreenCloud channel content. | Display repair/rebuild. | Placements/provider screen state. | ScreenCloud channel content. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `fetchRecentScreenCloudPlaybackLogsSample` | `Sheet6VideoCampaigns.gs` | Samples ScreenCloud playback logs. | Playback discovery. | ScreenCloud. | Logger. | ScreenCloud API. | Medium | MOVE_TO_CLOUD_RUN |
| `ingestScreenCloudPlaybackLogs` | `ScreenCloudPlaybackBilling.gs` | Pulls playback logs, writes normalized rows, updates rollups. | Playback ingestion. | ScreenCloud, Sheet 6 maps. | Playback Log, Sheet 6 rollups. | ScreenCloud API, Sheets. | High | MOVE_TO_CLOUD_RUN |
| `buildVideoBillingSummary` | `ScreenCloudPlaybackBilling.gs` | Builds video billing summary from playback log. | Video billing prep. | Playback Log, Billing Config. | Video Billing Summary. | Sheets. | High | MOVE_TO_BIGQUERY_JOB |
| `buildProviderRevenueShareSummary` | `ScreenCloudPlaybackBilling.gs` | Builds provider revenue share rows. | Provider revenue share prep. | Playback Log, Billing Config. | Provider Revenue Share. | Sheets. | High | MOVE_TO_BIGQUERY_JOB |
| `buildMonthlySheet6VideoBillingAndRevenueSharePrep` | `ScreenCloudPlaybackBilling.gs` | Runs video billing/revenue prep. | Monthly billing prep. | Sheet 6, ScreenCloud logs. | Billing summary/revenue share. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `setupProviderConferenceCampaignsHeaders` | `Sheet7ProviderConferenceCampaigns.gs` | Adds Sheet 7 event helper columns. | Conference setup. | Sheet 7. | Sheet 7 headers. | Sheets. | Medium | MOVE_TO_ADMIN_DASHBOARD |
| `refreshAllProviderConferenceInventory` | `Sheet7ProviderConferenceCampaigns.gs` | Refreshes event inventory/funding status. | Conference inventory. | Event sheet, purchase log. | Event status fields. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `prepareConferencePurchaseDecision_` | `Sheet7ProviderConferenceCampaigns.gs` | Decides hold/invoice/waitlist availability. | Conference purchase. | Event sheet, purchase log. | None directly. | Sheets, LockService. | Critical | MOVE_TO_CLOUD_RUN |
| `createConferencePendingPaymentHoldRow_` | `Sheet7ProviderConferenceCampaigns.gs` | Creates 24-hour sponsorship hold. | Conference purchase. | Event/purchase state. | Conference Purchase Log, event inventory. | Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `createConferenceStripeInvoice_` | `Sheet7ProviderConferenceCampaigns.gs` | Creates Stripe invoice for conference sponsorship. | Conference billing. | Purchase/event/billing config. | Stripe invoice, purchase log. | Stripe API. | Critical | MOVE_TO_CLOUD_RUN |
| `handleConferenceStripeWebhookEvent_` | `Sheet7ProviderConferenceCampaigns.gs` | Applies Stripe event to conference purchase log. | Conference billing status sync. | Forwarded Stripe payload. | Conference Purchase Log. | Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `voidConferenceStripeInvoice_` | `Sheet7ProviderConferenceCampaigns.gs` | Voids conference invoice. | Conference billing repair. | Stripe invoice ID. | Stripe invoice, purchase log if synced. | Stripe API. | Critical | MOVE_TO_ADMIN_DASHBOARD |
| `handleConferenceEventsJson_` | `Sheet7ProviderConferenceCampaigns.gs` | Returns public conference event catalog. | Conference opportunity page. | Sheet 7. | Response only. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `handleConferenceCreateInvoiceEndpoint_` | `Sheet7ProviderConferenceCampaigns.gs` | Creates conference invoice from web endpoint. | Conference buy-now. | Request params, Sheet 7. | Purchase Log, Stripe. | Stripe API, Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `handleConferenceCampaignSubmitSave_` | `Sheet7ConferenceCampaignsUnified.gs` | Saves submitted conference campaign. | Conference campaign submission. | Web POST params. | Conference Campaign Submissions. | Sheets, MailApp. | High | MOVE_TO_CLOUD_RUN |
| `handleConferenceCampaignClickJson_` | `Sheet7ConferenceCampaignsUnified.gs` | Logs CTA click and returns destination. | Conference showcase redirect. | Campaign submission table. | Conference Campaign Click Log, counters. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `handleConferenceShowcaseJson_` | `Sheet7ConferenceCampaignsUnified.gs` | Returns showcase cards. | Conference showcase page. | Conference Campaign Submissions, events. | Rotation state/counters. | Sheets, PropertiesService. | High | MOVE_TO_CLOUD_RUN |
| `handleConferenceShowcasePageViewJson_` | `Sheet7ConferenceCampaignsUnified.gs` | Logs showcase page view. | Conference analytics. | Request params. | Conference Showcase Page View Log. | Sheets. | Medium | MOVE_TO_CLOUD_RUN |
| `auditAllExistingConferenceCampaignsAndApplyAutomatedApproval` | `Sheet7ConferenceCampaignsUnified.gs` | Audits campaign URLs and applies automated approval. | Conference safety automation. | Conference Campaign Submissions. | Safety columns/approval status. | UrlFetch, Safe Browsing, Vision/Vimeo/YouTube. | Critical | MOVE_TO_CLOUD_RUN |
| `runConferenceCampaignAutomatedSafetyCheck_` | `Sheet7ConferenceCampaignsUnified.gs` | Strict safety check for one campaign. | Conference campaign safety. | Campaign fields. | Safety result columns. | UrlFetch, Safe Browsing, Vision/Vimeo/YouTube. | Critical | MOVE_TO_CLOUD_RUN |
| `setupConferenceEventScreensTab` | `Sheet7ConferenceCampaignsUnified.gs` | Sets up conference screens tab. | Conference display setup. | Sheet 7. | Conference Event Screens. | Sheets. | Medium | MOVE_TO_ADMIN_DASHBOARD |
| `generateConferenceScreenPlacements` | `Sheet7ConferenceCampaignsUnified.gs` | Creates conference placement rows. | Conference display placement. | Event screens, campaign submissions. | Conference Screen Placements. | Sheets. | High | MOVE_TO_CLOUD_RUN |
| `dryRunConferenceScreenPlacements` | `Sheet7ConferenceCampaignsUnified.gs` | Previews conference placements. | Display dry-run. | Screen placements/campaigns. | Logs/preview only. | Sheets. | Medium | KEEP_TEMPORARILY |
| `setupConferenceScreenCloudChannelsForAllEventScreens` | `Sheet7ConferenceCampaignsUnified.gs` | Creates/assigns ScreenCloud channels for event screens. | Conference display setup. | Conference Event Screens. | ScreenCloud channels, sheet status. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `syncReadyConferenceScreenPlacementsToScreenCloud` | `Sheet7ConferenceCampaignsUnified.gs` | Creates ScreenCloud links/content for ready placements. | Conference display sync. | Screen placements/campaigns. | ScreenCloud, sheet statuses. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `rebuildConferenceScreenCloudChannelsFromPlacements` | `Sheet7ConferenceCampaignsUnified.gs` | Rebuilds ScreenCloud channel playlists from placement records. | Conference display repair/sync. | Conference Screen Placements. | ScreenCloud channel content. | ScreenCloud API. | Critical | MOVE_TO_CLOUD_RUN |
| `syncConferenceEventScreenDisplay` | `Sheet7ConferenceCampaignsUnified.gs` | Orchestrates channel setup, placement sync, rebuild, playback rollup. | Conference display operations. | Sheet 7, ScreenCloud, Sheet 6 Playback Log. | ScreenCloud and sheet statuses. | ScreenCloud API, Sheets. | Critical | MOVE_TO_CLOUD_RUN |
| `rollupConferenceScreenPlaybackStatsFromScreenCloudLog` | `Sheet7ConferenceCampaignsUnified.gs` | Rolls playback metrics into conference placements/campaigns. | Conference reporting. | Sheet 6 Playback Log, Sheet 7 placements/campaigns. | Sheet 7 metric columns. | Sheets. | High | MOVE_TO_BIGQUERY_JOB |
| `postJsonPreservePostAcrossRedirects_` | Cloud Run `index.js` | Forwards Stripe webhook to Apps Script while handling Apps Script redirects. | Stripe webhook forwarder. | Stripe webhook event. | Apps Script webhook endpoint. | Stripe, Apps Script web app. | Critical | MOVE_TO_CLOUD_RUN |

## B. Web App Routes

| routeOrMode | handlerFunction | sourceFile | currentPurpose | productionRisk | targetReplacement |
| --- | --- | --- | --- | --- | --- |
| `GET /` Apps Script with no `mode`, `fid=...` | `doGet` | `Code.gs` | Legacy facility affiliate redirect / logged redirect flow. | High: anonymous route mutates click counters and redirect pool state. | Cloud Run RedirectService. |
| `mode=conference-asset-submit` | `handleConferenceAssetSubmitPage_` | `Code.gs` / Sheet 7 files | Conference asset submission page. | Medium. | ConferenceCampaignService. |
| `mode=conference-campaign-submit` | `handleConferenceCampaignSubmitPage_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Conference campaign submission page. | High: public form writes campaign rows. | Advertiser/Conference campaign API. |
| `mode=conference-campaign-click` | `handleConferenceCampaignClick_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | CTA redirect/logging. | High. | RedirectService. |
| `mode=conference-showcase-json` | `handleConferenceShowcaseJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Showcase card JSON/JSONP. | Medium. | Conference Showcase API backed by Firestore/BigQuery. |
| `mode=conference-campaign-click-json` | `handleConferenceCampaignClickJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | JSONP click logging and redirect URL. | High. | RedirectService event endpoint. |
| `mode=conference-campaign-edit` | `handleConferenceCampaignEditPage_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Campaign edit page. | High: public mutation flow if tokening is weak. | Authenticated dashboard route. |
| `mode=conference-campaign-preview` | `handleConferenceCampaignPreviewPage_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Preview page. | Medium. | Preview API/dashboard. |
| `mode=conference-campaign-manager-json` | `handleConferenceCampaignManagerJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Manager JSON for campaign operations. | High. | Authenticated Admin/Advertiser API. |
| `mode=conference-campaign-submit-json` | `handleConferenceCampaignSubmitJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | AJAX submit. | High. | Authenticated campaign submission API. |
| `mode=conference-campaign-edit-json` | `handleConferenceCampaignEditJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | AJAX edit. | High. | Authenticated campaign update API. |
| `mode=conference-campaign-order-json` | `handleConferenceCampaignOrderJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Showcase order save. | High. | Admin approval-gated ordering API. |
| `mode=conference-showcase-page-view-json` | `handleConferenceShowcasePageViewJson_` | `Code.gs` / `Sheet7ConferenceCampaignsUnified.gs` | Showcase view logging. | Medium. | Event logging API / BigQuery stream. |
| `mode=provider-playlist` | `handleProviderPlaylistQr_` | `Code.gs` / `Sheet6VideoCampaigns.gs` | Provider playlist QR redirect. | High. | RedirectService. |
| `mode=video-campaign-qr` | `handleVideoCampaignQrScan_` | `Code.gs` / `Sheet6VideoCampaigns.gs` | Sheet 6 QR scan and redirect. | Critical. | RedirectService. |
| `mode=video-campaign-qr-json` | `handleVideoCampaignQrJson_` | `Code.gs` / `Sheet6VideoCampaigns.gs` | JSONP QR scan redirect. | Critical. | RedirectService. |
| `mode=video-campaign-qr-continue` | `handleVideoCampaignQrContinue_` | `Code.gs` / `Sheet6VideoCampaigns.gs` | Intermediate QR continuation. | High. | RedirectService. |
| `mode=digital-signage-status` | `handleDigitalSignageMode_` | `Sheet6VideoCampaigns.gs` | Provider digital signage status. | Medium. | Media Center API. |
| `mode=digital-signage-toggle` | `handleDigitalSignageMode_` | `Sheet6VideoCampaigns.gs` | Provider digital signage toggle. | High: public route writes provider state. | Authenticated Media Center API. |
| `mode=conference-events-json` | `handleConferenceEventsJson_` | `Code.gs` / `Sheet7ProviderConferenceCampaigns.gs` | Public event marketplace data. | Medium. | Conference Events API. |
| `mode=conference-org-lookup` | `handleConferenceOrgLookup_` | `Code.gs` / `Sheet7ProviderConferenceCampaigns.gs` | Organization lookup. | Medium. | Authenticated org lookup API. |
| `mode=conference-create-invoice-redirect` | `handleConferenceCreateInvoiceRedirectPage_` | `Code.gs` / Sheet 7 files | Opens/creates conference payment page. | Critical: billing action. | BillingService with approval/dry-run. |
| `mode=conference-create-invoice` | `handleConferenceCreateInvoiceEndpoint_` | `Code.gs` / Sheet 7 files | Creates conference invoice. | Critical. | BillingService endpoint. |
| `mode=directory-json` | `handleDirectoryJson_` | `Code.gs` | Directory payload. | Medium. | Media Center API. |
| `mode=directory-facility-json` | `handleDirectoryFacilityJson_` | `BusinessDirectory.gs` | Facility-specific directory payload. | Medium. | Media Center API. |
| `mode=directory-facility-jsonp` | `handleDirectoryFacilityJsonp_` | `BusinessDirectory.gs` | JSONP facility directory. | Medium. | CORS-enabled API, no JSONP. |
| `mode=directory-display-pref` | `handleDirectoryDisplayPref_` | `BusinessDirectory.gs` | Provider display preference checkbox. | Critical: provider approval writes. | Authenticated Media Center preference API. |
| `mode=directory-campaign-go` | `handleDirectoryCampaignGo_` | `BusinessDirectory.gs` | Provider campaign redirect. | High. | RedirectService. |
| `mode=directory-campaign-continue-log` | `handleDirectoryCampaignContinueLog_` | `BusinessDirectory.gs` | Logs redirect continuation. | High. | RedirectService event logging. |
| `mode=directory-video-go` | `handleDirectoryVideoGo_` | `BusinessDirectory.gs` | Provider-to-video campaign redirect. | High. | RedirectService. |
| `mode=directory-enter-log` | `handleDirectoryEnterLog_` | `BusinessDirectory.gs` | Directory page visit log. | Medium. | Event logging API. |
| `mode=campaign-creative-html` | `doGet` branch | `Code.gs` / `Sheet6VideoCampaigns.gs` | Campaign creative HTML. | Medium. | `drip-creative-player` / renderer API. |
| `mode=provider-base-creative-html` | `doGet` branch | `Code.gs` / `Sheet6VideoCampaigns.gs` | Provider base creative HTML. | Medium. | Creative renderer API. |
| `mode=right-bar-html` | `doGet` branch | `Code.gs` / `Sheet6VideoCampaigns.gs` | Screen right bar HTML. | Medium. | `drip-creative-player`. |
| `mode=provider-player-html` | `doGet` branch | `Code.gs` / `Sheet6VideoCampaigns.gs` | Provider player HTML. | Medium. | `drip-creative-player`. |
| `POST mode=billingWebhook` | `handleBillingWebhook_` | `Code.gs` | Apps Script billing webhook target. | Critical. | Cloud Run Stripe webhook handler writes directly to Firestore/BillingService. |
| `POST /stripe-webhook` | Cloud Run Express route | `index.js` | Verifies Stripe signature and forwards simplified payload to Apps Script. | Critical: financial state bridge. | Keep Cloud Run but remove Apps Script forwarding. |
| `GET /` | Cloud Run Express route | `index.js` | Health check. | Low. | Keep. |
| `GET /healthz` | `healthz` | `services/segment-api/main.py` | Segment API health check. | Low. | Keep behind monitored Cloud Run health check. |
| `POST /segments/preview` | `preview_segment` | `services/segment-api/main.py` | Non-persistent provider segment preview from `drip_marts.targetable_providers`. | Medium: query cost/data exposure if public. | Authenticated MarketIntelligenceService preview endpoint. |
| `POST /segments/create` | `create_segment` | `services/segment-api/main.py` | Persists segment definition and membership rows to `drip_marts.segments` and `drip_marts.segment_membership`. | Critical: public unauthenticated route can create BigQuery records if deployed as shown. | Admin/Advertiser API with auth, approval/audit, and rate limits. |
| `GET /segments/{segment_id}/providers` | `list_segment_providers` | `services/segment-api/main.py` | Lists providers in a saved segment. | High: provider list exposure if public. | Authenticated MarketIntelligenceService read endpoint. |

## C. Triggers

| triggerType | functionName | sourceSpreadsheet | frequencyOrEvent | currentPurpose | riskLevel | replacementPlan |
| --- | --- | --- | --- | --- | --- | --- |
| Spreadsheet on edit | `onEdit_Sheet4` | Sheet 4 new medical venue form | On edit | Provider/facility intake finalization. | High | Cloud Run intake processor; Admin review queue. |
| Time-based | `checkConferenceFundingDeadlines` | Sheet 7 | Daily/time-based | Conference deadline/funding checks. | High | Cloud Scheduler + ConferenceService. |
| Time-based | `runWeeklyCampaignAnalyticsScheduled` | Multiple sheets | Weekly/time-based | Campaign analytics emails. | Medium | Cloud Scheduler + ReportingService. |
| Spreadsheet on edit | `onEdit_Sheet7ProviderConferenceCampaigns` | Sheet 7 | On edit | Conference event finalization/approval. | High | Authenticated Admin Dashboard workflow. |
| Time-based | `finalizeSquarespaceRows` | Sheets 1/2 | Time-based | Batch raw form finalization. | High | IntakeProcessor. |
| Spreadsheet on edit | `onEdit_Sheet1` | Sheet 1 | On edit | Legacy patient campaign pending flag. | High | Legacy archive after Patient Campaign migration. |
| Spreadsheet on edit | `onEdit_Sheet2` | Sheet 2 | On edit | Advertiser signup normalization. | High | IntakeProcessor. |
| Spreadsheet on edit | `onEdit_Sheet3` | Sheet 3 | On edit | Approval market consolidation. | Medium | Media Center approval API. |
| Time-based | `expireConferencePurchaseHolds` | Sheet 7 | Time-based | Expire 24-hour holds. | High | Cloud Scheduler + Billing/ConferenceService. |
| Time-based | `finalizeUnfinalizedProviderConferenceCampaignRows` | Sheet 7 | Time-based | Backstop event row finalization. | Medium | ConferenceService job. |
| Trigger creator | `setupTriggers` | Project | Manual run | Deletes all project triggers then recreates subset. | Critical | Replace with infrastructure-as-code and approval-gated admin control. |
| Trigger creator | `createStripeCustomerSyncMaintenanceTrigger` | Project | Manual run creates daily trigger | Stripe customer maintenance. | High | Cloud Scheduler, no Apps Script trigger mutation. |
| Trigger creator | `createSheet2StripeCustomerSyncTrigger` | Project | Manual run creates every-5-min trigger | Sync recent Sheet 2 signups. | High | IntakeProcessor job. |

## D. Sheets And Tabs

| spreadsheetNameOrNumber | spreadsheetId | tabName | currentPurpose | sourceOfTruthStatus | futureRole | migrationNotes |
| --- | --- | --- | --- | --- | --- | --- |
| Sheet 1 Community Partner Campaigns | `1in2q8wS-F_6u0JK76id_uDjeEfijLii7tNVpWhZBBZI` | Community partner campaigns | Legacy patient/community campaign intake and click tracking. | Legacy operational source. | Historical archive/migration bridge. | Retire after Patient Campaign migration; preserve history. |
| Sheet 1 | same | Search Interest Scores | Search-interest campaign scoring. | Analytics helper. | BigQuery market signal table. | Move to `market.search_interest_signals`. |
| Sheet 1 | same | Google Ads Scores | Search/ads score source. | Analytics helper. | BigQuery raw/staging table. | Validate source freshness. |
| Sheet 2 New Business Automated Form | `1l-YcIsYVcR_VE2cX3gUH7Ydkrx6s0pbiNcv8d1E2mrk` | New business automated form | Advertiser/vendor/employer intake. | Raw intake plus operational ID source. | Raw intake only during transition. | Normalize to advertisers/organizations. |
| Sheet 2 | same | Promo Code Config | Promo rules. | Operational config. | Firestore pricing/promo config. | Approval-gated migration. |
| Sheet 2 | same | Promo Usage Log | Promo application log. | Operational log. | BigQuery + Firestore billing item details. | Preserve for reconciliation. |
| Sheet 2 | same | Monthly Billing Preview | Billing preview rows. | Operational billing prep. | BillingService preview collection. | Approval-gated. |
| Sheet 2 | same | Monthly Billing Summary | Billing summary and Stripe status. | Operational billing state. | BillingService / billingItems. | Must reconcile before cutover. |
| Sheet 2 | same | Monthly Billing Email Drafts | Email draft staging. | Operational email prep. | Billing dashboard email preview. | Keep until Billing Review exists. |
| Sheet 2 | same | Billing Config | Rates, Stripe customers, billing active flags. | Critical billing source. | Firestore billing profiles + Secret Manager references. | High-priority migration. |
| Sheet 2 | same | Invoice Log | Stripe invoice status log. | Billing audit source. | BillingService audit log + BigQuery. | Preserve immutable history. |
| Sheet 3 Business Approvals | `19HDyl7dgikMODCTvWdoqE3xnd8rBGInXGNYmeGRkEHQ` | Business approvals | Provider display preferences via Media Center checkbox. | Operational approval source. | `displayApprovals` collection. | Enforce providerId + advertiserId approval. |
| Sheet 4 New Medical Venue Automated Form | `1H57Nw_z5TnOf0yYrhVaXIfoplbMdskjnKbe-laTuM7o` | New medical venue automated form | Provider/facility intake. | Raw intake plus provider ID source. | Raw intake only during transition. | Normalize to providers/facilities. |
| Sheet 4 | same | Redirect Pools | Legacy patient campaign rotation pool. | Operational routing source. | Retired; replaced by placement records. | High-risk legacy dependency. |
| Sheet 4 | same | System Dashboard | Apps Script dashboard. | Operational status helper. | Admin Dashboard System Health. | Replace. |
| Sheet 4 | same | Directory events | Media Center entry logs. | Analytics log. | BigQuery event table. | Migrate event logging. |
| Sheet 5 Directory Campaigns | `1Pl6mM8U64DSxIiqlvQAu7SaPj68_HvkpPqT0W7vx8pk` | Directory campaigns | Provider-facing Media Center campaigns. | Operational campaign source. | `campaigns` with type MEDIA_CENTER. | Rename user-facing terms to Media Center. |
| Sheet 5 | same | Audit Log | Directory redirect/audit log. | Operational log. | BigQuery + auditLogs. | Preserve. |
| Sheet 5 | same | System Dashboard | Directory metrics. | Operational dashboard. | Admin Dashboard. | Replace. |
| Sheet 6 Video Campaigns | `1hlvORJBWB8gRjuV_R3wDzm7exxiJc_Bbrhjb18SsjI0` | Video Campaigns | Patient screen video campaign intake/status/billing/QR. | Critical operational source. | `campaigns`, `campaignCreatives`, `placements`. | Highest migration priority after foundation. |
| Sheet 6 | same | Sheet 6 QR Scan Log | Patient Campaign QR scan events. | Analytics/operational log. | BigQuery redirect events. | Move to RedirectService. |
| Sheet 6 | same | Digital Signage Providers | Provider signage opt-in/status. | Operational provider display state. | Media Center provider settings. | Authenticated provider flow. |
| Sheet 6 | same | Rate Card - Video | Video pricing. | Operational pricing config. | Firestore pricing/rate cards. | Support dynamic pricing. |
| Sheet 6 | same | Video Campaign Registry | Campaign registry. | Operational registry. | Firestore campaigns. | Migrate IDs. |
| Sheet 6 | same | Approval Map | Provider/advertiser approval map. | Operational approval source. | `displayApprovals`. | Merge with Sheet 3 approval semantics. |
| Sheet 6 | same | ScreenCloud Provider Screens | Provider screen inventory and ScreenCloud IDs. | Operational display inventory. | `screens`/`placements` plus adapter metadata. | First DisplayProviderService migration source. |
| Sheet 6 | same | Video Campaign Placements | Screen placement rows. | Operational placement source. | `placements`. | Preserve external IDs as adapter fields. |
| Sheet 6 | same | Click Log | Legacy QR/click log. | Analytics log. | BigQuery redirect events. | Migrate. |
| Sheet 6 | same | Playback Log | ScreenCloud proof-of-play log. | Analytics/billing source. | BigQuery playback log. | Critical billing dependency. |
| Sheet 6 | same | Video Billing Summary | Video billing prep. | Billing source. | BillingService summary table/collection. | Reconcile carefully. |
| Sheet 6 | same | Provider Revenue Share | Provider share prep. | Billing/report source. | Revenue share service/report. | Approval-gated payouts. |
| Sheet 7 Provider Conference Campaigns | `1nWrt-7ZiGNgzIpsRpgIIAMKPBPbSZpyEVQO6PZkxw_k` | Provider Conference Campaigns | Conference event marketplace/source. | Operational source. | `conferenceEvents`. | Normalize event inventory. |
| Sheet 7 | same | Conference Showcase Page View Log | Showcase page views. | Analytics log. | BigQuery engagement events. | Migrate. |
| Sheet 7 | same | Conference Campaign Submissions | Conference sponsor campaign submissions. | Operational campaign source. | `campaigns` with type CONFERENCE. | Safety/lifecycle migration. |
| Sheet 7 | same | Conference Screen Placements | Conference display placements. | Operational placement source. | `placements`. | ScreenCloud adapter migration. |
| Sheet 7 | same | Conference Event Screens | Conference screen inventory. | Operational display inventory. | `screens`/`displayProviderResources`. | Validate external IDs. |
| Sheet 7 | same | Conference Campaign Click Log | CTA clicks. | Analytics log. | BigQuery redirect events. | Migrate. |
| Sheet 7 | same | Conference Purchase Log | Purchase holds, invoices, payment status. | Critical billing source. | BillingService + conference purchases. | Approval-gated migration. |
| Sheet 7 | same | Conference Video Asset Submissions | Conference video assets. | Operational asset source. | campaignCreatives. | Migrate files/URLs. |
| Sheet 7 | same | Conference Print Asset Submissions | Conference print/showcase assets. | Operational asset source. | campaignCreatives. | Migrate. |

## E. External Write Functions

| functionName | externalSystem | writeType | dryRunAvailable | productionRisk | requiredApprovalBeforeUse |
| --- | --- | --- | --- | --- | --- |
| `createStripeInvoiceForClicks_` | Stripe | Create/finalize/send invoice and invoice item. | No true dry-run in function. | Critical | Billing Admin approval. |
| `createStripeInvoiceForMonthlyBillingSummary_` | Stripe | Create/finalize/send multi-line invoice. | Preview exists separately, not enforced. | Critical | Billing Admin approval. |
| `createConferenceStripeInvoice_` | Stripe | Conference invoice creation. | Not enforced. | Critical | Billing Admin approval. |
| `voidConferenceStripeInvoice_` | Stripe | Void invoice. | No. | Critical | Billing Admin approval and rollback note. |
| `ensureStripeCustomerForOrganization_` | Stripe | Create/update customer. | No. | High | Billing/Admin approval until migrated. |
| `syncAllStripeCustomersFromBillingConfig` | Stripe | Batch customer updates. | No. | High | Billing/Admin approval. |
| `syncReadyVideoPlacementsToScreenCloud` | ScreenCloud | Create content and add to playlist. | Yes, separate dry-run function. | Critical | Display sync approval. |
| `createScreenCloudYouTubeContentForPlacement_` | ScreenCloud | Create app instance/content. | No internal dry-run. | Critical | Display sync approval. |
| `addScreenCloudContentToCampaignPlaylist_` | ScreenCloud | Add content to playlist. | No internal dry-run. | Critical | Display sync approval. |
| `createScreenCloudCampaignVideoLink_` | ScreenCloud | Create video link. | No internal dry-run. | Critical | Display sync approval. |
| `addCampaignVideoLinkToProviderMainZone_` | ScreenCloud | Modify channel/zone. | No internal dry-run. | Critical | Display sync approval. |
| `updateScreenCloudMainZoneListFromScratch_` | ScreenCloud | Replace channel zone list. | No internal dry-run. | Critical | Display sync approval. |
| `rebuildScreenCloudMainZoneFromScratch_` | ScreenCloud | Rebuild channel from placements. | Related audit function exists. | Critical | Display sync approval. |
| `createScreenCloudProviderPlaylistApp_` | ScreenCloud | Create provider playlist app/content. | No. | High | Display sync approval. |
| `createScreenCloudRightBarLink_` | ScreenCloud | Create right bar link. | No. | High | Display sync approval. |
| `createScreenCloudProviderContentPlaylist_` | ScreenCloud | Create provider playlist. | No. | High | Display sync approval. |
| `setupConferenceScreenCloudChannelsForAllEventScreens` | ScreenCloud | Create/assign channels. | Test function exists, not dry-run guarantee. | Critical | Display sync approval. |
| `assignScreenCloudChannelToScreen_` | ScreenCloud | Assign channel to screen. | No. | Critical | Display sync approval. |
| `syncReadyConferenceScreenPlacementsToScreenCloud` | ScreenCloud | Create links/content and add to channel. | `dryRunConferenceScreenPlacements` previews placements only. | Critical | Display sync approval. |
| `rebuildConferenceScreenCloudChannelsFromPlacements` | ScreenCloud | Rebuild conference channel playlists. | No enforced dry-run. | Critical | Display sync approval. |
| `MailApp.sendEmail` callers | Email | Sends welcome, billing, conference, analytics emails. | Some draft flows exist. | Medium | Messaging approval for new templates/production sends. |
| `UrlFetchApp.fetch` safety checks | External URL/Safe Browsing/Vimeo/Vision | Reads external URLs; can call paid APIs. | Mostly read-only. | Medium | API key/service approval. |
| `postJsonPreservePostAcrossRedirects_` | Apps Script web app | Forwards Stripe webhook event. | No. | Critical | Replace before Phase 1 production billing work. |
| `create_segment` | BigQuery | Inserts segment and segment membership rows. | No. | Critical | Require auth, approval/audit policy, and production write approval before use. |
| `medicaid_to_gcs_bq.py --execute` | Google Cloud Storage / BigQuery | Uploads CSV to raw bucket and loads BigQuery table. | Yes, dry-run is default. | High | Dataset load approval and staging validation before execute. |
| `cloudbuild.yaml` deploy step | Cloud Run | Builds, pushes, and deploys `drip-segment-api` with public invoker. | No. | Critical | Deployment approval, auth decision, backup/rollback, and service account review. |

## F. Secrets And Config Findings

No unredacted high-confidence secret value is repeated here. Findings identify locations and names only.

| finding | sourceLocation | riskLevel | recommendedFix |
| --- | --- | --- | --- |
| Safe Browsing API key configured as code constant, redacted in aggregate. | `Code.gs` near `SAFE_BROWSING_API_KEY`. | High | Move to Secret Manager / environment config and central SafetyService. |
| Stripe secret read from Apps Script Script Properties. | `Code.gs` `getStripeSecretKey_`, `stripeRequest_`. | Critical | Move Stripe integration to Cloud Run with Secret Manager. |
| Billing webhook shared secret stored in Script Properties. | `Code.gs` `BILLING_WEBHOOK_SHARED_SECRET`. | High | Move to Secret Manager; rotate; stop forwarding to Apps Script. |
| Generated billing webhook shared secret is logged. | `Code.gs` `rotateBillingWebhookSharedSecret`. | Critical | Stop logging secret material; rotate secret. |
| Token signing secret self-generated in Script Properties. | `Code.gs` `getTokenSecret_`. | High | Move to Secret Manager and managed token service. |
| ScreenCloud token/endpoint/space/app install IDs in Script Properties. | `Sheet6VideoCampaigns.gs` `getScreenCloudConfig_`. | Critical | Move to Secret Manager and DisplayProviderService. |
| ScreenCloud playback token in Script Properties. | `ScreenCloudPlaybackBilling.gs` `fetchScreenCloudPlaybackLogs_`. | High | Move to Secret Manager and PlaybackIngestion job. |
| Google Vision API key Script Property setter/getter. | `Sheet7ConferenceCampaignsUnified.gs` `setGoogleVisionApiKeyForDrip`, `getGoogleVisionApiKey_`. | High | Move to Secret Manager; remove code setter. |
| Vimeo access token in Script Properties. | `Sheet7ConferenceCampaignsUnified.gs` `getVimeoAccessToken_`. | High | Move to Secret Manager. |
| Web app URL hardcoded in Apps Script and HTML pages. | `WEB_APP_BASE_URL`, repeated `WEB_APP_URL` in conference HTML pages. | Medium | Use environment config; route through Cloud Run. |
| Cloud Run Stripe webhook env vars. | `index.js` `STRIPE_WEBHOOK_SECRET`, `APPS_SCRIPT_WEBHOOK_URL`, `BILLING_WEBHOOK_SHARED_SECRET`, `STRIPE_SECRET_KEY`. | High | Confirm Secret Manager-backed env injection and remove placeholder fallback. |
| Segment API env/config. | `services/segment-api/main.py` uses `GOOGLE_CLOUD_PROJECT`, `GCP_PROJECT`, `BQ_MARTS_DATASET`; `cloudbuild.yaml` sets project and `BQ_MARTS_DATASET`. | Medium | Keep non-secret config in environment; verify service account least privilege. |
| Dataform placeholder project config. | `dataform/dataform.json` uses `CHANGE_ME_PROJECT_ID`. | Low | Replace only through environment-specific config/release settings; do not commit production identifiers unnecessarily. |
| Repo ZIP secret scan result. | Reviewed files in `drip-platform-main.zip`. | Low | No unredacted high-confidence secret values observed in the ZIP snapshot; still run formal secret scanning on imported repo. |
| OAuth scopes broad for Apps Script. | `Appsscript.json`. | High | Reduce Apps Script role after migration; use least-privilege service accounts. |

## G. Legacy Retirement Candidates

| functionNameOrFile | currentPurpose | replacementRequired | deletionRisk | deleteOnlyAfter |
| --- | --- | --- | --- | --- |
| `Code.gs` Sheet 1 finalizer block | Legacy patient/community campaign intake. | Patient Campaign IntakeProcessor + Firestore campaign schema. | Critical | Sheet 1 dependencies are zero and historical export exists. |
| `rebuildRedirectPoolsFromSheet1` | Rebuilds legacy redirect pools. | PlacementService/RedirectService. | High | All redirects use Firestore placements. |
| `Redirect Pools` tab | Legacy routing source. | `placements` collection and RedirectService. | Critical | QR traffic and click counts migrated/reconciled. |
| `createStripeInvoicesFromMonthlyBillingSummary_LEGACY_CLICK_ONLY_` | Legacy click-only invoice creation. | Integrated BillingService. | Critical | BillingService accepted and old invoice path disabled. |
| `runMonthlyBillingAutomationWithStripeInvoices` | Legacy billing automation. | BillingService monthly workflow. | Critical | Dry-run reconciliation passes. |
| `setupTriggers` | Trigger reset utility. | IaC/admin-managed scheduler. | Critical | Cloud Scheduler and admin controls replace Apps Script triggers. |
| `onEdit_Sheet1` | Legacy Sheet 1 edit flag. | No new Sheet 1 workflow. | High | Sheet 1 read-only archive accepted. |
| `onEdit_Sheet5` | Sheet 5 directory campaign edit handling. | Media Center Campaign API. | Medium | Sheet 5 migrated. |
| `onEdit_Sheet6` | Sheet 6 video campaign edit handling. | Patient Campaign API. | High | Sheet 6 migrated. |
| `handleDirectoryDisplayPref_` writing Sheet 3 | Provider display approval from public route. | Authenticated Media Center approval API. | Critical | Provider preference UI live and audited. |
| Conference HTML hardcoded web app pages | Public web pages call Apps Script JSONP. | Authenticated/controlled dashboard and Cloud Run API. | Medium | Pages regenerated against new API. |
| ScreenCloud direct mutation helpers in Apps Script | Direct external display writes. | DisplayProviderService. | Critical | Adapter dry-run/approval flow accepted. |
| `ScreenCloudPlaybackBilling.gs` Sheet-based billing prep | ScreenCloud playback -> billing sheet. | BigQuery ingestion + BillingService. | High | BigQuery playback reconciliation passes. |
| `StripeCustomerSync.gs` Apps Script customer sync | Stripe customer maintenance. | BillingService customer sync. | High | BillingService owns customer profiles. |
| `Sheet7ProviderConferenceCampaigns.gs` purchase/inventory/billing routes | Conference marketplace and billing in Sheets. | ConferenceService + BillingService. | Critical | Conference workflow migrated and reconciled. |

## H. Phase 1 Blockers

| blocker | whyItMatters | requiredInput | recommendedResolution |
| --- | --- | --- | --- |
| Repo ZIP validates only the market intelligence scaffold. | It resolves part of the repo evidence gap, but not Apps Script deployed source parity, runtime load order, tests, branch status, or sources for all Cloud Run services. | Deployed Apps Script export/source order, live service inventory, and full repo/branch status. | Treat Phase 1 as local contracts/planning only until parity and load order are verified. |
| `setupTriggers` deletes all project triggers. | Running it could remove production triggers beyond the visible list. | Trigger inventory and approval owner. | Do not run; replace with Cloud Scheduler/IaC plan. |
| Public anonymous Apps Script web app is a large mutation router. | `doGet`/`doPost` can read/write many sheets and handle billing redirects. | Route traffic/usage evidence. | Phase 1 must design RedirectService/Admin APIs before cutover. |
| Duplicate/overridden functions exist across billing and conference files. | Runtime resolution risk in Apps Script global namespace. | Exact deployment source order. | De-duplicate before or during service extraction. |
| Billing state is spread across Sheet 2, Sheet 6, Sheet 7, Stripe, and Cloud Run forwarder. | Financial actions can duplicate or drift. | Billing reconciliation samples. | BillingService schema and dry-run reconciliation first. |
| Provider display approval currently appears in Sheet 3 and Sheet 6 Approval Map. | Consent semantics can drift. | Canonical approval decision. | Create `displayApprovals` model and migration map. |
| ScreenCloud write helpers lack enforced approval gates. | Sync/rebuild functions can alter live screens. | Display sync owner and rollback snapshots. | Build DisplayProviderService with dry-run-only first. |
| Secrets/config remain in Script Properties and env vars. | Secret rotation and least privilege are hard to audit. | Current secret inventory from admins. | Secret Manager migration plan before production writes. |
| BigQuery `targetable_providers` dataset mismatch is unresolved in live state. | Aggregate says `drip_core.targetable_providers` was not found; repo ZIP defines `drip_marts.targetable_providers`, but live table existence/callers were not queried. | BigQuery table location confirmation and caller inventory. | Verify dataset/table map before Phase 3 and align all callers to the mart. |
| Segment API source deploys publicly and includes a persistent create route. | `cloudbuild.yaml` uses `--allow-unauthenticated`; Terraform grants `allUsers` invoker; `POST /segments/create` writes BigQuery rows. | Deployment posture, IAM policy, and intended access model. | Require auth/RBAC/rate limits before any production use. |
| Apps Script has broad OAuth scopes. | Large blast radius if web app or script is abused. | Security owner and migration timeline. | Reduce Apps Script after Cloud Run replacements. |

## I. Repo ZIP Snapshot Validation

| Item | Source-verified status | What remains unresolved |
| --- | --- | --- |
| ZIP identity | Archive root is `drip-platform-main/`; archive comment identifies commit `0a6b3ad49657e059ec830d627ce89d45fa3e8a44`; archive contains 39 files. | No `.git` metadata, remote branch, PR status, or uncommitted Cloud Shell changes can be verified from the ZIP. |
| Source coverage | Market intelligence scaffold: `README.md`, Terraform, Dataform, Medicaid ingest helper, Segment API, Cloud Build. | No Apps Script source tree and no source for several Cloud Run services named in the aggregate. |
| Terraform | Provisions buckets, BigQuery datasets `drip_raw`, `drip_core`, `drip_marts`, Artifact Registry repo `drip`, and Cloud Run service `drip-segment-api`. | Does not prove these resources are deployed or current in production. |
| Cloud Build | Builds/pushes `services/segment-api` and deploys `drip-segment-api` in `us-east1` with `BQ_MARTS_DATASET=drip_marts`. | Does not prove the latest deployed image equals this ZIP. |
| Public access posture | Terraform grants `allUsers` `roles/run.invoker`; Cloud Build deploy step includes `--allow-unauthenticated`. | Intended security posture and production IAM policy need owner confirmation. |
| Segment API | FastAPI exposes `/healthz`, `/segments/preview`, `/segments/create`, and `/segments/{segment_id}/providers`. | Auth, rate limiting, audit logging, and write approval are absent from source snapshot. |
| Dataform datasets | `dataform.json` defaults to `drip_core`; mart definitions explicitly publish `drip_marts.targetable_providers`, `drip_marts.segments`, and `drip_marts.segment_membership`. | Live dataset/table existence and scheduled Dataform runs were not verified. |
| Raw source references | Dataform reads `drip_raw.medicaid_claims`, `drip_raw.nppes_*`, `drip_raw.feeder_edges`, and disabled placeholder `drip_raw.medicare_claims`. | Source freshness, row counts, schema quality, and Medicare readiness are unresolved. |
| Ingest helper | `jobs/ingest/medicaid_to_gcs_bq.py` is dry-run by default and writes only with `--execute`. | Production dataset load policy and approval owner remain required. |
| Secrets | No unredacted high-confidence secret values observed in reviewed ZIP files. | Formal repo secret scan and live Secret Manager/property audit still required. |

## J. Repo ZIP BigQuery And Dataform Inventory

| datasetOrTable | sourceFile | role | notes |
| --- | --- | --- | --- |
| `drip_raw.medicaid_claims` | `jobs/ingest/medicaid_to_gcs_bq.py`, `utilization_events_medicaid.sqlx` | Raw Medicaid claims/utilization input. | Ingest helper dry-runs by default; execute loads BigQuery. |
| `drip_raw.nppes_*` | `providers.sqlx`, `provider_locations.sqlx` | Provider reference and locations. | Wildcard raw source; schema/freshness not verified. |
| `drip_raw.feeder_edges` | `referral_edges.sqlx` | Referral/influence graph input. | Live table not verified. |
| `drip_raw.medicare_claims` | `utilization_events_medicare_placeholder.sqlx` | Future Medicare utilization input. | Dataform model is disabled placeholder. |
| `drip_core.providers` | `providers.sqlx` | Canonical provider rollup. | Built from NPPES raw tables. |
| `drip_core.provider_locations` | `provider_locations.sqlx` | Canonical provider location/market mapping. | Built from NPPES raw tables. |
| `drip_core.referral_edges` | `referral_edges.sqlx` | Canonical referral edges. | Feeds influence scoring. |
| `drip_core.utilization_events_medicaid` | `utilization_events_medicaid.sqlx` | Medicaid utilization normalization. | Feeds canonical utilization events. |
| `drip_core.utilization_events` | `utilization_events.sqlx` | Canonical utilization events. | Unions Medicaid; Medicare gated by Dataform var and disabled placeholder. |
| `drip_core.procedure_mix` | `procedure_mix.sqlx` | Provider procedure share by market and period. | Feeds targetable providers. |
| `drip_core.influence_scores` | `influence_scores.sqlx` | Market-normalized provider influence score. | Feeds targetable providers. |
| `drip_marts.targetable_providers` | `targetable_providers.sqlx` | Provider targeting mart. | Segment API reads this table. |
| `drip_marts.segments` | `segments.sqlx` | Saved segment definitions. | Segment API writes this table. |
| `drip_marts.segment_membership` | `segment_membership.sqlx` | Saved segment provider membership. | Segment API writes this table. |

## K. Phase 1 Non-Production Foundation Artifacts

These artifacts were added locally for review and testing only. They do not verify or mutate live production state.

| Artifact | Purpose | Production posture |
| --- | --- | --- |
| `packages/shared/src/status/index.js` | Shared enums/constants for campaign, safety, billing, placement, job, dataset, approval, feature flag, display provider, external write, and review statuses. | Contract-only. |
| `packages/shared/src/schemas/entities.js` | Schema descriptors for Phase 1 entities and operational models. | Contract-only. |
| `packages/shared/src/contracts/dry-run-guard.js` | Guard helper requiring explicit `dryRun=false` plus approval reference before future external writes. | Preventive contract; no external calls. |
| `packages/shared/src/contracts/policies.js` | Campaign lifecycle, display preference, and experiment safety rules. | Local validation only. |
| `packages/shared/src/contracts/display-provider.js` | DisplayProviderService method contract and ScreenCloud/DirectDrip/Future/Manual stubs. | Stubs cannot perform live writes. |
| `packages/shared/test/contracts.test.js` | Local tests for schemas, dry-run, lifecycle, display approval, experiment safety, feature flags, jobs, Codex review items, and datasets. | Credential-free tests. |
| `docs/phase-1-foundation-contracts.md` | Review summary for the Phase 1 package. | Documentation only. |
| `docs/bigquery-schema.md` | Non-production BigQuery schema plan. | No live BigQuery changes. |

## L. Phase 1.5 Local Service Skeleton Artifacts

These artifacts were added locally for review and testing only. They use mock repositories and do not connect to production.

| Artifact | Purpose | Production posture |
| --- | --- | --- |
| `packages/services/src/admin-api.js` | Local Admin Dashboard API handlers for health, jobs, errors, review queues, flags, data jobs, display, backups, and change requests. | Mock data only. |
| `packages/services/src/intake-service.js` | Local intake validation and normalization drafts. | No live Sheets/Squarespace access. |
| `packages/services/src/safety-service.js` | Local URL shape checks, safety review drafts, and lifecycle enforcement. | No live URL fetching. |
| `packages/services/src/redirect-service.js` | Local redirect event builders and mock destination selection. | No public deploy or traffic handling. |
| `packages/services/src/display-service.js` | Local display-provider adapter skeletons requiring explicit `dryRun=true`. | No ScreenCloud/display-provider writes. |
| `packages/services/src/billing-service.js` | Local billing preview, charge, revenue-share, and invoice-preview objects. | No Stripe access. |
| `packages/services/src/backup-service.js` | Local backup job drafts, dry-run summaries, and restore-test request drafts. | No backup execution. |
| `packages/services/src/dataset-ingestion-service.js` | Local dataset metadata validation and dry-run BigQuery load plan. | No Cloud Storage or BigQuery access. |
| `packages/services/src/intelligence-service.js` | Local market opportunity and recommendation drafts with source placeholders. | No BigQuery/search/payor calls. |
| `packages/services/src/daily-orchestrator.js` | Local dry-run daily job definitions and job/error output. | No scheduler. |
| `packages/services/src/codex-review.js` | Local Phase 1.5 Codex Review Queue item generator. | No dashboard write. |
| `packages/services/test/services.test.js` | Local service skeleton tests. | Credential-free tests. |
| `docs/phase-1-5-local-service-skeletons.md` | Review summary for the Phase 1.5 package. | Documentation only. |
