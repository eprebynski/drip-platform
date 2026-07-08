# Phase 2.15 Current-To-Future Sheet Mapping Correction

## Scope

Phase 2.15 corrects the planning-only mapping between Drip's seven current legacy Google Sheets and the approved future logical Sheet areas shown in the local Apps Script dependency auto-review report.

- Production impact: NONE
- Phase 3 started: NO
- Apps Script changes: NONE
- Trigger changes: NONE
- Live Google Sheet changes: NONE
- Deployments: NONE
- Live credentials required: NO

## What Was Wrong

Phase 2.14 correctly promoted sanitized current-Sheet evidence, but it assigned the `Future logical area` column by sequential position. That treated current Sheet numbers as if they were future logical Sheet numbers.

The legacy current Sheets evolved around different operational workflows. Their numbers do not define the future planning model, so sequential mapping produced incorrect migration guidance.

## Correct Explicit Mapping

The reviewer now uses an explicit approved mapping:

| Current legacy Sheet | Future logical area |
| --- | --- |
| Current Sheet 1 | Legacy Archive: Old Sheet 1 Campaigns |
| Current Sheet 2 | Sheet 2: Advertiser Intake |
| Current Sheet 3 | Sheet 3: Provider Display Preferences |
| Current Sheet 4 | Sheet 1: Provider Intake |
| Current Sheet 5 | Sheet 4: Provider Campaigns |
| Current Sheet 6 | Sheet 6: Patient Campaigns |
| Current Sheet 7 | Sheet 5: Conference Campaigns |

The current-source meanings used for sanitized evidence matching are:

- Current Sheet 1: legacy campaign archive; archive/retire only
- Current Sheet 2: advertiser, vendor, and employer intake
- Current Sheet 3: provider display preferences and approvals
- Current Sheet 4: provider and medical venue intake
- Current Sheet 5: provider marketplace and directory campaigns
- Current Sheet 6: video and patient screen campaigns
- Current Sheet 7: conference campaigns

Display-preference wording is retained for Current Sheet 3 so preference and approval evidence is not confused with provider intake.

## Planning Model Only

The corrected mapping is migration planning guidance. It does not:

- physically rename a Sheet
- change a live Sheet
- make current Sheet evidence into future architecture
- infer an Apps Script handler
- infer workflow-to-Sheet reads or writes
- prove a production caller
- prove runtime behavior
- approve migration or cutover

Google Sheets remain temporary migration bridges. Current Sheet evidence remains current sanitized evidence only.

## Apps Script And Phase 3

The mapping correction does not reduce Apps Script runtime `UNKNOWN` fields. Live mode usage, active handlers, workflow-to-handler mapping, workflow-to-Sheet read/write behavior, production callers, owners, rollback paths, and cutover readiness still require separate sanitized evidence and Drip/ChatGPT review.

Phase 3 remains blocked unless all required evidence is present and Drip/ChatGPT explicitly approves the next scope. This correction does not mark Phase 3 ready.

## Local Workflow

Run:

```bash
npm run evidence:draft-summaries
npm run evidence:review-packets
npm run evidence:review-apps-script-dependencies
npm run evidence:status
```

The generated report remains local/private at:

```text
~/Documents/Drip/private-evidence/apps-script/apps-script-dependency-auto-review-report.md
```

## Do Not Commit

Do not commit:

- generated private reports or review packets
- filled private templates
- raw or redacted private exports
- spreadsheet IDs or private Sheet exports
- Apps Script deployment URLs or identifiers
- screenshots
- customer, order, payment, or form-response data
- tokens, cookies, credentials, or secrets

Commit only separately reviewed and sanitized conclusions. Do not automatically promote private report content into repository documentation.
