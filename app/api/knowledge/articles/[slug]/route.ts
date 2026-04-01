import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Params = Promise<{ slug: string }>;

export async function GET(
  _request: NextRequest,
  segmentData: { params: Params }
) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { slug } = await segmentData.params;

  const article = await prisma.knowledgeArticle.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { name: true, image: true } },
    },
  });

  if (!article) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";

  if (!article.published && !isAdmin) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(article);
}

export async function PUT(
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

  const { slug } = await segmentData.params;
  const body = await request.json();
  const { title, content, categoryId, published, featured } = body;

  const article = await prisma.knowledgeArticle.update({
    where: { slug },
    data: {
      ...(title && { title }),
      ...(content !== undefined && { content }),
      ...(categoryId && { categoryId }),
      ...(published !== undefined && { published }),
      ...(featured !== undefined && { featured }),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ARTICLE_UPDATED",
      target: `Article: ${article.title}`,
    },
  });

  return NextResponse.json(article);
}

export async function DELETE(
  _request: NextRequest,
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

  const { slug } = await segmentData.params;

  await prisma.knowledgeArticle.delete({ where: { slug } });

  return NextResponse.json({ success: true });
}
