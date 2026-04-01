import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatRelativeGr } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Pin } from "lucide-react";

export default async function AnnouncementsPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";

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

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ανακοινώσεις</h1>
          <p className="text-sm text-gray-500 mt-1">
            Ενημέρωσε τον εαυτό σου με τα τελευταία νέα
          </p>
        </div>
        {isAdmin && (
          <Link href="/announcements/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Νέα Ανακοίνωση
            </Button>
          </Link>
        )}
      </div>

      {announcements.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            Δεν υπάρχουν ανακοινώσεις
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {announcements.map((ann) => {
            const isUnread = ann.reads.length === 0;
            return (
              <Link key={ann.id} href={`/announcements/${ann.id}`}>
                <Card
                  className={`hover:shadow-md transition-shadow ${
                    ann.isPinned ? "border-[#F39257]/30 bg-[#F39257]/5" : ""
                  } ${isUnread ? "border-l-4 border-l-[#00B1C9]" : ""}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      {ann.isPinned && (
                        <Pin className="h-4 w-4 text-[#F39257] shrink-0 mt-0.5" />
                      )}
                      <div className="flex-1 min-w-0">
                        <h3
                          className={`text-base ${
                            isUnread ? "font-bold" : "font-medium"
                          }`}
                        >
                          {ann.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-gray-400">
                          {ann.author.image && (
                            <img
                              src={ann.author.image}
                              alt=""
                              className="w-5 h-5 rounded-full"
                            />
                          )}
                          <span>{ann.author.name}</span>
                          <span>&middot;</span>
                          <span>{formatRelativeGr(ann.createdAt)}</span>
                        </div>
                      </div>
                      {isUnread && (
                        <div className="w-2.5 h-2.5 rounded-full bg-[#00B1C9] shrink-0 mt-1" />
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
