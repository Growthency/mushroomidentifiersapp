import { useState, useMemo, useEffect } from "react";
import { View, Text, Pressable, FlatList, RefreshControl, TextInput } from "react-native";
import { Image } from "expo-image";
import { router, Stack } from "expo-router";
import { ChevronLeft, Search, Clock, Eye, Lock } from "lucide-react-native";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Screen, Card, Badge } from "@/components/ui";
import { fetchPostsPage, type BlogPost } from "@/lib/blog";

const PAGE_SIZE = 15;

export default function BlogIndex() {
  const [search, setSearch] = useState("");
  const debounced = useDebounced(search, 350);

  const q = useInfiniteQuery({
    queryKey: ["blog-posts", debounced],
    queryFn: ({ pageParam = 0 }) =>
      fetchPostsPage({ page: pageParam, pageSize: PAGE_SIZE, search: debounced || null }),
    getNextPageParam: (last, all) => {
      const loaded = all.reduce((sum, p) => sum + p.rows.length, 0);
      return loaded < last.total ? all.length : undefined;
    },
    initialPageParam: 0,
    staleTime: 5 * 60_000,
  });

  const rows: BlogPost[] = useMemo(
    () => (q.data?.pages ?? []).flatMap((p) => p.rows),
    [q.data]
  );
  const total = q.data?.pages?.[0]?.total ?? 0;

  return (
    <Screen scroll={false}>
      <Stack.Screen options={{ headerShown: false }} />

      {/* Header */}
      <View className="mt-2 flex-row items-center gap-3">
        <Pressable
          onPress={() => router.back()}
          hitSlop={12}
          className="h-10 w-10 items-center justify-center rounded-full bg-forest-100"
        >
          <ChevronLeft size={22} color="#2D5016" />
        </Pressable>
        <View className="flex-1">
          <Text className="font-display text-2xl font-bold text-forest-900">Field journal</Text>
          <Text className="text-xs text-forest-600">
            {total > 0 ? `${total} guides & field notes` : "Loading…"}
          </Text>
        </View>
      </View>

      {/* Search */}
      <View className="mt-4 flex-row items-center gap-2 rounded-2xl border border-forest-200 bg-white px-3 py-2.5">
        <Search size={18} color="#4A7C2A" />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search articles…"
          placeholderTextColor="#7A8B6A"
          className="flex-1 text-forest-900"
          autoCorrect={false}
          returnKeyType="search"
        />
      </View>

      <FlatList
        data={rows}
        keyExtractor={(p) => String(p.id)}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 40 }}
        renderItem={({ item }) => <BlogRow post={item} />}
        ItemSeparatorComponent={() => <View className="h-3" />}
        ListEmptyComponent={
          !q.isLoading ? (
            <Card className="mt-4">
              <Text className="font-semibold text-forest-900">No articles found</Text>
              <Text className="mt-1 text-sm text-forest-700">
                {debounced
                  ? `Nothing matches "${debounced}". Try a broader keyword.`
                  : "Check back soon — new field notes are added every week."}
              </Text>
            </Card>
          ) : (
            <Card className="mt-4">
              <Text className="text-sm text-forest-700">Loading articles…</Text>
            </Card>
          )
        }
        onEndReachedThreshold={0.4}
        onEndReached={() => {
          if (q.hasNextPage && !q.isFetchingNextPage) q.fetchNextPage();
        }}
        refreshControl={
          <RefreshControl
            refreshing={q.isRefetching && !q.isFetchingNextPage}
            onRefresh={() => q.refetch()}
            tintColor="#4A7C2A"
          />
        }
        ListFooterComponent={
          q.isFetchingNextPage ? (
            <Text className="mt-4 text-center text-xs text-forest-600">Loading more…</Text>
          ) : null
        }
      />
    </Screen>
  );
}

function BlogRow({ post }: { post: BlogPost }) {
  const slug = post.slug.startsWith("/") ? post.slug.slice(1) : post.slug;
  return (
    <Pressable onPress={() => router.push(`/blog/${slug}`)}>
      <Card className="overflow-hidden p-0">
        {post.featured_image ? (
          <Image
            source={{ uri: post.featured_image }}
            style={{ width: "100%", height: 160, backgroundColor: "#E6EFDB" }}
            contentFit="cover"
          />
        ) : (
          <View className="h-40 items-center justify-center bg-forest-100">
            <Text className="text-3xl">🍄</Text>
          </View>
        )}
        <View className="p-4">
          <View className="mb-2 flex-row flex-wrap gap-1.5">
            {post.category && <Badge label={post.category} tone="info" />}
            {post.region && post.region !== "Worldwide" && (
              <Badge label={`🌍 ${post.region}`} tone="neutral" />
            )}
            {post.is_premium && (
              <View className="flex-row items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5">
                <Lock size={10} color="#A85016" />
                <Text className="text-xs font-semibold text-amber-800">PRO</Text>
              </View>
            )}
          </View>
          <Text className="font-display text-lg font-bold leading-snug text-forest-900" numberOfLines={2}>
            {post.title}
          </Text>
          {post.excerpt && (
            <Text className="mt-1 text-sm leading-snug text-forest-700" numberOfLines={2}>
              {post.excerpt}
            </Text>
          )}
          <View className="mt-3 flex-row items-center gap-3">
            <Text className="text-xs text-forest-600">{formatDate(post.published_at)}</Text>
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
      </Card>
    </Pressable>
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

/** Debounce helper — avoid pulling lodash for one use. */
function useDebounced<T>(value: T, ms: number): T {
  const [v, setV] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setV(value), ms);
    return () => clearTimeout(id);
  }, [value, ms]);
  return v;
}
