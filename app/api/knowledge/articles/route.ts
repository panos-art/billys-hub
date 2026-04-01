import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = request.nextUrl;
  const categoryId = searchParams.get("categoryId");
  const search = searchParams.get("search");
  const featured = searchParams.get("featured");

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";

  const where: Record<string, unknown> = {};
  if (!isAdmin) {
    where.published = true;
  }
  if (categoryId) {
    where.categoryId = categoryId;
  }
  if (featured === "true") {
    where.featured = true;
  }
  if (search) {
    where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { content: { contains: search, mode: "insensitive" } },
    ];
  }

  const articles = await prisma.knowledgeArticle.findMany({
    where,
    include: {
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
    },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  return NextResponse.json(articles);
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
  const { title, content, categoryId, published, featured } = body;

  const slug = slugify(title) + "-" + Date.now().toString(36);

  const article = await prisma.knowledgeArticle.create({
    data: {
      title,
      slug,
      content,
      categoryId,
      authorId: session.user.id,
      published: published ?? false,
      featured: featured ?? false,
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "ARTICLE_CREATED",
      target: `Article: ${title}`,
    },
  });

  return NextResponse.json(article, { status: 201 });
}
