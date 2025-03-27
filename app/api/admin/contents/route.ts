import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

const prisma = new PrismaClient();

// Middleware d'authentification admin
async function verifyAdminAccess() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      success: false,
      error: "Non authentifié",
      status: 401,
    };
  }

  if (session.user.role !== "ADMIN") {
    return {
      success: false,
      error: "Accès non autorisé",
      status: 403,
    };
  }

  return { success: true };
}

// GET /api/admin/contents
// Récupérer tous les contenus (pour les administrateurs)
export async function GET(request: NextRequest) {
  // Vérifier l'authentification admin
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const isApproved = searchParams.get("approved");

    // Construction des conditions de filtrage
    const filters: any = {};

    if (type) {
      filters.type = type.toUpperCase();
    }

    if (isApproved !== null) {
      filters.isApproved = isApproved === "true";
    }

    // Récupérer tous les contenus
    const contents = await prisma.content.findMany({
      where: filters,
      include: {
        film: true,
        serie: true,
        creator: {
          select: {
            id: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(contents);
  } catch (error) {
    console.error("Erreur lors de la récupération des contenus:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contenus" },
      { status: 500 }
    );
  }
}

// POST /api/admin/contents
// Créer un nouveau contenu (pour les administrateurs)
export async function POST(request: NextRequest) {
  // Vérifier l'authentification admin
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const body = await request.json();

    // Validation des données
    if (!body.title || !body.type) {
      return NextResponse.json(
        { error: "Titre et type de contenu requis" },
        { status: 400 }
      );
    }

    // Création du contenu
    const newContent = await prisma.content.create({
      data: {
        title: body.title,
        description: body.description || "",
        type: body.type,
        price: body.price || null,
        thumbnail: body.thumbnail || "",
        isApproved: body.isApproved || false,
        creatorId: body.creatorId,
        // Si c'est un film
        film:
          body.type === "FILM" && body.film
            ? {
                create: {
                  duration: body.film.duration || 0,
                  videoPath: body.film.videoPath || "",
                },
              }
            : undefined,
        // Si c'est une série
        serie:
          body.type === "SERIE"
            ? {
                create: {},
              }
            : undefined,
      },
      include: {
        film: true,
        serie: true,
      },
    });

    return NextResponse.json(newContent, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du contenu" },
      { status: 500 }
    );
  }
}
