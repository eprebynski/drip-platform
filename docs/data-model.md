# Data Model

## Modeling Principles

Firestore is the operational source of truth. BigQuery is the analytics and market intelligence warehouse. Google Sheets are raw intake, admin review, and migration bridge only.

Phase 1 contract source: `packages/shared/src/schemas/entities.js` now defines local schema descriptors for the Firestore-style operational entities listed below. These contracts are non-production and do not write Firestore.

Phase 1.5 service skeletons in `packages/services` create local draft objects from these contracts. They do not persist data to Firestore, BigQuery, Sheets, or any live service.

## Source-Verified Current Sources

| Current source | Target model impact |
| --- | --- |
| Sheet 1 Community Partner Campaigns plus Redirect Pools | Legacy patient campaign archive and redirect migration. |
| Sheet 2 advertiser intake, Billing Config, monthly billing tabs, Invoice Log, Promo tabs | advertisers, billingProfiles, billingItems, promoCodes, invoiceEvents. |
| Sheet 3 Business Approvals | displayApprovals. |
| Sheet 4 provider intake and Directory events | providers, facilities, event logs. |
| Sheet 5 Directory Campaigns and Audit Log | Media Center campaigns and redirect/audit events. |
| Sheet 6 Video Campaigns, Approval Map, ScreenCloud Provider Screens, Video Campaign Placements, QR Scan Log, Playback Log, Video Billing Summary, Provider Revenue Share | Patient Campaigns, placements, display provider resources, redirect events, playback events, billing/revenue share. |
| Sheet 7 Provider Conference Campaigns, Purchase Log, Campaign Submissions, Screen Placements, Event Screens, Click Log, Showcase Page View Log, Asset Submissions | Conference events, conference campaigns, purchases, placements, engagement events, campaign creatives. |

## Core Firestore Collections

| Collection | Purpose | Key fields |
| --- | --- | --- |
| organizations | Shared organization profile for advertisers, providers, employers, and Drip-owned entities. | organizationId, organizationType, name, status, createdAt, updatedAt |
| advertisers | Advertiser-specific account and eligibility data. | advertiserId, organizationId, eligibilityStatus, billingProfileId, primaryContact, createdAt |
| providers | Provider organization records created during provider signup. | providerId, organizationId, facilities, mediaCenterStatus, createdAt |
| facilities | Provider facility/location records. | facilityId, providerId, address, timezone, status, screenCount |
| users | User profile mapped to auth identity and RBAC roles. | userId, authUid, organizationId, roles, status, lastLoginAt |
| campaigns | Unified campaign record for Patient, Media Center, and Conference campaigns. | campaignId, advertiserId, campaignType, status, safetyStatus, billingStatus, campaignStartDate, campaignEndDate, budget, budgetRange, rateType, rateAmount, pricingTier, dynamicPricingInputs |
| campaignCreatives | Video, landing page, QR, and rendered creative metadata. | creativeId, campaignId, creativeType, sourceUrl, renderUrl, safetyStatus, metadata |
| campaignSafetyReviews | Automated and human safety review records. | safetyReviewId, campaignId, checks, status, reviewerId, notes, createdAt |
| displayApprovals | Provider-specific display approval. | approvalId, providerId, advertiserId, displayApproved, source, approvedAt, revokedAt |
| placements | Internal placement source of truth. | placementId, campaignId, providerId, facilityId, screenId, displayProvider, externalScreenId, externalChannelId, externalPlaylistId, externalContentId, creativeRenderUrl, qrTargetUrl, placementStatus, syncStatus, lastSyncedAt, errorDetails |
| redirectEvents | Operational QR redirect event records before analytics export. | eventId, campaignId, placementId, providerId, qrTargetUrl, occurredAt, userAgentHash, referrer |
| experiments | Experiment configuration. | experimentId, name, experimentType, status, startDate, endDate, successMetric, trafficSplit, safetyStatus |
| experimentVariants | Variant-level safety and traffic details. | variantId, experimentId, label, targetUrl, creativeId, safetyStatus, trafficWeight |
| billingItems | Billing preview, approval, and execution state. | billingItemId, campaignId, rateType, amount, currency, status, dryRunResult, approvalId, stripeObjectRef |
| revenueShareItems | Provider revenue share calculations and approvals. | revenueShareItemId, providerId, campaignId, amount, status, calculationVersion |
| datasetUploads | Dataset upload metadata and processing state. | datasetUploadId, sourceType, fileRef, schemaStatus, qualityStatus, loadStatus, approvedBy |
| marketRecommendations | Generated recommendations for dashboards. | recommendationId, advertiserId, marketOpportunityScore, specialtyOpportunityScore, payorOpportunityScore, advertiserFitScore, recommendedCampaignType, suggestedMarkets, suggestedSpecialties, suggestedBudgetRange, reasoningText, dataFreshnessWarnings |
| jobRuns | Shared job execution log. | jobRunId, jobType, dryRun, status, startedAt, completedAt, counts, errors, relatedReviewItems |
| humanReviewTasks | Exception queue for human action. | taskId, taskType, riskLevel, relatedEntityType, relatedEntityId, status, assignedRole, dueAt |
| featureFlags | Runtime feature and rollout controls. | flagKey, enabled, environment, rolloutPercent, allowedActors, approvalStatus |
| changeRequests | Proposed changes requiring approval. | changeRequestId, title, summary, riskLevel, status, requestedBy, approvedBy, rollbackPlan |
| auditLogs | Immutable operational action log. | auditLogId, actorType, actorId, action, entityType, entityId, beforeHash, afterHash, createdAt |
| backups | Backup metadata and restore-test records. | backupId, backupType, status, targets, artifactRefs, startedAt, completedAt, restoreTestStatus |
| codexTasks | Codex rebuild task tracking. | codexTaskId, phase, title, prompt, branch, prUrl, status, startedAt, completedAt, summary, riskLevel, nextRecommendedTask |
| codexReviewItems | Dashboard-readable review packets. | reviewItemId, codexTaskId, title, summary, fullOutput, copyForChatGPT, suggestedNextPrompt, riskLevel, status, requiresApproval, createdAt, updatedAt |
| codexArtifacts | Files, docs, or outputs produced by Codex. | artifactId, codexTaskId, artifactType, pathOrUrl, checksum, createdAt |
| codexPromptHistory | Prompt history for ChatGPT/Codex handoff. | promptId, codexTaskId, promptText, source, createdBy, createdAt, resultStatus |
| rebuildApprovals | Approval records for rebuild actions. | approvalId, entityType, entityId, approvalType, status, approverId, approvedAt |

