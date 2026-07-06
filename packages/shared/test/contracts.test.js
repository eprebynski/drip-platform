import test from "node:test";
import assert from "node:assert/strict";

import {
  BillingStatus,
  CampaignStatus,
  CampaignType,
  CodexReviewItemSchema,
  DatasetSchema,
  DatasetType,
  DefaultFeatureFlags,
  DisplayPreferenceSource,
  DisplayProviderType,
  ExternalWriteBlockedError,
  ExternalWriteSystem,
  FeatureFlagSchema,
  JobSchema,
  SafetyStatus,
  ScreenCloudAdapter,
  createDefaultFeatureFlagRecords,
  evaluateExternalWrite,
  validateCampaignDates,
  validateCampaignLifecycle,
  validateExperimentSafetyRule,
  validateProviderDisplayPreferenceRule,
  validateSchema
} from "../src/index.js";

const now = "2026-07-03T12:00:00.000Z";

function validCampaign(overrides = {}) {
  return {
    campaignId: "camp_1",
    advertiserId: "adv_1",
    campaignType: CampaignType.PATIENT_CAMPAIGN,
    campaignName: "Cardiology patient campaign",
    campaignStartDate: "2026-08-01T00:00:00.000Z",
    campaignEndDate: "2026-08-31T23:59:59.000Z",
    budget: 1000,
    budgetRange: { min: 500, max: 1500 },
    rateType: "CPC",
    rateAmount: 1,
    pricingTier: "STANDARD",
    dynamicPricingInputs: {},
    safetyStatus: SafetyStatus.APPROVED,
    campaignStatus: CampaignStatus.SCHEDULED,
    billingStatus: BillingStatus.APPROVED,
    marketTargets: ["NY"],
    specialtyTargets: ["cardiology"],
    landingPageUrl: "https://example.com",
    videoUrl: "https://example.com/video.mp4",
    creativeAssets: [],
    createdAt: now,
    updatedAt: now,
    ...overrides
  };
}

test("campaign schema validates required shape", () => {
  const result = validateCampaignDates(validCampaign());
  assert.equal(result.valid, true);
});

test("campaign date validation blocks inverted dates", () => {
  const result = validateCampaignDates(
    validCampaign({
      campaignStartDate: "2026-09-01T00:00:00.000Z",
      campaignEndDate: "2026-08-01T00:00:00.000Z"
    })
  );
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /campaignStartDate/);
});

test("active campaign requires approved safety and billing", () => {
  const result = validateCampaignLifecycle(
    validCampaign({
      campaignStatus: CampaignStatus.ACTIVE,
      safetyStatus: SafetyStatus.NEEDS_REVIEW,
      billingStatus: BillingStatus.NOT_READY
    })
  );
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /APPROVED safetyStatus/);
  assert.match(result.errors.join(" "), /billingStatus/);
});

test("provider signup cannot create display approval", () => {
  const result = validateProviderDisplayPreferenceRule({
    providerDisplayPreferenceId: "pref_1",
    providerId: "provider_1",
    advertiserId: "adv_1",
    displayApproved: true,
    displayApprovedAt: now,
    displayPreferenceSource: DisplayPreferenceSource.PROVIDER_SIGNUP,
    displayCategory: "vendor",
    notes: "",
    createdAt: now,
    updatedAt: now
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /Provider signup/);
});

test("experiment variant cannot receive traffic without approved safety", () => {
  const result = validateExperimentSafetyRule(
    {
      experimentId: "exp_1",
      experimentName: "CTA test",
      startDate: "2026-08-01T00:00:00.000Z",
      endDate: "2026-08-31T23:59:59.000Z",
      successMetric: "qr_scan_rate",
      status: "DRAFT",
      trafficSplit: { variant_a: 50, variant_b: 50 },
      reversible: true,
      createdAt: now,
      updatedAt: now
    },
    [
      {
        experimentVariantId: "variant_a",
        experimentId: "exp_1",
        label: "A",
        safetyStatus: SafetyStatus.NEEDS_REVIEW,
        trafficWeight: 50,
        createdAt: now,
        updatedAt: now
      }
    ]
  );
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /cannot receive traffic/);
});

