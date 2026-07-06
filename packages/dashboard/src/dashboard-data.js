import {
  CodexReviewItemSchema,
  DatasetType,
  DisplayProviderType,
  JobStatus,
  ReviewItemStatus,
  validateSchema
} from "../../shared/src/index.js";
import {
  ScreenCloudAdapter,
  buildAdvertiserRecommendationDraft,
  buildBillingPreview,
  buildMarketOpportunityScoreDraft,
  createAdminApi,
  createBackupJobDraft,
  createDatasetMetadataDraft,
  createDryRunBackupSummary,
  createDryRunBigQueryLoadPlan,
  createErrorLog,
  createInvoicePreviewObject,
  createJobLog,
  createMockRepository,
  createPhase15CodexReviewItem,
  createRestoreTestRequestDraft,
  nowIso,
  runAllDailyJobsDryRun
} from "../../services/src/index.js";

export const REVIEW_STATUS_VALUES = Object.freeze(Object.values(ReviewItemStatus));

export const HUMAN_REVIEW_STATUS_VALUES = Object.freeze([
  "OPEN",
  "IN_REVIEW",
  "NEEDS_CHATGPT_REVIEW",
  "NEEDS_DRIP_APPROVAL",
  "APPROVED",
  "CHANGES_REQUESTED",
  "SENT_BACK_TO_CODEX",
  "RESOLVED",
  "ARCHIVED"
]);

export const LEGACY_CUTOVER_BLOCKERS = Object.freeze([
  {
    key: "DEPLOYED_APPS_SCRIPT_PARITY_UNRESOLVED",
    label: "deployed Apps Script parity",
    status: "BLOCKED"
  },
  {
    key: "APPS_SCRIPT_RUNTIME_LOAD_ORDER_UNRESOLVED",
    label: "Apps Script runtime load order",
    status: "BLOCKED"
  },
  {
    key: "LIVE_ROUTE_USAGE_UNRESOLVED",
    label: "live route usage",
    status: "BLOCKED"
  },
  {
    key: "SECRET_MANAGER_MIGRATION_UNRESOLVED",
    label: "Secret Manager migration",
    status: "BLOCKED"
  },
  {
    key: "APPROVAL_OWNERS_UNRESOLVED",
    label: "approval owners",
    status: "BLOCKED"
  },
  {
    key: "BIGQUERY_TABLE_MAP_UNRESOLVED",
    label: "BigQuery table map",
    status: "BLOCKED"
  }
]);

export const PRODUCTION_POLICY = Object.freeze({
  mode: "LOCAL_ONLY",
  productionWritesEnabled: false,
  credentialsRequired: false,
  liveCredentialEnvNames: [],
  externalServiceCalls: {
    appsScript: false,
    googleSheets: false,
    firestore: false,
    bigQuery: false,
    stripe: false,
    screenCloud: false,
    displayProvider: false,
    cloudRunDeploy: false
  },
  blockedActions: [
    "Apps Script changes",
    "Apps Script trigger changes",
    "Live Google Sheets writes",
    "Live Firestore writes",
    "Live BigQuery writes",
    "Stripe writes",
    "ScreenCloud or display-provider writes",
    "Campaign activation, pause, expiration, or deactivation",
    "Legacy Apps Script deletion",
    "Production resource creation",
    "Deploys"
  ]
});

const PHASE_2_FILES = Object.freeze([
  "packages/dashboard",
  "docs/admin-dashboard-spec.md",
  "docs/codex-task-plan.md",
  "docs/acceptance-tests.md",
  "docs/risk-register.md",
  "docs/phase-2-admin-dashboard-mvp.md"
]);

