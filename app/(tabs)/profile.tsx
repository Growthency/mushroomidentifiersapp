import { View, Text, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import {
  CreditCard,
  Settings as SettingsIcon,
  Trophy,
  HelpCircle,
  LogOut,
  Globe,
  Bell,
  Sparkles,
} from "lucide-react-native";
import { Screen, Card, Button } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";
import { useCredits } from "@/hooks/useCredits";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useEffect } from "react";

export default function Profile() {
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);
  const { data: credits } = useCredits();
  const { tier, isPremium, refresh } = useSubscriptionStore();

  useEffect(() => {
    refresh().catch(() => {});
  }, [refresh]);

  const confirmSignOut = () =>
    Alert.alert("Sign out?", "You'll need to log in again next time.", [
      { text: "Cancel", style: "cancel" },
      { text: "Sign out", style: "destructive", onPress: () => signOut().then(() => router.replace("/(auth)/welcome")) },
    ]);

  return (
    <Screen>
      <View className="mt-4">
        <Text className="font-display text-2xl font-bold text-forest-900">Profile</Text>
      </View>

      <Card className="mt-4">
        <View className="flex-row items-center gap-3">
          <View className="h-14 w-14 items-center justify-center rounded-full bg-forest-700">
            <Text className="text-xl font-bold text-white">
              {user?.email?.[0]?.toUpperCase() ?? "?"}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-forest-900">
              {user?.user_metadata?.full_name ?? "Forager"}
            </Text>
            <Text className="text-sm text-forest-700">{user?.email}</Text>
          </View>
        </View>

        <View className="mt-4 flex-row gap-3">
          <Stat label="Credits" value={`${credits?.total ?? 0}`} />
          <Stat label="Plan" value={isPremium ? tier.charAt(0).toUpperCase() + tier.slice(1) : "Free"} />
        </View>

        {!isPremium && (
          <Pressable
            onPress={() => router.push("/paywall")}
            className="mt-4 flex-row items-center justify-between rounded-xl bg-amber-100 px-4 py-3"
          >
            <View className="flex-row items-center gap-2">
              <Sparkles size={16} color="#A85016" />
              <Text className="font-semibold text-amber-700">Upgrade for unlimited scans</Text>
            </View>
            <Text className="font-bold text-amber-700">→</Text>
          </Pressable>
        )}
      </Card>

      <View className="mt-4 gap-2">
        <Row icon={<CreditCard size={18} color="#4A7C2A" />} label="Subscription & billing" onPress={() => router.push("/paywall")} />
        <Row icon={<Trophy size={18} color="#D2691E" />} label="Achievements" onPress={() => router.push("/achievements")} />
        <Row icon={<Bell size={18} color="#4A7C2A" />} label="Notifications" onPress={() => router.push("/settings/notifications")} />
        <Row icon={<Globe size={18} color="#4A7C2A" />} label="Language" onPress={() => router.push("/settings/language")} />
        <Row icon={<SettingsIcon size={18} color="#4A7C2A" />} label="Settings" onPress={() => router.push("/settings")} />
        <Row icon={<HelpCircle size={18} color="#4A7C2A" />} label="Help & support" onPress={() => router.push("/help")} />
      </View>

      <Button variant="ghost" icon={<LogOut size={16} color="#8E1E1E" />} className="mt-6" onPress={confirmSignOut}>
        <Text className="font-semibold text-toxic-700">Sign out</Text>
      </Button>
    </Screen>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-1 rounded-xl bg-forest-100 p-3">
      <Text className="text-xs uppercase tracking-wider text-forest-600">{label}</Text>
      <Text className="font-display text-xl font-bold text-forest-900">{value}</Text>
    </View>
  );
}

function Row({
  icon,
  label,
  onPress,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 rounded-xl bg-white px-4 py-3.5 active:bg-forest-50"
    >
      <View className="h-9 w-9 items-center justify-center rounded-lg bg-forest-100">{icon}</View>
      <Text className="flex-1 font-semibold text-forest-900">{label}</Text>
      <Text className="text-forest-400">›</Text>
    </Pressable>
  );
}
