/**
 * Google Analytics 4 (GA4) Data API provider.
 *
 * TODO: Use Google Analytics Data API v1beta with a service account.
 * - Authenticate via @google-analytics/data client library with service account JSON key.
 * - Use runReport() method with appropriate dimensions and metrics.
 * - GA4 property ID should be stored in environment variable (GA4_PROPERTY_ID).
 */

import type {
  KPI,
  DailyAnalytics,
  TrafficSource,
  LandingPage,
  ConversionStep,
} from "../types";

export function getAnalyticsOverview(): { kpis: KPI[]; daily: DailyAnalytics[] } {
  // TODO: Call GA4 Data API — runReport with metrics: sessions, totalUsers,
  // bounceRate, averageSessionDuration. Use dateRanges for current vs previous period.
  // Daily breakdown using "date" dimension.
  throw new Error("Not implemented: GA4 getAnalyticsOverview");
}

export function getTrafficSources(): TrafficSource[] {
  // TODO: Call GA4 Data API — runReport with dimension "sessionDefaultChannelGroup"
  // and metric "sessions". Calculate percentages from totals.
  throw new Error("Not implemented: GA4 getTrafficSources");
}

export function getLandingPages(): LandingPage[] {
  // TODO: Call GA4 Data API — runReport with dimension "landingPagePlusQueryString"
  // and metrics: sessions, totalUsers, bounceRate, conversions.
  // Calculate conversionRate from conversions / sessions.
  throw new Error("Not implemented: GA4 getLandingPages");
}

export function getConversionFunnel(): ConversionStep[] {
  // TODO: Call GA4 Data API — runFunnelReport or runReport with event-based
  // dimensions (page_view, form_view, form_start, form_submit) to build
  // the conversion funnel steps.
  throw new Error("Not implemented: GA4 getConversionFunnel");
}
