import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

import {
  ADMIN_V0_ROUTE,
  createAdminV0StaticShellSnapshot,
  renderAdminV0StaticShell
} from "../src/admin-v0/static-shell.js";

test("Admin Dashboard v0 static shell renders with validated mock fixture data", () => {
  const snapshot = createAdminV0StaticShellSnapshot();
  const html = renderAdminV0StaticShell(snapshot);

  assert.equal(snapshot.routePath, "/admin/v0");
  assert.equal(ADMIN_V0_ROUTE, "/admin/v0");
  assert.equal(snapshot.validation.ok, true);
  assert.equal(snapshot.validation.filesValidated, 18);
  assert.match(html, /Admin Dashboard v0 is static, mock-data only/);
  assert.match(html, /PHASE_3_BLOCKED/);
  assert.match(html, /NOT_APPROVED/);
  assert.match(html, /BLOCKED_PROGRESSING/);
  assert.match(html, /NONE/);
  assert.match(html, /Phase 3 started/);
  assert.match(html, /NO/);
});

test("Admin Dashboard v0 static shell exposes blocked posture panels", () => {
  const snapshot = createAdminV0StaticShellSnapshot();
  const labels = snapshot.cards.map((card) => card.label);

  assert.ok(labels.includes("Phase gate"));
  assert.ok(labels.includes("Fixture validation"));
  assert.ok(labels.includes("Blocked workflows"));
  assert.ok(labels.includes("Prohibited actions"));
  assert.ok(labels.includes("Dry run"));
  assert.ok(labels.includes("Production impact"));
  assert.ok(labels.includes("Production behavior"));
  assert.ok(snapshot.blockedWorkflows.length > 0);
  assert.ok(snapshot.prohibitedActions.length > 0);
  assert.ok(snapshot.plannedViews.length > 0);
});

test("Admin Dashboard v0 static shell does not render mutation or approval controls", () => {
  const html = renderAdminV0StaticShell();
  const forbiddenMarkup = [
    /<button\b/i,
    /<form\b/i,
    /<input\b/i,
    /<select\b/i,
    /<textarea\b/i,
    /data-[a-z-]*save=/i,
    /data-[a-z-]*action=/i
  ];
  const forbiddenPhrases = [
    /approve workflow/i,
    /workflow approval control/i,
    /billing action/i,
    /admin action/i,
    /create issue/i,
    /deploy now/i,
    /production action/i
  ];

  for (const pattern of [...forbiddenMarkup, ...forbiddenPhrases]) {
    assert.doesNotMatch(html, pattern);
  }
});

test("Admin Dashboard v0 static shell module does not import live service clients", () => {
  const source = fs.readFileSync(
    new URL("../src/admin-v0/static-shell.js", import.meta.url),
    "utf8"
  );

  assert.doesNotMatch(source, /services\/src/);
  assert.doesNotMatch(source, /dashboard-data/);
  assert.doesNotMatch(source, /fetch\(/);
  assert.doesNotMatch(source, /XMLHttpRequest/);
  assert.doesNotMatch(source, /process\.env/);
});
