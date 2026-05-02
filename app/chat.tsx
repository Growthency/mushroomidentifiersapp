import { useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  TextInput,
} from "react-native";
import { router } from "expo-router";
import { X, Send, Sparkles, Lock, Gift } from "lucide-react-native";
import { useQueryClient } from "@tanstack/react-query";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Button } from "@/components/ui";
import { chatWithMycologist } from "@/lib/anthropic";
import { useSubscriptionStore } from "@/stores/subscriptionStore";
import { useAuthStore } from "@/stores/authStore";
import { useCredits } from "@/hooks/useCredits";
import { consumeCredits } from "@/lib/credits";
import { config } from "@/lib/config";
import { showRewardedAd } from "@/lib/ads";
import { supabase } from "@/lib/supabase";
import { track, ANALYTICS_EVENTS } from "@/lib/posthog";

type Msg = { id: string; role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      role: "assistant",
      content: `I'm your AI mycologist. Ask me anything about mushroom ID, foraging, recipes, or safety. ⚠️ I won't tell you a wild mushroom is safe to eat — confirm any edible find with a local expert.\n\nEach question uses ${config.credits.perChatMessage} credits.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [watchingAd, setWatchingAd] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const userId = useAuthStore((s) => s.user?.id);
  const { data: credits, refetch: refetchCredits } = useCredits();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  // Lift the input above Android gesture bar / iOS home indicator.
  const bottomPad = Math.max(insets.bottom, Platform.OS === "android" ? 16 : 12);

  const balance = credits?.total ?? 0;
  const cost = config.credits.perChatMessage;
  const canSend = isPremium || balance >= cost;

  const send = async () => {
    if (!input.trim() || streaming || !userId) return;

    if (!canSend) {
      setShowPaywall(true);
      track(ANALYTICS_EVENTS.PAYWALL_VIEWED, { source: "chat_no_credits" });
      return;
    }

    const userMsg: Msg = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);
    track(ANALYTICS_EVENTS.CHAT_MESSAGE_SENT, { balance_before: balance });

    try {
      // Free users — debit credits before the call. Premium users skip metering.
      if (!isPremium) {
        const result = await consumeCredits(userId, cost);
        if (!result.success) {
          setMessages((m) =>
            m.map((entry) =>
              entry.id === assistantId
                ? { ...entry, content: "💳 Out of credits. Watch an ad below or upgrade for unlimited chat." }
                : entry,
            ),
          );
          setShowPaywall(true);
          return;
        }
        queryClient.invalidateQueries({ queryKey: ["credits"] });
      }

      await chatWithMycologist(
        [...messages, userMsg].map(({ role, content }) => ({ role, content })),
        {
          isPremium,
          onDelta: (delta) => {
            setMessages((m) =>
              m.map((msg) =>
                msg.id === assistantId ? { ...msg, content: msg.content + delta } : msg,
              ),
            );
            listRef.current?.scrollToEnd({ animated: true });
          },
        },
      );
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Something went wrong";
      setMessages((m) =>
        m.map((entry) =>
          entry.id === assistantId
            ? { ...entry, content: `⚠️ Couldn't reach AI right now. ${msg}` }
            : entry,
        ),
      );
    } finally {
      setStreaming(false);
    }
  };

  const watchAdForCredits = async () => {
    if (!userId || watchingAd) return;
    setWatchingAd(true);
    try {
      const earned = await showRewardedAd();
      if (!earned) return;
      const reward = config.ads.rewardedCredits;
      const { error } = await supabase.rpc("grant_monthly_credits", {
        p_user_id: userId,
        p_amount: reward,
      });
      if (error) throw error;
      await refetchCredits();
      setShowPaywall(false);
      setMessages((m) => [
        ...m,
        {
          id: `reward-${Date.now()}`,
          role: "assistant",
          content: `🎁 Thanks for watching! +${reward} credits added. You can keep asking — that's ${Math.floor(
            reward / config.credits.perChatMessage,
          )} more questions.`,
        },
      ]);
      track(ANALYTICS_EVENTS.AD_REWARD_EARNED, { source: "chat", reward });
    } catch {
      // silent — ad failed
    } finally {
      setWatchingAd(false);
    }
  };

  return (
    <View className="flex-1 bg-forest-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View
          className="flex-row items-center justify-between border-b border-forest-100 bg-white px-4 py-3"
          style={{ paddingTop: Math.max(insets.top, 12) + 12 }}
        >
          <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
            <X size={20} color="#2D5016" />
          </Pressable>
          <View className="items-center">
            <Text className="font-display text-base font-bold text-forest-900">AI Mycologist</Text>
            {!isPremium && (
              <Text className="text-[11px] text-forest-600">
                {balance} credits · {cost}/question
              </Text>
            )}
          </View>
          <View className="w-9" />
        </View>

        <FlatList
          ref={listRef}
          data={messages}
          keyExtractor={(m) => m.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                item.role === "user" ? "self-end bg-forest-700" : "self-start bg-white"
              }`}
            >
              <Text className={item.role === "user" ? "text-white" : "text-forest-900"}>
                {item.content || "…"}
              </Text>
            </View>
          )}
          onContentSizeChange={() => listRef.current?.scrollToEnd({ animated: true })}
        />

        {showPaywall && !isPremium && (
          <View className="border-t border-amber-200 bg-amber-50 p-4">
            <View className="flex-row items-start gap-3">
              <View className="h-10 w-10 items-center justify-center rounded-full bg-amber-500">
                <Sparkles size={20} color="#fff" />
              </View>
              <View className="flex-1">
                <Text className="font-display text-base font-bold text-forest-900">
                  Out of credits — keep the magic going 🍄✨
                </Text>
                <Text className="mt-1 text-sm text-forest-700">
                  Watch a quick ad for {config.ads.rewardedCredits} free credits, or upgrade to Premium for unlimited chat with the smarter Sonnet 4.6 AI, no ads, PDF reports, and unlimited scans.
                </Text>
                <View className="mt-3 flex-row flex-wrap gap-2">
                  <Button
                    size="sm"
                    fullWidth={false}
                    variant="secondary"
                    onPress={watchAdForCredits}
                    loading={watchingAd}
                    icon={<Gift size={14} color="#2D5016" />}
                  >
                    Watch ad +{config.ads.rewardedCredits}
                  </Button>
                  <Button
                    size="sm"
                    fullWidth={false}
                    onPress={() => {
                      setShowPaywall(false);
                      router.push("/paywall");
                    }}
                    icon={<Sparkles size={14} color="#fff" />}
                  >
                    See plans
                  </Button>
                  <Button
                    size="sm"
                    fullWidth={false}
                    variant="ghost"
                    onPress={() => setShowPaywall(false)}
                  >
                    Maybe later
                  </Button>
                </View>
              </View>
            </View>
          </View>
        )}

        <View
          className="flex-row items-end gap-2 border-t border-forest-100 bg-white p-3"
          style={{ paddingBottom: bottomPad }}
        >
          <TextInput
            multiline
            placeholder={canSend ? "Ask anything about mushrooms…" : "Out of credits — see options above"}
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            editable={canSend}
            className="max-h-32 flex-1 rounded-2xl border border-forest-100 bg-forest-50 px-4 py-3 text-base text-forest-900"
          />
          <Pressable
            onPress={send}
            disabled={streaming || !input.trim()}
            className={`h-11 w-11 items-center justify-center rounded-full ${
              !canSend ? "bg-amber-500" : "bg-forest-700"
            }`}
            style={{ opacity: streaming || !input.trim() ? 0.4 : 1 }}
          >
            {!canSend ? <Lock size={18} color="#fff" /> : <Send size={18} color="#fff" />}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
