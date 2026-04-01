"use client";

import { useState, useEffect } from "react";
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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Trash2, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Holiday {
  id: string;
  name: string;
  date: string;
  isRecurring: boolean;
  year: number;
}

export function HolidaysTab() {
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [year, setYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDate, setNewDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
  }, [year]);

  function refresh() {
    setLoading(true);
    fetch(`/api/admin/holidays?year=${year}`)
      .then((r) => r.json())
      .then((data) => {
        setHolidays(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  async function addHoliday() {
    setSaving(true);
    try {
      await fetch("/api/admin/holidays", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newName, date: newDate }),
      });
      setShowDialog(false);
      setNewName("");
      setNewDate("");
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deleteHoliday(id: string) {
    if (!confirm("Σίγουρα θέλετε να διαγράψετε αυτή την αργία;")) return;
    await fetch(`/api/admin/holidays/${id}`, { method: "DELETE" });
    refresh();
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear(year - 1)}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-lg font-semibold min-w-[60px] text-center">
            {year}
          </span>
          <Button
            variant="outline"
            size="icon"
            onClick={() => setYear(year + 1)}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <Button onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Νέα Αργία
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Ημερομηνία</th>
                  <th className="text-left p-3 font-medium">Ονομασία</th>
                  <th className="text-left p-3 font-medium">Τύπος</th>
                  <th className="text-right p-3 font-medium">Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => (
                  <tr key={h.id} className="border-b hover:bg-gray-50">
                    <td className="p-3">
                      {new Date(h.date).toLocaleDateString("el-GR", {
                        day: "numeric",
                        month: "long",
                        weekday: "short",
                      })}
                    </td>
                    <td className="p-3 font-medium">{h.name}</td>
                    <td className="p-3 text-gray-500">
                      {h.isRecurring ? "Σταθερή" : "Κινητή"}
                    </td>
                    <td className="p-3 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => deleteHoliday(h.id)}
                      >
                        <Trash2 className="h-4 w-4 text-red-500" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Νέα Αργία</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ονομασία</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="π.χ. Ημέρα Εταιρείας"
              />
            </div>
            <div className="space-y-2">
              <Label>Ημερομηνία</Label>
              <Input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Ακύρωση
            </Button>
            <Button onClick={addHoliday} disabled={!newName || !newDate || saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Προσθήκη
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
