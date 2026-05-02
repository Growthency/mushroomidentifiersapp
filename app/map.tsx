import { useEffect, useRef, useState } from "react";
import { View, Text, Pressable, ActivityIndicator, Platform, Alert } from "react-native";
import { router } from "expo-router";
import * as Location from "expo-location";
import { ArrowLeft, MapPin, Locate, Layers } from "lucide-react-native";
import { useQuery } from "@tanstack/react-query";

import { supabase } from "@/lib/supabase";
import { useAuthStore } from "@/stores/authStore";
import { edibilityColor, edibilityLabel } from "@/lib/utils";
import type { JournalEntry } from "@/types";

// react-native-maps is bundled into Expo Go on iOS/Android. On web it isn't
// available, so we resolve the module via require so Metro doesn't try to
// pull native code into the web bundle.
type MapsModule = typeof import("react-native-maps");
let mapsMod: MapsModule | null = null;
if (Platform.OS !== "web") {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  mapsMod = require("react-native-maps") as MapsModule;
}
const MapView = mapsMod?.default;
const Marker = mapsMod?.Marker;
const PROVIDER_GOOGLE = mapsMod?.PROVIDER_GOOGLE;

const DEFAULT_REGION = {
  latitude: 23.8103, // Dhaka — sensible default until we have user location
  longitude: 90.4125,
  latitudeDelta: 0.5,
  longitudeDelta: 0.5,
};

export default function MapScreen() {
  const userId = useAuthStore((s) => s.user?.id);
  const mapRef = useRef<any>(null);
  const [region, setRegion] = useState(DEFAULT_REGION);
  const [hasLocation, setHasLocation] = useState(false);
  const [selected, setSelected] = useState<JournalEntry | null>(null);
  const [mapType, setMapType] = useState<"standard" | "hybrid">("standard");

  // Pull every journal entry that has coordinates — these become map pins.
  const { data: entries } = useQuery({
    queryKey: ["journal-pins", userId],
    queryFn: async () => {
      if (!userId) return [] as JournalEntry[];
      const { data, error } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .not("location_lat", "is", null)
        .not("location_lon", "is", null)
        .order("found_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as JournalEntry[];
    },
    enabled: !!userId,
  });

  // Center on user's current position when permission is granted.
  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      const next = {
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      };
      setRegion(next);
      setHasLocation(true);
      mapRef.current?.animateToRegion(next, 500);
    })();
  }, []);

  const recenter = async () => {
    try {
      const loc = await Location.getCurrentPositionAsync({});
      mapRef.current?.animateToRegion(
        {
          latitude: loc.coords.latitude,
          longitude: loc.coords.longitude,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        },
        400,
      );
    } catch {
      Alert.alert(
        "Location unavailable",
        "Enable location permission in your device settings to recenter the map.",
      );
    }
  };

  // Only the web preview lacks native maps — phone builds always have it.
  if (!MapView || !Marker) {
    return (
      <View className="flex-1 items-center justify-center bg-forest-50 px-6">
        <Pressable
          onPress={() => router.back()}
          className="absolute left-5 top-12 flex-row items-center gap-1"
        >
          <ArrowLeft size={18} color="#2D5016" />
          <Text className="font-semibold text-forest-700">Back</Text>
        </Pressable>
        <MapPin size={48} color="#4A7C2A" />
        <Text className="mt-4 text-center font-display text-xl font-bold text-forest-900">
          Map preview only on phone
        </Text>
        <Text className="mt-2 text-center text-sm text-forest-700">
          Open Mushroom Identifiers on your Android or iOS device to use the foraging map.
        </Text>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-forest-900">
      {/* Map fills the whole screen */}
      <MapView
        ref={mapRef}
        provider={Platform.OS === "android" ? PROVIDER_GOOGLE : undefined}
        style={{ flex: 1 }}
        initialRegion={region}
        showsUserLocation={hasLocation}
        showsMyLocationButton={false}
        showsCompass
        mapType={mapType}
      >
        {(entries ?? []).map((entry) => (
          <Marker
            key={entry.id}
            coordinate={{ latitude: entry.location_lat!, longitude: entry.location_lon! }}
            title={entry.common_name ?? entry.scientific_name ?? entry.title}
            description={entry.location_name ?? edibilityLabel(entry.edibility ?? "unknown")}
            pinColor={edibilityColor(entry.edibility ?? "unknown")}
            onPress={() => setSelected(entry)}
          />
        ))}
      </MapView>

      {/* Floating header */}
      <View className="absolute left-4 right-4 top-12 flex-row items-center justify-between">
        <Pressable
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full bg-white shadow"
        >
          <ArrowLeft size={18} color="#2D5016" />
        </Pressable>
        <View className="rounded-full bg-white/95 px-3 py-2 shadow">
          <Text className="text-sm font-bold text-forest-900">Foraging map</Text>
        </View>
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setMapType((m) => (m === "standard" ? "hybrid" : "standard"))}
            className="h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          >
            <Layers size={18} color="#2D5016" />
          </Pressable>
          <Pressable
            onPress={recenter}
            className="h-10 w-10 items-center justify-center rounded-full bg-white shadow"
          >
            <Locate size={18} color="#2D5016" />
          </Pressable>
        </View>
      </View>

      {/* Selection card slides up when a pin is tapped */}
      {selected && (
        <View className="absolute left-4 right-4 bottom-8 rounded-2xl bg-white p-4 shadow-lg">
          <View className="flex-row items-start justify-between">
            <View className="flex-1">
              <Text className="font-display text-lg font-bold text-forest-900">
                {selected.common_name ?? selected.title}
              </Text>
              {selected.scientific_name && (
                <Text className="text-sm italic text-forest-700">{selected.scientific_name}</Text>
              )}
              {selected.location_name && (
                <Text className="mt-1 text-xs text-forest-600">{selected.location_name}</Text>
              )}
              <View className="mt-2 flex-row gap-2">
                {selected.edibility && (
                  <View
                    style={{ backgroundColor: edibilityColor(selected.edibility) }}
                    className="rounded-full px-2 py-0.5"
                  >
                    <Text className="text-xs font-semibold text-white">
                      {edibilityLabel(selected.edibility)}
                    </Text>
                  </View>
                )}
              </View>
            </View>
            <Pressable
              onPress={() => router.push(`/journal/${selected.id}`)}
              className="rounded-full bg-forest-700 px-3 py-2"
            >
              <Text className="text-xs font-semibold text-white">Open</Text>
            </Pressable>
          </View>
        </View>
      )}

      {/* Empty state hint */}
      {(entries?.length ?? 0) === 0 && (
        <View className="absolute left-4 right-4 bottom-8 rounded-2xl bg-white/95 p-4 shadow-lg">
          <Text className="font-semibold text-forest-900">No finds yet on the map</Text>
          <Text className="mt-1 text-sm text-forest-700">
            Save a scan with location enabled and it'll appear here as a pin.
          </Text>
        </View>
      )}
    </View>
  );
}
