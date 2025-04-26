/**
 * Services API pour AfriFilm Mobile
 * Ce fichier contient toutes les fonctions pour interagir avec les API du backend
 */
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ContentType, MediaItem, Transaction } from "../types";

// URL de base de l'API
// En développement, utilisez l'IP de votre machine plutôt que localhost pour Android
export const API_BASE_URL =
  Platform.OS === "android"
    ? "http://10.0.2.2:3000" // Émulateur Android -> localhost de la machine hôte
    : Platform.OS === "ios"
    ? "http://localhost:3000" // Simulateur iOS
    : "http://localhost:3000"; // Web - utilise l'URL complète

// URL du proxy CORS pour la version web (si CORS est un problème)
export const CORS_PROXY_URL = "http://localhost:8080/";

// Fonction pour obtenir l'URL complète avec proxy si nécessaire
export const getApiUrl = (endpoint: string, useProxy = false): string => {
  // Si nous sommes sur le web et que le proxy est actif, utiliser le proxy CORS
  if (Platform.OS === "web" && useProxy) {
    return `${CORS_PROXY_URL}${API_BASE_URL}${endpoint}`;
  }

  // Sinon, utiliser l'URL normale
  return `${API_BASE_URL}${endpoint}`;
};

// Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  message?: string;
  error?: string;
}

// Fonction helper pour les appels API
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  try {
    // Récupérer le token depuis AsyncStorage
    const token = await AsyncStorage.getItem("token");

    // Préparer les headers en fonction de la méthode
    const isGetRequest = !options.method || options.method === "GET";
    const headers = {
      // N'ajouter Content-Type que pour les requêtes non-GET
      ...(isGetRequest ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    };

    // Options de requête avec mode CORS pour le web
    const fetchOptions = {
      ...options,
      headers,
      // Ajouter le mode cors pour le web
      ...(Platform.OS === "web" ? { mode: "cors" as RequestMode } : {}),
    };

    // Construire l'URL complète
    const fullUrl = `${API_BASE_URL}${url}`;

    // Effectuer l'appel
    console.log(`📡 Appel API: ${fullUrl}`);
    const response = await fetch(fullUrl, fetchOptions);

    // Vérifier la réponse
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Une erreur est survenue");
    }

    return data;
  } catch (error) {
    console.error("Erreur API:", error);
    throw error;
  }
};

// Fonction pour transformer les chemins d'images relatifs en URLs complètes
const transformImagePaths = (items: MediaItem[]): MediaItem[] => {
  return items.map((item) => {
    // Si le thumbnail est null ou undefined, retourner l'item tel quel
    if (!item.thumbnail) {
      console.log(`Pas de thumbnail pour l'item ${item.id} - ${item.title}`);
      return item;
    }

    // Si le thumbnail est une URL complète (avec http), ne pas la modifier
    if (
      typeof item.thumbnail === "string" &&
      (item.thumbnail.startsWith("http://") ||
        item.thumbnail.startsWith("https://"))
    ) {
      console.log(`URL complète détectée: ${item.thumbnail}`);
      return item;
    }

    // Si le thumbnail commence par "/" c'est un chemin relatif, ajouter l'URL de base
    if (typeof item.thumbnail === "string" && item.thumbnail.startsWith("/")) {
      const fullUrl = `${API_BASE_URL}${item.thumbnail}`;
      console.log(`Conversion d'URL relative: ${item.thumbnail} -> ${fullUrl}`);
      return {
        ...item,
        thumbnail: fullUrl,
      };
    }

    // Dans tous les autres cas, retourner l'item tel quel
    console.log(
      `Format d'image non supporté: ${typeof item.thumbnail}, valeur: ${
        item.thumbnail
      }`
    );
    return item;
  });
};

// API pour récupérer les contenus en vedette
export const getFeaturedContent = async (): Promise<
  ApiResponse<MediaItem[]>
> => {
  // Utiliser une approche ultra-simple pour les requêtes GET pour éviter les problèmes CORS
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/contents?featured=true&limit=4`
    );
    const rawData = await response.json();

    console.log("Données brutes reçues:", rawData);

    // Format attendu = { data: [...] }
    // Mais le serveur renvoie { contents: [...] }
    if (rawData && rawData.data) {
      return {
        ...rawData,
        data: transformImagePaths(rawData.data),
      };
    } else if (rawData && rawData.contents) {
      return {
        data: transformImagePaths(rawData.contents),
      };
    }

    // Sinon, formater la réponse selon la structure attendue
    return { data: transformImagePaths(Array.isArray(rawData) ? rawData : []) };
  } catch (error) {
    console.error("Erreur API getFeaturedContent:", error);
    throw error;
  }
};

// API pour récupérer les nouveautés
export const getNewContent = async (): Promise<ApiResponse<MediaItem[]>> => {
  // Utiliser une approche ultra-simple pour les requêtes GET pour éviter les problèmes CORS
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/contents?newest=true&limit=8`
    );
    const rawData = await response.json();

    console.log("Données brutes reçues:", rawData);

    // Format attendu = { data: [...] }
    // Mais le serveur renvoie { contents: [...] }
    if (rawData && rawData.data) {
      return {
        ...rawData,
        data: transformImagePaths(rawData.data),
      };
    } else if (rawData && rawData.contents) {
      return {
        data: transformImagePaths(rawData.contents),
      };
    }

    // Sinon, formater la réponse selon la structure attendue
    return { data: transformImagePaths(Array.isArray(rawData) ? rawData : []) };
  } catch (error) {
    console.error("Erreur API getNewContent:", error);
    throw error;
  }
};

