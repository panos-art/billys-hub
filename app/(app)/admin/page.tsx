import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminTabs } from "@/components/admin/admin-tabs";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  if (
    session.user.role !== "SUPER_ADMIN" &&
    session.user.role !== "HR_ADMIN"
  ) {
    redirect("/dashboard");
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Διαχείριση</h1>
        <p className="text-sm text-gray-500 mt-1">
          Ρυθμίσεις, χρήστες, τμήματα και αργίες
        </p>
      </div>
      <AdminTabs userRole={session.user.role} />
    </div>
  );
}
