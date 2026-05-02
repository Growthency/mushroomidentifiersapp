import { View, Text, Pressable, ScrollView } from "react-native";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import * as Location from "expo-location";
import {
  Sparkles,
  CloudRain,
  ShieldAlert,
  Phone,
  MessageCircle,
  Trophy,
  TrendingUp,
} from "lucide-react-native";
import { Card, Screen, Button, Badge } from "@/components/ui";
import { AdBanner } from "@/components/ads/BannerAd";
import { RewardedAdButton } from "@/components/ads/RewardedAdButton";
import { useAuthStore } from "@/stores/authStore";
import { useCredits } from "@/hooks/useCredits";
import { getForagingForecast, type ForagingForecast } from "@/lib/weather";
import { config } from "@/lib/config";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { data: credits } = useCredits();
  const [forecast, setForecast] = useState<ForagingForecast | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const f = await getForagingForecast(loc.coords.latitude, loc.coords.longitude).catch(() => null);
      setForecast(f);
    })();
  }, []);

  const greeting = (() => {
    const h = new Date().getHours();
    if (h < 12) return "Good morning";
    if (h < 18) return "Good afternoon";
    return "Good evening";
  })();

  const name = user?.user_metadata?.full_name?.split(" ")[0] ?? "Forager";

  return (
    <Screen>
      <View className="mt-4 flex-row items-center justify-between">
        <View>
          <Text className="text-sm text-forest-600">{greeting},</Text>
          <Text className="font-display text-2xl font-bold text-forest-900">{name}</Text>
        </View>
        <Pressable
          onPress={() => router.push("/paywall")}
          className="flex-row items-center gap-1.5 rounded-full bg-forest-100 px-3 py-2"
        >
          <Sparkles size={14} color="#4A7C2A" />
          <Text className="text-sm font-semibold text-forest-700">
            {credits?.total ?? 0} credits
          </Text>
        </Pressable>
      </View>

      {/* Hero scan CTA */}
      <Pressable onPress={() => router.push("/(tabs)/identify")} className="mt-6">
        <View className="overflow-hidden rounded-3xl bg-forest-700 p-5">
          <Text className="text-lg font-semibold text-forest-200">Identify a mushroom</Text>
          <Text className="mt-1 font-display text-2xl font-bold text-white">
            Multi-angle AI scan
          </Text>
          <Text className="mt-1 text-sm text-forest-100">
            Cap · Underside · Stem · Base — same approach experts use
          </Text>
          <View className="mt-4 flex-row gap-2">
            <Badge label={`${config.credits.perIdentification} credits`} tone="info" />
            <Badge label="10,000+ species" tone="info" />
          </View>
        </View>
      </Pressable>

      {/* Foraging forecast */}
      {forecast && (
        <Card className="mt-4">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <CloudRain size={20} color="#A85016" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-forest-900">Today's foraging conditions</Text>
              <Text className="mt-0.5 text-sm capitalize text-forest-700">
                {forecast.recommendation} · {forecast.conditionScore}/100
              </Text>
              <Text className="mt-1 text-xs text-forest-600">{forecast.reason}</Text>
            </View>
          </View>
        </Card>
      )}

      {/* Quick actions */}
      <Text className="mt-6 mb-2 text-sm font-bold uppercase tracking-wider text-forest-600">
        Quick actions
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="-mx-5 px-5">
        <View className="flex-row gap-3">
          <QuickAction
            label="AI Mycologist"
            icon={<MessageCircle size={20} color="#fff" />}
            color="#4A7C2A"
            onPress={() => router.push("/chat")}
          />
          <QuickAction
            label="Poison control"
            icon={<Phone size={20} color="#fff" />}
            color="#E03131"
            onPress={() => router.push("/emergency")}
          />
          <QuickAction
            label="Lookalike check"
            icon={<ShieldAlert size={20} color="#fff" />}
            color="#D2691E"
            onPress={() => router.push("/(tabs)/library?filter=lookalikes")}
          />
          <QuickAction
            label="Achievements"
            icon={<Trophy size={20} color="#fff" />}
            color="#7F3C12"
            onPress={() => router.push("/achievements")}
          />
        </View>
      </ScrollView>

      {/* Trending */}
      <View className="mt-6 flex-row items-center gap-2">
        <TrendingUp size={16} color="#4A7C2A" />
        <Text className="text-sm font-bold uppercase tracking-wider text-forest-600">
          Trending in your region
        </Text>
      </View>
      <Card className="mt-2">
        <Text className="font-semibold text-forest-900">Cantharellus cibarius</Text>
        <Text className="text-sm text-forest-700">Golden Chanterelle · 142 sightings this week</Text>
        <View className="mt-2 flex-row gap-2">
          <Badge label="Edible" tone="edible" />
          <Badge label="In season" tone="info" />
        </View>
      </Card>

      <Button variant="secondary" className="mt-6" onPress={() => router.push("/(tabs)/library")}>
        Explore the encyclopedia
      </Button>

      {/* Earn credits via rewarded ad — auto-hidden for premium */}
      <View className="mt-3">
        <RewardedAdButton />
      </View>

      {/* Banner ad — auto-hidden for premium */}
      <AdBanner className="mt-6" />
    </Screen>
  );
}

function QuickAction({
  label,
  icon,
  color,
  onPress,
}: {
  label: string;
  icon: React.ReactNode;
  color: string;
  onPress: () => void;
}) {
  return (
    <Pressable onPress={onPress} className="w-28 items-center gap-2">
      <View
        style={{ backgroundColor: color }}
        className="h-14 w-14 items-center justify-center rounded-2xl"
      >
        {icon}
      </View>
      <Text className="text-center text-xs font-semibold text-forest-800">{label}</Text>
    </Pressable>
  );
}
