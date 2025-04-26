import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";
import { getToken } from "next-auth/jwt";

export const dynamic = "force-dynamic";
export const revalidate = 0; // Ne jamais mettre en cache cette API

// POST /api/payment/create
// Créer une nouvelle transaction pour l'achat d'un contenu
export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/payment/create - Début");
    console.log("[API] Cookies:", request.headers.get("cookie"));

    // 1. Essayer d'obtenir la session via getServerSession
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
          secureCookie: process.env.NODE_ENV === "production",
        });

        if (token?.sub) {
          userId = token.sub;
          console.log(
            "[API] Session récupérée via JWT token pour:",
            token.email
          );
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
            cookiesPresent: !!request.headers.get("cookie"),
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
    console.log("[API] POST /api/payment/create - UserID:", userId);

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

    // 5. Traiter la requête
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("[API] Erreur lors du parsing du JSON:", parseError);
      return NextResponse.json(
        { error: "Format de requête invalide" },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    const { contentId, price, phoneNumber } = body;

    if (!contentId) {
      console.log("[API] POST /api/payment/create - ID du contenu manquant");
      return NextResponse.json(
        { error: "ID du contenu manquant" },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // Vérifier si le contenu existe et est payant
    const content = await prisma.content.findUnique({
      where: {
        id: contentId,
        isApproved: true,
      },
      select: {
        id: true,
        title: true,
        price: true,
      },
    });

    if (!content) {
      console.log(
        "[API] POST /api/payment/create - Contenu non trouvé ou non approuvé"
      );
      return NextResponse.json(
        { error: "Contenu non trouvé ou non approuvé" },
        {
          status: 404,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // Vérifier si le contenu est payant
    if (!content.price) {
      console.log(
        "[API] POST /api/payment/create - Le contenu est gratuit, aucun paiement nécessaire"
      );
      return NextResponse.json(
        { error: "Le contenu est gratuit, aucun paiement nécessaire" },
        {
          status: 400,
          headers: {
            "Cache-Control":
              "no-store, no-cache, must-revalidate, proxy-revalidate",
            Pragma: "no-cache",
            Expires: "0",
          },
        }
      );
    }

    // Vérifier si l'utilisateur a déjà une transaction en cours pour ce contenu
    // Chercher les transactions payées ET en cours non payées
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        contentId,
        OR: [
          { isPaid: true },
          {
            isPaid: false,
            createdAt: { gt: new Date(Date.now() - 30 * 60 * 1000) },
          }, // Transactions créées depuis moins de 30 minutes
        ],
      },
    });

    if (existingTransaction) {
      // Si la transaction existe déjà et est payée
      if (existingTransaction.isPaid) {
        console.log(
          "[API] POST /api/payment/create - L'utilisateur a déjà acheté ce contenu"
        );
        return NextResponse.json(
          {
            error: "Vous avez déjà acheté ce contenu",
            transaction: existingTransaction,
          },
          {
            status: 400,
            headers: {
              "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
      }
      // Si la transaction existe mais n'est pas encore payée
      else {
        console.log(
          "[API] POST /api/payment/create - L'utilisateur a déjà une transaction en cours pour ce contenu"
        );
        return NextResponse.json(
          {
            error: "Vous avez déjà une transaction en cours pour ce contenu",
            transaction: existingTransaction,
          },
          {
            status: 400,
            headers: {
              "Cache-Control":
                "no-store, no-cache, must-revalidate, proxy-revalidate",
              Pragma: "no-cache",
              Expires: "0",
            },
          }
        );
      }
    }

    // Créer la transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId: userId,
        contentId: contentId,
        amount: content.price,
        paymentMethod: "ORANGE_MONEY",
      },
    });

    // Force update user access rights cache
    try {
      await prisma.$executeRaw`
        UPDATE "UserAccessRightsCache"
        SET "lastUpdated" = NOW(),
            "hasAccess" = true,
            "transactionId" = ${transaction.id}
        WHERE "userId" = ${userId}
        AND "contentId" = ${contentId}
      `;
      console.log("Cache des droits d'accès mis à jour avec succès");
    } catch (cacheError) {
      console.error("Erreur lors de la mise à jour du cache:", cacheError);
    }

    // Générer un numéro de référence pour la réponse
    const referenceNumber = generateReferenceNumber();

    // Préparer la réponse avec le format attendu par OrangeMoneyForm.tsx
    const responseData = {
      success: true,
      message: "Transaction créée avec succès",
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        contentId: transaction.contentId,
        contentTitle: content.title,
        createdAt: transaction.createdAt,
        referenceNumber: referenceNumber,
      },
    };

    // Retourner la réponse avec les en-têtes appropriés
    return NextResponse.json(responseData, {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("[API] POST /api/payment/create - Erreur:", error);

    // Créer un message d'erreur plus détaillé
    let errorDetails = "Erreur inconnue";
    let statusCode = 500;

    if (error instanceof Error) {
      errorDetails = `${error.name}: ${error.message}`;

      // Si c'est une erreur de base de données
      if (
        error.message.includes("database") ||
        error.message.includes("prisma")
      ) {
        errorDetails = "Erreur de base de données: " + error.message;
      }

      // Si c'est une erreur d'authentification
      if (
        error.message.includes("auth") ||
        error.message.includes("token") ||
        error.message.includes("session")
      ) {
        statusCode = 401;
        errorDetails = "Erreur d'authentification: " + error.message;
      }
    }

    return NextResponse.json(
      {
        error: "Erreur lors de la création de la transaction",
        details: errorDetails,
      },
      {
        status: statusCode,
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
          Pragma: "no-cache",
          Expires: "0",
        },
      }
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
