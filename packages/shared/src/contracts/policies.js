import {
  BillingStatus,
  CampaignStatus,
  DisplayPreferenceSource,
  SafetyStatus
} from "../status/index.js";
import { validateSchema } from "../schemas/validator.js";
import {
  CampaignSchema,
  ExperimentSchema,
  ExperimentVariantSchema,
  ProviderDisplayPreferenceSchema
} from "../schemas/entities.js";

export function validateCampaignDates(campaign) {
  const schemaResult = validateSchema(CampaignSchema, campaign);
  const errors = [...schemaResult.errors];

  if (
    campaign?.campaignStartDate &&
    campaign?.campaignEndDate &&
    Date.parse(campaign.campaignStartDate) > Date.parse(campaign.campaignEndDate)
  ) {
    errors.push("campaigns.campaignStartDate must be before campaignEndDate");
  }

  return { valid: errors.length === 0, errors };
}

export function validateCampaignLifecycle(campaign) {
  const dateResult = validateCampaignDates(campaign);
  const errors = [...dateResult.errors];

  if (campaign?.campaignStatus === CampaignStatus.ACTIVE) {
    if (campaign.safetyStatus !== SafetyStatus.APPROVED) {
      errors.push("ACTIVE campaigns require APPROVED safetyStatus");
    }
    if (
      ![
        BillingStatus.APPROVED,
        BillingStatus.INVOICE_CREATED,
        BillingStatus.PAID
      ].includes(campaign.billingStatus)
    ) {
      errors.push("ACTIVE campaigns require approved or executed billingStatus");
    }
  }

  return { valid: errors.length === 0, errors };
}

export function validateProviderDisplayPreferenceRule(preference) {
  const schemaResult = validateSchema(ProviderDisplayPreferenceSchema, preference);
  const errors = [...schemaResult.errors];

  if (
    preference?.displayApproved === true &&
    preference?.displayPreferenceSource === DisplayPreferenceSource.PROVIDER_SIGNUP
  ) {
    errors.push("Provider signup does not create display approval");
  }

  if (
    preference?.displayApproved === true &&
    preference?.displayPreferenceSource !== DisplayPreferenceSource.MEDIA_CENTER_CHECKBOX
  ) {
    errors.push(
      "Display approval requires MEDIA_CENTER_CHECKBOX as the active approval source"
    );
  }

  return { valid: errors.length === 0, errors };
}

export function validateExperimentSafetyRule(experiment, variants) {
  const experimentResult = validateSchema(ExperimentSchema, experiment);
  const errors = [...experimentResult.errors];

  if (
    experiment?.startDate &&
    experiment?.endDate &&
    Date.parse(experiment.startDate) > Date.parse(experiment.endDate)
  ) {
    errors.push("experiments.startDate must be before endDate");
  }

  if (!experiment?.successMetric) {
    errors.push("experiments.successMetric is required");
  }

  if (experiment?.reversible !== true) {
    errors.push("experiments must be reversible");
  }

  for (const variant of variants ?? []) {
    const variantResult = validateSchema(ExperimentVariantSchema, variant);
    errors.push(...variantResult.errors);

    if (variant.trafficWeight > 0 && variant.safetyStatus !== SafetyStatus.APPROVED) {
      errors.push(
        `experimentVariants.${variant.experimentVariantId} cannot receive traffic unless safetyStatus is APPROVED`
      );
    }
  }

  return { valid: errors.length === 0, errors };
}
