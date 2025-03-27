import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { withRoleAuth } from "@/app/lib/auth";

const prisma = new PrismaClient();

// Fonction auxiliaire pour gérer l'approbation des contenus avec contournement des problèmes de type
async function approveContent(
  contentId: string,
  isApproved: boolean,
  rejectionReason?: string
) {
  // Vérifier si le contenu existe
  const content = await prisma.content.findUnique({
    where: { id: contentId },
    include: {
      creator: true,
    },
  });

  if (!content) {
    return { error: "Contenu non trouvé", status: 404 };
  }

  // Mise à jour du contenu - en utilisant any pour contourner les erreurs de type
  const updateData: any = {
    isApproved,
    // Si le contenu est rejeté, ajouter la raison de rejet
    ...(!isApproved && rejectionReason
      ? { rejectionReason }
      : { rejectionReason: null }),
  };

  try {
    const updatedContent = await prisma.content.update({
      where: { id: contentId },
      data: updateData,
    });

    return {
      message: isApproved ? "Contenu approuvé avec succès" : "Contenu rejeté",
      content: updatedContent,
    };
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contenu:", error);
    return {
      error: "Erreur lors de la mise à jour du contenu",
      status: 500,
      details: error,
    };
  }
}

// PATCH /api/admin/contents/[id] - Approuver ou rejeter un contenu
export const PATCH = withRoleAuth(
  ["ADMIN"],
  async (request: NextRequest, tokenPayload, ...rest) => {
    try {
      // Extraire l'ID du contenu de l'URL
      const url = new URL(request.url);
      const segments = url.pathname.split("/");
      const contentId = segments[segments.length - 1];

      if (!contentId) {
        return NextResponse.json(
          { error: "ID de contenu manquant" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const { isApproved, rejectionReason } = body;

      if (isApproved === undefined) {
        return NextResponse.json(
          { error: "Le statut d'approbation est requis" },
          { status: 400 }
        );
      }

      const result = await approveContent(
        contentId,
        isApproved,
        rejectionReason
      );

      if (result.error) {
        return NextResponse.json(
          { error: result.error, details: result.details },
          { status: result.status || 500 }
        );
      }

      return NextResponse.json(result);
    } catch (error) {
      console.error("Erreur lors de la mise à jour du contenu:", error);
      return NextResponse.json(
        { error: "Erreur lors de la mise à jour du contenu" },
        { status: 500 }
      );
    }
  }
);

// DELETE /api/admin/contents/[id] - Supprimer un contenu
export const DELETE = withRoleAuth(
  ["ADMIN"],
  async (request: NextRequest, tokenPayload, ...rest) => {
    try {
      // Extraire l'ID du contenu de l'URL
      const url = new URL(request.url);
      const segments = url.pathname.split("/");
      const contentId = segments[segments.length - 1];

      if (!contentId) {
        return NextResponse.json(
          { error: "ID de contenu manquant" },
          { status: 400 }
        );
      }

      // Vérifier si le contenu existe
      const content = await prisma.content.findUnique({
        where: { id: contentId },
      });

      if (!content) {
        return NextResponse.json(
          { error: "Contenu non trouvé" },
          { status: 404 }
        );
      }

      // Suppression en cascade
      try {
        // Si c'est un film, supprimer l'entrée film
        if (content.type === "FILM") {
          await prisma.film.delete({
            where: { contentId },
          });
        }

        // Si c'est une série, supprimer les saisons et épisodes
        if (content.type === "SERIE") {
          const serie = await prisma.serie.findUnique({
            where: { contentId },
            include: {
              seasons: {
                include: {
                  episodes: true,
                },
              },
            },
          });

          if (serie) {
            // Supprimer tous les épisodes de chaque saison
            for (const season of serie.seasons) {
              await prisma.episode.deleteMany({
                where: { seasonId: season.id },
              });
            }

            // Supprimer toutes les saisons
            await prisma.season.deleteMany({
              where: { serieId: serie.id },
            });

            // Supprimer la série
            await prisma.serie.delete({
              where: { id: serie.id },
            });
          }
        }

        // Supprimer les transactions liées
        await prisma.transaction.deleteMany({
          where: { contentId },
        });

        // Supprimer le contenu
        await prisma.content.delete({
          where: { id: contentId },
        });

        return NextResponse.json({
          message: "Contenu supprimé avec succès",
        });
      } catch (error) {
        console.error("Erreur lors de la suppression:", error);
        return NextResponse.json(
          { error: "Erreur lors de la suppression du contenu", details: error },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du contenu:", error);
      return NextResponse.json(
        { error: "Erreur lors de la suppression du contenu" },
        { status: 500 }
      );
    }
  }
);
