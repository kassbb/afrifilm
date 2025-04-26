import React from "react";
import { View, StyleSheet, ScrollView } from "react-native";
import {
  Text,
  Appbar,
  Title,
  Button,
  useTheme,
  Surface,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function TermsScreen() {
  const theme = useTheme();
  const router = useRouter();

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style="light" />

      <Appbar.Header>
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Conditions d'Utilisation" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.surface}>
          <Title style={styles.sectionTitle}>
            Conditions Générales d'Utilisation
          </Title>

          <Text style={styles.paragraph}>
            Bienvenue sur AfriFilm. En utilisant notre service, vous acceptez
            les conditions suivantes.
          </Text>

          <Text style={styles.sectionHeader}>
            1. Acceptation des Conditions
          </Text>
          <Text style={styles.paragraph}>
            En accédant ou en utilisant le service AfriFilm, vous acceptez
            d'être lié par ces Conditions. Si vous n'acceptez pas ces
            Conditions, vous ne pouvez pas accéder au service.
          </Text>

          <Text style={styles.sectionHeader}>
            2. Modifications des Conditions
          </Text>
          <Text style={styles.paragraph}>
            Nous nous réservons le droit de modifier ces conditions à tout
            moment. Nous vous informerons de tout changement en publiant les
            nouvelles conditions sur cette page.
          </Text>

          <Text style={styles.sectionHeader}>3. Compte Utilisateur</Text>
          <Text style={styles.paragraph}>
            Pour utiliser certaines fonctionnalités du service, vous devez créer
            un compte. Vous êtes responsable de la sauvegarde de votre mot de
            passe et des activités qui se produisent sous votre compte.
          </Text>

          <Text style={styles.sectionHeader}>4. Contenu</Text>
          <Text style={styles.paragraph}>
            Notre service permet d'accéder à des films et séries africains. Le
            contenu disponible peut être soumis à des droits d'auteur et à
            d'autres droits de propriété intellectuelle.
          </Text>

          <Text style={styles.sectionHeader}>5. Règles de Conduite</Text>
          <Text style={styles.paragraph}>
            Vous acceptez de ne pas utiliser le service pour des activités
            illégales, frauduleuses ou pour distribuer des virus informatiques
            ou tout autre code malveillant.
          </Text>

          <Text style={styles.sectionHeader}>6. Comptes Créateurs</Text>
          <Text style={styles.paragraph}>
            Les créateurs de contenu acceptent d'être responsables du contenu
            qu'ils téléversent et garantissent qu'ils possèdent tous les droits
            nécessaires pour distribuer ce contenu via notre service.
          </Text>

          <Text style={styles.sectionHeader}>
            7. Paiements et Remboursements
          </Text>
          <Text style={styles.paragraph}>
            Certains contenus peuvent nécessiter un paiement pour y accéder. Les
            paiements sont traités par des services tiers. Les remboursements
            sont soumis à notre politique de remboursement.
          </Text>

          <Text style={styles.sectionHeader}>8. Résiliation</Text>
          <Text style={styles.paragraph}>
            Nous nous réservons le droit de résilier ou de suspendre votre
            compte immédiatement, sans préavis ni responsabilité, pour quelque
            raison que ce soit, y compris, sans limitation, si vous violez les
            Conditions.
          </Text>

          <Text style={styles.sectionHeader}>
            9. Limitation de Responsabilité
          </Text>
          <Text style={styles.paragraph}>
            En aucun cas AfriFilm, ses directeurs, employés, partenaires,
            agents, fournisseurs ou affiliés ne seront responsables de tout
            dommage indirect, accessoire, spécial, consécutif ou punitif.
          </Text>

          <Text style={styles.sectionHeader}>10. Loi Applicable</Text>
          <Text style={styles.paragraph}>
            Ces conditions sont régies et interprétées conformément aux lois en
            vigueur, sans égard aux principes de conflits de lois.
          </Text>

          <Button
            mode="contained"
            onPress={() => router.back()}
            style={styles.button}
          >
            Retour
          </Button>
        </Surface>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  surface: {
    margin: 16,
    padding: 16,
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 16,
  },
  button: {
    marginTop: 20,
  },
});
