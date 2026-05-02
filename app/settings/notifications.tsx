import { useEffect } from "react";
import { View, Text, Pressable, Switch } from "react-native";
import { router } from "expo-router";
import { ArrowLeft } from "lucide-react-native";
import { Screen, Card } from "@/components/ui";
import { usePreferences } from "@/stores/preferencesStore";

export default function NotificationsSettings() {
  const hydrate = usePreferences((s) => s.hydrate);
  const foragingAlerts = usePreferences((s) => s.foragingAlertsEnabled);
  const seasonal = usePreferences((s) => s.seasonalRemindersEnabled);
  const community = usePreferences((s) => s.communityRepliesEnabled);
  const setPref = usePreferences((s) => s.set);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <Text className="font-display text-2xl font-bold text-forest-900">Notifications</Text>

      <Card className="mt-4">
        <Toggle
          label="Foraging condition alerts"
          hint="When weather looks great in your area"
          value={foragingAlerts}
          onChange={(v) => setPref("foragingAlertsEnabled", v)}
        />
        <View className="my-2 h-px bg-forest-100" />
        <Toggle
          label="Seasonal reminders"
          hint="Heads-up when species you've found come back into season"
          value={seasonal}
          onChange={(v) => setPref("seasonalRemindersEnabled", v)}
        />
        <View className="my-2 h-px bg-forest-100" />
        <Toggle
          label="Community replies"
          hint="When someone replies to your shared finds"
          value={community}
          onChange={(v) => setPref("communityRepliesEnabled", v)}
        />
      </Card>
    </Screen>
  );
}

function Toggle({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint?: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <View className="flex-row items-center justify-between py-2">
      <View className="flex-1 pr-3">
        <Text className="text-base text-forest-900">{label}</Text>
        {hint ? <Text className="text-xs text-forest-600">{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: "#4A7C2A", false: "#E5E7EB" }}
      />
    </View>
  );
}
