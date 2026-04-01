import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatRelativeGr } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, BookOpen, Star, Search } from "lucide-react";
import { differenceInDays } from "date-fns";
import { KnowledgeSearch } from "@/components/knowledge/knowledge-search";

export default async function KnowledgePage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";

  const [categories, featuredArticles] = await Promise.all([
    prisma.knowledgeCategory.findMany({
      orderBy: { order: "asc" },
      include: {
        articles: {
          where: isAdmin ? {} : { published: true },
          include: { author: { select: { name: true } } },
          orderBy: { updatedAt: "desc" },
        },
      },
    }),
    prisma.knowledgeArticle.findMany({
      where: { featured: true, published: true },
      include: {
        category: { select: { name: true } },
        author: { select: { name: true } },
      },
      take: 5,
    }),
  ]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Γνωσιακή Βάση</h1>
          <p className="text-sm text-gray-500 mt-1">
            Άρθρα, οδηγοί και πολιτικές της εταιρείας
          </p>
        </div>
        {isAdmin && (
          <Link href="/knowledge/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Νέο Άρθρο
            </Button>
          </Link>
        )}
      </div>

      <KnowledgeSearch />

      {/* Featured Articles */}
      {featuredArticles.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Star className="h-5 w-5 text-amber-500" />
            Προτεινόμενα
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {featuredArticles.map((article) => (
              <Link key={article.id} href={`/knowledge/${article.slug}`}>
                <Card className="hover:shadow-md transition-shadow h-full">
                  <CardContent className="p-4">
                    <Badge variant="info" className="mb-2">
                      {article.category.name}
                    </Badge>
                    <h3 className="font-semibold text-sm mb-1">
                      {article.title}
                    </h3>
                    <p className="text-xs text-gray-400">
                      {article.author.name} &middot;{" "}
                      Ενημερώθηκε {formatRelativeGr(article.updatedAt)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      {categories.map((category) => (
        <div key={category.id}>
          <h2 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#1C4E89]" />
            {category.name}
          </h2>
          {category.articles.length === 0 ? (
            <p className="text-sm text-gray-400">
              Δεν υπάρχουν άρθρα σε αυτή την κατηγορία
            </p>
          ) : (
            <div className="space-y-2">
              {category.articles.map((article) => {
                const isNew =
                  differenceInDays(new Date(), new Date(article.createdAt)) <
                  14;
                return (
                  <Link key={article.id} href={`/knowledge/${article.slug}`}>
                    <Card className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium text-sm truncate">
                              {article.title}
                            </h3>
                            {isNew && (
                              <Badge variant="info" className="text-[10px]">
                                ΝΕΟ
                              </Badge>
                            )}
                            {!article.published && (
                              <Badge
                                variant="secondary"
                                className="text-[10px]"
                              >
                                Πρόχειρο
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {article.author.name} &middot;{" "}
                            Ενημερώθηκε {formatRelativeGr(article.updatedAt)}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
