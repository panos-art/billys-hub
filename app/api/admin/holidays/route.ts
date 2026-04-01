import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
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

  const { searchParams } = request.nextUrl;
  const year = searchParams.get("year")
    ? parseInt(searchParams.get("year")!)
    : new Date().getFullYear();

  const holidays = await prisma.publicHoliday.findMany({
    where: { year },
    orderBy: { date: "asc" },
  });

  return NextResponse.json(holidays);
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
  const { name, date, isRecurring } = body;

  const dateObj = new Date(date);

  const holiday = await prisma.publicHoliday.create({
    data: {
      name,
      date: dateObj,
      year: dateObj.getFullYear(),
      isRecurring: isRecurring ?? false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "HOLIDAY_CREATED",
      target: `Holiday: ${name}`,
    },
  });

  return NextResponse.json(holiday, { status: 201 });
}
