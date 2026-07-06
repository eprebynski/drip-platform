# Drip Local Service Skeletons

Phase 1.5 local-only service skeletons for future Drip Healthcare services.

These modules use the Phase 1 shared contracts and mock/local data only. They do not deploy, modify Apps Script, change triggers, access live Sheets, write Firestore, write BigQuery, call Stripe, call ScreenCloud, create production resources, or require live credentials.

## Unresolved Blockers Preserved

- Deployed Apps Script parity unresolved.
- Apps Script runtime load order unresolved.
- Live Cloud Run/IAM state unresolved.
- BigQuery `targetable_providers` location unresolved.
- Approval owners unresolved.
- Secret Manager migration unresolved.
- Live route usage unresolved.

## Local Tests

```bash
node --test packages/services/test/services.test.js
```
