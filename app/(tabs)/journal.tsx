import { useState } from "react";
import { View, Text, Pressable, FlatList, Image, RefreshControl } from "react-native";
import { router } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { MapPin, Star } from "lucide-react-native";
import { Screen, Card, Badge, EdibilityBadge } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { formatRelative } from "@/lib/utils";
import type { JournalEntry } from "@/types";

export default function Journal() {
  const userId = useAuthStore((s) => s.user?.id);
  const [view, setView] = useState<"list" | "map">("list");

  const { data, isFetching, refetch } = useQuery({
    queryKey: ["journal", userId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId!)
        .order("found_at", { ascending: false });
      if (error) throw error;
      return data as JournalEntry[];
    },
    enabled: !!userId,
  });

  return (
    <Screen scroll={false}>
      <View className="mt-2 flex-row items-center justify-between">
        <View>
          <Text className="font-display text-2xl font-bold text-forest-900">Field Journal</Text>
          <Text className="text-sm text-forest-700">Every find. Every habitat. Every story.</Text>
        </View>
        <Pressable
          onPress={() => router.push("/map")}
          className="flex-row items-center gap-1.5 rounded-full bg-forest-100 px-3 py-2"
        >
          <MapPin size={14} color="#4A7C2A" />
          <Text className="text-sm font-semibold text-forest-700">Map</Text>
        </Pressable>
      </View>

      <View className="mt-4 flex-row gap-2">
        {(["list", "map"] as const).map((v) => (
          <Pressable
            key={v}
            onPress={() => setView(v)}
            className={`rounded-full px-4 py-2 ${view === v ? "bg-forest-700" : "bg-white"}`}
          >
            <Text className={`text-sm font-semibold ${view === v ? "text-white" : "text-forest-700"}`}>
              {v === "list" ? "Recent finds" : "On the map"}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        className="mt-3"
        data={data ?? []}
        keyExtractor={(e) => e.id}
        contentContainerStyle={{ paddingBottom: 80, gap: 10 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />}
        renderItem={({ item }) => (
          <Pressable onPress={() => router.push(`/journal/${item.id}`)}>
            <Card>
              <View className="flex-row gap-3">
                {item.photos[0] ? (
                  <Image
                    source={{ uri: item.photos[0] }}
                    style={{ width: 72, height: 72, borderRadius: 12 }}
                  />
                ) : (
                  <View className="h-[72px] w-[72px] items-center justify-center rounded-xl bg-forest-100">
                    <Text className="text-3xl">🍄</Text>
                  </View>
                )}
                <View className="flex-1 gap-1">
                  <View className="flex-row items-center gap-2">
                    <Text className="flex-1 font-semibold text-forest-900" numberOfLines={1}>
                      {item.title}
                    </Text>
                    {item.is_favorite && <Star size={14} color="#D2691E" fill="#D2691E" />}
                  </View>
                  {item.scientific_name && (
                    <Text className="text-xs italic text-forest-700">{item.scientific_name}</Text>
                  )}
                  <View className="flex-row flex-wrap gap-1.5">
                    {item.edibility && <EdibilityBadge edibility={item.edibility} />}
                    {item.location_name && <Badge label={item.location_name} tone="neutral" />}
                    <Badge label={formatRelative(item.found_at)} tone="info" />
                  </View>
                </View>
              </View>
            </Card>
          </Pressable>
        )}
        ListEmptyComponent={
          <View className="mt-12 items-center gap-3">
            <Text className="text-5xl">📓</Text>
            <Text className="text-center text-forest-700">
              No entries yet.{"\n"}Save scans here to start your field journal.
            </Text>
          </View>
        }
      />
    </Screen>
  );
}
