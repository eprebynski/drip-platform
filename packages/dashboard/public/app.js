const MODULES = [
  ["system", "System Health"],
  ["jobs", "Jobs & Errors"],
  ["human", "Human Review Queue"],
  ["codex", "Codex Review Queue"],
  ["flags", "Feature Flags"],
  ["datasets", "Dataset Uploads"],
  ["market", "Market Intelligence"],
  ["display", "Display Placements"],
  ["billing", "Billing Review"],
  ["backup", "Backup & Restore"],
  ["legacy", "Legacy Migration"]
];

let dashboard = null;
let activeModule = "system";

const nav = document.querySelector("#moduleNav");
const content = document.querySelector("#content");
const modePill = document.querySelector("#modePill");
const featureFlagPill = document.querySelector("#featureFlagPill");
const credentialPill = document.querySelector("#credentialPill");

const RENDERERS = {
  system: renderSystemHealth,
  jobs: renderJobsAndErrors,
  human: renderHumanReviewQueue,
  codex: renderCodexReviewQueue,
  flags: renderFeatureFlags,
  datasets: renderDatasetUploads,
  market: renderMarketIntelligence,
  display: renderDisplayPlacements,
  billing: renderBillingReview,
  backup: renderBackupRestore,
  legacy: renderLegacyMigration
};

start().catch((error) => {
  content.innerHTML = `<section class="module"><h2>Dashboard unavailable</h2><p>${escapeHtml(error.message)}</p></section>`;
});

async function start() {
  dashboard = await requestJson("/api/dashboard");
  renderChrome();
  renderActiveModule();
}

function renderChrome() {
  const flagsOff = dashboard.featureFlags.every((flag) => !flag.enabled);
  modePill.textContent = dashboard.productionPolicy.mode;
  featureFlagPill.textContent = flagsOff ? "Feature flags OFF" : "Feature flag review";
  featureFlagPill.className = flagsOff ? "pill local" : "pill bad";
  credentialPill.textContent = dashboard.productionPolicy.credentialsRequired ? "Credentials required" : "No live credentials";
  credentialPill.className = dashboard.productionPolicy.credentialsRequired ? "pill bad" : "pill local";

  nav.innerHTML = MODULES.map(([key, label]) => `
    <button class="nav-button ${key === activeModule ? "active" : ""}" data-module="${key}">
      <span class="nav-label">${escapeHtml(label)}</span>
      <span class="nav-count">${moduleCount(key)}</span>
    </button>
  `).join("");

  nav.querySelectorAll("[data-module]").forEach((button) => {
    button.addEventListener("click", () => {
      activeModule = button.dataset.module;
      renderChrome();
      renderActiveModule();
      content.focus();
    });
  });
}

function renderActiveModule() {
  const [, title] = MODULES.find(([key]) => key === activeModule);
  content.innerHTML = moduleShell(title, RENDERERS[activeModule]());
  bindActions();
}

function renderSystemHealth() {
  const health = dashboard.systemHealth;
  return `
    ${metricGrid([
      ["Mode", health.mode],
      ["Failed jobs", health.failedJobCount],
      ["Human review", health.humanReviewTaskCount],
      ["Codex review", health.codexReviewItemCount]
    ])}
    ${section("Latest Mock Daily Automation", record(health.latestDailyAutomationStatus.status, health.latestDailyAutomationStatus.rollbackNotes, [
      ["Jobs", health.latestDailyAutomationStatus.jobCount],
      ["Failed", health.latestDailyAutomationStatus.failedJobCount],
      ["Approval required", health.latestDailyAutomationStatus.approvalRequiredJobCount],
      ["Dry run", "Yes"]
    ], "DRY_RUN"))}
    ${section("Mock Service Health", table(["Service", "Mode", "Status", "Note"], health.serviceHealth.map((service) => [
      service.service,
      service.mode,
      service.status,
      service.note
    ])))}
    ${section("Unresolved Blockers", blockerList(health.blockers))}
  `;
}

