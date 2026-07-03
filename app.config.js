/** @type {import('expo/config').ExpoConfig} */
module.exports = ({ config }) => ({
  ...config,
  name: "Calovia",
  slug: "calovia",
  version: "1.0.0",
  orientation: "portrait",
  icon: "./assets/icon.png",
  scheme: "calovia",
  userInterfaceStyle: "light",
  ios: {
    supportsTablet: true,
    bundleIdentifier: "com.calovia.app",
  },
  android: {
    adaptiveIcon: {
      backgroundColor: "#E1F5EE",
      foregroundImage: "./assets/android-icon-foreground.png",
      backgroundImage: "./assets/android-icon-background.png",
      monochromeImage: "./assets/android-icon-monochrome.png",
    },
    package: "com.calovia.app",
    predictiveBackGestureEnabled: false,
  },
  web: {
    bundler: "metro",
    favicon: "./assets/favicon.png",
    output: "single",
  },
  plugins: [
    "expo-router",
    [
      "expo-image-picker",
      {
        photosPermission: "Calovia needs photo access to analyze your meals.",
      },
    ],
    "expo-status-bar",
  ],
  experiments: {
    typedRoutes: true,
  },
  extra: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL,
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
});
