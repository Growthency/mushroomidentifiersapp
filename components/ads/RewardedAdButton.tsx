/**
 * "Watch ad → earn N credits" button.
 * Hidden for premium users (they already have monthly credits).
 */
import { useState } from "react";
import { View, Text, Platform } from "react-native";
import Constants from "expo-constants";
import { Gift } from "lucide-react-native";
import Toast from "react-native-toast-message";
import { Button } from "@/components/ui";
import { showRewardedAd } from "@/lib/ads";
import { useAuthStore } from "@/stores/authStore";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { supabase } from "@/lib/supabase";
import { useQueryClient } from "@tanstack/react-query";
import { config } from "@/lib/config";

const isExpoGo = Constants.appOwnership === "expo";

export function RewardedAdButton({ onEarned }: { onEarned?: (credits: number) => void }) {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const userId = useAuthStore((s) => s.user?.id);
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);

  if (isPremium || Platform.OS === "web" || isExpoGo) return null;

  const watch = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const earned = await showRewardedAd();
      if (!earned) {
        Toast.show({ type: "info", text1: "Ad cancelled — no credits earned" });
        return;
      }

      const reward = config.ads.rewardedCredits;
      const { error } = await supabase.rpc("grant_monthly_credits", {
        p_user_id: userId,
        p_amount: reward,
      });
      if (error) throw error;

      Toast.show({ type: "success", text1: `+${reward} credits earned 🎁` });
      queryClient.invalidateQueries({ queryKey: ["credits"] });
      onEarned?.(reward);
    } catch (e) {
      Toast.show({ type: "error", text1: "Reward failed", text2: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View>
      <Button
        variant="secondary"
        onPress={watch}
        loading={loading}
        icon={<Gift size={16} color="#2D5016" />}
      >
        <Text className="font-semibold text-forest-800">
          Watch ad — earn {config.ads.rewardedCredits} credits
        </Text>
      </Button>
    </View>
  );
}
