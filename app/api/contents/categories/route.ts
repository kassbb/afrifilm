import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * GET /api/contents/categories
 *
 * Récupère les catégories distinctes à partir du champ genre des contenus
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type"); // FILM ou SERIE

    // Construire le filtre
    const filter: any = {
      isApproved: true,
    };

    if (type) {
      filter.type = type;
    }

    // Récupérer les genres uniques
    const contentsWithGenres = await prisma.content.findMany({
      where: filter,
      select: {
        genre: true,
      },
      distinct: ["genre"],
    });

    // Transformer les données pour correspondre au format attendu
    const categories = contentsWithGenres
      .filter((content) => content.genre) // Exclure les contenus sans genre
      .map((content, index) => ({
        id: `genre-${index + 1}`,
        name: content.genre || "", // Ajouter une valeur par défaut pour éviter l'erreur null
        contentCount: 0, // Nous mettrons à jour ce chiffre ci-dessous
      }));

    // Compter les contenus pour chaque genre
    await Promise.all(
      categories.map(async (category) => {
        const count = await prisma.content.count({
          where: {
            ...filter,
            genre: category.name,
          },
        });
        category.contentCount = count;
      })
    );

    // Trier par nom (en s'assurant que name n'est jamais null)
    categories.sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({
      categories,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}
