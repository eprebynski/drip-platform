import {
  ExternalWriteBlockedError,
  JobStatus
} from "../../shared/src/index.js";

export class LocalOnlyServiceError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "LocalOnlyServiceError";
    this.details = details;
  }
}

export function nowIso() {
  return new Date().toISOString();
}

export function makeId(prefix, seed = "local") {
  return `${prefix}_${seed}_${Math.random().toString(36).slice(2, 8)}`;
}

export function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

export function assertLocalDryRun(options = {}, operation = "localOperation") {
  if (options.dryRun !== true) {
    throw new ExternalWriteBlockedError(
      `${operation} requires dryRun=true in Phase 1.5 local skeleton mode`,
      {
        operation,
        dryRun: options.dryRun,
        reason: "LOCAL_SKELETON_REQUIRES_EXPLICIT_DRY_RUN_TRUE"
      }
    );
  }
  return true;
}

export function createJobLog(jobType, overrides = {}) {
  const dryRun = overrides.dryRun ?? true;
  return {
    jobId: overrides.jobId ?? makeId("job", jobType),
    jobType,
    dryRun,
    status: overrides.status ?? JobStatus.SUCCESS,
    startedAt: overrides.startedAt ?? nowIso(),
    completedAt: overrides.completedAt ?? nowIso(),
    recordsRead: overrides.recordsRead ?? 0,
    recordsCreated: overrides.recordsCreated ?? 0,
    recordsUpdated: overrides.recordsUpdated ?? 0,
    recordsSkipped: overrides.recordsSkipped ?? 0,
    errorCount: overrides.errorCount ?? 0,
    warnings: overrides.warnings ?? [],
    approvalRequired: overrides.approvalRequired ?? false,
    rollbackNotes:
      overrides.rollbackNotes ??
      "Phase 1.5 local-only skeleton: no production write occurred."
  };
}

export function createErrorLog(errorType, message, overrides = {}) {
  return {
    errorId: overrides.errorId ?? makeId("err", errorType),
    errorType,
    message,
    riskLevel: overrides.riskLevel ?? "LOW",
    relatedJobId: overrides.relatedJobId,
    relatedEntityType: overrides.relatedEntityType,
    relatedEntityId: overrides.relatedEntityId,
    createdAt: overrides.createdAt ?? nowIso()
  };
}

export function isHttpUrl(value) {
  try {
    const parsed = new URL(value);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}
