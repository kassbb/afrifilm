/**
 * Services API pour AfriFilm
 * Ce fichier contient toutes les fonctions pour interagir avec les API du backend
 */

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "";

// Types
export interface Content {
  id: string;
  title: string;
  description: string;
  type: "FILM" | "SERIE";
  price: number | null;
  thumbnail: string;
  creatorId: string;
  isApproved: boolean;
  createdAt: string;
  updatedAt: string;
  genre?: string;
  director?: string;
  year?: string;
  country?: string;
  language?: string;
  cast?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  featuredRank?: number;
  film?: Film;
  serie?: Serie;
  creator?: {
    id: string;
    email: string;
  };
}

export interface Film {
  id: string;
  duration: number;
  videoPath: string;
  contentId: string;
}

export interface Serie {
  id: string;
  contentId: string;
  seasons: Season[];
}

export interface Season {
  id: string;
  number: number;
  title?: string;
  serieId: string;
  episodes: Episode[];
}

export interface Episode {
  id: string;
  title: string;
  duration: number;
  videoPath: string;
  seasonId: string;
  number?: number;
  thumbnail?: string;
  description?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ApiResponse<T> {
  data: T;
  meta?: Pagination;
  message?: string;
  error?: string;
}

// Fonctions d'aide
const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Une erreur est survenue");
  }

  return response.json();
};

// API pour récupérer tous les films
export const getContents = async (params: {
  type?: "FILM" | "SERIE";
  genre?: string;
  title?: string;
  language?: string;
  country?: string;
  year?: string;
  minPrice?: number;
  maxPrice?: number;
  featured?: boolean;
  newest?: boolean;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  return fetchWithAuth(`/api/contents?${queryParams}`);
};

// API pour récupérer un contenu par son ID
export const getContentById = async (id: string) => {
  return fetchWithAuth(`/api/contents/${id}`);
};

// API pour vérifier si un utilisateur a acheté un contenu
export const checkPurchase = async (contentId: string) => {
  return fetchWithAuth(`/api/contents/${contentId}/purchase`);
};

// API pour acheter un contenu
export const purchaseContent = async (contentId: string) => {
  return fetchWithAuth(`/api/transactions`, {
    method: "POST",
    body: JSON.stringify({ contentId }),
  });
};

// API Creator - Récupérer les contenus d'un créateur
export const getCreatorContents = async (params: {
  type?: "FILM" | "SERIE";
  isApproved?: boolean;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  return fetchWithAuth(`/api/creator/contents?${queryParams}`);
};

// API Creator - Soumettre un nouveau contenu
export const submitContent = async (contentData: any) => {
  return fetchWithAuth(`/api/creator/contents`, {
    method: "POST",
    body: JSON.stringify(contentData),
  });
};

// API Admin - Récupérer tous les contenus
export const getAdminContents = async (params: {
  type?: "FILM" | "SERIE";
  isApproved?: boolean;
  creatorId?: string;
  recent?: boolean;
  featured?: boolean;
  page?: number;
  limit?: number;
}) => {
  const queryParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      queryParams.append(key, String(value));
    }
  });

  return fetchWithAuth(`/api/admin/contents?${queryParams}`);
};

// API Admin - Approuver ou rejeter un contenu
export const updateContentApproval = async (
  contentId: string,
  isApproved: boolean,
  rejectionReason?: string
) => {
  return fetchWithAuth(`/api/admin/contents/${contentId}`, {
    method: "PATCH",
    body: JSON.stringify({ isApproved, rejectionReason }),
  });
};

// API Admin - Supprimer un contenu
export const deleteContent = async (contentId: string) => {
  return fetchWithAuth(`/api/admin/contents/${contentId}`, {
    method: "DELETE",
  });
};
