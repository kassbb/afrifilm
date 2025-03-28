import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Middleware pour vérifier si l'utilisateur est un administrateur
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authenticated: false,
      message: "Non authentifié",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      authenticated: false,
      message: "Accès non autorisé. Réservé aux administrateurs.",
    };
  }

  return {
    authenticated: true,
    session,
  };
}

// GET /api/admin/contents
// Récupérer tous les contenus avec pagination et filtres
export async function GET(request: NextRequest) {
  try {
    console.log("[API] GET /api/admin/contents - Début");

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        "[API] GET /api/admin/contents - Erreur d'authentification:",
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Construire les filtres de requête
    const filters: any = {};

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "approved") {
      filters.isApproved = true;
    } else if (status === "pending") {
      filters.isApproved = false;
    }

    if (type === "FILM" || type === "SERIE") {
      filters.type = type;
    }

    console.log("[API] GET /api/admin/contents - Filtres:", filters);

    // Compter le nombre total de contenus correspondant aux filtres
    const totalCount = await prisma.content.count({
      where: filters,
    });

    // Récupérer les contenus avec pagination
    const contents = await prisma.content.findMany({
      where: filters,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
        film: true,
        serie: {
          include: {
            seasons: {
              include: {
                episodes: true,
              },
              orderBy: {
                number: "asc",
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    });

    console.log(
      `[API] GET /api/admin/contents - ${contents.length} contenus trouvés (total: ${totalCount})`
    );

    return NextResponse.json({
      contents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/admin/contents - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contenus" },
      { status: 500 }
    );
  }
}

// POST /api/admin/contents
// Créer un nouveau contenu (film ou série)
export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/admin/contents - Début");

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        "[API] POST /api/admin/contents - Erreur d'authentification:",
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les données du corps de la requête
    const body = await request.json();
    console.log("[API] POST /api/admin/contents - Données reçues:", body);

    const {
      title,
      type,
      price,
      thumbnail,
      description,
      creatorId,
      genre,
      director,
      year,
      country,
      language,
      cast,
      isFeatured,
      isApproved = false, // Par défaut, les contenus ne sont pas approuvés
      // Données spécifiques pour les films
      duration,
      videoPath,
      // Données spécifiques pour les séries
      seasons,
    } = body;

    // Validation des données requises
    if (!title || !type || !description || !creatorId) {
      return NextResponse.json(
        {
          error:
            "Les champs titre, type, description et créateur sont obligatoires",
        },
        { status: 400 }
      );
    }

    // Valider que le type est correct
    if (type !== "FILM" && type !== "SERIE") {
      return NextResponse.json(
        { error: "Le type doit être 'FILM' ou 'SERIE'" },
        { status: 400 }
      );
    }

    // Vérifier que le créateur existe
    const creator = await prisma.user.findUnique({
      where: { id: creatorId, role: "CREATOR" },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Le créateur spécifié n'existe pas" },
        { status: 400 }
      );
    }

    // Création du contenu en fonction du type
    let newContent;

    // Utiliser une transaction pour garantir l'intégrité des données
    await prisma.$transaction(async (tx) => {
      // 1. Créer le contenu de base
      newContent = await tx.content.create({
        data: {
          title,
          type,
          price: price ? parseFloat(price) : null,
          thumbnail,
          description,
          creatorId,
          isApproved,
          genre,
          director,
          year,
          country,
          language,
          cast,
          isFeatured: !!isFeatured,
        },
      });

      // 2. Ajouter les données spécifiques selon le type de contenu
      if (type === "FILM") {
        if (!duration || !videoPath) {
          throw new Error(
            "La durée et le chemin vidéo sont requis pour un film"
          );
        }

        await tx.film.create({
          data: {
            contentId: newContent.id,
            duration: parseInt(duration),
            videoPath,
          },
        });
      } else if (type === "SERIE") {
        // Créer la série sans exiger de saisons ou d'épisodes
        const newSerie = await tx.serie.create({
          data: {
            contentId: newContent.id,
          },
        });

        // Si des saisons sont fournies, les ajouter
        if (seasons && Array.isArray(seasons) && seasons.length > 0) {
          // Créer les saisons et les épisodes
          for (const season of seasons) {
            if (
              !season.number ||
              !season.episodes ||
              season.episodes.length === 0
            ) {
              throw new Error(
                "Chaque saison doit avoir un numéro et au moins un épisode"
              );
            }

            const newSeason = await tx.season.create({
              data: {
                serieId: newSerie.id,
                number: parseInt(season.number),
                title: season.title,
              },
            });

            // Créer les épisodes
            for (const episode of season.episodes) {
              if (!episode.title || !episode.duration || !episode.videoPath) {
                throw new Error(
                  "Chaque épisode doit avoir un titre, une durée et un chemin vidéo"
                );
              }

              await tx.episode.create({
                data: {
                  seasonId: newSeason.id,
                  title: episode.title,
                  duration: parseInt(episode.duration),
                  videoPath: episode.videoPath,
                  number: episode.number ? parseInt(episode.number) : null,
                  thumbnail: episode.thumbnail,
                  description: episode.description,
                },
              });
            }
          }
        }
      }
    });

    console.log(
      `[API] POST /api/admin/contents - Contenu créé avec succès. ID: ${newContent?.id}`
    );

    // Récupérer le contenu créé avec toutes les relations
    const createdContent = await prisma.content.findUnique({
      where: { id: newContent!.id },
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
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

    return NextResponse.json({
      message: "Contenu créé avec succès",
      content: createdContent,
    });
  } catch (error) {
    console.error("[API] POST /api/admin/contents - Erreur:", error);
    const errorMessage =
      error instanceof Error
        ? error.message
        : "Erreur lors de la création du contenu";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
