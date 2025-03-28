import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// GET /api/contents/[id]/access
// Vérifier si l'utilisateur a accès à un contenu
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] GET /api/contents/${params.id}/access - Début`);

    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      console.log(
        `[API] GET /api/contents/${params.id}/access - Non authentifié`
      );
      return NextResponse.json(
        { hasAccess: false, message: "Non authentifié" },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { id } = params;

    // Vérifier si le contenu existe et est approuvé
    const content = await prisma.content.findUnique({
      where: {
        id,
        isApproved: true,
      },
      select: {
        id: true,
        price: true,
      },
    });

    if (!content) {
      console.log(
        `[API] GET /api/contents/${id}/access - Contenu non trouvé ou non approuvé`
      );
      return NextResponse.json(
        { hasAccess: false, message: "Contenu non trouvé ou non approuvé" },
        { status: 404 }
      );
    }

    // Si le contenu est gratuit, l'accès est autorisé
    if (!content.price) {
      console.log(
        `[API] GET /api/contents/${id}/access - Contenu gratuit, accès autorisé`
      );
      return NextResponse.json({
        hasAccess: true,
        message: "Contenu gratuit, accès autorisé",
        needsPurchase: false,
        price: 0,
      });
    }

    // Vérifier si l'utilisateur a acheté ce contenu
    const transaction = await prisma.transaction.findFirst({
      where: {
        userId,
        contentId: id,
        isPaid: true,
      },
    });

    if (transaction) {
      console.log(
        `[API] GET /api/contents/${id}/access - Accès autorisé, contenu déjà acheté`
      );
      return NextResponse.json({
        hasAccess: true,
        message: "Accès autorisé, contenu déjà acheté",
        needsPurchase: false,
        price: content.price,
        transaction: {
          id: transaction.id,
          date: transaction.createdAt,
        },
      });
    }

    // L'utilisateur n'a pas encore acheté ce contenu
    console.log(
      `[API] GET /api/contents/${id}/access - Accès refusé, achat requis`
    );
    return NextResponse.json({
      hasAccess: false,
      message: "Vous devez acheter ce contenu pour y accéder",
      needsPurchase: true,
      price: content.price,
    });
  } catch (error) {
    console.error(
      `[API] GET /api/contents/${params.id}/access - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la vérification de l'accès" },
      { status: 500 }
    );
  }
}
