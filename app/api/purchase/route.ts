import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// POST /api/purchase
// Route pour effectuer un achat de contenu
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

    // Récupérer l'utilisateur et le contenu
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    const content = await prisma.content.findUnique({
      where: { id: contentId },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si le contenu est approuvé
    if (!content.isApproved) {
      return NextResponse.json(
        { error: "Ce contenu n'est pas disponible à l'achat" },
        { status: 403 }
      );
    }

    // Vérifier si l'utilisateur a déjà acheté ce contenu
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId: user.id,
        contentId: content.id,
        isPaid: true,
      },
    });

    if (existingTransaction) {
      return NextResponse.json(
        { error: "Vous avez déjà acheté ce contenu" },
        { status: 400 }
      );
    }

    // Simuler le processus de paiement (pour le MVP)
    // Dans un environnement de production, vous intégreriez ici un service de paiement réel

    // Créer une nouvelle transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: user.id,
        contentId: content.id,
        amount: content.price || 0,
        isPaid: true, // Simulation de paiement réussi
      },
    });

    return NextResponse.json({
      success: true,
      message: "Achat effectué avec succès",
      transaction,
    });
  } catch (error) {
    console.error("Erreur lors de l'achat:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'achat" },
      { status: 500 }
    );
  }
}
