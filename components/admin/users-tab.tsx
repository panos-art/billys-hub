"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
import { ROLE_MAP } from "@/lib/utils";
import {
  Edit,
  Loader2,
  UserCheck,
  UserX,
  Plus,
  CalendarDays,
  AlertTriangle,
} from "lucide-react";

interface User {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: string;
  isActive: boolean;
  jobTitle: string | null;
  department: { id: string; name: string } | null;
}

interface Department {
  id: string;
  name: string;
  manager: { id: string; name: string; email: string } | null;
  _count: { members: number };
}

interface BalanceRow {
  leaveTypeId: string;
  leaveTypeName: string;
  defaultDays: number;
  totalDays: number;
  usedDays: number;
  remaining: number;
}

export function UsersTab({ userRole }: { userRole: string }) {
  const [users, setUsers] = useState<User[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // Edit role/dept dialog
  const [editUser, setEditUser] = useState<User | null>(null);
  const [editRole, setEditRole] = useState("");
  const [editDept, setEditDept] = useState("");
  const [saving, setSaving] = useState(false);

  // Add employee dialog
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("EMPLOYEE");
  const [newDept, setNewDept] = useState("none");
  const [addSaving, setAddSaving] = useState(false);
  const [addError, setAddError] = useState("");

  // Leave balances dialog
  const [balanceUser, setBalanceUser] = useState<User | null>(null);
  const [balances, setBalances] = useState<BalanceRow[]>([]);
  const [editedBalances, setEditedBalances] = useState<
    Record<string, number>
  >({});
  const [balanceReason, setBalanceReason] = useState("");
  const [balancesLoading, setBalancesLoading] = useState(false);
  const [balanceSaving, setBalanceSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/api/admin/users").then((r) => r.json()),
      fetch("/api/admin/departments").then((r) => r.json()),
    ])
      .then(([u, d]) => {
        setUsers(u);
        setDepartments(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  async function refreshUsers() {
    const res = await fetch("/api/admin/users");
    setUsers(await res.json());
  }

  // Helper: get the approving manager for a user
  function getApprover(u: User): { name: string; hasApprover: boolean } {
    if (
      u.role === "SUPER_ADMIN" ||
      u.role === "HR_ADMIN"
    ) {
      return { name: "—", hasApprover: true }; // admins don't need an approver
    }
    if (!u.department) {
      return { name: "Χωρίς τμήμα", hasApprover: false };
    }
    const dept = departments.find((d) => d.id === u.department?.id);
    if (!dept?.manager) {
      return { name: "Χωρίς εγκρίνοντα", hasApprover: false };
    }
    if (dept.manager.id === u.id) {
      return { name: "—", hasApprover: true }; // managers don't approve their own
    }
    return { name: dept.manager.name, hasApprover: true };
  }

  // Helper: get manager name for a department id (for dialogs)
  function getDeptManagerInfo(deptId: string): string | null {
    if (deptId === "none") return null;
    const dept = departments.find((d) => d.id === deptId);
    if (!dept) return null;
    return dept.manager?.name || null;
  }

  // --- Edit role/dept ---
  function openEdit(u: User) {
    setEditUser(u);
    setEditRole(u.role);
    setEditDept(u.department?.id || "none");
  }

  async function saveUser() {
    if (!editUser) return;
    setSaving(true);
    try {
      await fetch(`/api/admin/users/${editUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          role: editRole,
          departmentId: editDept === "none" ? null : editDept,
        }),
      });
      await refreshUsers();
      setEditUser(null);
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: User) {
    await fetch(`/api/admin/users/${u.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !u.isActive }),
    });
    await refreshUsers();
  }

  // --- Add employee ---
  function openAddDialog() {
    setNewName("");
    setNewEmail("");
    setNewRole("EMPLOYEE");
    setNewDept("none");
    setAddError("");
    setShowAddDialog(true);
  }

  async function addEmployee() {
    if (!newName || !newEmail) return;
    if (!newEmail.endsWith("@billys.gr")) {
      setAddError("Μόνο λογαριασμοί @billys.gr επιτρέπονται");
      return;
    }
    setAddSaving(true);
    setAddError("");
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newName,
          email: newEmail,
          role: newRole,
          departmentId: newDept === "none" ? null : newDept,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        setAddError(data.error || "Κάτι πήγε στραβά");
        return;
      }
      setShowAddDialog(false);
      await refreshUsers();
    } finally {
      setAddSaving(false);
    }
  }

  // --- Leave balances ---
  async function openBalances(u: User) {
    setBalanceUser(u);
    setEditedBalances({});
    setBalanceReason("");
    setBalancesLoading(true);
    try {
      const res = await fetch(
        `/api/admin/users/${u.id}/leave-balances?year=${new Date().getFullYear()}`
      );
      setBalances(await res.json());
    } finally {
      setBalancesLoading(false);
    }
  }

  function handleBalanceChange(leaveTypeId: string, value: string) {
    const num = parseInt(value);
    if (isNaN(num) || num < 0) return;
    setEditedBalances((prev) => ({ ...prev, [leaveTypeId]: num }));
  }

  const hasBalanceChanges = Object.keys(editedBalances).some((ltId) => {
    const original = balances.find((b) => b.leaveTypeId === ltId);
    return original && editedBalances[ltId] !== original.totalDays;
  });

  async function saveBalances() {
    if (!balanceUser || !hasBalanceChanges || !balanceReason.trim()) return;
    setBalanceSaving(true);
    try {
      const year = new Date().getFullYear();
      const updates = Object.entries(editedBalances)
        .filter(([ltId, days]) => {
          const original = balances.find((b) => b.leaveTypeId === ltId);
          return original && days !== original.totalDays;
        })
        .map(([leaveTypeId, totalDays]) =>
          fetch("/api/admin/leave-balances", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              userId: balanceUser.id,
              leaveTypeId,
              year,
              totalDays,
              reason: balanceReason.trim(),
            }),
          })
        );
      await Promise.all(updates);
      const res = await fetch(
        `/api/admin/users/${balanceUser.id}/leave-balances?year=${year}`
      );
      setBalances(await res.json());
      setEditedBalances({});
      setBalanceReason("");
    } finally {
      setBalanceSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  // Current selected dept manager for add dialog
  const addDeptManager = getDeptManagerInfo(newDept);
  const editDeptManager = getDeptManagerInfo(editDept);

  return (
    <div className="space-y-4">
      {/* Header with Add button */}
      <div className="flex justify-end">
        <Button onClick={openAddDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Νέος Υπάλληλος
        </Button>
      </div>

      {/* Users table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-gray-50">
                  <th className="text-left p-3 font-medium">Χρήστης</th>
                  <th className="text-left p-3 font-medium">Ρόλος</th>
                  <th className="text-left p-3 font-medium">Τμήμα</th>
                  <th className="text-left p-3 font-medium">Εγκρίνων</th>
                  <th className="text-left p-3 font-medium">Κατάσταση</th>
                  <th className="text-right p-3 font-medium">Ενέργειες</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const approver = getApprover(u);
                  return (
                    <tr key={u.id} className="border-b hover:bg-gray-50">
                      <td className="p-3">
                        <div className="flex items-center gap-3">
                          {u.image ? (
                            <img
                              src={u.image}
                              alt=""
                              className="w-8 h-8 rounded-full"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-xs font-medium">
                              {u.name?.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-medium">{u.name}</p>
                            <p className="text-xs text-gray-400">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-3">
                        <Badge variant="outline">
                          {ROLE_MAP[u.role] || u.role}
                        </Badge>
                      </td>
                      <td className="p-3 text-gray-500">
                        {u.department?.name || "—"}
                      </td>
                      <td className="p-3">
                        {approver.hasApprover ? (
                          <span className="text-gray-500">
                            {approver.name}
                          </span>
                        ) : (
                          <span className="text-orange-600 flex items-center gap-1 text-xs font-medium">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            {approver.name}
                          </span>
                        )}
                      </td>
                      <td className="p-3">
                        <Badge
                          variant={u.isActive ? "success" : "destructive"}
                        >
                          {u.isActive ? "Ενεργός" : "Ανενεργός"}
                        </Badge>
                      </td>
                      <td className="p-3 text-right">
                        <div className="flex items-center gap-1 justify-end">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openBalances(u)}
                            title="Υπόλοιπα αδειών"
                          >
                            <CalendarDays className="h-4 w-4 text-[#00B1C9]" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => openEdit(u)}
                            title="Επεξεργασία"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => toggleActive(u)}
                            title={
                              u.isActive ? "Απενεργοποίηση" : "Ενεργοποίηση"
                            }
                          >
                            {u.isActive ? (
                              <UserX className="h-4 w-4 text-red-500" />
                            ) : (
                              <UserCheck className="h-4 w-4 text-emerald-500" />
                            )}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Role/Dept Dialog */}
      <Dialog open={!!editUser} onOpenChange={() => setEditUser(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Επεξεργασία: {editUser?.name}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Ρόλος</Label>
              <Select value={editRole} onValueChange={setEditRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRole === "SUPER_ADMIN" && (
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  )}
                  <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                  <SelectItem value="MANAGER">Διευθυντής</SelectItem>
                  <SelectItem value="EMPLOYEE">Υπάλληλος</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Τμήμα</Label>
              <Select value={editDept} onValueChange={setEditDept}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Κανένα</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                      {d.manager ? ` (Διευθ.: ${d.manager.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {editDept !== "none" && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <span className="text-gray-500">Εγκρίνων αδειών: </span>
                {editDeptManager ? (
                  <span className="font-medium text-[#1C4E89]">
                    {editDeptManager}
                  </span>
                ) : (
                  <span className="text-orange-600 font-medium flex items-center gap-1 inline-flex">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Δεν έχει οριστεί διευθυντής — ορίστε στην καρτέλα
                    &quot;Τμήματα&quot;
                  </span>
                )}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditUser(null)}>
              Ακύρωση
            </Button>
            <Button onClick={saveUser} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Αποθήκευση
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Employee Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Νέος Υπάλληλος</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {addError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-sm text-red-700">
                {addError}
              </div>
            )}
            <div className="space-y-2">
              <Label>Ονοματεπώνυμο</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="π.χ. Γιάννης Παπαδόπουλος"
              />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => {
                  setNewEmail(e.target.value);
                  setAddError("");
                }}
                placeholder="user@billys.gr"
              />
            </div>
            <div className="space-y-2">
              <Label>Ρόλος</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {userRole === "SUPER_ADMIN" && (
                    <SelectItem value="SUPER_ADMIN">Super Admin</SelectItem>
                  )}
                  <SelectItem value="HR_ADMIN">HR Admin</SelectItem>
                  <SelectItem value="MANAGER">Διευθυντής</SelectItem>
                  <SelectItem value="EMPLOYEE">Υπάλληλος</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Τμήμα</Label>
              <Select value={newDept} onValueChange={setNewDept}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Κανένα</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                      {d.manager ? ` (Διευθ.: ${d.manager.name})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {newDept !== "none" && (
              <div className="bg-gray-50 rounded-lg p-3 text-sm">
                <span className="text-gray-500">Εγκρίνων αδειών: </span>
                {addDeptManager ? (
                  <span className="font-medium text-[#1C4E89]">
                    {addDeptManager}
                  </span>
                ) : (
                  <span className="text-orange-600 font-medium flex items-center gap-1 inline-flex">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Δεν έχει οριστεί διευθυντής — ορίστε στην καρτέλα
                    &quot;Τμήματα&quot;
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-gray-400">
              Ο υπάλληλος θα μπορεί να συνδεθεί με Google OAuth χρησιμοποιώντας
              αυτό το email. Τα υπόλοιπα αδειών θα δημιουργηθούν αυτόματα.
            </p>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowAddDialog(false)}
            >
              Ακύρωση
            </Button>
            <Button
              onClick={addEmployee}
              disabled={!newName || !newEmail || addSaving}
            >
              {addSaving && (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              )}
              Δημιουργία
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Leave Balances Dialog */}
      <Dialog
        open={!!balanceUser}
        onOpenChange={() => setBalanceUser(null)}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Υπόλοιπα Αδειών: {balanceUser?.name}
            </DialogTitle>
          </DialogHeader>

          {balancesLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-gray-300" />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="text-xs text-gray-400">
                Έτος: {new Date().getFullYear()}
              </div>
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left p-2 font-medium">
                      Τύπος Άδειας
                    </th>
                    <th className="text-center p-2 font-medium w-24">
                      Σύνολο
                    </th>
                    <th className="text-center p-2 font-medium w-24">
                      Χρήση
                    </th>
                    <th className="text-center p-2 font-medium w-24">
                      Υπόλοιπο
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {balances.map((b) => {
                    const editedTotal =
                      editedBalances[b.leaveTypeId] ?? b.totalDays;
                    const remaining = editedTotal - b.usedDays;
                    return (
                      <tr key={b.leaveTypeId} className="border-b">
                        <td className="p-2 font-medium">
                          {b.leaveTypeName}
                        </td>
                        <td className="p-2 text-center">
                          <Input
                            type="number"
                            min={0}
                            value={editedTotal}
                            onChange={(e) =>
                              handleBalanceChange(
                                b.leaveTypeId,
                                e.target.value
                              )
                            }
                            className="w-20 text-center mx-auto h-8"
                          />
                        </td>
                        <td className="p-2 text-center text-gray-500">
                          {b.usedDays}
                        </td>
                        <td className="p-2 text-center">
                          <span
                            className={
                              remaining < 0
                                ? "text-red-600 font-semibold"
                                : "text-[#1C4E89] font-semibold"
                            }
                          >
                            {remaining}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {hasBalanceChanges && (
                <div className="space-y-2 pt-2 border-t">
                  <Label>
                    Αιτιολογία αλλαγής{" "}
                    <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    value={balanceReason}
                    onChange={(e) => setBalanceReason(e.target.value)}
                    placeholder="π.χ. Προσαρμογή λόγω αρχαιότητας"
                    rows={2}
                  />
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setBalanceUser(null)}
            >
              Κλείσιμο
            </Button>
            {hasBalanceChanges && (
              <Button
                onClick={saveBalances}
                disabled={!balanceReason.trim() || balanceSaving}
              >
                {balanceSaving && (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                )}
                Αποθήκευση
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
