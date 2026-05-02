import { useEffect, useState } from "react";
import { View, Text, Image, Pressable, Linking } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowLeft,
  BookOpen,
  AlertTriangle,
  Calendar,
  MapPin,
  Sparkles,
  Layers,
  Beaker,
  Leaf,
  Globe,
  ExternalLink,
  Ruler,
} from "lucide-react-native";

import { Card, Screen, Badge, EdibilityBadge, Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useTaxonPhoto } from "@/hooks/useTaxonPhoto";
import { edibilityColor, edibilityLabel } from "@/lib/utils";
import type { Mushroom } from "@/types";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/** Strip HTML tags + collapse whitespace from iNaturalist's wikipedia_summary. */
function cleanDescription(raw: string | null | undefined): string {
  if (!raw) return "";
  return raw
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

function riskLevel(edibility: string): { label: string; tone: "edible" | "warn" | "toxic" | "neutral" } {
  switch (edibility) {
    case "edible":
      return { label: "Low risk · safe with proper ID", tone: "edible" };
    case "edible_with_caution":
      return { label: "Moderate risk · cook fully, beware lookalikes", tone: "warn" };
    case "inedible":
      return { label: "Not for consumption", tone: "neutral" };
    case "poisonous":
      return { label: "High risk · do not consume", tone: "toxic" };
    case "deadly":
      return { label: "Extreme risk · life-threatening", tone: "toxic" };
    default:
      return { label: "Risk unknown · always verify", tone: "neutral" };
  }
}

export default function MushroomDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ["mushroom", id],
    queryFn: async (): Promise<Mushroom | null> => {
      // Local DB entries (UUID) — pull the rich, curated record.
      if (id && !id.startsWith("inat-")) {
        const { data: row } = await supabase.from("mushrooms").select("*").eq("id", id).single();
        return (row as Mushroom | null) ?? null;
      }

      // iNaturalist-sourced entries (e.g. from Trending or remote search) —
      // fetch the taxon, then try to enrich with our DB by scientific name so
      // edibility / toxicity / habitat aren't blank.
      const taxonId = id?.replace("inat-", "");
      const taxonRes = await fetch(`https://api.inaturalist.org/v1/taxa/${taxonId}`);
      if (!taxonRes.ok) return null;
      const taxonJson = (await taxonRes.json()) as { results: any[] };
      const t = taxonJson.results[0];
      if (!t) return null;

      const { data: enrichRow } = await supabase
        .from("mushrooms")
        .select("*")
        .ilike("scientific_name", t.name)
        .maybeSingle();
      const enriched = enrichRow as Mushroom | null;

      return {
        id: id!,
        scientific_name: t.name,
        common_names:
          enriched?.common_names && enriched.common_names.length > 0
            ? enriched.common_names
            : t.preferred_common_name
              ? [t.preferred_common_name]
              : [],
        family: enriched?.family ?? null,
        genus: enriched?.genus ?? null,
        edibility: enriched?.edibility ?? "unknown",
        description: enriched?.description ?? cleanDescription(t.wikipedia_summary),
        habitat: enriched?.habitat ?? null,
        season_months: enriched?.season_months ?? [],
        toxicity_notes: enriched?.toxicity_notes ?? null,
        lookalike_ids: enriched?.lookalike_ids ?? [],
        photos: t.taxon_photos?.map((p: any) => p.photo.medium_url) ?? [],
        spore_print_color: enriched?.spore_print_color ?? null,
        cap_size_cm: enriched?.cap_size_cm ?? null,
        region: enriched?.region ?? null,
        inaturalist_taxon_id: Number(taxonId) || null,
      };
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

  const cleanedDescription = cleanDescription(data.description);
  const risk = riskLevel(data.edibility);

  // Lookalikes — pull rows by id from our DB
  const lookalikes = useLookalikes(data.lookalike_ids);

  // Pros / cons derived from edibility + toxicity notes
  const { pros, cons } = derivePros(data);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-2 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <MushroomHero data={data} />

      {/* Title block */}
      <View className="mt-4">
        <Text className="font-display text-2xl font-bold text-forest-900">
          {data.common_names[0] ?? data.scientific_name}
        </Text>
        <Text className="text-base italic text-forest-700">{data.scientific_name}</Text>
        <View className="mt-3 flex-row flex-wrap gap-2">
          <EdibilityBadge edibility={data.edibility} />
          <Badge label={risk.label} tone={risk.tone} />
        </View>
      </View>

      {/* Quick facts */}
      <Card className="mt-4">
        <Text className="font-bold text-forest-900">Key features</Text>
        <View className="mt-2 gap-2">
          {data.family && <Fact icon={<Layers size={16} color="#4A7C2A" />} label="Family" value={data.family} />}
          {data.genus && <Fact icon={<Leaf size={16} color="#4A7C2A" />} label="Genus" value={data.genus} />}
          {data.spore_print_color && (
            <Fact icon={<Beaker size={16} color="#4A7C2A" />} label="Spore print" value={data.spore_print_color} />
          )}
          {data.cap_size_cm && data.cap_size_cm.length === 2 && (
            <Fact
              icon={<Ruler size={16} color="#4A7C2A" />}
              label="Cap size"
              value={`${data.cap_size_cm[0]}–${data.cap_size_cm[1]} cm`}
            />
          )}
          {data.season_months.length > 0 && (
            <Fact
              icon={<Calendar size={16} color="#4A7C2A" />}
              label="Season"
              value={data.season_months.map((m) => MONTHS[(m - 1 + 12) % 12]).join(", ")}
            />
          )}
        </View>
      </Card>

      {/* Description */}
      {cleanedDescription && (
        <Card className="mt-3">
          <View className="flex-row items-center gap-2">
            <BookOpen size={16} color="#4A7C2A" />
            <Text className="font-bold text-forest-900">Description</Text>
          </View>
          <Text className="mt-2 text-sm text-forest-800">{cleanedDescription}</Text>
        </Card>
      )}

      {/* Habitat */}
      {data.habitat && (
        <Card className="mt-3">
          <View className="flex-row items-center gap-2">
            <MapPin size={16} color="#4A7C2A" />
            <Text className="font-bold text-forest-900">Habitat & growth</Text>
          </View>
          <Text className="mt-1 text-sm text-forest-800">{data.habitat}</Text>
        </Card>
      )}

      {/* Distribution / regions */}
      {data.region && data.region.length > 0 && (
        <Card className="mt-3">
          <View className="flex-row items-center gap-2">
            <Globe size={16} color="#4A7C2A" />
            <Text className="font-bold text-forest-900">Where it's found</Text>
          </View>
          <View className="mt-2 flex-row flex-wrap gap-2">
            {data.region.map((r) => (
              <Badge key={r} label={r} tone="info" />
            ))}
          </View>
        </Card>
      )}

      {/* Toxicity */}
      {data.toxicity_notes && (
        <Card className="mt-3 border-toxic-200 bg-toxic-50">
          <View className="flex-row items-center gap-2">
            <AlertTriangle size={16} color="#8E1E1E" />
            <Text className="font-bold text-toxic-700">Toxicity & safety</Text>
          </View>
          <Text className="mt-1 text-sm text-toxic-700">{data.toxicity_notes}</Text>
        </Card>
      )}

      {/* Pros & Cons */}
      {(pros.length > 0 || cons.length > 0) && (
        <View className="mt-3 flex-row gap-2">
          {pros.length > 0 && (
            <Card className="flex-1 border-edible-500/30 bg-edible-500/5">
              <Text className="font-bold text-edible-600">Pros</Text>
              {pros.map((p) => (
                <Text key={p} className="mt-1 text-xs text-forest-800">
                  • {p}
                </Text>
              ))}
            </Card>
          )}
          {cons.length > 0 && (
            <Card className="flex-1 border-toxic-200 bg-toxic-50">
              <Text className="font-bold text-toxic-700">Cons</Text>
              {cons.map((c) => (
                <Text key={c} className="mt-1 text-xs text-toxic-700">
                  • {c}
                </Text>
              ))}
            </Card>
          )}
        </View>
      )}

      {/* Similar species (lookalikes) */}
      {lookalikes.length > 0 && (
        <View className="mt-3">
          <Text className="text-sm font-bold uppercase tracking-wider text-forest-600 mb-2">
            Similar species — verify before consuming
          </Text>
          {lookalikes.map((m) => (
            <Pressable key={m.id} onPress={() => router.push(`/mushroom/${m.id}`)}>
              <Card className="mt-2 flex-row items-center gap-3">
                <View
                  style={{ backgroundColor: edibilityColor(m.edibility) }}
                  className="h-10 w-10 items-center justify-center rounded-full"
                >
                  <Sparkles size={16} color="#fff" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold text-forest-900">
                    {m.common_names[0] ?? m.scientific_name}
                  </Text>
                  <Text className="text-xs italic text-forest-700">{m.scientific_name}</Text>
                  <Text className="mt-0.5 text-xs text-forest-600">{edibilityLabel(m.edibility)}</Text>
                </View>
              </Card>
            </Pressable>
          ))}
        </View>
      )}

      {/* External links */}
      {data.inaturalist_taxon_id && (
        <Pressable
          onPress={() =>
            Linking.openURL(`https://www.inaturalist.org/taxa/${data.inaturalist_taxon_id}`)
          }
          className="mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-forest-100 p-3"
        >
          <ExternalLink size={14} color="#4A7C2A" />
          <Text className="text-sm font-semibold text-forest-700">View on iNaturalist</Text>
        </Pressable>
      )}

      <Button className="mt-4" onPress={() => router.push("/scan/capture")}>
        Identify a similar one
      </Button>

      {/* Disclaimer */}
      <View className="mt-4 mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <Text className="text-xs text-amber-700">
          ⚠ Educational reference only. Never consume a wild mushroom based on app information
          alone — always confirm identification with a qualified local expert.
        </Text>
      </View>
    </Screen>
  );
}

