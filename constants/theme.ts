export const colors = {
  forest: {
    50: "#F1F6ED",
    100: "#DCE9D2",
    200: "#B9D2A4",
    300: "#90B872",
    400: "#6A9C4F",
    500: "#4A7C2A",
    600: "#3A6320",
    700: "#2D5016",
    800: "#1F3B0F",
    900: "#0F1B0A",
  },
  amber: {
    50: "#FFF8EB",
    100: "#FCEBC2",
    200: "#F7D386",
    300: "#F0B549",
    400: "#E8961E",
    500: "#D2691E",
    600: "#A85016",
  },
  toxic: { 500: "#E03131", 700: "#8E1E1E" },
  edible: { 500: "#3FB950", 600: "#2EA043" },
  warn: { 500: "#F0B549" },
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    400: "#9CA3AF",
    500: "#6B7280",
    700: "#374151",
    900: "#111827",
  },
} as const;

export const radii = { sm: 6, md: 10, lg: 16, xl: 24, full: 9999 } as const;
export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, "2xl": 32 } as const;
