function makeEnum(values) {
  return Object.freeze(
    values.reduce((acc, value) => {
      acc[value] = value;
      return acc;
    }, {})
  );
}

export const CampaignType = makeEnum([
  "PATIENT_CAMPAIGN",
  "MEDIA_CENTER_CAMPAIGN",
  "CONFERENCE_CAMPAIGN"
]);

export const CampaignStatus = makeEnum([
  "DRAFT",
  "SUBMITTED",
  "SAFETY_CHECKING",
  "NEEDS_REVIEW",
  "APPROVED",
  "SCHEDULED",
  "ACTIVE",
  "PAUSED",
  "EXPIRED",
  "COMPLETED",
  "BLOCKED",
  "ARCHIVED"
]);

export const SafetyStatus = makeEnum([
  "NOT_STARTED",
  "CHECKING",
  "APPROVED",
  "NEEDS_REVIEW",
  "BLOCKED",
  "ERROR"
]);

export const BillingStatus = makeEnum([
  "NOT_READY",
  "READY_FOR_PREVIEW",
  "PREVIEW_CREATED",
  "APPROVAL_REQUIRED",
  "APPROVED",
  "INVOICE_CREATED",
  "PAID",
  "FAILED",
  "HELD"
]);

export const PlacementStatus = makeEnum([
  "PENDING",
  "ELIGIBLE",
  "SYNC_READY",
  "SYNCED",
  "ACTIVE",
  "STALE",
  "REMOVED",
  "ERROR"
]);

export const JobStatus = makeEnum([
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "FAILED",
  "PARTIAL",
  "SKIPPED",
  "NEEDS_REVIEW"
]);

export const DatasetType = makeEnum([
  "GOVERNMENT_PAYOR",
  "COMMERCIAL_PAYOR",
  "PROVIDER_DIRECTORY",
  "CLAIMS_PROCEDURE_MIX",
  "FACILITY_TAXONOMY",
  "CONFERENCE_EVENTS",
  "GOOGLE_SEARCH_INTEREST",
  "CAMPAIGN_PERFORMANCE",
  "SCREEN_INVENTORY",
  "CUSTOM"
]);

export const ReviewItemStatus = makeEnum([
  "NEW",
  "NEEDS_CHATGPT_REVIEW",
  "NEEDS_DRIP_APPROVAL",
  "APPROVED",
  "CHANGES_REQUESTED",
  "SENT_BACK_TO_CODEX",
  "RESOLVED",
  "ARCHIVED"
]);

export const BackupStatus = makeEnum([
  "PENDING",
  "RUNNING",
  "SUCCESS",
  "FAILED",
  "PARTIAL",
  "NEEDS_REVIEW"
]);

export const RestoreTestStatus = makeEnum([
  "NOT_TESTED",
  "SCHEDULED",
  "PASSED",
  "FAILED",
  "NEEDS_REVIEW"
]);

export const ApprovalStatus = makeEnum([
  "NOT_REQUIRED",
  "PENDING",
  "APPROVED",
  "REJECTED",
  "REVOKED",
  "EXPIRED"
]);

export const EnvironmentName = makeEnum([
  "LOCAL",
  "STAGING",
  "PRODUCTION"
]);

export const DisplayProviderType = makeEnum([
  "SCREEN_CLOUD",
  "DIRECT_DRIP_PLAYER",
  "FUTURE_PROVIDER",
  "MANUAL_EXPORT"
]);

export const DisplayPreferenceSource = makeEnum([
  "MEDIA_CENTER_CHECKBOX",
  "ADMIN_MIGRATION",
  "LEGACY_SHEET_IMPORT",
  "PROVIDER_SIGNUP"
]);

export const ExternalWriteSystem = makeEnum([
  "STRIPE",
  "SCREEN_CLOUD",
  "DISPLAY_PROVIDER",
  "BIGQUERY_PRODUCTION",
  "FIRESTORE_PRODUCTION",
  "GOOGLE_SHEETS",
  "APPS_SCRIPT",
  "CLOUD_RUN_CONFIG"
]);

export const FeatureFlagKey = makeEnum([
  "useFirestoreCampaigns",
  "useCloudRunRedirects",
  "useNewSafetyChecks",
  "useNewDisplaySync",
  "useDynamicPricing",
  "useExperimentEngine",
  "useMarketRecommendations",
  "useNewBillingService",
  "useAdminDashboardCodexQueue"
]);

export const DefaultFeatureFlags = Object.freeze(
  Object.values(FeatureFlagKey).reduce((flags, key) => {
    flags[key] = false;
    return flags;
  }, {})
);

export const Phase1UnresolvedBlockers = Object.freeze([
  "DEPLOYED_APPS_SCRIPT_PARITY_UNRESOLVED",
  "APPS_SCRIPT_RUNTIME_LOAD_ORDER_UNRESOLVED",
  "LIVE_CLOUD_RUN_IAM_STATE_UNRESOLVED",
  "BIGQUERY_TARGETABLE_PROVIDERS_LOCATION_UNRESOLVED",
  "BILLING_APPROVAL_OWNERS_UNRESOLVED",
  "DISPLAY_WRITE_APPROVAL_OWNERS_UNRESOLVED",
  "DATASET_PRODUCTION_LOAD_APPROVAL_OWNERS_UNRESOLVED",
  "SECRET_MANAGER_MIGRATION_NOT_CONFIRMED",
  "LIVE_TRAFFIC_ROUTE_USAGE_NOT_MEASURED"
]);

export const enumValues = (enumObject) => Object.values(enumObject);
