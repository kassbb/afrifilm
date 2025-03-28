import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";

// GET /api/contents
// Récupérer tous les contenus publics pour l'affichage front-office
export async function GET(request: NextRequest) {
  try {
    console.log("[API] GET /api/contents - Début");

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const type = searchParams.get("type"); // "FILM" ou "SERIE"
    const genre = searchParams.get("genre");
    const featured = searchParams.get("featured") === "true";
    const newest = searchParams.get("newest") === "true";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");
    const offset = (page - 1) * limit;

    // Construire les filtres de requête
    const filters: any = {
      isApproved: true, // Uniquement les contenus approuvés
    };

    if (search) {
      filters.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    if (type === "FILM" || type === "SERIE") {
      filters.type = type;
    }

    if (genre) {
      filters.genre = {
        contains: genre,
        mode: "insensitive",
      };
    }

    if (featured) {
      filters.isFeatured = true;
    }

    // Déterminer l'ordre des résultats
    let orderBy: any = { createdAt: "desc" };
    if (newest) {
      orderBy = [{ isNew: "desc" }, { createdAt: "desc" }];
    }
    if (featured) {
      orderBy = [{ featuredRank: "asc" }, { createdAt: "desc" }];
    }

    console.log("[API] GET /api/contents - Filtres:", filters);

    // Compter le nombre total de contenus correspondant aux filtres
    const totalCount = await prisma.content.count({
      where: filters,
    });

    // Récupérer les contenus avec pagination
    const contents = await prisma.content.findMany({
      where: filters,
      orderBy,
      include: {
        film: {
          select: {
            id: true,
            duration: true,
          },
        },
        serie: {
          select: {
            id: true,
            seasons: {
              select: {
                id: true,
                number: true,
                _count: {
                  select: {
                    episodes: true,
                  },
                },
              },
            },
          },
        },
      },
      skip: offset,
      take: limit,
    });

    // Transformer les données pour une réponse plus légère
    const formattedContents = contents.map((content) => {
      // Calculer la durée totale pour les séries (somme de tous les épisodes)
      let seasonsCount = 0;
      let episodesCount = 0;

      if (content.type === "SERIE" && content.serie) {
        seasonsCount = content.serie.seasons.length;
        episodesCount = content.serie.seasons.reduce(
          (total, season) => total + season._count.episodes,
          0
        );
      }

      return {
        id: content.id,
        title: content.title,
        description: content.description,
        type: content.type,
        thumbnail: content.thumbnail,
        price: content.price,
        genre: content.genre,
        director: content.director,
        year: content.year,
        country: content.country,
        language: content.language,
        isFeatured: content.isFeatured,
        isNew: content.isNew,
        createdAt: content.createdAt,
        // Informations spécifiques au type
        duration: content.type === "FILM" ? content.film?.duration : null,
        seasonsCount: content.type === "SERIE" ? seasonsCount : null,
        episodesCount: content.type === "SERIE" ? episodesCount : null,
      };
    });

    console.log(
      `[API] GET /api/contents - ${contents.length} contenus trouvés (total: ${totalCount})`
    );

    return NextResponse.json({
      contents: formattedContents,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    console.error("[API] GET /api/contents - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contenus" },
      { status: 500 }
    );
  }
}
