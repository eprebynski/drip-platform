# Non-Production BigQuery Schema Plan

## Scope

This document defines Phase 1 schema targets only. No live BigQuery datasets or tables were created or altered.

## Raw Tables

| Table | Purpose | Key fields |
| --- | --- | --- |
| `raw_dataset_uploads` | Dataset upload metadata and source file lineage. | datasetId, datasetType, storagePath, originalFilename, fileHash, uploadedBy, sourceFreshnessDate, createdAt |
| `raw_form_submissions` | Raw Squarespace/sheet intake bridge records. | submissionId, sourceSystem, sourceSheet, payloadJson, receivedAt, processedStatus |
| `raw_google_search_interest` | Search interest and Google Ads/search signal imports. | signalId, market, specialty, query, score, sourceDate, importedAt |
| `raw_payor_government` | Medicare/Medicaid/government payor source rows. | sourceRowId, payerSource, market, state, npi, serviceDate, procedureGroup, volume |
| `raw_payor_commercial` | Commercial payor source rows. | sourceRowId, payerSource, market, state, npi, serviceDate, procedureGroup, volume |
| `raw_provider_directory` | Provider, facility, NPPES, directory source rows. | sourceRowId, npi, providerName, specialty, taxonomyCode, address, market, importedAt |

## Core Tables

| Table | Purpose | Key fields |
| --- | --- | --- |
| `core_providers` | Canonical provider and organization reference. | providerId, organizationId, npi, providerName, specialtyRollup, status |
| `core_advertisers` | Canonical advertiser reference. | advertiserId, organizationId, advertiserName, eligibilityStatus, billingAccountId |
| `core_campaigns` | Campaign operational snapshot for analytics. | campaignId, advertiserId, campaignType, campaignStatus, safetyStatus, billingStatus, campaignStartDate, campaignEndDate |
| `core_placements` | Internal placement and display-provider state. | placementId, campaignId, providerId, facilityId, displayProvider, placementStatus, syncStatus |
| `core_events` | Canonical event stream for redirects, QR scans, playback, Media Center, billing, and campaign actions. | eventId, eventType, relatedEntityType, relatedEntityId, occurredAt, payloadJson |

## Marts

| Table | Purpose | Key fields |
| --- | --- | --- |
| `mart_market_opportunity` | Market-level opportunity scoring. | market, state, specialty, marketOpportunityScore, sourceDatasetIds, generatedAt |
| `mart_advertiser_recommendations` | Advertiser-facing recommendation outputs. | recommendationId, advertiserId, recommendedCampaignType, suggestedMarkets, suggestedSpecialties, suggestedBudgetRange, reasoningText, generatedAt |
| `mart_campaign_performance` | Campaign performance reporting. | campaignId, date, impressions, qrScans, clicks, conversions, spend, revenueShare |
| `mart_payor_market_mix` | Payor/procedure mix by market. | market, state, payerSource, procedureGroup, procedureShare, periodStart |
| `mart_provider_specialty_density` | Provider density and specialty concentration. | market, state, specialtyRollup, providerCount, densityScore |
| `mart_screen_inventory` | Screen inventory and display capacity. | providerId, facilityId, screenId, displayProvider, capacityStatus, lastSeenAt |
| `mart_conference_opportunity` | Conference event and sponsorship opportunity scoring. | conferenceEventId, market, specialty, sponsorSlots, opportunityScore, generatedAt |

## Source-Verified Alignment Note

The uploaded repo ZIP defines `drip_marts.targetable_providers` for the current Segment API. The live location of `targetable_providers` remains unresolved and must be confirmed before production recommendations or table migrations are implemented.
