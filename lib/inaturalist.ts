/**
 * iNaturalist read-only API client — used for taxon search, photos, and
 * cross-referencing AI identifications against an authoritative database.
 */
import { config } from "./config";

const BASE = config.iNaturalist.base;

export type INatTaxon = {
  id: number;
  name: string; // scientific
  preferred_common_name?: string;
  rank: string;
  default_photo?: { medium_url: string; square_url: string };
  ancestry?: string;
  observations_count?: number;
};

export async function searchTaxa(query: string): Promise<INatTaxon[]> {
  if (!query.trim()) return [];
  const url = `${BASE}/taxa?q=${encodeURIComponent(query)}&rank=species,genus,family&iconic_taxa=Fungi&per_page=20`;
  const r = await fetch(url);
  if (!r.ok) throw new Error(`iNaturalist search failed: ${r.status}`);
  const json = (await r.json()) as { results: INatTaxon[] };
  return json.results;
}

export async function getTaxonByScientificName(scientificName: string): Promise<INatTaxon | null> {
  const url = `${BASE}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&iconic_taxa=Fungi&per_page=1`;
  const r = await fetch(url);
  if (!r.ok) return null;
  const json = (await r.json()) as { results: INatTaxon[] };
  return json.results[0] ?? null;
}

export async function getRegionalObservations(opts: {
  taxonId: number;
  lat: number;
  lon: number;
  radiusKm?: number;
}): Promise<{ count: number; latestObservedAt: string | null }> {
  const { taxonId, lat, lon, radiusKm = 50 } = opts;
  const url = `${BASE}/observations?taxon_id=${taxonId}&lat=${lat}&lng=${lon}&radius=${radiusKm}&per_page=1&order=desc&order_by=observed_on`;
  const r = await fetch(url);
  if (!r.ok) return { count: 0, latestObservedAt: null };
  const json = (await r.json()) as {
    total_results: number;
    results: { observed_on: string | null }[];
  };
  return {
    count: json.total_results,
    latestObservedAt: json.results[0]?.observed_on ?? null,
  };
}

/**
 * Trending fungi taxa near a coordinate over the last N days.
 * Uses iNaturalist's `species_counts` aggregation — fast, no auth.
 */
export type TrendingSpecies = {
  taxon: INatTaxon;
  count: number;
};

export async function getTrendingFungi(opts: {
  lat: number;
  lon: number;
  radiusKm?: number;
  days?: number;
  limit?: number;
}): Promise<TrendingSpecies[]> {
  const { lat, lon, radiusKm = 100, days = 14, limit = 5 } = opts;
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const url = `${BASE}/observations/species_counts?iconic_taxa=Fungi&lat=${lat}&lng=${lon}&radius=${radiusKm}&d1=${since}&per_page=${limit}&order=desc`;
  const r = await fetch(url);
  if (!r.ok) return [];
  const json = (await r.json()) as {
    results: { count: number; taxon: INatTaxon }[];
  };
  return json.results.map((row) => ({ taxon: row.taxon, count: row.count }));
}
