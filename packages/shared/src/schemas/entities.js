import {
  ApprovalStatus,
  BackupStatus,
  BillingStatus,
  CampaignStatus,
  CampaignType,
  DatasetType,
  DefaultFeatureFlags,
  DisplayPreferenceSource,
  DisplayProviderType,
  EnvironmentName,
  FeatureFlagKey,
  JobStatus,
  PlacementStatus,
  RestoreTestStatus,
  ReviewItemStatus,
  SafetyStatus,
  enumValues
} from "../status/index.js";
import {
  arrayOf,
  defineSchema,
  field,
  optional,
  optionalArrayOf
} from "./validator.js";

const timestamps = {
  createdAt: field("date-string"),
  updatedAt: field("date-string")
};

const jobCounters = {
  recordsRead: optional("integer"),
  recordsCreated: optional("integer"),
  recordsUpdated: optional("integer"),
  recordsSkipped: optional("integer"),
  errorCount: optional("integer")
};

export const OrganizationSchema = defineSchema("organizations", {
  organizationId: field("string"),
  organizationType: field("string"),
  organizationName: field("string"),
  status: optional("string"),
  ...timestamps
});

export const UserSchema = defineSchema("users", {
  userId: field("string"),
  authUid: optional("string"),
  organizationId: optional("string"),
  email: field("string"),
  roles: arrayOf("string"),
  status: field("string"),
  lastLoginAt: optional("date-string"),
  ...timestamps
});

export const ProviderSchema = defineSchema("providers", {
  providerId: field("string"),
  organizationId: field("string"),
  providerName: field("string"),
  facilities: optionalArrayOf("object"),
  mediaCenterStatus: optional("string"),
  ...timestamps
});

export const AdvertiserSchema = defineSchema("advertisers", {
  advertiserId: field("string"),
  organizationId: field("string"),
  advertiserName: field("string"),
  eligibilityStatus: optional("string"),
  billingAccountId: optional("string"),
  primaryContact: optional("object"),
  ...timestamps
});

export const ProviderDisplayPreferenceSchema = defineSchema(
  "providerDisplayPreferences",
  {
    providerDisplayPreferenceId: field("string"),
    providerId: field("string"),
    advertiserId: field("string"),
    displayApproved: field("boolean"),
    displayApprovedAt: optional("date-string"),
    displayPreferenceSource: field("string", {
      enum: enumValues(DisplayPreferenceSource)
    }),
    displayCategory: field("string"),
    notes: optional("string-empty-ok"),
    ...timestamps
  }
);

export const CampaignSchema = defineSchema("campaigns", {
  campaignId: field("string"),
  advertiserId: field("string"),
  campaignType: field("string", { enum: enumValues(CampaignType) }),
  campaignName: field("string"),
  campaignStartDate: field("date-string"),
  campaignEndDate: field("date-string"),
  budget: optional("number"),
  budgetRange: optional("object"),
  rateType: optional("string"),
  rateAmount: optional("number"),
  pricingTier: optional("string"),
  dynamicPricingInputs: optional("record"),
  safetyStatus: field("string", { enum: enumValues(SafetyStatus) }),
  campaignStatus: field("string", { enum: enumValues(CampaignStatus) }),
  billingStatus: field("string", { enum: enumValues(BillingStatus) }),
  marketTargets: optionalArrayOf("string"),
  specialtyTargets: optionalArrayOf("string"),
  landingPageUrl: optional("url"),
  videoUrl: optional("url"),
  creativeAssets: optionalArrayOf("object"),
  ...timestamps
});

export const PlacementSchema = defineSchema("placements", {
  placementId: field("string"),
  campaignId: field("string"),
  providerId: field("string"),
  facilityId: optional("string"),
  screenId: optional("string"),
  displayProvider: field("string", { enum: enumValues(DisplayProviderType) }),
  externalScreenId: optional("string"),
  externalChannelId: optional("string"),
  externalPlaylistId: optional("string"),
  externalContentId: optional("string"),
  creativeRenderUrl: optional("url"),
  qrTargetUrl: optional("url"),
  placementStatus: field("string", { enum: enumValues(PlacementStatus) }),
  syncStatus: optional("string"),
  lastSyncedAt: optional("date-string"),
  errorDetails: optional("string-empty-ok"),
  ...timestamps
});

