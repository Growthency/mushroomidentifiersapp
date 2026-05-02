import { View, Text, Pressable, Linking } from "react-native";
import { router } from "expo-router";
import { ArrowLeft, ExternalLink, MessageCircle } from "lucide-react-native";
import { Screen, Card, Button } from "@/components/ui";
import { config } from "@/lib/config";

const FAQ = [
  {
    q: "How accurate is the AI?",
    a: "Our multi-angle approach achieves 90%+ top-3 accuracy on common species. Always confirm edible IDs with a local expert — never consume based on app results alone.",
  },
  {
    q: "How are credits used?",
    a: `Each identification consumes ${config.credits.perIdentification} credits. Free accounts start with ${config.credits.freeLifetime} lifetime credits.`,
  },
  {
    q: "Can I use the app offline?",
    a: "Photo capture and journal browsing work offline. AI identification needs a network connection.",
  },
  {
    q: "Where does my data go?",
    a: "Photos and notes are stored in your private Supabase account. We never share or sell your data.",
  },
];

export default function Help() {
  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <Text className="font-display text-2xl font-bold text-forest-900">Help & support</Text>

      <View className="mt-4 gap-3">
        {FAQ.map((item) => (
          <Card key={item.q}>
            <Text className="font-bold text-forest-900">{item.q}</Text>
            <Text className="mt-1 text-sm text-forest-700">{item.a}</Text>
          </Card>
        ))}
      </View>

      <Button
        className="mt-6"
        icon={<MessageCircle size={16} color="#fff" />}
        onPress={() => Linking.openURL(`${config.website.url}/contact`)}
      >
        Contact support
      </Button>
      <Pressable
        onPress={() => Linking.openURL(config.website.url)}
        className="mt-3 flex-row items-center justify-center gap-1.5"
      >
        <ExternalLink size={14} color="#4A7C2A" />
        <Text className="text-sm font-semibold text-forest-700">Visit mushroomidentifiers.com</Text>
      </Pressable>
    </Screen>
  );
}