function renderJobsAndErrors() {
  return `
    ${section("Mock Jobs", table(["Job", "Status", "Dry run", "Approval", "Warnings", "Rollback notes"],
      dashboard.jobsAndErrors.jobs.map((job) => [
        job.jobType,
        job.status,
        yesNo(job.dryRun),
        yesNo(job.approvalRequired),
        listText(job.warnings),
        job.rollbackNotes
      ])
    ))}
    ${section("Mock Error Logs", table(["Error", "Risk", "Related job", "Message"],
      dashboard.jobsAndErrors.errors.map((error) => [
        error.errorType,
        error.riskLevel,
        error.relatedJobId ?? "n/a",
        error.message
      ])
    ))}
  `;
}

function renderHumanReviewQueue() {
  return `<div class="record-list">${dashboard.humanReviewQueue.map((task) => `
    <article class="record">
      ${recordHeader(task.taskType, task.reason, task.status, task.status === "OPEN" ? "warn" : "neutral")}
      ${metaGrid([
        ["Risk", task.riskLevel],
        ["Owner", task.ownerRole],
        ["Suggested next action", task.suggestedNextAction]
      ])}
      <div class="inline-actions">
        ${selectField(`human-status-${task.taskId}`, "Status", task.statusOptions, task.status)}
        <button class="button secondary" data-human-save="${escapeHtml(task.taskId)}">Save</button>
      </div>
    </article>
  `).join("")}</div>`;
}

function renderCodexReviewQueue() {
  return `<div class="record-list">${dashboard.codexReviewQueue.map((item) => `
    <article class="record">
      ${recordHeader(item.title, item.summary, item.status, item.status.includes("APPROVED") ? "good" : "warn")}
      ${metaGrid([
        ["Phase", item.phase],
        ["Risk", item.riskLevel],
        ["Production impact", item.productionImpact]
      ])}
      ${compactList("Files changed", item.filesChanged)}
      ${compactList("Tests", item.tests)}
      ${compactList("Unresolved blockers", item.unresolvedBlockers)}
      <div class="split">
        ${textAreaField(`copy-${item.reviewItemId}`, "copyForChatGPT", item.copyForChatGPT, true)}
        ${textAreaField(`prompt-${item.reviewItemId}`, "promptBackToCodex", item.promptBackToCodex ?? "", false)}
      </div>
      <div class="inline-actions">
        ${selectField(`codex-status-${item.reviewItemId}`, "Status", item.statusOptions, item.status)}
        <button class="button" data-codex-save="${escapeHtml(item.reviewItemId)}">Save</button>
      </div>
    </article>
  `).join("")}</div>`;
}

function renderFeatureFlags() {
  return section("Production-impacting Flags", table(["Flag", "Environment", "State", "Dashboard enablement"],
    dashboard.featureFlags.map((flag) => [
      flag.flagKey,
      flag.environment,
      `<span class="locked-toggle" aria-label="${escapeHtml(flag.flagKey)} off"></span> OFF`,
      flag.enablementStatus
    ]),
    true
  ));
}

function renderDatasetUploads() {
  const uploads = dashboard.datasetUploads;
  return `
    ${metricGrid([
      ["Live upload", uploads.liveUploadEnabled ? "Enabled" : "Disabled"],
      ["Dataset drafts", uploads.datasetDrafts.length],
      ["Supported types", uploads.supportedDatasetTypes.length],
      ["BigQuery plans", uploads.bigQueryLoadPlans.length]
    ])}
    ${section("Local Dataset Metadata Drafts", table(["Dataset", "Type", "Source", "Target table", "Warnings"],
      uploads.datasetDrafts.map((dataset) => [
        dataset.datasetName,
        dataset.datasetType,
        dataset.sourceType,
        `${dataset.targetBigQueryDataset}.${dataset.targetBigQueryTable}`,
        listText(dataset.dataQualityWarnings)
      ])
    ))}
    ${section("Supported Dataset Types", compactList("", uploads.supportedDatasetTypes))}
    ${section("Dry-run BigQuery Load Plan", table(["Dataset", "Dry run", "Validation", "Steps"],
      uploads.bigQueryLoadPlans.map((plan) => [
        plan.datasetId,
        yesNo(plan.dryRun),
        plan.validation.valid ? "VALID" : listText(plan.validation.errors),
        listText(plan.steps)
      ])
    ))}
  `;
}

