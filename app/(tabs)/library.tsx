import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, FlatList, Image, RefreshControl, ScrollView } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { Search } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen, Input, EdibilityBadge, Card } from "@/components/ui";
import { searchTaxa, type INatTaxon } from "@/lib/inaturalist";
import { supabase } from "@/lib/supabase";
import { useTaxonPhoto } from "@/hooks/useTaxonPhoto";
import type { Mushroom } from "@/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "edible", label: "Edible" },
  { id: "edible_with_caution", label: "Caution" },
  { id: "poisonous", label: "Poisonous" },
  { id: "deadly", label: "Deadly" },
] as const;

export default function Library() {
  const params = useLocalSearchParams<{ filter?: string }>();
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

  // Honor `?filter=poisonous` etc. on initial mount (from quick actions on home)
  useEffect(() => {
    const incoming = params.filter;
    const valid = FILTERS.map((f) => f.id) as readonly string[];
    if (incoming && valid.includes(incoming)) {
      setFilter(incoming as (typeof FILTERS)[number]["id"]);
    }
  }, [params.filter]);

  const local = useQuery({
    queryKey: ["mushrooms", filter],
    queryFn: async () => {
      let q = supabase.from("mushrooms").select("*").order("scientific_name");
      if (filter !== "all") q = q.eq("edibility", filter);
      const { data, error } = await q.limit(200);
      if (error) throw error;
      return data as Mushroom[];
    },
  });

  const remote = useQuery({
    queryKey: ["inaturalist", query],
    queryFn: () => searchTaxa(query),
    enabled: query.trim().length > 1,
    staleTime: 5 * 60_000,
  });

  const items = useMemo(() => {
    const localFiltered = (local.data ?? []).filter((m) => {
      if (!query) return true;
      const q = query.toLowerCase();
      return (
        m.scientific_name.toLowerCase().includes(q) ||
        m.common_names.some((c) => c.toLowerCase().includes(q))
      );
    });
    if (localFiltered.length > 0 || !remote.data) return localFiltered;
    return remote.data.map(taxonToMushroom);
  }, [local.data, remote.data, query]);

  return (
    <Screen scroll={false}>
      <View className="mt-2">
        <Text className="font-display text-2xl font-bold text-forest-900">Mushroom Library</Text>
        <Text className="text-sm text-forest-700">10,000+ species at your fingertips</Text>
      </View>

      <View className="mt-4">
        <Input
          placeholder="Search by name, family, or feature"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
        />
      </View>

      {/* Filter pills — wrapped in ScrollView with fixed height to prevent
          Android list-in-list clipping that was hiding the pills earlier. */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ maxHeight: 56, marginVertical: 8 }}
        contentContainerStyle={{ alignItems: "center", gap: 8, paddingVertical: 6 }}
      >
        {FILTERS.map((item) => (
          <Pressable
            key={item.id}
            onPress={() => setFilter(item.id)}
            className={`rounded-full px-4 py-2 ${
              filter === item.id ? "bg-forest-700" : "bg-white"
            }`}
          >
            <Text
              className={`text-sm font-semibold ${
                filter === item.id ? "text-white" : "text-forest-700"
              }`}
            >
              {item.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <FlatList
        data={items}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 80, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={local.isFetching} onRefresh={() => local.refetch()} />
        }
        renderItem={({ item }) => <MushroomRow item={item} />}
        ListEmptyComponent={
          <View className="mt-12 items-center gap-2">
            <Search size={32} color="#6A9C4F" />
            <Text className="text-forest-700">No matches yet — try another term.</Text>
          </View>
        }
      />
    </Screen>
  );
}

function taxonToMushroom(t: INatTaxon): Mushroom {
  return {
    id: `inat-${t.id}`,
    scientific_name: t.name,
    common_names: t.preferred_common_name ? [t.preferred_common_name] : [],
    family: null,
    genus: null,
    edibility: "unknown",
    description: null,
    habitat: null,
    season_months: [],
    toxicity_notes: null,
    lookalike_ids: [],
    photos: t.default_photo ? [t.default_photo.medium_url] : [],
    spore_print_color: null,
    cap_size_cm: null,
    region: null,
    inaturalist_taxon_id: t.id,
  };
}

/**
 * Library row — shows the stored photo if we have one, otherwise lazy-fetches
 * the canonical iNaturalist photo using the taxon id. Falls back to the
 * mushroom emoji while loading or when nothing is found.
 */
function MushroomRow({ item }: { item: Mushroom }) {
  const inatId = item.inaturalist_taxon_id ?? null;
  const { data: fetchedPhoto } = useTaxonPhoto(item.photos[0] ? null : inatId);
  const uri = item.photos[0] ?? fetchedPhoto ?? null;

  return (
    <Pressable onPress={() => router.push(`/mushroom/${item.id}`)}>
      <Card className="flex-row gap-3">
        {uri ? (
          <Image
            source={{ uri }}
            style={{ width: 64, height: 64, borderRadius: 12, backgroundColor: "#DCE9D2" }}
          />
        ) : (
          <View className="h-16 w-16 items-center justify-center rounded-xl bg-forest-100">
            <Text className="text-2xl">🍄</Text>
          </View>
        )}
        <View className="flex-1 justify-center gap-1">
          <Text className="font-semibold text-forest-900">
            {item.common_names[0] ?? item.scientific_name}
          </Text>
          <Text className="text-xs italic text-forest-700">{item.scientific_name}</Text>
          <EdibilityBadge edibility={item.edibility} />
        </View>
      </Card>
    </Pressable>
  );
}
