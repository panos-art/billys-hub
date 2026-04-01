"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TipTapEditor } from "@/components/knowledge/tiptap-editor";
import { ArrowLeft, Loader2, Pin } from "lucide-react";
import Link from "next/link";

export default function NewAnnouncementPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [isPinned, setIsPinned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/announcements", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, isPinned }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Κάτι πήγε στραβά");
        setLoading(false);
        return;
      }

      router.push("/announcements");
      router.refresh();
    } catch {
      setError("Σφάλμα σύνδεσης");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/announcements">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Νέα Ανακοίνωση</h1>
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
                placeholder="Τίτλος ανακοίνωσης"
                required
              />
            </div>

            <div className="space-y-2">
              <Label>Περιεχόμενο</Label>
              <TipTapEditor content={body} onChange={setBody} />
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPinned}
                onChange={(e) => setIsPinned(e.target.checked)}
                className="rounded border-gray-300"
              />
              <span className="text-sm flex items-center gap-1">
                <Pin
                  className={`h-4 w-4 ${isPinned ? "text-[#F39257]" : "text-gray-400"}`}
                />
                Καρφιτσωμένη
              </span>
            </label>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!title || !body || loading}
                className="flex-1"
              >
                {loading && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                Δημοσίευση
              </Button>
              <Link href="/announcements">
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
