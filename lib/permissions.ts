export function canAccessMarketing(role: string, departmentName?: string | null): boolean {
  if (role === "SUPER_ADMIN") return true;
  return departmentName === "Marketing";
}

export function canAccessSales(role: string, departmentName?: string | null): boolean {
  if (role === "SUPER_ADMIN") return true;
  return departmentName === "Sales";
}

export function isAdmin(role: string): boolean {
  return role === "SUPER_ADMIN" || role === "HR_ADMIN";
}
