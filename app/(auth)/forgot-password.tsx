import { useState } from "react";
import { View, Text } from "react-native";
import { router } from "expo-router";
import Toast from "react-native-toast-message";
import { Button, Input, Screen } from "@/components/ui";
import { useAuthStore } from "@/stores/authStore";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const reset = useAuthStore((s) => s.resetPassword);

  const submit = async () => {
    if (!email) return;
    setLoading(true);
    try {
      await reset(email.trim());
      Toast.show({ type: "success", text1: "Reset link sent" });
      router.back();
    } catch (e) {
      Toast.show({ type: "error", text1: "Reset failed", text2: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <View className="mt-12 gap-4">
        <View>
          <Text className="font-display text-3xl font-bold text-forest-900">Reset password</Text>
          <Text className="mt-1 text-forest-700">
            We'll email you a secure link to set a new one.
          </Text>
        </View>

        <Input
          label="Email"
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          value={email}
          onChangeText={setEmail}
        />

        <Button onPress={submit} loading={loading} size="lg">
          Send reset link
        </Button>
        <Button variant="ghost" onPress={() => router.back()}>
          Cancel
        </Button>
      </View>
    </Screen>
  );
}
