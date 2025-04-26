import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import {
  Text,
  Title,
  Button,
  Chip,
  useTheme,
  Appbar,
  Divider,
  ActivityIndicator,
  IconButton,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MediaItem, ContentType } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const { width, height } = Dimensions.get("window");

export default function FilmDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const params = useLocalSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  // Récupérer les données du film depuis les paramètres
  const filmData: MediaItem = params.film
    ? JSON.parse(params.film as string)
    : null;

  if (!filmData) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator color={theme.colors.primary} size="large" />
        <Text style={{ color: theme.colors.onSurface, marginTop: 16 }}>
          Chargement du film...
        </Text>
      </View>
    );
  }

  // Fonction pour ajouter aux favoris
  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
    // Logique pour ajouter/supprimer des favoris
  };

  // Navigation vers l'écran de paiement
  const handleBuyPress = () => {
    router.push({
      pathname: "/screens/PaymentScreen",
      params: {
        mediaId: filmData.id,
        title: filmData.title,
        price: filmData.price.toString(),
      },
    });
  };

  // Navigation vers l'écran de lecture
  const handleWatchPress = () => {
    router.push({
      pathname: "/screens/PlayerScreen",
      params: {
        mediaId: filmData.id,
        title: filmData.title,
      },
    });
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style="light" />

      {/* Header transparent avec bouton retour */}
      <View style={styles.headerContainer}>
        <Appbar.Header style={styles.transparentHeader}>
          <Appbar.BackAction
            onPress={() => router.back()}
            color="#FFFFFF"
            size={24}
          />
          <Appbar.Content title="" />
          <Appbar.Action
            icon={isFavorite ? "heart" : "heart-outline"}
            color="#FFFFFF"
            size={24}
            onPress={toggleFavorite}
          />
        </Appbar.Header>
      </View>

      <ScrollView style={styles.scrollView}>
        {/* Image de couverture avec gradient */}
        <View style={styles.coverContainer}>
          <Image
            source={{
              uri: filmData.thumbnail || "https://example.com/placeholder.jpg",
            }}
            style={styles.coverImage}
            resizeMode="cover"
          />
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.8)"]}
            style={styles.gradient}
          />
          <View style={styles.filmTitleContainer}>
            <Title style={styles.filmTitle}>{filmData.title}</Title>
            <View style={styles.filmMetaContainer}>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                {filmData.year}
              </Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                {filmData.duration} min
              </Chip>
              <Chip style={styles.chip} textStyle={styles.chipText}>
                {filmData.genre}
              </Chip>
            </View>
          </View>
        </View>

        {/* Contenu principal */}
        <View style={styles.contentContainer}>
          {/* Prix et boutons d'action */}
          <View style={styles.actionContainer}>
            {filmData.price > 0 ? (
              <>
                <View style={styles.priceContainer}>
                  <Text
                    style={[
                      styles.priceLabel,
                      { color: theme.colors.onSurfaceVariant },
                    ]}
                  >
                    Prix
                  </Text>
                  <Text style={[styles.price, { color: theme.colors.primary }]}>
                    {filmData.price.toFixed(2)}€
                  </Text>
                </View>
                <Button
                  mode="contained"
                  style={[
                    styles.actionButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                  labelStyle={styles.actionButtonText}
                  onPress={handleBuyPress}
                  loading={isLoading}
                  disabled={isLoading}
                >
                  Acheter maintenant
                </Button>
              </>
            ) : (
              <Button
                mode="contained"
                style={[
                  styles.actionButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                labelStyle={styles.actionButtonText}
                onPress={handleWatchPress}
                loading={isLoading}
                disabled={isLoading}
              >
                Regarder gratuitement
              </Button>
            )}
          </View>

          <Divider style={styles.divider} />

          {/* Synopsis */}
          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Synopsis
            </Title>
            <Text
              style={[
                styles.description,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              {filmData.description}
            </Text>
          </View>

          <Divider style={styles.divider} />

          {/* Informations */}
          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Informations
            </Title>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Réalisateur
              </Text>
              <Text
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {filmData.director}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Cast
              </Text>
              <Text
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {filmData.cast}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Pays
              </Text>
              <Text
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {filmData.country}
              </Text>
            </View>

            <View style={styles.infoRow}>
              <Text
                style={[
                  styles.infoLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Langue
              </Text>
              <Text
                style={[styles.infoValue, { color: theme.colors.onSurface }]}
              >
                {filmData.language}
              </Text>
            </View>
          </View>

          <Divider style={styles.divider} />

          {/* Partager */}
          <View style={styles.shareContainer}>
            <Button
              mode="outlined"
              icon="share-variant"
              style={[
                styles.shareButton,
                { borderColor: theme.colors.primary },
              ]}
              labelStyle={{ color: theme.colors.primary }}
              onPress={() => {
                // Logique de partage
              }}
            >
              Partager
            </Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centerContent: {
    justifyContent: "center",
    alignItems: "center",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  transparentHeader: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  scrollView: {
    flex: 1,
  },
  coverContainer: {
    height: height * 0.6,
    position: "relative",
  },
  coverImage: {
    width: "100%",
    height: "100%",
  },
  gradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 200,
  },
  filmTitleContainer: {
    position: "absolute",
    bottom: 20,
    left: 16,
    right: 16,
  },
  filmTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "bold",
    textShadowColor: "rgba(0, 0, 0, 0.75)",
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  filmMetaContainer: {
    flexDirection: "row",
    marginTop: 8,
    flexWrap: "wrap",
  },
  chip: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    marginRight: 8,
    marginBottom: 8,
  },
  chipText: {
    color: "#FFFFFF",
  },
  contentContainer: {
    padding: 16,
  },
  actionContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginVertical: 16,
  },
  priceContainer: {
    flex: 1,
  },
  priceLabel: {
    fontSize: 14,
  },
  price: {
    fontSize: 24,
    fontWeight: "bold",
  },
  actionButton: {
    flex: 2,
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    marginVertical: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },
  description: {
    fontSize: 16,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: "row",
    marginBottom: 12,
    alignItems: "flex-start",
  },
  infoLabel: {
    width: 100,
    fontSize: 14,
  },
  infoValue: {
    flex: 1,
    fontSize: 14,
    fontWeight: "500",
  },
  shareContainer: {
    marginVertical: 16,
    alignItems: "center",
  },
  shareButton: {
    width: "60%",
    borderRadius: 8,
  },
});
