import { create } from "zustand";
import type { CustomerInfo } from "react-native-purchases";
import { getCustomerInfo, getActiveTier, hasPremium } from "@/lib/revenuecat";
import type { Tier } from "@/types";

type State = {
  info: CustomerInfo | null;
  tier: Tier;
  isPremium: boolean;
  refresh: () => Promise<void>;
  setInfo: (info: CustomerInfo | null) => void;
};

export const useSubscriptionStore = create<State>((set) => ({
  info: null,
  tier: "free",
  isPremium: false,
  refresh: async () => {
    const info = await getCustomerInfo();
    set({ info, tier: getActiveTier(info), isPremium: hasPremium(info) });
  },
  setInfo: (info) => set({ info, tier: getActiveTier(info), isPremium: hasPremium(info) }),
}));
