"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, CheckCircle, XCircle, Loader2 } from "lucide-react";
import Link from "next/link";

interface LeaveDetail {
  id: string;
  startDate: string;
  endDate: string;
  workingDays: number;
  status: string;
  note: string | null;
  approverComment: string | null;
  createdAt: string;
  user: {
    name: string;
    image: string | null;
    email: string;
    department: { name: string } | null;
  };
  leaveType: { name: string };
  approvedBy: { name: string } | null;
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("el-GR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function LeaveDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [leave, setLeave] = useState<LeaveDetail | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaves/${id}`)
      .then((r) => r.json())
      .then((data) => {
        setLeave(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  async function handleAction(status: "APPROVED" | "REJECTED") {
    setActionLoading(status);
    try {
      const res = await fetch(`/api/leaves/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, comment: comment || undefined }),
      });
      if (res.ok) {
        router.push("/leaves");
        router.refresh();
      }
    } finally {
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!leave) {
    return (
      <div className="text-center py-20 text-gray-400">
        Δεν βρέθηκε το αίτημα
      </div>
    );
  }

  const statusVariant =
    leave.status === "APPROVED"
      ? "success"
      : leave.status === "REJECTED"
        ? "destructive"
        : "warning";
  const statusLabel =
    leave.status === "APPROVED"
      ? "Εγκρίθηκε"
      : leave.status === "REJECTED"
        ? "Απορρίφθηκε"
        : "Σε αναμονή";

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <Link href="/leaves">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">
            Αίτημα Άδειας
          </h1>
        </div>
        <Badge variant={statusVariant}>{statusLabel}</Badge>
      </div>

      <Card>
        <CardContent className="p-6 space-y-4">
          {/* Employee info */}
          <div className="flex items-center gap-3 pb-4 border-b">
            {leave.user.image ? (
              <img
                src={leave.user.image}
                alt=""
                className="w-12 h-12 rounded-full"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-[#1C4E89] flex items-center justify-center text-white font-medium">
                {leave.user.name?.charAt(0)}
              </div>
            )}
            <div>
              <p className="font-semibold">{leave.user.name}</p>
              <p className="text-sm text-gray-500">
                {leave.user.email}
                {leave.user.department && (
                  <> &middot; {leave.user.department.name}</>
                )}
              </p>
            </div>
          </div>

          {/* Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-500">Τύπος Άδειας</p>
              <p className="font-medium mt-1">{leave.leaveType.name}</p>
            </div>
            <div>
              <p className="text-gray-500">Εργάσιμες Ημέρες</p>
              <p className="font-medium mt-1">{leave.workingDays}</p>
            </div>
            <div>
              <p className="text-gray-500">Ημ. Έναρξης</p>
              <p className="font-medium mt-1">{formatDate(leave.startDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Ημ. Λήξης</p>
              <p className="font-medium mt-1">{formatDate(leave.endDate)}</p>
            </div>
            <div>
              <p className="text-gray-500">Ημ. Υποβολής</p>
              <p className="font-medium mt-1">{formatDate(leave.createdAt)}</p>
            </div>
            {leave.approvedBy && (
              <div>
                <p className="text-gray-500">Διεκπεραιώθηκε από</p>
                <p className="font-medium mt-1">{leave.approvedBy.name}</p>
              </div>
            )}
          </div>

          {leave.note && (
            <div className="pt-2">
              <p className="text-sm text-gray-500">Σημείωση</p>
              <p className="text-sm mt-1 bg-gray-50 rounded-lg p-3">
                {leave.note}
              </p>
            </div>
          )}

          {leave.approverComment && (
            <div className="pt-2">
              <p className="text-sm text-gray-500">Σχόλιο Εγκρίνοντα</p>
              <p className="text-sm mt-1 bg-gray-50 rounded-lg p-3">
                {leave.approverComment}
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approval actions */}
      {leave.status === "PENDING" && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Ενέργειες</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Σχόλιο (προαιρετικά)..."
              rows={2}
            />
            <div className="flex gap-3">
              <Button
                variant="success"
                onClick={() => handleAction("APPROVED")}
                disabled={!!actionLoading}
                className="flex-1"
              >
                {actionLoading === "APPROVED" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                Έγκριση
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleAction("REJECTED")}
                disabled={!!actionLoading}
                className="flex-1"
              >
                {actionLoading === "REJECTED" ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <XCircle className="h-4 w-4 mr-2" />
                )}
                Απόρριψη
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
