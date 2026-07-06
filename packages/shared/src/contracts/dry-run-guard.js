import { ExternalWriteSystem, enumValues } from "../status/index.js";

const WRITE_SYSTEMS = enumValues(ExternalWriteSystem);

// Phase 1 contract only: live IAM, approval owners, and Secret Manager migration are unresolved.
export class ExternalWriteBlockedError extends Error {
  constructor(message, details = {}) {
    super(message);
    this.name = "ExternalWriteBlockedError";
    this.details = details;
  }
}

export function evaluateExternalWrite(options = {}) {
  const {
    operation = "unknown",
    targetSystem,
    dryRun,
    approvalId,
    environment = "LOCAL"
  } = options;

  if (!WRITE_SYSTEMS.includes(targetSystem)) {
    return {
      allowed: false,
      dryRun: true,
      reason: "UNKNOWN_EXTERNAL_WRITE_SYSTEM",
      operation,
      targetSystem
    };
  }

  if (dryRun !== false) {
    return {
      allowed: false,
      dryRun: true,
      reason: "DRY_RUN_REQUIRED_BY_DEFAULT",
      operation,
      targetSystem
    };
  }

  if (!approvalId) {
    return {
      allowed: false,
      dryRun: false,
      reason: "APPROVAL_REQUIRED_FOR_EXTERNAL_WRITE",
      operation,
      targetSystem
    };
  }

  return {
    allowed: true,
    dryRun: false,
    reason: "EXPLICIT_WRITE_APPROVED",
    operation,
    targetSystem,
    approvalId,
    environment
  };
}

export function assertExternalWriteAllowed(options = {}) {
  const decision = evaluateExternalWrite(options);
  if (!decision.allowed) {
    throw new ExternalWriteBlockedError(
      `${decision.operation} blocked: ${decision.reason}`,
      decision
    );
  }
  return decision;
}

export function dryRunResult(operation, targetSystem, preview = {}) {
  return Object.freeze({
    operation,
    targetSystem,
    dryRun: true,
    wouldWrite: true,
    preview
  });
}
