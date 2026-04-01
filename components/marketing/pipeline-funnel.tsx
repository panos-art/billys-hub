import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PipelineStage } from "@/lib/marketing/types";

const stageColors = ["#1C4E89", "#00B1C9", "#F39257", "#9333ea", "#7BCFB5"];

export function PipelineFunnel({ data }: { data: PipelineStage[] }) {
  const maxCount = Math.max(...data.map((s) => s.count));
  const winRate = data.length >= 2
    ? ((data[data.length - 1].count / data[0].count) * 100).toFixed(1)
    : "0";

  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <CardTitle className="text-base">Pipeline (Pipedrive)</CardTitle>
        <span className="text-xs font-medium text-[#7BCFB5]">Win Rate: {winRate}%</span>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((stage, i) => {
            const widthPct = maxCount > 0 ? (stage.count / maxCount) * 100 : 0;
            const convRate = i < data.length - 1
              ? ((data[i + 1].count / stage.count) * 100).toFixed(0)
              : null;

            return (
              <div key={stage.stage}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{stage.stage}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-semibold">{stage.count}</span>
                    <span className="text-xs text-gray-400">€{(stage.value / 1000).toFixed(0)}K</span>
                  </div>
                </div>
                <div className="h-8 bg-gray-50 rounded-lg overflow-hidden relative">
                  <div
                    className="h-full rounded-lg transition-all duration-500 flex items-center px-3"
                    style={{ width: `${Math.max(widthPct, 8)}%`, backgroundColor: stageColors[i % stageColors.length] }}
                  >
                    {widthPct > 20 && (
                      <span className="text-white text-xs font-medium">{stage.count} deals</span>
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
  );
}
