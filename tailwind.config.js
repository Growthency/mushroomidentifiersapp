/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Earth / forest palette — matches mushroomidentifiers.com
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
        // Mushroom cap accent — warm orange/amber
        amber: {
          50: "#FFF8EB",
          100: "#FCEBC2",
          200: "#F7D386",
          300: "#F0B549",
          400: "#E8961E",
          500: "#D2691E",
          600: "#A85016",
          700: "#7F3C12",
          800: "#572810",
          900: "#2F160A",
        },
        toxic: {
          50: "#FFEEEE",
          500: "#E03131",
          600: "#B92626",
          700: "#8E1E1E",
        },
        edible: {
          500: "#3FB950",
          600: "#2EA043",
        },
        warn: {
          500: "#F0B549",
          600: "#D89412",
        },
      },
      fontFamily: {
        sans: ["Inter", "System"],
        display: ["Inter", "System"],
        serif: ["Georgia", "serif"],
      },
    },
  },
  plugins: [],
};
