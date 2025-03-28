import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

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

// GET /api/admin/dashboard
// Récupérer les statistiques du tableau de bord administrateur
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les statistiques
    const [
      usersCount,
      creatorsCount,
      contentsCount,
      pendingContentsCount,
      totalSales,
      recentTransactions,
      recentContents,
    ] = await Promise.all([
      // Nombre total d'utilisateurs
      prisma.user.count({
        where: { role: "USER" },
      }),

      // Nombre total de créateurs
      prisma.user.count({
        where: { role: "CREATOR" },
      }),

      // Nombre total de contenus
      prisma.content.count(),

      // Nombre de contenus en attente d'approbation
      prisma.content.count({
        where: { isApproved: false },
      }),

      // Chiffre d'affaires total
      prisma.transaction.aggregate({
        _sum: {
          amount: true,
        },
      }),

      // Transactions récentes
      prisma.transaction.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
          content: {
            select: {
              id: true,
              title: true,
            },
          },
        },
      }),

      // Contenus récemment ajoutés
      prisma.content.findMany({
        take: 5,
        orderBy: {
          createdAt: "desc",
        },
        include: {
          creator: {
            select: {
              id: true,
              email: true,
              name: true,
            },
          },
        },
      }),
    ]);

    // Formatage des résultats
    const stats = {
      users: {
        total: usersCount,
      },
      creators: {
        total: creatorsCount,
      },
      contents: {
        total: contentsCount,
        pending: pendingContentsCount,
      },
      sales: {
        total: totalSales._sum.amount || 0,
      },
      recentTransactions,
      recentContents,
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des statistiques" },
      { status: 500 }
    );
  }
}
