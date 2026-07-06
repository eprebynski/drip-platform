import test from "node:test";
import assert from "node:assert/strict";

import {
  BillingStatus,
  CampaignStatus,
  CampaignType,
  DatasetType,
  DisplayPreferenceSource,
  SafetyStatus
} from "../../shared/src/index.js";
import {
  ScreenCloudAdapter,
  buildAdvertiserRecommendationDraft,
  buildBillingPreview,
  buildConferenceCampaignRedirectEvent,
  buildMediaCenterCampaignRedirectEvent,
  buildPatientCampaignRedirectEvent,
  calculateDraftCampaignCharges,
  createAdminApi,
  createBackupJobDraft,
  createDatasetMetadataDraft,
  createDryRunBackupSummary,
  createDryRunBigQueryLoadPlan,
  createPhase15CodexReviewItem,
  createProviderDisplayPreferenceDraft,
  createRestoreTestRequestDraft,
  enforceActiveCampaignSafety,
  enforceExperimentVariantSafety,
  mockSafetyResult,
  normalizeAdvertiserSignupDraft,
  normalizeConferenceCampaignDraft,
  normalizeMediaCenterCampaignDraft,
  normalizePatientCampaignDraft,
  normalizeProviderSignupDraft,
  runAllDailyJobsDryRun,
  selectRedirectDestination,
  validateDatasetType,
  validateRawIntakeSubmission
} from "../src/index.js";

const rawSubmission = {
  sourceType: "mock_form",
  payload: {
    organizationName: "Local Clinic",
    advertiserId: "advertiser_mock",
    campaignName: "Local campaign",
    campaignStartDate: "2026-08-01T00:00:00.000Z",
    campaignEndDate: "2026-08-31T23:59:59.000Z",
    landingPageUrl: "https://example.com",
    videoUrl: "https://example.com/video.mp4",
    marketTargets: ["NY"],
    specialtyTargets: ["cardiology"]
  }
};

test("admin api returns mock system health and feature flags off", () => {
  const api = createAdminApi();
  const summary = api.systemHealthSummary();
  assert.equal(summary.mode, "LOCAL_ONLY");
  assert.equal(summary.productionWritesEnabled, false);
  assert.equal(summary.featureFlagsOff, true);
  assert.ok(api.listJobs().length > 0);
});

test("intake service validates and normalizes mock submissions", () => {
  assert.equal(validateRawIntakeSubmission(rawSubmission).valid, true);
  assert.match(normalizeProviderSignupDraft(rawSubmission).providerId, /^provider_/);
  assert.match(normalizeAdvertiserSignupDraft(rawSubmission).advertiserId, /^advertiser_/);
  assert.equal(
    normalizePatientCampaignDraft(rawSubmission).campaignType,
    CampaignType.PATIENT_CAMPAIGN
  );
  assert.equal(
    normalizeMediaCenterCampaignDraft(rawSubmission).campaignType,
    CampaignType.MEDIA_CENTER_CAMPAIGN
  );
  assert.equal(
    normalizeConferenceCampaignDraft(rawSubmission).campaignType,
    CampaignType.CONFERENCE_CAMPAIGN
  );
});

test("provider display preference draft preserves Media Center approval rule", () => {
  const result = createProviderDisplayPreferenceDraft({
    providerId: "provider_1",
    advertiserId: "advertiser_1",
    displayApproved: true,
    displayPreferenceSource: DisplayPreferenceSource.MEDIA_CENTER_CHECKBOX,
    displayCategory: "vendor"
  });
  assert.equal(result.validation.valid, true);
});

test("safety service enforces lifecycle and mock URL checks", () => {
  assert.equal(
    mockSafetyResult({
      videoUrl: "https://example.com/video.mp4",
      landingPageUrl: "https://example.com"
    }),
    SafetyStatus.APPROVED
  );

  const enforcement = enforceActiveCampaignSafety({
    ...normalizePatientCampaignDraft(rawSubmission),
    campaignStatus: CampaignStatus.ACTIVE,
    safetyStatus: SafetyStatus.NEEDS_REVIEW,
    billingStatus: BillingStatus.NOT_READY
  });
  assert.equal(enforcement.allowed, false);
});

