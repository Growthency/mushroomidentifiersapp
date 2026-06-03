/**
 * In-app gradient splash that takes over the moment the native splash hides.
 * Gives the cold-start a polished feel (gradient background + soft logo glow
 * + spinner) instead of the harsh dark-green-to-white jump the native splash
 * produced before. Auto-fades out when `visible` flips to false.
 */
import { useEffect, useRef } from "react";
import { View, Image, Animated, ActivityIndicator, Text } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export function AppSplash({ visible }: { visible: boolean }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.9)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;

  // Soft logo fade-in on mount
  useEffect(() => {
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, [logoOpacity, logoScale]);

  // Fade-out when visible flips false
  useEffect(() => {
    if (!visible) {
      Animated.timing(opacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, opacity]);

  return (
    <Animated.View
      pointerEvents={visible ? "auto" : "none"}
      style={{
        ...StyleSheet_absoluteFill,
        opacity,
        zIndex: 999,
      }}
    >
      <LinearGradient
        // Forest sunrise — deep green at the top fading down through sage to
        // a warm cream that matches the app's screen background. Smooth
        // transition into whatever screen renders behind us.
        colors={["#0F2E12", "#1F4A1F", "#3E6E2C", "#E6F0DA", "#F1F6ED"]}
        locations={[0, 0.25, 0.55, 0.92, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={{ flex: 1, alignItems: "center", justifyContent: "center" }}
      >
        <Animated.View
          style={{
            opacity: logoOpacity,
            transform: [{ scale: logoScale }],
            alignItems: "center",
          }}
        >
          {/* Soft halo behind the logo */}
          <View
            style={{
              position: "absolute",
              width: 220,
              height: 220,
              borderRadius: 110,
              backgroundColor: "rgba(255,255,255,0.10)",
            }}
          />
          <Image
            source={require("../assets/android-chrome-512x512.png")}
            style={{ width: 140, height: 140 }}
            resizeMode="contain"
          />
          <Text
            style={{
              marginTop: 18,
              color: "#F1F6ED",
              fontSize: 22,
              fontWeight: "700",
              letterSpacing: 0.3,
            }}
          >
            Mushroom Identifiers
          </Text>
          <Text
            style={{
              marginTop: 4,
              color: "rgba(241,246,237,0.7)",
              fontSize: 13,
            }}
          >
            Field-grade foraging
          </Text>
          <View style={{ marginTop: 28 }}>
            <ActivityIndicator color="#F1F6ED" />
          </View>
        </Animated.View>
      </LinearGradient>
    </Animated.View>
  );
}

// Inlined to avoid pulling StyleSheet just for one absoluteFill object.
const StyleSheet_absoluteFill = {
  position: "absolute" as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
};
