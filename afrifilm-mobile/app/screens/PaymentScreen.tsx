import React, { useState } from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Appbar,
  Button,
  Text,
  useTheme,
  Card,
  TextInput,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";

export default function PaymentScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const contentId = params.contentId as string;
  const amount = parseFloat(params.amount as string);

  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePayment = async () => {
    setIsProcessing(true);
    try {
      // Simuler une requête de paiement
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Rediriger vers l'écran de succès
      router.push({
        pathname: "/screens/PaymentSuccessScreen",
        params: { contentId },
      });
    } catch (error) {
      console.error("Erreur de paiement:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <Appbar.Header
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Paiement Orange Money" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        {/* Résumé de la transaction */}
        <Card
          style={[
            styles.summaryCard,
            { backgroundColor: theme.colors.surface },
          ]}
        >
          <Card.Content>
            <Text
              style={[styles.summaryTitle, { color: theme.colors.onSurface }]}
            >
              Résumé de la transaction
            </Text>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Montant
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                {amount.toFixed(2)}€
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Frais de service
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                0.00€
              </Text>
            </View>
            <View
              style={[
                styles.summaryDivider,
                { backgroundColor: theme.colors.outlineVariant },
              ]}
            />
            <View style={styles.summaryRow}>
              <Text
                style={[
                  styles.summaryLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Total
              </Text>
              <Text
                style={[styles.summaryValue, { color: theme.colors.onSurface }]}
              >
                {amount.toFixed(2)}€
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* Formulaire Orange Money */}
        <Card
          style={[styles.formCard, { backgroundColor: theme.colors.surface }]}
        >
          <Card.Content>
            <Text style={[styles.formTitle, { color: theme.colors.onSurface }]}>
              Informations Orange Money
            </Text>

            <TextInput
              label="Numéro Orange Money"
              value={phoneNumber}
              onChangeText={(text) =>
                setPhoneNumber(text.replace(/[^0-9]/g, ""))
              }
              keyboardType="numeric"
              style={styles.input}
              maxLength={9}
              placeholder="Ex: 0612345678"
            />

            <TextInput
              label="Code de confirmation"
              value={code}
              onChangeText={(text) => setCode(text.replace(/[^0-9]/g, ""))}
              keyboardType="numeric"
              style={styles.input}
              maxLength={4}
              secureTextEntry
              placeholder="Code à 4 chiffres"
            />

            <Text
              style={[
                styles.helpText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Pour la démo, utilisez le code 1234
            </Text>
          </Card.Content>
        </Card>

        {/* Bouton de paiement */}
        <Button
          mode="contained"
          onPress={handlePayment}
          loading={isProcessing}
          disabled={isProcessing || !phoneNumber || code.length !== 4}
          style={styles.payButton}
        >
          {isProcessing ? "Traitement..." : "Payer avec Orange Money"}
        </Button>

        <Text
          style={[styles.disclaimer, { color: theme.colors.onSurfaceVariant }]}
        >
          Ceci est une simulation de paiement Orange Money pour des fins de
          démonstration. Aucun paiement réel ne sera effectué.
        </Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 0,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    marginBottom: 16,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  summaryLabel: {
    fontSize: 16,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    marginVertical: 16,
  },
  formCard: {
    marginBottom: 16,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  input: {
    marginBottom: 16,
  },
  helpText: {
    fontSize: 12,
    textAlign: "center",
    marginTop: 8,
  },
  payButton: {
    marginTop: 8,
    marginBottom: 32,
  },
  disclaimer: {
    fontSize: 12,
    textAlign: "center",
    marginBottom: 32,
  },
});
