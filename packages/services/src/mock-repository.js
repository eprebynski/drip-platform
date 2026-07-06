import {
  ApprovalStatus,
  BillingStatus,
  CampaignStatus,
  CampaignType,
  DatasetType,
  DisplayProviderType,
  JobStatus,
  PlacementStatus,
  ReviewItemStatus,
  SafetyStatus,
  createDefaultFeatureFlagRecords
} from "../../shared/src/index.js";
import { createJobLog, nowIso } from "./local-utils.js";

export function createMockRepository() {
  const now = nowIso();
  return {
    jobs: [
      createJobLog("processIntakeSubmissions", {
        dryRun: true,
        recordsRead: 2,
        recordsCreated: 0
      })
    ],
    errors: [],
    humanReviewTasks: [
      {
        taskId: "task_mock_safety",
        taskType: "CAMPAIGN_SAFETY",
        riskLevel: "MEDIUM",
        relatedEntityType: "campaign",
        relatedEntityId: "campaign_patient_mock",
        status: "OPEN",
        assignedRole: "Drip Campaign Reviewer",
        createdAt: now,
        updatedAt: now
      }
    ],
    codexReviewItems: [
      {
        reviewItemId: "review_phase_1_5_mock",
        codexTaskId: "codex_phase_1_5",
        title: "Phase 1.5 Local Service Skeletons",
        summary: "Local-only skeleton review item.",
        filesChanged: ["packages/services"],
        riskLevel: "MEDIUM",
        requiresHumanApproval: true,
        copyForChatGPT: "Review Phase 1.5 local skeletons.",
        status: ReviewItemStatus.NEEDS_CHATGPT_REVIEW,
        createdAt: now,
        updatedAt: now
      }
    ],
    featureFlags: createDefaultFeatureFlagRecords("LOCAL"),
    datasetIngestionJobs: [
      createJobLog("datasetIngestionDryRun", {
        dryRun: true,
        approvalRequired: true,
        recordsRead: 1
      })
    ],
    intelligenceRefreshJobs: [
      createJobLog("refreshMarketIntelligence", {
        dryRun: true,
        approvalRequired: true,
        warnings: ["BigQuery targetable_providers location unresolved."]
      })
    ],
    displayPlacements: [
      {
        placementId: "placement_mock_1",
        campaignId: "campaign_patient_mock",
        providerId: "provider_mock",
        displayProvider: DisplayProviderType.SCREEN_CLOUD,
        placementStatus: PlacementStatus.SYNC_READY,
        syncStatus: "DRY_RUN_ONLY",
        createdAt: now,
        updatedAt: now
      }
    ],
    backupJobs: [
      createJobLog("runDailyBackups", {
        dryRun: true,
        approvalRequired: true,
        warnings: ["No live backup execution in Phase 1.5."]
      })
    ],
    changeRequests: [
      {
        changeRequestId: "change_phase_1_5",
        title: "Review local service skeletons",
        summary: "Approve contracts before production-connected implementation.",
        riskLevel: "MEDIUM",
        status: ApprovalStatus.PENDING,
        requestedBy: "codex",
        rollbackPlan: "No production changes to roll back.",
        createdAt: now,
        updatedAt: now
      }
    ],
    campaigns: [
      {
        campaignId: "campaign_patient_mock",
        advertiserId: "advertiser_mock",
        campaignType: CampaignType.PATIENT_CAMPAIGN,
        campaignName: "Mock patient campaign",
        campaignStartDate: "2026-08-01T00:00:00.000Z",
        campaignEndDate: "2026-08-31T23:59:59.000Z",
        safetyStatus: SafetyStatus.APPROVED,
        campaignStatus: CampaignStatus.SCHEDULED,
        billingStatus: BillingStatus.APPROVED,
        landingPageUrl: "https://example.com/patient",
        videoUrl: "https://example.com/video.mp4",
        marketTargets: ["NY"],
        specialtyTargets: ["cardiology"],
        creativeAssets: [],
        createdAt: now,
        updatedAt: now
      }
    ],
    experimentVariants: [
      {
        experimentVariantId: "variant_safe",
        experimentId: "experiment_mock",
        label: "Safe",
        safetyStatus: SafetyStatus.APPROVED,
        trafficWeight: 100,
        targetUrl: "https://example.com/safe",
        createdAt: now,
        updatedAt: now
      }
    ],
    datasets: [
      {
        datasetId: "dataset_mock",
        datasetName: "Mock government payor file",
        datasetType: DatasetType.GOVERNMENT_PAYOR,
        sourceType: "mock_upload",
        uploadedBy: "local_admin",
        storagePath: "local://mock/government-payor.csv",
        originalFilename: "government-payor.csv",
        fileHash: "sha256:mock",
        schemaStatus: "PENDING",
        validationStatus: "PENDING",
        ingestionStatus: "DRY_RUN_ONLY",
        targetBigQueryDataset: "drip_raw",
        targetBigQueryTable: "raw_payor_government",
        dataQualityWarnings: [],
        notes: "Local-only mock dataset.",
        createdAt: now,
        updatedAt: now
      }
    ],
    status: {
      mode: "LOCAL_ONLY",
      productionWritesEnabled: false,
      liveCredentialsRequired: false,
      blockers: [
        "DEPLOYED_APPS_SCRIPT_PARITY_UNRESOLVED",
        "APPS_SCRIPT_RUNTIME_LOAD_ORDER_UNRESOLVED",
        "LIVE_CLOUD_RUN_IAM_STATE_UNRESOLVED",
        "BIGQUERY_TARGETABLE_PROVIDERS_LOCATION_UNRESOLVED",
        "APPROVAL_OWNERS_UNRESOLVED",
        "SECRET_MANAGER_MIGRATION_UNRESOLVED",
        "LIVE_ROUTE_USAGE_UNRESOLVED"
      ]
    }
  };
}
