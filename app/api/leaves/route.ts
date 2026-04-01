import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendLeaveRequestEmail } from "@/lib/email";
import { formatDateGr } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status");
  const userId = searchParams.get("userId");

  const where: Record<string, unknown> = {};

  // Employees can only see their own leaves
  if (session.user.role === "EMPLOYEE") {
    where.userId = session.user.id;
  } else if (userId) {
    where.userId = userId;
  }

  // Managers can only see their department's leaves
  if (session.user.role === "MANAGER") {
    where.user = { departmentId: session.user.departmentId };
  }

  if (status) {
    where.status = status;
  }

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: {
      user: {
        select: { name: true, image: true, email: true, department: { select: { name: true } } },
      },
      leaveType: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(leaves);
}

export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { leaveTypeId, startDate, endDate, workingDays, note } = body;

  if (!leaveTypeId || !startDate || !endDate || !workingDays) {
    return NextResponse.json(
      { error: "Λείπουν υποχρεωτικά πεδία" },
      { status: 400 }
    );
  }

  // Check balance
  const currentYear = new Date(startDate).getFullYear();
  const balance = await prisma.leaveBalance.findUnique({
    where: {
      userId_leaveTypeId_year: {
        userId: session.user.id,
        leaveTypeId,
        year: currentYear,
      },
    },
  });

  if (balance) {
    const remaining = balance.totalDays - balance.usedDays;
    if (workingDays > remaining) {
      return NextResponse.json(
        { error: `Ανεπαρκές υπόλοιπο. Διαθέσιμες: ${remaining} ημέρες.` },
        { status: 400 }
      );
    }
  }

  // Create leave request
  const leaveRequest = await prisma.leaveRequest.create({
    data: {
      userId: session.user.id,
      leaveTypeId,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      workingDays,
      note,
      status: "PENDING",
    },
    include: {
      leaveType: true,
      user: { select: { name: true, department: { select: { managerId: true } } } },
    },
  });

  // Send email to manager
  if (leaveRequest.user.department?.managerId) {
    const manager = await prisma.user.findUnique({
      where: { id: leaveRequest.user.department.managerId },
      select: { email: true },
    });
    if (manager) {
      await sendLeaveRequestEmail(
        manager.email,
        leaveRequest.user.name || "Υπάλληλος",
        leaveRequest.leaveType.name,
        formatDateGr(leaveRequest.startDate),
        formatDateGr(leaveRequest.endDate),
        leaveRequest.workingDays
      );
    }
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "LEAVE_REQUEST_CREATED",
      target: `Leave #${leaveRequest.id}`,
      metadata: JSON.stringify({
        leaveType: leaveRequest.leaveType.name,
        startDate,
        endDate,
        workingDays,
      }),
    },
  });

  return NextResponse.json(leaveRequest, { status: 201 });
}
