import { useState, useMemo } from "react";
import { View, Text, Pressable, FlatList, Image, RefreshControl } from "react-native";
import { router } from "expo-router";
import { Search } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { Screen, Input, EdibilityBadge, Card } from "@/components/ui";
import { searchTaxa, type INatTaxon } from "@/lib/inaturalist";
import { supabase } from "@/lib/supabase";
import type { Mushroom } from "@/types";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "edible", label: "Edible" },
  { id: "edible_with_caution", label: "Caution" },
  { id: "poisonous", label: "Poisonous" },
  { id: "deadly", label: "Deadly" },
] as const;

export default function Library() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["id"]>("all");

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

      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={FILTERS}
        keyExtractor={(f) => f.id}
        contentContainerStyle={{ paddingVertical: 12, gap: 8 }}
        renderItem={({ item }) => (
          <Pressable
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
        )}
      />

      <FlatList
        data={items}
        keyExtractor={(m) => m.id}
        contentContainerStyle={{ paddingBottom: 80, gap: 10 }}
        refreshControl={
          <RefreshControl refreshing={local.isFetching} onRefresh={() => local.refetch()} />
        }
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/mushroom/${item.id}`)}>
            <Card className="flex-row gap-3">
              {item.photos[0] ? (
                <Image
                  source={{ uri: item.photos[0] }}
                  style={{ width: 64, height: 64, borderRadius: 12 }}
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
        )}
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
  };
}
