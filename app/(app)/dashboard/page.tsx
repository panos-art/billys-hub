import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { getGreeting, formatDateShortGr, LEAVE_STATUS_MAP } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Palmtree,
  BookOpen,
  ArrowRight,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { differenceInDays, format } from "date-fns";
import { el } from "date-fns/locale";
import { ensureBirthdayLeaveBalance } from "@/lib/birthday-leave";
import { Cake } from "lucide-react";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const userId = session.user.id;
  const userRole = session.user.role;
  const currentYear = new Date().getFullYear();
  const now = new Date();

  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { createdAt: true },
  });
  const isNewUser = dbUser
    ? differenceInDays(now, new Date(dbUser.createdAt)) < 30
    : false;

  // Ensure birthday leave balance exists
  await ensureBirthdayLeaveBalance(userId, currentYear);

  // Fetch data in parallel
  const [leaveBalances, pendingRequests, upcomingAbsences, recentAnnouncements, allBirthdayUsers] =
    await Promise.all([
      // Leave balances
      prisma.leaveBalance.findMany({
        where: { userId, year: currentYear },
        include: { leaveType: true },
      }),

      // Pending leave requests for managers
      userRole === "MANAGER" || userRole === "SUPER_ADMIN" || userRole === "HR_ADMIN"
        ? prisma.leaveRequest.findMany({
            where: {
              status: "PENDING",
              ...(userRole === "MANAGER"
                ? {
                    user: {
                      departmentId: session.user.departmentId,
                    },
                  }
                : {}),
            },
            include: {
              user: { select: { name: true, image: true } },
              leaveType: { select: { name: true } },
            },
            orderBy: { createdAt: "desc" },
            take: 10,
          })
        : Promise.resolve([]),

      // Upcoming absences (next 7 days)
      prisma.leaveRequest.findMany({
        where: {
          status: "APPROVED",
          startDate: { lte: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
          endDate: { gte: now },
        },
        include: {
          user: { select: { name: true, image: true, department: { select: { name: true } } } },
          leaveType: { select: { name: true } },
        },
        orderBy: { startDate: "asc" },
        take: 10,
      }),

      // Recent announcements
      prisma.announcement.findMany({
        orderBy: [{ isPinned: "desc" }, { createdAt: "desc" }],
        take: 3,
        include: {
          author: { select: { name: true } },
          reads: { where: { userId }, select: { id: true } },
        },
      }),

      // Upcoming birthdays — fetch all with birthdays, filter in JS
      prisma.user.findMany({
        where: { birthday: { not: null }, isActive: true },
        select: { id: true, name: true, image: true, birthday: true },
      }),
    ]);

  // Filter birthdays to next 30 days
  const filteredBirthdays = allBirthdayUsers.filter((u) => {
    if (!u.birthday) return false;
    const bday = new Date(u.birthday);
    const todayMD = now.getMonth() * 100 + now.getDate();
    const bdayMD = bday.getMonth() * 100 + bday.getDate();
    const future = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    const futureMD = future.getMonth() * 100 + future.getDate();
    if (now.getMonth() <= future.getMonth()) {
      return bdayMD >= todayMD && bdayMD <= futureMD;
    }
    // Dec→Jan wrap
    return bdayMD >= todayMD || bdayMD <= futureMD;
  }).slice(0, 10);

  const firstName = session.user.name?.split(" ")[0] || "χρήστη";

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {firstName}!
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Ορίστε μια σύνοψη της ημέρας σου
        </p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3">
        <Link href="/leaves/new">
          <Button>
            <Palmtree className="mr-2 h-4 w-4" />
            Υποβολή Άδειας
          </Button>
        </Link>
        <Link href="/knowledge">
          <Button variant="outline">
            <BookOpen className="mr-2 h-4 w-4" />
            Γνωσιακή Βάση
          </Button>
        </Link>
      </div>

      {/* Leave Balances */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-3">
          Υπόλοιπα Αδειών {currentYear}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
          {leaveBalances.map((balance) => {
            const remaining = balance.totalDays - balance.usedDays;
            const pct =
              balance.totalDays > 0
                ? (balance.usedDays / balance.totalDays) * 100
                : 0;
            return (
              <Card key={balance.id}>
                <CardContent className="p-4">
                  <p className="text-xs font-medium text-gray-500 mb-2">
                    {balance.leaveType.name}
                  </p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-[#1C4E89]">
                      {remaining}
                    </span>
                    <span className="text-sm text-gray-400">
                      / {balance.totalDays}
                    </span>
                  </div>
                  <div className="mt-2 h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#7BCFB5] rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {balance.usedDays} χρησιμοποιημένες
                  </p>
                </CardContent>
              </Card>
            );
          })}
          {leaveBalances.length === 0 && (
            <p className="text-sm text-gray-400 col-span-full">
              Δεν βρέθηκαν υπόλοιπα αδειών.
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Actions (Managers) */}
        {(userRole === "MANAGER" ||
          userRole === "SUPER_ADMIN" ||
          userRole === "HR_ADMIN") && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-base">Εκκρεμή Αιτήματα</CardTitle>
              <Badge variant="warning">{pendingRequests.length}</Badge>
            </CardHeader>
            <CardContent>
              {pendingRequests.length === 0 ? (
                <p className="text-sm text-gray-400 py-4">
                  Δεν υπάρχουν εκκρεμή αιτήματα
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingRequests.map((req) => (
                    <Link
                      key={req.id}
                      href={`/leaves/${req.id}`}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Clock className="h-4 w-4 text-[#F39257] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {req.user.name}
                        </p>
                        <p className="text-xs text-gray-400">
                          {req.leaveType.name} &middot;{" "}
                          {formatDateShortGr(req.startDate)}
                        </p>
                      </div>
                      <ArrowRight className="h-4 w-4 text-gray-300" />
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Upcoming Absences */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">
              Προσεχείς Απουσίες (7 ημέρες)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingAbsences.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">
                Κανείς δεν απουσιάζει τις επόμενες 7 μέρες
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingAbsences.map((absence) => (
                  <div
                    key={absence.id}
                    className="flex items-center gap-3 p-2"
                  >
                    {absence.user.image ? (
                      <img
                        src={absence.user.image}
                        alt=""
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-xs font-medium">
                        {absence.user.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {absence.user.name}
                      </p>
                      <p className="text-xs text-gray-400">
                        {absence.leaveType.name} &middot;{" "}
                        {formatDateShortGr(absence.startDate)} -{" "}
                        {formatDateShortGr(absence.endDate)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Announcements */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-base">
              Πρόσφατες Ανακοινώσεις
            </CardTitle>
            <Link
              href="/announcements"
              className="text-xs text-[#00B1C9] hover:underline"
            >
              Όλες
            </Link>
          </CardHeader>
          <CardContent>
            {recentAnnouncements.length === 0 ? (
              <p className="text-sm text-gray-400 py-4">
                Δεν υπάρχουν ανακοινώσεις
              </p>
            ) : (
              <div className="space-y-3">
                {recentAnnouncements.map((ann) => {
                  const isUnread = ann.reads.length === 0;
                  return (
                    <Link
                      key={ann.id}
                      href={`/announcements/${ann.id}`}
                      className="block p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        {ann.isPinned && (
                          <span className="text-[#F39257] text-xs">📌</span>
                        )}
                        <div className="flex-1 min-w-0">
                          <p
                            className={`text-sm truncate ${
                              isUnread ? "font-bold" : "font-medium"
                            }`}
                          >
                            {ann.title}
                          </p>
                          <p className="text-xs text-gray-400 mt-0.5">
                            {ann.author.name} &middot;{" "}
                            {formatDateShortGr(ann.createdAt)}
                          </p>
                        </div>
                        {isUnread && (
                          <div className="w-2 h-2 rounded-full bg-[#00B1C9] shrink-0 mt-1.5" />
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Birthdays */}
        {filteredBirthdays.length > 0 && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Cake className="h-4 w-4 text-[#F39257]" />
                Επερχόμενα Γενέθλια
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredBirthdays.map((person) => (
                  <div key={person.id} className="flex items-center gap-3 p-2">
                    {person.image ? (
                      <img src={person.image} alt="" className="w-8 h-8 rounded-full" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-xs font-medium">
                        {person.name?.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{person.name}</p>
                      <p className="text-xs text-gray-400">
                        {person.birthday && format(new Date(2000, new Date(person.birthday).getMonth(), new Date(person.birthday).getDate()), "d MMMM", { locale: el })}
                      </p>
                    </div>
                    <span className="text-lg">🎂</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Onboarding Checklist */}
        {isNewUser && (
          <Card className="border-[#00B1C9]/30 bg-[#00B1C9]/5">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <span>🎉</span> Καλώς ήρθες στο Billys Hub!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    label: "Ολοκλήρωσε το προφίλ σου",
                    href: "/directory",
                  },
                  {
                    label: "Διάβασε τον Οδηγό Εισαγωγής",
                    href: "/knowledge",
                  },
                  {
                    label: "Γνώρισε την ομάδα σου",
                    href: "/directory",
                  },
                  {
                    label: "Δες την πολιτική αδειών",
                    href: "/knowledge",
                  },
                ].map((item, i) => (
                  <Link
                    key={i}
                    href={item.href}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/50 transition-colors"
                  >
                    <div className="w-5 h-5 rounded border-2 border-gray-300 flex items-center justify-center">
                      <CheckCircle className="h-3 w-3 text-gray-300" />
                    </div>
                    <span className="text-sm">{item.label}</span>
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
