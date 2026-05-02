# Assets

Place these images in this folder before your first build:

- `icon.png` — 1024×1024, app icon (no transparency)
- `adaptive-icon.png` — 1024×1024 foreground for Android adaptive icons
- `splash.png` — 2048×2048 splash screen
- `splash-icon.png` — 200×200 logo for the new Expo splash plugin
- `notification-icon.png` — 96×96 monochrome icon for Android push
- `favicon.png` — 48×48 web favicon

The app auto-generates platform variants from these source files.
Use `npx expo-asset-utils` or simply put PNGs here and run `expo prebuild`.
