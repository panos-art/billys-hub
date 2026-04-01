import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

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

  const announcement = await prisma.announcement.findUnique({
    where: { id },
    include: {
      author: { select: { name: true, image: true } },
    },
  });

  if (!announcement) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Mark as read
  await prisma.announcementRead.upsert({
    where: {
      announcementId_userId: {
        announcementId: id,
        userId: session.user.id,
      },
    },
    update: { readAt: new Date() },
    create: {
      announcementId: id,
      userId: session.user.id,
    },
  });

  return NextResponse.json(announcement);
}
