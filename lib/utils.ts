import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isWeekend } from "date-fns";
import { el } from "date-fns/locale";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateGr(date: Date | string): string {
  return format(new Date(date), "d MMMM yyyy", { locale: el });
}

export function formatDateShortGr(date: Date | string): string {
  return format(new Date(date), "d MMM yyyy", { locale: el });
}

export function formatRelativeGr(date: Date | string): string {
  return formatDistanceToNow(new Date(date), { addSuffix: true, locale: el });
}

export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Καλημέρα";
  if (hour < 18) return "Καλό απόγευμα";
  return "Καλό βράδυ";
}

export function calculateWorkingDays(
  start: Date,
  end: Date,
  holidays: Date[]
): number {
  let count = 0;
  const current = new Date(start);
  const holidaySet = new Set(holidays.map((h) => h.toISOString().split("T")[0]));

  while (current <= end) {
    const dateStr = current.toISOString().split("T")[0];
    if (!isWeekend(current) && !holidaySet.has(dateStr)) {
      count++;
    }
    current.setDate(current.getDate() + 1);
  }

  return count;
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const LEAVE_STATUS_MAP: Record<
  string,
  { label: string; color: string; bgColor: string }
> = {
  PENDING: {
    label: "Σε αναμονή",
    color: "text-orange-700",
    bgColor: "bg-orange-100",
  },
  APPROVED: {
    label: "Εγκρίθηκε",
    color: "text-emerald-700",
    bgColor: "bg-emerald-100",
  },
  REJECTED: {
    label: "Απορρίφθηκε",
    color: "text-red-700",
    bgColor: "bg-red-100",
  },
};

export const ROLE_MAP: Record<string, string> = {
  SUPER_ADMIN: "Super Admin",
  HR_ADMIN: "HR Admin",
  MANAGER: "Διευθυντής",
  EMPLOYEE: "Υπάλληλος",
};
