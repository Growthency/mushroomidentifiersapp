import { View, Text, Pressable, RefreshControl } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, Trophy } from "lucide-react-native";
import { FlatList } from "react-native";
import { useQuery } from "@tanstack/react-query";

import { Screen, Card, Badge } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { evaluateAchievements } from "@/lib/achievements";
import { formatRelative } from "@/lib/utils";

export default function Achievements() {
  const userId = useAuthStore((s) => s.user?.id);

  const { data, isLoading, isFetching, refetch } = useQuery({
    queryKey: ["achievements", userId],
    queryFn: () => (userId ? evaluateAchievements(userId) : Promise.resolve([])),
    enabled: !!userId,
  });

  const items = data ?? [];
  const unlocked = items.filter((a) => a.unlocked).length;
  const total = items.length;

  return (
    <Screen scroll={false}>
      <Pressable onPress={() => router.back()} className="mb-2 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <View className="flex-row items-center gap-2">
        <Trophy size={22} color="#D2691E" />
        <Text className="font-display text-2xl font-bold text-forest-900">Achievements</Text>
      </View>
      <Text className="text-sm text-forest-700">
        {isLoading ? "Loading…" : `${unlocked} of ${total} unlocked`}
      </Text>

      <FlatList
        className="mt-4"
        data={items}
        keyExtractor={(a) => a.code}
        contentContainerStyle={{ paddingBottom: 40, gap: 10 }}
        refreshControl={<RefreshControl refreshing={isFetching} onRefresh={() => refetch()} />}
        renderItem={({ item }) => {
          const pct = item.target > 0 ? Math.min(100, Math.round((item.current / item.target) * 100)) : 0;
          return (
            <Card
              className={item.unlocked ? "border-amber-300" : ""}
              style={item.unlocked ? undefined : { opacity: 0.6 }}
            >
              <View className="flex-row items-center gap-3">
                <View
                  className={`h-12 w-12 items-center justify-center rounded-2xl ${
                    item.unlocked ? "bg-amber-100" : "bg-forest-100"
                  }`}
                >
                  <Text className="text-2xl">{item.icon}</Text>
                </View>
                <View className="flex-1">
                  <View className="flex-row items-center justify-between">
                    <Text className="font-semibold text-forest-900">{item.title}</Text>
                    {item.unlocked ? (
                      <Badge label="Unlocked" tone="warn" />
                    ) : (
                      <Text className="text-xs font-semibold text-forest-600">
                        {item.current}/{item.target}
                      </Text>
                    )}
                  </View>
                  <Text className="text-sm text-forest-700">{item.body}</Text>
                  {!item.unlocked && (
                    <View className="mt-2 h-1.5 overflow-hidden rounded-full bg-forest-100">
                      <View
                        className="h-full bg-forest-500"
                        style={{ width: `${pct}%` }}
                      />
                    </View>
                  )}
                  {item.unlocked && item.unlockedAt && (
                    <Text className="mt-1 text-xs text-forest-600">
                      Unlocked {formatRelative(item.unlockedAt)}
                    </Text>
                  )}
                </View>
              </View>
            </Card>
          );
        }}
      />
    </Screen>
  );
}
