import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { formatDateShortGr, LEAVE_STATUS_MAP } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, ArrowRight } from "lucide-react";

export default async function LeavesPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const isAdmin =
    session.user.role === "SUPER_ADMIN" || session.user.role === "HR_ADMIN";
  const isManager = session.user.role === "MANAGER";

  const where: Record<string, unknown> = {};
  if (!isAdmin && !isManager) {
    where.userId = session.user.id;
  } else if (isManager) {
    where.user = { departmentId: session.user.departmentId };
  }

  const leaves = await prisma.leaveRequest.findMany({
    where,
    include: {
      user: {
        select: { name: true, image: true },
      },
      leaveType: { select: { name: true } },
      approvedBy: { select: { name: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const pendingLeaves = leaves.filter((l) => l.status === "PENDING");
  const processedLeaves = leaves.filter((l) => l.status !== "PENDING");

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Άδειες</h1>
          <p className="text-sm text-gray-500 mt-1">
            {isAdmin || isManager
              ? "Διαχείριση αιτημάτων αδειών"
              : "Τα αιτήματα αδειών σου"}
          </p>
        </div>
        <Link href="/leaves/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Νέα Άδεια
          </Button>
        </Link>
      </div>

      {/* Pending */}
      {pendingLeaves.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              Εκκρεμή Αιτήματα
              <Badge variant="warning">{pendingLeaves.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="divide-y">
              {pendingLeaves.map((leave) => (
                <Link
                  key={leave.id}
                  href={`/leaves/${leave.id}`}
                  className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors"
                >
                  {leave.user.image ? (
                    <img
                      src={leave.user.image}
                      alt=""
                      className="w-9 h-9 rounded-full"
                    />
                  ) : (
                    <div className="w-9 h-9 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-sm font-medium">
                      {leave.user.name?.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{leave.user.name}</p>
                    <p className="text-xs text-gray-500">
                      {leave.leaveType.name} &middot; {leave.workingDays}{" "}
                      ημέρες &middot;{" "}
                      {formatDateShortGr(leave.startDate)} -{" "}
                      {formatDateShortGr(leave.endDate)}
                    </p>
                  </div>
                  <Badge variant="warning">Σε αναμονή</Badge>
                  <ArrowRight className="h-4 w-4 text-gray-300" />
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processed */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Ιστορικό Αδειών</CardTitle>
        </CardHeader>
        <CardContent>
          {processedLeaves.length === 0 && pendingLeaves.length === 0 ? (
            <p className="text-sm text-gray-400 py-8 text-center">
              Δεν υπάρχουν αιτήματα αδειών
            </p>
          ) : processedLeaves.length === 0 ? (
            <p className="text-sm text-gray-400 py-4 text-center">
              Δεν υπάρχει ιστορικό
            </p>
          ) : (
            <div className="divide-y">
              {processedLeaves.map((leave) => {
                const statusInfo = LEAVE_STATUS_MAP[leave.status];
                return (
                  <Link
                    key={leave.id}
                    href={`/leaves/${leave.id}`}
                    className="flex items-center gap-4 py-3 hover:bg-gray-50 px-2 rounded-lg transition-colors"
                  >
                    {leave.user.image ? (
                      <img
                        src={leave.user.image}
                        alt=""
                        className="w-9 h-9 rounded-full"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-sm font-medium">
                        {leave.user.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium">{leave.user.name}</p>
                      <p className="text-xs text-gray-500">
                        {leave.leaveType.name} &middot; {leave.workingDays}{" "}
                        ημέρες &middot;{" "}
                        {formatDateShortGr(leave.startDate)} -{" "}
                        {formatDateShortGr(leave.endDate)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        leave.status === "APPROVED" ? "success" : "destructive"
                      }
                    >
                      {statusInfo.label}
                    </Badge>
                  </Link>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
