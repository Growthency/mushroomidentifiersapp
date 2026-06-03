const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

config.resolver.sourceExts = [...config.resolver.sourceExts, "mjs", "cjs"];

// Native-only modules that should never reach the web bundle. Returning an
// empty shim stops Metro from following their imports into native-only
// internals (e.g. codegenNativeCommands) when building for web.
const WEB_BLOCKED_MODULES = new Set([
  "react-native-maps",
  "react-native-google-mobile-ads",
  "react-native-purchases",
]);

const originalResolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (platform === "web" && WEB_BLOCKED_MODULES.has(moduleName)) {
    return {
      type: "empty",
    };
  }
  if (originalResolveRequest) {
    return originalResolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: "./global.css" });
