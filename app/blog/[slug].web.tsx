/**
 * Web variant — uses an <iframe> instead of react-native-webview, which
 * doesn't ship a web build. Same data, same chrome.
 */
import { useMemo } from "react";
import { View, Text, Pressable, Share, ScrollView, ActivityIndicator } from "react-native";
import { Image } from "expo-image";
import { useLocalSearchParams, router, Stack } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Share2, ExternalLink, Clock, Eye, Lock } from "lucide-react-native";
import * as WebBrowser from "expo-web-browser";
import { Screen, Card, Badge, Button } from "@/components/ui";
import { fetchPostBySlug, webUrlForPost, type BlogPost } from "@/lib/blog";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

export default function BlogDetailWeb() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const isPro = useSubscriptionStore((s) => s.isPremium);

  const q = useQuery({
    queryKey: ["blog-post", slug],
    queryFn: () => fetchPostBySlug(slug!),
    enabled: !!slug,
    staleTime: 10 * 60_000,
  });

  const post = q.data;

  if (q.isLoading) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <BackBar />
        <View className="mt-20 items-center">
          <ActivityIndicator color="#4A7C2A" />
          <Text className="mt-3 text-sm text-forest-700">Loading article…</Text>
        </View>
      </Screen>
    );
  }

  if (q.error || !post) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <BackBar />
        <Card className="mt-6">
          <Text className="font-semibold text-forest-900">Couldn't load article</Text>
          <Button
            className="mt-3"
            variant="secondary"
            onPress={() =>
              WebBrowser.openBrowserAsync(`https://mushroomidentifiers.com/blog/${slug}`)
            }
          >
            Open on web
          </Button>
        </Card>
      </Screen>
    );
  }

  if (post.is_premium && !isPro) {
    return (
      <Screen>
        <Stack.Screen options={{ headerShown: false }} />
        <BackBar />
        <PostHeader post={post} />
        <Card className="mt-4 border border-amber-200 bg-amber-50">
          <View className="flex-row items-start gap-3">
            <View className="h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Lock size={20} color="#A85016" />
            </View>
            <View className="flex-1">
              <Text className="font-semibold text-amber-900">PRO article</Text>
              <Text className="mt-1 text-sm text-amber-800">
                {post.excerpt ?? "Unlock this in-depth guide with a Pro plan."}
              </Text>
              <Button className="mt-3" onPress={() => router.push("/paywall")}>
                See plans
              </Button>
            </View>
          </View>
        </Card>
      </Screen>
    );
  }

  return (
    <View className="flex-1 bg-forest-50">
      <Stack.Screen options={{ headerShown: false }} />
      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        <View className="px-5 pt-12">
          <BackBar post={post} />
        </View>

        {post.featured_image && (
          <Image
            source={{ uri: post.featured_image }}
            style={{ width: "100%", height: 220, marginTop: 12, backgroundColor: "#E6EFDB" }}
            contentFit="cover"
          />
        )}

        <View className="px-5 pt-4">
          <PostHeader post={post} />

          {/* Render the raw HTML — web supports dangerouslySetInnerHTML on a div via
              react-native-web. We sidestep that by using a hidden div wrapper. */}
          <div
            // @ts-expect-error — web-only DOM node, RN types don't model it.
            dangerouslySetInnerHTML={{ __html: post.content ?? "" }}
            style={{
              marginTop: 20,
              color: "#3d5c2a",
              fontSize: 16,
              lineHeight: 1.65,
              fontFamily:
                '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
            }}
          />

          <View className="mt-8 flex-row gap-2">
            <Button
              variant="secondary"
              className="flex-1"
              onPress={() => WebBrowser.openBrowserAsync(webUrlForPost(post))}
            >
              <View className="flex-row items-center gap-1.5">
                <ExternalLink size={14} color="#2D5016" />
                <Text className="font-semibold text-forest-900">Open on web</Text>
              </View>
            </Button>
            <Button
              variant="secondary"
              className="flex-1"
              onPress={() =>
                Share.share({
                  message: `${post.title}\n\n${webUrlForPost(post)}`,
                  url: webUrlForPost(post),
                  title: post.title,
                })
              }
            >
              <View className="flex-row items-center gap-1.5">
                <Share2 size={14} color="#2D5016" />
                <Text className="font-semibold text-forest-900">Share</Text>
              </View>
            </Button>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

function BackBar({ post }: { post?: BlogPost }) {
  return (
    <View className="flex-row items-center justify-between">
      <Pressable
        onPress={() => (router.canGoBack() ? router.back() : router.replace("/blog"))}
        hitSlop={12}
        className="h-10 w-10 items-center justify-center rounded-full bg-forest-100"
      >
        <ChevronLeft size={22} color="#2D5016" />
      </Pressable>
      {post && (
        <Pressable
          onPress={() => WebBrowser.openBrowserAsync(webUrlForPost(post))}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full bg-forest-100"
        >
          <ExternalLink size={18} color="#2D5016" />
        </Pressable>
      )}
    </View>
  );
}

function PostHeader({ post }: { post: BlogPost }) {
  return (
    <View>
      <View className="mb-3 flex-row flex-wrap gap-1.5">
        {post.category && <Badge label={post.category} tone="info" />}
        {post.region && post.region !== "Worldwide" && (
          <Badge label={`🌍 ${post.region}`} tone="neutral" />
        )}
        {post.risk_level && post.risk_level !== "low" && (
          <Badge
            label={`⚠️ ${post.risk_level} risk`}
            tone={post.risk_level === "high" ? "toxic" : "warn"}
          />
        )}
        {post.is_premium && (
          <View className="flex-row items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5">
            <Lock size={10} color="#A85016" />
            <Text className="text-xs font-semibold text-amber-800">PRO</Text>
          </View>
        )}
      </View>
      <Text className="font-display text-2xl font-bold leading-snug text-forest-900">
        {post.title}
      </Text>
      <View className="mt-3 flex-row items-center gap-3">
        {post.author_name && (
          <Text className="text-xs font-semibold text-forest-700">{post.author_name}</Text>
        )}
        {post.published_at && (
          <Text className="text-xs text-forest-600">{formatDate(post.published_at)}</Text>
        )}
        {post.read_time ? (
          <View className="flex-row items-center gap-1">
            <Clock size={11} color="#7A8B6A" />
            <Text className="text-xs text-forest-600">{post.read_time} min</Text>
          </View>
        ) : null}
        {post.views ? (
          <View className="flex-row items-center gap-1">
            <Eye size={11} color="#7A8B6A" />
            <Text className="text-xs text-forest-600">{compactNumber(post.views)}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
}

function formatDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function compactNumber(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}
