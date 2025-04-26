/**
 * Types principaux pour l'application mobile AfriFilm
 */

// Types pour les rôles utilisateur
export enum UserRole {
  USER = "USER",
  CREATOR = "CREATOR",
  ADMIN = "ADMIN",
}

// Types pour les types de contenu
export enum ContentType {
  FILM = "FILM",
  SERIE = "SERIE",
}

// Types pour les films et séries
export interface MediaItem {
  id: string;
  title: string;
  type: ContentType;
  thumbnail: string;
  description?: string;
  genre?: string;
  director?: string;
  year?: string;
  price?: number;
  duration?: number;
  isFeatured?: boolean;
  isNew?: boolean;
  country?: string;
  language?: string;
  cast?: string;
  creatorId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface FilmDetails extends MediaItem {
  type: ContentType.FILM;
  duration: number;
  videoPath: string;
}

export interface SerieDetails extends MediaItem {
  type: ContentType.SERIE;
  seasons?: Season[];
}

export interface Season {
  id: string;
  title: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  description: string;
  duration: number;
  thumbnail?: string;
}

// Types pour la navigation
export type RootStackParamList = {
  index: undefined;
  "screens/HomeScreen": undefined;
  "screens/FilmDetailsScreen": { film: string };
  "screens/SerieDetailsScreen": { serie: string };
  "screens/ProfileScreen": undefined;
  "screens/SearchScreen": undefined;
  "screens/PaymentScreen": { contentId: string; amount: number };
  "screens/PaymentSuccessScreen": { contentId: string };
  "screens/CreatorDashboardScreen": undefined;
};

// Types pour le profil utilisateur
export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  media: MediaItem[];
}

// Types pour les transactions
export enum TransactionType {
  PURCHASE = "PURCHASE",
  REFUND = "REFUND",
  PAYOUT = "PAYOUT",
}

export enum TransactionMethod {
  ORANGE_MONEY = "ORANGE_MONEY",
  CREDIT_CARD = "CREDIT_CARD",
}

export enum TransactionStatus {
  PENDING = "PENDING",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REFUNDED = "REFUNDED",
}

export interface Transaction {
  id: string;
  amount: number;
  status: TransactionStatus;
  type: TransactionType;
  method: TransactionMethod;
  userId: string;
  contentId?: string;
  createdAt: string;
  content?: MediaItem;
}

// Types pour les paramètres de l'application
export type AppSettings = {
  language: string;
  notifications: boolean;
  videoQuality: "auto" | "high" | "medium" | "low";
  darkMode: boolean;
};

// Constantes
const Constants = {
  DEFAULT_LANGUAGE: "fr",
  DEFAULT_VIDEO_QUALITY: "auto" as const,
  DEFAULT_NOTIFICATIONS: true,
  DEFAULT_DARK_MODE: true,
  MIN_PASSWORD_LENGTH: 8,
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100MB
  SUPPORTED_VIDEO_FORMATS: ["mp4", "mov", "avi"],
  SUPPORTED_IMAGE_FORMATS: ["jpg", "jpeg", "png"],
};

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  profilePicture?: string;
  createdAt: string;
  transactions?: Transaction[];
}

export default Constants;
