import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string, locale = "en-US"): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString(locale, { year: "numeric", month: "short", day: "numeric" });
}

export function formatRelative(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const m = Math.floor(seconds / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
}

export function edibilityColor(e: string): string {
  switch (e) {
    case "edible":
      return "#3FB950";
    case "edible_with_caution":
      return "#F0B549";
    case "inedible":
      return "#9CA3AF";
    case "poisonous":
      return "#E03131";
    case "deadly":
      return "#7F1D1D";
    default:
      return "#6B7280";
  }
}

export function edibilityLabel(e: string): string {
  switch (e) {
    case "edible":
      return "Edible";
    case "edible_with_caution":
      return "Edible w/ caution";
    case "inedible":
      return "Inedible";
    case "poisonous":
      return "Poisonous";
    case "deadly":
      return "Deadly";
    default:
      return "Unknown";
  }
}

export function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n));
}
