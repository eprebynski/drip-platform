import {
  BillingStatus,
  CampaignStatus,
  CampaignType,
  ProviderDisplayPreferenceSchema,
  SafetyStatus,
  validateSchema
} from "../../shared/src/index.js";
import { makeId, nowIso } from "./local-utils.js";

// TODO(Production): Connect to approved Squarespace/Sheets intake readers only after Apps Script parity and live route usage are verified.
export function validateRawIntakeSubmission(submission) {
  const errors = [];
  if (!submission || typeof submission !== "object") {
    errors.push("submission must be an object");
  }
  if (!submission?.sourceType) {
    errors.push("sourceType is required");
  }
  if (!submission?.payload || typeof submission.payload !== "object") {
    errors.push("payload object is required");
  }
  return { valid: errors.length === 0, errors };
}

export function normalizeProviderSignupDraft(submission) {
  validateOrThrow(submission);
  const now = nowIso();
  return {
    providerId: makeId("provider", submission.payload.organizationName ?? "draft"),
    organizationId: makeId("org", "provider"),
    providerName: submission.payload.organizationName ?? "Draft Provider",
    facilities: submission.payload.facilities ?? [],
    mediaCenterStatus: "DRAFT",
    createdAt: now,
    updatedAt: now,
    note: "Provider signup does not create display approval."
  };
}

export function normalizeAdvertiserSignupDraft(submission) {
  validateOrThrow(submission);
  const now = nowIso();
  return {
    advertiserId: makeId("advertiser", submission.payload.organizationName ?? "draft"),
    organizationId: makeId("org", "advertiser"),
    advertiserName: submission.payload.organizationName ?? "Draft Advertiser",
    eligibilityStatus: "PENDING_REVIEW",
    billingAccountId: undefined,
    primaryContact: submission.payload.primaryContact ?? {},
    createdAt: now,
    updatedAt: now
  };
}

export function normalizePatientCampaignDraft(submission) {
  return normalizeCampaignDraft(submission, CampaignType.PATIENT_CAMPAIGN);
}

export function normalizeMediaCenterCampaignDraft(submission) {
  return normalizeCampaignDraft(submission, CampaignType.MEDIA_CENTER_CAMPAIGN);
}

export function normalizeConferenceCampaignDraft(submission) {
  return normalizeCampaignDraft(submission, CampaignType.CONFERENCE_CAMPAIGN);
}

export function createProviderDisplayPreferenceDraft(input) {
  const now = nowIso();
  const draft = {
    providerDisplayPreferenceId: makeId("pref", "media_center"),
    providerId: input.providerId,
    advertiserId: input.advertiserId,
    displayApproved: input.displayApproved === true,
    displayApprovedAt: input.displayApproved ? now : undefined,
    displayPreferenceSource: input.displayPreferenceSource,
    displayCategory: input.displayCategory ?? "vendor",
    notes: input.notes ?? "",
    createdAt: now,
    updatedAt: now
  };
  return {
    draft,
    validation: validateSchema(ProviderDisplayPreferenceSchema, draft)
  };
}

function normalizeCampaignDraft(submission, campaignType) {
  validateOrThrow(submission);
  const now = nowIso();
  return {
    campaignId: makeId("campaign", campaignType.toLowerCase()),
    advertiserId: submission.payload.advertiserId ?? "advertiser_draft",
    campaignType,
    campaignName: submission.payload.campaignName ?? "Draft campaign",
    campaignStartDate: submission.payload.campaignStartDate ?? now,
    campaignEndDate: submission.payload.campaignEndDate ?? now,
    budget: submission.payload.budget,
    budgetRange: submission.payload.budgetRange,
    rateType: submission.payload.rateType,
    rateAmount: submission.payload.rateAmount,
    pricingTier: submission.payload.pricingTier,
    dynamicPricingInputs: submission.payload.dynamicPricingInputs ?? {},
    safetyStatus: SafetyStatus.NOT_STARTED,
    campaignStatus: CampaignStatus.DRAFT,
    billingStatus: BillingStatus.NOT_READY,
    marketTargets: submission.payload.marketTargets ?? [],
    specialtyTargets: submission.payload.specialtyTargets ?? [],
    landingPageUrl: submission.payload.landingPageUrl,
    videoUrl: submission.payload.videoUrl,
    creativeAssets: submission.payload.creativeAssets ?? [],
    createdAt: now,
    updatedAt: now
  };
}

function validateOrThrow(submission) {
  const validation = validateRawIntakeSubmission(submission);
  if (!validation.valid) {
    throw new Error(validation.errors.join("; "));
  }
}