function Fact({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <View className="flex-row items-start gap-2">
      <View className="mt-0.5">{icon}</View>
      <View className="flex-1">
        <Text className="text-xs uppercase tracking-wider text-forest-600">{label}</Text>
        <Text className="text-sm text-forest-900">{value}</Text>
      </View>
    </View>
  );
}

function MushroomHero({ data }: { data: Mushroom }) {
  const inatId =
    data.inaturalist_taxon_id ??
    (data.id.startsWith("inat-") ? Number(data.id.replace("inat-", "")) : null);
  const { data: fetchedPhoto } = useTaxonPhoto(
    data.photos[0] ? null : inatId,
    data.photos[0] ? null : data.scientific_name,
  );
  const uri = data.photos[0] ?? fetchedPhoto ?? null;
  if (!uri) {
    return (
      <View className="w-full items-center justify-center rounded-2xl bg-forest-100" style={{ height: 240 }}>
        <Text className="text-6xl">🍄</Text>
      </View>
    );
  }
  return (
    <Image
      source={{ uri }}
      className="w-full rounded-2xl"
      style={{ height: 240, backgroundColor: "#DCE9D2" }}
    />
  );
}

function useLookalikes(ids: string[]): Mushroom[] {
  const [items, setItems] = useState<Mushroom[]>([]);
  useEffect(() => {
    if (!ids || ids.length === 0) {
      setItems([]);
      return;
    }
    supabase
      .from("mushrooms")
      .select("*")
      .in("id", ids)
      .then(({ data }) => setItems((data ?? []) as Mushroom[]));
  }, [JSON.stringify(ids)]);
  return items;
}

function derivePros(data: Mushroom): { pros: string[]; cons: string[] } {
  const pros: string[] = [];
  const cons: string[] = [];

  if (data.edibility === "edible") {
    pros.push("Choice edible with proper identification");
    pros.push("Widely cooked in traditional cuisines");
  } else if (data.edibility === "edible_with_caution") {
    pros.push("Edible after thorough cooking");
    cons.push("Must avoid alcohol or other prep restrictions");
  } else if (data.edibility === "poisonous") {
    cons.push("Causes gastrointestinal or systemic illness");
  } else if (data.edibility === "deadly") {
    cons.push("Even small amounts can be fatal");
    cons.push("Symptoms may be delayed by hours or days");
  } else if (data.edibility === "inedible") {
    pros.push("May have medicinal or commercial use");
    cons.push("Not suitable for cooking — too tough or bitter");
  }

  if (data.region && data.region.length > 0) {
    pros.push(`Recognised across ${data.region.join(", ")}`);
  }
  if (data.toxicity_notes) {
    cons.push("Has toxicity considerations — read safety notes");
  }
  if (data.season_months.length > 0 && data.season_months.length < 6) {
    cons.push("Limited fruiting season");
  }

  return { pros, cons };
}
