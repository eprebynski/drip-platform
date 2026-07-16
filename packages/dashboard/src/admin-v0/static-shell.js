import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateAdminV0MockFixtures } from "../../scripts/validate-admin-v0-mock-fixtures.mjs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const mockDataDirectory = path.join(__dirname, "mock-data");

export const ADMIN_V0_ROUTE = "/admin/v0";
export const ADMIN_V0_SAFETY_BANNER =
  "Admin Dashboard v0 is static, mock-data only, non-production, read-only, and not approved for dry run or production behavior.";

const fixtureFiles = {
  phaseGateSummary: "phase-gate-summary.mock.json",
  workflowRegistry: "workflow-registry.mock.json",
  workflowBlockers: "workflow-blockers.mock.json",
  prohibitedActions: "prohibited-actions.mock.json",
  dashboardViewConfigs: "dashboard-view-configs.mock.json"
};

export function createAdminV0StaticShellSnapshot() {
  const validation = validateAdminV0MockFixtures({ mockDataDirectory });
  if (!validation.ok) {
    throw new Error(
      `Admin Dashboard v0 static shell blocked by invalid mock fixtures: ${validation.errors.join("; ")}`
    );
  }

  const phaseGate = readFixture(fixtureFiles.phaseGateSummary)[0];
  const workflows = readFixture(fixtureFiles.workflowRegistry);
  const blockers = readFixture(fixtureFiles.workflowBlockers);
  const prohibitedActions = readFixture(fixtureFiles.prohibitedActions);
  const plannedViews = readFixture(fixtureFiles.dashboardViewConfigs);
  const blockedWorkflows = workflows.filter((workflow) =>
    ["BLOCKED_BY_UNKNOWN_DEPENDENCIES", "EVIDENCE_NEEDED"].includes(workflow.status)
  );

  return {
    routePath: ADMIN_V0_ROUTE,
    renderMode: "STATIC_LOCAL_ONLY",
    safetyBanner: ADMIN_V0_SAFETY_BANNER,
    validation: {
      ok: validation.ok,
      filesValidated: validation.filesValidated,
      source: "validated local mock fixtures only"
    },
    phaseGate: {
      status: phaseGate.phase_gate_status,
      dryRunStatus: phaseGate.dry_run_status,
      readinessScore: phaseGate.readiness_score,
      productionImpact: phaseGate.production_impact,
      phase3Started: phaseGate.phase_3_started,
      productionBehaviorAllowed: phaseGate.production_behavior_allowed,
      safeSummary: phaseGate.safe_summary
    },
    cards: [
      {
        label: "Phase gate",
        value: phaseGate.phase_gate_status,
        detail: phaseGate.safe_summary
      },
      {
        label: "Fixture validation",
        value: "PASSED",
        detail: `${validation.filesValidated} local mock fixture files validated.`
      },
      {
        label: "Blocked workflows",
        value: blockedWorkflows.length,
        detail: `${blockers.length} blocker records keep legacy and future workflows unresolved.`
      },
      {
        label: "Prohibited actions",
        value: prohibitedActions.length,
        detail: "Production, live-system, mutation, and Phase 3 actions remain prohibited."
      },
      {
        label: "Dry run",
        value: phaseGate.dry_run_status,
        detail: "Limited dry run is not approved."
      },
      {
        label: "Production impact",
        value: phaseGate.production_impact,
        detail: "No production impact is approved by this shell."
      },
      {
        label: "Production behavior",
        value: phaseGate.production_behavior_allowed,
        detail: "Production behavior is not approved."
      }
    ],
    blockedWorkflows: blockedWorkflows.slice(0, 8).map((workflow) => ({
      name: workflow.workflow_name,
      status: workflow.status,
      ownerCategory: workflow.owner_category,
      gate: workflow.strict_gate_profile
    })),
    prohibitedActions: prohibitedActions.slice(0, 10).map((action) => ({
      name: action.action_name,
      status: action.current_status,
      severity: action.severity
    })),
    plannedViews: plannedViews.map((view) => ({
      name: view.view_name,
      status: view.status,
      rule: view.safe_display_rule
    })),
    guardrails: [
      "validated mock fixtures only",
      "no live service client imports",
      "no network calls",
      "no server mutations",
      "no forms",
      "no write actions",
      "no credentials",
      "no production environment dependency"
    ]
  };
}

