import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { CalendarView } from "@/components/leaves/calendar-view";

export default async function CalendarPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const now = new Date();
  const year = now.getFullYear();

  const [departments, holidays] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: "asc" } }),
    prisma.publicHoliday.findMany({
      where: { year },
      orderBy: { date: "asc" },
    }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ημερολόγιο Ομάδας</h1>
        <p className="text-sm text-gray-500 mt-1">
          Δείτε τις απουσίες και τις αργίες
        </p>
      </div>
      <CalendarView
        departments={departments}
        holidays={holidays.map((h) => ({
          name: h.name,
          date: h.date.toISOString(),
        }))}
      />
    </div>
  );
}
