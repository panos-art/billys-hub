import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { ChannelMetrics } from "@/lib/marketing/types";

function fmt(n: number, prefix = ""): string {
  if (n >= 1000000) return `${prefix}${(n / 1000000).toFixed(1)}M`;
  if (n >= 1000) return `${prefix}${(n / 1000).toFixed(1)}K`;
  return `${prefix}${n.toFixed(n % 1 === 0 ? 0 : 2)}`;
}

export function ChannelTable({ data }: { data: ChannelMetrics[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Απόδοση ανά Κανάλι</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b text-left">
              <th className="pb-2 font-medium text-gray-500">Κανάλι</th>
              <th className="pb-2 font-medium text-gray-500 text-right">Δαπάνη</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Impressions</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Clicks</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden lg:table-cell">CTR</th>
              <th className="pb-2 font-medium text-gray-500 text-right">Leads</th>
              <th className="pb-2 font-medium text-gray-500 text-right">CPL</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden md:table-cell">Won</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden lg:table-cell">CAC</th>
              <th className="pb-2 font-medium text-gray-500 text-right hidden lg:table-cell">ROAS</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row) => {
              const ctr = row.clicks > 0 && row.impressions > 0 ? (row.clicks / row.impressions * 100) : 0;
              const cpl = row.leads > 0 && row.spend > 0 ? row.spend / row.leads : 0;
              const cac = row.dealsWon > 0 && row.spend > 0 ? row.spend / row.dealsWon : 0;
              const roas = row.spend > 0 ? row.revenue / row.spend : 0;

              return (
                <tr key={row.channel} className="border-b last:border-0">
                  <td className="py-3 font-medium">{row.channel}</td>
                  <td className="py-3 text-right">{row.spend > 0 ? fmt(row.spend, "€") : "—"}</td>
                  <td className="py-3 text-right hidden md:table-cell">{row.impressions > 0 ? fmt(row.impressions) : "—"}</td>
                  <td className="py-3 text-right hidden md:table-cell">{row.clicks > 0 ? fmt(row.clicks) : "—"}</td>
                  <td className="py-3 text-right hidden lg:table-cell">{ctr > 0 ? `${ctr.toFixed(1)}%` : "—"}</td>
                  <td className="py-3 text-right font-medium text-[#1C4E89]">{row.leads}</td>
                  <td className="py-3 text-right">{cpl > 0 ? fmt(cpl, "€") : "—"}</td>
                  <td className="py-3 text-right hidden md:table-cell">{row.dealsWon}</td>
                  <td className="py-3 text-right hidden lg:table-cell">{cac > 0 ? fmt(cac, "€") : "—"}</td>
                  <td className="py-3 text-right hidden lg:table-cell font-medium">{roas > 0 ? `${roas.toFixed(1)}x` : "—"}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 font-semibold">
              <td className="py-3">Σύνολο</td>
              <td className="py-3 text-right">{fmt(data.reduce((s, r) => s + r.spend, 0), "€")}</td>
              <td className="py-3 text-right hidden md:table-cell">{fmt(data.reduce((s, r) => s + r.impressions, 0))}</td>
              <td className="py-3 text-right hidden md:table-cell">{fmt(data.reduce((s, r) => s + r.clicks, 0))}</td>
              <td className="py-3 text-right hidden lg:table-cell">—</td>
              <td className="py-3 text-right text-[#1C4E89]">{data.reduce((s, r) => s + r.leads, 0)}</td>
              <td className="py-3 text-right">{fmt(data.reduce((s, r) => s + r.spend, 0) / Math.max(data.reduce((s, r) => s + r.leads, 0), 1), "€")}</td>
              <td className="py-3 text-right hidden md:table-cell">{data.reduce((s, r) => s + r.dealsWon, 0)}</td>
              <td className="py-3 text-right hidden lg:table-cell">—</td>
              <td className="py-3 text-right hidden lg:table-cell">—</td>
            </tr>
          </tfoot>
        </table>
      </CardContent>
    </Card>
  );
}
