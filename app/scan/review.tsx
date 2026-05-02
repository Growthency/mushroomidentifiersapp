import { useState, useEffect } from "react";
import { View, Text, Image, ScrollView, Pressable, BackHandler } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import * as Haptics from "expo-haptics";
import { Plus, X, Sparkles } from "lucide-react-native";

import { Button, Input, Screen, Badge } from "@/components/ui";
import { useScanStore } from "@/stores/scanStore";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { identifyMushroom } from "@/lib/anthropic";
import { readImageAsBase64 } from "@/lib/storage";
import { config } from "@/lib/config";
import { useCredits } from "@/hooks/useCredits";

export default function Review() {
  const images = useScanStore((s) => s.images);
  const notes = useScanStore((s) => s.notes);
  const habitat = useScanStore((s) => s.habitat);
  const location = useScanStore((s) => s.location);
  const setNotes = useScanStore((s) => s.setNotes);
  const setHabitat = useScanStore((s) => s.setHabitat);
  const setResult = useScanStore((s) => s.setResult);
  const removeAngle = useScanStore((s) => s.removeAngle);

  const userId = useAuthStore((s) => s.user?.id);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const { data: credits } = useCredits();
  const [submitting, setSubmitting] = useState(false);

  // Hardware back → go back to capture (most common intent: take more photos)
  useEffect(() => {
    const onBack = () => {
      router.replace("/scan/capture");
      return true;
    };
    const sub = BackHandler.addEventListener("hardwareBackPress", onBack);
    return () => sub.remove();
  }, []);

  const submit = async () => {
    if (images.length === 0) {
      Toast.show({ type: "error", text1: "Add at least one photo" });
      return;
    }
    if (!credits?.canIdentify) {
      router.push("/paywall");
      return;
    }

    setSubmitting(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});

    try {
      const imageData = await Promise.all(
        images.map(async (img) => ({
          angle: img.angle,
          base64: await readImageAsBase64(img.uri),
          mimeType: "image/jpeg" as const,
        })),
      );

      const result = await identifyMushroom(
        { images: imageData, notes, habitat, location, isPremium },
        { useDirect: __DEV__ && !!config.anthropic.apiKey },
      );

      setResult(result);
      router.replace("/scan/result");
    } catch (e) {
      Toast.show({ type: "error", text1: "Identification failed", text2: (e as Error).message });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen className="bg-forest-50">
      <View className="mt-4">
        <Text className="font-display text-2xl font-bold text-forest-900">Review your scan</Text>
        <Text className="text-sm text-forest-700">
          Add notes to help the AI nail the ID. {config.credits.perIdentification} credits will be used.
        </Text>
      </View>

      <Text className="mt-5 text-sm font-bold uppercase tracking-wider text-forest-600">
        Photos ({images.length})
      </Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mt-2 -mx-5 px-5">
        <View className="flex-row gap-2">
          {images.map((img) => (
            <View key={img.angle} className="relative">
              <Image source={{ uri: img.uri }} style={{ width: 110, height: 110, borderRadius: 12 }} />
              <View className="absolute left-1 right-1 bottom-1 rounded bg-black/60 py-0.5">
                <Text className="text-center text-[10px] font-semibold uppercase text-white">
                  {img.angle}
                </Text>
              </View>
              <Pressable
                onPress={() => removeAngle(img.angle)}
                className="absolute -right-1 -top-1 h-6 w-6 items-center justify-center rounded-full bg-toxic-500"
              >
                <X size={12} color="#fff" />
              </Pressable>
            </View>
          ))}
          <Pressable
            onPress={() => router.replace("/scan/capture")}
            className="h-[110px] w-[110px] items-center justify-center rounded-xl border-2 border-dashed border-forest-300 bg-white"
          >
            <Plus size={20} color="#4A7C2A" />
            <Text className="mt-1 text-xs font-semibold text-forest-700">Add angle</Text>
          </Pressable>
        </View>
      </ScrollView>

      <View className="mt-6 gap-3">
        <Input
          label="Habitat"
          placeholder="e.g. on rotting oak log, mossy floor, pasture"
          value={habitat}
          onChangeText={setHabitat}
        />
        <Input
          label="Notes (optional)"
          placeholder="Smell, texture, anything noteworthy"
          multiline
          numberOfLines={4}
          style={{ minHeight: 90, textAlignVertical: "top" }}
          value={notes}
          onChangeText={setNotes}
        />

        {location && (
          <View className="flex-row items-center gap-2">
            <Badge label="Location attached" tone="info" />
            <Text className="text-xs text-forest-600">
              {location.lat.toFixed(3)}, {location.lon.toFixed(3)}
            </Text>
          </View>
        )}
      </View>

      <Button
        onPress={submit}
        loading={submitting}
        size="lg"
        className="mt-8"
        icon={<Sparkles size={18} color="#fff" />}
      >
        Identify mushroom
      </Button>
      <Text className="mt-2 text-center text-xs text-forest-600">
        {credits?.total ?? 0} credits remaining · {config.credits.perIdentification} per scan
      </Text>
    </Screen>
  );
}
