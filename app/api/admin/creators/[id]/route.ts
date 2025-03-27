import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Middleware pour vérifier si l'utilisateur est un administrateur
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authenticated: false,
      message: "Non authentifié",
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      authenticated: false,
      message: "Accès non autorisé. Réservé aux administrateurs.",
    };
  }

  return {
    authenticated: true,
    session,
  };
}

// GET /api/admin/creators/[id]
// Récupérer les détails d'un créateur spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID du créateur requis" },
        { status: 400 }
      );
    }

    // Récupérer le créateur avec ses contenus
    const creator = await prisma.user.findUnique({
      where: {
        id,
        role: "CREATOR",
      },
      include: {
        contents: {
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
          },
        },
      },
    });

    if (!creator) {
      return NextResponse.json(
        { error: "Créateur non trouvé" },
        { status: 404 }
      );
    }

    // Filtrer les informations sensibles
    const { password, ...creatorData } = creator;

    return NextResponse.json(creatorData);
  } catch (error) {
    console.error("Erreur lors de la récupération du créateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du créateur" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/creators/[id]
// Mettre à jour le statut de vérification d'un créateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID du créateur requis" },
        { status: 400 }
      );
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { isVerified } = body;

    if (isVerified === undefined) {
      return NextResponse.json(
        { error: "Le statut de vérification est requis" },
        { status: 400 }
      );
    }

    // Vérifier si le créateur existe
    const existingCreator = await prisma.user.findUnique({
      where: {
        id,
        role: "CREATOR",
      },
    });

    if (!existingCreator) {
      return NextResponse.json(
        { error: "Créateur non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le statut de vérification
    const updatedCreator = await prisma.user.update({
      where: {
        id,
      },
      data: {
        isVerified,
      },
    });

    // Filtrer les informations sensibles
    const { password, ...creatorData } = updatedCreator;

    return NextResponse.json({
      success: true,
      message: isVerified
        ? "Compte créateur vérifié avec succès"
        : "Vérification du compte créateur annulée",
      creator: creatorData,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour du créateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du créateur" },
      { status: 500 }
    );
  }
}
