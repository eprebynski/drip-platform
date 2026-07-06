# Drip Shared Contracts

Non-production foundation contracts for the Drip Healthcare rebuild.

This package contains schema descriptors, shared statuses, dry-run guards, service contracts, and adapter stubs only. It does not connect to Firestore, BigQuery, Apps Script, Stripe, ScreenCloud, Cloud Run, Google Sheets, or any live service.

## Phase 1 Blockers Preserved

- Deployed Apps Script parity unresolved.
- Apps Script runtime load order unresolved.
- Live Cloud Run/IAM state unresolved.
- BigQuery `targetable_providers` location unresolved.
- Billing approval owners unresolved.
- Display/write approval owners unresolved.
- Dataset production-load approval owners unresolved.
- Secret Manager migration not confirmed.
- Live traffic/route usage not measured.

## Local Validation

```bash
npm test --prefix packages/shared
```

If `npm` is not available on the system path, run the bundled Node executable directly:

```bash
node --test packages/shared/test
```
