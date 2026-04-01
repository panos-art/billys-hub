import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ id: string }>;

export async function GET(
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
  const { searchParams } = request.nextUrl;
  const year = searchParams.get("year")
    ? parseInt(searchParams.get("year")!)
    : new Date().getFullYear();

  const [leaveTypes, balances] = await Promise.all([
    prisma.leaveType.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.leaveBalance.findMany({
      where: { userId: id, year },
    }),
  ]);

  const balanceMap = new Map(
    balances.map((b) => [b.leaveTypeId, b])
  );

  const merged = leaveTypes.map((lt) => {
    const balance = balanceMap.get(lt.id);
    return {
      leaveTypeId: lt.id,
      leaveTypeName: lt.name,
      defaultDays: lt.defaultDays,
      totalDays: balance?.totalDays ?? 0,
      usedDays: balance?.usedDays ?? 0,
      remaining: (balance?.totalDays ?? 0) - (balance?.usedDays ?? 0),
    };
  });

  return NextResponse.json(merged);
}
