import React, { useState } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Platform,
  Dimensions,
} from "react-native";
import {
  Text,
  Title,
  Button,
  Card,
  useTheme,
  Appbar,
  Divider,
  ActivityIndicator,
  Chip,
  FAB,
  List,
  Badge,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MediaItem, ContentType, Transaction } from "../types";
import { MaterialCommunityIcons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

// Données factices pour le contenu du créateur
const creatorMedia: MediaItem[] = [
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

// Données factices pour les revenus
const revenueData = {
  totalRevenue: 1250.75,
  thisMonth: 450.25,
  lastMonth: 375.5,
  pendingPayment: 120.0,
};

// Données factices pour les transactions
const recentTransactions: Transaction[] = [
  {
    id: "1",
    mediaId: "1",
    mediaTitle: "La Vie Est Belle",
    amount: 4.99,
    createdAt: "2024-05-30T15:30:00Z",
    status: "COMPLETED",
    paymentMethod: "ORANGE_MONEY",
  },
  {
    id: "2",
    mediaId: "2",
    mediaTitle: "Bal Poussière",
    amount: 3.99,
    createdAt: "2024-05-29T10:15:00Z",
    status: "COMPLETED",
    paymentMethod: "ORANGE_MONEY",
  },
];

// Composant pour afficher un élément de contenu
const MediaListItem = ({
  item,
  onPress,
  onEdit,
}: {
  item: MediaItem;
  onPress: () => void;
  onEdit: () => void;
}) => {
  const theme = useTheme();

  return (
    <Card
      style={[styles.mediaCard, { backgroundColor: theme.colors.surface }]}
      onPress={onPress}
    >
      <View style={styles.mediaCardContent}>
        <View
          style={[
            styles.mediaImage,
            { backgroundColor: theme.colors.surfaceVariant },
          ]}
        />
        <View style={styles.mediaDetails}>
          <View style={styles.mediaTitleRow}>
            <Text
              style={[styles.mediaTitle, { color: theme.colors.onSurface }]}
              numberOfLines={1}
            >
              {item.title}
            </Text>
            <Badge
              style={[
                styles.typeChip,
                {
                  backgroundColor:
                    item.type === ContentType.FILM ? "#FF6B00" : "#9333EA",
                },
              ]}
            >
              {item.type === ContentType.FILM ? "Film" : "Série"}
            </Badge>
          </View>

          <Text
            style={[styles.mediaInfo, { color: theme.colors.onSurfaceVariant }]}
          >
            {item.year} • {item.duration} min • {item.genre}
          </Text>

          <View style={styles.mediaStats}>
            <Chip
              icon="currency-usd"
              style={styles.statChip}
              textStyle={{ color: theme.colors.onSurface }}
            >
              {item.price?.toFixed(2)}€
            </Chip>
            <Chip
              icon="eye"
              style={styles.statChip}
              textStyle={{ color: theme.colors.onSurface }}
            >
              {Math.floor(Math.random() * 500)} vues
            </Chip>
          </View>

          <Button
            mode="outlined"
            style={[styles.editButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
            onPress={onEdit}
          >
            Modifier
          </Button>
        </View>
      </View>
    </Card>
  );
};

// Composant pour afficher la section des revenus
const RevenueSection = () => {
  const theme = useTheme();

  return (
    <Card
      style={[styles.revenueCard, { backgroundColor: theme.colors.surface }]}
    >
      <Card.Content>
        <Title style={[styles.sectionTitle, { color: theme.colors.onSurface }]}>
          Revenus
        </Title>

        <View style={styles.revenueContainer}>
          <View style={styles.totalRevenueContainer}>
            <Text
              style={[
                styles.totalRevenueLabel,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Revenus totaux
            </Text>
            <Text
              style={[
                styles.totalRevenueValue,
                { color: theme.colors.primary },
              ]}
            >
              {revenueData.totalRevenue.toFixed(2)}€
            </Text>
          </View>

          <View style={styles.revenueStatsContainer}>
            <View style={styles.revenueStat}>
              <Text
                style={[
                  styles.revenueStatLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Ce mois
              </Text>
              <Text
                style={[
                  styles.revenueStatValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueData.thisMonth.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.revenueStat}>
              <Text
                style={[
                  styles.revenueStatLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                Mois dernier
              </Text>
              <Text
                style={[
                  styles.revenueStatValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueData.lastMonth.toFixed(2)}€
              </Text>
            </View>

            <View style={styles.revenueStat}>
              <Text
                style={[
                  styles.revenueStatLabel,
                  { color: theme.colors.onSurfaceVariant },
                ]}
              >
                En attente
              </Text>
              <Text
                style={[
                  styles.revenueStatValue,
                  { color: theme.colors.onSurface },
                ]}
              >
                {revenueData.pendingPayment.toFixed(2)}€
              </Text>
            </View>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

// Fonction pour formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export default function CreatorDashboardScreen() {
  const theme = useTheme();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"content" | "transactions">(
    "content"
  );
  const [isLoading, setIsLoading] = useState(false);

  // Fonction pour naviguer vers les détails du média
  const handleMediaPress = (media: MediaItem) => {
    if (media.type === ContentType.FILM) {
      router.push({
        pathname: "/screens/FilmDetailsScreen",
        params: { film: JSON.stringify(media) },
      });
    } else {
      router.push({
        pathname: "/screens/SerieDetailsScreen",
        params: { serie: JSON.stringify(media) },
      });
    }
  };

  // Fonction pour naviguer vers l'écran de modification
  const handleEditPress = (media: MediaItem) => {
    router.push({
      pathname: "/screens/FilmDetailsScreen",
      params: { film: JSON.stringify(media), edit: "true" },
    });
  };

  // Fonction pour naviguer vers l'écran d'ajout de contenu
  const handleAddPress = () => {
    router.push("/screens/FilmDetailsScreen?new=true");
  };

  // Rendu du contenu en fonction de l'onglet actif
  const renderTabContent = () => {
    switch (activeTab) {
      case "content":
        return (
          <>
            <RevenueSection />

            <View style={styles.contentSection}>
              <Title
                style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
              >
                Mon contenu
              </Title>

              {isLoading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                </View>
              ) : (
                <FlatList
                  data={creatorMedia}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <MediaListItem
                      item={item}
                      onPress={() => handleMediaPress(item)}
                      onEdit={() => handleEditPress(item)}
                    />
                  )}
                  ItemSeparatorComponent={() => (
                    <View style={styles.separator} />
                  )}
                  ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                      <MaterialCommunityIcons
                        name="movie-off"
                        size={48}
                        color={theme.colors.onSurfaceVariant}
                      />
                      <Text
                        style={[
                          styles.emptyText,
                          { color: theme.colors.onSurfaceVariant },
                        ]}
                      >
                        Vous n'avez pas encore ajouté de contenu
                      </Text>
                      <Button
                        mode="contained"
                        style={[
                          styles.addButton,
                          { backgroundColor: theme.colors.primary },
                        ]}
                        onPress={handleAddPress}
                      >
                        Ajouter du contenu
                      </Button>
                    </View>
                  }
                />
              )}
            </View>
          </>
        );

      case "transactions":
        return (
          <View style={styles.transactionsSection}>
            <Title
              style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
            >
              Transactions récentes
            </Title>

            {isLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
              </View>
            ) : (
              <FlatList
                data={recentTransactions}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <List.Item
                    title={item.mediaTitle}
                    description={`${formatDate(item.createdAt)} • Orange Money`}
                    titleStyle={{ color: theme.colors.onSurface }}
                    descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
                    right={(props) => (
                      <Text
                        {...props}
                        style={[
                          styles.transactionAmount,
                          { color: theme.colors.primary },
                        ]}
                      >
                        +{item.amount.toFixed(2)}€
                      </Text>
                    )}
                    style={[
                      styles.transactionItem,
                      { backgroundColor: theme.colors.surface },
                    ]}
                  />
                )}
                ItemSeparatorComponent={() => <Divider />}
                ListEmptyComponent={
                  <View style={styles.emptyContainer}>
                    <MaterialCommunityIcons
                      name="currency-usd-off"
                      size={48}
                      color={theme.colors.onSurfaceVariant}
                    />
                    <Text
                      style={[
                        styles.emptyText,
                        { color: theme.colors.onSurfaceVariant },
                      ]}
                    >
                      Aucune transaction récente
                    </Text>
                  </View>
                }
              />
            )}
          </View>
        );

      default:
        return null;
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
        <Appbar.Content title="Espace Créateur" />
      </Appbar.Header>

      <View
        style={[styles.tabContainer, { backgroundColor: theme.colors.surface }]}
      >
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "content" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("content")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "content" && styles.activeTabText,
              {
                color:
                  activeTab === "content"
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            Mon contenu
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tabButton,
            activeTab === "transactions" && styles.activeTabButton,
          ]}
          onPress={() => setActiveTab("transactions")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "transactions" && styles.activeTabText,
              {
                color:
                  activeTab === "transactions"
                    ? theme.colors.primary
                    : theme.colors.onSurfaceVariant,
              },
            ]}
          >
            Transactions
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView}>{renderTabContent()}</ScrollView>

      <FAB
        style={[styles.fab, { backgroundColor: theme.colors.primary }]}
        icon="plus"
        onPress={handleAddPress}
        color="#FFFFFF"
      />
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
  scrollView: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTabButton: {
    borderBottomWidth: 2,
    borderBottomColor: "#FF6B00",
  },
  tabText: {
    fontSize: 14,
    fontWeight: "500",
  },
  activeTabText: {
    fontWeight: "bold",
  },
  contentSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  transactionsSection: {
    marginVertical: 16,
    paddingHorizontal: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  revenueCard: {
    margin: 16,
    borderRadius: 12,
    elevation: 4,
  },
  revenueContainer: {
    marginTop: 8,
  },
  totalRevenueContainer: {
    marginBottom: 16,
  },
  totalRevenueLabel: {
    fontSize: 14,
  },
  totalRevenueValue: {
    fontSize: 28,
    fontWeight: "bold",
  },
  revenueStatsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  revenueStat: {
    flex: 1,
  },
  revenueStatLabel: {
    fontSize: 12,
    marginBottom: 4,
  },
  revenueStatValue: {
    fontSize: 16,
    fontWeight: "bold",
  },
  mediaCard: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 12,
  },
  mediaCardContent: {
    flexDirection: "row",
    height: 160,
  },
  mediaImage: {
    width: 120,
    height: "100%",
  },
  mediaDetails: {
    flex: 1,
    padding: 12,
    justifyContent: "space-between",
  },
  mediaTitleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  typeChip: {
    marginLeft: 8,
  },
  mediaInfo: {
    fontSize: 14,
    marginBottom: 8,
  },
  mediaStats: {
    flexDirection: "row",
    marginBottom: 8,
  },
  statChip: {
    marginRight: 8,
    height: 28,
  },
  editButton: {
    borderRadius: 6,
  },
  separator: {
    height: 12,
  },
  loadingContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyContainer: {
    padding: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginVertical: 16,
  },
  addButton: {
    marginTop: 16,
  },
  transactionItem: {
    marginVertical: 2,
    borderRadius: 8,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: "bold",
    alignSelf: "center",
    paddingRight: 16,
  },
  fab: {
    position: "absolute",
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
