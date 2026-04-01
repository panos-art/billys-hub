import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { formatRelativeGr, formatDateGr } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft, Edit, ChevronRight } from "lucide-react";

type Params = Promise<{ slug: string }>;

export default async function ArticlePage({ params }: { params: Params }) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { slug } = await params;
  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";

  const article = await prisma.knowledgeArticle.findUnique({
    where: { slug },
    include: {
      category: true,
      author: { select: { name: true, image: true } },
    },
  });

  if (!article || (!article.published && !isAdmin)) {
    notFound();
  }

  // Extract headings for table of contents
  const headingRegex = /<h([23])[^>]*>(.*?)<\/h[23]>/gi;
  const headings: { level: number; text: string; id: string }[] = [];
  let match;
  while ((match = headingRegex.exec(article.content)) !== null) {
    const text = match[2].replace(/<[^>]*>/g, "");
    headings.push({
      level: parseInt(match[1]),
      text,
      id: text.toLowerCase().replace(/\s+/g, "-"),
    });
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Link href="/knowledge" className="hover:text-[#00B1C9]">
          Γνωσιακή Βάση
        </Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/knowledge" className="hover:text-[#00B1C9]">
          {article.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-700 truncate">{article.title}</span>
      </div>

      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {article.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
            {article.author.image && (
              <img
                src={article.author.image}
                alt=""
                className="w-6 h-6 rounded-full"
              />
            )}
            <span>{article.author.name}</span>
            <span>&middot;</span>
            <span>Ενημερώθηκε {formatRelativeGr(article.updatedAt)}</span>
            {!article.published && (
              <Badge variant="secondary">Πρόχειρο</Badge>
            )}
          </div>
        </div>
        {isAdmin && (
          <Link href={`/knowledge/new?edit=${article.slug}`}>
            <Button variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-1" />
              Επεξεργασία
            </Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents */}
        {headings.length > 0 && (
          <Card className="lg:col-span-1 h-fit lg:sticky lg:top-4">
            <CardContent className="p-4">
              <h3 className="text-xs font-semibold text-gray-500 uppercase mb-3">
                Περιεχόμενα
              </h3>
              <nav className="space-y-1">
                {headings.map((h, i) => (
                  <a
                    key={i}
                    href={`#${h.id}`}
                    className={`block text-sm hover:text-[#00B1C9] transition-colors ${
                      h.level === 3 ? "pl-3 text-gray-400" : "text-gray-600"
                    }`}
                  >
                    {h.text}
                  </a>
                ))}
              </nav>
            </CardContent>
          </Card>
        )}

        {/* Article Content */}
        <Card className={headings.length > 0 ? "lg:col-span-3" : "lg:col-span-4"}>
          <CardContent className="p-6 lg:p-8">
            <div
              className="article-content prose prose-sm max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
