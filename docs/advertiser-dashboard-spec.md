# Advertiser Dashboard Specification

## Purpose

The Advertiser Dashboard lets healthcare vendors and non-healthcare employers submit campaigns, receive market intelligence recommendations, track performance, and understand budget/billing status.

## Core Workflows

| Workflow | Requirements |
| --- | --- |
| Account onboarding | Advertiser organization profile, contacts, eligibility status, billing profile, RBAC users. |
| Campaign creation | Support Patient, Media Center, and Conference campaigns. |
| Creative submission | Video URL, landing page URL, campaign dates, budget/rate fields, conference package fields where applicable. |
| Safety status visibility | Show DRAFT, SUBMITTED, SAFETY_CHECKING, NEEDS_REVIEW, APPROVED, SCHEDULED, ACTIVE, PAUSED, EXPIRED, BLOCKED, ARCHIVED. |
| Recommendations | Show market opportunity, specialty opportunity, payor opportunity, advertiser fit, suggested markets/specialties/budget, reasoning, freshness warnings. |
| Reporting | QR scans, screen engagement, showcase views, CTA clicks, Media Center engagement, pacing summaries. |
| Billing visibility | Budget, pacing, previews, billing status, approved invoices/charges, rollback notes where relevant. |

## Campaign Submission Fields

| Field | Patient | Media Center | Conference |
| --- | --- | --- | --- |
| campaignName | Required | Required | Required |
| advertiserId | Required | Required | Required |
| campaignStartDate/endDate | Required | Required | Required |
| videoUrl | Required for screen creative | Optional | Required for screen placement if used |
| landingPageUrl | Required | Optional | Optional/CTA URL |
| targetMarkets | Required | Required | Required |
| targetSpecialties | Optional | Required | Optional |
| budget/budgetRange | Required | Required | Required or package price |
| rateType/rateAmount/pricingTier | Required when known | Required when known | Package/sponsorship supported |
| dynamicPricingInputs | Optional | Optional | Optional |

## Market Intelligence Recommendations

| Output | Display guidance |
| --- | --- |
| Market opportunity score | Show with supporting reason and data freshness. |
| Specialty opportunity score | Tie to selected provider specialties and available inventory. |
| Payor opportunity score | Tie to payor datasets and market context. |
| Advertiser fit score | Explain why Drip recommends campaign type/market/specialty. |
| Suggested budget range | Never hard-code $1 per click as the future model. |
| Data freshness warnings | Make stale or missing source data clear before action. |

## Safety Guardrails

Advertisers can submit and edit drafts, but cannot force activation. The dashboard should show why a campaign is blocked and what is needed, without exposing internal-only security details.

## Acceptance Criteria

| Area | Criteria |
| --- | --- |
| Submission | Campaign records are created in Firestore with required fields and DRAFT/SUBMITTED state. |
| Safety | Submitted campaigns enter safety checks and require approval before scheduling/activation. |
| Recommendations | Advertisers can see recommendations with reasoning and freshness warnings. |
| Billing | Billing previews are visible but production billing remains approval-gated. |
| Reporting | Performance metrics reconcile with QR, playback, and engagement event sources. |
