import { Badge } from "@/components/ui/badge";
import { KPIGrid } from "@/components/marketing/kpi-card";
import { ChannelTable } from "@/components/marketing/channel-table";
import { CampaignTable } from "@/components/marketing/campaign-table";
import { PipelineFunnel } from "@/components/marketing/pipeline-funnel";
import { SpendVsLeadsChart, CPLTrendChart, SpendDistributionChart } from "@/components/marketing/trend-charts";
import {
  getKPIs,
  getChannelData,
  getCampaignData,
  getPipelineData,
  getWeeklyTrends,
} from "@/lib/marketing/mock-data";

export default function AdsPage() {
  const kpis = getKPIs();
  const channels = getChannelData();
  const campaigns = getCampaignData();
  const pipeline = getPipelineData();
  const trends = getWeeklyTrends();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard Διαφημίσεων</h1>
          <p className="text-sm text-gray-500 mt-1">
            Απόδοση καμπανιών, leads & pipeline
          </p>
        </div>
        <Badge variant="warning" className="text-xs">Mock Data</Badge>
      </div>

      {/* KPI Cards */}
      <KPIGrid kpis={kpis} />

      {/* Channel Performance */}
      <ChannelTable data={channels} />

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendVsLeadsChart data={trends} />
        <CPLTrendChart data={trends} />
      </div>

      {/* Spend Distribution + Pipeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendDistributionChart data={channels} />
        <PipelineFunnel data={pipeline} />
      </div>

      {/* Campaigns */}
      <CampaignTable data={campaigns} />
    </div>
  );
}
