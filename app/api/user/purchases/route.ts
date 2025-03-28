import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET /api/user/purchases
 *
 * Récupère tous les achats de l'utilisateur connecté
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
      message:
        "API temporairement désactivée en attente de migration de la base de données",
      purchases: [],
    });

    // Ancien code à réactiver après migration :
    /*
    const purchases = await prisma.transaction.findMany({
      where: {
        userId,
        status: "COMPLETED",
      },
      include: {
        content: {
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
        },
      },
    });

    return NextResponse.json({ purchases });
    */
  } catch (error) {
    console.error("Error fetching purchases:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des achats." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/purchases
 *
 * Crée un nouvel achat pour l'utilisateur connecté
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
    // const { contentId, paymentMethod, amount } = await request.json();
    //
    // if (!contentId || !paymentMethod || !amount) {
    //   return NextResponse.json(
    //     { error: "Données manquantes." },
    //     { status: 400 }
    //   );
    // }

    // Retourner une réponse temporaire en attendant la mise à jour du schéma Prisma
    return NextResponse.json({
      message:
        "API temporairement désactivée en attente de migration de la base de données",
      success: false,
    });

    // Ancien code à réactiver après migration :
    /*
    // Vérifier si l'utilisateur a déjà acheté ce contenu
    const existingPurchase = await prisma.transaction.findFirst({
      where: {
        userId,
        contentId,
        status: "COMPLETED",
      },
    });

    if (existingPurchase) {
      return NextResponse.json(
        { error: "Ce contenu a déjà été acheté." },
        { status: 400 }
      );
    }

    // Créer l'achat
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        contentId,
        paymentMethod,
        amount,
        status: "COMPLETED",
      },
    });

    return NextResponse.json({
      message: "Achat effectué avec succès.",
      transaction,
    });
    */
  } catch (error) {
    console.error("Error creating purchase:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'achat." },
      { status: 500 }
    );
  }
}
