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
    console.log("[API] GET /api/admin/creators - Début");

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        "[API] GET /api/admin/creators - Erreur d'authentification:",
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    console.log("[API] GET /api/admin/creators - Authentification OK");

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");

    // Construire les filtres de la requête
    const filters: any = {
      role: "CREATOR",
    };

    if (search) {
      filters.OR = [
        { email: { contains: search, mode: "insensitive" } },
        { name: { contains: search, mode: "insensitive" } },
      ];
    }

    if (status === "verified") {
      filters.isVerified = true;
    } else if (status === "unverified") {
      filters.isVerified = false;
    }

    console.log("[API] GET /api/admin/creators - Filtres:", filters);

    // Récupérer les créateurs avec leurs statistiques
    const creators = await prisma.user.findMany({
      where: filters,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        isVerified: true,
        createdAt: true,
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

    console.log(
      `[API] GET /api/admin/creators - ${creators.length} créateurs trouvés`
    );

    // Calculer les ventes totales pour chaque créateur
    const creatorsWithSales = await Promise.all(
      creators.map(async (creator: any) => {
        // Récupérer tous les contenus du créateur
        const contentIds = await prisma.content.findMany({
          where: { creatorId: creator.id },
          select: { id: true },
        });

        // Calculer les ventes totales à partir des transactions
        const totalSales = await prisma.transaction.aggregate({
          where: {
            contentId: {
              in: contentIds.map((content) => content.id),
            },
          },
          _sum: {
            amount: true,
          },
        });

        // Récupérer les champs additionnels (portfolio et identityDocument)
        const additionalFields = await prisma.user.findUnique({
          where: { id: creator.id },
          select: {
            portfolio: true,
            identityDocument: true,
          },
        });

        return {
          id: creator.id,
          email: creator.email,
          name: creator.name || "Sans nom",
          bio: creator.bio,
          portfolio: additionalFields?.portfolio || null,
          identityDocument: additionalFields?.identityDocument || null,
          isVerified: creator.isVerified,
          createdAt: creator.createdAt,
          contentCount: creator._count?.contents || 0,
          totalSales: totalSales._sum?.amount || 0,
        };
      })
    );

    console.log(
      "[API] GET /api/admin/creators - Données préparées avec succès"
    );
    return NextResponse.json(creatorsWithSales);
  } catch (error) {
    console.error("[API] GET /api/admin/creators - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des créateurs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/creators
// Inviter un nouveau créateur (administrateur uniquement)
export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/admin/creators - Début");

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        "[API] POST /api/admin/creators - Erreur d'authentification:",
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    console.log("[API] POST /api/admin/creators - Authentification OK");

    // Récupérer les données de la requête
    const body = await request.json();
    const {
      email,
      name,
      bio,
      portfolio,
      identityDocument,
      sendEmail = true,
    } = body;

    console.log("[API] POST /api/admin/creators - Données reçues:", {
      email,
      name,
      hasBio: !!bio,
      hasPortfolio: !!portfolio,
      hasIdentityDocument: !!identityDocument,
      sendEmail,
    });

    // Validation des données
    if (!email) {
      return NextResponse.json(
        { error: "L'email est requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      console.log(
        "[API] POST /api/admin/creators - Email déjà utilisé:",
        email
      );
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Créer un mot de passe temporaire sécurisé
    const temporaryPassword = Math.random().toString(36).slice(-10);

    // Préparer les données de l'utilisateur
    const userData: any = {
      email,
      name: name || email.split("@")[0],
      password: temporaryPassword, // En production, hashez ce mot de passe
      role: "CREATOR",
      isVerified: false,
    };

    // Ajouter les champs optionnels si fournis
    if (bio) userData.bio = bio;
    if (portfolio) userData.portfolio = portfolio;
    if (identityDocument) userData.identityDocument = identityDocument;

    console.log("[API] POST /api/admin/creators - Création du créateur avec:", {
      email: userData.email,
      name: userData.name,
    });

    // Créer le créateur
    const newUser = await prisma.user.create({
      data: userData,
    });

    console.log(
      "[API] POST /api/admin/creators - Créateur créé avec succès, ID:",
      newUser.id
    );

    // Dans une implémentation complète, envoyer un email avec le mot de passe temporaire
    if (sendEmail) {
      console.log(
        "[API] POST /api/admin/creators - Simulation d'envoi d'email à:",
        email
      );
      // Code d'envoi d'email ici
    }

    // Filtrer les informations sensibles
    const { password: _, ...userResponse } = newUser;

    return NextResponse.json({
      success: true,
      message: "Invitation envoyée au créateur",
      creator: userResponse,
    });
  } catch (error) {
    console.error("[API] POST /api/admin/creators - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'invitation du créateur" },
      { status: 500 }
    );
  }
}
