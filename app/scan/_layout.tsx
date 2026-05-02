import { Stack } from "expo-router";

export default function ScanLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: "#0F1B0A" },
      }}
    />
  );
}
