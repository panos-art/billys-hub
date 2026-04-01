"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Search, Mail, Phone, ExternalLink, Edit, Loader2 } from "lucide-react";

interface Employee {
  id: string;
  name: string;
  email: string;
  image: string | null;
  jobTitle: string | null;
  phone: string | null;
  linkedin: string | null;
  bio: string | null;
  birthday: string | null;
  department: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
}

export default function DirectoryPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [search, setSearch] = useState("");
  const [deptFilter, setDeptFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState({
    jobTitle: "",
    phone: "",
    linkedin: "",
    bio: "",
    birthday: "",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchEmployees();
    fetch("/api/knowledge/categories")
      .catch(() => {});
    fetch("/api/holidays?year=2026")
      .then((r) => r.json())
      .then(() =>
        fetch("/api/leave-types")
          .then((r) => r.json())
          .catch(() => {})
      )
      .catch(() => {});

    // Fetch departments
    fetch("/api/admin/departments")
      .then((r) => r.json())
      .then(setDepartments)
      .catch(() => {});
  }, []);

  function fetchEmployees() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (deptFilter !== "all") params.set("department", deptFilter);

    fetch(`/api/directory?${params}`)
      .then((r) => r.json())
      .then((data) => {
        setEmployees(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }

  useEffect(() => {
    const timeout = setTimeout(fetchEmployees, 300);
    return () => clearTimeout(timeout);
  }, [search, deptFilter]);

  function openEdit(emp: Employee) {
    setEditEmployee(emp);
    setEditForm({
      jobTitle: emp.jobTitle || "",
      phone: emp.phone || "",
      linkedin: emp.linkedin || "",
      bio: emp.bio || "",
      birthday: emp.birthday ? emp.birthday.substring(0, 10) : "",
    });
  }

  async function saveEdit() {
    if (!editEmployee) return;
    setSaving(true);
    try {
      await fetch(`/api/directory/${editEmployee.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      setEditEmployee(null);
      fetchEmployees();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Κατάλογος Υπαλλήλων
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Βρείτε τα μέλη της ομάδας Billys
        </p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Αναζήτηση ονόματος ή τμήματος..."
            className="pl-10"
          />
        </div>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Τμήμα" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Όλα τα τμήματα</SelectItem>
            {departments.map((d) => (
              <SelectItem key={d.id} value={d.id}>
                {d.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
        </div>
      ) : employees.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-gray-400">
            Δεν βρέθηκαν υπάλληλοι
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {employees.map((emp) => (
            <Card key={emp.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {emp.image ? (
                    <img
                      src={emp.image}
                      alt=""
                      className="w-12 h-12 rounded-full shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-[#1C4E89] flex items-center justify-center text-white font-medium shrink-0">
                      {emp.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm truncate">
                      {emp.name}
                    </h3>
                    {emp.jobTitle && (
                      <p className="text-xs text-gray-500 truncate">
                        {emp.jobTitle}
                      </p>
                    )}
                    {emp.department && (
                      <p className="text-xs text-[#00B1C9]">
                        {emp.department.name}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => openEdit(emp)}
                    className="text-gray-300 hover:text-gray-500 p-1"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                </div>

                {emp.bio && (
                  <p className="text-xs text-gray-400 mt-3 line-clamp-2">
                    {emp.bio}
                  </p>
                )}

                <div className="flex items-center gap-3 mt-3 pt-3 border-t">
                  <a
                    href={`mailto:${emp.email}`}
                    className="text-gray-400 hover:text-[#00B1C9]"
                  >
                    <Mail className="h-4 w-4" />
                  </a>
                  {emp.phone && (
                    <a
                      href={`tel:${emp.phone}`}
                      className="text-gray-400 hover:text-[#00B1C9]"
                    >
                      <Phone className="h-4 w-4" />
                    </a>
                  )}
                  {emp.linkedin && (
                    <a
                      href={emp.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-400 hover:text-[#00B1C9]"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editEmployee}
        onOpenChange={() => setEditEmployee(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επεξεργασία Προφίλ</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Θέση</Label>
              <Input
                value={editForm.jobTitle}
                onChange={(e) =>
                  setEditForm({ ...editForm, jobTitle: e.target.value })
                }
                placeholder="π.χ. Frontend Developer"
              />
            </div>
            <div className="space-y-2">
              <Label>Τηλέφωνο</Label>
              <Input
                value={editForm.phone}
                onChange={(e) =>
                  setEditForm({ ...editForm, phone: e.target.value })
                }
                placeholder="+30 ..."
              />
            </div>
            <div className="space-y-2">
              <Label>LinkedIn</Label>
              <Input
                value={editForm.linkedin}
                onChange={(e) =>
                  setEditForm({ ...editForm, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/in/..."
              />
            </div>
            <div className="space-y-2">
              <Label>Σύντομη Βιογραφία (200 χαρ.)</Label>
              <Textarea
                value={editForm.bio}
                onChange={(e) =>
                  setEditForm({
                    ...editForm,
                    bio: e.target.value.substring(0, 200),
                  })
                }
                placeholder="Πείτε μας λίγα λόγια για εσάς..."
                rows={3}
              />
              <p className="text-xs text-gray-400 text-right">
                {editForm.bio.length}/200
              </p>
            </div>
            <div className="space-y-2">
              <Label>Ημερομηνία Γέννησης</Label>
              <Input
                type="date"
                value={editForm.birthday}
                onChange={(e) =>
                  setEditForm({ ...editForm, birthday: e.target.value })
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditEmployee(null)}>
              Ακύρωση
            </Button>
            <Button onClick={saveEdit} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Αποθήκευση
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
