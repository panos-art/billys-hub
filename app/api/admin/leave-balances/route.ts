import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.role !== "HR_ADMIN"
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await request.json();
  const { userId, leaveTypeId, year, totalDays, reason } = body;

  if (!userId || !leaveTypeId || !year || totalDays === undefined || !reason) {
    return NextResponse.json(
      { error: "Λείπουν υποχρεωτικά πεδία" },
      { status: 400 }
    );
  }

  const balance = await prisma.leaveBalance.upsert({
    where: {
      userId_leaveTypeId_year: { userId, leaveTypeId, year },
    },
    update: { totalDays },
    create: { userId, leaveTypeId, year, totalDays, usedDays: 0 },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "LEAVE_BALANCE_ADJUSTED",
      target: `Balance for user ${userId}, type ${leaveTypeId}, year ${year}`,
      metadata: JSON.stringify({ totalDays, reason }),
    },
  });

  return NextResponse.json(balance);
}
