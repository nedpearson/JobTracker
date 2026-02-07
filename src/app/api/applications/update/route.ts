import { NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/db";
import { addBusinessDays } from "@/lib/date";
import { auditLogger, sanitizeForDatabase, auditApplicationStageChange } from "@/lib/audit";

export const runtime = "nodejs";

const schema = z.object({
  applicationId: z.string().min(1),
  stage: z
    .enum(["INTERESTED", "APPLIED", "RECRUITER_SCREEN", "INTERVIEW", "OFFER", "CLOSED"])
    .optional(),
  nextFollowUpAt: z.string().nullable().optional(),
  appliedAt: z.string().nullable().optional(),
  autoFollowUpBusinessDays: z.number().int().min(1).max(30).optional()
});

export async function POST(req: Request) {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) {
    auditLogger.warn("Unauthorized application update attempt");
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    auditLogger.error("Invalid update request", { userId, errors: parsed.error.errors });
    return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  }

  const { applicationId, stage, nextFollowUpAt, appliedAt, autoFollowUpBusinessDays } = parsed.data;

  const existing = await prisma.application.findFirst({
    where: { id: applicationId, userId },
    select: { id: true, stage: true }
  });
  if (!existing) {
    auditLogger.error("Application not found", { userId, applicationId });
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (stage && stage !== existing.stage) {
    const auditResult = auditApplicationStageChange(applicationId, existing.stage, stage);
    if (!auditResult.passed) {
      auditLogger.error("Invalid stage transition", {
        userId,
        applicationId,
        fromStage: existing.stage,
        toStage: stage,
        errors: auditResult.errors
      });
      return NextResponse.json({ error: auditResult.errors.join(", ") }, { status: 400 });
    }
    if (auditResult.warnings.length > 0) {
      auditLogger.warn("Stage transition warning", {
        userId,
        applicationId,
        warnings: auditResult.warnings
      });
    }
  }

  const data: any = {};
  if (stage) data.stage = stage;
  if (nextFollowUpAt !== undefined) {
    data.nextFollowUpAt = nextFollowUpAt ? new Date(`${nextFollowUpAt}T09:00:00`) : null;
  }
  if (appliedAt !== undefined) {
    data.appliedAt = appliedAt ? new Date(appliedAt) : null;
  }
  if (autoFollowUpBusinessDays !== undefined) {
    data.nextFollowUpAt = addBusinessDays(new Date(), autoFollowUpBusinessDays);
  }

  const sanitized = sanitizeForDatabase(data);
  const updated = await prisma.application.update({
    where: { id: applicationId },
    data: sanitized,
    select: { id: true, stage: true, nextFollowUpAt: true, appliedAt: true }
  });

  auditLogger.info("Application updated successfully", {
    userId,
    applicationId: updated.id,
    stage: updated.stage
  });

  return NextResponse.json({
    ok: true,
    applicationId: updated.id,
    stage: updated.stage,
    nextFollowUpAt: updated.nextFollowUpAt?.toISOString() ?? null,
    appliedAt: updated.appliedAt?.toISOString() ?? null
  });
}
