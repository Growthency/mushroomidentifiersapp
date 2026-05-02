/**
 * Achievement engine — definitions, evaluation, and persistence.
 *
 * Every achievement is checked against live Supabase data (scans + journal counts).
 * Newly-met conditions are inserted into `achievements` table — idempotent via
 * unique (user_id, code) constraint.
 */
import { supabase } from "./supabase";

export type AchievementDef = {
  code: string;
  title: string;
  body: string;
  icon: string;
  /** Returns the user's current progress + the threshold for unlocking. */
  progress: (ctx: AchievementContext) => { current: number; target: number };
};

export type AchievementContext = {
  scanCount: number;
  edibleScanCount: number;
  toxicScanCount: number;
  journalCount: number;
  uniqueHabitats: number;
  earliestHour: number | null; // 0–23
  latestHour: number | null;
  rainyScans: number;
};

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    code: "first_id",
    title: "First steps",
    body: "Complete your first identification.",
    icon: "🌱",
    progress: (c) => ({ current: Math.min(c.scanCount, 1), target: 1 }),
  },
  {
    code: "ten_ids",
    title: "Curious forager",
    body: "Identify 10 species.",
    icon: "🔍",
    progress: (c) => ({ current: Math.min(c.scanCount, 10), target: 10 }),
  },
  {
    code: "hundred_ids",
    title: "Veteran",
    body: "Identify 100 species.",
    icon: "🧪",
    progress: (c) => ({ current: Math.min(c.scanCount, 100), target: 100 }),
  },
  {
    code: "edible_finder",
    title: "Choice cut",
    body: "Find 5 edible species.",
    icon: "🍳",
    progress: (c) => ({ current: Math.min(c.edibleScanCount, 5), target: 5 }),
  },
  {
    code: "danger_spotter",
    title: "Sharp eye",
    body: "Identify 5 toxic lookalikes.",
    icon: "⚠️",
    progress: (c) => ({ current: Math.min(c.toxicScanCount, 5), target: 5 }),
  },
  {
    code: "journal_keeper",
    title: "Field notes",
    body: "Save 25 journal entries.",
    icon: "📓",
    progress: (c) => ({ current: Math.min(c.journalCount, 25), target: 25 }),
  },
  {
    code: "explorer",
    title: "Range rover",
    body: "Find species in 5+ habitats.",
    icon: "🗺️",
    progress: (c) => ({ current: Math.min(c.uniqueHabitats, 5), target: 5 }),
  },
  {
    code: "early_bird",
    title: "Dewy dawn",
    body: "Scan before 7 AM.",
    icon: "🌅",
    progress: (c) => ({
      current: c.earliestHour != null && c.earliestHour < 7 ? 1 : 0,
      target: 1,
    }),
  },
  {
    code: "night_owl",
    title: "Lantern light",
    body: "Scan after 9 PM.",
    icon: "🌙",
    progress: (c) => ({
      current: c.latestHour != null && c.latestHour >= 21 ? 1 : 0,
      target: 1,
    }),
  },
  {
    code: "weatherman",
    title: "Storm chaser",
    body: "Scan within 24h of heavy rain.",
    icon: "🌧️",
    progress: (c) => ({ current: Math.min(c.rainyScans, 1), target: 1 }),
  },
];

export type EvaluatedAchievement = AchievementDef & {
  unlocked: boolean;
  unlockedAt: string | null;
  current: number;
  target: number;
};

export async function buildContext(userId: string): Promise<AchievementContext> {
  const [scansRes, journalRes] = await Promise.all([
    supabase
      .from("scans")
      .select("created_at, habitat, result, weather_snapshot:result")
      .eq("user_id", userId)
      .eq("status", "completed"),
    supabase
      .from("journal_entries")
      .select("id, edibility, weather_snapshot, location_name")
      .eq("user_id", userId),
  ]);

  type ScanRow = {
    created_at: string;
    habitat: string | null;
    result: { topMatch?: { edibility?: string } } | null;
  };
  type JournalRow = {
    edibility: string | null;
    weather_snapshot: { recentRainMm?: number } | null;
    location_name: string | null;
  };

  const scans = (scansRes.data ?? []) as ScanRow[];
  const journal = (journalRes.data ?? []) as JournalRow[];

  const scanCount = scans.length;
  const journalCount = journal.length;

  const edibleScanCount =
    scans.filter((s) => s.result?.topMatch?.edibility === "edible").length +
    journal.filter((j) => j.edibility === "edible").length;
  const toxicScanCount =
    scans.filter((s) =>
      ["poisonous", "deadly"].includes(s.result?.topMatch?.edibility ?? ""),
    ).length +
    journal.filter((j) => ["poisonous", "deadly"].includes(j.edibility ?? "")).length;

  const habitats = new Set<string>();
  scans.forEach((s) => s.habitat && habitats.add(s.habitat.toLowerCase().trim()));

  const hours = scans.map((s) => new Date(s.created_at).getHours());
  const earliestHour = hours.length ? Math.min(...hours) : null;
  const latestHour = hours.length ? Math.max(...hours) : null;

  const rainyScans = journal.filter((j) => (j.weather_snapshot?.recentRainMm ?? 0) >= 5).length;

  return {
    scanCount,
    edibleScanCount,
    toxicScanCount,
    journalCount,
    uniqueHabitats: habitats.size,
    earliestHour,
    latestHour,
    rainyScans,
  };
}

export async function evaluateAchievements(userId: string): Promise<EvaluatedAchievement[]> {
  const ctx = await buildContext(userId);
  const { data: unlocked } = await supabase
    .from("achievements")
    .select("code, unlocked_at")
    .eq("user_id", userId);

  const unlockedMap = new Map<string, string>(
    (unlocked ?? []).map((row) => [row.code, row.unlocked_at]),
  );

  const evaluated = ACHIEVEMENTS.map((def) => {
    const { current, target } = def.progress(ctx);
    const meets = current >= target;
    const wasUnlocked = unlockedMap.has(def.code);
    return {
      ...def,
      current,
      target,
      unlocked: wasUnlocked || meets,
      unlockedAt: unlockedMap.get(def.code) ?? null,
    };
  });

  // Persist any new unlocks (idempotent — unique constraint prevents duplicates)
  const newlyMet = evaluated.filter((a) => a.unlocked && !unlockedMap.has(a.code));
  if (newlyMet.length > 0) {
    await supabase
      .from("achievements")
      .insert(newlyMet.map((a) => ({ user_id: userId, code: a.code })))
      .select();
  }

  return evaluated;
}
