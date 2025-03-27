import { useState, useEffect, useCallback } from "react";
import { useToast } from "@chakra-ui/react";

interface ApiOptions {
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  body?: any;
  headers?: Record<string, string>;
}

/**
 * Hook personnalisé pour l'appel aux API administrateur
 * @param endpoint - Le chemin de l'API (ex: '/api/admin/users')
 * @param options - Options de la requête
 * @param immediate - Si true, la requête est effectuée immédiatement lors du montage du composant
 */
export function useAdminApi<T>(
  endpoint: string,
  options: ApiOptions = {},
  immediate = true
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(immediate);
  const [error, setError] = useState<Error | null>(null);
  const toast = useToast();

  const fetchData = useCallback(
    async (customOptions: ApiOptions = {}) => {
      setLoading(true);
      setError(null);

      try {
        const mergedOptions: RequestInit = {
          method: customOptions.method || options.method || "GET",
          headers: {
            "Content-Type": "application/json",
            ...(options.headers || {}),
            ...(customOptions.headers || {}),
          },
        };

        if (customOptions.body || options.body) {
          mergedOptions.body = JSON.stringify(
            customOptions.body || options.body
          );
        }

        const response = await fetch(endpoint, mergedOptions);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Erreur ${response.status}`);
        }

        const result = await response.json();
        setData(result);
        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err : new Error("Une erreur est survenue")
        );
        toast({
          title: "Erreur",
          description:
            err instanceof Error ? err.message : "Une erreur est survenue",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [endpoint, options, toast]
  );

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData]);

  return { data, loading, error, fetchData };
}

/**
 * Hook personnalisé pour récupérer les statistiques du tableau de bord admin
 */
export function useAdminDashboard<T = any>() {
  return useAdminApi<T>("/api/admin/dashboard");
}

/**
 * Hook personnalisé pour la gestion des utilisateurs
 */
export function useAdminUsers() {
  const usersApi = useAdminApi("/api/admin/users");

  const updateUserStatus = useCallback(
    async (userId: string, isActive: boolean) => {
      return usersApi.fetchData({
        method: "PATCH",
        body: { isActive },
        headers: {
          "Content-Type": "application/json",
        },
      });
    },
    [usersApi]
  );

  const deleteUser = useCallback(
    async (userId: string) => {
      return usersApi.fetchData({
        method: "DELETE",
      });
    },
    [usersApi]
  );

  return {
    ...usersApi,
    updateUserStatus,
    deleteUser,
  };
}

/**
 * Hook personnalisé pour la gestion des contenus
 */
export function useAdminContents() {
  const contentsApi = useAdminApi("/api/admin/contents");

  const updateContent = useCallback(
    async (contentId: string, data: any) => {
      return contentsApi.fetchData({
        method: "PATCH",
        body: data,
      });
    },
    [contentsApi]
  );

  const deleteContent = useCallback(
    async (contentId: string) => {
      return contentsApi.fetchData({
        method: "DELETE",
      });
    },
    [contentsApi]
  );

  const approveContent = useCallback(
    async (contentId: string) => {
      return contentsApi.fetchData({
        method: "PATCH",
        body: { isApproved: true },
      });
    },
    [contentsApi]
  );

  const rejectContent = useCallback(
    async (contentId: string, rejectionReason: string) => {
      return contentsApi.fetchData({
        method: "PATCH",
        body: { isApproved: false, rejectionReason },
      });
    },
    [contentsApi]
  );

  return {
    ...contentsApi,
    updateContent,
    deleteContent,
    approveContent,
    rejectContent,
  };
}

/**
 * Hook personnalisé pour la gestion des créateurs
 */
export function useAdminCreators() {
  const creatorsApi = useAdminApi("/api/admin/creators");

  const updateCreatorVerification = useCallback(
    async (creatorId: string, isVerified: boolean) => {
      return creatorsApi.fetchData({
        method: "PATCH",
        body: { isVerified },
      });
    },
    [creatorsApi]
  );

  return {
    ...creatorsApi,
    updateCreatorVerification,
  };
}
