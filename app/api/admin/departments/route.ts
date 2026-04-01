import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const departments = await prisma.department.findMany({
    include: {
      manager: { select: { id: true, name: true, email: true } },
      _count: { select: { members: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(departments);
}

export async function POST(request: NextRequest) {
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
  const { name, managerId } = body;

  const department = await prisma.department.create({
    data: { name, managerId: managerId || null },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "DEPARTMENT_CREATED",
      target: `Department: ${name}`,
    },
  });

  return NextResponse.json(department, { status: 201 });
}