test("dry-run guard defaults to blocked dry-run when dryRun is omitted", () => {
  const decision = evaluateExternalWrite({
    operation: "createInvoice",
    targetSystem: ExternalWriteSystem.STRIPE
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.dryRun, true);
});

test("dry-run guard requires approval for explicit writes", () => {
  const decision = evaluateExternalWrite({
    operation: "syncPlacement",
    targetSystem: ExternalWriteSystem.SCREEN_CLOUD,
    dryRun: false
  });
  assert.equal(decision.allowed, false);
  assert.equal(decision.reason, "APPROVAL_REQUIRED_FOR_EXTERNAL_WRITE");
});

test("display provider adapter does not implement live writes", async () => {
  await assert.rejects(
    () =>
      ScreenCloudAdapter.createContent(
        { title: "creative" },
        { dryRun: false, approvalId: "approval_1" }
      ),
    /contract-only/
  );
});

test("display provider dry-run produces preview without external write", async () => {
  const result = await ScreenCloudAdapter.previewPlacement({
    placementId: "placement_1",
    displayProvider: DisplayProviderType.SCREEN_CLOUD
  });
  assert.equal(result.dryRun, true);
  assert.equal(result.wouldWrite, true);
});

test("feature flags default to off and validate", () => {
  assert.equal(DefaultFeatureFlags.useFirestoreCampaigns, false);
  const records = createDefaultFeatureFlagRecords("LOCAL");
  assert.ok(records.length >= 9);
  for (const record of records) {
    assert.equal(record.enabled, false);
    assert.equal(validateSchema(FeatureFlagSchema, record).valid, true);
  }
});

test("job log shape validates", () => {
  const result = validateSchema(JobSchema, {
    jobId: "job_1",
    jobType: "dataset_ingestion",
    dryRun: true,
    status: "SUCCESS",
    startedAt: now,
    completedAt: now,
    recordsRead: 10,
    recordsCreated: 0,
    recordsUpdated: 0,
    recordsSkipped: 10,
    errorCount: 0,
    warnings: [],
    approvalRequired: true,
    rollbackNotes: "No production writes occurred."
  });
  assert.equal(result.valid, true);
});

test("Codex review item requires copyForChatGPT", () => {
  const result = validateSchema(CodexReviewItemSchema, {
    reviewItemId: "review_1",
    codexTaskId: "codex_1",
    title: "Phase 1",
    summary: "Review contracts",
    filesChanged: ["packages/shared/src/index.js"],
    riskLevel: "HIGH",
    requiresHumanApproval: true,
    status: "NEEDS_CHATGPT_REVIEW",
    createdAt: now,
    updatedAt: now
  });
  assert.equal(result.valid, false);
  assert.match(result.errors.join(" "), /copyForChatGPT/);
});

test("dataset ingestion metadata validates", () => {
  const result = validateSchema(DatasetSchema, {
    datasetId: "dataset_1",
    datasetName: "Medicaid sample",
    datasetType: DatasetType.GOVERNMENT_PAYOR,
    sourceType: "csv_upload",
    uploadedBy: "admin_1",
    storagePath: "gs://non-production/example.csv",
    originalFilename: "example.csv",
    fileHash: "sha256:abc",
    schemaStatus: "PASSED",
    validationStatus: "PASSED",
    ingestionStatus: "STAGING_READY",
    targetBigQueryDataset: "drip_raw",
    targetBigQueryTable: "medicaid_claims",
    sourceFreshnessDate: "2026-07-01T00:00:00.000Z",
    dataQualityWarnings: [],
    notes: "",
    createdAt: now,
    updatedAt: now
  });
  assert.equal(result.valid, true);
});

test("dry-run write errors use explicit error class", async () => {
  await assert.rejects(
    () => ScreenCloudAdapter.createContent({ title: "creative" }),
    ExternalWriteBlockedError
  );
});
