/**
 * Pipedrive CRM API provider.
 *
 * TODO: Use Pipedrive REST API v1.
 * - Authenticate with API token (stored in PIPEDRIVE_API_TOKEN env var).
 * - Base URL: https://api.pipedrive.com/v1/
 * - Fetch pipeline stages via GET /pipelines/{id}/deals with stage aggregation.
 * - Fetch deal source/utm fields for lead attribution data.
 */

import type { PipelineStage } from "../types";

export function getPipelineData(): PipelineStage[] {
  // TODO: Call Pipedrive API — GET /stages and GET /deals (filtered by pipeline).
  // For each stage, count deals and sum their weighted values.
  throw new Error("Not implemented: Pipedrive getPipelineData");
}

export function getLeadAttribution(): Record<string, number> {
  // TODO: Call Pipedrive API — GET /deals with custom field filters for
  // UTM source/medium/campaign. Aggregate deal counts by attribution source
  // to understand which marketing channels drive pipeline.
  throw new Error("Not implemented: Pipedrive getLeadAttribution");
}
