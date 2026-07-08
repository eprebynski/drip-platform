import path from 'node:path';

export const APPS_SCRIPT_DEPENDENCY_TEMPLATE_RELATIVE_PATH = path.join(
  'apps-script',
  'apps-script-dependency-verification-template.md'
);

export function appsScriptDependencyVerificationTemplate() {
  return `# Apps Script Dependency Verification Template

This local/private template is a manual verification aid for Phase 2.12. It does not authorize Apps Script changes, live Sheet changes, production cutover, replacement, or Phase 3 dataset ingestion.

Use sanitized evidence only. Keep raw exports, screenshots, URLs, IDs, form responses, customer data, payment data, cookies, tokens, and credentials outside the repo under ~/Documents/Drip/private-evidence/.

## Evidence Boundary

| Field | Value |
| --- | --- |
| Evidence collected by | UNKNOWN |
| Evidence collected at | UNKNOWN |
| Source type | UNKNOWN |
| Raw evidence location | ~/Documents/Drip/private-evidence/apps-script |
| Sanitized summary location | ~/Documents/Drip/private-evidence/sanitized-summaries |
| Raw snippets committed to Git | NO |
| Production impact | NONE |
| Phase 3 started | NO |
| Apps Script changes | NONE |
| Live Sheet changes | NONE |
| Manual review complete | UNKNOWN |

## Apps Script Project Inventory

Do not include private deployment URLs, tokens, or unredacted project identifiers. Use REDACTED or UNKNOWN when a value is sensitive.

| Project label | Script/project ID status | Deployment status | Owner | Linked Google Sheet, if any | Current role | Evidence confidence | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UNKNOWN | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Project ID, owner, deployment parity, source version, linked Sheet, current role |

## Web App Deployment Inventory

Do not include full script URLs or AKfy-style deployment identifiers. Keep URLs redacted.

| Deployment label | Web app URL status | Execute-as setting | Access setting | Version/deployment status | Known public callers | Evidence confidence | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UNKNOWN | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Web app URL, execute-as, access, version, callers, active status |

## doGet / doPost / Mode Inventory

Suggested migration dispositions: REBUILD_IN_CLOUD_RUN, REPLACE_WITH_DASHBOARD_FLOW, REPLACE_WITH_CLOUD_SCHEDULER_JOB, REPLACE_WITH_FIRESTORE_OR_BIGQUERY_PIPELINE, KEEP_TEMPORARY_ROLLBACK_ONLY, RETIRE, UNKNOWN.

Suggested replacement targets: API route, Dashboard flow, Cloud Run job, Cloud Scheduler job, Firestore write, BigQuery event pipeline, Cloud Storage upload flow, Stripe webhook/service, Screen/display provider adapter, Conference service, Auth/user service, UNKNOWN.

| Mode or handler | doGet/doPost/route/function | Purpose | Public route or form that calls it | Linked Sheet | Reads from | Writes to | Future replacement target | Migration disposition | Evidence confidence | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Handler, caller, source version, read/write behavior, replacement target |

## Trigger Inventory

| Trigger name | Trigger type | Schedule/event source | Function called | Linked Sheet | Purpose | Future replacement target | Migration disposition | Evidence confidence | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Trigger existence, schedule, function, owner, replacement target |

## Google Sheet Read/Write Map

Use the Phase 2.11 logical Sheet model below. Do not physically rename live Sheets in this phase.

| Current Sheet number or label | Spreadsheet ID status | Tab name | Apps Script function/mode | Reads/writes/appends | Criticality | Future logical Sheet area | Future Firestore target | Future BigQuery target | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| Legacy Archive: Old Sheet 1 Campaigns | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Legacy Archive: Old Sheet 1 Campaigns | UNKNOWN | Optional historical BigQuery archive | Sheet ID, tabs, dependencies, archive scope |
| Sheet 1 | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Sheet 1: Provider Intake | providerOrganizations, providerFacilities, users, organizationMemberships, providerUserAffiliateLinks | UNKNOWN | Sheet ID, tabs, intake mappings, owners |
| Sheet 2 | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Sheet 2: Advertiser Intake | advertiserOrganizations, advertiserProfiles, billingAccounts, billingEvents, invoiceEvents, promoCodes | UNKNOWN | Sheet ID, tabs, intake mappings, billing bridge |
| Sheet 3 | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Sheet 3: Provider Display Preferences | providerDisplayPreferences, providerUserPreferenceSignals, displayPreferenceChangeEvents | UNKNOWN | Sheet ID, tabs, preference schema, display eligibility dependency |
| Sheet 4 | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Sheet 4: Provider Campaigns | campaigns, campaignCreatives, campaignAudienceTargets, campaignEvents, billingEvents | UNKNOWN | Sheet ID, tabs, campaign schema, media dependencies |
| Sheet 5 | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Sheet 5: Conference Campaigns | conferenceEvents, conferenceSponsorshipInventory, conferenceReservations, conferenceWaitlistEntries, conferencePurchaseEvents, campaigns, billingEvents | UNKNOWN | Sheet ID, tabs, conference inventory, purchase/refund workflow |
| Sheet 6 | REDACTED_OR_UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Sheet 6: Patient Campaigns | campaigns, campaignCreatives, campaignPlacements, campaignPlacementEligibility, patientScreenQrScanEvents, patientScreenPlaybackEvents, billingEvents, providerRevenueShareEvents | UNKNOWN | Sheet ID, tabs, display eligibility, billing, revenue share |

## Public Caller / Route Map

| Current public page or route | Calls Apps Script? | Mode/handler called | User-facing purpose | Replacement target | Cutover risk | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Caller, handler, traffic, route ownership, rollback behavior |

## Workflow Classification

| Workflow | Current Apps Script dependency | Linked Sheet | Future backend owner | Migration disposition | Phase 3 blocker | Still UNKNOWN |
| --- | --- | --- | --- | --- | --- | --- |
| Provider signup | UNKNOWN | UNKNOWN | Auth/user service or provider intake API | UNKNOWN | UNKNOWN | Current handler, Sheet, notifications, owner |
| Advertiser/vendor/employer signup | UNKNOWN | UNKNOWN | Advertiser intake API or dashboard flow | UNKNOWN | UNKNOWN | Current handler, Sheet, billing bridge |
| Provider display preferences | UNKNOWN | UNKNOWN | Provider preferences service | UNKNOWN | UNKNOWN | Current mode, write target, display eligibility link |
| Provider Campaigns | UNKNOWN | UNKNOWN | Campaign service | UNKNOWN | UNKNOWN | Current data model, media, billing dependency |
| Patient Campaigns | UNKNOWN | UNKNOWN | Campaign/display placement service | UNKNOWN | UNKNOWN | QR, video, billing, revenue share dependency |
| Conference Campaigns | UNKNOWN | UNKNOWN | Conference service | UNKNOWN | UNKNOWN | Inventory, reservation, showcase, purchase flow |
| QR redirects | UNKNOWN | UNKNOWN | Redirect service | UNKNOWN | UNKNOWN | Active routes, analytics, rollback route map |
| Patient Campaign QR scan logging | UNKNOWN | UNKNOWN | Event pipeline | UNKNOWN | UNKNOWN | Current logging destination, billing/revenue impact |
| Video/playback billing | UNKNOWN | UNKNOWN | Billing/event service | UNKNOWN | UNKNOWN | Current playback source, billing formula |
| Provider revenue share | UNKNOWN | UNKNOWN | Billing/revenue share service | UNKNOWN | UNKNOWN | Current calculation, Sheet, approval owner |
| Stripe invoicing | UNKNOWN | UNKNOWN | Stripe service | UNKNOWN | UNKNOWN | Current bridge, webhook/invoice owner |
| Welcome emails | UNKNOWN | UNKNOWN | Notification service | UNKNOWN | UNKNOWN | Current sender, trigger, templates |
| ScreenCloud/display provider operations | UNKNOWN | UNKNOWN | Display provider adapter | UNKNOWN | UNKNOWN | Current caller, writes, rollback path |
| YouTube/playlist operations | UNKNOWN | UNKNOWN | Media service | UNKNOWN | UNKNOWN | Current playlist operations, owner |
| Market intelligence uploads | UNKNOWN | UNKNOWN | Dataset upload or market intelligence service | UNKNOWN | UNKNOWN | Current upload path, storage, review owner |
| Admin review workflows | UNKNOWN | UNKNOWN | Admin dashboard review queue | UNKNOWN | UNKNOWN | Current approvals, owners, status source |
| Other | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | Additional workflows discovered during review |

## Cutover Readiness

| Apps Script dependency | Replacement exists? | Replacement tested? | Backup exists? | Rollback path exists? | Owner assigned? | Ready for cutover? | Notes |
| --- | --- | --- | --- | --- | --- | --- | --- |
| UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | UNKNOWN | NO | Keep cutover blocked until dependency, replacement, backup, rollback, and owner are verified. |

## Do Not Commit Raw Evidence

- Do not commit raw Apps Script exports.
- Do not commit private deployment URLs.
- Do not commit AKfy IDs.
- Do not commit tokens, cookies, credentials, customer data, payment data, raw form responses, screenshots, or unredacted private exports.
- Keep raw evidence under ~/Documents/Drip/private-evidence/.
- Commit only summarized, sanitized findings after Drip/ChatGPT review.
- Preserve UNKNOWN for any fact that is not verified by sanitized evidence.
`;
}
