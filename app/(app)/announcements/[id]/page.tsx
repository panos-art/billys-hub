"use client";

import { useState, useEffect, use } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Pin, Loader2 } from "lucide-react";
import Link from "next/link";

interface AnnouncementDetail {
  id: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  author: { name: string; image: string | null };
}

export default function AnnouncementDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [announcement, setAnnouncement] = useState<AnnouncementDetail | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/announcements/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setAnnouncement(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!announcement) {
    return (
      <div className="text-center py-20 text-gray-400">
        Δεν βρέθηκε η ανακοίνωση
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/announcements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 flex-1">
          {announcement.isPinned && (
            <Pin className="h-5 w-5 text-[#F39257] inline mr-2" />
          )}
          {announcement.title}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 pb-4 border-b mb-4">
            {announcement.author.image && (
              <img
                src={announcement.author.image}
                alt=""
                className="w-10 h-10 rounded-full"
              />
            )}
            <div>
              <p className="font-medium">{announcement.author.name}</p>
              <p className="text-sm text-gray-400">
                {new Date(announcement.createdAt).toLocaleDateString("el-GR", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          <div
            className="article-content prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: announcement.body }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
