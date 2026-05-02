export type Edibility =
  | "edible"
  | "edible_with_caution"
  | "inedible"
  | "poisonous"
  | "deadly"
  | "unknown";

export type SafetyVerdict = "safe_to_handle" | "caution" | "do_not_consume" | "do_not_touch";

export type Tier = "free" | "explorer" | "pro" | "yearly" | "lifetime";

export type Scan = {
  id: string;
  user_id: string;
  created_at: string;
  status: "pending" | "completed" | "failed";
  notes: string | null;
  habitat: string | null;
  location_lat: number | null;
  location_lon: number | null;
  location_name: string | null;
  result: import("@/lib/anthropic").IdentificationResult | null;
  images: { angle: string; url: string }[];
};

export type JournalEntry = {
  id: string;
  user_id: string;
  scan_id: string | null;
  title: string;
  notes: string | null;
  scientific_name: string | null;
  common_name: string | null;
  edibility: Edibility | null;
  found_at: string;
  location_lat: number | null;
  location_lon: number | null;
  location_name: string | null;
  photos: string[];
  weather_snapshot: { temp: number; humidity: number; rainMm: number } | null;
  is_favorite: boolean;
  tags: string[];
};

export type Mushroom = {
  id: string;
  scientific_name: string;
  common_names: string[];
  family: string | null;
  genus: string | null;
  edibility: Edibility;
  description: string | null;
  habitat: string | null;
  season_months: number[];
  toxicity_notes: string | null;
  lookalike_ids: string[];
  photos: string[];
  spore_print_color: string | null;
  cap_size_cm: [number, number] | null;
  region: string[] | null;
};
