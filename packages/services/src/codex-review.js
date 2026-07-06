import {
  CodexReviewItemSchema,
  ReviewItemStatus,
  validateSchema
} from "../../shared/src/index.js";
import { nowIso } from "./local-utils.js";

export function createPhase15CodexReviewItem(overrides = {}) {
  const now = nowIso();
  const item = {
    reviewItemId: overrides.reviewItemId ?? "review_phase_1_5_local_services",
    codexTaskId: overrides.codexTaskId ?? "codex_phase_1_5",
    title: "Phase 1.5 Local Service Skeletons",
    summary:
      overrides.summary ??
      "Local-only service skeletons using Phase 1 contracts, mock repositories, dry-run guards, and no live credentials.",
    fullOutput: overrides.fullOutput ?? "",
    filesChanged: overrides.filesChanged ?? ["packages/services", "docs"],
    riskLevel: overrides.riskLevel ?? "MEDIUM",
    requiresHumanApproval: true,
    copyForChatGPT:
      overrides.copyForChatGPT ??
      "Review Phase 1.5 local-only service skeletons. Confirm they are suitable before any production-connected implementation. Do not approve production work until unresolved parity, IAM, BigQuery, approval-owner, Secret Manager, and route-usage blockers are resolved.",
    promptBackToCodex:
      overrides.promptBackToCodex ??
      "Create local-only service contract refinement tasks based on review feedback; keep production-impacting flags off.",
    status: overrides.status ?? ReviewItemStatus.NEEDS_CHATGPT_REVIEW,
    createdAt: now,
    updatedAt: now
  };
  return {
    item,
    validation: validateSchema(CodexReviewItemSchema, item)
  };
}
