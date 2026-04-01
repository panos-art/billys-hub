import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  if (!start || !end) {
    return NextResponse.json({ error: "Missing dates" }, { status: 400 });
  }

  const leaves = await prisma.leaveRequest.findMany({
    where: {
      status: { in: ["APPROVED", "PENDING"] },
      startDate: { lte: new Date(end) },
      endDate: { gte: new Date(start) },
    },
    include: {
      user: {
        select: {
          name: true,
          image: true,
          department: { select: { name: true, id: true } },
        },
      },
      leaveType: { select: { name: true } },
    },
    orderBy: { startDate: "asc" },
  });

  return NextResponse.json(leaves);
}
