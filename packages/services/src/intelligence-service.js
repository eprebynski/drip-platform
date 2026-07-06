import {
  CampaignType,
  MarketIntelligenceOutputSchema,
  validateSchema
} from "../../shared/src/index.js";
import { makeId, nowIso } from "./local-utils.js";

// TODO(Production): Query live BigQuery only after targetable_providers location and Dataform/IAM state are verified.
export function buildMarketOpportunityScoreDraft(input = {}) {
  return {
    market: input.market ?? "NY",
    specialty: input.specialty ?? "cardiology",
    marketOpportunityScore: input.marketOpportunityScore ?? 0.75,
    specialtyOpportunityScore: input.specialtyOpportunityScore ?? 0.7,
    payorOpportunityScore: input.payorOpportunityScore ?? 0.65,
    sourceFreshnessWarnings: input.sourceFreshnessWarnings ?? [
      "BigQuery targetable_providers location unresolved."
    ],
    sourceDatasetIds: input.sourceDatasetIds ?? ["google_search_interest_placeholder", "payor_dataset_placeholder"],
    generatedAt: nowIso(),
    placeholders: {
      googleSearchInterest: true,
      payorDataset: true
    }
  };
}

export function buildAdvertiserRecommendationDraft(input = {}) {
  const draft = {
    recommendationId: makeId("recommendation", input.advertiserId ?? "advertiser"),
    advertiserId: input.advertiserId ?? "advertiser_draft",
    marketOpportunityScore: input.marketOpportunityScore ?? 0.75,
    specialtyOpportunityScore: input.specialtyOpportunityScore ?? 0.7,
    payorOpportunityScore: input.payorOpportunityScore ?? 0.65,
    advertiserFitScore: input.advertiserFitScore ?? 0.72,
    recommendedCampaignType:
      input.recommendedCampaignType ?? CampaignType.PATIENT_CAMPAIGN,
    suggestedMarkets: input.suggestedMarkets ?? ["NY"],
    suggestedSpecialties: input.suggestedSpecialties ?? ["cardiology"],
    suggestedBudgetRange: input.suggestedBudgetRange ?? { min: 500, max: 1500 },
    reasoningText:
      input.reasoningText ??
      "Local recommendation draft based on mock market, Google Search, and payor placeholders.",
    sourceFreshnessWarnings: input.sourceFreshnessWarnings ?? [
      "Live BigQuery and search-interest sources are not connected."
    ],
    sourceDatasetIds: input.sourceDatasetIds ?? [
      "google_search_interest_placeholder",
      "payor_dataset_placeholder"
    ],
    generatedAt: nowIso()
  };
  return {
    draft,
    validation: validateSchema(MarketIntelligenceOutputSchema, draft)
  };
}
