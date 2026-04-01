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
import { Plus, Edit, Trash2, Loader2 } from "lucide-react";

interface Department {
  id: string;
  name: string;
  manager: { id: string; name: string; email: string } | null;
  _count: { members: number };
}

interface User {
  id: string;
  name: string;
  email: string;
}

export function DepartmentsTab() {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [managerId, setManagerId] = useState("none");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
    fetch("/api/admin/users")
      .then((r) => r.json())
      .then(setUsers)
      .catch(() => {});
  }, []);

  function refresh() {
    setLoading(true);
    fetch("/api/admin/departments")
      .then((r) => r.json())
      .then((data) => {
        setDepartments(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  function openNew() {
    setEditId(null);
    setName("");
    setManagerId("none");
    setShowDialog(true);
  }

  function openEdit(d: Department) {
    setEditId(d.id);
    setName(d.name);
    setManagerId(d.manager?.id || "none");
    setShowDialog(true);
  }

  async function save() {
    setSaving(true);
    try {
      const url = editId
        ? `/api/admin/departments/${editId}`
        : "/api/admin/departments";
      const method = editId ? "PATCH" : "POST";
      await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          managerId: managerId === "none" ? null : managerId,
        }),
      });
      setShowDialog(false);
      refresh();
    } finally {
      setSaving(false);
    }
  }

  async function deleteDept(id: string) {
    if (!confirm("Σίγουρα θέλετε να διαγράψετε αυτό το τμήμα;")) return;
    await fetch(`/api/admin/departments/${id}`, { method: "DELETE" });
    refresh();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={openNew}>
          <Plus className="h-4 w-4 mr-2" />
          Νέο Τμήμα
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="text-left p-3 font-medium">Τμήμα</th>
                <th className="text-left p-3 font-medium">Διευθυντής</th>
                <th className="text-left p-3 font-medium">Μέλη</th>
                <th className="text-right p-3 font-medium">Ενέργειες</th>
              </tr>
            </thead>
            <tbody>
              {departments.map((d) => (
                <tr key={d.id} className="border-b hover:bg-gray-50">
                  <td className="p-3 font-medium">{d.name}</td>
                  <td className="p-3 text-gray-500">
                    {d.manager?.name || "—"}
                  </td>
                  <td className="p-3 text-gray-500">{d._count.members}</td>
                  <td className="p-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => openEdit(d)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => deleteDept(d.id)}
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

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editId ? "Επεξεργασία Τμήματος" : "Νέο Τμήμα"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Όνομα</Label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="π.χ. Marketing"
              />
            </div>
            <div className="space-y-2">
              <Label>Διευθυντής</Label>
              <Select value={managerId} onValueChange={setManagerId}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Κανένας</SelectItem>
                  {users.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.email})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Ακύρωση
            </Button>
            <Button onClick={save} disabled={!name || saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              {editId ? "Ενημέρωση" : "Δημιουργία"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
