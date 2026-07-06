import { BillingStatus } from "../../shared/src/index.js";
import { makeId, nowIso } from "./local-utils.js";

// TODO(Production): Connect Stripe only after billing approval owners and Secret Manager migration are confirmed.
export function calculateDraftCampaignCharges(events = [], rate = 1) {
  const billableEvents = events.filter((event) => event.billable !== false);
  return {
    eventCount: billableEvents.length,
    rate,
    amount: billableEvents.length * rate,
    currency: "USD",
    dryRun: true
  };
}

export function calculateDraftProviderRevenueShare(chargeSummary, shareRate = 0.2) {
  return {
    amount: Number((chargeSummary.amount * shareRate).toFixed(2)),
    shareRate,
    currency: chargeSummary.currency,
    dryRun: true
  };
}

export function validateBillingReadiness(campaign) {
  const ready = [BillingStatus.APPROVED, BillingStatus.READY_FOR_PREVIEW].includes(
    campaign.billingStatus
  );
  return {
    ready,
    errors: ready ? [] : ["Campaign billingStatus is not ready for billing preview"]
  };
}

export function buildBillingPreview(campaign, events = [], options = {}) {
  const chargeSummary = calculateDraftCampaignCharges(
    events,
    options.rateAmount ?? campaign.rateAmount ?? 1
  );
  const revenueShare = calculateDraftProviderRevenueShare(
    chargeSummary,
    options.providerShareRate ?? 0.2
  );
  return {
    billingPreviewId: makeId("billing_preview", campaign.campaignId),
    campaignId: campaign.campaignId,
    dryRun: true,
    chargeSummary,
    revenueShare,
    readiness: validateBillingReadiness(campaign),
    createdAt: nowIso()
  };
}

export function createInvoicePreviewObject(campaign, billingPreview) {
  return {
    invoiceId: makeId("invoice_preview", campaign.campaignId),
    billingAccountId: campaign.billingAccountId ?? "billing_account_draft",
    campaignId: campaign.campaignId,
    amount: billingPreview.chargeSummary.amount,
    currency: billingPreview.chargeSummary.currency,
    billingStatus: BillingStatus.PREVIEW_CREATED,
    dryRun: true,
    approvalId: undefined,
    externalInvoiceRef: undefined,
    createdAt: nowIso(),
    updatedAt: nowIso(),
    note: "Local invoice preview only. No Stripe access."
  };
}
