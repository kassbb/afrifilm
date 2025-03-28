import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

export const dynamic = "force-dynamic";

// POST /api/payment/create
// Créer une nouvelle transaction pour l'achat d'un contenu
export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/payment/create - Début");
    
    // Vérifier les cookies pour le débogage
    const cookies = request.headers.get('cookie');
    console.log(`[API] POST /api/payment/create - Cookies reçus:`, cookies);

    const session = await getServerSession(authOptions);
    console.log(
      "[API] POST /api/payment/create - Session:",
      JSON.stringify({
        exists: !!session,
        userExists: !!session?.user,
        user: session?.user ? {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        } : null
      })
    );

    if (!session || !session.user) {
      console.log("[API] POST /api/payment/create - Non authentifié");
      return NextResponse.json(
        {
          error: "Non authentifié. Veuillez vous connecter à nouveau.",
          sessionInfo: {
            exists: !!session,
            userExists: !!session?.user,
            cookiesPresent: !!cookies
          },
        },
        { 
          status: 401,
          headers: {
            'Cache-Control': 'no-store, max-age=0, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );
    }

    const userId = session.user.id;
    console.log("[API] POST /api/payment/create - UserID:", userId);
    const body = await request.json();
    const { contentId } = body;

    if (!contentId) {
      console.log("[API] POST /api/payment/create - ID du contenu manquant");
      return NextResponse.json(
        { error: "ID du contenu manquant" },
        { status: 400 }
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
        { status: 404 }
      );
    }

    // Vérifier si le contenu est payant
    if (!content.price) {
      console.log(
        "[API] POST /api/payment/create - Le contenu est gratuit, aucun paiement nécessaire"
      );
      return NextResponse.json(
        { error: "Le contenu est gratuit, aucun paiement nécessaire" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur a déjà une transaction en cours pour ce contenu
    const existingTransaction = await prisma.transaction.findFirst({
      where: {
        userId,
        contentId,
        isPaid: true,
      },
    });

    if (existingTransaction) {
      console.log(
        "[API] POST /api/payment/create - L'utilisateur a déjà acheté ce contenu"
      );
      return NextResponse.json(
        {
          error: "Vous avez déjà acheté ce contenu",
          transaction: existingTransaction,
        },
        { status: 400 }
      );
    }

    // Créer une nouvelle transaction
    const transaction = await prisma.transaction.create({
      data: {
        userId,
        contentId,
        amount: content.price,
        isPaid: false, // La transaction n'est pas encore payée
        paymentMethod: "PENDING",
        referenceNumber: generateReferenceNumber(),
      } as any, // Utiliser type assertion pour éviter l'erreur TypeScript
    });

    console.log(
      `[API] POST /api/payment/create - Transaction créée avec succès, ID: ${transaction.id}`
    );
    return NextResponse.json({
      success: true,
      message: "Transaction créée avec succès",
      transaction: {
        id: transaction.id,
        amount: transaction.amount,
        contentId: transaction.contentId,
        contentTitle: content.title,
        createdAt: transaction.createdAt,
      },
    });
  } catch (error) {
    console.error("[API] POST /api/payment/create - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la transaction" },
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