export function createPhase2CodexReviewItem(overrides = {}) {
  const now = nowIso();
  const item = {
    reviewItemId:
      overrides.reviewItemId ?? "review_phase_2_admin_dashboard_mvp",
    codexTaskId:
      overrides.codexTaskId ?? "codex_phase_2_admin_dashboard_mvp",
    phase: "Phase 2",
    title: "Drip Admin Dashboard MVP with Codex Review Queue",
    summary:
      overrides.summary ??
      "Local-only admin dashboard shell backed by Phase 1 shared contracts, Phase 1.5 mock services, in-memory review status updates, and no live credentials.",
    fullOutput: overrides.fullOutput ?? "",
    filesChanged: overrides.filesChanged ?? [...PHASE_2_FILES],
    riskLevel: overrides.riskLevel ?? "MEDIUM",
    requiresHumanApproval: true,
    productionImpact:
      overrides.productionImpact ??
      "None. Local-only dashboard, mock repositories, dry-run plans, and no production API calls.",
    tests:
      overrides.tests ??
      [
        "Dashboard snapshot loads from mock repositories",
        "Codex Review Queue shape includes copyForChatGPT and promptBackToCodex",
        "Feature flags remain OFF",
        "Dry-run status and unresolved blockers are visible",
        "No production credentials or service calls are required"
      ],
    unresolvedBlockers:
      overrides.unresolvedBlockers ??
      LEGACY_CUTOVER_BLOCKERS.map((blocker) => blocker.label),
    approvalsNeeded:
      overrides.approvalsNeeded ??
      [
        "Drip review of Phase 2 dashboard MVP",
        "ChatGPT/Codex review before Phase 3 dataset implementation",
        "Separate production approval before any live service connection"
      ],
    copyForChatGPT:
      overrides.copyForChatGPT ??
      buildCopyForChatGPT({
        phase: "Phase 2",
        title: "Drip Admin Dashboard MVP with Codex Review Queue",
        summary:
          "Review the local-only dashboard MVP. Confirm the module coverage, review queue workflow, feature-flag visibility, and production guardrails before any Phase 3 work.",
        filesChanged: PHASE_2_FILES,
        riskLevel: "MEDIUM",
        productionImpact:
          "None. No deploys, no live credentials, no Apps Script, Sheets, Firestore, BigQuery, Stripe, ScreenCloud, or campaign-state writes.",
        tests:
          "Dashboard tests, shared/service tests, app smoke check, and secret-pattern scan.",
        approvalsNeeded:
          "Drip review and ChatGPT review before Phase 3. Production approvals remain blocked by unresolved legacy/parity items.",
        openQuestions:
          "Who owns approval decisions, and which deployed Apps Script/routes remain live?",
        recommendedNextCodexPrompt:
          "After Phase 2 review, implement Phase 3 dataset ingestion and market intelligence staging using local mocks first; keep production writes blocked."
      }),
    promptBackToCodex:
      overrides.promptBackToCodex ??
      "After Phase 2 review is approved, implement Phase 3 dataset ingestion and market intelligence staging with mock/local data first. Do not connect BigQuery, Google Search, or live payor sources until approval owners, table map, IAM, and Secret Manager blockers are resolved.",
    status: overrides.status ?? ReviewItemStatus.NEEDS_CHATGPT_REVIEW,
    createdAt: now,
    updatedAt: now
  };

  return {
    item,
    validation: validateSchema(CodexReviewItemSchema, item)
  };
}

