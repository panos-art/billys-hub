"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  CalendarDays,
  Palmtree,
  BookOpen,
  Megaphone,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  BarChart3,
  LineChart,
  FileText,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { canAccessMarketing, canAccessSales, isAdmin } from "@/lib/permissions";

interface SidebarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    role: string;
    departmentName?: string | null;
  };
}

interface NavItem {
  href: string;
  icon: typeof LayoutDashboard;
  label: string;
}

interface NavSection {
  title?: string;
  items: NavItem[];
  visible: boolean;
}

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const sections: NavSection[] = [
    {
      items: [{ href: "/dashboard", icon: LayoutDashboard, label: "Αρχική" }],
      visible: true,
    },
    {
      title: "HR",
      items: [
        { href: "/leaves", icon: Palmtree, label: "Άδειες" },
        { href: "/calendar", icon: CalendarDays, label: "Ημερολόγιο" },
      ],
      visible: true,
    },
    {
      title: "Εργαλεία",
      items: [
        { href: "/knowledge", icon: BookOpen, label: "Γνωσιακή Βάση" },
        { href: "/announcements", icon: Megaphone, label: "Ανακοινώσεις" },
        { href: "/directory", icon: Users, label: "Κατάλογος" },
      ],
      visible: true,
    },
    {
      title: "Marketing",
      items: [
        { href: "/marketing/ads", icon: BarChart3, label: "Διαφημίσεις" },
        { href: "/marketing/analytics", icon: LineChart, label: "Analytics" },
      ],
      visible: canAccessMarketing(user.role, user.departmentName),
    },
    {
      title: "Πωλήσεις",
      items: [
        { href: "/sales/offers", icon: FileText, label: "Προσφορές" },
      ],
      visible: canAccessSales(user.role, user.departmentName),
    },
    {
      title: "Διαχείριση",
      items: [{ href: "/admin", icon: Settings, label: "Admin Panel" }],
      visible: isAdmin(user.role),
    },
  ];

  const visibleSections = sections.filter((s) => s.visible);

  // Flat list for mobile bottom nav (core items only)
  const mobileItems: NavItem[] = [
    { href: "/dashboard", icon: LayoutDashboard, label: "Αρχική" },
    { href: "/leaves", icon: Palmtree, label: "Άδειες" },
    { href: "/calendar", icon: CalendarDays, label: "Ημερολόγιο" },
    { href: "/directory", icon: Users, label: "Κατάλογος" },
  ];

  return (
    <>
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-[#00203D] flex items-center justify-between px-4 h-14">
        <Link href="/dashboard" className="flex items-center gap-1">
          <span className="text-xl font-bold text-[#1C4E89]">billys</span>
          <span className="text-xl font-bold text-[#00B1C9]">hub</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="text-white p-2"
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 bg-[#00203D] flex flex-col transition-transform duration-300 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-1 px-6 h-16 shrink-0">
          <span className="text-2xl font-bold text-[#1C4E89]">billys</span>
          <span className="text-2xl font-bold text-[#00B1C9]">hub</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {visibleSections.map((section, sIdx) => (
            <div key={sIdx} className={sIdx > 0 ? "mt-4" : ""}>
              {section.title && (
                <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
                  {section.title}
                </p>
              )}
              {section.items.map((item) => {
                const isActive =
                  pathname === item.href ||
                  pathname.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-[#1C4E89] text-white"
                        : "text-gray-300 hover:bg-[#1C4E89]/20 hover:text-white"
                    )}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>

        {/* User section */}
        <div className="border-t border-white/10 px-3 py-4">
          <div className="flex items-center gap-3 px-3 mb-3">
            {user.image ? (
              <img
                src={user.image}
                alt=""
                className="w-8 h-8 rounded-full"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-[#1C4E89] flex items-center justify-center text-white text-sm font-medium">
                {user.name?.charAt(0) || "U"}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user.name}
              </p>
              <p className="text-xs text-gray-400 truncate">{user.email}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="POST">
            <button
              type="submit"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-300 hover:bg-red-500/20 hover:text-red-300 transition-colors w-full"
            >
              <LogOut size={18} />
              <span>Αποσύνδεση</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#00203D] border-t border-white/10 flex items-center justify-around px-2 py-1 safe-area-inset-bottom">
        {mobileItems.map((item) => {
          const isActive =
            pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors",
                isActive ? "text-[#00B1C9]" : "text-gray-400"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setMobileOpen(true)}
          className="flex flex-col items-center gap-0.5 py-1.5 px-2 rounded-lg text-[10px] font-medium text-gray-400"
        >
          <MoreHorizontal size={20} />
          <span>Περισσ.</span>
        </button>
      </nav>
    </>
  );
}
