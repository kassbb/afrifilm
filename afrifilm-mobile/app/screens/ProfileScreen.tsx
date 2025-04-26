import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  FlatList,
  Dimensions,
  Platform,
  SafeAreaView,
} from "react-native";
import {
  Text,
  Title,
  Subheading,
  Button,
  Card,
  Avatar,
  Divider,
  useTheme,
  Surface,
  ActivityIndicator,
  List,
  Chip,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { UserRole, Transaction } from "../types";
import { useAuth } from "../hooks/useAuth";
import { getUserTransactions } from "../services/api";

const { width } = Dimensions.get("window");

// Formater la date
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("fr-FR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Formater le montant
const formatAmount = (amount: number) => {
  return amount.toFixed(2) + " €";
};

export default function ProfileScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user, logout, isLoading: authLoading } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Charger les transactions
  useEffect(() => {
    const loadTransactions = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        const response = await getUserTransactions();
        if (response && response.data) {
          setTransactions(response.data);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTransactions();
  }, [user]);

  // Gérer la déconnexion
  const handleLogout = async () => {
    try {
      await logout();
      router.replace("/screens/HomeScreen");
    } catch (error) {
      console.error("Erreur lors de la déconnexion:", error);
    }
  };

  // Naviguer vers l'espace créateur
  const handleCreatorDashboard = () => {
    router.push("/screens/CreatorDashboardScreen");
  };

  if (authLoading || !user) {
    return (
      <View
        style={[styles.loading, { backgroundColor: theme.colors.background }]}
      >
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ color: theme.colors.onSurface, marginTop: 20 }}>
          Chargement de votre profil...
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <MaterialCommunityIcons
            name="arrow-left"
            size={24}
            color={theme.colors.onSurface}
          />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onSurface }]}>
          Mon Profil
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Surface
          style={[
            styles.profileCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={4}
        >
          <View style={styles.profileHeader}>
            <Avatar.Image
              size={80}
              source={
                user.profilePicture
                  ? { uri: user.profilePicture }
                  : require("../../assets/icon.png")
              }
            />
            <View style={styles.profileInfo}>
              <Title style={{ color: theme.colors.onSurface }}>
                {user.name}
              </Title>
              <Subheading style={{ color: theme.colors.onSurfaceVariant }}>
                {user.email}
              </Subheading>
              <View style={styles.roleChip}>
                <Chip
                  icon="account"
                  style={{
                    backgroundColor:
                      user.role === UserRole.CREATOR
                        ? theme.colors.primary
                        : user.role === UserRole.ADMIN
                        ? "#9333EA"
                        : "#555555",
                  }}
                >
                  {user.role === UserRole.CREATOR
                    ? "Créateur"
                    : user.role === UserRole.ADMIN
                    ? "Administrateur"
                    : "Utilisateur"}
                </Chip>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          {user.role === UserRole.CREATOR && (
            <Button
              mode="contained"
              icon="video"
              onPress={handleCreatorDashboard}
              style={styles.creatorButton}
            >
              Accéder à mon espace créateur
            </Button>
          )}

          <View style={styles.accountInfo}>
            <List.Section>
              <List.Subheader style={{ color: theme.colors.onSurfaceVariant }}>
                Informations du compte
              </List.Subheader>
              <List.Item
                title="Date d'inscription"
                description={formatDate(user.createdAt)}
                left={() => (
                  <List.Icon
                    icon="calendar"
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
              <List.Item
                title="Statut d'abonnement"
                description="Standard"
                left={() => (
                  <List.Icon
                    icon="star"
                    color={theme.colors.onSurfaceVariant}
                  />
                )}
                titleStyle={{ color: theme.colors.onSurface }}
                descriptionStyle={{ color: theme.colors.onSurfaceVariant }}
              />
            </List.Section>
          </View>

          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => console.log("Modifier le profil")}
            style={[styles.actionButton, { borderColor: theme.colors.primary }]}
            labelStyle={{ color: theme.colors.primary }}
          >
            Modifier mon profil
          </Button>

          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogout}
            style={[styles.actionButton, { borderColor: "#f44336" }]}
            labelStyle={{ color: "#f44336" }}
          >
            Se déconnecter
          </Button>
        </Surface>

        <Surface
          style={[
            styles.transactionsCard,
            { backgroundColor: theme.colors.surface },
          ]}
          elevation={4}
        >
          <Title
            style={[styles.sectionTitle, { color: theme.colors.onSurface }]}
          >
            Historique des achats
          </Title>

          {isLoading ? (
            <ActivityIndicator
              style={styles.transactionsLoading}
              size="large"
              color={theme.colors.primary}
            />
          ) : transactions.length === 0 ? (
            <Text
              style={[
                styles.emptyText,
                { color: theme.colors.onSurfaceVariant },
              ]}
            >
              Aucun achat effectué pour le moment.
            </Text>
          ) : (
            <FlatList
              data={transactions}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Card
                  style={[
                    styles.transactionCard,
                    { backgroundColor: theme.colors.surface },
                  ]}
                  elevation={1}
                >
                  <Card.Content style={styles.transactionContent}>
                    <View style={styles.transactionLeft}>
                      <MaterialCommunityIcons
                        name={
                          item.status === "COMPLETED"
                            ? "check-circle"
                            : item.status === "FAILED"
                            ? "alert-circle"
                            : "clock-outline"
                        }
                        size={24}
                        color={
                          item.status === "COMPLETED"
                            ? "#4CAF50"
                            : item.status === "FAILED"
                            ? "#F44336"
                            : "#FFC107"
                        }
                      />
                      <View style={styles.transactionInfo}>
                        <Text
                          style={{
                            color: theme.colors.onSurface,
                            fontWeight: "bold",
                          }}
                        >
                          {item.content?.title || "Contenu inconnu"}
                        </Text>
                        <Text style={{ color: theme.colors.onSurfaceVariant }}>
                          {formatDate(item.createdAt)}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.transactionRight}>
                      <Text
                        style={{
                          color: theme.colors.primary,
                          fontWeight: "bold",
                        }}
                      >
                        {formatAmount(item.amount)}
                      </Text>
                      <Text style={{ color: theme.colors.onSurfaceVariant }}>
                        {item.method}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              )}
            />
          )}
        </Surface>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === "android" ? 40 : 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  profileCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
  },
  profileHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  roleChip: {
    marginTop: 8,
    alignSelf: "flex-start",
  },
  divider: {
    marginVertical: 16,
  },
  creatorButton: {
    marginBottom: 16,
  },
  accountInfo: {
    marginBottom: 16,
  },
  actionButton: {
    marginTop: 8,
    borderWidth: 1,
  },
  transactionsCard: {
    borderRadius: 12,
    padding: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  transactionsLoading: {
    padding: 32,
  },
  emptyText: {
    textAlign: "center",
    padding: 16,
  },
  transactionCard: {
    marginBottom: 8,
    borderRadius: 8,
  },
  transactionContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  transactionInfo: {
    marginLeft: 12,
  },
  transactionRight: {
    alignItems: "flex-end",
  },
});