## Campaign Required Fields

| Field | Requirement |
| --- | --- |
| campaignType | PATIENT, MEDIA_CENTER, or CONFERENCE. |
| campaignStartDate/campaignEndDate | Required before scheduling or activation. |
| safetyStatus | Must be APPROVED before SCHEDULED or ACTIVE. |
| billingStatus | Must be ready/approved for paid activation. |
| budget/budgetRange | Required for budget-based model and recommendations. |
| rateType/rateAmount/pricingTier | Supports CPC, sponsorship/package, flat fee, dynamic pricing, or future models. |
| dynamicPricingInputs | Stores future pricing inputs without hard-coding $1 per click. |

## Provider Display Approval

Provider signup creates only the provider organization. It does not create display approval.

Display approval is created only when a provider checks a vendor/employer display preference checkbox in the Media Center.

Unique key: providerId + advertiserId.

Required fields: providerId, advertiserId, displayApproved, source, approvedAt, revokedAt, updatedBy.

Source-verified migration note: approval-like data currently appears in Sheet 3 `Business approvals` and Sheet 6 `Approval Map`. Phase 1 must define a canonical migration rule so `displayApproved` is created only from explicit provider preference/approval evidence, not from provider signup.

## BigQuery Tables

Source-verified ZIP note: the uploaded repo ZIP defines current market intelligence models in `drip_raw`, `drip_core`, and `drip_marts`. The targeting mart is `drip_marts.targetable_providers`; aggregate evidence separately noted that `drip_core.targetable_providers` was not found. Treat live table location and caller alignment as unresolved until a read-only production review confirms them.

Phase 1 non-production BigQuery target schemas are documented in [bigquery-schema.md](/Users/crashdavis/Documents/Codex/2026-07-02/use-the-best-codex-model-available/docs/bigquery-schema.md). No live BigQuery tables were created or altered.

| Dataset/table | Purpose |
| --- | --- |
| drip_raw.medicaid_claims | Raw Medicaid utilization input loaded by the dry-run-default ingest helper. |
| drip_raw.nppes_* | Provider reference and location raw input. |
| drip_raw.feeder_edges | Referral graph raw input for influence scoring. |
| drip_core.providers | Canonical provider rollup. |
| drip_core.provider_locations | Canonical provider market/location mapping. |
| drip_core.utilization_events | Canonical provider-market-period-procedure utilization events. |
| drip_core.procedure_mix | Provider procedure share by market and period. |
| drip_core.influence_scores | Provider influence score by market. |
| drip_marts.targetable_providers | Source-defined provider targeting mart used by the Segment API. |
| drip_marts.segments | Saved segment definitions written by Segment API create route. |
| drip_marts.segment_membership | Saved segment provider membership written by Segment API create route. |
| analytics.qr_events | QR scans and redirect events. |
| analytics.playback_logs | Display playback logs from ScreenCloud and future providers. |
| analytics.campaign_daily_summary | Daily campaign performance summaries. |
| analytics.media_center_engagement | Provider-facing engagement events. |
| market.provider_reference | Provider/facility taxonomy and location data. |
| market.payor_reference | Government and commercial payor datasets. |
| market.claims_procedure_mix | Claims/procedure mix intelligence. |
| market.search_interest_signals | Google Search/search-interest trend data. |
| market.conference_events | Conference/event datasets and metadata. |
| market.recommendation_features | Versioned recommendation input features. |
| market.recommendation_outputs | Historical recommendation outputs and freshness warnings. |
| ops.job_run_exports | Exported job logs for reporting and monitoring. |

## Data Governance

| Control | Requirement |
| --- | --- |
| No PHI design statement | Campaign and analytics workflows should avoid collecting PHI. |
| Data retention | Define retention by collection/table before enterprise onboarding. |
| Least privilege | Service accounts should access only required collections, buckets, datasets, and secrets. |
| Auditability | All state transitions and production-impacting operations write audit logs. |
| Backups | Firestore, BigQuery, Sheets, Apps Script source, Cloud Run definitions, GitHub snapshots, Storage metadata, ScreenCloud snapshots, Stripe references, flags, and change requests must be backed up. |
