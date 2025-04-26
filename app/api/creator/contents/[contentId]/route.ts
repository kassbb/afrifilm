import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getToken } from "next-auth/jwt";

const prisma = new PrismaClient();
const secret = process.env.NEXTAUTH_SECRET || "your-jwt-secret-here";

// Fonction helper pour vérifier la session
async function getAuthenticatedCreatorId(request: NextRequest) {
  try {
    // Obtenir le token JWT de la session
    const token = await getToken({ req: request, secret });
    console.log("Token de session:", token);

    if (token?.sub && token?.role === "CREATOR") {
      console.log("Utilisateur créateur trouvé:", token.sub);
      return token.sub as string;
    }

    console.log("Session invalide ou utilisateur non créateur:", token);
    return null;
  } catch (error) {
    console.error("Erreur d'authentification:", error);
    return null;
  }
}

// GET /api/creator/contents/[contentId] - Récupérer un contenu spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const { contentId } = params;

    // Authentification
    const creatorId = await getAuthenticatedCreatorId(request);

    if (!creatorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le contenu existe et appartient au créateur
    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        creatorId,
      },
      include: {
        film: true,
        serie: {
          include: {
            seasons: {
              include: {
                episodes: true,
                _count: {
                  select: { episodes: true },
                },
              },
              orderBy: {
                number: "asc",
              },
            },
          },
        },
        transactions: {
          select: {
            amount: true,
            createdAt: true,
          },
        },
        _count: {
          select: { transactions: true },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Calculer les revenus
    const revenue = content.transactions.reduce(
      (sum, transaction) => sum + transaction.amount,
      0
    );

    return NextResponse.json({
      ...content,
      revenue,
      salesCount: content._count.transactions,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    );
  }
}

// DELETE /api/creator/contents/[contentId] - Supprimer un contenu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const { contentId } = params;

    // Authentification
    const creatorId = await getAuthenticatedCreatorId(request);

    if (!creatorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le contenu existe et appartient au créateur
    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        creatorId,
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
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer en cascade selon le type
    if (content.type === "FILM") {
      // Supprimer le film
      if (content.film) {
        await prisma.film.delete({
          where: { id: content.film.id },
        });
      }
    } else if (content.type === "SERIE" && content.serie) {
      // Supprimer tous les épisodes et saisons
      for (const season of content.serie.seasons) {
        // Supprimer les épisodes de la saison
        await prisma.episode.deleteMany({
          where: { seasonId: season.id },
        });
      }

      // Supprimer les saisons
      await prisma.season.deleteMany({
        where: { serieId: content.serie.id },
      });

      // Supprimer la série
      await prisma.serie.delete({
        where: { id: content.serie.id },
      });
    }

    // Supprimer le contenu principal
    await prisma.content.delete({
      where: { id: contentId },
    });

    return NextResponse.json({
      message: "Contenu supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du contenu" },
      { status: 500 }
    );
  }
}

// PATCH /api/creator/contents/[contentId] - Mettre à jour un contenu
export async function PATCH(
  request: NextRequest,
  { params }: { params: { contentId: string } }
) {
  try {
    const { contentId } = params;
    const body = await request.json();

    // Authentification
    const creatorId = await getAuthenticatedCreatorId(request);

    if (!creatorId) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    // Vérifier que le contenu existe et appartient au créateur
    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        creatorId,
      },
      include: {
        film: true,
        serie: true,
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Extraire les données de base du contenu
    const {
      title,
      description,
      price,
      genre,
      director,
      year,
      country,
      language,
      cast,
      thumbnail,
      // Pour les films
      duration,
      videoPath,
      // Pour les séries - non gérées dans cette version simple
    } = body;

    // Mettre à jour le contenu principal
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: {
        title,
        description,
        price: price ? parseFloat(price) : null,
        genre,
        director,
        year,
        country,
        language,
        cast: cast
          ? typeof cast === "string"
            ? cast
            : JSON.stringify(cast)
          : null,
        thumbnail,
        isApproved: false, // Remettre en attente d'approbation
      },
    });

    // Mettre à jour les données spécifiques au type
    if (content.type === "FILM" && content.film) {
      await prisma.film.update({
        where: { id: content.film.id },
        data: {
          duration: duration ? parseInt(duration) : undefined,
          videoPath,
        },
      });
    }

    return NextResponse.json({
      message: "Contenu mis à jour avec succès",
      content: updatedContent,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du contenu" },
      { status: 500 }
    );
  }
}
