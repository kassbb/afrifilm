import React, { useState, useRef, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
  FlatList,
  Animated,
  ImageBackground,
  StatusBar,
  Platform,
  SafeAreaView,
} from "react-native";
import {
  Text,
  Appbar,
  Card,
  Title,
  Paragraph,
  Button,
  useTheme,
  Badge,
  Divider,
  Chip,
  SegmentedButtons,
  Surface,
  ActivityIndicator,
  FAB,
  IconButton,
  Avatar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons, Ionicons } from "@expo/vector-icons";
import { MediaItem, ContentType, UserRole } from "../types";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import MaskedView from "@react-native-masked-view/masked-view";
import {
  getFeaturedContent,
  getNewContent,
  getFreeContent,
} from "../services/api";
import { useAuth } from "../hooks/useAuth";

const { width, height } = Dimensions.get("window");
const CARD_WIDTH = (width - 48) / 2;
const HERO_HEIGHT = height * 0.5;
const SPACING = 10;

// Liste des genres pour explorer
const genres = [
  { id: "1", name: "Action", icon: "movie-open" },
  { id: "2", name: "Drame", icon: "drama-masks" },
  { id: "3", name: "Comédie", icon: "emoticon-happy-outline" },
  { id: "4", name: "Thriller", icon: "timer-sand" },
  { id: "5", name: "Romance", icon: "heart-outline" },
  { id: "6", name: "Documentaire", icon: "file-document-outline" },
];

// Données de fallback pour l'affichage en cas d'erreur API
const fallbackFeaturedContent: MediaItem[] = [
  {
    id: "1",
    title: "La Vie Est Belle",
    type: ContentType.FILM,
    thumbnail: "https://example.com/film1.jpg",
    description:
      "Un film drame poignant qui explore les thèmes de la vie quotidienne en Afrique.",
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
      "Une comédie burlesque délicieuse qui dépeint la vie dans un village africain.",
    genre: "Comédie",
    director: "Henri Duparc",
    year: "1988",
    price: 3.99,
    duration: 90,
    isFeatured: true,
    isNew: true,
  },
];

const fallbackNewContent: MediaItem[] = [
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
    price: 5.99,
    duration: 110,
    isNew: true,
  },
  {
    id: "6",
    title: "La Cité des Anges",
    type: ContentType.SERIE,
    thumbnail: "https://example.com/serie1.jpg",
    description:
      "Une série dramatique qui explore les complexités de la vie urbaine.",
    genre: "Drame",
    director: "Moussa Touré",
    year: "2023",
    price: 9.99,
    duration: 45,
    isNew: true,
  },
];

const fallbackFreeContent: MediaItem[] = [
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
    price: 0,
    duration: 105,
  },
];

// Fonction pour formater la durée
const formatDuration = (minutes?: number) => {
  if (!minutes) return "N/A";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
};

