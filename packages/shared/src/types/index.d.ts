export type CampaignType =
  | "PATIENT_CAMPAIGN"
  | "MEDIA_CENTER_CAMPAIGN"
  | "CONFERENCE_CAMPAIGN";

export type CampaignStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "SAFETY_CHECKING"
  | "NEEDS_REVIEW"
  | "APPROVED"
  | "SCHEDULED"
  | "ACTIVE"
  | "PAUSED"
  | "EXPIRED"
  | "COMPLETED"
  | "BLOCKED"
  | "ARCHIVED";

export type SafetyStatus =
  | "NOT_STARTED"
  | "CHECKING"
  | "APPROVED"
  | "NEEDS_REVIEW"
  | "BLOCKED"
  | "ERROR";

export type BillingStatus =
  | "NOT_READY"
  | "READY_FOR_PREVIEW"
  | "PREVIEW_CREATED"
  | "APPROVAL_REQUIRED"
  | "APPROVED"
  | "INVOICE_CREATED"
  | "PAID"
  | "FAILED"
  | "HELD";

export type PlacementStatus =
  | "PENDING"
  | "ELIGIBLE"
  | "SYNC_READY"
  | "SYNCED"
  | "ACTIVE"
  | "STALE"
  | "REMOVED"
  | "ERROR";

export type JobStatus =
  | "PENDING"
  | "RUNNING"
  | "SUCCESS"
  | "FAILED"
  | "PARTIAL"
  | "SKIPPED"
  | "NEEDS_REVIEW";

export interface Campaign {
  campaignId: string;
  advertiserId: string;
  campaignType: CampaignType;
  campaignName: string;
  campaignStartDate: string;
  campaignEndDate: string;
  budget?: number;
  budgetRange?: Record<string, unknown>;
  rateType?: string;
  rateAmount?: number;
  pricingTier?: string;
  dynamicPricingInputs?: Record<string, unknown>;
  safetyStatus: SafetyStatus;
  campaignStatus: CampaignStatus;
  billingStatus: BillingStatus;
  marketTargets?: string[];
  specialtyTargets?: string[];
  landingPageUrl?: string;
  videoUrl?: string;
  creativeAssets?: Record<string, unknown>[];
  createdAt: string;
  updatedAt: string;
}

export interface ProviderDisplayPreference {
  providerDisplayPreferenceId: string;
  providerId: string;
  advertiserId: string;
  displayApproved: boolean;
  displayApprovedAt?: string;
  displayPreferenceSource:
    | "MEDIA_CENTER_CHECKBOX"
    | "ADMIN_MIGRATION"
    | "LEGACY_SHEET_IMPORT"
    | "PROVIDER_SIGNUP";
  displayCategory: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobRun {
  jobId: string;
  jobType: string;
  dryRun: boolean;
  status: JobStatus;
  startedAt: string;
  completedAt?: string;
  recordsRead?: number;
  recordsCreated?: number;
  recordsUpdated?: number;
  recordsSkipped?: number;
  errorCount?: number;
  warnings?: string[];
  approvalRequired: boolean;
  rollbackNotes?: string;
}

export interface CodexReviewItem {
  reviewItemId: string;
  codexTaskId: string;
  title: string;
  summary: string;
  filesChanged: string[];
  riskLevel: string;
  requiresHumanApproval: boolean;
  copyForChatGPT: string;
  status:
    | "NEW"
    | "NEEDS_CHATGPT_REVIEW"
    | "NEEDS_DRIP_APPROVAL"
    | "APPROVED"
    | "CHANGES_REQUESTED"
    | "SENT_BACK_TO_CODEX"
    | "RESOLVED"
    | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
}
