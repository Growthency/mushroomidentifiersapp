module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      ["babel-preset-expo", { jsxImportSource: "nativewind" }],
      "nativewind/babel",
    ],
    // Reanimated v3 plugin — MUST be listed LAST. (When we migrate back to
    // Reanimated 4 with new arch, this becomes "react-native-worklets/plugin"
    // and the worklets package must be reinstalled.)
    plugins: ["react-native-reanimated/plugin"],
  };
};
