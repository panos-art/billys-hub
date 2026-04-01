"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogOut, Home, ChevronRight } from "lucide-react";

interface TopNavbarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    departmentName?: string | null;
  };
}

const breadcrumbMap: Record<string, { parent?: string; parentHref?: string; label: string }> = {
  "/dashboard": { label: "Αρχική" },
  "/leaves": { parent: "HR", parentHref: "/dashboard", label: "Άδειες" },
  "/leaves/new": { parent: "HR", parentHref: "/dashboard", label: "Νέα Άδεια" },
  "/calendar": { parent: "HR", parentHref: "/dashboard", label: "Ημερολόγιο" },
  "/knowledge": { label: "Γνωσιακή Βάση" },
  "/knowledge/new": { label: "Νέο Άρθρο" },
  "/announcements": { label: "Ανακοινώσεις" },
  "/announcements/new": { label: "Νέα Ανακοίνωση" },
  "/directory": { label: "Κατάλογος Προσωπικού" },
  "/marketing/ads": { parent: "Marketing", parentHref: "/dashboard", label: "Διαφημίσεις" },
  "/marketing/analytics": { parent: "Marketing", parentHref: "/dashboard", label: "Analytics" },
  "/sales/offers": { parent: "Πωλήσεις", parentHref: "/dashboard", label: "Προσφορές" },
  "/admin": { label: "Διαχείριση" },
};

function getBreadcrumb(pathname: string) {
  // Exact match first
  if (breadcrumbMap[pathname]) return breadcrumbMap[pathname];

  // Try parent paths for dynamic routes like /leaves/[id], /knowledge/[slug], /announcements/[id]
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length >= 2) {
    const parentPath = "/" + segments[0];
    if (breadcrumbMap[parentPath]) {
      return breadcrumbMap[parentPath];
    }
  }

  return { label: "Αρχική" };
}

export function TopNavbar({ user }: TopNavbarProps) {
  const pathname = usePathname();
  const isHome = pathname === "/dashboard" || pathname === "/";
  const breadcrumb = getBreadcrumb(pathname);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-[#00203D] h-14 flex items-center justify-between px-4 md:px-6">
      {/* Left: Logo + Breadcrumbs */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard" className="flex items-center gap-1 shrink-0">
          <span className="text-xl font-bold text-[#1C4E89]">billys</span>
          <span className="text-xl font-bold text-[#00B1C9]">hub</span>
        </Link>

        {!isHome && (
          <div className="flex items-center gap-1.5 text-sm ml-2">
            <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
              <Home className="h-3.5 w-3.5" />
            </Link>
            {breadcrumb.parent && (
              <>
                <ChevronRight className="h-3 w-3 text-gray-500" />
                <span className="text-gray-400">{breadcrumb.parent}</span>
              </>
            )}
            <ChevronRight className="h-3 w-3 text-gray-500" />
            <span className="text-white font-medium">{breadcrumb.label}</span>
          </div>
        )}
      </div>

      {/* Right: User + Logout */}
      <div className="flex items-center gap-3">
        <div className="hidden sm:flex items-center gap-2">
          {user.image ? (
            <img src={user.image} alt="" className="w-7 h-7 rounded-full" />
          ) : (
            <div className="w-7 h-7 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-xs font-medium">
              {user.name?.charAt(0) || "U"}
            </div>
          )}
          <span className="text-sm text-gray-300 max-w-[120px] truncate">{user.name}</span>
        </div>
        <form action="/api/auth/signout" method="POST">
          <button
            type="submit"
            className="text-gray-400 hover:text-red-300 transition-colors p-1.5 rounded-lg hover:bg-white/5"
            title="Αποσύνδεση"
          >
            <LogOut size={18} />
          </button>
        </form>
      </div>
    </header>
  );
}
