import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";
import { Screen, Card } from "@/components/ui";

export default function MapScreen() {
  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <Text className="font-display text-2xl font-bold text-forest-900">Foraging map</Text>
      <Text className="text-sm text-forest-700">
        See your saved finds and crowd-sourced sightings in your region.
      </Text>

      <View className="mt-4 h-[500px] items-center justify-center rounded-2xl bg-forest-100">
        <MapPin size={36} color="#4A7C2A" />
        <Text className="mt-2 text-center font-semibold text-forest-800">
          Map view coming online once you set
        </Text>
        <Text className="text-center text-xs text-forest-700">
          EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_* in your .env
        </Text>
      </View>

      <Card className="mt-4">
        <Text className="font-semibold text-forest-900">Privacy</Text>
        <Text className="mt-1 text-sm text-forest-700">
          Your finds are private by default. You can choose to share specific entries with the
          community from the journal screen.
        </Text>
      </Card>
    </Screen>
  );
}
