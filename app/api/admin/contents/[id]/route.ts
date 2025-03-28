import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

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

// GET /api/admin/contents/[id]
// Récupérer les détails d'un contenu spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] GET /api/admin/contents/${params.id} - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] GET /api/admin/contents/${params.id} - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    // Récupérer le contenu avec toutes ses relations
    const content = await prisma.content.findUnique({
      where: { id },
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
    });

    if (!content) {
      console.log(`[API] GET /api/admin/contents/${id} - Contenu non trouvé`);
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    console.log(`[API] GET /api/admin/contents/${id} - Contenu trouvé`);
    return NextResponse.json(content);
  } catch (error) {
    console.error(
      `[API] GET /api/admin/contents/${params.id} - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/contents/[id]
// Mettre à jour un contenu existant
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] PATCH /api/admin/contents/${params.id} - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] PATCH /api/admin/contents/${params.id} - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    console.log(
      `[API] PATCH /api/admin/contents/${id} - Données reçues:`,
      body
    );

    // Vérifier si le contenu existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
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

    if (!existingContent) {
      console.log(`[API] PATCH /api/admin/contents/${id} - Contenu non trouvé`);
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Extraire les données à mettre à jour
    const {
      title,
      description,
      price,
      thumbnail,
      isApproved,
      rejectionReason,
      genre,
      director,
      year,
      country,
      language,
      cast,
      isFeatured,
      // Données spécifiques pour les films
      duration,
      videoPath,
      // Données spécifiques pour les séries
      seasons,
    } = body;

    // Préparer les données de base du contenu à mettre à jour
    const contentUpdateData: any = {};

    if (title !== undefined) contentUpdateData.title = title;
    if (description !== undefined) contentUpdateData.description = description;
    if (price !== undefined)
      contentUpdateData.price = price ? parseFloat(price) : null;
    if (thumbnail !== undefined) contentUpdateData.thumbnail = thumbnail;
    if (isApproved !== undefined) contentUpdateData.isApproved = isApproved;
    if (rejectionReason !== undefined)
      contentUpdateData.rejectionReason = rejectionReason;
    if (genre !== undefined) contentUpdateData.genre = genre;
    if (director !== undefined) contentUpdateData.director = director;
    if (year !== undefined) contentUpdateData.year = year;
    if (country !== undefined) contentUpdateData.country = country;
    if (language !== undefined) contentUpdateData.language = language;
    if (cast !== undefined) contentUpdateData.cast = cast;
    if (isFeatured !== undefined) contentUpdateData.isFeatured = isFeatured;

    // Mise à jour du contenu en fonction de son type
    await prisma.$transaction(async (tx) => {
      // 1. Mettre à jour les données de base du contenu
      await tx.content.update({
        where: { id },
        data: contentUpdateData,
      });

      // 2. Mettre à jour les données spécifiques selon le type
      if (existingContent.type === "FILM" && existingContent.film) {
        // Mise à jour du film
        if (duration !== undefined || videoPath !== undefined) {
          const filmUpdateData: any = {};
          if (duration !== undefined)
            filmUpdateData.duration = parseInt(duration);
          if (videoPath !== undefined) filmUpdateData.videoPath = videoPath;

          await tx.film.update({
            where: { contentId: id },
            data: filmUpdateData,
          });
        }
      } else if (
        existingContent.type === "SERIE" &&
        existingContent.serie &&
        seasons
      ) {
        // Mise à jour des saisons et épisodes
        // Note: Cette partie est complexe et nécessiterait une logique plus élaborée
        // pour gérer l'ajout, la suppression et la mise à jour des saisons et épisodes
        console.log(
          "[API] PATCH - Mise à jour des saisons et épisodes non implémentée"
        );
      }
    });

    // Récupérer le contenu mis à jour
    const updatedContent = await prisma.content.findUnique({
      where: { id },
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
    });

    console.log(`[API] PATCH /api/admin/contents/${id} - Mise à jour réussie`);
    return NextResponse.json({
      message: "Contenu mis à jour avec succès",
      content: updatedContent,
    });
  } catch (error) {
    console.error(
      `[API] PATCH /api/admin/contents/${params.id} - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du contenu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contents/[id]
// Supprimer un contenu
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] DELETE /api/admin/contents/${params.id} - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] DELETE /api/admin/contents/${params.id} - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    // Vérifier si le contenu existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
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

    if (!existingContent) {
      console.log(
        `[API] DELETE /api/admin/contents/${id} - Contenu non trouvé`
      );
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le contenu et ses relations en cascade
    await prisma.$transaction(async (tx) => {
      if (existingContent.type === "FILM") {
        // Supprimer le film
        await tx.film.deleteMany({
          where: { contentId: id },
        });
      } else if (existingContent.type === "SERIE" && existingContent.serie) {
        // Supprimer les épisodes pour chaque saison
        for (const season of existingContent.serie.seasons) {
          await tx.episode.deleteMany({
            where: { seasonId: season.id },
          });
        }

        // Supprimer les saisons
        await tx.season.deleteMany({
          where: { serieId: existingContent.serie.id },
        });

        // Supprimer la série
        await tx.serie.delete({
          where: { id: existingContent.serie.id },
        });
      }

      // Supprimer les transactions liées au contenu
      await tx.transaction.deleteMany({
        where: { contentId: id },
      });

      // Supprimer le contenu principal
      await tx.content.delete({
        where: { id },
      });
    });

    console.log(`[API] DELETE /api/admin/contents/${id} - Suppression réussie`);
    return NextResponse.json({
      message: "Contenu supprimé avec succès",
    });
  } catch (error) {
    console.error(
      `[API] DELETE /api/admin/contents/${params.id} - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la suppression du contenu" },
      { status: 500 }
    );
  }
}