function renderMarketIntelligence() {
  const market = dashboard.marketIntelligence;
  return `
    ${metricGrid([
      ["Market score", market.recommendation.marketOpportunityScore],
      ["Specialty score", market.recommendation.specialtyOpportunityScore],
      ["Payor score", market.recommendation.payorOpportunityScore],
      ["Fit score", market.recommendation.advertiserFitScore]
    ])}
    ${section("Mock Recommendation", record(market.recommendation.recommendedCampaignType, market.recommendation.reasoningText, [
      ["Suggested markets", listText(market.recommendation.suggestedMarkets)],
      ["Suggested specialties", listText(market.recommendation.suggestedSpecialties)],
      ["Source freshness warnings", listText(market.recommendation.sourceFreshnessWarnings)],
      ["Source dataset placeholders", listText(market.recommendation.sourceDatasetIds)]
    ], "MOCK_OUTPUT"))}
    ${section("Placeholders", table(["Source", "Present", "Live connection"], [
      ["Google Search/search-interest", yesNo(market.placeholders.googleSearchInterest), "No"],
      ["Payor dataset", yesNo(market.placeholders.payorDataset), "No"],
      ["BigQuery", "No production table", "No"]
    ]))}
  `;
}

function renderDisplayPlacements() {
  const display = dashboard.displayPlacements;
  return `
    ${section("Mock Placements", table(["Placement", "Campaign", "Provider", "Display provider", "Status", "Sync"],
      display.placements.map((placement) => [
        placement.placementId,
        placement.campaignId,
        placement.providerId,
        placement.displayProvider,
        placement.placementStatus,
        placement.syncStatus
      ])
    ))}
    ${section("Display Provider Abstraction", table(["Adapter", "Provider type", "Mode", "Supports dry-run", "Live write"],
      display.providers.map((provider) => [
        provider.adapterName,
        provider.displayProviderType,
        provider.mode,
        yesNo(provider.supportsDryRun),
        yesNo(provider.liveWriteEnabled)
      ])
    ))}
    ${section("ScreenCloudAdapter", record("ScreenCloudAdapter dry-run", display.screenCloudDryRun.reason ?? "Dry-run preview only.", [
      ["Dry run", yesNo(display.screenCloudDryRun.dryRun)],
      ["Target system", display.screenCloudDryRun.targetSystem],
      ["Operation", display.screenCloudDryRun.operation]
    ], "NO_LIVE_WRITE"))}
  `;
}

function renderBillingReview() {
  const billing = dashboard.billingReview;
  return `
    ${metricGrid([
      ["Amount", `${billing.billingPreview.chargeSummary.amount} ${billing.billingPreview.chargeSummary.currency}`],
      ["Dry run", yesNo(billing.billingPreview.dryRun)],
      ["Approval required", yesNo(billing.approvalRequired)],
      ["Stripe access", yesNo(billing.stripeAccess)]
    ])}
    ${section("Billing Preview", table(["Campaign", "Events", "Rate", "Revenue share", "Readiness"], [[
      billing.billingPreview.campaignId,
      billing.billingPreview.chargeSummary.eventCount,
      billing.billingPreview.chargeSummary.rate,
      `${billing.billingPreview.revenueShare.amount} ${billing.billingPreview.revenueShare.currency}`,
      billing.billingPreview.readiness.ready ? "READY_FOR_PREVIEW" : listText(billing.billingPreview.readiness.errors)
    ]]))}
    ${section("Invoice Preview", table(["Invoice", "Status", "Dry run", "Stripe ref"], [[
      billing.invoicePreview.invoiceId,
      billing.invoicePreview.billingStatus,
      yesNo(billing.invoicePreview.dryRun),
      billing.invoicePreview.externalInvoiceRef ?? "None"
    ]]))}
  `;
}

