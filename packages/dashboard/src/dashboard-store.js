import {
  HUMAN_REVIEW_STATUS_VALUES,
  REVIEW_STATUS_VALUES,
  createDashboardSnapshot
} from "./dashboard-data.js";
import { CodexReviewItemSchema, validateSchema } from "../../shared/src/index.js";

export function createDashboardStore(seedSnapshot = createDashboardSnapshot()) {
  let snapshot = clone(seedSnapshot);

  return {
    getSnapshot() {
      return clone(snapshot);
    },

    updateCodexReviewItem(reviewItemId, patch = {}) {
      const item = snapshot.codexReviewQueue.find(
        (candidate) => candidate.reviewItemId === reviewItemId
      );
      if (!item) {
        throw new Error(`Unknown Codex review item: ${reviewItemId}`);
      }

      if (patch.status !== undefined) {
        assertAllowedValue(patch.status, REVIEW_STATUS_VALUES, "status");
        item.status = patch.status;
      }

      if (patch.promptBackToCodex !== undefined) {
        if (typeof patch.promptBackToCodex !== "string") {
          throw new Error("promptBackToCodex must be a string");
        }
        item.promptBackToCodex = patch.promptBackToCodex;
      }

      item.updatedAt = new Date().toISOString();
      appendLocalAudit("codexReviewItem", reviewItemId, "LOCAL_CODEX_REVIEW_UPDATE");
      const validation = validateSchema(CodexReviewItemSchema, item);
      if (!validation.valid) {
        throw new Error(validation.errors.join("; "));
      }
      return clone(item);
    },

    updateHumanReviewTask(taskId, patch = {}) {
      const task = snapshot.humanReviewQueue.find(
        (candidate) => candidate.taskId === taskId
      );
      if (!task) {
        throw new Error(`Unknown human review task: ${taskId}`);
      }

      if (patch.status !== undefined) {
        assertAllowedValue(patch.status, HUMAN_REVIEW_STATUS_VALUES, "status");
        task.status = patch.status;
      }

      task.updatedAt = new Date().toISOString();
      appendLocalAudit("humanReviewTask", taskId, "LOCAL_HUMAN_REVIEW_UPDATE");
      return clone(task);
    }
  };

  function appendLocalAudit(entityType, entityId, operation) {
    snapshot.localAuditTrail = snapshot.localAuditTrail ?? [];
    snapshot.localAuditTrail.push({
      auditLogId: `local_audit_${Date.now()}_${snapshot.localAuditTrail.length}`,
      entityType,
      entityId,
      operation,
      dryRun: true,
      productionWrite: false,
      createdAt: new Date().toISOString()
    });
  }
}

function assertAllowedValue(value, allowedValues, fieldName) {
  if (!allowedValues.includes(value)) {
    throw new Error(`${fieldName} must be one of ${allowedValues.join(", ")}`);
  }
}

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}
