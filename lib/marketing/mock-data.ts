/**
 * Mock data for the Marketing Dashboard.
 *
 * TODO: When ready to connect real APIs, replace imports in the page files:
 *   - import { getKPIs } from "@/lib/marketing/mock-data"
 *   + import { getKPIs } from "@/lib/marketing/providers/google-ads"
 *
 * Each function returns data matching the shape the real API provider will return.
 */

import type {
  KPI,
  ChannelMetrics,
  Campaign,
  PipelineStage,
  WeeklyTrend,
  DailyAnalytics,
  LandingPage,
  TrafficSource,
  ConversionStep,
} from "./types";

export function getKPIs(): KPI[] {
  return [
    { label: "Συνολική Δαπάνη", value: 12450, previousValue: 11200, prefix: "€", invertTrend: true },
    { label: "Νέα Leads", value: 142, previousValue: 118 },
    { label: "CPL", value: 87.68, previousValue: 94.92, prefix: "€", invertTrend: true },
    { label: "CAC", value: 415.00, previousValue: 466.67, prefix: "€", invertTrend: true },
    { label: "Pipeline Value", value: 89500, previousValue: 72300, prefix: "€" },
    { label: "Won Revenue", value: 34200, previousValue: 28000, prefix: "€" },
  ];
}

export function getChannelData(): ChannelMetrics[] {
  return [
    {
      channel: "Google Ads",
      spend: 7200,
      impressions: 245000,
      clicks: 8900,
      leads: 82,
      dealsWon: 18,
      revenue: 21600,
    },
    {
      channel: "Meta Ads",
      spend: 5250,
      impressions: 380000,
      clicks: 12400,
      leads: 48,
      dealsWon: 9,
      revenue: 10800,
    },
    {
      channel: "Organic",
      spend: 0,
      impressions: 0,
      clicks: 0,
      leads: 12,
      dealsWon: 3,
      revenue: 1800,
    },
  ];
}

export function getCampaignData(): Campaign[] {
  return [
    { name: "Building Management - Search", platform: "google", spend: 2800, impressions: 45000, clicks: 3200, leads: 32 },
    { name: "Facility Services - Display", platform: "google", spend: 1900, impressions: 120000, clicks: 2800, leads: 18 },
    { name: "Smart Building Solutions", platform: "google", spend: 1500, impressions: 38000, clicks: 1900, leads: 20 },
    { name: "Brand Awareness - Video", platform: "meta", spend: 2100, impressions: 185000, clicks: 5200, leads: 15 },
    { name: "Lead Gen - Property Managers", platform: "meta", spend: 1800, impressions: 95000, clicks: 4100, leads: 22 },
    { name: "Retargeting - Website Visitors", platform: "meta", spend: 850, impressions: 62000, clicks: 1800, leads: 8 },
    { name: "Energy Efficiency Campaign", platform: "google", spend: 1000, impressions: 42000, clicks: 1000, leads: 12 },
    { name: "Lookalike - Existing Clients", platform: "meta", spend: 500, impressions: 38000, clicks: 1300, leads: 3 },
  ];
}

export function getPipelineData(): PipelineStage[] {
  return [
    { stage: "Lead", count: 142, value: 142000 },
    { stage: "Qualified", count: 89, value: 106800 },
    { stage: "Proposal", count: 45, value: 67500 },
    { stage: "Negotiation", count: 22, value: 44000 },
    { stage: "Won", count: 30, value: 34200 },
  ];
}

