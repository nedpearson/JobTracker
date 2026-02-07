import { auditLogger } from "./logger";
import {
  validateApplication,
  validateJob,
  validateUser,
  validateStageTransition,
  checkRequiredFields,
  sanitizeForDatabase
} from "./validator";
import type { ApplicationStage } from "@prisma/client";

export interface AuditResult {
  passed: boolean;
  warnings: string[];
  errors: string[];
}

export function auditApplicationData(data: unknown): AuditResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const validation = validateApplication(data);
  if (!validation.valid) {
    errors.push(...validation.errors);
    auditLogger.error("Application validation failed", { errors: validation.errors });
    return { passed: false, warnings, errors };
  }

  auditLogger.info("Application data validated successfully", {
    applicationId: validation.data?.id
  });

  return { passed: true, warnings, errors };
}

export function auditJobData(data: unknown): AuditResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const validation = validateJob(data);
  if (!validation.valid) {
    errors.push(...validation.errors);
    auditLogger.error("Job validation failed", { errors: validation.errors });
    return { passed: false, warnings, errors };
  }

  if (validation.data?.matchScore !== null && validation.data?.matchScore !== undefined) {
    if (validation.data.matchScore < 0 || validation.data.matchScore > 100) {
      warnings.push(`Match score ${validation.data.matchScore} is out of valid range (0-100)`);
    }
  }

  auditLogger.info("Job data validated successfully", { jobId: validation.data?.id });

  return { passed: true, warnings, errors };
}

export function auditUserData(data: unknown): AuditResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const validation = validateUser(data);
  if (!validation.valid) {
    errors.push(...validation.errors);
    auditLogger.error("User validation failed", { errors: validation.errors });
    return { passed: false, warnings, errors };
  }

  auditLogger.info("User data validated successfully", { userId: validation.data?.id });

  return { passed: true, warnings, errors };
}

export function auditApplicationStageChange(
  applicationId: string,
  fromStage: ApplicationStage,
  toStage: ApplicationStage
): AuditResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  const transition = validateStageTransition(fromStage, toStage);
  if (!transition.valid) {
    errors.push(`Invalid stage transition from ${fromStage} to ${toStage}`);
    auditLogger.error("Invalid stage transition", { applicationId, fromStage, toStage });
    return { passed: false, warnings, errors };
  }

  if (transition.warning) {
    warnings.push(transition.warning);
    auditLogger.warn("Stage transition warning", {
      applicationId,
      fromStage,
      toStage,
      warning: transition.warning
    });
  }

  auditLogger.info("Stage transition validated", {
    applicationId,
    fromStage,
    toStage
  });

  return { passed: true, warnings, errors };
}

export function auditApiResponse(
  endpoint: string,
  response: unknown
): AuditResult {
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!response || typeof response !== "object") {
    errors.push("API response is not a valid object");
    auditLogger.error("Invalid API response format", { endpoint });
    return { passed: false, warnings, errors };
  }

  const responseObj = response as Record<string, unknown>;

  if (responseObj.error && typeof responseObj.error === "string") {
    auditLogger.info("API returned error response", {
      endpoint,
      error: responseObj.error
    });
  }

  if (responseObj.ok === true) {
    auditLogger.info("API response successful", { endpoint });
  }

  return { passed: true, warnings, errors };
}

export {
  auditLogger,
  validateApplication,
  validateJob,
  validateUser,
  validateStageTransition,
  checkRequiredFields,
  sanitizeForDatabase
};
