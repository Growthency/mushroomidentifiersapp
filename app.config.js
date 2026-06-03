// Wraps app.json so we can inject runtime env values (Google Maps key,
// AdMob app IDs, etc.) without committing them to git. Expo merges this
// object with app.json at build/start time. Keep all *static* config in
// app.json — only inject secrets / env-driven fields here.

module.exports = ({ config }) => {
  // Real AdMob app IDs from .env (falls back to Google's universal test IDs
  // so the build still succeeds locally even before keys are set).
  const TEST_ANDROID_APP_ID = "ca-app-pub-3940256099942544~3347511713";
  const TEST_IOS_APP_ID = "ca-app-pub-3940256099942544~1458002511";
  const androidAdMobAppId =
    process.env.EXPO_PUBLIC_ADMOB_APP_ID_ANDROID || TEST_ANDROID_APP_ID;
  const iosAdMobAppId = process.env.EXPO_PUBLIC_ADMOB_APP_ID_IOS || TEST_IOS_APP_ID;

  // Patch the AdMob plugin entry inside config.plugins with the real IDs.
  const plugins = (config.plugins || []).map((p) => {
    if (Array.isArray(p) && p[0] === "react-native-google-mobile-ads") {
      return [
        p[0],
        {
          ...(p[1] || {}),
          androidAppId: androidAdMobAppId,
          iosAppId: iosAdMobAppId,
        },
      ];
    }
    return p;
  });

  return {
    ...config,
    plugins,
    android: {
      ...config.android,
      config: {
        ...((config.android && config.android.config) || {}),
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_ANDROID || "",
        },
      },
    },
    ios: {
      ...config.ios,
      config: {
        ...((config.ios && config.ios.config) || {}),
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY_IOS || "",
      },
    },
  };
};
