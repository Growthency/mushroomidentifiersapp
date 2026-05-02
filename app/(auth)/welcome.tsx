import { View, Text, Image } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Button, Screen } from "@/components/ui";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { Sparkles, ShieldAlert, Search } from "lucide-react-native";

export default function Welcome() {
  return (
    <Screen scroll={false}>
      <View className="flex-1 items-center justify-between py-10">
        <View className="w-full items-center gap-3">
          <View className="h-24 w-24 items-center justify-center rounded-3xl bg-forest-700">
            <Text className="text-5xl">🍄</Text>
          </View>
          <Text className="font-display text-3xl font-bold text-forest-900">MushroomIdentifiers</Text>
          <Text className="text-center text-base text-forest-700">
            AI-powered mushroom ID · 10,000+ species · trusted by foragers worldwide
          </Text>
        </View>

        <View className="w-full gap-4">
          <FeatureRow
            icon={<Sparkles size={20} color="#4A7C2A" />}
            title="Multi-angle AI scan"
            body="Cap, underside, stem, base — same approach experts use."
          />
          <FeatureRow
            icon={<ShieldAlert size={20} color="#D2691E" />}
            title="Lookalike & toxicity alerts"
            body="Instantly flagged dangerous twins & poison-control quick links."
          />
          <FeatureRow
            icon={<Search size={20} color="#4A7C2A" />}
            title="Field journal & foraging map"
            body="Track every find, see what's fruiting near you."
          />
        </View>

        <View className="w-full gap-3">
          <Button onPress={() => router.push("/(auth)/signup")} size="lg">
            Create free account
          </Button>
          <GoogleButton label="Continue with Google" />
          <Button variant="ghost" onPress={() => router.push("/(auth)/login")}>
            I already have an account
          </Button>
          <Text className="text-center text-xs text-forest-600">
            30 free credits on signup. No card required.
          </Text>
        </View>
      </View>
    </Screen>
  );
}

function FeatureRow({ icon, title, body }: { icon: React.ReactNode; title: string; body: string }) {
  return (
    <View className="flex-row gap-3 rounded-xl bg-white/70 p-3">
      <View className="h-10 w-10 items-center justify-center rounded-lg bg-forest-100">{icon}</View>
      <View className="flex-1">
        <Text className="font-semibold text-forest-900">{title}</Text>
        <Text className="text-sm text-forest-700">{body}</Text>
      </View>
    </View>
  );
}
