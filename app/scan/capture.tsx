import { useState, useRef } from "react";
import { View, Text, Pressable, Alert, Image } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { router } from "expo-router";
import { X, Image as ImageIcon, RefreshCcw, Check, Camera as CameraIcon } from "lucide-react-native";
import * as Haptics from "expo-haptics";
import * as ImageManipulator from "expo-image-manipulator";

import { Button } from "@/components/ui";
import { useScanStore } from "@/stores/scanStore";
import type { IdentificationAngle } from "@/lib/anthropic";

const ANGLE_FLOW: { id: IdentificationAngle; label: string; hint: string }[] = [
  { id: "cap", label: "Cap (top)", hint: "Photograph the top of the mushroom from directly above." },
  { id: "underside", label: "Underside", hint: "Flip the cap to show the gills, pores, or teeth." },
  { id: "stem", label: "Stem", hint: "Side-on photo showing the full length of the stem." },
  { id: "base", label: "Base", hint: "The very bottom — show any volva, ring, or root structure." },
  { id: "habitat", label: "Habitat (optional)", hint: "Step back: trees, ground, surroundings." },
];

export default function Capture() {
  const [permission, requestPermission] = useCameraPermissions();
  const cameraRef = useRef<CameraView>(null);
  const [step, setStep] = useState(0);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);

  const addImage = useScanStore((s) => s.addImage);
  const setLocation = useScanStore((s) => s.setLocation);
  const reset = useScanStore((s) => s.reset);
  const images = useScanStore((s) => s.images);

  const angle = ANGLE_FLOW[step];
  const isOptional = step >= 4;

  const close = () => {
    Alert.alert("Discard scan?", "Your captured photos will be lost.", [
      { text: "Continue", style: "cancel" },
      { text: "Discard", style: "destructive", onPress: () => { reset(); router.back(); } },
    ]);
  };

  const ensureLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const loc = await Location.getCurrentPositionAsync({});
        setLocation({ lat: loc.coords.latitude, lon: loc.coords.longitude });
      }
    } catch {
      // ignore — location is optional
    }
  };

  const snap = async () => {
    if (!cameraRef.current) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium).catch(() => {});
    const photo = await cameraRef.current.takePictureAsync({ quality: 0.8 });
    if (!photo) return;
    const compressed = await ImageManipulator.manipulateAsync(
      photo.uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    setPendingPreview(compressed.uri);
  };

  const pickFromGallery = async () => {
    const r = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (r.canceled || !r.assets[0]) return;
    const compressed = await ImageManipulator.manipulateAsync(
      r.assets[0].uri,
      [{ resize: { width: 1024 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG },
    );
    setPendingPreview(compressed.uri);
  };

  const acceptPhoto = async () => {
    if (!pendingPreview) return;
    addImage({ angle: angle.id, uri: pendingPreview });
    if (step === 0) await ensureLocation();
    setPendingPreview(null);
    if (step < ANGLE_FLOW.length - 1) {
      setStep(step + 1);
    } else {
      router.replace("/scan/review");
    }
  };

  const skipOptional = () => {
    if (!isOptional) return;
    if (step < ANGLE_FLOW.length - 1) setStep(step + 1);
    else router.replace("/scan/review");
  };

  const finishEarly = () => {
    if (images.length < 1) return;
    router.replace("/scan/review");
  };

  if (!permission) return <View className="flex-1 bg-forest-900" />;
  if (!permission.granted) {
    return (
      <View className="flex-1 items-center justify-center bg-forest-900 px-6">
        <Text className="mb-2 text-center font-display text-2xl font-bold text-white">
          Camera permission needed
        </Text>
        <Text className="mb-6 text-center text-forest-200">
          We use your camera to capture mushroom photos for AI identification.
        </Text>
        <Button onPress={requestPermission}>Grant access</Button>
        <Pressable onPress={() => router.back()} className="mt-4">
          <Text className="text-forest-300">Cancel</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-black">
      {/* Camera or preview */}
      {pendingPreview ? (
        <Image source={{ uri: pendingPreview }} style={{ flex: 1 }} resizeMode="cover" />
      ) : (
        <CameraView ref={cameraRef} style={{ flex: 1 }} facing="back" />
      )}

      {/* Top bar */}
      <View className="absolute left-0 right-0 top-0 flex-row items-center justify-between p-4 pt-14">
        <Pressable
          onPress={close}
          className="h-10 w-10 items-center justify-center rounded-full bg-black/40"
        >
          <X size={20} color="#fff" />
        </Pressable>
        <View className="rounded-full bg-black/40 px-3 py-1.5">
          <Text className="text-xs font-bold uppercase tracking-wider text-white">
            Step {step + 1} / {ANGLE_FLOW.length}
          </Text>
        </View>
        <View className="w-10" />
      </View>

      {/* Hint card */}
      <View className="absolute left-4 right-4 top-28 rounded-2xl bg-black/60 p-4">
        <Text className="font-display text-xl font-bold text-white">{angle.label}</Text>
        <Text className="mt-1 text-sm text-forest-100">{angle.hint}</Text>
        {isOptional && <Text className="mt-1 text-xs italic text-amber-200">Optional — improves accuracy.</Text>}
      </View>

      {/* Angle pills */}
      <View className="absolute left-0 right-0 bottom-44 flex-row justify-center gap-1.5 px-4">
        {ANGLE_FLOW.map((a, i) => {
          const captured = images.some((img) => img.angle === a.id);
          const active = i === step;
          return (
            <View
              key={a.id}
              className={`h-1.5 flex-1 rounded-full ${
                captured ? "bg-edible-500" : active ? "bg-white" : "bg-white/30"
              }`}
            />
          );
        })}
      </View>

      {/* Bottom controls */}
      {pendingPreview ? (
        <View className="absolute left-0 right-0 bottom-0 bg-black/70 px-4 pb-10 pt-4">
          <View className="flex-row gap-3">
            <Button variant="ghost" onPress={() => setPendingPreview(null)} icon={<RefreshCcw size={18} color="#fff" />}>
              <Text className="font-semibold text-white">Retake</Text>
            </Button>
            <Button onPress={acceptPhoto} icon={<Check size={18} color="#fff" />}>
              Use this photo
            </Button>
          </View>
        </View>
      ) : (
        <View className="absolute left-0 right-0 bottom-0 bg-black/70 px-6 pb-10 pt-6">
          <View className="flex-row items-center justify-around">
            <Pressable onPress={pickFromGallery} className="h-12 w-12 items-center justify-center rounded-full bg-white/10">
              <ImageIcon size={22} color="#fff" />
            </Pressable>
            <Pressable
              onPress={snap}
              className="h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-white/20"
            >
              <View className="h-14 w-14 rounded-full bg-white" />
            </Pressable>
            <Pressable
              onPress={isOptional ? skipOptional : finishEarly}
              disabled={!isOptional && images.length < 1}
              className="h-12 w-12 items-center justify-center rounded-full bg-white/10"
            >
              {isOptional ? (
                <Text className="font-bold text-white">Skip</Text>
              ) : (
                <Text className="font-bold text-white">Done</Text>
              )}
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}