// API pour récupérer les contenus gratuits
export const getFreeContent = async (): Promise<ApiResponse<MediaItem[]>> => {
  // Utiliser une approche ultra-simple pour les requêtes GET pour éviter les problèmes CORS
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/contents?price=0&limit=8`
    );
    const rawData = await response.json();

    console.log("Données brutes reçues:", rawData);

    // Format attendu = { data: [...] }
    // Mais le serveur renvoie { contents: [...] }
    if (rawData && rawData.data) {
      return {
        ...rawData,
        data: transformImagePaths(rawData.data),
      };
    } else if (rawData && rawData.contents) {
      return {
        data: transformImagePaths(rawData.contents),
      };
    }

    // Sinon, formater la réponse selon la structure attendue
    return { data: transformImagePaths(Array.isArray(rawData) ? rawData : []) };
  } catch (error) {
    console.error("Erreur API getFreeContent:", error);
    throw error;
  }
};

// API pour rechercher des contenus
export const searchContent = async (params: {
  query?: string;
  type?: ContentType;
  genre?: string;
  page?: number;
  limit?: number;
}): Promise<ApiResponse<MediaItem[]>> => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  return fetchWithAuth(`/api/contents/search?${queryParams.toString()}`);
};

// API pour récupérer un contenu par son ID
export const getContentById = async (
  id: string
): Promise<ApiResponse<MediaItem>> => {
  return fetchWithAuth(`/api/contents/${id}`);
};

// API pour vérifier si un utilisateur a acheté un contenu
export const checkPurchase = async (
  contentId: string
): Promise<ApiResponse<{ purchased: boolean }>> => {
  return fetchWithAuth(`/api/contents/${contentId}/purchase`);
};

// API pour acheter un contenu
export const purchaseContent = async (
  contentId: string,
  method: "ORANGE_MONEY" | "CREDIT_CARD" = "ORANGE_MONEY",
  paymentDetails: any
): Promise<ApiResponse<{ success: boolean }>> => {
  return fetchWithAuth(`/api/transactions`, {
    method: "POST",
    body: JSON.stringify({
      contentId,
      method,
      ...paymentDetails,
    }),
  });
};

// API Créateur - Récupérer les contenus d'un créateur
export const getCreatorContents = async (): Promise<
  ApiResponse<MediaItem[]>
> => {
  return fetchWithAuth(`/api/creator/contents`);
};

// API Créateur - Soumettre un nouveau contenu
export const submitContent = async (
  contentData: any
): Promise<ApiResponse<MediaItem>> => {
  return fetchWithAuth(`/api/creator/contents`, {
    method: "POST",
    body: JSON.stringify(contentData),
  });
};

// API Créateur - Statistiques
export const getCreatorStats = async (): Promise<
  ApiResponse<{
    totalSales: number;
    totalViews: number;
    recentSales: { date: string; amount: number }[];
  }>
> => {
  return fetchWithAuth(`/api/creator/stats`);
};

// API User - Récupérer le profil utilisateur
export const getUserProfile = async (): Promise<
  ApiResponse<{
    id: string;
    name: string;
    email: string;
    profilePicture: string | null;
    role: string;
    createdAt: string;
  }>
> => {
  return fetchWithAuth(`/api/user/me`);
};

// API User - Mettre à jour le profil
export const updateUserProfile = async (profileData: {
  name?: string;
  email?: string;
  profilePicture?: string;
}): Promise<ApiResponse<any>> => {
  return fetchWithAuth(`/api/user/me`, {
    method: "PUT",
    body: JSON.stringify(profileData),
  });
};

// API User - Récupérer les transactions
export const getUserTransactions = async (): Promise<
  ApiResponse<Transaction[]>
> => {
  return fetchWithAuth(`/api/user/transactions`);
};

// API Auth - Connexion
export const login = async (
  email: string,
  password: string
): Promise<ApiResponse<{ token: string }>> => {
  try {
    console.log(`🔑 Tentative de connexion pour: ${email}`);

    // Pour la version web, utiliser une URL relative pour éviter les problèmes CORS
    const apiUrl =
      Platform.OS === "web"
        ? "/api/auth/login" // URL relative pour le web
        : `${API_BASE_URL}/api/auth/login`; // URL complète pour mobile

    console.log(`📡 URL API: ${apiUrl}`);

    // Utiliser une approche avec en-têtes Content-Type explicites
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ email, password }),
      // Ajouter le mode cors pour le web
      ...(Platform.OS === "web" ? { mode: "cors" as RequestMode } : {}),
    });

    console.log(`📥 Statut de la réponse: ${response.status}`);

    // Vérifier le type de contenu de la réponse
    const contentType = response.headers.get("content-type");
    console.log(`📄 Type de contenu reçu: ${contentType}`);

    // Si la réponse n'est pas du JSON, lire en tant que texte pour le débogage
    if (!contentType || !contentType.includes("application/json")) {
      const textResponse = await response.text();
      console.error(
        `⚠️ Réponse non-JSON reçue: ${textResponse.substring(0, 200)}...`
      );
      throw new Error(
        "La réponse du serveur n'est pas au format JSON. Vérifiez les logs."
      );
    }

    // Lire la réponse JSON
    const data = await response.json();

    if (!response.ok) {
      console.error(`❌ Erreur de connexion: ${JSON.stringify(data)}`);
      throw new Error(data.message || data.error || "Échec de la connexion");
    }

    console.log(`✅ Connexion réussie`);

    // Stocker le token
    if (data.token) {
      await AsyncStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    console.error("❌ Erreur de connexion:", error);
    throw error;
  }
};

// API Auth - Inscription
export const register = async (userData: {
  name: string;
  email: string;
  password: string;
  role?: string;
}): Promise<ApiResponse<{ token: string }>> => {
  try {
    console.log(`🚀 Tentative d'inscription avec: ${JSON.stringify(userData)}`);

    // Transformer les données pour correspondre à ce qu'attend le backend
    const apiData = {
      name: userData.name,
      email: userData.email,
      password: userData.password,
      accountType: userData.role || "USER", // Le backend attend accountType et non role
    };

    console.log(`📦 Données pour le backend: ${JSON.stringify(apiData)}`);

    // Pour la version web, utiliser le proxy CORS pour éviter les problèmes CORS
    const apiUrl =
      Platform.OS === "web"
        ? `${CORS_PROXY_URL}http://localhost:3000/api/auth/register` // URL avec proxy CORS
        : `${API_BASE_URL}/api/auth/register`; // URL complète pour mobile

    console.log(`📡 URL API: ${apiUrl}`);

    // Utiliser une approche avec en-têtes Content-Type explicites
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Origin: "http://localhost:19006", // Origine de l'application Expo Web
        "X-Requested-With": "XMLHttpRequest", // Requis par certains proxies CORS
      },
      body: JSON.stringify(apiData),
      // Ajouter le mode cors pour le web
      ...(Platform.OS === "web" ? { mode: "cors" as RequestMode } : {}),
    });

    console.log(`📥 Statut de la réponse: ${response.status}`);

    // Vérifier le type de contenu de la réponse
    const contentType = response.headers.get("content-type");
    console.log(`📄 Type de contenu reçu: ${contentType}`);

    let data;

    // Si la réponse n'est pas du JSON, essayer quand même de lire la réponse
    if (!contentType || !contentType.includes("application/json")) {
      try {
        data = await response.json();
        console.log("✅ Réponse JSON malgré un Content-Type incorrect");
      } catch (jsonError) {
        const textResponse = await response.text();
        console.error(
          `⚠️ Réponse non-JSON reçue: ${textResponse.substring(0, 200)}...`
        );
        throw new Error(
          "La réponse du serveur n'est pas au format JSON. Vérifiez les logs."
        );
      }
    } else {
      // Lire la réponse JSON
      data = await response.json();
    }

    if (!response.ok) {
      console.error(`❌ Erreur d'inscription: ${JSON.stringify(data)}`);
      throw new Error(data.message || data.error || "Échec de l'inscription");
    }

    console.log(`✅ Inscription réussie: ${JSON.stringify(data)}`);

    // Stocker le token
    if (data.token) {
      await AsyncStorage.setItem("token", data.token);
    }

    return data;
  } catch (error) {
    console.error("❌ Erreur d'inscription:", error);
    throw error;
  }
};

// API Auth - Déconnexion
export const logout = async (): Promise<void> => {
  await AsyncStorage.removeItem("token");
};

// API Auth - Vérifier l'authentification
export const checkAuth = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem("token");
    if (!token) return false;

    const response = await fetchWithAuth("/api/auth/verify");
    return response.valid === true;
  } catch (error) {
    console.error("Erreur de vérification d'authentification:", error);
    return false;
  }
};
