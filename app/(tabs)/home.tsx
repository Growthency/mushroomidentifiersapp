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
  BookOpen,
  Clock,
  ArrowRight,
} from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";
import { Image } from "expo-image";
import { Card, Screen, Button, Badge } from "@/components/ui";
import { AdBanner } from "@/components/ads/BannerAd";
import { RewardedAdButton } from "@/components/ads/RewardedAdButton";
import { useAuthStore } from "@/stores/authStore";
import { useCredits } from "@/hooks/useCredits";
import { getForagingForecast, type ForagingForecast } from "@/lib/weather";
import { getTrendingFungi } from "@/lib/inaturalist";
import { fetchLatestPosts } from "@/lib/blog";
import { config } from "@/lib/config";

export default function Home() {
  const user = useAuthStore((s) => s.user);
  const { data: credits } = useCredits();
  const [forecast, setForecast] = useState<ForagingForecast | null>(null);
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(null);

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const c = { lat: loc.coords.latitude, lon: loc.coords.longitude };
      setCoords(c);
      const f = await getForagingForecast(c.lat, c.lon).catch(() => null);
      setForecast(f);
    })();
  }, []);

  // Real trending data from iNaturalist — top 3 fungi spotted near user in last 14 days.
  const trending = useQuery({
    queryKey: ["trending", coords?.lat?.toFixed(2), coords?.lon?.toFixed(2)],
    queryFn: () =>
      coords ? getTrendingFungi({ lat: coords.lat, lon: coords.lon, limit: 20 }) : Promise.resolve([]),
    enabled: !!coords,
    staleTime: 30 * 60_000, // 30 min
  });

  // Latest 3 blog posts — same DB as the website, so new content auto-appears.
  const blog = useQuery({
    queryKey: ["home-blog"],
    queryFn: () => fetchLatestPosts(3),
    staleTime: 5 * 60_000,
  });

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
            onPress={() => router.push("/(tabs)/library?filter=poisonous")}
          />
          <QuickAction
            label="Achievements"
            icon={<Trophy size={20} color="#fff" />}
            color="#7F3C12"
            onPress={() => router.push("/achievements")}
          />
          <QuickAction
            label="Blog"
            icon={<BookOpen size={20} color="#fff" />}
            color="#2D5016"
            onPress={() => router.push("/blog")}
          />
        </View>
      </ScrollView>

      {/* Trending — real iNaturalist data, recent fungi observations near user */}
      <View className="mt-6 flex-row items-center gap-2">
        <TrendingUp size={16} color="#4A7C2A" />
        <Text className="text-sm font-bold uppercase tracking-wider text-forest-600">
          Trending in your region
        </Text>
      </View>

      {!coords && (
        <Card className="mt-2">
          <Text className="text-sm text-forest-700">
            Enable location to see what's fruiting near you.
          </Text>
        </Card>
      )}

      {coords && trending.isLoading && (
        <Card className="mt-2">
          <Text className="text-sm text-forest-700">Loading trending species…</Text>
        </Card>
      )}

      {coords && !trending.isLoading && (trending.data ?? []).length === 0 && (
        <Card className="mt-2">
          <Text className="font-semibold text-forest-900">Quiet around here</Text>
          <Text className="text-sm text-forest-700">
            No recent fungi observations within 100 km. Try expanding your foraging radius or check
            back after the next rain.
          </Text>
        </Card>
      )}

      {(trending.data ?? []).map((row) => (
        <Pressable key={row.taxon.id} onPress={() => router.push(`/mushroom/inat-${row.taxon.id}`)}>
          <Card className="mt-2 flex-row items-center gap-3">
            {row.taxon.default_photo?.square_url ? (
              <Image
                source={{ uri: row.taxon.default_photo.square_url }}
                style={{ width: 48, height: 48, borderRadius: 8 }}
              />
            ) : (
              <View className="h-12 w-12 items-center justify-center rounded-lg bg-forest-100">
                <Text className="text-xl">🍄</Text>
              </View>
            )}
            <View className="flex-1">
              <Text className="font-semibold text-forest-900" numberOfLines={1}>
                {row.taxon.preferred_common_name ?? row.taxon.name}
              </Text>
              <Text className="text-xs italic text-forest-700">{row.taxon.name}</Text>
              <Text className="mt-0.5 text-xs text-forest-600">
                {row.count} sightings · last 14 days
              </Text>
            </View>
          </Card>
        </Pressable>
      ))}

      <Button variant="secondary" className="mt-6" onPress={() => router.push("/(tabs)/library")}>
        Explore the encyclopedia
      </Button>

      {/* Field journal — latest blog posts pulled live from the website DB */}
      <View className="mt-8 flex-row items-center justify-between">
        <View className="flex-row items-center gap-2">
          <BookOpen size={16} color="#4A7C2A" />
          <Text className="text-sm font-bold uppercase tracking-wider text-forest-600">
            From the field journal
          </Text>
        </View>
        <Pressable onPress={() => router.push("/blog")} hitSlop={8} className="flex-row items-center gap-1">
          <Text className="text-xs font-semibold text-forest-700">View all</Text>
          <ArrowRight size={12} color="#4A7C2A" />
        </Pressable>
      </View>

      {blog.isLoading && (
        <Card className="mt-2">
          <Text className="text-sm text-forest-700">Loading latest articles…</Text>
        </Card>
      )}

      {!blog.isLoading && (blog.data ?? []).length === 0 && (
        <Card className="mt-2">
          <Text className="text-sm text-forest-700">
            New field notes are added every week. Check back soon.
          </Text>
        </Card>
      )}

      {(blog.data ?? []).map((post) => {
        const slug = post.slug.startsWith("/") ? post.slug.slice(1) : post.slug;
        return (
          <Pressable key={post.id} onPress={() => router.push(`/blog/${slug}`)}>
            <Card className="mt-2 flex-row items-center gap-3 overflow-hidden">
              {post.featured_image ? (
                <Image
                  source={{ uri: post.featured_image }}
                  style={{ width: 64, height: 64, borderRadius: 10, backgroundColor: "#E6EFDB" }}
                  contentFit="cover"
                />
              ) : (
                <View className="h-16 w-16 items-center justify-center rounded-xl bg-forest-100">
                  <BookOpen size={22} color="#4A7C2A" />
                </View>
              )}
              <View className="flex-1">
                <Text
                  className="font-display text-sm font-bold leading-snug text-forest-900"
                  numberOfLines={2}
                >
                  {post.title}
                </Text>
                <View className="mt-1 flex-row items-center gap-2">
                  {post.category && (
                    <Text className="text-[10px] font-bold uppercase tracking-wider text-forest-600">
                      {post.category}
                    </Text>
                  )}
                  {post.read_time ? (
                    <View className="flex-row items-center gap-0.5">
                      <Clock size={9} color="#7A8B6A" />
                      <Text className="text-[10px] text-forest-600">{post.read_time} min</Text>
                    </View>
                  ) : null}
                </View>
              </View>
            </Card>
          </Pressable>
        );
      })}

      {/* Earn credits via rewarded ad — auto-hidden for premium */}
      <View className="mt-6">
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
