import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
