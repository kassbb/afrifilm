import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET /api/public/contents/[id]
 *
 * Récupère les détails d'un contenu spécifique (film ou série)
 * Si l'utilisateur est authentifié, vérifie s'il a accès au contenu
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;
    const userRole = session?.user?.role;

    console.log(`[API] Détails du contenu demandés pour ID: ${contentId}`);
    console.log(
      `[API] Session utilisateur: ${userId ? "Connecté" : "Anonyme"}, Rôle: ${
        userRole || "N/A"
      }`
    );

    // Récupérer le contenu avec tous les détails nécessaires
    const content = await prisma.content.findFirst({
      where: {
        id: contentId,
        isApproved: true,
      },
      include: {
        film: true,
        serie: {
          include: {
            seasons: {
              include: {
                episodes: true,
              },
            },
          },
        },
      },
    });

    if (!content) {
      console.log(`[API] Contenu non trouvé ou non approuvé: ${contentId}`);
      return NextResponse.json(
        { error: "Contenu non trouvé ou non approuvé." },
        { status: 404 }
      );
    }

    console.log(
      `[API] Contenu trouvé: ${content.title}, Type: ${content.type}, Prix: ${content.price}`
    );

    // Les admins ont toujours accès
    let isAdmin = userRole === "ADMIN" || userRole === "CREATOR";

    // Vérifier si l'utilisateur a acheté le contenu
    let hasAccess = isAdmin; // Les admins ont toujours accès
    let purchaseInfo = null;

    // Vérifier si le contenu est gratuit - condition explicite pour débogage
    const isFree = content.price === 0 || content.price === null;
    console.log(`[API] Le contenu est-il gratuit? ${isFree ? "OUI" : "NON"}`);

    if (userId) {
      // Pour tout utilisateur connecté, les contenus gratuits sont accessibles
      if (isFree) {
        console.log(`[API] Accès accordé car contenu gratuit`);
        hasAccess = true;
      } else {
        // Vérifier si l'utilisateur a acheté le contenu
        const transaction = await prisma.transaction.findFirst({
          where: {
            userId: userId,
            contentId: contentId,
            isPaid: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        });

        if (transaction) {
          console.log(
            `[API] Accès accordé car contenu acheté, Transaction ID: ${transaction.id}`
          );
          hasAccess = true;
          purchaseInfo = {
            transactionId: transaction.id,
            purchaseDate: transaction.createdAt,
            paymentMethod: transaction.paymentMethod,
          };
        } else {
          console.log(`[API] Aucune transaction trouvée pour ce contenu`);
        }
      }
    }

    console.log(
      `[API] Décision finale d'accès: ${hasAccess ? "AUTORISÉ" : "REFUSÉ"}`
    );

    // Préparer les données de réponse
    const responseData: any = {
      id: content.id,
      title: content.title,
      type: content.type,
      description: content.description,
      director: content.director,
      actors: content.cast,
      releaseYear: content.year,
      price: content.price || 0,
      isPremium: content.price !== null && content.price > 0,
      mainImagePath: content.thumbnail,
      createdAt: content.createdAt,

      // Informations d'accès
      accessInfo: {
        hasAccess: hasAccess,
        isFree: isFree,
        isAdmin: isAdmin,
        requiresPurchase: !isFree && !hasAccess, // Simplifié pour clarté
        purchaseInfo: purchaseInfo,
      },
    };

    // Ajouter des informations spécifiques au type de contenu
    if (content.type === "FILM" && content.film) {
      responseData.duration = content.film.duration;

      // Toujours inclure le chemin vidéo pour les contenus gratuits ou si l'utilisateur a accès
      responseData.videoPath =
        hasAccess || isFree ? content.film.videoPath : null;

      console.log(
        `[API] Chemin vidéo: ${responseData.videoPath || "NON DISPONIBLE"}`
      );
    } else if (content.type === "SERIE" && content.serie) {
      responseData.seasons = content.serie.seasons.map((season) => ({
        id: season.id,
        number: season.number,
        title: season.title,
        episodes: season.episodes.map((episode) => ({
          id: episode.id,
          number: episode.number,
          title: episode.title,
          duration: episode.duration,
          thumbnailPath: episode.thumbnail,
          description: episode.description,
          videoPath: hasAccess || isFree ? episode.videoPath : null,
        })),
      }));
    }

    return NextResponse.json(responseData);
  } catch (error) {
    console.error("Error fetching content details:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des détails du contenu." },
      { status: 500 }
    );
  }
}
