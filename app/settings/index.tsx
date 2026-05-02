import { View, Text, Pressable, Linking, Switch } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react-native";
import { Screen, Card } from "@/components/ui";
import { config } from "@/lib/config";

export default function Settings() {
  const [hapticsOn, setHapticsOn] = useState(true);
  const [analyticsOn, setAnalyticsOn] = useState(true);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <Text className="font-display text-2xl font-bold text-forest-900">Settings</Text>

      <Card className="mt-4">
        <Toggle label="Haptic feedback" value={hapticsOn} onChange={setHapticsOn} />
        <View className="my-2 h-px bg-forest-100" />
        <Toggle label="Anonymous analytics" value={analyticsOn} onChange={setAnalyticsOn} />
      </Card>

      <Text className="mt-6 mb-2 text-sm font-bold uppercase tracking-wider text-forest-600">
        About
      </Text>
      <Card>
        <Row label="Visit website" url={config.website.url} />
        <View className="my-2 h-px bg-forest-100" />
        <Row label="Privacy policy" url={`${config.website.url}/privacy`} />
        <View className="my-2 h-px bg-forest-100" />
        <Row label="Terms of service" url={`${config.website.url}/terms`} />
        <View className="my-2 h-px bg-forest-100" />
        <Row label="Contact support" url={`${config.website.url}/contact`} />
      </Card>

      <Text className="mt-6 text-center text-xs text-forest-600">
        MushroomIdentifiers v1.0.0
      </Text>
    </Screen>
  );
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <Text className="text-base text-forest-900">{label}</Text>
      <Switch value={value} onValueChange={onChange} trackColor={{ true: "#4A7C2A", false: "#E5E7EB" }} />
    </View>
  );
}

function Row({ label, url }: { label: string; url: string }) {
  return (
    <Pressable onPress={() => Linking.openURL(url)} className="flex-row items-center justify-between py-2">
      <Text className="text-base text-forest-900">{label}</Text>
      <ExternalLink size={16} color="#6A9C4F" />
    </Pressable>
  );
}
