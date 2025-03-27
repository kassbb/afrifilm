import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/contents/[id]
// Route publique pour récupérer un contenu spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID du contenu manquant" },
        { status: 400 }
      );
    }

    const content = await prisma.content.findUnique({
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
        creator: {
          select: {
            id: true,
            email: true,
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

    // Vérifier si le contenu est approuvé (sauf si c'est une API admin)
    if (!content.isApproved) {
      return NextResponse.json(
        { error: "Ce contenu n'est pas disponible" },
        { status: 403 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error);
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
