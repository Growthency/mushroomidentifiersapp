/**
 * Fetches the canonical iNaturalist default photo for a taxon.
 * Cached per-id via React Query so we hit iNat at most once per session per
 * mushroom. Used to give every encyclopedia entry a real image without
 * pre-baking 50+ URLs into the seed data.
 */
import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.inaturalist.org/v1";

async function fetchTaxonPhoto(taxonId: number): Promise<string | null> {
  try {
    const r = await fetch(`${BASE}/taxa/${taxonId}`);
    if (!r.ok) return null;
    const json = (await r.json()) as {
      results: { default_photo?: { medium_url?: string; square_url?: string } }[];
    };
    const photo = json.results[0]?.default_photo;
    return photo?.medium_url ?? photo?.square_url ?? null;
  } catch {
    return null;
  }
}

export function useTaxonPhoto(taxonId: number | null | undefined) {
  return useQuery({
    queryKey: ["taxon-photo", taxonId],
    queryFn: () => (taxonId ? fetchTaxonPhoto(taxonId) : Promise.resolve(null)),
    enabled: !!taxonId,
    staleTime: 24 * 60 * 60_000, // 24h
    gcTime: 7 * 24 * 60 * 60_000,
  });
}