export function createDashboardSnapshot(repository = createMockRepository()) {
  const api = createAdminApi(repository);
  const dailyResults = runAllDailyJobsDryRun();
  const dailyJobs = dailyResults.map((result) => result.jobLog);
  const mockFailedJob = createJobLog("mockDashboardReviewFailure", {
    dryRun: true,
    status: JobStatus.FAILED,
    errorCount: 1,
    approvalRequired: true,
    warnings: [
      "Mock failure for dashboard visibility.",
      "No production system was called."
    ],
    rollbackNotes:
      "Local mock failure only. No rollback required because no production write occurred."
  });
  const mockError = createErrorLog(
    "MOCK_DASHBOARD_REVIEW_FAILURE",
    "Mock dashboard-safe failure awaiting human review.",
    {
      riskLevel: "LOW",
      relatedJobId: mockFailedJob.jobId,
      relatedEntityType: "dashboard",
      relatedEntityId: "phase_2_admin_dashboard"
    }
  );
  const repositoryJobs = api.listJobs();
  const jobs = [mockFailedJob, ...dailyJobs, ...repositoryJobs];
  const errors = [mockError, ...api.listErrors()];
  const failedJobs = jobs.filter((job) => job.status === JobStatus.FAILED);
  const approvalRequiredJobs = jobs.filter((job) => job.approvalRequired);
  const humanReviewQueue = createHumanReviewQueue(api.listHumanReviewQueue());
  const codexReviewQueue = createCodexReviewQueue();
  const featureFlags = api.listFeatureFlags().map((flag) => ({
    ...flag,
    productionImpacting: true,
    canEnableInDashboard: false,
    enablementStatus: flag.enabled ? "UNEXPECTED_ON" : "OFF_LOCKED"
  }));
  const datasetDrafts = createDatasetDrafts(repository);
  const datasetLoadPlans = datasetDrafts.map((dataset) =>
    createDryRunBigQueryLoadPlan(dataset)
  );
  const marketRecommendation = buildAdvertiserRecommendationDraft({
    advertiserId: "advertiser_mock"
  });
  const marketOpportunity = buildMarketOpportunityScoreDraft();
  const displayPlacements = api.displayPlacementStatus();
  const screenCloudConfig = ScreenCloudAdapter.validateConfig();
  const screenCloudDryRun = ScreenCloudAdapter.dryRunSync(displayPlacements, {
    dryRun: true
  });
  const campaign = repository.campaigns[0];
  const billingPreview = {
    ...buildBillingPreview(
      campaign,
      [{ billable: true }, { billable: true }, { billable: false }],
      { rateAmount: 2 }
    ),
    approvalRequired: true,
    stripeAccess: false
  };
  const invoicePreview = createInvoicePreviewObject(campaign, billingPreview);
  const backupDraft = createBackupJobDraft({
    includedSystems: [
      "Firestore",
      "BigQuery",
      "Google Sheets",
      "Apps Script source"
    ],
    initiatedBy: "local_admin"
  });
  const backupSummary = createDryRunBackupSummary(backupDraft);
  const restoreTestRequest = createRestoreTestRequestDraft({
    backupId: backupDraft.backupId
  });

  return {
    generatedAt: nowIso(),
    phase: "Phase 2",
    title: "Drip Admin Dashboard MVP",
    productionPolicy: PRODUCTION_POLICY,
    systemHealth: {
      ...api.systemHealthSummary(),
      blockers: LEGACY_CUTOVER_BLOCKERS,
      failedJobCount: failedJobs.length,
      approvalRequiredJobCount: approvalRequiredJobs.length,
      codexReviewItemCount: codexReviewQueue.length,
      latestDailyAutomationStatus: {
        status: "LOCAL_DRY_RUN_COMPLETE",
        dryRun: true,
        jobCount: dailyJobs.length,
        failedJobCount: failedJobs.length,
        approvalRequiredJobCount: approvalRequiredJobs.length,
        rollbackNotes:
          "Daily automation output is local-only. No scheduler, deploy, or production write occurred."
      },
      serviceHealth: createServiceHealth()
    },
    jobsAndErrors: {
      jobs,
      errors,
      failedJobs,
      approvalRequiredJobs
    },
    humanReviewQueue,
    codexReviewQueue,
    featureFlags,
    datasetUploads: {
      datasetDrafts,
      supportedDatasetTypes: Object.values(DatasetType),
      bigQueryLoadPlans: datasetLoadPlans,
      liveUploadEnabled: false
    },
    marketIntelligence: {
      recommendation: marketRecommendation.draft,
      recommendationValidation: marketRecommendation.validation,
      marketOpportunity,
      placeholders: {
        googleSearchInterest: true,
        payorDataset: true,
        liveBigQueryConnected: false
      }
    },
    displayPlacements: {
      placements: displayPlacements,
      providers: [
        {
          displayProviderType: DisplayProviderType.SCREEN_CLOUD,
          adapterName: "ScreenCloudAdapter",
          mode: "STUB_DRY_RUN_ONLY",
          supportsDryRun: true,
          liveWriteEnabled: false,
          configStatus: screenCloudConfig
        },
        {
          displayProviderType: DisplayProviderType.DIRECT_DRIP_PLAYER,
          adapterName: "DirectDripPlayerAdapter",
          mode: "FUTURE_STUB",
          supportsDryRun: true,
          liveWriteEnabled: false
        }
      ],
      screenCloudDryRun
    },
    billingReview: {
      billingPreview,
      invoicePreview,
      approvalRequired: true,
      stripeAccess: false
    },
    backupRestore: {
      backupJobs: api.backupJobStatus(),
      backupDraft,
      backupSummary,
      restoreTestRequest,
      liveBackupEnabled: false,
      liveRestoreEnabled: false
    },
    localAuditTrail: [],
    legacyMigration: {
      cutoverStatus: "BLOCKED",
      blockers: LEGACY_CUTOVER_BLOCKERS,
      migrationStatus:
        "Production cutover remains blocked until parity, runtime order, live route usage, Secret Manager, approval-owner, and BigQuery table-map blockers are resolved.",
      productionDeletionAllowed: false
    }
  };
}

