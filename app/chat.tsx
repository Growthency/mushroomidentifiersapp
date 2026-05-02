import { useState, useRef } from "react";
import { View, Text, FlatList, KeyboardAvoidingView, Platform, Pressable, TextInput } from "react-native";
import { router } from "expo-router";
import { X, Send } from "lucide-react-native";
import { Screen } from "@/components/ui";
import { chatWithMycologist } from "@/lib/anthropic";
import { useSubscriptionStore } from "@/stores/subscriptionStore";

type Msg = { id: string; role: "user" | "assistant"; content: string };

export default function Chat() {
  const [messages, setMessages] = useState<Msg[]>([
    {
      id: "intro",
      role: "assistant",
      content:
        "I'm your AI mycologist. Ask me anything about mushroom ID, foraging, recipes, or safety. ⚠️ I won't tell you a wild mushroom is safe to eat — confirm any edible find with a local expert.",
    },
  ]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const listRef = useRef<FlatList<Msg>>(null);
  const isPremium = useSubscriptionStore((s) => s.isPremium);

  const send = async () => {
    if (!input.trim() || streaming) return;
    const userMsg: Msg = { id: Date.now().toString(), role: "user", content: input.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput("");
    setStreaming(true);

    const assistantId = (Date.now() + 1).toString();
    setMessages((m) => [...m, { id: assistantId, role: "assistant", content: "" }]);

    try {
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
      setMessages((m) =>
        m.map((msg) =>
          msg.id === assistantId
            ? { ...msg, content: `(Error: ${(e as Error).message})` }
            : msg,
        ),
      );
    } finally {
      setStreaming(false);
    }
  };

  return (
    <View className="flex-1 bg-forest-50">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1"
      >
        <View className="flex-row items-center justify-between border-b border-forest-100 bg-white px-4 py-3 pt-12">
          <Pressable onPress={() => router.back()} className="h-9 w-9 items-center justify-center">
            <X size={20} color="#2D5016" />
          </Pressable>
          <Text className="font-display text-base font-bold text-forest-900">AI Mycologist</Text>
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

        <View className="flex-row items-end gap-2 border-t border-forest-100 bg-white p-3">
          <TextInput
            multiline
            placeholder="Ask anything about mushrooms…"
            placeholderTextColor="#9CA3AF"
            value={input}
            onChangeText={setInput}
            className="max-h-32 flex-1 rounded-2xl border border-forest-100 bg-forest-50 px-4 py-3 text-base text-forest-900"
          />
          <Pressable
            onPress={send}
            disabled={streaming || !input.trim()}
            className="h-11 w-11 items-center justify-center rounded-full bg-forest-700"
            style={{ opacity: streaming || !input.trim() ? 0.4 : 1 }}
          >
            <Send size={18} color="#fff" />
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}
