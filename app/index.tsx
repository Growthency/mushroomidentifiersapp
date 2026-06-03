/**
 * DIAGNOSTIC INDEX — hardcoded view to prove the app launches.
 * If you see this green screen with text, React Native is mounting fine
 * and the blank-screen bug is caused by something in the FULL app code.
 * If you see blank white, the issue is a native/build problem.
 */
import { View, Text, Platform } from "react-native";

export default function DiagnosticIndex() {
  const ts = new Date().toISOString();
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#1F4A1F",
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 24,
      }}
    >
      <Text style={{ fontSize: 72, marginBottom: 16 }}>🍄</Text>
      <Text
        style={{
          color: "#F1F6ED",
          fontSize: 28,
          fontWeight: "700",
          textAlign: "center",
          marginBottom: 8,
        }}
      >
        App is alive!
      </Text>
      <Text
        style={{
          color: "rgba(241,246,237,0.8)",
          fontSize: 14,
          textAlign: "center",
          marginBottom: 24,
        }}
      >
        Build 13 — diagnostic
      </Text>
      <View
        style={{
          backgroundColor: "rgba(0,0,0,0.25)",
          paddingVertical: 14,
          paddingHorizontal: 18,
          borderRadius: 12,
          marginTop: 8,
        }}
      >
        <Text style={{ color: "#F1F6ED", fontSize: 13, fontWeight: "600" }}>
          Platform: {Platform.OS} ({Platform.Version})
        </Text>
        <Text style={{ color: "rgba(241,246,237,0.7)", fontSize: 12, marginTop: 4 }}>
          {ts}
        </Text>
      </View>
      <Text
        style={{
          color: "rgba(241,246,237,0.6)",
          fontSize: 11,
          textAlign: "center",
          marginTop: 32,
          paddingHorizontal: 12,
        }}
      >
        If you see this screen, the app loads correctly.{"\n"}
        Take a screenshot and share — we'll restore the full app next build.
      </Text>
    </View>
  );
}
