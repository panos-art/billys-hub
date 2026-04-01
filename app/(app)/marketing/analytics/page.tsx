import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { KPIGrid } from "@/components/marketing/kpi-card";
import { SessionsChart, TrafficSourcesChart } from "@/components/marketing/analytics-charts";
import {
  getAnalyticsOverview,
  getTrafficSources,
  getLandingPages,
  getConversionFunnel,
} from "@/lib/marketing/mock-data";

const funnelColors = ["#1C4E89", "#00B1C9", "#F39257", "#7BCFB5"];

export default function AnalyticsPage() {
  const { kpis, daily } = getAnalyticsOverview();
  const trafficSources = getTrafficSources();
  const landingPages = getLandingPages();
  const funnel = getConversionFunnel();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Website Analytics</h1>
          <p className="text-sm text-gray-500 mt-1">
            Google Analytics 4 — billys.gr
          </p>
        </div>
        <Badge variant="warning" className="text-xs">Mock Data</Badge>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label}>
            <CardContent className="p-4">
              <p className="text-xs font-medium text-gray-500 mb-1">{kpi.label}</p>
              <p className="text-2xl font-bold text-gray-900">
                {kpi.value.toLocaleString("el-GR")}{kpi.suffix || ""}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                vs {kpi.previousValue.toLocaleString("el-GR")}{kpi.suffix || ""} προηγ.
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sessions Chart */}
      <SessionsChart data={daily} />

      {/* Traffic Sources + Conversion Funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TrafficSourcesChart data={trafficSources} />

        {/* Conversion Funnel */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Conversion Funnel</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {funnel.map((step, i) => {
                const maxCount = funnel[0].count;
                const widthPct = maxCount > 0 ? (step.count / maxCount) * 100 : 0;
                const convRate = i < funnel.length - 1
                  ? ((funnel[i + 1].count / step.count) * 100).toFixed(1)
                  : null;

                return (
                  <div key={step.step}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{step.step}</span>
                      <span className="text-sm font-semibold">{step.count.toLocaleString("el-GR")}</span>
                    </div>
                    <div className="h-8 bg-gray-50 rounded-lg overflow-hidden">
                      <div
                        className="h-full rounded-lg flex items-center px-3"
                        style={{ width: `${Math.max(widthPct, 8)}%`, backgroundColor: funnelColors[i] }}
                      >
                        {widthPct > 25 && (
                          <span className="text-white text-xs font-medium">{step.count.toLocaleString("el-GR")}</span>
                        )}
                      </div>
                    </div>
                    {convRate && (
                      <p className="text-[10px] text-gray-400 mt-0.5 text-right">
                        {convRate}% conversion →
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Landing Pages */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Top Landing Pages</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="pb-2 font-medium text-gray-500">Σελίδα</th>
                <th className="pb-2 font-medium text-gray-500 text-right">Sessions</th>
                <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Users</th>
                <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Bounce Rate</th>
                <th className="pb-2 font-medium text-gray-500 text-right">Conv. Rate</th>
              </tr>
            </thead>
            <tbody>
              {landingPages.map((page) => (
                <tr key={page.path} className="border-b last:border-0">
                  <td className="py-3 font-mono text-xs text-[#00B1C9]">{page.path}</td>
                  <td className="py-3 text-right">{page.sessions.toLocaleString("el-GR")}</td>
                  <td className="py-3 text-right hidden md:table-cell">{page.users.toLocaleString("el-GR")}</td>
                  <td className="py-3 text-right hidden md:table-cell">{page.bounceRate}%</td>
                  <td className="py-3 text-right">
                    <span className={page.conversionRate >= 5 ? "text-emerald-600 font-medium" : ""}>
                      {page.conversionRate}%
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}
