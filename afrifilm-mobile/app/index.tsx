import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { useAuth } from "./hooks/useAuth";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);

  useEffect(() => {
    // Attendre que la vérification d'authentification initiale soit terminée
    if (!isLoading) {
      setInitialCheckDone(true);
    }
  }, [isLoading]);

  // Afficher un écran de chargement pendant la vérification
  if (isLoading || !initialCheckDone) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FF6B00" />
      </View>
    );
  }

  // Rediriger vers la page appropriée selon le statut d'authentification
  return isAuthenticated ? (
    <Redirect href="/screens/HomeScreen" />
  ) : (
    <Redirect href="/screens/LoginScreen" />
  );
}
