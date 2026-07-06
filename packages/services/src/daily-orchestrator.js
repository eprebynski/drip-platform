import { JobStatus } from "../../shared/src/index.js";
import { createErrorLog, createJobLog } from "./local-utils.js";

// TODO(Production): Add schedulers only after approval owners, rollback plans, and live service parity are confirmed.
export const DailyJobDefinitions = Object.freeze([
  "processIntakeSubmissions",
  "runCampaignSafetyChecks",
  "activateScheduledApprovedCampaigns",
  "expireEndedCampaigns",
  "syncDisplayPlacements",
  "ingestPlaybackLogs",
  "updateCampaignPerformanceSummaries",
  "refreshMarketIntelligence",
  "refreshGoogleSearchSignals",
  "generateAdvertiserRecommendations",
  "checkBudgetPacing",
  "checkBillingReadiness",
  "runDailyBackups",
  "detectFailedJobs",
  "createHumanReviewTasks"
]);

const APPROVAL_REQUIRED_JOBS = new Set([
  "activateScheduledApprovedCampaigns",
  "expireEndedCampaigns",
  "syncDisplayPlacements",
  "ingestPlaybackLogs",
  "refreshMarketIntelligence",
  "refreshGoogleSearchSignals",
  "generateAdvertiserRecommendations",
  "checkBillingReadiness",
  "runDailyBackups"
]);

export function runLocalDailyJob(jobType, options = {}) {
  if (!DailyJobDefinitions.includes(jobType)) {
    return {
      jobLog: createJobLog(jobType, {
        dryRun: true,
        status: JobStatus.FAILED,
        errorCount: 1,
        warnings: ["Unknown daily job."]
      }),
      errorLogs: [createErrorLog("UNKNOWN_DAILY_JOB", `Unknown job: ${jobType}`)]
    };
  }

  const dryRun = options.dryRun !== false;
  const approvalRequired = APPROVAL_REQUIRED_JOBS.has(jobType);
  return {
    jobLog: createJobLog(jobType, {
      dryRun,
      status: JobStatus.SUCCESS,
      recordsRead: options.recordsRead ?? 0,
      recordsCreated: 0,
      recordsUpdated: 0,
      recordsSkipped: options.recordsSkipped ?? 0,
      approvalRequired,
      warnings: dryRun
        ? [`${jobType} ran in local dry-run skeleton mode.`]
        : [`${jobType} cannot execute production work from Phase 1.5 skeletons.`],
      rollbackNotes:
        "Local daily orchestrator skeleton only. No scheduler or production write occurred."
    }),
    errorLogs: []
  };
}

export function runAllDailyJobsDryRun(options = {}) {
  return DailyJobDefinitions.map((jobType) =>
    runLocalDailyJob(jobType, { ...options, dryRun: true })
  );
}
