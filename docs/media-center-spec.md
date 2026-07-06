# Media Center Specification

## Purpose

The Media Center is the provider-facing hub for healthcare provider organizations. It replaces user-facing legacy marketplace/control center terminology.

## Provider Signup Rule

Provider signup creates the provider organization only. It does not create display approvals.

Provider display approval is created only when the provider checks a vendor/employer display preference checkbox in the Media Center.

## Core Workflows

| Workflow | Requirements |
| --- | --- |
| Provider onboarding | Create provider organization, facilities, users, and Media Center status. |
| Display preferences | Provider can approve or revoke advertiser display eligibility. |
| Provider-facing campaigns | Provider can view eligible Media Center Campaigns. |
| Screen/location management | Provider can view facilities/screens where Drip is configured. |
| Reporting | Provider can see relevant display activity and revenue/share status where allowed. |
| Support | Provider can submit issues or display preference changes. |

## Display Approval Model

| Field | Requirement |
| --- | --- |
| providerId | Required. |
| advertiserId | Required. |
| displayApproved | Required boolean. |
| source | Media Center checkbox/action source. |
| approvedAt | Set when displayApproved becomes true. |
| revokedAt | Set when displayApproved becomes false. |
| updatedBy | Provider admin user ID. |

## Campaign Eligibility

A Patient Campaign can be considered for provider display only if:

1. Campaign safetyStatus is APPROVED.
2. Campaign dates are valid.
3. Billing readiness rules pass.
4. Provider display approval exists for providerId + advertiserId.
5. Placement rules and screen inventory allow display.

## Acceptance Criteria

| Area | Criteria |
| --- | --- |
| Signup | Provider signup creates no display approvals. |
| Preference action | Checking an advertiser preference creates or updates displayApprovals. |
| Revocation | Revoking preference prevents new eligible placements after sync. |
| Terminology | User-facing UI uses Media Center. |
| Auditability | Approval and revocation actions write audit logs. |
