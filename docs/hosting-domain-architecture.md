# Hosting And Domain Architecture

## Purpose

This document defines the target hosting and domain architecture for Drip Healthcare. It is a planning document only. It does not authorize deploys, DNS changes, Squarespace changes, live credentials, production resource creation, or cutover.

## Target Principle

Drip Healthcare should consolidate website, app, dashboard, redirect, API, and showcase hosting into the GitHub/GCP rebuild stack. Squarespace can remain temporary for current public pages and, if applicable, domain registration/DNS management, but it should not remain a required website/application platform.

## Target Surfaces

| Hostname | Target use | Production posture |
| --- | --- | --- |
| `driphealthcare.com` | Public marketing website | Repo-controlled public frontend after migration. |
| `www.driphealthcare.com` | Public marketing website alias | Redirect to apex or serve same public frontend. |
| `admin.driphealthcare.com` | Drip Admin Dashboard | Authenticated admin app; never Squarespace. |
| `app.driphealthcare.com` | Shared authenticated app shell | Authenticated app surface for user workflows. |
| `app.driphealthcare.com/advertisers` | Advertiser Dashboard | Preferred initial route under shared app shell. |
| `advertisers.driphealthcare.com` | Advertiser Dashboard optional subdomain | Use only if routing/brand needs justify it. |
| `app.driphealthcare.com/media-center` | Provider Media Center | Preferred initial route under shared app shell. |
| `media.driphealthcare.com` | Provider Media Center optional subdomain | Use only if routing/brand needs justify it. |
| `api.driphealthcare.com` | API layer | Cloud Run/API gateway boundary with auth/RBAC. |
| `go.driphealthcare.com` | Campaign and QR redirects | Dedicated redirect service with event logging. |
| `showcase.driphealthcare.com` | Conference showcase pages | Static/hybrid showcase frontend with API-backed events. |

## Recommended Hosting Pattern

| Layer | Recommendation |
| --- | --- |
| Public marketing pages | Firebase Hosting static frontend or equivalent GCP-first static host. |
| Authenticated apps | Static frontend served from GCP-first hosting, backed by Cloud Run APIs. |
| APIs | Cloud Run services with managed HTTPS, IAM/auth/RBAC, structured logs, and audit records. |
| Redirects | Dedicated Cloud Run RedirectService on `go.driphealthcare.com`. |
| Static assets | Repo-controlled build artifacts or Cloud Storage-backed assets with deployment review. |
| Secrets | Secret Manager only; never website-builder scripts or checked-in config. |

Firebase Hosting plus Cloud Run rewrites is the recommended default because it is simple for public/static pages, supports previews, and keeps dynamic behavior in Cloud Run. Cloud Run behind an HTTPS load balancer remains the fallback if a single advanced routing layer becomes necessary.

## DNS Ownership Model

| Component | Preferred long-term owner | Temporary allowed owner |
| --- | --- | --- |
| Domain registration | Drip-controlled registrar account | Squarespace Domains if already registered there. |
| DNS hosting | Cloud DNS or another Drip-controlled DNS host | Squarespace DNS until planned migration. |
| Website hosting | Drip GitHub/GCP stack | Squarespace until replacement pages pass staging. |
| App/API hosting | Drip GitHub/GCP stack | No Squarespace role. |

## Phase 2.2 Public DNS Inventory

This is a read-only public observation captured on July 6, 2026. It is not a substitute for an authoritative DNS zone export.

| Dependency | Public observation | Cutover guardrail |
| --- | --- | --- |
| Registrar | RDAP lists Squarespace Domains LLC. | Drip must confirm registrar account owner, renewal, MFA, and recovery details. |
| Apex host | `driphealthcare.com` resolves to four Squarespace A records. | Do not change until replacement public site and rollback are approved. |
| `www` host | `www.driphealthcare.com` CNAMEs to `ext-sq.squarespace.com`. | Do not change until replacement public site and rollback are approved. |
| Nameservers | Public NS results include NSOne and Squarespace DNS nameservers. | Export authoritative zone and confirm DNS host before cutover. |
| SOA | Public SOA differs by NSOne pool from the observed NS list. | Treat as an export-required discrepancy, not a decision point. |
| Email | Google Workspace MX records are present. | Preserve mail records exactly during any DNS migration. |
| Verification | Google verification TXT records are present. | Preserve exact values from DNS export; values are not repeated in repo docs. |
| Upload host | `upload.driphealthcare.com` resolves publicly and is used by the conference campaign submit page. | Inventory backend owner, storage, auth, and rollback before replacing. |

No DNS changes were made in Phase 2.2.

## DNS Migration Guardrails

No DNS change should happen without:

- Current registrar and nameserver inventory.
- Full DNS record export, including mail and verification records.
- TTL reduction plan.
- Staging validation.
- Rollback target and owner.
- Production approval.
- Post-cutover monitoring checklist.

## Staging And Preview

| Environment | Hostname or URL type | Notes |
| --- | --- | --- |
| PR preview | Firebase preview URL or equivalent | Best for page review before DNS exists. |
| Website staging | `staging.driphealthcare.com` | Public site staging with no production intake writes. |
| App staging | `staging-app.driphealthcare.com` | Authenticated app shell with test data only. |
| Admin staging | `staging-admin.driphealthcare.com` | Admin dashboard staging after auth exists. |
| API staging | `staging-api.driphealthcare.com` | Test APIs and test credentials only. |
| Redirect staging | `staging-go.driphealthcare.com` | QR/redirect testing without production campaigns. |

## Cutover Order

1. Build and review public marketing pages in the Drip repo.
2. Stage public pages and non-production forms.
3. Cut over `www` or a low-risk preview host first if approved.
4. Cut over `driphealthcare.com` only after rollback is ready.
5. Cut over `showcase` pages separately.
6. Cut over `go` redirects only after redirect parity and event logging tests pass.
7. Add `admin`, `app`, and `api` production hostnames only after auth, RBAC, and production approvals exist.

## Rollback

Keep the previous Squarespace site or previous hosting target available until acceptance passes. Rollback should be a DNS-target reversal for public pages, a route-target reversal for redirects, and a feature-flag or no-cutover posture for app/API surfaces.

## Non-Goals For Phase 2.1

- No DNS updates.
- No Squarespace updates.
- No deployment.
- No production hosting resources.
- No live credentials.
- No Phase 3 dataset ingestion.
- No production app/API activation.

## Non-Goals For Phase 2.2

- No DNS updates.
- No Squarespace updates.
- No website/page/form/redirect edits.
- No Apps Script edits or trigger changes.
- No deploys or production resources.
- No live credentials.
- No Phase 3 dataset ingestion.
