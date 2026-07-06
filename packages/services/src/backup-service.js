import {
  BackupStatus,
  RestoreTestStatus,
  validateSchema,
  BackupSchema
} from "../../shared/src/index.js";
import { makeId, nowIso } from "./local-utils.js";

// TODO(Production): Execute real backups only after approved backup targets, restore policy, and service account scopes are defined.
export function validateBackupTargetList(includedSystems = []) {
  const errors = [];
  if (!Array.isArray(includedSystems) || includedSystems.length === 0) {
    errors.push("At least one backup target is required");
  }
  return { valid: errors.length === 0, errors };
}

export function createBackupJobDraft(input = {}) {
  const now = nowIso();
  return {
    backupId: makeId("backup", input.backupType ?? "daily"),
    backupType: input.backupType ?? "DAILY_DRY_RUN",
    startedAt: now,
    completedAt: undefined,
    status: BackupStatus.PENDING,
    includedSystems: input.includedSystems ?? [],
    storagePaths: [],
    checksum: undefined,
    initiatedBy: input.initiatedBy ?? "local_admin",
    dryRun: true,
    errorDetails: "",
    restoreTestStatus: RestoreTestStatus.NOT_TESTED
  };
}

export function createDryRunBackupSummary(draft) {
  const targetValidation = validateBackupTargetList(draft.includedSystems);
  return {
    draft,
    validation: validateSchema(BackupSchema, draft),
    targetValidation,
    dryRun: true,
    wouldExport: targetValidation.valid,
    note: "No live backup execution in Phase 1.5."
  };
}

export function createRestoreTestRequestDraft(input = {}) {
  return {
    restoreTestRequestId: makeId("restore_test", input.backupId ?? "draft"),
    backupId: input.backupId,
    requestedBy: input.requestedBy ?? "local_admin",
    status: RestoreTestStatus.SCHEDULED,
    dryRun: true,
    createdAt: nowIso(),
    note: "Restore test draft only; production restore requires approval."
  };
}
