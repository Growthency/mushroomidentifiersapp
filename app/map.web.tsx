// Web stub — react-native-maps is iOS/Android only. On web we show a friendly
// "open on phone" placeholder instead of trying to bundle the native module.
import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, MapPin } from "lucide-react-native";

export default function MapScreenWeb() {
  return (
    <View className="flex-1 items-center justify-center bg-forest-50 px-6">
      <Pressable
        onPress={() => router.back()}
        className="absolute left-5 top-12 flex-row items-center gap-1"
      >
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>
      <MapPin size={48} color="#4A7C2A" />
      <Text className="mt-4 text-center font-display text-xl font-bold text-forest-900">
        Foraging map is mobile-only
      </Text>
      <Text className="mt-2 text-center text-sm text-forest-700">
        Open Mushroom Identifiers on your Android or iOS device to view your
        saved finds on a real map.
      </Text>
    </View>
  );
}
