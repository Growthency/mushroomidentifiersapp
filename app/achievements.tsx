import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Trophy } from "lucide-react-native";
import { Screen, Card } from "@/components/ui";

const ACHIEVEMENTS = [
  { code: "first_id", title: "First steps", body: "Complete your first identification.", icon: "🌱" },
  { code: "ten_ids", title: "Curious forager", body: "Identify 10 species.", icon: "🔍" },
  { code: "hundred_ids", title: "Veteran", body: "Identify 100 species.", icon: "🧪" },
  { code: "edible_finder", title: "Choice cut", body: "Find 5 edible species.", icon: "🍳" },
  { code: "danger_spotter", title: "Sharp eye", body: "Identify 5 toxic lookalikes.", icon: "⚠️" },
  { code: "journal_keeper", title: "Field notes", body: "Save 25 journal entries.", icon: "📓" },
  { code: "explorer", title: "Range rover", body: "Find species in 5+ habitats.", icon: "🗺️" },
  { code: "early_bird", title: "Dewy dawn", body: "Scan before 7 AM.", icon: "🌅" },
  { code: "night_owl", title: "Lantern light", body: "Scan after 9 PM.", icon: "🌙" },
  { code: "weatherman", title: "Storm chaser", body: "Scan within 24h of heavy rain.", icon: "🌧️" },
];

export default function Achievements() {
  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <View className="flex-row items-center gap-2">
        <Trophy size={22} color="#D2691E" />
        <Text className="font-display text-2xl font-bold text-forest-900">Achievements</Text>
      </View>
      <Text className="text-sm text-forest-700">Earn badges as you forage.</Text>

      <View className="mt-4 gap-2">
        {ACHIEVEMENTS.map((a) => (
          <Card key={a.code} className="flex-row items-center gap-3">
            <View className="h-12 w-12 items-center justify-center rounded-2xl bg-forest-100">
              <Text className="text-2xl">{a.icon}</Text>
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-forest-900">{a.title}</Text>
              <Text className="text-sm text-forest-700">{a.body}</Text>
            </View>
          </Card>
        ))}
      </View>
    </Screen>
  );
}
