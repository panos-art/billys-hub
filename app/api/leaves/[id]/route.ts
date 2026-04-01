import { NextRequest, NextResponse } from "next/server";
import { auth, canManageLeaves } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendLeaveApprovedEmail, sendLeaveRejectedEmail } from "@/lib/email";
import { formatDateGr } from "@/lib/utils";

type Params = Promise<{ id: string }>;

export async function GET(
  _request: NextRequest,
  segmentData: { params: Params }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await segmentData.params;

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          email: true,
          departmentId: true,
          department: { select: { name: true } },
        },
      },
      leaveType: true,
      approvedBy: { select: { name: true } },
    },
  });

  if (!leave) {
    return NextResponse.json(
      { error: "Δεν βρέθηκε το αίτημα" },
      { status: 404 }
    );
  }

  // Check permissions
  if (
    session.user.role === "EMPLOYEE" &&
    leave.userId !== session.user.id
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return NextResponse.json(leave);
}

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await segmentData.params;
  const body = await request.json();
  const { status, comment } = body;

  if (!status || !["APPROVED", "REJECTED"].includes(status)) {
    return NextResponse.json(
      { error: "Μη έγκυρη ενέργεια" },
      { status: 400 }
    );
  }

  const leave = await prisma.leaveRequest.findUnique({
    where: { id },
    include: {
      user: {
        select: { name: true, email: true, departmentId: true },
      },
      leaveType: true,
    },
  });

  if (!leave) {
    return NextResponse.json(
      { error: "Δεν βρέθηκε το αίτημα" },
      { status: 404 }
    );
  }

  if (leave.status !== "PENDING") {
    return NextResponse.json(
      { error: "Το αίτημα έχει ήδη διεκπεραιωθεί" },
      { status: 400 }
    );
  }

  // Check permissions
  if (
    !canManageLeaves(
      session.user.role,
      session.user.departmentId,
      leave.user.departmentId
    )
  ) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Update leave request
  const updated = await prisma.leaveRequest.update({
    where: { id },
    data: {
      status,
      approvedById: session.user.id,
      approverComment: comment || null,
    },
  });

  // If approved, deduct balance
  if (status === "APPROVED") {
    const year = new Date(leave.startDate).getFullYear();
    await prisma.leaveBalance.updateMany({
      where: {
        userId: leave.userId,
        leaveTypeId: leave.leaveTypeId,
        year,
      },
      data: {
        usedDays: { increment: leave.workingDays },
      },
    });

    await sendLeaveApprovedEmail(
      leave.user.email,
      leave.leaveType.name,
      formatDateGr(leave.startDate),
      formatDateGr(leave.endDate),
      session.user.name || "Διευθυντής"
    );
  } else {
    await sendLeaveRejectedEmail(
      leave.user.email,
      leave.leaveType.name,
      formatDateGr(leave.startDate),
      formatDateGr(leave.endDate),
      session.user.name || "Διευθυντής",
      comment
    );
  }

  // Audit log
  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: `LEAVE_${status}`,
      target: `Leave #${id} for ${leave.user.name}`,
      metadata: JSON.stringify({ comment }),
    },
  });

  return NextResponse.json(updated);
}
