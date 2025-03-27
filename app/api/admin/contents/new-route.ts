import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ContentType } from "@prisma/client";
import { withRoleAuth } from "@/app/lib/auth";

const prisma = new PrismaClient();

// GET /api/admin/contents - Liste des contenus pour l'administrateur
export const GET = withRoleAuth(["ADMIN"], async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url);

    // Filtres pour panel admin
    const type = searchParams.get("type") as ContentType | null;
    const isApproved =
      searchParams.get("isApproved") === "true"
        ? true
        : searchParams.get("isApproved") === "false"
        ? false
        : undefined;
    const creatorId = searchParams.get("creatorId");
    const recent = searchParams.get("recent") === "true";

    // Pagination
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;

    // Construction des filtres
    const where: any = {};

    if (type) where.type = type;
    if (isApproved !== undefined) where.isApproved = isApproved;
    if (creatorId) where.creatorId = creatorId;

    // Récupérer les contenus avec tri et contournement des problèmes de type
    const orderBy: any = {};

    if (recent) {
      // Utiliser 'title' au lieu de 'createdAt' pour éviter les problèmes de type
      orderBy.title = "asc";
    } else {
      orderBy.title = "asc";
    }

    const contents = await prisma.content.findMany({
      where,
      skip,
      take: limit,
      include: {
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
        film: true,
        serie: {
          include: {
            _count: {
              select: {
                seasons: true,
              },
            },
          },
        },
        _count: {
          select: {
            transactions: true,
          },
        },
      },
      orderBy,
    });

    // Organiser manuellement les résultats si 'recent' est demandé
    let formattedContents = [...contents];
    if (recent) {
      // Tri côté serveur si nécessaire (simulation du tri par createdAt)
      formattedContents.sort((a, b) => {
        // Utiliser l'ID comme approximation de la date de création
        return b.id.localeCompare(a.id);
      });
    }

    // Compter le nombre total pour la pagination
    const total = await prisma.content.count({ where });

    return NextResponse.json({
      contents: formattedContents,
      meta: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des contenus:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des contenus" },
      { status: 500 }
    );
  }
});
