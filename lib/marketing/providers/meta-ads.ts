/**
 * Meta (Facebook/Instagram) Marketing API provider.
 *
 * TODO: Use Meta Marketing API (Graph API).
 * - Authenticate with a long-lived access token or system user token.
 * - Fetch ad insights with fields: spend, impressions, clicks, actions.
 * - Use /act_{ad_account_id}/insights endpoint with date_preset or time_range.
 * - Map "actions" array (lead, purchase) to leads and dealsWon.
 */

import type { ChannelMetrics, Campaign } from "../types";

export function getChannelData(): ChannelMetrics[] {
  // TODO: Call Meta Marketing API — fetch account-level ad insights
  // with spend, impressions, clicks, and actions (leads, purchases).
  // Aggregate into a single ChannelMetrics entry for the "Meta Ads" channel.
  throw new Error("Not implemented: Meta Ads getChannelData");
}

export function getCampaignData(): Campaign[] {
  // TODO: Call Meta Marketing API — fetch campaign-level insights
  // from /act_{ad_account_id}/campaigns with insights fields.
  // Map each campaign to a Campaign object with platform: "meta".
  throw new Error("Not implemented: Meta Ads getCampaignData");
}