export function assertNoProductionConnections(snapshot) {
  return (
    snapshot.productionPolicy.mode === "LOCAL_ONLY" &&
    snapshot.productionPolicy.productionWritesEnabled === false &&
    snapshot.productionPolicy.credentialsRequired === false &&
    Object.values(snapshot.productionPolicy.externalServiceCalls).every(
      (enabled) => enabled === false
    )
  );
}

function createHumanReviewQueue(tasks) {
  return tasks.map((task) => ({
    ...task,
    reason:
      task.reason ??
      "Mock campaign safety item needs human review before any future production path.",
    ownerRole: task.ownerRole ?? task.assignedRole ?? "Drip Super Admin",
    suggestedNextAction:
      task.suggestedNextAction ??
      "Review the mock item, keep production writes blocked, and request changes if blockers are unresolved.",
    statusOptions: HUMAN_REVIEW_STATUS_VALUES
  }));
}

function createCodexReviewQueue() {
  const phase15 = {
    ...createPhase15CodexReviewItem().item,
    phase: "Phase 1.5",
    productionImpact:
      "None. Local service skeletons only; no production systems changed.",
    tests: ["13 local service tests", "14 shared contract tests"],
    unresolvedBlockers: LEGACY_CUTOVER_BLOCKERS.map((blocker) => blocker.label)
  };
  const phase2 = createPhase2CodexReviewItem().item;
  return [phase2, phase15].map((item) => ({
    ...item,
    statusOptions: REVIEW_STATUS_VALUES
  }));
}

function createDatasetDrafts(repository) {
  return [
    ...repository.datasets,
    createDatasetMetadataDraft({
      datasetId: "dataset_google_search_interest_placeholder",
      datasetName: "Google Search interest placeholder",
      datasetType: DatasetType.GOOGLE_SEARCH_INTEREST,
      sourceType: "local_placeholder",
      targetBigQueryTable: "raw_google_search_interest",
      notes: "Placeholder only. No Google API or live search-interest source connected.",
      dataQualityWarnings: ["Search-interest source freshness unresolved."]
    }),
    createDatasetMetadataDraft({
      datasetId: "dataset_payor_placeholder",
      datasetName: "Payor dataset placeholder",
      datasetType: DatasetType.GOVERNMENT_PAYOR,
      sourceType: "local_placeholder",
      targetBigQueryTable: "raw_payor_placeholder",
      notes: "Placeholder only. No live payor upload or production BigQuery load.",
      dataQualityWarnings: ["Payor source owner and load approval unresolved."]
    })
  ];
}

function createServiceHealth() {
  return [
    {
      service: "Admin API",
      mode: "MOCK",
      status: "HEALTHY",
      note: "Reads local repository data only."
    },
    {
      service: "Daily Orchestrator",
      mode: "LOCAL_DRY_RUN",
      status: "HEALTHY",
      note: "No scheduler or production job execution."
    },
    {
      service: "Codex Review Queue",
      mode: "LOCAL_MEMORY",
      status: "HEALTHY",
      note: "Status changes remain in the dashboard process."
    },
    {
      service: "Display Provider",
      mode: "STUB_DRY_RUN_ONLY",
      status: "BLOCKED_FOR_LIVE_WRITE",
      note: "ScreenCloudAdapter validates as local stub only."
    },
    {
      service: "Billing",
      mode: "PREVIEW_ONLY",
      status: "BLOCKED_FOR_STRIPE",
      note: "No Stripe credentials or calls."
    }
  ];
}

function buildCopyForChatGPT(packet) {
  return [
    "Codex Review Queue Item",
    `Phase: ${packet.phase}`,
    `Title: ${packet.title}`,
    `Summary: ${packet.summary}`,
    `Files changed: ${packet.filesChanged.join(", ")}`,
    `Risk level: ${packet.riskLevel}`,
    `Production impact: ${packet.productionImpact}`,
    `Tests or validation: ${packet.tests}`,
    `Approvals needed: ${packet.approvalsNeeded}`,
    `Open questions: ${packet.openQuestions}`,
    `Recommended next Codex prompt: ${packet.recommendedNextCodexPrompt}`
  ].join("\n");
}
