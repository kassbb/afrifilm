import React from "react";
import { View, ScrollView, StyleSheet, Image } from "react-native";
import {
  Text,
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  useTheme,
  Badge,
} from "react-native-paper";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SerieDetails } from "../types";

export default function SerieDetailsScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { serie } = useLocalSearchParams();
  const serieDetails: SerieDetails = JSON.parse(serie as string);

  const handleWatchPress = () => {
    if (serieDetails.price && serieDetails.price > 0) {
      router.push({
        pathname: "/screens/PaymentScreen",
        params: {
          contentId: serieDetails.id,
          amount: serieDetails.price,
        },
      });
    } else {
      // Naviguer vers le lecteur vidéo
      // TODO: Implémenter la navigation vers le lecteur vidéo
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
        <Appbar.Content title="Détails de la série" />
      </Appbar.Header>

      <ScrollView style={styles.scrollView}>
        <Image
          source={{ uri: serieDetails.thumbnail }}
          style={styles.coverImage}
        />

        <View style={styles.content}>
          <Title style={[styles.title, { color: theme.colors.onSurface }]}>
            {serieDetails.title}
          </Title>

          <View style={styles.metaInfo}>
            <Badge style={{ backgroundColor: theme.colors.primary }}>
              {serieDetails.genre}
            </Badge>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {serieDetails.year} • {serieDetails.country} •{" "}
              {serieDetails.language}
            </Text>
          </View>

          <Paragraph
            style={[styles.synopsis, { color: theme.colors.onSurface }]}
          >
            {serieDetails.description}
          </Paragraph>

          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Réalisateur
            </Title>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {serieDetails.director}
            </Text>
          </View>

          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Distribution
            </Title>
            <Text style={{ color: theme.colors.onSurfaceVariant }}>
              {serieDetails.cast}
            </Text>
          </View>

          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Saisons
            </Title>
            {serieDetails.seasons?.map((season) => (
              <Card
                key={season.id}
                style={[
                  styles.seasonCard,
                  { backgroundColor: theme.colors.surface },
                ]}
              >
                <Card.Content>
                  <Title style={{ color: theme.colors.onSurface }}>
                    Saison {season.number}
                    {season.title && ` - ${season.title}`}
                  </Title>
                  <Text style={{ color: theme.colors.onSurfaceVariant }}>
                    {season.episodes.length} épisodes
                  </Text>
                </Card.Content>
              </Card>
            ))}
          </View>
        </View>
      </ScrollView>

      <View style={[styles.footer, { backgroundColor: theme.colors.surface }]}>
        <Button
          mode="contained"
          onPress={handleWatchPress}
          style={styles.watchButton}
        >
          {serieDetails.price && serieDetails.price > 0
            ? `Regarder pour ${serieDetails.price.toFixed(2)}€`
            : "Regarder"}
        </Button>
      </View>
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
  },
  coverImage: {
    width: "100%",
    height: 300,
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 24,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  synopsis: {
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    marginBottom: 8,
  },
  seasonCard: {
    marginBottom: 8,
    elevation: 2,
  },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: "#3D3D3D",
  },
  watchButton: {
    marginTop: 8,
  },
});
