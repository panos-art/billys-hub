import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

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
  const { role, departmentId, isActive } = body;

  // HR_ADMIN cannot assign SUPER_ADMIN role
  if (session.user.role === "HR_ADMIN" && role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Δεν έχετε δικαίωμα ανάθεσης αυτού του ρόλου" },
      { status: 403 }
    );
  }

  const updateData: Record<string, unknown> = {};
  if (role !== undefined) updateData.role = role as Role;
  if (departmentId !== undefined) updateData.departmentId = departmentId;
  if (isActive !== undefined) updateData.isActive = isActive;

  const user = await prisma.user.update({
    where: { id },
    data: updateData,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      department: { select: { name: true } },
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "USER_UPDATED",
      target: `User: ${user.name} (${user.email})`,
      metadata: JSON.stringify(body),
    },
  });

  return NextResponse.json(user);
}
