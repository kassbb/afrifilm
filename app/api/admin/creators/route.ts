import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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

// GET /api/admin/creators
// Récupérer tous les créateurs pour les administrateurs
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const verified = searchParams.get("verified");

    // Construire les filtres de la requête
    const filters: any = {
      role: "CREATOR",
    };

    if (verified === "true") {
      filters.isVerified = true;
    } else if (verified === "false") {
      filters.isVerified = false;
    }

    // Récupérer les créateurs
    const creators = await prisma.user.findMany({
      where: filters,
      include: {
        contents: {
          include: {
            film: true,
            series: true,
          },
        },
        _count: {
          select: {
            contents: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filtrer les informations sensibles
    const filteredCreators = creators.map((creator) => {
      const { password, ...creatorData } = creator;
      return creatorData;
    });

    return NextResponse.json(filteredCreators);
  } catch (error) {
    console.error("Erreur lors de la récupération des créateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créateurs" },
      { status: 500 }
    );
  }
}
