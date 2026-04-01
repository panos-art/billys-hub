import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import type { Role } from "@/app/generated/prisma/client";

const VALID_ROLES: Role[] = ["SUPER_ADMIN", "HR_ADMIN", "MANAGER", "EMPLOYEE"];

export async function GET() {
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

  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
      role: true,
      isActive: true,
      createdAt: true,
      jobTitle: true,
      department: { select: { id: true, name: true } },
    },
    orderBy: { name: "asc" },
  });

  return NextResponse.json(users);
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
  const { name, email, role, departmentId } = body;

  if (!name || !email) {
    return NextResponse.json(
      { error: "Το όνομα και το email είναι υποχρεωτικά" },
      { status: 400 }
    );
  }

  if (!email.endsWith("@billys.gr")) {
    return NextResponse.json(
      { error: "Μόνο λογαριασμοί @billys.gr επιτρέπονται" },
      { status: 400 }
    );
  }

  if (role && !VALID_ROLES.includes(role)) {
    return NextResponse.json(
      { error: "Μη έγκυρος ρόλος" },
      { status: 400 }
    );
  }

  if (session.user.role === "HR_ADMIN" && role === "SUPER_ADMIN") {
    return NextResponse.json(
      { error: "Δεν έχετε δικαίωμα ανάθεσης αυτού του ρόλου" },
      { status: 403 }
    );
  }

  // Check uniqueness
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json(
      { error: "Αυτό το email υπάρχει ήδη" },
      { status: 409 }
    );
  }

  const currentYear = new Date().getFullYear();

  // Create user + seed leave balances in a transaction
  const activeLeaveTypes = await prisma.leaveType.findMany({
    where: { isActive: true },
  });

  const user = await prisma.user.create({
    data: {
      name,
      email,
      role: (role as Role) || "EMPLOYEE",
      departmentId: departmentId || null,
      isActive: true,
    },
  });

  // Create leave balances for all active leave types
  if (activeLeaveTypes.length > 0) {
    await prisma.leaveBalance.createMany({
      data: activeLeaveTypes.map((lt) => ({
        userId: user.id,
        leaveTypeId: lt.id,
        year: currentYear,
        totalDays: lt.defaultDays,
        usedDays: 0,
      })),
    });
  }

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "USER_CREATED",
      target: `User: ${name} (${email})`,
      metadata: JSON.stringify({ role, departmentId }),
    },
  });

  return NextResponse.json(user, { status: 201 });
}
