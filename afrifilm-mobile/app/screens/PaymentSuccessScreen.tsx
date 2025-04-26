import React from "react";
import { View, StyleSheet } from "react-native";
import { Button, Text, useTheme } from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function PaymentSuccessScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const contentId = params.contentId as string;

  const handleWatchPress = () => {
    router.push({
      pathname: "/screens/FilmDetailsScreen",
      params: { film: JSON.stringify({ id: contentId }) },
    });
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.content}>
        <MaterialCommunityIcons
          name="check-circle"
          size={80}
          color={theme.colors.primary}
          style={styles.icon}
        />

        <Text style={[styles.title, { color: theme.colors.onSurface }]}>
          Paiement réussi !
        </Text>

        <Text
          style={[styles.message, { color: theme.colors.onSurfaceVariant }]}
        >
          Votre transaction a été effectuée avec succès. Vous pouvez maintenant
          regarder le contenu.
        </Text>

        <Button
          mode="contained"
          onPress={handleWatchPress}
          style={styles.button}
        >
          Regarder maintenant
        </Button>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  content: {
    alignItems: "center",
    maxWidth: 400,
  },
  icon: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 32,
    lineHeight: 24,
  },
  button: {
    width: "100%",
  },
});
