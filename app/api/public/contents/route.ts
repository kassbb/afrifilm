import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { ContentType } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET /api/public/contents
 *
 * Récupère la liste des contenus publics (films et séries)
 *
 * Query params:
 * - type: FILM | SERIE (optionnel)
 * - limit: nombre d'éléments à récupérer (défaut: 20)
 * - offset: index de départ (pour pagination) (défaut: 0)
 * - search: terme de recherche (optionnel)
 * - categories: ids des catégories séparés par des virgules (optionnel)
 * - featured: true pour récupérer uniquement les contenus mis en avant (optionnel)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Extraction et validation des paramètres
    const typeParam = searchParams.get("type");
    const limitParam = searchParams.get("limit");
    const offsetParam = searchParams.get("offset");
    const searchParam = searchParams.get("search");
    const categoriesParam = searchParams.get("categories");
    const featuredParam = searchParams.get("featured");

    const limit = limitParam ? parseInt(limitParam) : 20;
    const offset = offsetParam ? parseInt(offsetParam) : 0;
    const type = typeParam as ContentType | null;
    const featured = featuredParam === "true";

    // Construction des filtres Prisma
    const filters: any = {
      isApproved: true, // Uniquement les contenus approuvés
      AND: [],
    };

    // Filtre par type si spécifié
    if (type) {
      filters.type = type;
    }

    // Filtre par recherche si spécifié
    if (searchParam) {
      filters.AND.push({
        OR: [
          { title: { contains: searchParam, mode: "insensitive" } },
          { description: { contains: searchParam, mode: "insensitive" } },
        ],
      });
    }

    // Filtre par catégories si spécifié
    if (categoriesParam) {
      const categoryIds = categoriesParam.split(",");
      filters.AND.push({
        categories: {
          some: {
            categoryId: { in: categoryIds },
          },
        },
      });
    }

    // Filtre par featured si spécifié
    if (featured) {
      filters.isFeatured = true;
    }

    // Si aucun AND filter n'est nécessaire
    if (filters.AND.length === 0) {
      delete filters.AND;
    }

    console.log("Filters:", JSON.stringify(filters, null, 2));

    // Récupération des contenus avec leur image principale et catégories
    const contents = await prisma.content.findMany({
      where: filters,
      include: {
        images: {
          where: { isMain: true },
          take: 1,
        },
        categories: {
          include: {
            category: true,
          },
        },
        seasons: {
          include: {
            _count: {
              select: { episodes: true },
            },
          },
        },
        _count: {
          select: { seasons: true },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: offset,
      take: limit,
    });

    // Récupération du nombre total d'éléments pour la pagination
    const totalCount = await prisma.content.count({
      where: filters,
    });

    // Transformation des données pour l'API publique
    const transformedContents = contents.map((content) => {
      const mainImage =
        content.images.length > 0 ? content.images[0].path : null;

      return {
        id: content.id,
        title: content.title,
        type: content.type,
        description: content.description,
        releaseYear: content.releaseYear,
        duration: content.duration,
        imagePath: mainImage,
        isFeatured: content.isFeatured,
        isNew:
          new Date(content.createdAt).getTime() >
          Date.now() - 30 * 24 * 60 * 60 * 1000, // Nouveauté si < 30 jours
        isPremium: content.price > 0,
        price: content.price,
        categories: content.categories.map((c) => ({
          id: c.category.id,
          name: c.category.name,
        })),
        seasonsCount: content._count.seasons,
        episodesCount: content.seasons.reduce(
          (acc, season) => acc + season._count.episodes,
          0
        ),
      };
    });

    return NextResponse.json({
      contents: transformedContents,
      pagination: {
        total: totalCount,
        limit,
        offset,
        hasMore: offset + limit < totalCount,
      },
    });
  } catch (error) {
    console.error("Error fetching public contents:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contenus." },
      { status: 500 }
    );
  }
}
