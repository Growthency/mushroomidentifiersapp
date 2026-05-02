// Wraps app.json so we can inject runtime env values (e.g. Google Maps key)
// without committing them to git. Expo merges this object with app.json at
// build/start time. Keep all *static* config in app.json — only inject
// secrets / env-driven fields here.

module.exports = ({ config }) => ({
  ...config,
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
});
