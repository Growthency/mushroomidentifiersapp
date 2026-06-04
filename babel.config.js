module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // SDK 54 + Reanimated v4: worklets plugin replaces the old reanimated plugin.
    // Plugin must be listed LAST. babel-preset-expo auto-includes worklets when needed,
    // but we declare it explicitly to be safe across cache states.
    plugins: ["react-native-worklets/plugin"],
  };
};
