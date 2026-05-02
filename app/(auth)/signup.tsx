import { useState } from "react";
import { View, Text, KeyboardAvoidingView, Platform } from "react-native";
import { router, Link } from "expo-router";
import Toast from "react-native-toast-message";
import { Button, Input, Screen } from "@/components/ui";
import { GoogleButton } from "@/components/auth/GoogleButton";
import { useAuthStore } from "@/stores/authStore";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const signUp = useAuthStore((s) => s.signUpWithEmail);

  const submit = async () => {
    if (!email || !password || password.length < 6) {
      Toast.show({ type: "error", text1: "Password must be 6+ characters" });
      return;
    }
    setLoading(true);
    try {
      await signUp(email.trim(), password, name.trim() || undefined);
      Toast.show({
        type: "success",
        text1: "Check your email",
        text2: "We sent a confirmation link.",
      });
      router.replace("/(auth)/login");
    } catch (e) {
      Toast.show({ type: "error", text1: "Signup failed", text2: (e as Error).message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        className="mt-6 gap-4"
      >
        <View className="mb-2">
          <Text className="font-display text-3xl font-bold text-forest-900">Create account</Text>
          <Text className="mt-1 text-forest-700">
            30 free credits to get started — no card required.
          </Text>
        </View>

        <Input label="Full name (optional)" value={name} onChangeText={setName} />
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
          placeholder="At least 6 characters"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />

        <Button onPress={submit} loading={loading} size="lg">
          Create account
        </Button>

        <View className="my-2 flex-row items-center gap-3">
          <View className="h-px flex-1 bg-forest-200" />
          <Text className="text-xs uppercase tracking-wider text-forest-500">or</Text>
          <View className="h-px flex-1 bg-forest-200" />
        </View>

        <GoogleButton label="Sign up with Google" />

        <Text className="text-center text-xs text-forest-600">
          By signing up you agree to our Terms & Privacy Policy.
        </Text>

        <View className="mt-2 flex-row justify-center gap-1">
          <Text className="text-forest-700">Have an account?</Text>
          <Link href="/(auth)/login">
            <Text className="font-semibold text-forest-600">Sign in</Text>
          </Link>
        </View>
      </KeyboardAvoidingView>
    </Screen>
  );
}
