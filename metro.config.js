const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Fix for "import.meta" error - we will handle this by downgrading zustand instead
config.resolver.unstable_enablePackageExports = false;

config.resolver.assetExts.push('db');
config.resolver.assetExts.push('wasm');

// Apply NativeWind configuration
module.exports = withNativeWind(config, { input: "./global.css" });
