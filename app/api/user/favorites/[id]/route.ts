import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * DELETE /api/user/favorites/[id]
 *
 * Supprime un contenu des favoris de l'utilisateur connecté
 *
 * L'ID peut être soit l'ID du favori, soit l'ID du contenu
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    // const id = params.id;

    // Retourner une réponse temporaire en attendant la mise à jour du schéma Prisma
    return NextResponse.json({
      message:
        "API temporairement désactivée en attente de migration de la base de données",
      success: false,
    });

    // Ancien code à réactiver après migration :
    /*
    // Essayer de trouver le favori par ID direct ou par contentId
    let favorite = await prisma.favorite.findFirst({
      where: {
        OR: [
          { id, userId },
          { contentId: id, userId },
        ],
      },
    });

    if (!favorite) {
      return NextResponse.json(
        { error: "Favori non trouvé." },
        { status: 404 }
      );
    }

    // Suppression du favori
    await prisma.favorite.delete({
      where: {
        id: favorite.id,
      },
    });

    return NextResponse.json({
      message: "Contenu retiré des favoris avec succès.",
    });
    */
  } catch (error) {
    console.error("Error removing from favorites:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression des favoris." },
      { status: 500 }
    );
  }
}
