import { SafetyStatus } from "../../shared/src/index.js";
import { isHttpUrl, makeId, nowIso } from "./local-utils.js";

// TODO(Production): Wire to Cloud Run redirect handlers only after live route usage and source parity are measured.
export function buildPatientCampaignRedirectEvent(input) {
  return buildRedirectEvent("PATIENT_CAMPAIGN_REDIRECT", input);
}

export function buildMediaCenterCampaignRedirectEvent(input) {
  return buildRedirectEvent("MEDIA_CENTER_CAMPAIGN_REDIRECT", input);
}

export function buildConferenceCampaignRedirectEvent(input) {
  return buildRedirectEvent("CONFERENCE_CAMPAIGN_REDIRECT", input);
}

export function buildExperimentAssignmentEvent(input) {
  return {
    eventId: makeId("event", "experiment"),
    eventType: "EXPERIMENT_ASSIGNMENT",
    relatedEntityType: "experiment",
    relatedEntityId: input.experimentId,
    occurredAt: input.occurredAt ?? nowIso(),
    payload: {
      experimentVariantId: input.experimentVariantId,
      trafficSplitSnapshot: input.trafficSplitSnapshot ?? {},
      dryRun: true
    }
  };
}

export function selectRedirectDestination(candidates = []) {
  const eligible = candidates.find(
    (candidate) =>
      candidate &&
      candidate.safetyStatus === SafetyStatus.APPROVED &&
      isHttpUrl(candidate.destinationUrl)
  );
  return eligible
    ? { selected: true, destinationUrl: eligible.destinationUrl, candidate: eligible }
    : { selected: false, destinationUrl: null, reason: "NO_SAFE_DESTINATION" };
}

export function enforceExperimentVariantSafety(variant) {
  const allowed = variant?.safetyStatus === SafetyStatus.APPROVED;
  return {
    allowed,
    errors: allowed
      ? []
      : ["Experiment variant cannot receive redirect traffic unless safetyStatus is APPROVED"]
  };
}

function buildRedirectEvent(eventType, input) {
  return {
    eventId: makeId("event", eventType.toLowerCase()),
    eventType,
    relatedEntityType: "campaign",
    relatedEntityId: input.campaignId,
    occurredAt: input.occurredAt ?? nowIso(),
    payload: {
      placementId: input.placementId,
      providerId: input.providerId,
      destinationUrl: input.destinationUrl,
      dryRun: true
    }
  };
}
