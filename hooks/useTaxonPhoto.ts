/**
 * Resolves a real photo for a mushroom from iNaturalist.
 * Tries the taxon-id endpoint first, then falls back to a name search if the
 * id is missing or returns no photo. Cached aggressively via React Query.
 */
import { useQuery } from "@tanstack/react-query";

const BASE = "https://api.inaturalist.org/v1";

async function lookupByTaxonId(taxonId: number): Promise<string | null> {
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

async function lookupByName(scientificName: string): Promise<string | null> {
  try {
    const r = await fetch(
      `${BASE}/taxa?q=${encodeURIComponent(scientificName)}&rank=species&iconic_taxa=Fungi&per_page=1`,
    );
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

export function useTaxonPhoto(
  taxonId: number | null | undefined,
  scientificName?: string | null,
) {
  return useQuery({
    queryKey: ["taxon-photo", taxonId ?? scientificName ?? null],
    queryFn: async () => {
      if (taxonId) {
        const photo = await lookupByTaxonId(taxonId);
        if (photo) return photo;
      }
      if (scientificName) {
        return await lookupByName(scientificName);
      }
      return null;
    },
    enabled: !!(taxonId || scientificName),
    staleTime: 24 * 60 * 60_000, // 24h
    gcTime: 7 * 24 * 60 * 60_000,
  });
}
