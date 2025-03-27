import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/user/transactions
// Récupérer toutes les transactions de l'utilisateur connecté
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les transactions de l'utilisateur
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: session.user.id,
        isPaid: true,
      },
      include: {
        content: {
          include: {
            film: true,
            series: {
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
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(transactions);
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des transactions" },
      { status: 500 }
    );
  }
}

// POST /api/user/transactions/verify
// Vérifier si l'utilisateur a acheté un contenu spécifique
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      return NextResponse.json(
        { error: "ID du contenu requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà acheté ce contenu
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId: session.user.id,
        contentId: contentId,
        isPaid: true,
      },
    });

    return NextResponse.json({
      hasPurchased: !!transaction,
      transaction: transaction || null,
    });
  } catch (error) {
    console.error("Erreur lors de la vérification de l'achat:", error);
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'achat" },
      { status: 500 }
    );
  }
}