test("redirect service builds events and selects safe mock destination", () => {
  const candidates = [
    { destinationUrl: "https://unsafe.example.com", safetyStatus: SafetyStatus.BLOCKED },
    { destinationUrl: "https://safe.example.com", safetyStatus: SafetyStatus.APPROVED }
  ];
  assert.equal(selectRedirectDestination(candidates).destinationUrl, "https://safe.example.com");
  assert.equal(buildPatientCampaignRedirectEvent({ campaignId: "c1" }).eventType, "PATIENT_CAMPAIGN_REDIRECT");
  assert.equal(buildMediaCenterCampaignRedirectEvent({ campaignId: "c2" }).eventType, "MEDIA_CENTER_CAMPAIGN_REDIRECT");
  assert.equal(buildConferenceCampaignRedirectEvent({ campaignId: "c3" }).eventType, "CONFERENCE_CAMPAIGN_REDIRECT");
});

test("experiment variant safety blocks unsafe redirect traffic", () => {
  const result = enforceExperimentVariantSafety({
    experimentVariantId: "variant_unsafe",
    safetyStatus: SafetyStatus.NEEDS_REVIEW
  });
  assert.equal(result.allowed, false);
});

test("display provider local adapter requires explicit dryRun true for writes", () => {
  assert.throws(() => ScreenCloudAdapter.createContent({ title: "Creative" }));
  const preview = ScreenCloudAdapter.createContent(
    { title: "Creative" },
    { dryRun: true }
  );
  assert.equal(preview.dryRun, true);
  assert.equal(preview.operation, "createContent");
});

test("billing service creates preview from mock events without Stripe", () => {
  const campaign = {
    ...normalizePatientCampaignDraft(rawSubmission),
    billingStatus: BillingStatus.READY_FOR_PREVIEW,
    rateAmount: 2
  };
  const charges = calculateDraftCampaignCharges([{ billable: true }, { billable: true }], 2);
  assert.equal(charges.amount, 4);
  const preview = buildBillingPreview(campaign, [{ billable: true }]);
  assert.equal(preview.dryRun, true);
  assert.equal(preview.readiness.ready, true);
});

test("backup service creates dry-run summary and restore test draft", () => {
  const draft = createBackupJobDraft({
    includedSystems: ["Firestore", "BigQuery"],
    initiatedBy: "local_admin"
  });
  const summary = createDryRunBackupSummary(draft);
  assert.equal(summary.dryRun, true);
  assert.equal(summary.targetValidation.valid, true);
  assert.equal(createRestoreTestRequestDraft({ backupId: draft.backupId }).dryRun, true);
});

test("dataset ingestion validates metadata and BigQuery load plan without BigQuery", () => {
  const dataset = createDatasetMetadataDraft({
    datasetType: DatasetType.GOVERNMENT_PAYOR,
    targetBigQueryTable: "raw_payor_government"
  });
  assert.equal(validateDatasetType(dataset.datasetType).valid, true);
  const plan = createDryRunBigQueryLoadPlan(dataset);
  assert.equal(plan.dryRun, true);
  assert.equal(plan.validation.valid, true);
});

test("intelligence service creates recommendation draft with source warnings", () => {
  const result = buildAdvertiserRecommendationDraft({
    advertiserId: "advertiser_1"
  });
  assert.equal(result.validation.valid, true);
  assert.ok(result.draft.sourceFreshnessWarnings.length > 0);
});

test("daily orchestrator returns dry-run job output for all local jobs", () => {
  const results = runAllDailyJobsDryRun();
  assert.equal(results.length, 15);
  for (const result of results) {
    assert.equal(result.jobLog.dryRun, true);
    assert.ok("approvalRequired" in result.jobLog);
    assert.ok(result.jobLog.rollbackNotes);
    assert.deepEqual(result.errorLogs, []);
  }
});

test("codex review item generation validates copyForChatGPT", () => {
  const result = createPhase15CodexReviewItem();
  assert.equal(result.validation.valid, true);
  assert.match(result.item.copyForChatGPT, /Phase 1.5/);
});
