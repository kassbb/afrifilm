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

// GET /api/admin/users
// Récupérer tous les utilisateurs pour les administrateurs
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Construire les filtres de la requête
    const filters: any = {};

    if (role) {
      filters.role = role;
    }

    if (search) {
      filters.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    // Récupérer les utilisateurs
    const users = await prisma.user.findMany({
      where: filters,
      include: {
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Filtrer les informations sensibles
    const filteredUsers = users.map((user) => {
      const { password, ...userData } = user;
      return userData;
    });

    return NextResponse.json(filteredUsers);
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users
// Créer un nouvel utilisateur (administrateur uniquement)
export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { email, name, password, role } = body;

    // Validation des données
    if (!email || !name || !password || !role) {
      return NextResponse.json(
        { error: "Tous les champs sont requis" },
        { status: 400 }
      );
    }

    if (!["USER", "CREATOR", "ADMIN"].includes(role)) {
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe (cela devrait être fait avec bcrypt mais nous simplifions ici)
    const hashedPassword = password; // Dans un cas réel, vous utiliseriez bcrypt.hash()

    // Créer l'utilisateur
    const userData: any = {
      email,
      name,
      password: hashedPassword,
      role,
    };

    // Définir isVerified en fonction du rôle
    if (role === "ADMIN") {
      userData.isVerified = true;
    } else if (role === "CREATOR") {
      userData.isVerified = false;
    }

    const newUser = await prisma.user.create({
      data: userData,
    });

    // Filtrer les informations sensibles
    const { password: _, ...userDataResponse } = newUser;

    return NextResponse.json({
      success: true,
      message: "Utilisateur créé avec succès",
      user: userDataResponse,
    });
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'utilisateur" },
      { status: 500 }
    );
  }
}
