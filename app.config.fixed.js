export default {
  expo: {
    name: "Location Game",
    slug: "location-game-app",
    version: "1.0.0",
    orientation: "portrait",
    icon: "./assets/icon.png",
    userInterfaceStyle: "light",
    newArchEnabled: true,
    splash: {
      image: "./assets/splash-icon.png",
      resizeMode: "contain",
      backgroundColor: "#ffffff"
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "com.yourcompany.locationgame",
      config: {
        googleMapsApiKey: "YOUR_GOOGLE_MAPS_API_KEY"
      }
    },
    android: {
      adaptiveIcon: {
        foregroundImage: "./assets/adaptive-icon.png",
        backgroundColor: "#ffffff"
      },
      package: "com.yourcompany.locationgame",
      config: {
        googleMaps: {
          apiKey: "YOUR_GOOGLE_MAPS_API_KEY"
        }
      },
      permissions: [
        "ACCESS_FINE_LOCATION",
        "ACCESS_COARSE_LOCATION",
        "RECEIVE_BOOT_COMPLETED",
        "VIBRATE"
      ]
    },
    web: {
      favicon: "./assets/favicon.png"
    },
    plugins: [
      [
        "expo-notifications",
        {
          icon: "./assets/notification-icon.png",
          color: "#ffffff"
        }
      ],
      [
        "expo-location",
        {
          locationAlwaysAndWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location to show nearby zones and enable gameplay features.",
          locationAlwaysPermission: "Allow $(PRODUCT_NAME) to use your location to show nearby zones and enable gameplay features.",
          locationWhenInUsePermission: "Allow $(PRODUCT_NAME) to use your location to show nearby zones and enable gameplay features."
        }
      ],
      "expo-secure-store"
    ],
    scheme: "locationgame",
    extra: {
      apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL || "http://localhost:8000/api/v1"
    }
  }
};
