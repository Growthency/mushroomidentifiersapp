import { View, Text, Pressable, Linking, Platform, ScrollView } from "react-native";
import { router } from "expo-router";
import { Phone, ExternalLink, X } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Card, Button } from "@/components/ui";

const HOTLINES: { country: string; name: string; phone: string; url?: string }[] = [
  { country: "United States", name: "Poison Help Line", phone: "1-800-222-1222", url: "https://www.poisonhelp.org" },
  { country: "United Kingdom", name: "NHS 111", phone: "111" },
  { country: "Canada", name: "Provincial Poison Control", phone: "1-844-764-7669" },
  { country: "Australia", name: "Poisons Information Centre", phone: "13-11-26" },
  { country: "EU", name: "European Emergency Number", phone: "112" },
  { country: "India", name: "AIIMS Poison Centre, Delhi", phone: "+91-11-26593677" },
  { country: "Bangladesh", name: "Emergency", phone: "999" },
];

export default function Emergency() {
  const insets = useSafeAreaInsets();
  return (
    <View className="flex-1 bg-toxic-700">
      <View className="px-5" style={{ paddingTop: Math.max(insets.top, 16) + 16 }}>
        <View className="flex-row items-center justify-between">
          <Text className="font-display text-2xl font-bold text-white">Emergency</Text>
          <Pressable onPress={() => router.back()} className="h-10 w-10 items-center justify-center rounded-full bg-black/20">
            <X size={20} color="#fff" />
          </Pressable>
        </View>
        <Text className="mt-1 text-white/90">
          Suspected mushroom poisoning? Act fast.
        </Text>
      </View>

      <ScrollView
        className="flex-1 mt-5 rounded-t-3xl bg-forest-50"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        <Card className="border-toxic-200">
          <Text className="font-bold text-toxic-700">Immediate steps</Text>
          <View className="mt-2 gap-1">
            <Text className="text-sm text-forest-800">1. Stop eating immediately. Do not induce vomiting unless instructed.</Text>
            <Text className="text-sm text-forest-800">2. Save a sample of the mushroom (refrigerated, in paper).</Text>
            <Text className="text-sm text-forest-800">3. Note the time of consumption and symptom onset.</Text>
            <Text className="text-sm text-forest-800">4. Call your nearest poison control center.</Text>
            <Text className="text-sm text-forest-800">5. Take photos of the mushroom and any vomit/stool to the hospital.</Text>
          </View>
        </Card>

        <Text className="mt-5 mb-2 text-sm font-bold uppercase tracking-wider text-forest-600">
          Poison control hotlines
        </Text>
        <View className="gap-2">
          {HOTLINES.map((h) => (
            <Pressable
              key={h.country}
              onPress={() => Linking.openURL(`tel:${h.phone}`)}
              className="flex-row items-center gap-3 rounded-xl bg-white p-4 active:bg-forest-100"
            >
              <View className="h-10 w-10 items-center justify-center rounded-full bg-toxic-500">
                <Phone size={18} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-forest-900">{h.country}</Text>
                <Text className="text-xs text-forest-700">{h.name}</Text>
              </View>
              <Text className="font-bold text-toxic-700">{h.phone}</Text>
            </Pressable>
          ))}
        </View>

        <Button
          variant="secondary"
          className="mt-6"
          icon={<ExternalLink size={16} color="#2D5016" />}
          onPress={() => Linking.openURL("https://www.who.int/news-room/fact-sheets/detail/mycotoxins")}
        >
          WHO mushroom toxin reference
        </Button>
      </ScrollView>
    </View>
  );
}
