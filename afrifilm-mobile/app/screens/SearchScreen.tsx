import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Platform,
  SafeAreaView,
  FlatList,
} from "react-native";
import {
  Searchbar,
  Text,
  Title,
  Chip,
  useTheme,
  Appbar,
  ActivityIndicator,
  Divider,
  Surface,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MediaItem, ContentType } from "../types";

const { width } = Dimensions.get("window");

// Composant pour les suggestions de recherche
const SearchSuggestion = ({
  text,
  onPress,
}: {
  text: string;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.suggestion, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <Text style={{ color: theme.colors.onSurface }}>{text}</Text>
    </TouchableOpacity>
  );
};

// Composant pour les résultats de recherche
const SearchResult = ({
  item,
  onPress,
}: {
  item: MediaItem;
  onPress: () => void;
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      style={[styles.resultItem, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.resultImageContainer}>
        {item.thumbnail ? (
          <View
            style={[
              styles.resultImage,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        ) : (
          <View
            style={[
              styles.resultImagePlaceholder,
              { backgroundColor: theme.colors.surfaceVariant },
            ]}
          />
        )}
        <View
          style={[
            styles.resultTypeBadge,
            {
              backgroundColor:
                item.type === ContentType.FILM ? "#FF6B00" : "#9333EA",
            },
          ]}
        >
          <Text style={styles.resultTypeBadgeText}>
            {item.type === ContentType.FILM ? "Film" : "Série"}
          </Text>
        </View>
      </View>
      <View style={styles.resultContent}>
        <Text
          style={[styles.resultTitle, { color: theme.colors.onSurface }]}
          numberOfLines={1}
        >
          {item.title}
        </Text>
        <Text
          style={[
            styles.resultDetails,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {item.year} • {item.genre}
        </Text>
        <Text
          style={[
            styles.resultDescription,
            { color: theme.colors.onSurfaceVariant },
          ]}
          numberOfLines={2}
        >
          {item.description}
        </Text>
        <Text style={[styles.resultPrice, { color: theme.colors.primary }]}>
          {item.price ? `${item.price.toFixed(2)}€` : "Gratuit"}
        </Text>
      </View>
    </TouchableOpacity>
  );
};

// Données de test pour les recherches récentes
const recentSearches = [
  "Afrique",
  "Documentaire",
  "Comédie africaine",
  "Films burkinabés",
  "Souleymane Cissé",
];

// Données de test pour les genres populaires
const popularGenres = [
  { id: "1", name: "Drame" },
  { id: "2", name: "Comédie" },
  { id: "3", name: "Action" },
  { id: "4", name: "Documentaire" },
  { id: "5", name: "Thriller" },
  { id: "6", name: "Romance" },
];

// Données de test pour les films en vedette
const featuredContent: MediaItem[] = [
  {
    id: "1",
    title: "La Vie Est Belle",
    type: ContentType.FILM,
    thumbnail: "https://example.com/film1.jpg",
    description:
      "Un film drame poignant qui explore les thèmes de la vie quotidienne en Afrique avec humour et tendresse.",
    genre: "Drame",
    director: "Mweze Ngangura",
    year: "1987",
    country: "RDC",
    language: "Français",
    cast: "Papa Wemba, Mwamba Ngandu",
    isFeatured: true,
    isNew: true,
    price: 4.99,
    duration: 85,
  },
  {
    id: "2",
    title: "Bal Poussière",
    type: ContentType.FILM,
    thumbnail: "https://example.com/film2.jpg",
    description:
      "Une comédie burlesque délicieuse qui dépeint la vie dans un village africain avec beaucoup d'humour.",
    genre: "Comédie",
    director: "Henri Duparc",
    year: "1988",
    country: "Côte d'Ivoire",
    language: "Français",
    cast: "Sidiki Bakaba, Isaach de Bankolé",
    isFeatured: true,
    isNew: true,
    price: 3.99,
    duration: 90,
  },
];

// Données de test pour les nouveaux contenus
const newContent: MediaItem[] = [
  {
    id: "5",
    title: "Le Silence des Justes",
    type: ContentType.FILM,
    thumbnail: "https://example.com/film5.jpg",
    description:
      "Un thriller captivant qui maintient le suspense jusqu'à la dernière minute.",
    genre: "Thriller",
    director: "Jean-Pierre Bekolo",
    year: "2023",
    country: "Cameroun",
    language: "Français",
    cast: "Adèle Ado, Jean-Pierre Bekolo",
    isFeatured: false,
    isNew: true,
    price: 5.99,
    duration: 110,
  },
  {
    id: "6",
    title: "La Cité des Anges",
    type: ContentType.SERIE,
    thumbnail: "https://example.com/serie1.jpg",
    description:
      "Une série dramatique qui explore les complexités de la vie urbaine en Afrique contemporaine.",
    genre: "Drame",
    director: "Moussa Touré",
    year: "2023",
    country: "Sénégal",
    language: "Wolof",
    cast: "Moussa Touré, Aminata Diallo",
    isFeatured: false,
    isNew: true,
    price: 9.99,
    duration: 45,
  },
];

// Données de test pour les contenus gratuits
const freeContent: MediaItem[] = [
  {
    id: "9",
    title: "Moolaadé",
    type: ContentType.FILM,
    thumbnail: "https://example.com/film8.jpg",
    description:
      "Un drame sur la lutte contre l'excision dans un village africain.",
    genre: "Drame",
    director: "Ousmane Sembène",
    year: "2004",
    country: "Sénégal",
    language: "Wolof",
    cast: "Fatoumata Coulibaly, Maimouna Hélène Diarra",
    isFeatured: false,
    isNew: false,
    price: 0,
    duration: 124,
  },
  {
    id: "10",
    title: "Yeelen",
    type: ContentType.FILM,
    thumbnail: "https://example.com/film9.jpg",
    description: "Un voyage initiatique dans l'Afrique mystique.",
    genre: "Drame",
    director: "Souleymane Cissé",
    year: "1987",
    country: "Mali",
    language: "Bambara",
    cast: "Issiaka Kane, Aoua Sangare",
    isFeatured: false,
    isNew: false,
    price: 0,
    duration: 105,
  },
];

// Combiner toutes les données pour la recherche
const allContent = [...featuredContent, ...newContent, ...freeContent].reduce(
  (acc: MediaItem[], current: MediaItem) => {
    const x = acc.find((item) => item.id === current.id);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  },
  []
);

export default function SearchScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [showRecentSearches, setShowRecentSearches] = useState(true);
  const [searchResults, setSearchResults] = useState<MediaItem[]>([]);

  // Simuler une recherche
  useEffect(() => {
    if (searchQuery.trim() === "") {
      setSearchResults([]);
      setShowRecentSearches(true);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    setShowRecentSearches(false);

    // Simuler un délai de recherche
    const timer = setTimeout(() => {
      const results = allContent.filter(
        (item) =>
          item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.genre?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.director?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.cast?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(results);
      setIsSearching(false);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Gérer la recherche par genre
  const handleGenrePress = (genreName: string) => {
    setSearchQuery(genreName);
  };

  // Gérer la pression sur un élément de recherche récente
  const handleRecentSearchPress = (search: string) => {
    setSearchQuery(search);
  };

  // Naviguer vers les détails du contenu
  const handleContentPress = (content: MediaItem) => {
    if (content.type === ContentType.FILM) {
      router.push({
        pathname: "/screens/FilmDetailsScreen",
        params: { film: JSON.stringify(content) },
      });
    } else {
      router.push({
        pathname: "/screens/SerieDetailsScreen",
        params: { serie: JSON.stringify(content) },
      });
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style="light" />

      <Appbar.Header
        style={[styles.header, { backgroundColor: theme.colors.surface }]}
      >
        <Appbar.BackAction onPress={() => router.back()} />
        <Appbar.Content title="Recherche" />
      </Appbar.Header>

      <Searchbar
        placeholder="Films, séries, acteurs..."
        onChangeText={setSearchQuery}
        value={searchQuery}
        style={[styles.searchBar, { backgroundColor: theme.colors.surface }]}
        iconColor={theme.colors.onSurfaceVariant}
        inputStyle={{ color: theme.colors.onSurface }}
        placeholderTextColor={theme.colors.onSurfaceVariant}
        onClearIconPress={() => {
          setSearchQuery("");
          setShowRecentSearches(true);
        }}
      />

      {isSearching ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text
            style={[
              styles.loadingText,
              { color: theme.colors.onSurfaceVariant },
            ]}
          >
            Recherche en cours...
          </Text>
        </View>
      ) : showRecentSearches ? (
        <ScrollView
          style={styles.scrollContent}
          contentContainerStyle={styles.scrollContentContainer}
        >
          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Recherches récentes
            </Title>
            <View style={styles.recentSearchesContainer}>
              {recentSearches.map((search, index) => (
                <SearchSuggestion
                  key={index}
                  text={search}
                  onPress={() => handleRecentSearchPress(search)}
                />
              ))}
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.section}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Catégories populaires
            </Title>
            <View style={styles.genresContainer}>
              {popularGenres.map((genre) => (
                <Chip
                  key={genre.id}
                  style={[
                    styles.genreChip,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  textStyle={{ color: theme.colors.onSurface }}
                  onPress={() => handleGenrePress(genre.name)}
                >
                  {genre.name}
                </Chip>
              ))}
            </View>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={searchResults}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.resultsContainer}
          ListEmptyComponent={
            <View style={styles.emptyResultsContainer}>
              <Text
                style={[
                  styles.emptyResultsText,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Aucun résultat trouvé pour "{searchQuery}"
              </Text>
            </View>
          }
          ItemSeparatorComponent={() => (
            <Divider style={styles.resultDivider} />
          )}
          renderItem={({ item }) => (
            <SearchResult
              item={item}
              onPress={() => handleContentPress(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 0,
  },
  searchBar: {
    margin: 16,
    elevation: 4,
    borderRadius: 8,
  },
  scrollContent: {
    flex: 1,
  },
  scrollContentContainer: {
    paddingBottom: 20,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  recentSearchesContainer: {
    marginTop: 8,
  },
  suggestion: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 8,
  },
  genreChip: {
    margin: 4,
  },
  divider: {
    height: 1,
    marginVertical: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
  },
  resultsContainer: {
    padding: 16,
  },
  resultItem: {
    flexDirection: "row",
    borderRadius: 8,
    overflow: "hidden",
    marginBottom: 8,
  },
  resultImageContainer: {
    width: 100,
    height: 150,
    position: "relative",
  },
  resultImage: {
    width: "100%",
    height: "100%",
  },
  resultImagePlaceholder: {
    width: "100%",
    height: "100%",
  },
  resultTypeBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  resultTypeBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "bold",
  },
  resultContent: {
    flex: 1,
    padding: 12,
  },
  resultTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  resultDetails: {
    fontSize: 12,
    marginBottom: 8,
  },
  resultDescription: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 8,
  },
  resultPrice: {
    fontSize: 16,
    fontWeight: "bold",
  },
  resultDivider: {
    height: 1,
    marginVertical: 8,
  },
  emptyResultsContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyResultsText: {
    fontSize: 16,
    textAlign: "center",
  },
});
