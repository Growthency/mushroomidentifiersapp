import { create } from "zustand";
import type { IdentificationAngle, IdentificationResult } from "@/lib/anthropic";

export type ScanImage = { angle: IdentificationAngle; uri: string };

type ScanState = {
  images: ScanImage[];
  notes: string;
  habitat: string;
  location: { lat: number; lon: number; placeName?: string } | null;
  result: IdentificationResult | null;
  scanning: boolean;
  addImage: (img: ScanImage) => void;
  removeAngle: (angle: IdentificationAngle) => void;
  setNotes: (s: string) => void;
  setHabitat: (s: string) => void;
  setLocation: (loc: ScanState["location"]) => void;
  setResult: (r: IdentificationResult | null) => void;
  setScanning: (b: boolean) => void;
  reset: () => void;
};

export const useScanStore = create<ScanState>((set) => ({
  images: [],
  notes: "",
  habitat: "",
  location: null,
  result: null,
  scanning: false,
  addImage: (img) =>
    set((s) => ({ images: [...s.images.filter((i) => i.angle !== img.angle), img] })),
  removeAngle: (angle) => set((s) => ({ images: s.images.filter((i) => i.angle !== angle) })),
  setNotes: (s) => set({ notes: s }),
  setHabitat: (s) => set({ habitat: s }),
  setLocation: (l) => set({ location: l }),
  setResult: (r) => set({ result: r }),
  setScanning: (b) => set({ scanning: b }),
  reset: () =>
    set({ images: [], notes: "", habitat: "", location: null, result: null, scanning: false }),
}));
