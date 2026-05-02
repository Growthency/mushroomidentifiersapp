import { View, Text, ScrollView, Pressable, Alert } from "react-native";
import { router } from "expo-router";
import { useState } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  BookOpen,
  Save,
  Share2,
  MessageCircle,
  Phone,
} from "lucide-react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";

import { Screen, Card, Badge, EdibilityBadge, Button } from "@/components/ui";
import { useScanStore } from "@/stores/scanStore";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { supabase } from "@/lib/supabase";
import { uploadScanImage } from "@/lib/storage";
import { edibilityColor } from "@/lib/utils";
import { showInterstitial } from "@/lib/ads";
import { useEffect } from "react";

export default function Result() {
  const result = useScanStore((s) => s.result);
  const images = useScanStore((s) => s.images);
  const notes = useScanStore((s) => s.notes);
  const habitat = useScanStore((s) => s.habitat);
  const location = useScanStore((s) => s.location);
  const reset = useScanStore((s) => s.reset);
  const userId = useAuthStore((s) => s.user?.id);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const [saving, setSaving] = useState(false);

  // Show interstitial after result lands — only for free users.
  // Tiny delay so it doesn't block the result render.
  useEffect(() => {
    const t = setTimeout(() => {
      showInterstitial({ isPremium }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [isPremium]);

  if (!result) {
    return (
      <Screen>
        <View className="flex-1 items-center justify-center">
          <Text className="text-forest-700">No result.</Text>
          <Button onPress={() => router.back()} className="mt-4">
            Go back
          </Button>
        </View>
      </Screen>
    );
  }

  const top = result.topMatch;
  const isDangerous = top.edibility === "poisonous" || top.edibility === "deadly";

  const verdictIcon =
    result.safetyVerdict === "do_not_consume" || result.safetyVerdict === "do_not_touch" ? (
      <ShieldAlert size={20} color="#fff" />
    ) : result.safetyVerdict === "caution" ? (
      <AlertTriangle size={20} color="#fff" />
    ) : (
      <ShieldCheck size={20} color="#fff" />
    );

  const verdictBg =
    result.safetyVerdict === "do_not_consume" || result.safetyVerdict === "do_not_touch"
      ? "#8E1E1E"
      : result.safetyVerdict === "caution"
        ? "#D2691E"
        : "#3FB950";

  const saveScan = async () => {
    if (!userId) return;
    setSaving(true);
    try {
      const { data: scan, error } = await supabase
        .from("scans")
        .insert({
          user_id: userId,
          status: "completed",
          notes,
          habitat,
          location_lat: location?.lat,
          location_lon: location?.lon,
          location_name: location?.placeName,
          result: result as unknown as Record<string, unknown>,
          credits_used: 10,
        })
        .select()
        .single();
      if (error || !scan) throw error ?? new Error("Save failed");

      const urls = await Promise.all(
        images.map(async (img) => ({
          angle: img.angle,
          url: await uploadScanImage(userId, scan.id, img.angle, img.uri),
        })),
      );
      await supabase.from("scan_images").insert(
        urls.map((u) => ({ scan_id: scan.id, angle: u.angle, url: u.url })),
      );

      Alert.alert("Saved", "Scan added to your journal.");
    } catch (e) {
      Alert.alert("Save failed", (e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const exportPdf = async () => {
    const html = `
      <html><body style="font-family: -apple-system, sans-serif; padding: 24px;">
        <h1>Mushroom Identification Report</h1>
        <p><strong>Date:</strong> ${new Date().toLocaleString()}</p>
        <h2>${top.commonNames[0] ?? top.scientificName}</h2>
        <p><em>${top.scientificName}</em> · Family ${top.family ?? "—"}</p>
        <p><strong>Edibility:</strong> ${top.edibility}</p>
        <p><strong>Confidence:</strong> ${(top.confidence * 100).toFixed(0)}%</p>
        <p><strong>Safety verdict:</strong> ${result.safetyVerdict}</p>
        <h3>Key features</h3>
        <ul>${top.keyFeatures.map((f) => `<li>${f}</li>`).join("")}</ul>
        ${result.lookalikes.length ? `<h3>Lookalikes</h3><ul>${result.lookalikes.map((l) => `<li><em>${l.scientificName}</em> — ${l.whyConfusable}</li>`).join("")}</ul>` : ""}
        <p style="color: #888; font-size: 12px; margin-top: 32px;">
          ⚠️ This report is informational only. Never consume a wild mushroom based on app identification alone.
        </p>
      </body></html>`;
    const { uri } = await Print.printToFileAsync({ html });
    await Sharing.shareAsync(uri, { mimeType: "application/pdf" });
  };

  return (
    <Screen>
      {/* Verdict banner */}
      <View
        style={{ backgroundColor: verdictBg }}
        className="mt-2 flex-row items-center gap-3 rounded-2xl p-4"
      >
        {verdictIcon}
        <View className="flex-1">
          <Text className="font-display text-base font-bold text-white">
            {result.safetyVerdict.replace(/_/g, " ").toUpperCase()}
          </Text>
          <Text className="text-xs text-white/90">
            Overall confidence: {(result.confidenceOverall * 100).toFixed(0)}%
          </Text>
        </View>
      </View>

      {/* Top match */}
      <Card className="mt-4">
        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <Text className="font-display text-xl font-bold text-forest-900">
              {top.commonNames[0] ?? top.scientificName}
            </Text>
            <Text className="text-sm italic text-forest-700">{top.scientificName}</Text>
            {top.family && <Text className="mt-0.5 text-xs text-forest-600">Family: {top.family}</Text>}
          </View>
          <View
            style={{
              backgroundColor: edibilityColor(top.edibility),
              borderRadius: 9999,
              padding: 10,
            }}
          >
            <Text className="font-bold text-white">{(top.confidence * 100).toFixed(0)}%</Text>
          </View>
        </View>

        <View className="mt-3 flex-row flex-wrap gap-2">
          <EdibilityBadge edibility={top.edibility} />
          {top.habitatMatch && <Badge label="Habitat ✓" tone="info" />}
        </View>

        {top.toxicityNotes && (
          <View className="mt-3 rounded-xl bg-toxic-50 p-3">
            <Text className="text-sm font-semibold text-toxic-700">⚠ Toxicity note</Text>
            <Text className="mt-1 text-sm text-toxic-700">{top.toxicityNotes}</Text>
          </View>
        )}

        <Text className="mt-4 text-sm font-bold uppercase tracking-wider text-forest-600">
          Key identifying features
        </Text>
        <View className="mt-1 gap-1">
          {top.keyFeatures.map((f, i) => (
            <Text key={i} className="text-sm text-forest-800">
              • {f}
            </Text>
          ))}
        </View>

        {top.distinguishingFromLookalikes && (
          <View className="mt-3 rounded-xl bg-forest-100 p-3">
            <Text className="text-sm font-semibold text-forest-800">How to tell from lookalikes</Text>
            <Text className="mt-1 text-sm text-forest-700">{top.distinguishingFromLookalikes}</Text>
          </View>
        )}
      </Card>

      {/* Other candidates */}
      {result.candidates.length > 1 && (
        <>
          <Text className="mt-6 text-sm font-bold uppercase tracking-wider text-forest-600">
            Other possibilities
          </Text>
          {result.candidates.slice(1, 4).map((c, i) => (
            <Card key={i} className="mt-2 flex-row items-center gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-forest-100">
                <Text className="font-bold text-forest-800">{c.rank}</Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-forest-900">{c.commonNames[0] ?? c.scientificName}</Text>
                <Text className="text-xs italic text-forest-700">{c.scientificName}</Text>
                <View className="mt-1 flex-row gap-2">
                  <EdibilityBadge edibility={c.edibility} />
                  <Badge label={`${(c.confidence * 100).toFixed(0)}%`} tone="neutral" />
                </View>
              </View>
            </Card>
          ))}
        </>
      )}

      {/* Lookalikes */}
      {result.lookalikes.length > 0 && (
        <>
          <Text className="mt-6 text-sm font-bold uppercase tracking-wider text-forest-600">
            ⚠ Dangerous lookalikes
          </Text>
          {result.lookalikes.map((l, i) => (
            <Card key={i} className="mt-2 border-toxic-500/30 bg-toxic-50">
              <Text className="font-semibold text-toxic-700">
                {l.commonName ?? l.scientificName}
              </Text>
              <Text className="text-xs italic text-toxic-700">{l.scientificName}</Text>
              <Text className="mt-1 text-sm text-toxic-700">{l.whyConfusable}</Text>
            </Card>
          ))}
        </>
      )}

      {/* Spore print guidance */}
      {result.sporePrintGuidance && (
        <Card className="mt-4">
          <Text className="font-semibold text-forest-900">Spore print test</Text>
          <Text className="mt-1 text-sm text-forest-700">{result.sporePrintGuidance}</Text>
        </Card>
      )}

      {/* Emergency advice */}
      {result.emergencyAdvice && isDangerous && (
        <Pressable
          onPress={() => router.push("/emergency")}
          className="mt-4 flex-row items-center gap-3 rounded-2xl bg-toxic-700 p-4"
        >
          <Phone size={20} color="#fff" />
          <View className="flex-1">
            <Text className="font-bold text-white">If exposed: contact poison control</Text>
            <Text className="text-xs text-white/80">{result.emergencyAdvice}</Text>
          </View>
        </Pressable>
      )}

      {/* Actions */}
      <View className="mt-6 gap-2">
        <Button onPress={saveScan} loading={saving} icon={<Save size={16} color="#fff" />}>
          Save to journal
        </Button>
        <View className="flex-row gap-2">
          <Button variant="secondary" onPress={exportPdf} icon={<Share2 size={16} color="#2D5016" />} fullWidth>
            Export PDF
          </Button>
          <Button
            variant="secondary"
            onPress={() => router.push("/chat")}
            icon={<MessageCircle size={16} color="#2D5016" />}
            fullWidth
          >
            Ask follow-up
          </Button>
        </View>
        <Button
          variant="ghost"
          onPress={() => {
            reset();
            router.replace("/(tabs)/home");
          }}
        >
          Done
        </Button>
      </View>

      {/* Disclaimer */}
      <View className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-3">
        <Text className="text-xs text-amber-700">
          ⚠ This is an AI-assisted identification, not a definitive diagnosis. Never consume a wild
          mushroom based on app results alone — always confirm with a qualified local expert.
        </Text>
      </View>
    </Screen>
  );
}
