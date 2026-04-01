import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Campaign } from "@/lib/marketing/types";

export function CampaignTable({ data }: { data: Campaign[] }) {
  const sorted = [...data].sort((a, b) => b.spend - a.spend);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Top Campaigns</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium text-gray-500">Campaign</th>
              <th className="pb-2 font-medium text-gray-500">Platform</th>
              <th className="pb-2 font-medium text-gray-500 text-right">Δαπάνη</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Impressions</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Clicks</th>
              <th className="pb-2 font-medium text-gray-500 text-right">Leads</th>
              <th className="pb-2 font-medium text-gray-500 text-right">CPL</th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((c) => {
              const cpl = c.leads > 0 ? c.spend / c.leads : 0;
              return (
                <tr key={c.name} className="border-b last:border-0">
                  <td className="py-3 font-medium max-w-[200px] truncate">{c.name}</td>
                  <td className="py-3">
                    <Badge variant={c.platform === "google" ? "info" : "default"} className="text-[10px]">
                      {c.platform === "google" ? "Google" : "Meta"}
                    </Badge>
                  </td>
                  <td className="py-3 text-right">€{c.spend.toLocaleString("el-GR")}</td>
                  <td className="py-3 text-right hidden md:table-cell">{c.impressions.toLocaleString("el-GR")}</td>
                  <td className="py-3 text-right hidden md:table-cell">{c.clicks.toLocaleString("el-GR")}</td>
                  <td className="py-3 text-right font-medium text-[#1C4E89]">{c.leads}</td>
                  <td className="py-3 text-right">€{cpl.toFixed(0)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </CardContent>
    </Card>
  );
}
