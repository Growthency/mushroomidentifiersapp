import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { router, Link } from "expo-router";
import Toast from "react-native-toast-message";
import { Button, Input, Screen } from "@/components/ui";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuthStore } from "@/stores/authStore";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const signIn = useAuthStore((s) => s.signInWithEmail);

  const submit = async () => {
    if (!email || !password) return;
    setLoading(true);
    try {
      await signIn(email.trim(), password);
      router.replace("/(tabs)/home");
    } catch (e) {
      Toast.show({ type: "error", text1: "Login failed", text2: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen scroll={false}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="flex-1 justify-center"
      >
        <View className="gap-4">
          <View className="mb-2">
            <Text className="font-display text-3xl font-bold text-forest-900">Welcome back</Text>
            <Text className="mt-1 text-forest-700">Sign in to continue identifying.</Text>
          </View>

          <Input
            label="Email"
            placeholder="you@example.com"
            keyboardType="email-address"
            autoCapitalize="none"
            autoComplete="email"
            value={email}
            onChangeText={setEmail}
          />
          <Input
            label="Password"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />

          <Link href="/(auth)/forgot-password" className="self-end">
            <Text className="text-sm font-semibold text-forest-600">Forgot password?</Text>
          </Link>

          <Button onPress={submit} loading={loading} size="lg">
            Sign in
          </Button>

          <View className="my-2 flex-row items-center gap-3">
            <View className="h-px flex-1 bg-forest-200" />
            <Text className="text-xs uppercase tracking-wider text-forest-500">or</Text>
            <View className="h-px flex-1 bg-forest-200" />
          </View>

          <GoogleButton label="Sign in with Google" />

          <View className="mt-2 flex-row justify-center gap-1">
            <Text className="text-forest-700">No account?</Text>
            <Link href="/(auth)/signup">
              <Text className="font-semibold text-forest-600">Create one</Text>
            </Link>
          </View>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
