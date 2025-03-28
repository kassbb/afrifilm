import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/payment/verify/[transactionId]
// Vérifier le statut d'une transaction
export async function GET(
  request: NextRequest,
  { params }: { params: { transactionId: string } }
) {
  try {
    console.log(
      `[API] GET /api/payment/verify/${params.transactionId} - Début`
    );

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log(
        `[API] GET /api/payment/verify/${params.transactionId} - Non authentifié`
      );
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const userId = session.user.id;
    const { transactionId } = params;

    if (!transactionId) {
      console.log("[API] GET /api/payment/verify - ID de transaction manquant");
      return NextResponse.json(
        { error: "ID de transaction manquant" },
        { status: 400 }
      );
    }

    // Vérifier si la transaction existe et appartient à l'utilisateur
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
      },
      include: {
        content: {
          select: {
            id: true,
            title: true,
            type: true,
            thumbnail: true,
          },
        },
      },
    });

    if (!transaction) {
      console.log(
        `[API] GET /api/payment/verify/${transactionId} - Transaction non trouvée`
      );
      return NextResponse.json(
        { error: "Transaction non trouvée" },
        { status: 404 }
      );
    }

    // Retourner les détails de la transaction
    console.log(
      `[API] GET /api/payment/verify/${transactionId} - Transaction trouvée`
    );
    return NextResponse.json({
      success: true,
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        isPaid: transaction.isPaid,
        paymentMethod: transaction.paymentMethod,
        createdAt: transaction.createdAt,
        content: transaction.content,
      },
    });
  } catch (error) {
    console.error(
      `[API] GET /api/payment/verify/${params.transactionId} - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la vérification de la transaction" },
      { status: 500 }
    );
  }
}