export const DisplayProviderSchema = defineSchema("displayProviders", {
  displayProviderId: field("string"),
  displayProviderType: field("string", { enum: enumValues(DisplayProviderType) }),
  providerName: field("string"),
  status: field("string"),
  supportsDryRun: field("boolean"),
  ...timestamps
});

export const DisplayProviderAccountSchema = defineSchema(
  "displayProviderAccounts",
  {
    displayProviderAccountId: field("string"),
    displayProviderId: field("string"),
    organizationId: optional("string"),
    externalAccountId: optional("string"),
    secretRef: optional("string"),
    status: field("string"),
    ...timestamps
  }
);

export const EventSchema = defineSchema("events", {
  eventId: field("string"),
  eventType: field("string"),
  relatedEntityType: optional("string"),
  relatedEntityId: optional("string"),
  occurredAt: field("date-string"),
  payload: optional("record")
});

export const SafetyReviewSchema = defineSchema("safetyReviews", {
  safetyReviewId: field("string"),
  campaignId: field("string"),
  safetyStatus: field("string", { enum: enumValues(SafetyStatus) }),
  checks: arrayOf("object"),
  reviewerId: optional("string"),
  notes: optional("string-empty-ok"),
  createdAt: field("date-string"),
  updatedAt: optional("date-string")
});

export const ExperimentSchema = defineSchema("experiments", {
  experimentId: field("string"),
  experimentName: field("string"),
  startDate: field("date-string"),
  endDate: field("date-string"),
  successMetric: field("string"),
  status: field("string"),
  trafficSplit: field("record"),
  reversible: field("boolean"),
  ...timestamps
});

export const ExperimentVariantSchema = defineSchema("experimentVariants", {
  experimentVariantId: field("string"),
  experimentId: field("string"),
  label: field("string"),
  safetyStatus: field("string", { enum: enumValues(SafetyStatus) }),
  trafficWeight: field("number"),
  targetUrl: optional("url"),
  creativeAssetId: optional("string"),
  ...timestamps
});

export const ExperimentAssignmentSchema = defineSchema("experimentAssignments", {
  experimentAssignmentId: field("string"),
  experimentId: field("string"),
  experimentVariantId: field("string"),
  subjectId: field("string"),
  assignedAt: field("date-string"),
  trafficSplitSnapshot: field("record")
});

export const ExperimentEventSchema = defineSchema("experimentEvents", {
  experimentEventId: field("string"),
  experimentId: field("string"),
  experimentVariantId: optional("string"),
  eventType: field("string"),
  occurredAt: field("date-string"),
  payload: optional("record")
});

export const BillingAccountSchema = defineSchema("billingAccounts", {
  billingAccountId: field("string"),
  organizationId: field("string"),
  billingStatus: field("string", { enum: enumValues(BillingStatus) }),
  stripeCustomerRef: optional("string"),
  approvalRequired: field("boolean"),
  ...timestamps
});

export const InvoiceSchema = defineSchema("invoices", {
  invoiceId: field("string"),
  billingAccountId: field("string"),
  campaignId: optional("string"),
  amount: field("number"),
  currency: field("string"),
  billingStatus: field("string", { enum: enumValues(BillingStatus) }),
  dryRun: field("boolean"),
  approvalId: optional("string"),
  externalInvoiceRef: optional("string"),
  ...timestamps
});

export const JobSchema = defineSchema("jobs", {
  jobId: field("string"),
  jobType: field("string"),
  dryRun: field("boolean"),
  status: field("string", { enum: enumValues(JobStatus) }),
  startedAt: field("date-string"),
  completedAt: optional("date-string"),
  ...jobCounters,
  warnings: optionalArrayOf("string"),
  approvalRequired: field("boolean"),
  rollbackNotes: optional("string-empty-ok")
});

export const ErrorSchema = defineSchema("errors", {
  errorId: field("string"),
  errorType: field("string"),
  message: field("string"),
  riskLevel: optional("string"),
  relatedJobId: optional("string"),
  relatedEntityType: optional("string"),
  relatedEntityId: optional("string"),
  createdAt: field("date-string")
});

export const FeatureFlagSchema = defineSchema("featureFlags", {
  flagKey: field("string", { enum: enumValues(FeatureFlagKey) }),
  enabled: field("boolean"),
  environment: field("string", { enum: enumValues(EnvironmentName) }),
  rolloutPercent: optional("number"),
  allowedActors: optionalArrayOf("string"),
  approvalStatus: field("string", { enum: enumValues(ApprovalStatus) }),
  ...timestamps
});

