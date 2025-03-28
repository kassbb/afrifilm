import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET /api/user/favorites
 *
 * Récupère la liste des contenus favoris de l'utilisateur connecté
 */
export async function GET(request: NextRequest) {
  try {
    // Temporairement désactiver la vérification de session pour tests
    // const session = await getServerSession(authOptions);
    //
    // if (!session || !session.user?.id) {
    //   return NextResponse.json(
    //     { error: "Non autorisé. Veuillez vous connecter." },
    //     { status: 401 }
    //   );
    // }
    //
    // const userId = session.user.id;

    // Retourner une réponse temporaire en attendant la mise à jour du schéma Prisma
    return NextResponse.json({
      favorites: [],
      message:
        "API temporairement désactivée en attente de migration de la base de données",
    });

    // Ancien code à réactiver après migration :
    /*
    // Récupération des favoris avec les détails des contenus
    const favorites = await prisma.favorite.findMany({
      where: {
        userId,
      },
      include: {
        content: {
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
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transformation des données
    const transformedFavorites = favorites.map((favorite) => {
      const content = favorite.content;
      const mainImage =
        content.images.length > 0 ? content.images[0].path : null;

      return {
        id: favorite.id,
        contentId: content.id,
        title: content.title,
        type: content.type,
        description: content.description,
        releaseYear: content.releaseYear,
        imagePath: mainImage,
        isFeatured: content.isFeatured,
        isPremium: content.price > 0,
        price: content.price,
        categories: content.categories.map((c) => ({
          id: c.category.id,
          name: c.category.name,
        })),
        addedToFavoritesAt: favorite.createdAt,
      };
    });

    return NextResponse.json({
      favorites: transformedFavorites,
    });
    */
  } catch (error) {
    console.error("Error fetching user favorites:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des favoris." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/favorites
 *
 * Ajoute un contenu aux favoris de l'utilisateur connecté
 *
 * Body:
 * - contentId: ID du contenu à ajouter aux favoris
 */
export async function POST(request: NextRequest) {
  try {
    // Temporairement désactiver la vérification de session pour tests
    // const session = await getServerSession(authOptions);
    //
    // if (!session || !session.user?.id) {
    //   return NextResponse.json(
    //     { error: "Non autorisé. Veuillez vous connecter." },
    //     { status: 401 }
    //   );
    // }
    //
    // const userId = session.user.id;

    // Retourner une réponse temporaire en attendant la mise à jour du schéma Prisma
    return NextResponse.json({
      message:
        "API temporairement désactivée en attente de migration de la base de données",
      success: false,
    });

    // Ancien code à réactiver après migration :
    /*
    const { contentId } = await request.json();

    if (!contentId) {
      return NextResponse.json(
        { error: "L'ID du contenu est requis." },
        { status: 400 }
      );
    }

    // Vérification que le contenu existe
    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé." },
        { status: 404 }
      );
    }

    // Vérification si le favori existe déjà
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId,
        contentId,
      },
    });

    if (existingFavorite) {
      return NextResponse.json({
        message: "Ce contenu est déjà dans vos favoris.",
        favorite: existingFavorite,
      });
    }

    // Création du favori
    const favorite = await prisma.favorite.create({
      data: {
        userId,
        contentId,
      },
    });

    return NextResponse.json({
      message: "Contenu ajouté aux favoris avec succès.",
      favorite,
    });
    */
  } catch (error) {
    console.error("Error adding to favorites:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'ajout aux favoris." },
      { status: 500 }
    );
  }
}
