"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TipTapEditor } from "@/components/knowledge/tiptap-editor";
import { ArrowLeft, Loader2, Eye, EyeOff, Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

function ArticleEditor() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editSlug = searchParams.get("edit");

  const [categories, setCategories] = useState<Category[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [published, setPublished] = useState(false);
  const [featured, setFeatured] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/knowledge/categories")
      .then((r) => r.json())
      .then(setCategories)
      .catch(console.error);

    if (editSlug) {
      fetch(`/api/knowledge/articles/${editSlug}`)
        .then((r) => r.json())
        .then((data) => {
          setTitle(data.title);
          setContent(data.content);
          setCategoryId(data.categoryId);
          setPublished(data.published);
          setFeatured(data.featured);
        })
        .catch(console.error);
    }
  }, [editSlug]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const url = editSlug
        ? `/api/knowledge/articles/${editSlug}`
        : "/api/knowledge/articles";
      const method = editSlug ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content, categoryId, published, featured }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Κάτι πήγε στραβά");
        setLoading(false);
        return;
      }

      router.push("/knowledge");
      router.refresh();
    } catch {
      setError("Σφάλμα σύνδεσης");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/knowledge">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">
          {editSlug ? "Επεξεργασία Άρθρου" : "Νέο Άρθρο"}
        </h1>
      </div>

      <Card>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <Label>Τίτλος</Label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Τίτλος άρθρου"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Κατηγορία</Label>
              <Select value={categoryId} onValueChange={setCategoryId}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε κατηγορία" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Περιεχόμενο</Label>
              <TipTapEditor content={content} onChange={setContent} />
            </div>

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm flex items-center gap-1">
                  {published ? (
                    <Eye className="h-4 w-4 text-emerald-500" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  Δημοσιευμένο
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="rounded border-gray-300"
                />
                <span className="text-sm flex items-center gap-1">
                  <Star
                    className={`h-4 w-4 ${featured ? "text-amber-500" : "text-gray-400"}`}
                  />
                  Προτεινόμενο
                </span>
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!title || !categoryId || loading}
                className="flex-1"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {editSlug ? "Ενημέρωση" : "Δημιουργία"}
              </Button>
              <Link href="/knowledge">
                <Button type="button" variant="outline">
                  Ακύρωση
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function NewArticlePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      }
    >
      <ArticleEditor />
    </Suspense>
  );
}
