import { NextRequest, NextResponse } from "next/server";
import { getContentById } from "@/app/mockData";

// POST /api/transactions - Créer une nouvelle transaction (achat de contenu)
export const POST = async (request: NextRequest) => {
  try {
    const body = await request.json();
    const { contentId } = body;

    // Vérifier si le contenu existe
    const content = getContentById(contentId);

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Pour les tests, simuler une transaction réussie
    const transaction = {
      id: "tx_" + Math.random().toString(36).substring(2, 15),
      contentId,
      userId: "user_test",
      amount: content.price || 0,
      isPaid: true,
      paymentMethod: "Carte de crédit",
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json({
      message: "Contenu acheté avec succès",
      transaction,
    });
  } catch (error) {
    console.error("Erreur lors de la création de la transaction:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la transaction" },
      { status: 500 }
    );
  }
};

// GET /api/transactions - Récupérer les transactions de l'utilisateur
export const GET = async (request: NextRequest) => {
  try {
    // Pour les tests, simuler des transactions
    const transactions = [
      {
        id: "tx_1",
        contentId: "film1",
        userId: "user_test",
        amount: 4.99,
        isPaid: true,
        paymentMethod: "Carte de crédit",
        createdAt: new Date().toISOString(),
        content: getContentById("film1"),
      },
      {
        id: "tx_2",
        contentId: "film2",
        userId: "user_test",
        amount: 5.99,
        isPaid: true,
        paymentMethod: "Carte de crédit",
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Hier
        content: getContentById("film2"),
      },
    ];

    return NextResponse.json({
      transactions,
      meta: {
        page: 1,
        limit: 10,
        total: transactions.length,
        pages: 1,
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des transactions:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des transactions" },
      { status: 500 }
    );
  }
};
