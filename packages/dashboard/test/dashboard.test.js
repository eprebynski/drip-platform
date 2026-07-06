import test from "node:test";
import assert from "node:assert/strict";

import {
  CodexReviewItemSchema,
  ReviewItemStatus,
  validateSchema
} from "../../shared/src/index.js";
import {
  assertNoProductionConnections,
  createDashboardSnapshot,
  createPhase2CodexReviewItem
} from "../src/dashboard-data.js";
import { createDashboardStore } from "../src/dashboard-store.js";

test("dashboard data loads from mock repositories and local services", () => {
  const snapshot = createDashboardSnapshot();

  assert.equal(snapshot.productionPolicy.mode, "LOCAL_ONLY");
  assert.equal(snapshot.systemHealth.mode, "LOCAL_ONLY");
  assert.ok(snapshot.systemHealth.serviceHealth.length >= 5);
  assert.ok(snapshot.jobsAndErrors.jobs.length >= 15);
  assert.ok(snapshot.humanReviewQueue.length > 0);
  assert.ok(snapshot.codexReviewQueue.length > 0);
});

test("Codex Review Queue items expose dashboard display shape", () => {
  const snapshot = createDashboardSnapshot();

  for (const item of snapshot.codexReviewQueue) {
    assert.ok(item.phase);
    assert.ok(item.title);
    assert.ok(item.summary);
    assert.ok(Array.isArray(item.filesChanged));
    assert.ok(item.filesChanged.length > 0);
    assert.ok(item.riskLevel);
    assert.ok(item.productionImpact);
    assert.ok(Array.isArray(item.tests));
    assert.ok(Array.isArray(item.unresolvedBlockers));
    assert.ok(item.copyForChatGPT);
    assert.ok("promptBackToCodex" in item);
  }
});

test("copyForChatGPT is required by Codex review item schema", () => {
  const { item, validation } = createPhase2CodexReviewItem();
  assert.equal(validation.valid, true);

  const invalid = { ...item };
  delete invalid.copyForChatGPT;

  const invalidResult = validateSchema(CodexReviewItemSchema, invalid);
  assert.equal(invalidResult.valid, false);
  assert.match(invalidResult.errors.join(" "), /copyForChatGPT/);
});

test("promptBackToCodex is editable and stored locally", () => {
  const store = createDashboardStore();
  const item = store.getSnapshot().codexReviewQueue[0];
  const promptBackToCodex =
    "Refine Phase 2 dashboard copy after review; keep production writes blocked.";

  const updated = store.updateCodexReviewItem(item.reviewItemId, {
    status: ReviewItemStatus.SENT_BACK_TO_CODEX,
    promptBackToCodex
  });

  assert.equal(updated.status, ReviewItemStatus.SENT_BACK_TO_CODEX);
  assert.equal(updated.promptBackToCodex, promptBackToCodex);

  const stored = store
    .getSnapshot()
    .codexReviewQueue.find(
      (candidate) => candidate.reviewItemId === item.reviewItemId
  );
  assert.equal(stored.promptBackToCodex, promptBackToCodex);
  assert.equal(store.getSnapshot().localAuditTrail.length, 1);
  assert.equal(store.getSnapshot().localAuditTrail[0].productionWrite, false);
});

test("feature flags default OFF and cannot be enabled in dashboard", () => {
  const snapshot = createDashboardSnapshot();

  assert.ok(snapshot.featureFlags.length > 0);
  for (const flag of snapshot.featureFlags) {
    assert.equal(flag.enabled, false);
    assert.equal(flag.canEnableInDashboard, false);
    assert.equal(flag.enablementStatus, "OFF_LOCKED");
  }
});

test("dry-run status is visible across dashboard modules", () => {
  const snapshot = createDashboardSnapshot();

  assert.ok(snapshot.jobsAndErrors.jobs.every((job) => "dryRun" in job));
  assert.ok(snapshot.datasetUploads.bigQueryLoadPlans.every((plan) => plan.dryRun));
  assert.equal(snapshot.displayPlacements.screenCloudDryRun.dryRun, true);
  assert.equal(snapshot.billingReview.billingPreview.dryRun, true);
  assert.equal(snapshot.backupRestore.backupSummary.dryRun, true);
});

test("unresolved blockers are visible for system health and legacy migration", () => {
  const snapshot = createDashboardSnapshot();
  const blockerLabels = snapshot.legacyMigration.blockers.map(
    (blocker) => blocker.label
  );

  assert.ok(snapshot.systemHealth.blockers.length >= 6);
  assert.ok(blockerLabels.includes("deployed Apps Script parity"));
  assert.ok(blockerLabels.includes("Apps Script runtime load order"));
  assert.ok(blockerLabels.includes("live route usage"));
  assert.ok(blockerLabels.includes("Secret Manager migration"));
  assert.ok(blockerLabels.includes("approval owners"));
  assert.ok(blockerLabels.includes("BigQuery table map"));
  assert.equal(snapshot.legacyMigration.cutoverStatus, "BLOCKED");
});

test("no production credentials are required", () => {
  const snapshot = createDashboardSnapshot();

  assert.equal(snapshot.productionPolicy.credentialsRequired, false);
  assert.deepEqual(snapshot.productionPolicy.liveCredentialEnvNames, []);
});

test("dashboard declares no production service calls", () => {
  const snapshot = createDashboardSnapshot();

  assert.equal(assertNoProductionConnections(snapshot), true);
  assert.equal(snapshot.productionPolicy.productionWritesEnabled, false);
  assert.ok(
    Object.values(snapshot.productionPolicy.externalServiceCalls).every(
      (enabled) => enabled === false
    )
  );
});
