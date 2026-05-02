import { useEffect } from "react";
import { router } from "expo-router";
import { View, ActivityIndicator } from "react-native";

export default function IdentifyTab() {
  useEffect(() => {
    // Tab item just opens the modal scan flow
    router.replace("/scan/capture");
  }, []);
  return (
    <View className="flex-1 items-center justify-center bg-forest-50">
      <ActivityIndicator color="#4A7C2A" />
    </View>
  );
}
