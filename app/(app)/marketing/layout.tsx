import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { canAccessMarketing } from "@/lib/permissions";

export default async function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const dbUser = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { department: { select: { name: true } } },
  });

  if (!canAccessMarketing(session.user.role, dbUser?.department?.name)) {
    redirect("/dashboard");
  }

  return <>{children}</>;
}
