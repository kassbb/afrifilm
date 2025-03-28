import { useState, useCallback } from "react";
import { useSession } from "next-auth/react";

export function useSessionVerification() {
  const { data: session, status, update } = useSession();
  const [isVerifying, setIsVerifying] = useState(false);
  const [lastVerified, setLastVerified] = useState<Date | null>(null);

  // Fonction de vérification
  const verifySession = useCallback(async (): Promise<boolean> => {
    if (status === "loading") {
      return false;
    }

    if (status === "unauthenticated" || !session) {
      return false;
    }

    try {
      setIsVerifying(true);

      // Utiliser l'API de vérification
      const response = await fetch("/api/auth/verify", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        // Tenter de rafraîchir la session
        await update();

        // Après le rafraîchissement, vérifier si nous avons une session
        if (!session) {
          return false;
        }
      }

      // Mettre à jour la dernière vérification
      setLastVerified(new Date());

      return data.authenticated;
    } catch (error) {
      console.error("Erreur lors de la vérification de la session:", error);
      return false;
    } finally {
      setIsVerifying(false);
    }
  }, [session, status, update]);

  return {
    isVerifying,
    lastVerified,
    verifySession,
    session,
    status,
  };
}
