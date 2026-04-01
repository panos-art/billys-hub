/**
 * Google Ads API provider.
 *
 * TODO: Use Google Ads API v17 with OAuth2.
 * - Authenticate via google-ads-api client library with OAuth2 refresh token.
 * - Fetch campaign performance reports using GoogleAdsService.SearchStream.
 * - Map CampaignPerformance rows to ChannelMetrics and Campaign types.
 * - Aggregate spend, impressions, clicks, conversions across all campaigns
 *   for getChannelData().
 */

import type { ChannelMetrics, Campaign } from "../types";

export function getChannelData(): ChannelMetrics[] {
  // TODO: Call Google Ads API v17 — query campaign performance metrics
  // and aggregate into a single ChannelMetrics entry for the "Google Ads" channel.
  throw new Error("Not implemented: Google Ads getChannelData");
}

export function getCampaignData(): Campaign[] {
  // TODO: Call Google Ads API v17 — fetch individual campaign performance
  // reports with spend, impressions, clicks, and conversion (leads) data.
  throw new Error("Not implemented: Google Ads getCampaignData");
}