export function renderAdminV0StaticShell(snapshot = createAdminV0StaticShellSnapshot()) {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Admin Dashboard v0 Static Shell</title>
    <link rel="stylesheet" href="/styles.css">
  </head>
  <body>
    <main class="admin-v0-shell" aria-label="Admin Dashboard v0 static shell">
      <header class="admin-v0-hero">
        <p class="eyebrow">Phase 2.50 Static Shell</p>
        <h1>Admin Dashboard v0</h1>
        <p class="admin-v0-banner">${escapeHtml(snapshot.safetyBanner)}</p>
      </header>

      <section class="admin-v0-status-grid" aria-label="Static shell safety status">
        ${snapshot.cards.map(renderStatusCard).join("")}
      </section>

      <section class="admin-v0-section" aria-label="Phase gate posture">
        <div>
          <p class="eyebrow">Phase Gate Posture</p>
          <h2>${escapeHtml(snapshot.phaseGate.status)}</h2>
          <p class="subtle">${escapeHtml(snapshot.phaseGate.safeSummary)}</p>
        </div>
        <dl class="admin-v0-definition-grid">
          ${definition("Dry run", snapshot.phaseGate.dryRunStatus)}
          ${definition("Readiness", snapshot.phaseGate.readinessScore)}
          ${definition("Production impact", snapshot.phaseGate.productionImpact)}
          ${definition("Phase 3 started", snapshot.phaseGate.phase3Started)}
          ${definition("Production behavior", snapshot.phaseGate.productionBehaviorAllowed)}
          ${definition("Fixture validation", `${snapshot.validation.filesValidated} files passed`)}
        </dl>
      </section>

      <section class="admin-v0-section" aria-label="Blocked workflow summary">
        <div>
          <p class="eyebrow">Blocked Workflows</p>
          <h2>Mock Fixture Summary</h2>
        </div>
        ${staticTable(["Workflow", "Status", "Owner category", "Gate"], snapshot.blockedWorkflows.map((workflow) => [
          workflow.name,
          workflow.status,
          workflow.ownerCategory,
          workflow.gate
        ]))}
      </section>

      <section class="admin-v0-section" aria-label="Prohibited actions summary">
        <div>
          <p class="eyebrow">Prohibited Actions</p>
          <h2>No Operational Controls</h2>
        </div>
        ${staticTable(["Action", "Status", "Severity"], snapshot.prohibitedActions.map((action) => [
          action.name,
          action.status,
          action.severity
        ]))}
      </section>

      <section class="admin-v0-section" aria-label="Planned views">
        <div>
          <p class="eyebrow">Planned Views</p>
          <h2>Navigation Preview Only</h2>
          <p class="subtle">Future views are listed for orientation and are not operational routes in this shell.</p>
        </div>
        <ul class="admin-v0-view-list">
          ${snapshot.plannedViews.map((view) => `
            <li>
              <strong>${escapeHtml(view.name)}</strong>
              <span>${escapeHtml(view.status)}</span>
              <p>${escapeHtml(view.rule)}</p>
            </li>
          `).join("")}
        </ul>
      </section>

      <section class="admin-v0-section" aria-label="Static guardrails">
        <div>
          <p class="eyebrow">Static Guardrails</p>
          <h2>Read-only Local Shell</h2>
        </div>
        <ul class="admin-v0-guardrail-list">
          ${snapshot.guardrails.map((guardrail) => `<li>${escapeHtml(guardrail)}</li>`).join("")}
        </ul>
      </section>
    </main>
  </body>
</html>`;
}

function readFixture(fileName) {
  return JSON.parse(fs.readFileSync(path.join(mockDataDirectory, fileName), "utf8"));
}

function renderStatusCard(card) {
  return `
    <article class="admin-v0-card">
      <span>${escapeHtml(card.label)}</span>
      <strong>${escapeHtml(String(card.value))}</strong>
      <p>${escapeHtml(card.detail)}</p>
    </article>
  `;
}

function definition(term, value) {
  return `
    <div>
      <dt>${escapeHtml(term)}</dt>
      <dd>${escapeHtml(String(value))}</dd>
    </div>
  `;
}

function staticTable(headers, rows) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `
          <tr>${row.map((cell) => `<td>${escapeHtml(String(cell ?? ""))}</td>`).join("")}</tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
