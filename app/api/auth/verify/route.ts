import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  try {
    // Vérifier les cookies pour le débogage
    const cookies = request.headers.get("cookie");
    console.log(`[API] /api/auth/verify - Cookies reçus:`, cookies);

    // Récupérer la session serveur
    const session = await getServerSession(authOptions);

    console.log(
      `[API] /api/auth/verify - Détails de session:`,
      JSON.stringify({
        exists: !!session,
        userExists: !!session?.user,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role,
            }
          : null,
      })
    );

    // Réponse détaillée pour le debugging
    if (!session || !session.user) {
      console.log("[API] /api/auth/verify - Pas de session active");
      return NextResponse.json(
        {
          authenticated: false,
          message: "Non authentifié. Veuillez vous connecter.",
          details: {
            sessionExists: !!session,
            userExists: !!session?.user,
            cookiesPresent: !!cookies,
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }

    // Session valide
    console.log(
      `[API] /api/auth/verify - Session valide pour l'utilisateur: ${session.user.email}`
    );
    return NextResponse.json(
      {
        authenticated: true,
        user: {
          id: session.user.id,
          email: session.user.email,
          name: session.user.name,
          role: session.user.role,
        },
      },
      {
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  } catch (error) {
    console.error("[API] /api/auth/verify - Erreur:", error);
    return NextResponse.json(
      {
        authenticated: false,
        message: "Erreur lors de la vérification de la session",
        error: error instanceof Error ? error.message : "Erreur inconnue",
      },
      {
        status: 500,
        headers: {
          "Cache-Control": "no-store, max-age=0, must-revalidate",
          Pragma: "no-cache",
        },
      }
    );
  }
}
