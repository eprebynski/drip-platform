# Display Provider Abstraction

## Objective

Build future screen placement so Drip is not permanently dependent on ScreenCloud. ScreenCloud should be the first adapter behind a DisplayProviderService.

## Source-Verified Current ScreenCloud Surface

| Current workflow | Source-verified functions/tabs | Risk |
| --- | --- | --- |
| Sheet 6 patient video placements | `Video Campaign Placements`, `ScreenCloud Provider Screens`, `generateVideoCampaignPlacements`, `syncReadyVideoPlacementsToScreenCloud`, `runVideoCampaignScreenCloudSync`, `rebuildScreenCloudMainZoneFromScratch_`. | Critical external write risk. |
| Sheet 6 playback ingestion | `Playback Log`, `ingestScreenCloudPlaybackLogs`, `fetchScreenCloudPlaybackLogs_`, `rollupSheet6PlaybackStats`. | Billing/revenue dependency. |
| Provider playlist QR | `handleProviderPlaylistQr_`, provider playlist QR target/image columns. | Redirect and display dependency. |
| Conference screen placements | `Conference Event Screens`, `Conference Screen Placements`, `syncReadyConferenceScreenPlacementsToScreenCloud`, `rebuildConferenceScreenCloudChannelsFromPlacements`. | Critical external write risk. |
| Conference playback rollup | `rollupConferenceScreenPlaybackStatsFromScreenCloudLog`. | Reporting dependency. |

Repo ZIP note: `drip-platform-main.zip` does not include ScreenCloud adapter source or display-provider service code. Current display-provider evidence remains aggregate-sourced Apps Script evidence only; live ScreenCloud state and deployed adapter parity remain unresolved.

Phase 1 adds `packages/shared/src/contracts/display-provider.js`, which defines the DisplayProviderService method surface and non-production stubs for ScreenCloud, DirectDripPlayer, FutureProvider, and ManualExport. These stubs intentionally cannot perform live writes.

Phase 1.5 adds `packages/services/src/display-service.js`, whose local adapters require explicit `dryRun=true` for write-like methods and return preview objects only.

## Internal Placement Record

| Field | Purpose |
| --- | --- |
| placementId | Internal placement ID. |
| campaignId | Campaign being displayed. |
| providerId | Provider organization. |
| facilityId | Facility/location. |
| screenId | Internal screen ID. |
| displayProvider | ScreenCloud, DirectDripPlayer, FutureProvider, ManualExport. |
| externalScreenId | Provider-specific screen ID. |
| externalChannelId | Provider-specific channel ID. |
| externalPlaylistId | Provider-specific playlist ID. |
| externalContentId | Provider-specific content ID. |
| creativeRenderUrl | Drip-rendered creative asset. |
| qrTargetUrl | Drip redirect URL. |
| placementStatus | DRAFT, READY, ACTIVE, PAUSED, EXPIRED, BLOCKED. |
| syncStatus | NOT_SYNCED, DRY_RUN_OK, SYNCED, FAILED, NEEDS_REVIEW. |
| lastSyncedAt | Last provider sync timestamp. |
| errorDetails | Sync error and remediation notes. |

## DisplayProviderService Methods

| Method | Purpose |
| --- | --- |
| validateConfig() | Confirm credentials/config without changing provider state. |
| listScreens() | Retrieve display inventory. |
| listChannels() | Retrieve channel inventory. |
| previewPlacement() | Build proposed provider changes. |
| createContent() | Create provider content after approval. |
| updateContent() | Update provider content after approval. |
| removeContent() | Remove provider content after approval. |
| rebuildPlaylist() | Rebuild provider playlist from internal placements. |
| syncPlacement() | Apply approved placement changes. |
| fetchPlaybackLogs() | Ingest playback/proof-of-play data. |
| dryRunSync() | Preview changes without writing externally. |

## Adapter Strategy

| Adapter | Role |
| --- | --- |
| ScreenCloudAdapter | First implementation for current display provider. |
| DirectDripPlayerAdapter | Future native player integration. |
| FutureProviderAdapter | Placeholder contract for additional display providers. |
| ManualExportAdapter | Generates export files when API sync is not available. |

## Safety And Approval Gates

| Operation | Gate |
| --- | --- |
| Preview placement | Safe to automate. |
| Dry-run sync | Safe to automate. |
| Create/update/remove external content | Requires approval until stable and explicitly feature-flagged. |
| Rebuild playlist | Requires approval in production. |
| Fetch playback logs | Safe to automate if read-only credentials and rate limits are respected. |

## Acceptance Criteria

| Area | Criteria |
| --- | --- |
| Internal state | Placement records are independent of ScreenCloud names. |
| Dry-run | Admin can preview ScreenCloud changes before write. |
| Sync | Production sync writes jobRuns, auditLogs, and errors. |
| Playback | Playback logs can be fetched and loaded into analytics. |
| Rollback | Last known placement snapshot can be reviewed and restored through approval-gated process. |
| Phase 1 contracts | Adapter stubs and dry-run tests pass locally without ScreenCloud credentials. |
| Phase 1.5 skeletons | Local adapters block omitted dryRun write attempts and pass local tests without display-provider credentials. |
