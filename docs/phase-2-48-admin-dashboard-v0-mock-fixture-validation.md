# Phase 2.48 Admin Dashboard v0 Mock Fixture Validation

## Purpose

Phase 2.48 adds local validation tooling for the Admin Dashboard v0 mock fixture files under `packages/dashboard/src/admin-v0/mock-data/`.

This phase is validation tooling only. It does not build the dashboard, create routes, create pages, create UI components, create APIs, create schemas, create migrations, create production resources, query live systems, read production data, write production data, approve Phase 3, approve limited dry run, or approve production behavior.

## Local Command

Run:

```bash
npm run validate:admin-v0-mock-fixtures --prefix packages/dashboard
```

Validation must pass before any later dashboard build planning proceeds.

## Validator Coverage

The validator fails closed when:

- the mock fixture directory is missing
- the directory does not contain exactly the approved `.mock.json` files
- unapproved files or subdirectories exist, except optional README documentation
- any fixture is malformed JSON
- any fixture does not use a non-empty top-level array
- fixture content contains obvious private data, live URLs, credentials, private IDs, raw logs, generated private evidence references, or patient data indicators
- conservative defaults are changed away from blocked/not-approved values
- production approval, live read/write, dry-run approval, Phase 3 started, billing/email/Stripe/ScreenCloud/YouTube write, or deploy approval values appear
- required safe blocked values are missing from the fixture set

## Safety Posture

The fixtures remain local/mock only. They contain no private data, no production data, no live credentials, and no generated private evidence.

Phase 3 remains blocked. Limited dry run remains not approved. Production behavior remains not approved. Production impact remains `NONE`.
