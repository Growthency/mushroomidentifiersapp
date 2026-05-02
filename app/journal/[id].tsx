import { View, Text, Image, ScrollView, Pressable, Alert } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, MapPin, Trash2 } from "lucide-react-native";
import { Screen, Card, EdibilityBadge, Button } from "@/components/ui";
import { supabase } from "@/lib/supabase";
import type { JournalEntry } from "@/types";
import { formatDate } from "@/lib/utils";

export default function JournalDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["journal-entry", id],
    queryFn: async () => {
      const { data } = await supabase.from("journal_entries").select("*").eq("id", id!).single();
      return data as JournalEntry | null;
    },
    enabled: !!id,
  });

  const remove = () =>
    Alert.alert("Delete entry?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await supabase.from("journal_entries").delete().eq("id", id!);
          router.back();
        },
      },
    ]);

  if (isLoading || !data) {
    return (
      <Screen>
        <Text className="text-forest-700">Loading…</Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-2 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      {data.photos[0] && (
        <Image source={{ uri: data.photos[0] }} style={{ width: "100%", height: 240, borderRadius: 16 }} />
      )}

      <Text className="mt-3 font-display text-2xl font-bold text-forest-900">{data.title}</Text>
      {data.scientific_name && (
        <Text className="text-base italic text-forest-700">{data.scientific_name}</Text>
      )}

      <View className="mt-2 flex-row flex-wrap gap-2">
        {data.edibility && <EdibilityBadge edibility={data.edibility} />}
      </View>

      {data.location_name && (
        <Card className="mt-4 flex-row items-center gap-3">
          <MapPin size={16} color="#4A7C2A" />
          <View>
            <Text className="font-semibold text-forest-900">{data.location_name}</Text>
            <Text className="text-xs text-forest-700">Found {formatDate(data.found_at)}</Text>
          </View>
        </Card>
      )}

      {data.notes && (
        <Card className="mt-3">
          <Text className="font-bold text-forest-900">Notes</Text>
          <Text className="mt-1 text-sm text-forest-800">{data.notes}</Text>
        </Card>
      )}

      <Button
        variant="ghost"
        className="mt-6"
        icon={<Trash2 size={16} color="#8E1E1E" />}
        onPress={remove}
      >
        <Text className="font-semibold text-toxic-700">Delete entry</Text>
      </Button>
    </Screen>
  );
}
