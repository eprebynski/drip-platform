import {
  SafetyReviewSchema,
  SafetyStatus,
  validateCampaignLifecycle,
  validateSchema
} from "../../shared/src/index.js";
import { isHttpUrl, makeId, nowIso } from "./local-utils.js";

// TODO(Production): Add approved URL/video/policy checks with managed credentials after Secret Manager migration is confirmed.
export function validateVideoUrlShape(videoUrl) {
  return {
    valid: isHttpUrl(videoUrl),
    errors: isHttpUrl(videoUrl) ? [] : ["videoUrl must be an http(s) URL"]
  };
}

export function validateLandingPageUrlShape(landingPageUrl) {
  return {
    valid: isHttpUrl(landingPageUrl),
    errors: isHttpUrl(landingPageUrl)
      ? []
      : ["landingPageUrl must be an http(s) URL"]
  };
}

export function createSafetyReviewDraft(campaign, mockResult = SafetyStatus.NEEDS_REVIEW) {
  const now = nowIso();
  const draft = {
    safetyReviewId: makeId("safety", campaign.campaignId ?? "campaign"),
    campaignId: campaign.campaignId,
    safetyStatus: mockResult,
    checks: [
      {
        checkType: "VIDEO_URL_SHAPE",
        result: validateVideoUrlShape(campaign.videoUrl).valid ? "PASS" : "WARN"
      },
      {
        checkType: "LANDING_PAGE_URL_SHAPE",
        result: validateLandingPageUrlShape(campaign.landingPageUrl).valid
          ? "PASS"
          : "WARN"
      }
    ],
    reviewerId: undefined,
    notes: "Local-only mock safety review. No live URL fetching occurred.",
    createdAt: now,
    updatedAt: now
  };
  return {
    draft,
    validation: validateSchema(SafetyReviewSchema, draft)
  };
}

export function mockSafetyResult({ videoUrl, landingPageUrl, force } = {}) {
  if (force) {
    return force;
  }
  if (!validateVideoUrlShape(videoUrl).valid || !validateLandingPageUrlShape(landingPageUrl).valid) {
    return SafetyStatus.NEEDS_REVIEW;
  }
  if (String(landingPageUrl).includes("blocked")) {
    return SafetyStatus.BLOCKED;
  }
  return SafetyStatus.APPROVED;
}

export function enforceActiveCampaignSafety(campaign) {
  const result = validateCampaignLifecycle(campaign);
  return {
    allowed: result.valid,
    errors: result.errors
  };
}
