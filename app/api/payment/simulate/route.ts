import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getToken } from "next-auth/jwt";

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
    console.log(
      `[API] POST /api/payment/simulate - Cookies reçus:`,
      cookies ? "Présents" : "Absents"
    );

    // 1. Essayer de récupérer la session via getServerSession
    let session;
    let userId = null;

    try {
      session = await getServerSession(authOptions);
      if (session?.user?.id) {
        userId = session.user.id;
        console.log(
          "[API] Session trouvée via getServerSession:",
          session.user.email
        );
      } else {
        console.log("[API] Pas de session via getServerSession");
      }
    } catch (sessionError) {
      console.log("[API] Erreur getServerSession:", sessionError);
    }

    // 2. Si pas de session, essayer de récupérer le token JWT directement
    if (!userId) {
      try {
        const token = await getToken({
          req: request,
          secret: process.env.NEXTAUTH_SECRET || process.env.JWT_SECRET,
        });

        if (token?.sub) {
          userId = token.sub;
          console.log(
            "[API] Session récupérée via JWT token pour:",
            token.email
          );
        } else {
          console.log("[API] Pas de token JWT valide trouvé");
        }
      } catch (tokenError) {
        console.log("[API] Erreur récupération token JWT:", tokenError);
      }
    }

    // 3. Vérifier l'authentification
    if (!userId) {
      console.log(
        "[API] Échec authentification, aucune méthode n'a fonctionné"
      );
      return NextResponse.json(
        {
          error: "Non authentifié. Veuillez vous connecter à nouveau.",
          sessionInfo: {
            cookiesPresent: !!cookies,
            sessionFound: !!session,
            userFound: !!session?.user,
          },
        },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // 4. À ce stade nous avons un userId valide, vérifier qu'il existe toujours
    console.log("[API] POST /api/payment/simulate - UserID:", userId);

    const userExists = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: { id: true },
    });

    if (!userExists) {
      console.log(
        "[API] Utilisateur non trouvé dans la base de données:",
        userId
      );
      return NextResponse.json(
        { error: "Compte utilisateur non trouvé. Veuillez vous reconnecter." },
        {
          status: 401,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

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
        // Ne pas filtrer sur isPaid car c'est true par défaut
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
      console.log("[API] POST /api/payment/simulate - Transaction non trouvée");
      return NextResponse.json(
        { error: "Transaction non trouvée" },
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

    // Mettre à jour la transaction (pas besoin de changer isPaid car c'est déjà true par défaut)
    const updatedTransaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        paymentMethod: "ORANGE_MONEY",
      },
    });

    // Générer un numéro de référence pour la réponse mais pas pour la DB
    const newReferenceNumber = generateReferenceNumber();

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
      referenceNumber: newReferenceNumber, // Inclus dans la réponse mais pas stocké en BDD
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
