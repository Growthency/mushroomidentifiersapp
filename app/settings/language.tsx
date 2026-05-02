import { View, Text, Pressable } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react-native";
import { Screen, Card } from "@/components/ui";

const LANGS = [
  { code: "en", label: "English" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "it", label: "Italiano" },
  { code: "pt", label: "Português" },
  { code: "ja", label: "日本語" },
  { code: "zh", label: "中文" },
  { code: "bn", label: "বাংলা" },
  { code: "hi", label: "हिन्दी" },
  { code: "ru", label: "Русский" },
  { code: "ar", label: "العربية" },
];

export default function Language() {
  const [selected, setSelected] = useState("en");
  return (
    <Screen>
      <Pressable onPress={() => router.back()} className="mb-4 mt-2 flex-row items-center gap-1">
        <ArrowLeft size={18} color="#2D5016" />
        <Text className="font-semibold text-forest-700">Back</Text>
      </Pressable>

      <Text className="font-display text-2xl font-bold text-forest-900">Language</Text>
      <Text className="mt-1 text-sm text-forest-700">
        AI identifications and the interface adapt to your language.
      </Text>

      <Card className="mt-4">
        {LANGS.map((l, i) => (
          <View key={l.code}>
            {i > 0 && <View className="my-1 h-px bg-forest-100" />}
            <Pressable
              onPress={() => setSelected(l.code)}
              className="flex-row items-center justify-between py-2.5"
            >
              <Text className="text-base text-forest-900">{l.label}</Text>
              {selected === l.code && <Check size={18} color="#4A7C2A" />}
            </Pressable>
          </View>
        ))}
      </Card>
    </Screen>
  );
}
