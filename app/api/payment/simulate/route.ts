import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

/**
 * POST /api/payment/simulate
 * Simuler un paiement Orange Money pour acheter un contenu
 */
export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/payment/simulate - Début");

    // Vérifier les cookies pour le débogage
    const cookies = request.headers.get("cookie");
    console.log(`[API] POST /api/payment/simulate - Cookies reçus:`, cookies);

    const session = await getServerSession(authOptions);
    console.log(
      "[API] POST /api/payment/simulate - Session:",
      JSON.stringify({
        exists: !!session,
        userExists: !!session?.user,
        user: session?.user
          ? {
              id: session.user.id,
              email: session.user.email,
              role: session.user.role,
            }
          : null,
      })
    );

    if (!session || !session.user) {
      console.log("[API] POST /api/payment/simulate - Non authentifié");
      return NextResponse.json(
        {
          error: "Non authentifié. Veuillez vous connecter à nouveau.",
          sessionInfo: {
            exists: !!session,
            userExists: !!session?.user,
            cookiesPresent: !!cookies,
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, max-age=0, must-revalidate",
            Pragma: "no-cache",
          },
        }
      );
    }

    const userId = session.user.id;
    console.log("[API] POST /api/payment/simulate - UserID:", userId);

    const body = await request.json();
    const {
      transactionId,
      phoneNumber,
      code = "1234", // Code par défaut pour la simulation (en prod, il viendrait de l'API Orange Money)
    } = body;

    if (!transactionId || !phoneNumber) {
      console.log("[API] POST /api/payment/simulate - Données manquantes");
      return NextResponse.json(
        { error: "ID de transaction et numéro de téléphone requis" },
        { status: 400 }
      );
    }

    // Vérifier si la transaction existe et appartient à l'utilisateur
    const transaction = await prisma.transaction.findFirst({
      where: {
        id: transactionId,
        userId,
        isPaid: false, // Uniquement les transactions non payées
      },
      include: {
        content: {
          select: {
            title: true,
          },
        },
      },
    });

    if (!transaction) {
      console.log(
        "[API] POST /api/payment/simulate - Transaction non trouvée ou déjà payée"
      );
      return NextResponse.json(
        { error: "Transaction non trouvée ou déjà payée" },
        { status: 404 }
      );
    }

    // Valider le format du numéro de téléphone (simple vérification pour la démo)
    if (!/^\d{8,12}$/.test(phoneNumber)) {
      console.log(
        "[API] POST /api/payment/simulate - Format de numéro de téléphone invalide"
      );
      return NextResponse.json(
        { error: "Format de numéro de téléphone invalide" },
        { status: 400 }
      );
    }

    // Simulation de vérification du code Orange Money
    // Dans un environnement réel, nous ferions un appel à l'API Orange Money ici
    const isValidCode = code === "1234"; // Pour la démo, on accepte seulement "1234"

    if (!isValidCode) {
      console.log(
        "[API] POST /api/payment/simulate - Code de paiement invalide"
      );
      return NextResponse.json(
        { error: "Code de paiement invalide", paymentStatus: "FAILED" },
        { status: 400 }
      );
    }

    // Simuler un délai de traitement (1 seconde)
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // 10% de chance d'échec aléatoire pour simuler les problèmes de paiement
    const randomFailure = Math.random() < 0.1;

    if (randomFailure) {
      console.log(
        "[API] POST /api/payment/simulate - Échec aléatoire de la transaction"
      );
      return NextResponse.json({
        success: false,
        message: "Échec du paiement. Veuillez réessayer.",
        paymentStatus: "FAILED",
        transactionId,
      });
    }

    // Générer un numéro de référence
    const newReferenceNumber = generateReferenceNumber();

    // Mettre à jour la transaction comme payée
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        isPaid: true,
        paymentMethod: "ORANGE_MONEY",
        referenceNumber: newReferenceNumber,
      } as any, // Utiliser type assertion pour éviter l'erreur TypeScript
    });

    console.log(
      `[API] POST /api/payment/simulate - Paiement réussi pour la transaction ${transactionId}`
    );
    return NextResponse.json({
      success: true,
      message: "Paiement réussi",
      paymentStatus: "SUCCESS",
      transaction: {
        id: updatedTransaction.id,
        amount: updatedTransaction.amount,
        isPaid: updatedTransaction.isPaid,
        createdAt: updatedTransaction.createdAt,
        contentTitle: transaction.content.title,
      },
      referenceNumber: newReferenceNumber,
    });
  } catch (error) {
    console.error("[API] POST /api/payment/simulate - Erreur:", error);
    return NextResponse.json(
      {
        error: "Erreur lors de la simulation du paiement",
        paymentStatus: "ERROR",
      },
      { status: 500 }
    );
  }
}

// Génère un numéro de référence unique pour la transaction
function generateReferenceNumber() {
  const timestamp = new Date().getTime().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, "0");
  return `AFM-${timestamp}-${random}`;
}
