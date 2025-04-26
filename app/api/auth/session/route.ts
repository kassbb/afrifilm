import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { getToken } from "next-auth/jwt";
import { authOptions } from "@/app/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

// Type d'un rôle utilisateur valide
type UserRole = "USER" | "CREATOR" | "ADMIN";

/**
 * GET /api/auth/session
 * Vérifie l'état de la session actuelle avec une protection anti-cache
 */
export async function GET(request: NextRequest) {
  try {
    // Définir les headers pour éviter la mise en cache
    const headers = {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      Pragma: "no-cache",
      Expires: "0",
    };

    // Lire les cookies directement pour faciliter le débogage
    const cookies = request.headers.get("cookie");
    console.log(
      "[API] Session Validation - Cookies reçus:",
      cookies ? "Présents" : "Absents"
    );

    // Essayer d'obtenir la session par la méthode principale
    let session = await getServerSession(authOptions);
    if (session?.user) {
      console.log(
        "[API] Session validée via getServerSession:",
        session.user.email
      );
    } else {
      console.log(
        "[API] Aucune session trouvée via getServerSession, tentative via token..."
      );
    }

    // Si aucune session trouvée avec getServerSession, essayer avec getToken
    if (!session?.user) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
        });

        if (token) {
          console.log("[API] Token JWT récupéré pour:", token.email);

          // Garantir que le rôle est valide
          let role: UserRole = "USER"; // Valeur par défaut
          if (
            token.role === "USER" ||
            token.role === "CREATOR" ||
            token.role === "ADMIN"
          ) {
            role = token.role as UserRole;
          }

          // Construire manuellement un objet session à partir du token
          session = {
            user: {
              id: token.sub as string,
              email: token.email as string,
              name: (token.name as string) || (token.email as string),
              role: role,
            },
            expires: new Date((token.exp as number) * 1000).toISOString(),
          };

          console.log("[API] Session reconstruite à partir du token JWT");
        } else {
          console.log("[API] Aucun token JWT trouvé dans la requête");
        }
      } catch (tokenError) {
        console.error(
          "[API] Erreur lors de la récupération du token:",
          tokenError
        );
      }
    }

    // Si toujours pas de session, renvoyer une réponse négative
    if (!session?.user) {
      console.log("[API] Session invalide - Utilisateur non authentifié");
      return NextResponse.json(
        {
          authenticated: false,
          message: "Non authentifié",
          timestamp: new Date().toISOString(),
          debug: { cookiesPresent: !!cookies },
        },
        {
          status: 401,
          headers,
        }
      );
    }

    // Créer une réponse sécurisée sans informations sensibles
    const safeSession = {
      authenticated: true,
      user: {
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
      expires: session.expires,
      timestamp: new Date().toISOString(),
    };

    console.log("[API] Session validée avec succès pour:", session.user.email);
    return NextResponse.json(safeSession, { headers });
  } catch (error) {
    console.error("[API] Erreur lors de la vérification de session:", error);

    return NextResponse.json(
      {
        authenticated: false,
        error: "Erreur de vérification de session",
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
    );
  }
}
