import { Redirect } from "expo-router";
import { useAuthStore } from "@/stores/authStore";

export default function Index() {
  const session = useAuthStore((s) => s.session);
  return session ? <Redirect href="/(tabs)/home" /> : <Redirect href="/(auth)/welcome" />;
}
