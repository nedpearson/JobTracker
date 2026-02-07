import { z } from "zod";
import type { ApplicationStage, WorkMode } from "@prisma/client";

const VALID_STAGES: ApplicationStage[] = [
  "INTERESTED",
  "APPLIED",
  "RECRUITER_SCREEN",
  "INTERVIEW",
  "OFFER",
  "CLOSED"
];

const VALID_WORK_MODES: WorkMode[] = ["ONSITE", "REMOTE", "HYBRID"];

export const applicationSchema = z.object({
  id: z.string().min(1, "Application ID is required"),
  userId: z.string().min(1, "User ID is required"),
  jobId: z.string().min(1, "Job ID is required"),
  stage: z.enum([
    "INTERESTED",
    "APPLIED",
    "RECRUITER_SCREEN",
    "INTERVIEW",
    "OFFER",
    "CLOSED"
  ]),
  appliedAt: z.date().nullable().optional(),
  nextFollowUpAt: z.date().nullable().optional(),
  contactName: z.string().nullable().optional(),
  contactEmail: z.string().email().nullable().optional(),
  notes: z.string().nullable().optional()
});

export const jobSchema = z.object({
  id: z.string().min(1, "Job ID is required"),
  userId: z.string().min(1, "User ID is required"),
  title: z.string().min(1, "Job title is required"),
  companyId: z.string().nullable().optional(),
  location: z.string().nullable().optional(),
  workMode: z.enum(["ONSITE", "REMOTE", "HYBRID"]).nullable().optional(),
  description: z.string().nullable().optional(),
  matchScore: z.number().min(0).max(100).nullable().optional()
});

export const userSchema = z.object({
  id: z.string().min(1, "User ID is required"),
  email: z.string().email("Valid email is required"),
  name: z.string().nullable().optional(),
  passwordHash: z.string().nullable().optional()
});

export function validateApplication(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: z.infer<typeof applicationSchema>;
} {
  try {
    const validated = applicationSchema.parse(data);
    return { valid: true, errors: [], data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
      };
    }
    return { valid: false, errors: ["Unknown validation error"] };
  }
}

export function validateJob(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: z.infer<typeof jobSchema>;
} {
  try {
    const validated = jobSchema.parse(data);
    return { valid: true, errors: [], data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
      };
    }
    return { valid: false, errors: ["Unknown validation error"] };
  }
}

export function validateUser(data: unknown): {
  valid: boolean;
  errors: string[];
  data?: z.infer<typeof userSchema>;
} {
  try {
    const validated = userSchema.parse(data);
    return { valid: true, errors: [], data: validated };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        valid: false,
        errors: error.errors.map((e) => `${e.path.join(".")}: ${e.message}`)
      };
    }
    return { valid: false, errors: ["Unknown validation error"] };
  }
}

export function validateStageTransition(
  from: ApplicationStage,
  to: ApplicationStage
): { valid: boolean; warning?: string } {
  const stageOrder = {
    INTERESTED: 0,
    APPLIED: 1,
    RECRUITER_SCREEN: 2,
    INTERVIEW: 3,
    OFFER: 4,
    CLOSED: 5
  };

  if (!VALID_STAGES.includes(from) || !VALID_STAGES.includes(to)) {
    return { valid: false };
  }

  if (from === "CLOSED" && to !== "CLOSED") {
    return {
      valid: true,
      warning: "Reopening a closed application - this is unusual"
    };
  }

  const fromOrder = stageOrder[from];
  const toOrder = stageOrder[to];

  if (toOrder < fromOrder && to !== "CLOSED") {
    return {
      valid: true,
      warning: `Moving backwards from ${from} to ${to} - this is unusual`
    };
  }

  return { valid: true };
}

export function checkRequiredFields(obj: Record<string, unknown>): {
  valid: boolean;
  missingFields: string[];
} {
  const missing: string[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (
      value === undefined ||
      value === null ||
      (typeof value === "string" && value.trim() === "")
    ) {
      missing.push(key);
    }
  }

  return {
    valid: missing.length === 0,
    missingFields: missing
  };
}

export function sanitizeForDatabase(obj: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (value === undefined) {
      continue;
    }

    if (value === null) {
      sanitized[key] = null;
      continue;
    }

    if (typeof value === "string") {
      sanitized[key] = value.trim();
      continue;
    }

    sanitized[key] = value;
  }

  return sanitized;
}