// Composant de carte de contenu standard
const ContentCard = ({
  item,
  onPress,
  index,
}: {
  item: MediaItem;
  onPress: () => void;
  index: number;
}) => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scale, {
      toValue: 0.95,
      friction: 8,
      tension: 100,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, {
      toValue: 1,
      friction: 8,
      tension: 100,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  };

  // Log de l'URL de l'image pour le débogage
  useEffect(() => {
    console.log(`Image URL pour ${item.title}:`, item.thumbnail);
  }, [item]);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
      { scale },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[styles.touchableCard, { shadowColor: theme.colors.primary }]}
      >
        <Surface
          style={[
            styles.contentCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={5 as any}
        >
          <View style={styles.cardImageContainer}>
            <Image
              source={
                imageError || !item.thumbnail
                  ? { uri: "https://via.placeholder.com/300x450?text=No+Image" }
                  : { uri: item.thumbnail }
              }
              style={styles.cardImage}
              resizeMode="cover"
              onError={() => {
                console.error(
                  `Erreur de chargement de l'image: ${item.thumbnail}`
                );
                setImageError(true);
              }}
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.8)"]}
              style={styles.cardGradient}
            />
            {item.isNew && <Badge style={styles.newBadge}>Nouveau</Badge>}
            {item.price === 0 && (
              <Badge style={styles.freeBadge}>Gratuit</Badge>
            )}
            <View style={styles.cardOverlay}>
              <View style={styles.cardOverlayContent}>
                <Badge
                  style={[
                    styles.typeBadge,
                    {
                      backgroundColor:
                        item.type === ContentType.FILM ? "#FF6B00" : "#9333EA",
                    },
                  ]}
                >
                  {item.type === ContentType.FILM ? "Film" : "Série"}
                </Badge>
                {item.genre && (
                  <Badge style={[styles.genreBadge]}>{item.genre}</Badge>
                )}
              </View>
            </View>
          </View>
          <View style={styles.cardContent}>
            <Title
              style={[styles.cardTitle, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.title}
            </Title>
            <View style={styles.cardMetaInfo}>
              <View style={styles.cardMetaItem}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={14}
                  color={theme.colors.onSurfaceVariant as string}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {item.year || "N/A"}
                </Text>
              </View>
              <View style={styles.cardMetaItem}>
                <MaterialCommunityIcons
                  name="clock-outline"
                  size={14}
                  color={theme.colors.onSurfaceVariant as string}
                />
                <Text
                  style={[
                    styles.metaText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  {formatDuration(item.duration)}
                </Text>
              </View>
            </View>
            <View style={styles.priceButtonContainer}>
              <Text style={[styles.price, { color: theme.colors.primary }]}>
                {item.price ? `${item.price.toFixed(2)}€` : "Gratuit"}
              </Text>
              <Button
                mode="contained"
                compact
                icon={
                  item.price && item.price > 0 ? "information-outline" : "play"
                }
                style={[
                  styles.cardButton,
                  { backgroundColor: theme.colors.primary },
                ]}
                labelStyle={styles.cardButtonLabel}
                onPress={onPress}
              >
                {item.price && item.price > 0 ? "Voir" : "Play"}
              </Button>
            </View>
          </View>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant de carte de genre
const GenreCard = ({
  genre,
  onPress,
  index,
}: {
  genre: { id: string; name: string; icon: string };
  onPress: () => void;
  index: number;
}) => {
  const theme = useTheme();
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: 1,
      duration: 300,
      delay: index * 50,
      useNativeDriver: Platform.OS !== "web",
    }).start();
  }, []);

  const animatedStyle = {
    opacity: animatedValue,
    transform: [
      {
        translateY: animatedValue.interpolate({
          inputRange: [0, 1],
          outputRange: [20, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={animatedStyle}>
      <TouchableOpacity activeOpacity={0.8} onPress={onPress}>
        <Surface
          style={[styles.genreCard, { backgroundColor: theme.colors.surface }]}
          elevation={3 as any}
        >
          <MaterialCommunityIcons
            name={genre.icon as any}
            size={28}
            color={theme.colors.primary}
          />
          <Text style={[styles.genreText, { color: theme.colors.onSurface }]}>
            {genre.name}
          </Text>
        </Surface>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Composant pour le rendu d'une grille de contenu
const ContentGrid = ({
  data,
  onPress,
  loading,
  emptyMessage,
}: {
  data: MediaItem[];
  onPress: (item: MediaItem) => void;
  loading: boolean;
  emptyMessage: string;
}) => {
  const theme = useTheme();

  if (loading) {
    return (
      <View style={styles.loadingGridContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.onSurfaceVariant, marginTop: 10 }}>
          Chargement...
        </Text>
      </View>
    );
  }

  if (!data || data.length === 0) {
    return (
      <View style={styles.emptyGridContainer}>
        <Text style={{ color: theme.colors.onSurfaceVariant }}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.contentGrid}>
      {data.map((item, index) => (
        <ContentCard
          key={item.id}
          item={item}
          index={index}
          onPress={() => onPress(item)}
        />
      ))}
    </View>
  );
};

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user } = useAuth();

  // État pour les données
  const [featuredData, setFeaturedData] = useState<MediaItem[]>([]);
  const [newData, setNewData] = useState<MediaItem[]>([]);
  const [freeData, setFreeData] = useState<MediaItem[]>([]);

  // État pour les onglets
  const [newContentTab, setNewContentTab] = useState("all");
  const [freeContentTab, setFreeContentTab] = useState("all");

  // État pour le chargement
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingFree, setLoadingFree] = useState(true);

  // Nouvel état pour indiquer si on utilise des données de fallback
  const [usingFallbackData, setUsingFallbackData] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Animations pour le header
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 50, 100],
    outputRange: [0, 0.5, 1],
    extrapolate: "clamp",
  });

  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 50],
    outputRange: [-50, 0],
    extrapolate: "clamp",
  });

  // Fonction pour gérer le clic sur un contenu
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

  // Fonction pour charger les données avec gestion d'erreur
  const fetchDataWithFallback = async (
    fetchFunction: () => Promise<any>,
    setter: (data: any) => void,
    fallbackData: any,
    setLoading: (loading: boolean) => void
  ) => {
    try {
      setLoading(true);
      console.log("Tentative de chargement des données depuis l'API...");
      const response = await fetchFunction();
      if (response && response.data) {
        console.log(
          "Données chargées avec succès:",
          response.data.length,
          "éléments"
        );
        setter(response.data);
        return true; // Indique que les données réelles ont été chargées
      } else {
        // Si la réponse est vide ou incorrecte, utiliser les données de fallback
        console.log(
          "Réponse vide ou incorrecte, utilisation des données de fallback"
        );
        setter(fallbackData);
        return false; // Indique que les données de fallback ont été utilisées
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error);
      // Détection plus précise des erreurs CORS
      if (error instanceof Error) {
        console.error("Message d'erreur:", error.message);
        console.error("Stack trace:", error.stack);

        // Définir le message d'erreur pour l'affichage à l'utilisateur
        if (
          error.message.includes("CORS") ||
          error.message.includes("Failed to fetch")
        ) {
          setErrorMessage(
            `Erreur de connexion à l'API. Vérifiez que votre serveur backend est bien démarré sur http://localhost:3000 et qu'il accepte les requêtes CORS.`
          );
        } else {
          setErrorMessage(
            `Erreur API: ${error.message}. Affichage des données de démonstration.`
          );
        }
      }
      // En cas d'erreur, utiliser les données de fallback
      console.log("Utilisation des données de fallback suite à une erreur");
      setter(fallbackData);
      return false; // Indique que les données de fallback ont été utilisées
    } finally {
      setLoading(false);
    }
  };

  // Fonction pour charger toutes les données
  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);

    // Chargement parallèle des trois types de contenus
    const results = await Promise.all([
      fetchDataWithFallback(
        getFeaturedContent,
        setFeaturedData,
        fallbackFeaturedContent,
        setLoadingFeatured
      ),
      fetchDataWithFallback(
        getNewContent,
        setNewData,
        fallbackNewContent,
        setLoadingNew
      ),
      fetchDataWithFallback(
        getFreeContent,
        setFreeData,
        fallbackFreeContent,
        setLoadingFree
      ),
    ]);

    // Si au moins un appel a utilisé des données de fallback
    const anyFallbackUsed = results.some((result) => result === false);
    setUsingFallbackData(anyFallbackUsed);

    setIsLoading(false);
  };

  // Fonction pour recharger les données
  const reloadData = () => {
    setErrorMessage(null);
    setUsingFallbackData(false);
    loadData();
  };

  // Chargement initial des données
  useEffect(() => {
    loadData();
  }, []);

  // Filtrer les nouveaux contenus en fonction de l'onglet sélectionné
  const filteredNewContent = newData.filter((content) => {
    if (newContentTab === "all") return true;
    if (newContentTab === "films") return content.type === ContentType.FILM;
    if (newContentTab === "series") return content.type === ContentType.SERIE;
    return true;
  });

  // Filtrer les contenus gratuits en fonction de l'onglet sélectionné
  const filteredFreeContent = freeData.filter((content) => {
    if (freeContentTab === "all") return true;
    if (freeContentTab === "films") return content.type === ContentType.FILM;
    if (freeContentTab === "series") return content.type === ContentType.SERIE;
    return true;
  });

  if (isLoading) {
    return (
      <View
        style={[
          styles.loadingContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <StatusBar
          barStyle="light-content"
          backgroundColor="transparent"
          translucent
        />
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={[styles.loadingText, { color: theme.colors.onSurface }]}>
          Chargement de votre expérience...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safeArea, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar
        barStyle="light-content"
        backgroundColor="transparent"
        translucent
      />

      {/* Notification d'erreur avec bouton de rechargement */}
      {errorMessage && (
        <Surface style={styles.errorBanner}>
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
            <Button
              mode="contained"
              onPress={reloadData}
              style={styles.reloadButton}
              labelStyle={styles.reloadButtonLabel}
            >
              Réessayer
            </Button>
          </View>
        </Surface>
      )}

      {/* Notification de données de fallback */}
      {usingFallbackData && !errorMessage && (
        <Surface style={styles.fallbackBanner}>
          <Text style={styles.fallbackText}>
            Affichage des données de démonstration
          </Text>
        </Surface>
      )}

      {/* Header flottant avec effet de blur/transparence */}
      <Animated.View
        style={[
          styles.floatingHeader,
          {
            opacity: headerOpacity,
            transform: [{ translateY: headerTranslate }],
          },
        ]}
      >
        <BlurView intensity={80} tint="dark" style={styles.blurView}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>AfriFilm</Text>
            <View style={styles.headerActions}>
              <IconButton
                icon="magnify"
                iconColor="#FFFFFF"
                size={24}
                onPress={() => router.push("/screens/SearchScreen")}
              />
              {user?.role === UserRole.CREATOR && (
                <IconButton
                  icon="video"
                  iconColor="#FFFFFF"
                  size={24}
                  onPress={() => router.push("/screens/CreatorDashboardScreen")}
                />
              )}
              <IconButton
                icon="account-circle"
                iconColor="#FFFFFF"
                size={24}
                onPress={() => router.push("/screens/ProfileScreen")}
              />
            </View>
          </View>
        </BlurView>
      </Animated.View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {/* Section Contenus en Vedette */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Contenus en Vedette
            </Title>
          </View>
          <ContentGrid
            data={featuredData}
            onPress={handleContentPress}
            loading={loadingFeatured}
            emptyMessage="Aucun contenu en vedette disponible"
          />
        </View>

        {/* Section Nouveautés */}
        <Surface
          style={[
            styles.coloredSection,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={4 as any}
        >
          <View style={styles.sectionHeader}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Nouveautés
            </Title>
            <SegmentedButtons
              value={newContentTab}
              onValueChange={setNewContentTab}
              buttons={[
                { value: "all", label: "Tous" },
                { value: "films", label: "Films" },
                { value: "series", label: "Séries" },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <ContentGrid
            data={filteredNewContent}
            onPress={handleContentPress}
            loading={loadingNew}
            emptyMessage="Aucune nouveauté disponible"
          />

          <Button
            mode="outlined"
            icon="arrow-right"
            contentStyle={styles.viewAllButtonContent}
            style={[
              styles.viewAllButton,
              { borderColor: theme.colors.primary },
            ]}
            textColor={theme.colors.primary}
            onPress={() => router.push("/screens/SearchScreen?filter=new")}
          >
            Voir toutes les nouveautés
          </Button>
        </Surface>

        {/* Section Contenus Gratuits */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Contenus Gratuits
            </Title>
            <SegmentedButtons
              value={freeContentTab}
              onValueChange={setFreeContentTab}
              buttons={[
                { value: "all", label: "Tous" },
                { value: "films", label: "Films" },
                { value: "series", label: "Séries" },
              ]}
              style={styles.segmentedButtons}
            />
          </View>

          <ContentGrid
            data={filteredFreeContent}
            onPress={handleContentPress}
            loading={loadingFree}
            emptyMessage="Aucun contenu gratuit disponible"
          />

          <Button
            mode="outlined"
            icon="arrow-right"
            contentStyle={styles.viewAllButtonContent}
            style={[
              styles.viewAllButton,
              { borderColor: theme.colors.primary },
            ]}
            textColor={theme.colors.primary}
            onPress={() => router.push("/screens/SearchScreen?filter=free")}
          >
            Voir tous les contenus gratuits
          </Button>
        </View>

        {/* Section des genres */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Explorer par genre
            </Title>
          </View>

          <View style={styles.genresGrid}>
            {genres.map((genre, index) => (
              <GenreCard
                key={genre.id}
                genre={genre}
                index={index}
                onPress={() =>
                  router.push(`/screens/SearchScreen?genre=${genre.name}`)
                }
              />
            ))}
          </View>
        </View>

        <View style={{ height: 80 }} />
      </ScrollView>

      {/* Navigation du bas */}
      <Surface style={styles.bottomNavigation} elevation={4 as any}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => {
            /* Déjà sur l'écran d'accueil */
          }}
        >
          <MaterialCommunityIcons name="home" size={26} color="#FF6B00" />
          <Text style={[styles.navLabel, { color: "#FF6B00" }]}>Accueil</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/screens/SearchScreen")}
        >
          <MaterialCommunityIcons name="magnify" size={26} color="#AAAAAA" />
          <Text style={styles.navLabel}>Explorer</Text>
        </TouchableOpacity>

        {user?.role === UserRole.CREATOR && (
          <TouchableOpacity
            style={styles.navItem}
            onPress={() => router.push("/screens/CreatorDashboardScreen")}
          >
            <MaterialCommunityIcons name="video" size={26} color="#AAAAAA" />
            <Text style={styles.navLabel}>Créateur</Text>
          </TouchableOpacity>
        )}

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => router.push("/screens/ProfileScreen")}
        >
          <MaterialCommunityIcons name="account" size={26} color="#AAAAAA" />
          <Text style={styles.navLabel}>Profil</Text>
        </TouchableOpacity>
      </Surface>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  container: {
    flex: 1,
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
  loadingGridContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyGridContainer: {
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    elevation: 4,
  },
  avatar: {
    marginHorizontal: 10,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  coloredSection: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    borderRadius: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    flexWrap: "wrap",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  contentGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  genresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  touchableCard: {
    width: CARD_WIDTH,
    marginBottom: 16,
    borderRadius: 12,
    ...Platform.select({
      ios: {
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowColor: "#000",
      },
      android: {
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
        shadowColor: "#000",
      },
      web: {
        boxShadow: "0px 5px 10px rgba(0, 0, 0, 0.1)",
      },
    }),
  },
  contentCard: {
    borderRadius: 12,
    overflow: "hidden",
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: 150,
  },
  cardImage: {
    width: "100%",
    height: "100%",
  },
  cardGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: "50%",
  },
  newBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "#34C759",
  },
  freeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    zIndex: 2,
    backgroundColor: "#4A90E2",
  },
  cardOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 8,
  },
  cardOverlayContent: {
    flexDirection: "row",
    alignItems: "center",
  },
  typeBadge: {
    borderRadius: 4,
  },
  genreBadge: {
    marginLeft: 8,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 4,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  cardMetaInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  cardMetaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 12,
  },
  metaText: {
    fontSize: 12,
    marginLeft: 4,
  },
  priceButtonContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "bold",
  },
  cardButton: {
    borderRadius: 4,
    paddingHorizontal: 0,
  },
  cardButtonLabel: {
    fontSize: 12,
    margin: 0,
  },
  genreCard: {
    width: width / 3 - 20,
    height: 90,
    marginBottom: 12,
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  genreText: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "500",
  },
  viewAllButton: {
    marginTop: 16,
    alignSelf: "center",
  },
  viewAllButtonContent: {
    paddingHorizontal: 8,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
  },
  navText: {
    fontSize: 12,
    marginTop: -5,
  },
  floatingHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  blurView: {
    flex: 1,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  bottomNavigation: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 24 : 8,
    borderTopWidth: 1,
    borderTopColor: "rgba(255,255,255,0.1)",
  },
  navLabel: {
    fontSize: 12,
    marginTop: -5,
  },
  errorBanner: {
    backgroundColor: "#ff4444",
    padding: 10,
    width: "100%",
    zIndex: 10,
  },
  errorContainer: {
    flexDirection: "column",
    alignItems: "center",
    gap: 10,
  },
  errorText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
  },
  reloadButton: {
    backgroundColor: "white",
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 5,
  },
  reloadButtonLabel: {
    color: "#ff4444",
    fontSize: 12,
    fontWeight: "bold",
  },
  fallbackBanner: {
    backgroundColor: "#ff8800",
    padding: 8,
    width: "100%",
    zIndex: 10,
  },
  fallbackText: {
    color: "white",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 12,
  },
});
