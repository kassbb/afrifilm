import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const dynamic = "force-dynamic";

/**
 * GET /api/public/categories
 *
 * Récupère la liste des catégories disponibles pour filtrer les contenus
 *
 * Query params:
 * - contentType: FILM | SERIE (optionnel) - permet de filtrer les catégories par type de contenu
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const contentType = searchParams.get("contentType");

    // Requête pour compter le nombre de contenus par catégorie
    const categoriesWithCount = await prisma.$queryRaw`
      SELECT 
        c.id, 
        c.name, 
        COUNT(DISTINCT cc."contentId") AS contentCount
      FROM 
        "Category" c
      LEFT JOIN 
        "ContentCategory" cc ON c.id = cc."categoryId"
      LEFT JOIN 
        "Content" cnt ON cc."contentId" = cnt.id
      WHERE 
        cnt."isApproved" = true
        ${contentType ? `AND cnt."type" = ${contentType}` : ""}
      GROUP BY 
        c.id, c.name
      ORDER BY 
        c.name ASC
    `;

    return NextResponse.json({
      categories: categoriesWithCount,
    });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories." },
      { status: 500 }
    );
  }
}
