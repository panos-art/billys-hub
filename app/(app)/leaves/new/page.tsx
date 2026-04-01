"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

interface LeaveType {
  id: string;
  name: string;
  nameEn: string;
  defaultDays: number;
}

interface Holiday {
  date: string;
}

export default function NewLeavePage() {
  const router = useRouter();
  const [leaveTypes, setLeaveTypes] = useState<LeaveType[]>([]);
  const [holidays, setHolidays] = useState<string[]>([]);
  const [leaveTypeId, setLeaveTypeId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [note, setNote] = useState("");
  const [workingDays, setWorkingDays] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/leave-types")
      .then((r) => r.json())
      .then(setLeaveTypes)
      .catch(console.error);

    fetch("/api/holidays")
      .then((r) => r.json())
      .then((data: Holiday[]) =>
        setHolidays(data.map((h) => h.date.split("T")[0]))
      )
      .catch(console.error);
  }, []);

  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) {
        setWorkingDays(0);
        return;
      }

      let count = 0;
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        const dateStr = current.toISOString().split("T")[0];
        if (day !== 0 && day !== 6 && !holidays.includes(dateStr)) {
          count++;
        }
        current.setDate(current.getDate() + 1);
      }
      setWorkingDays(count);
    }
  }, [startDate, endDate, holidays]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          leaveTypeId,
          startDate,
          endDate,
          workingDays,
          note: note || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Κάτι πήγε στραβά");
        setLoading(false);
        return;
      }

      router.push("/leaves");
      router.refresh();
    } catch {
      setError("Σφάλμα σύνδεσης. Δοκιμάστε ξανά.");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/leaves">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Νέο Αίτημα Άδειας</h1>
          <p className="text-sm text-gray-500 mt-1">
            Συμπληρώστε τα στοιχεία του αιτήματος
          </p>
        </div>
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
              <Label>Τύπος Άδειας</Label>
              <Select value={leaveTypeId} onValueChange={setLeaveTypeId}>
                <SelectTrigger>
                  <SelectValue placeholder="Επιλέξτε τύπο" />
                </SelectTrigger>
                <SelectContent>
                  {leaveTypes.map((lt) => (
                    <SelectItem key={lt.id} value={lt.id}>
                      {lt.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ημερομηνία Έναρξης</Label>
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Ημερομηνία Λήξης</Label>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  min={startDate}
                  required
                />
              </div>
            </div>

            {workingDays > 0 && (
              <div className="bg-[#00B1C9]/10 rounded-lg p-3 text-sm">
                <span className="font-medium text-[#00B1C9]">
                  {workingDays}
                </span>{" "}
                εργάσιμες ημέρες (εξαιρούνται Σ/Κ και αργίες)
              </div>
            )}

            <div className="space-y-2">
              <Label>Σημείωση (προαιρετικά)</Label>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Προσθέστε ένα σχόλιο..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                type="submit"
                disabled={!leaveTypeId || !startDate || !endDate || loading}
                className="flex-1"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                Υποβολή Αιτήματος
              </Button>
              <Link href="/leaves">
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
