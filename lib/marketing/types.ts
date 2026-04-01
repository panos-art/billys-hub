export interface KPI {
  label: string;
  value: number;
  previousValue: number;
  prefix?: string;
  suffix?: string;
  /** When true, an increase is bad (e.g. spend going up) */
  invertTrend?: boolean;
}

export interface ChannelMetrics {
  channel: string;
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
  dealsWon: number;
  revenue: number;
}

export interface Campaign {
  name: string;
  platform: "google" | "meta";
  spend: number;
  impressions: number;
  clicks: number;
  leads: number;
}

export interface PipelineStage {
  stage: string;
  count: number;
  value: number;
}

export interface WeeklyTrend {
  week: string;
  spend: number;
  leads: number;
  cpl: number;
}

export interface DailyAnalytics {
  date: string;
  sessions: number;
  users: number;
  bounceRate: number;
  avgDuration: number;
}

export interface LandingPage {
  path: string;
  sessions: number;
  users: number;
  bounceRate: number;
  conversionRate: number;
}

export interface TrafficSource {
  source: string;
  sessions: number;
  percentage: number;
  color: string;
}

export interface ConversionStep {
  step: string;
  count: number;
}
