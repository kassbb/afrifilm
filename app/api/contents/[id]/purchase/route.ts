import { NextRequest, NextResponse } from "next/server";
import { getContentById } from "@/app/mockData";

// GET /api/contents/[id]/purchase - Vérifier si l'utilisateur a acheté ce contenu
export const GET = async (request: NextRequest) => {
  try {
    // Extraire l'ID du contenu de l'URL
    const url = new URL(request.url);
    const segments = url.pathname.split("/");
    // Trouver l'ID du contenu qui se trouve avant "purchase"
    const contentId = segments[segments.length - 2];

    // Récupérer le contenu
    const content = getContentById(contentId);

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Pour les tests, on considère que tous les contenus sont achetés
    const hasPurchased = true;

    // Récupérer les détails de lecture (chemin vidéo)
    let videoPath = "https://example.com/videos/sample.mp4";

    // Pour les tests, on retourne une URL de vidéo d'exemple

    // Renvoyer le statut d'achat et les informations de lecture
    return NextResponse.json({
      hasPurchased,
      videoPath,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification d'achat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification d'achat" },
      { status: 500 }
    );
  }
};