export const ChangeRequestSchema = defineSchema("changeRequests", {
  changeRequestId: field("string"),
  title: field("string"),
  summary: field("string"),
  riskLevel: field("string"),
  status: field("string", { enum: enumValues(ApprovalStatus) }),
  requestedBy: field("string"),
  approvedBy: optional("string"),
  rollbackPlan: optional("string-empty-ok"),
  ...timestamps
});

export const BackupSchema = defineSchema("backups", {
  backupId: field("string"),
  backupType: field("string"),
  startedAt: field("date-string"),
  completedAt: optional("date-string"),
  status: field("string", { enum: enumValues(BackupStatus) }),
  includedSystems: arrayOf("string"),
  storagePaths: optionalArrayOf("string"),
  checksum: optional("string"),
  initiatedBy: field("string"),
  dryRun: field("boolean"),
  errorDetails: optional("string-empty-ok"),
  restoreTestStatus: field("string", { enum: enumValues(RestoreTestStatus) })
});

export const DatasetSchema = defineSchema("datasets", {
  datasetId: field("string"),
  datasetName: field("string"),
  datasetType: field("string", { enum: enumValues(DatasetType) }),
  sourceType: field("string"),
  uploadedBy: field("string"),
  storagePath: field("string"),
  originalFilename: field("string"),
  fileHash: field("string"),
  schemaStatus: field("string"),
  validationStatus: field("string"),
  ingestionStatus: field("string"),
  targetBigQueryDataset: field("string"),
  targetBigQueryTable: field("string"),
  sourceFreshnessDate: optional("date-string"),
  dataQualityWarnings: optionalArrayOf("string"),
  notes: optional("string-empty-ok"),
  ...timestamps
});

export const DatasetIngestionJobSchema = defineSchema("datasetIngestionJobs", {
  jobId: field("string"),
  datasetId: field("string"),
  dryRun: field("boolean"),
  status: field("string", { enum: enumValues(JobStatus) }),
  targetBigQueryDataset: field("string"),
  targetBigQueryTable: field("string"),
  startedAt: field("date-string"),
  completedAt: optional("date-string"),
  ...jobCounters,
  warnings: optionalArrayOf("string"),
  approvalRequired: field("boolean"),
  rollbackNotes: optional("string-empty-ok")
});

export const IntelligenceRefreshJobSchema = defineSchema(
  "intelligenceRefreshJobs",
  {
    jobId: field("string"),
    dryRun: field("boolean"),
    status: field("string", { enum: enumValues(JobStatus) }),
    sourceDatasetIds: arrayOf("string"),
    generatedRecommendationCount: optional("integer"),
    startedAt: field("date-string"),
    completedAt: optional("date-string"),
    warnings: optionalArrayOf("string"),
    approvalRequired: field("boolean"),
    rollbackNotes: optional("string-empty-ok")
  }
);

export const MarketIntelligenceOutputSchema = defineSchema(
  "marketIntelligenceOutputs",
  {
    marketOpportunityScore: field("number"),
    specialtyOpportunityScore: field("number"),
    payorOpportunityScore: field("number"),
    advertiserFitScore: field("number"),
    recommendedCampaignType: field("string", { enum: enumValues(CampaignType) }),
    suggestedMarkets: arrayOf("string"),
    suggestedSpecialties: arrayOf("string"),
    suggestedBudgetRange: field("object"),
    reasoningText: field("string"),
    sourceFreshnessWarnings: optionalArrayOf("string"),
    sourceDatasetIds: arrayOf("string"),
    generatedAt: field("date-string")
  }
);

export const AuditLogSchema = defineSchema("auditLogs", {
  auditLogId: field("string"),
  actorType: field("string"),
  actorId: field("string"),
  action: field("string"),
  entityType: field("string"),
  entityId: field("string"),
  beforeHash: optional("string"),
  afterHash: optional("string"),
  createdAt: field("date-string")
});

export const HumanReviewTaskSchema = defineSchema("humanReviewTasks", {
  taskId: field("string"),
  taskType: field("string"),
  riskLevel: field("string"),
  relatedEntityType: field("string"),
  relatedEntityId: field("string"),
  status: field("string"),
  assignedRole: optional("string"),
  dueAt: optional("date-string"),
  createdAt: field("date-string"),
  updatedAt: optional("date-string")
});

