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
