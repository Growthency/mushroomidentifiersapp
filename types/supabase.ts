/**
 * Supabase generated types — replace this file with the output of:
 *   bun run supabase:gen
 * after you've defined SUPABASE_PROJECT_ID in your shell.
 *
 * Below is a hand-rolled placeholder so the rest of the codebase compiles
 * before you've connected the real DB.
 */

export type Json = string | number | boolean | null | { [k: string]: Json } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          tier: "free" | "explorer" | "pro" | "yearly" | "lifetime";
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & { id: string; email: string };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      user_credits: {
        Row: {
          user_id: string;
          monthly_remaining: number;
          lifetime_remaining: number;
          cycle_refresh_at: string | null;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["user_credits"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["user_credits"]["Row"]>;
      };
      scans: {
        Row: {
          id: string;
          user_id: string;
          status: "pending" | "completed" | "failed";
          notes: string | null;
          habitat: string | null;
          location_lat: number | null;
          location_lon: number | null;
          location_name: string | null;
          result: Json | null;
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["scans"]["Row"]> & { user_id: string };
        Update: Partial<Database["public"]["Tables"]["scans"]["Row"]>;
      };
      scan_images: {
        Row: { id: string; scan_id: string; angle: string; url: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["scan_images"]["Row"]> & { scan_id: string; angle: string; url: string };
        Update: Partial<Database["public"]["Tables"]["scan_images"]["Row"]>;
      };
      journal_entries: {
        Row: {
          id: string;
          user_id: string;
          scan_id: string | null;
          title: string;
          notes: string | null;
          scientific_name: string | null;
          common_name: string | null;
          edibility: string | null;
          found_at: string;
          location_lat: number | null;
          location_lon: number | null;
          location_name: string | null;
          photos: string[];
          weather_snapshot: Json | null;
          is_favorite: boolean;
          tags: string[];
          created_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["journal_entries"]["Row"]> & { user_id: string; title: string };
        Update: Partial<Database["public"]["Tables"]["journal_entries"]["Row"]>;
      };
      mushrooms: {
        Row: {
          id: string;
          scientific_name: string;
          common_names: string[];
          family: string | null;
          genus: string | null;
          edibility: string;
          description: string | null;
          habitat: string | null;
          season_months: number[];
          toxicity_notes: string | null;
          lookalike_ids: string[];
          photos: string[];
          spore_print_color: string | null;
          cap_size_cm: number[] | null;
          region: string[] | null;
          inaturalist_taxon_id: number | null;
        };
        Insert: Partial<Database["public"]["Tables"]["mushrooms"]["Row"]> & { scientific_name: string; edibility: string };
        Update: Partial<Database["public"]["Tables"]["mushrooms"]["Row"]>;
      };
      chat_messages: {
        Row: { id: string; user_id: string; role: string; content: string; created_at: string };
        Insert: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]> & { user_id: string; role: string; content: string };
        Update: Partial<Database["public"]["Tables"]["chat_messages"]["Row"]>;
      };
      achievements: {
        Row: { id: string; user_id: string; code: string; unlocked_at: string };
        Insert: Partial<Database["public"]["Tables"]["achievements"]["Row"]> & { user_id: string; code: string };
        Update: Partial<Database["public"]["Tables"]["achievements"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: {
      consume_credits: { Args: { p_user_id: string; p_amount: number }; Returns: { success: boolean; remaining: number } };
      grant_monthly_credits: { Args: { p_user_id: string; p_amount: number }; Returns: void };
    };
    Enums: Record<string, never>;
  };
};
