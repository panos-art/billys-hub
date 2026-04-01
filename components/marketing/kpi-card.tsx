import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";
import type { KPI } from "@/lib/marketing/types";

function formatValue(value: number, prefix?: string, suffix?: string): string {
  const formatted = value >= 1000 ? value.toLocaleString("el-GR") : value.toFixed(value % 1 === 0 ? 0 : 2);
  return `${prefix || ""}${formatted}${suffix || ""}`;
}

export function KPICard({ kpi }: { kpi: KPI }) {
  const change = kpi.previousValue > 0
    ? ((kpi.value - kpi.previousValue) / kpi.previousValue) * 100
    : 0;
  const isPositive = change > 0;
  const isGood = kpi.invertTrend ? !isPositive : isPositive;

  return (
    <Card>
      <CardContent className="p-4">
        <p className="text-xs font-medium text-gray-500 mb-1">{kpi.label}</p>
        <p className="text-2xl font-bold text-gray-900">
          {formatValue(kpi.value, kpi.prefix, kpi.suffix)}
        </p>
        <div className="flex items-center gap-1 mt-1.5">
          {isPositive ? (
            <TrendingUp className={`h-3.5 w-3.5 ${isGood ? "text-emerald-500" : "text-red-500"}`} />
          ) : (
            <TrendingDown className={`h-3.5 w-3.5 ${isGood ? "text-emerald-500" : "text-red-500"}`} />
          )}
          <span className={`text-xs font-medium ${isGood ? "text-emerald-500" : "text-red-500"}`}>
            {change > 0 ? "+" : ""}{change.toFixed(1)}%
          </span>
          <span className="text-xs text-gray-400">vs προηγ. μήνα</span>
        </div>
      </CardContent>
    </Card>
  );
}

export function KPIGrid({ kpis }: { kpis: KPI[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
      {kpis.map((kpi) => (
        <KPICard key={kpi.label} kpi={kpi} />
      ))}
    </div>
  );
}
