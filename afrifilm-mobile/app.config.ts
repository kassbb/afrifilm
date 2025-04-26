import { ExpoConfig, ConfigContext } from "expo/config";

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: "AfriFilm",
  slug: "afrifilm",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  userInterfaceStyle: "dark",
  splash: {
    image: "./assets/splash.png",
    resizeMode: "contain",
    backgroundColor: "#000000",
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.afrifilm.app",
  },
  android: {
    adaptiveIcon: {
      foregroundImage: "./assets/adaptive-icon.png",
      backgroundColor: "#000000",
    },
    package: "com.afrifilm.app",
  },
  web: {
    favicon: "./assets/favicon.png",
  },
  plugins: ["expo-router"],
  scheme: "afrifilm",
});
