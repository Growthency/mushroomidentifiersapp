import { View, Text, Image, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BookOpen, AlertTriangle } from "lucide-react-native";

import { Card, Screen, Badge, EdibilityBadge, Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { getTaxonByScientificName } from "@/lib/inaturalist";
import { useTaxonPhoto } from "@/hooks/useTaxonPhoto";
import type { Mushroom } from "@/types";

export default function MushroomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["mushroom", id],
    queryFn: async (): Promise<Mushroom | null> => {
      if (id?.startsWith("inat-")) {
        const taxonId = id.replace("inat-", "");
        const r = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}`);
        const json = (await r.json()) as { results: any[] };
        const t = json.results[0];
        return t
          ? {
              id,
              scientific_name: t.name,
              common_names: t.preferred_common_name ? [t.preferred_common_name] : [],
              family: null,
              genus: null,
              edibility: "unknown",
              description: t.wikipedia_summary ?? null,
              habitat: null,
              season_months: [],
              toxicity_notes: null,
              lookalike_ids: [],
              photos: t.taxon_photos?.map((p: any) => p.photo.medium_url) ?? [],
              spore_print_color: null,
              cap_size_cm: null,
              region: null,
            }
          : null;
      }
      const { data: row } = await supabase.from("mushrooms").select("*").eq("id", id!).single();
      return (row as Mushroom | null) ?? null;
    },
    enabled: !!id,
  });

  if (isLoading || !data) {
    return (
      <Screen>
        <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
          <ArrowLeft size={18} color="#2D5016" />
          <Text className="font-semibold text-forest-700">Back</Text>
        </Pressable>
        <Text className="text-forest-700">{isLoading ? "Loading…" : "Not found."}</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-2 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <MushroomHero data={data} />

      <View className="mt-4">
        <Text className="font-display text-2xl font-bold text-forest-900">
          {data.common_names[0] ?? data.scientific_name}
        </Text>
        <Text className="text-base italic text-forest-700">{data.scientific_name}</Text>
        {data.family && <Text className="mt-1 text-sm text-forest-600">Family: {data.family}</Text>}
        <View className="mt-3 flex-row flex-wrap gap-2">
          <EdibilityBadge edibility={data.edibility} />
          {data.spore_print_color && <Badge label={`Spore: ${data.spore_print_color}`} tone="info" />}
          {data.region?.[0] && <Badge label={data.region[0]} tone="neutral" />}
        </View>
      </View>

      {data.description && (
        <Card className="mt-4">
          <View className="flex-row items-center gap-2">
            <BookOpen size={16} color="#4A7C2A" />
            <Text className="font-bold text-forest-900">Description</Text>
          </View>
          <Text className="mt-2 text-sm text-forest-800">{data.description}</Text>
        </Card>
      )}

      {data.habitat && (
        <Card className="mt-3">
          <Text className="font-bold text-forest-900">Habitat</Text>
          <Text className="mt-1 text-sm text-forest-800">{data.habitat}</Text>
        </Card>
      )}

      {data.toxicity_notes && (
        <Card className="mt-3 border-toxic-200 bg-toxic-50">
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={16} color="#8E1E1E" />
            <Text className="font-bold text-toxic-700">Toxicity</Text>
          </View>
          <Text className="mt-1 text-sm text-toxic-700">{data.toxicity_notes}</Text>
        </Card>
      )}

      <Button className="mt-6" onPress={() => router.push("/scan/capture")}>
        Identify a similar one
      </Button>
    </Screen>
  );
}

/** Hero image — uses stored photo if present, otherwise lazy-fetches iNaturalist. */
function MushroomHero({ data }: { data: Mushroom }) {
  const inatId =
    data.inaturalist_taxon_id ??
    (data.id.startsWith("inat-") ? Number(data.id.replace("inat-", "")) : null);
  const { data: fetchedPhoto } = useTaxonPhoto(data.photos[0] ? null : inatId);
  const uri = data.photos[0] ?? fetchedPhoto ?? null;
  if (!uri) return null;
  return (
    <Image
      source={{ uri }}
      className="w-full rounded-2xl"
      style={{ height: 240, backgroundColor: "#DCE9D2" }}
    />
  );
}