function renderBackupRestore() {
  const backup = dashboard.backupRestore;
  return `
    ${metricGrid([
      ["Live backup", backup.liveBackupEnabled ? "Enabled" : "Disabled"],
      ["Live restore", backup.liveRestoreEnabled ? "Enabled" : "Disabled"],
      ["Draft status", backup.backupDraft.status],
      ["Restore test", backup.restoreTestRequest.status]
    ])}
    ${section("Mock Backup Jobs", table(["Job", "Status", "Dry run", "Warnings", "Rollback"],
      backup.backupJobs.map((job) => [
        job.jobType,
        job.status,
        yesNo(job.dryRun),
        listText(job.warnings),
        job.rollbackNotes
      ])
    ))}
    ${section("Restore-test Request Draft", record(backup.backupDraft.backupType, backup.backupSummary.note, [
      ["Included systems", listText(backup.backupDraft.includedSystems)],
      ["Would export", yesNo(backup.backupSummary.wouldExport)],
      ["Restore request", backup.restoreTestRequest.restoreTestRequestId],
      ["Restore note", backup.restoreTestRequest.note]
    ], "DRY_RUN"))}
  `;
}

function renderLegacyMigration() {
  const legacy = dashboard.legacyMigration;
  return `
    ${metricGrid([
      ["Cutover", legacy.cutoverStatus],
      ["Blockers", legacy.blockers.length],
      ["Legacy deletion", legacy.productionDeletionAllowed ? "Allowed" : "Blocked"],
      ["Production systems", "Unchanged"]
    ])}
    ${section("Migration Status", `<div class="record"><strong>${escapeHtml(legacy.migrationStatus)}</strong></div>`)}
    ${section("Unresolved Blockers", blockerList(legacy.blockers))}
  `;
}

function bindActions() {
  content.querySelectorAll("[data-codex-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.codexSave;
      const status = document.querySelector(`#codex-status-${cssEscape(id)}`).value;
      const promptBackToCodex = document.querySelector(`#prompt-${cssEscape(id)}`).value;
      await requestJson(`/api/codex-review/${encodeURIComponent(id)}/status`, {
        method: "POST",
        body: JSON.stringify({ status, promptBackToCodex })
      });
      await refresh("Codex review item saved locally.");
    });
  });

  content.querySelectorAll("[data-human-save]").forEach((button) => {
    button.addEventListener("click", async () => {
      const id = button.dataset.humanSave;
      const status = document.querySelector(`#human-status-${cssEscape(id)}`).value;
      await requestJson(`/api/human-review/${encodeURIComponent(id)}/status`, {
        method: "POST",
        body: JSON.stringify({ status })
      });
      await refresh("Human review item saved locally.");
    });
  });
}

async function refresh(message) {
  dashboard = await requestJson("/api/dashboard");
  renderChrome();
  renderActiveModule();
  toast(message);
}

function moduleShell(title, body) {
  return `
    <section class="module" aria-label="${escapeHtml(title)}">
      <div class="module-header">
        <h2>${escapeHtml(title)}</h2>
        ${statusPill("LOCAL_ONLY", "good")}
      </div>
      ${body}
    </section>
  `;
}

function metricGrid(items) {
  return `<div class="metric-grid">${items.map(([label, value]) => `
    <div class="metric">
      <span class="metric-label">${escapeHtml(label)}</span>
      <span class="metric-value">${escapeHtml(String(value))}</span>
    </div>
  `).join("")}</div>`;
}

function metaGrid(items) {
  return `<div class="meta-grid">${items.map(([label, value]) => `
    <div class="meta-item">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(String(value ?? "n/a"))}</strong>
    </div>
  `).join("")}</div>`;
}

