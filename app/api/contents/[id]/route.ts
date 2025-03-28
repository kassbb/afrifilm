import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/contents/[id]
// Récupérer les détails d'un contenu spécifique (film ou série)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] GET /api/contents/${params.id} - Début`);

    const { id } = params;
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    // Récupérer le contenu avec tous les détails nécessaires
    const content = await prisma.content.findUnique({
      where: {
        id,
        isApproved: true, // Uniquement les contenus approuvés
      },
      include: {
        film: true,
        serie: {
          include: {
            seasons: {
              orderBy: {
                number: "asc",
              },
              include: {
                episodes: {
                  orderBy: {
                    number: "asc",
                  },
                },
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            avatar: true,
          },
        },
      },
    });

    if (!content) {
      console.log(
        `[API] GET /api/contents/${id} - Contenu non trouvé ou non approuvé`
      );
      return NextResponse.json(
        { error: "Contenu non trouvé ou non approuvé" },
        { status: 404 }
      );
    }

    // Vérifier si l'utilisateur a acheté ce contenu
    let hasPurchased = false;
    if (userId) {
      const transaction = await prisma.transaction.findFirst({
        where: {
          userId,
          contentId: id,
          isPaid: true,
        },
      });
      hasPurchased = !!transaction;
    }

    // Formater la réponse
    const response = {
      id: content.id,
      title: content.title,
      type: content.type,
      description: content.description,
      thumbnail: content.thumbnail,
      price: content.price,
      genre: content.genre,
      director: content.director,
      year: content.year,
      country: content.country,
      language: content.language,
      cast: content.cast,
      isFeatured: content.isFeatured,
      isNew: content.isNew,
      createdAt: content.createdAt,
      creator: content.creator,
      hasPurchased,
      // Informations spécifiques au type
      ...(content.type === "FILM" && {
        film: {
          duration: content.film?.duration,
          // N'inclure le chemin vidéo que si l'utilisateur a acheté le contenu
          // ou si le contenu est gratuit
          videoPath:
            hasPurchased || !content.price ? content.film?.videoPath : null,
        },
      }),
      ...(content.type === "SERIE" && {
        serie: {
          seasons: content.serie?.seasons.map((season) => ({
            id: season.id,
            number: season.number,
            title: season.title,
            episodes: season.episodes.map((episode) => ({
              id: episode.id,
              title: episode.title,
              number: episode.number,
              duration: episode.duration,
              thumbnail: episode.thumbnail,
              description: episode.description,
              // N'inclure le chemin vidéo que si l'utilisateur a acheté le contenu
              // ou si le contenu est gratuit
              videoPath:
                hasPurchased || !content.price ? episode.videoPath : null,
            })),
          })),
        },
      }),
    };

    console.log(`[API] GET /api/contents/${id} - Contenu trouvé`);
    return NextResponse.json(response);
  } catch (error) {
    console.error(`[API] GET /api/contents/${params.id} - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    );
  }
}

// Route pour vérifier si un utilisateur a acheté un contenu
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const contentId = params.id;
    const { userId } = await request.json();

    if (!contentId || !userId) {
      return NextResponse.json(
        { error: "ID du contenu et ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier si une transaction existe pour cet utilisateur et ce contenu
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId: userId,
        contentId: contentId,
        isPaid: true,
      },
    });

    return NextResponse.json({
      hasPurchased: !!transaction,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'achat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'achat" },
      { status: 500 }
    );
  }
}
