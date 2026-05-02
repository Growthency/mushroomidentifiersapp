import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "user_preferences_v1";

export type Preferences = {
  hapticsEnabled: boolean;
  analyticsEnabled: boolean;
  foragingAlertsEnabled: boolean;
  seasonalRemindersEnabled: boolean;
  communityRepliesEnabled: boolean;
  language: string;
};

const DEFAULTS: Preferences = {
  hapticsEnabled: true,
  analyticsEnabled: true,
  foragingAlertsEnabled: true,
  seasonalRemindersEnabled: true,
  communityRepliesEnabled: false,
  language: "en",
};

type State = Preferences & {
  hydrated: boolean;
  hydrate: () => Promise<void>;
  set: <K extends keyof Preferences>(key: K, value: Preferences[K]) => Promise<void>;
};

export const usePreferences = create<State>((set, get) => ({
  ...DEFAULTS,
  hydrated: false,
  hydrate: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<Preferences>;
        set({ ...DEFAULTS, ...parsed, hydrated: true });
      } else {
        set({ hydrated: true });
      }
    } catch {
      set({ hydrated: true });
    }
  },
  set: async (key, value) => {
    set({ [key]: value } as Pick<Preferences, typeof key>);
    const { hydrated, hydrate, set: _setter, ...persistable } = get();
    void hydrated;
    void hydrate;
    void _setter;
    await AsyncStorage.setItem(KEY, JSON.stringify(persistable));
  },
}));