function section(title, body) {
  return `
    <section class="section-band">
      ${title ? `<div class="section-title-row"><h3>${escapeHtml(title)}</h3></div>` : ""}
      ${body}
    </section>
  `;
}

function record(title, subtitle, rows, pillText) {
  return `<div class="record">${recordHeader(title, subtitle, pillText, "good")}${metaGrid(rows)}</div>`;
}

function recordHeader(title, subtitle, pillText, tone) {
  return `
    <div class="record-header">
      <div class="record-title">
        <strong>${escapeHtml(title)}</strong>
        <span class="subtle">${escapeHtml(subtitle ?? "")}</span>
      </div>
      ${statusPill(pillText, tone)}
    </div>
  `;
}

function table(headers, rows, allowHtml = false) {
  return `
    <div class="table-wrap">
      <table>
        <thead><tr>${headers.map((header) => `<th>${escapeHtml(header)}</th>`).join("")}</tr></thead>
        <tbody>${rows.map((row) => `
          <tr>${row.map((cell) => `<td>${allowHtml ? cell : escapeHtml(String(cell ?? ""))}</td>`).join("")}</tr>
        `).join("")}</tbody>
      </table>
    </div>
  `;
}

function compactList(title, items = []) {
  return `
    <div class="detail-list">
      ${title ? `<h3>${escapeHtml(title)}</h3>` : ""}
      <ul class="dense-list">${(items ?? []).map((item) => `<li>${escapeHtml(String(item))}</li>`).join("")}</ul>
    </div>
  `;
}

function blockerList(blockers) {
  return `<div class="record-list">${blockers.map((blocker) => `
    <div class="record">${recordHeader(blocker.label, blocker.key, blocker.status, "bad")}</div>
  `).join("")}</div>`;
}

function selectField(id, label, options, selected) {
  return `
    <div class="field">
      <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
      <select id="${escapeHtml(id)}">
        ${options.map((option) => `<option value="${escapeHtml(option)}" ${option === selected ? "selected" : ""}>${escapeHtml(option)}</option>`).join("")}
      </select>
    </div>
  `;
}

function textAreaField(id, label, value, readonly = false) {
  return `
    <div class="field">
      <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
      <textarea id="${escapeHtml(id)}" ${readonly ? "readonly" : ""}>${escapeHtml(value ?? "")}</textarea>
    </div>
  `;
}

function statusPill(text, tone = "neutral") {
  return `<span class="status-pill ${tone}">${escapeHtml(text)}</span>`;
}

function moduleCount(key) {
  const counts = {
    system: dashboard?.systemHealth?.failedJobCount ?? 0,
    jobs: dashboard?.jobsAndErrors?.jobs?.length ?? 0,
    human: dashboard?.humanReviewQueue?.length ?? 0,
    codex: dashboard?.codexReviewQueue?.length ?? 0,
    flags: dashboard?.featureFlags?.length ?? 0,
    datasets: dashboard?.datasetUploads?.datasetDrafts?.length ?? 0,
    market: dashboard?.marketIntelligence?.recommendation ? 1 : 0,
    display: dashboard?.displayPlacements?.placements?.length ?? 0,
    billing: dashboard?.billingReview?.billingPreview ? 1 : 0,
    backup: dashboard?.backupRestore?.backupJobs?.length ?? 0,
    legacy: dashboard?.legacyMigration?.blockers?.length ?? 0
  };
  return counts[key] ?? 0;
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed: ${response.status}`);
  }
  return response.json();
}

function listText(items = []) {
  return (items ?? []).length === 0 ? "None" : items.join("; ");
}

function yesNo(value) {
  return value ? "Yes" : "No";
}

function toast(message) {
  const node = document.createElement("div");
  node.className = "toast";
  node.textContent = message;
  document.body.append(node);
  window.setTimeout(() => node.remove(), 1800);
}

function cssEscape(value) {
  return window.CSS?.escape ? window.CSS.escape(value) : value.replace(/[^a-zA-Z0-9_-]/g, "\\$&");
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
