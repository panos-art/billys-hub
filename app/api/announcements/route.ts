import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
    include: {
      author: { select: { name: true, image: true } },
      reads: {
        where: { userId: session.user.id },
        select: { id: true },
      },
    },
  });

  return NextResponse.json(announcements);
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
  const { title, body: announcementBody, isPinned } = body;

  const announcement = await prisma.announcement.create({
    data: {
      title,
      body: announcementBody,
      isPinned: isPinned ?? false,
      authorId: session.user.id,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ANNOUNCEMENT_CREATED",
      target: `Announcement: ${title}`,
    },
  });

  return NextResponse.json(announcement, { status: 201 });
}
