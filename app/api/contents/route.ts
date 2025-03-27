import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/contents
// Route publique pour récupérer les contenus approuvés
export async function GET(request: NextRequest) {
  try {
    // Récupération des paramètres de requête
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    const genre = searchParams.get("genre");

    // Construction des conditions de filtrage
    const filters: any = {
      isApproved: true, // Uniquement les contenus approuvés
    };

    if (type) {
      filters.type = type.toUpperCase();
    }

    if (genre) {
      filters.genre = genre;
    }

    // Requête à la base de données avec Prisma
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
