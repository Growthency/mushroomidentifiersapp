/**
 * In-app splash overlay shown while auth + side-effect init runs.
 *
 * Deliberately uses ONLY core React Native primitives with inline styles:
 *   - no NativeWind classNames     (if NW failed, this still renders)
 *   - no expo-linear-gradient      (if it crashes, splash still renders)
 *   - no Image / require() assets  (if asset bundling failed, still works)
 *   - no Animated / Reanimated     (rules out animation engine crashes)
 *
 * If after a few seconds the screen still shows a blank white instead of
 * this solid forest-green splash, we know the crash happens BEFORE this
 * component mounts — and RootErrorBoundary should be catching/displaying
 * the actual error.
 */
import { View, Text, ActivityIndicator } from "react-native";

export function AppSplash({ visible }: { visible: boolean }) {
  if (!visible) return null;

  return (
    <View
      pointerEvents="auto"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: "#1F4A1F",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 9999,
        elevation: 9999,
      }}
    >
      {/* Logo placeholder — emoji avoids the require() asset path entirely. */}
      <View
        style={{
          width: 120,
          height: 120,
          borderRadius: 28,
          backgroundColor: "#DCE9D2",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: 24,
        }}
      >
        <Text style={{ fontSize: 64 }}>🍄</Text>
      </View>
      <Text
        style={{
          color: "#F1F6ED",
          fontSize: 24,
          fontWeight: "700",
          letterSpacing: 0.3,
        }}
      >
        Mushroom Identifiers
      </Text>
      <Text
        style={{
          color: "rgba(241,246,237,0.7)",
          fontSize: 13,
          marginTop: 4,
        }}
      >
        Field-grade foraging
      </Text>
      <View style={{ marginTop: 32 }}>
        <ActivityIndicator color="#F1F6ED" size="large" />
      </View>
    </View>
  );
}