export function getWeeklyTrends(): WeeklyTrend[] {
  return [
    { week: "Εβδ 1", spend: 2800, leads: 28, cpl: 100.0 },
    { week: "Εβδ 2", spend: 3100, leads: 34, cpl: 91.2 },
    { week: "Εβδ 3", spend: 2950, leads: 31, cpl: 95.2 },
    { week: "Εβδ 4", spend: 3200, leads: 38, cpl: 84.2 },
    { week: "Εβδ 5", spend: 2700, leads: 29, cpl: 93.1 },
    { week: "Εβδ 6", spend: 3400, leads: 42, cpl: 81.0 },
    { week: "Εβδ 7", spend: 3100, leads: 36, cpl: 86.1 },
    { week: "Εβδ 8", spend: 2900, leads: 33, cpl: 87.9 },
    { week: "Εβδ 9", spend: 3300, leads: 40, cpl: 82.5 },
    { week: "Εβδ 10", spend: 3050, leads: 35, cpl: 87.1 },
    { week: "Εβδ 11", spend: 3500, leads: 44, cpl: 79.5 },
    { week: "Εβδ 12", spend: 3450, leads: 42, cpl: 82.1 },
  ];
}

export function getAnalyticsOverview(): { kpis: KPI[]; daily: DailyAnalytics[] } {
  const daily: DailyAnalytics[] = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const base = isWeekend ? 120 : 280;
    return {
      date: `${date.getDate()}/${date.getMonth() + 1}`,
      sessions: base + Math.floor(Math.random() * 80),
      users: Math.floor((base + Math.floor(Math.random() * 80)) * 0.7),
      bounceRate: 35 + Math.random() * 15,
      avgDuration: 90 + Math.random() * 60,
    };
  });

  const totalSessions = daily.reduce((s, d) => s + d.sessions, 0);
  const totalUsers = daily.reduce((s, d) => s + d.users, 0);
  const avgBounce = daily.reduce((s, d) => s + d.bounceRate, 0) / daily.length;
  const avgDuration = daily.reduce((s, d) => s + d.avgDuration, 0) / daily.length;

  return {
    kpis: [
      { label: "Sessions", value: totalSessions, previousValue: Math.floor(totalSessions * 0.88) },
      { label: "Users", value: totalUsers, previousValue: Math.floor(totalUsers * 0.85) },
      { label: "Bounce Rate", value: Math.round(avgBounce * 10) / 10, previousValue: Math.round((avgBounce + 3) * 10) / 10, suffix: "%", invertTrend: true },
      { label: "Μέσος Χρόνος", value: Math.round(avgDuration), previousValue: Math.round(avgDuration - 8), suffix: "s" },
    ],
    daily,
  };
}

export function getTrafficSources(): TrafficSource[] {
  return [
    { source: "Organic Search", sessions: 3200, percentage: 38, color: "#7BCFB5" },
    { source: "Paid Search", sessions: 2100, percentage: 25, color: "#1C4E89" },
    { source: "Social", sessions: 1500, percentage: 18, color: "#00B1C9" },
    { source: "Direct", sessions: 1100, percentage: 13, color: "#F39257" },
    { source: "Referral", sessions: 500, percentage: 6, color: "#9333ea" },
  ];
}

export function getLandingPages(): LandingPage[] {
  return [
    { path: "/", sessions: 2800, users: 2100, bounceRate: 32.5, conversionRate: 4.2 },
    { path: "/ypiresies", sessions: 1450, users: 1100, bounceRate: 28.1, conversionRate: 6.8 },
    { path: "/epikoinonia", sessions: 980, users: 820, bounceRate: 22.3, conversionRate: 12.5 },
    { path: "/proionta", sessions: 870, users: 680, bounceRate: 35.7, conversionRate: 3.9 },
    { path: "/blog/building-management", sessions: 650, users: 540, bounceRate: 45.2, conversionRate: 2.1 },
    { path: "/times", sessions: 520, users: 410, bounceRate: 18.9, conversionRate: 8.7 },
    { path: "/blog/energy-savings", sessions: 380, users: 310, bounceRate: 42.8, conversionRate: 1.8 },
    { path: "/about", sessions: 290, users: 230, bounceRate: 38.5, conversionRate: 1.2 },
  ];
}

export function getConversionFunnel(): ConversionStep[] {
  return [
    { step: "Page Views", count: 8400 },
    { step: "Form Views", count: 1680 },
    { step: "Form Starts", count: 504 },
    { step: "Form Submits", count: 142 },
  ];
}
