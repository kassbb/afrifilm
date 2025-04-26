import React from "react";
import { Stack } from "expo-router";
import { Provider as PaperProvider, MD3DarkTheme } from "react-native-paper";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { RootStackParamList } from "./types";
import { Platform } from "react-native";
import { AuthProvider } from "./hooks/useAuth";

// Thème personnalisé
const theme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: "#FF6B00",
    onPrimary: "#FFFFFF",
    primaryContainer: "#551D00",
    onPrimaryContainer: "#FFAC82",
    background: "#1A1A1A",
    surface: "#222222",
    onSurface: "#E6E6E6",
    onSurfaceVariant: "#AEAEAE",
    outlineVariant: "#444444",
  },
};

// Configuration spécifique pour Web
const webConfig = {
  style: {
    fontFamily:
      Platform.OS === "web"
        ? "Inter, system-ui, Avenir, Helvetica, Arial, sans-serif"
        : undefined,
  },
};

export default function Layout() {
  return (
    <SafeAreaProvider
      style={Platform.OS === "web" ? { margin: 0, padding: 0 } : undefined}
    >
      <AuthProvider>
        <PaperProvider theme={theme}>
          <Stack
            screenOptions={{
              headerShown: false,
              animation: "slide_from_right",
            }}
          >
            <Stack.Screen
              name="index"
              // Ajouter des métadonnées pour le web pour éviter les warnings
              options={{
                contentStyle:
                  Platform.OS === "web" ? { margin: 0, padding: 0 } : undefined,
              }}
            />
            <Stack.Screen name="screens/HomeScreen" />
            <Stack.Screen name="screens/SearchScreen" />
            <Stack.Screen name="screens/FilmDetailsScreen" />
            <Stack.Screen name="screens/SerieDetailsScreen" />
            <Stack.Screen name="screens/PaymentScreen" />
            <Stack.Screen name="screens/PaymentSuccessScreen" />
            <Stack.Screen name="screens/ProfileScreen" />
            <Stack.Screen name="screens/CreatorDashboardScreen" />
            <Stack.Screen name="screens/PlayerScreen" />

            {/* Nouveaux écrans d'authentification */}
            <Stack.Screen name="screens/LoginScreen" />
            <Stack.Screen name="screens/RegisterScreen" />
            <Stack.Screen name="screens/ForgotPasswordScreen" />
            <Stack.Screen name="screens/TermsScreen" />
          </Stack>
        </PaperProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
