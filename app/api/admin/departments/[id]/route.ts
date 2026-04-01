import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function PATCH(
  request: NextRequest,
  segmentData: { params: Params }
) {
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

  const { id } = await segmentData.params;
  const body = await request.json();
  const { name, managerId } = body;

  const department = await prisma.department.update({
    where: { id },
    data: {
      ...(name && { name }),
      ...(managerId !== undefined && { managerId: managerId || null }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DEPARTMENT_UPDATED",
      target: `Department: ${department.name}`,
      metadata: JSON.stringify(body),
    },
  });

  return NextResponse.json(department);
}

export async function DELETE(
  _request: NextRequest,
  segmentData: { params: Params }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (session.user.role !== "SUPER_ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await segmentData.params;

  // Check if department has members
  const dept = await prisma.department.findUnique({
    where: { id },
    include: { _count: { select: { members: true } } },
  });

  if (dept && dept._count.members > 0) {
    return NextResponse.json(
      { error: "Δεν μπορείτε να διαγράψετε τμήμα με μέλη" },
      { status: 400 }
    );
  }

  await prisma.department.delete({ where: { id } });

  return NextResponse.json({ success: true });
}