export const RollbackNoteSchema = defineSchema("rollbackNotes", {
  rollbackNoteId: field("string"),
  changeRequestId: optional("string"),
  relatedEntityType: optional("string"),
  relatedEntityId: optional("string"),
  summary: field("string"),
  verificationNotes: optional("string-empty-ok"),
  createdBy: field("string"),
  createdAt: field("date-string")
});

export const RebuildApprovalSchema = defineSchema("rebuildApprovals", {
  approvalId: field("string"),
  entityType: field("string"),
  entityId: field("string"),
  approvalType: field("string"),
  status: field("string", { enum: enumValues(ApprovalStatus) }),
  approverId: optional("string"),
  approvedAt: optional("date-string"),
  notes: optional("string-empty-ok"),
  createdAt: field("date-string"),
  updatedAt: optional("date-string")
});

export const CodexTaskSchema = defineSchema("codexTasks", {
  codexTaskId: field("string"),
  phase: field("string"),
  title: field("string"),
  prompt: field("string"),
  branch: optional("string"),
  status: field("string"),
  startedAt: field("date-string"),
  completedAt: optional("date-string"),
  summary: optional("string-empty-ok"),
  riskLevel: field("string"),
  nextRecommendedTask: optional("string-empty-ok")
});

export const CodexReviewItemSchema = defineSchema("codexReviewItems", {
  reviewItemId: field("string"),
  codexTaskId: field("string"),
  title: field("string"),
  summary: field("string"),
  fullOutput: optional("string-empty-ok"),
  filesChanged: arrayOf("string"),
  riskLevel: field("string"),
  requiresHumanApproval: field("boolean"),
  copyForChatGPT: field("string"),
  promptBackToCodex: optional("string-empty-ok"),
  status: field("string", { enum: enumValues(ReviewItemStatus) }),
  createdAt: field("date-string"),
  updatedAt: field("date-string")
});

export const CodexArtifactSchema = defineSchema("codexArtifacts", {
  artifactId: field("string"),
  codexTaskId: field("string"),
  artifactType: field("string"),
  pathOrUrl: field("string"),
  checksum: optional("string"),
  createdAt: field("date-string")
});

export const CodexPromptHistorySchema = defineSchema("codexPromptHistory", {
  promptId: field("string"),
  codexTaskId: field("string"),
  promptText: field("string"),
  source: field("string"),
  createdBy: field("string"),
  createdAt: field("date-string"),
  resultStatus: optional("string")
});

export const EntitySchemas = Object.freeze({
  providers: ProviderSchema,
  advertisers: AdvertiserSchema,
  providerDisplayPreferences: ProviderDisplayPreferenceSchema,
  campaigns: CampaignSchema,
  placements: PlacementSchema,
  displayProviders: DisplayProviderSchema,
  displayProviderAccounts: DisplayProviderAccountSchema,
  events: EventSchema,
  safetyReviews: SafetyReviewSchema,
  experiments: ExperimentSchema,
  experimentVariants: ExperimentVariantSchema,
  experimentAssignments: ExperimentAssignmentSchema,
  experimentEvents: ExperimentEventSchema,
  billingAccounts: BillingAccountSchema,
  invoices: InvoiceSchema,
  jobs: JobSchema,
  errors: ErrorSchema,
  featureFlags: FeatureFlagSchema,
  changeRequests: ChangeRequestSchema,
  backups: BackupSchema,
  datasets: DatasetSchema,
  datasetIngestionJobs: DatasetIngestionJobSchema,
  intelligenceRefreshJobs: IntelligenceRefreshJobSchema,
  marketIntelligenceOutputs: MarketIntelligenceOutputSchema,
  auditLogs: AuditLogSchema,
  users: UserSchema,
  organizations: OrganizationSchema,
  humanReviewTasks: HumanReviewTaskSchema,
  rollbackNotes: RollbackNoteSchema,
  codexTasks: CodexTaskSchema,
  codexReviewItems: CodexReviewItemSchema,
  codexArtifacts: CodexArtifactSchema,
  codexPromptHistory: CodexPromptHistorySchema,
  rebuildApprovals: RebuildApprovalSchema
});

export function createDefaultFeatureFlagRecords(environment = "LOCAL") {
  const now = new Date().toISOString();
  return Object.entries(DefaultFeatureFlags).map(([flagKey, enabled]) => ({
    flagKey,
    enabled,
    environment,
    rolloutPercent: 0,
    allowedActors: [],
    approvalStatus: ApprovalStatus.NOT_REQUIRED,
    createdAt: now,
    updatedAt: now
  }));
}
