import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../../auth/[...nextauth]/route";

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

// GET /api/admin/series/[id]/seasons
// Récupérer toutes les saisons d'une série
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] GET /api/admin/series/${params.id}/seasons - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] GET /api/admin/series/${params.id}/seasons - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    // Vérifier si la série existe
    const serie = await prisma.serie.findUnique({
      where: { id },
    });

    if (!serie) {
      console.log(
        `[API] GET /api/admin/series/${id}/seasons - Série non trouvée`
      );
      return NextResponse.json({ error: "Série non trouvée" }, { status: 404 });
    }

    // Récupérer toutes les saisons de la série avec leurs épisodes
    const seasons = await prisma.season.findMany({
      where: { serieId: id },
      include: {
        episodes: true,
      },
      orderBy: {
        number: "asc",
      },
    });

    console.log(
      `[API] GET /api/admin/series/${id}/seasons - ${seasons.length} saisons trouvées`
    );
    return NextResponse.json({ seasons });
  } catch (error) {
    console.error(
      `[API] GET /api/admin/series/${params.id}/seasons - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des saisons" },
      { status: 500 }
    );
  }
}

// POST /api/admin/series/[id]/seasons
// Ajouter une saison à une série
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] POST /api/admin/series/${params.id}/seasons - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] POST /api/admin/series/${params.id}/seasons - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    console.log(
      `[API] POST /api/admin/series/${id}/seasons - Données reçues:`,
      body
    );

    // Vérifier si la série existe
    const serie = await prisma.serie.findUnique({
      where: { id },
      include: {
        seasons: true,
      },
    });

    if (!serie) {
      console.log(
        `[API] POST /api/admin/series/${id}/seasons - Série non trouvée`
      );
      return NextResponse.json({ error: "Série non trouvée" }, { status: 404 });
    }

    // Valider les données requises
    const { number, title } = body;

    if (!number || number < 1) {
      return NextResponse.json(
        { error: "Le numéro de saison est obligatoire et doit être positif" },
        { status: 400 }
      );
    }

    // Vérifier si une saison avec ce numéro existe déjà
    const existingSeason = serie.seasons.find((s) => s.number === number);
    if (existingSeason) {
      return NextResponse.json(
        { error: `Une saison avec le numéro ${number} existe déjà` },
        { status: 400 }
      );
    }

    // Créer la saison
    const newSeason = await prisma.season.create({
      data: {
        serieId: id,
        number: number,
        title: title || `Saison ${number}`,
      },
    });

    console.log(
      `[API] POST /api/admin/series/${id}/seasons - Saison créée avec succès. ID: ${newSeason.id}`
    );
    return NextResponse.json({
      message: "Saison créée avec succès",
      season: newSeason,
    });
  } catch (error) {
    console.error(
      `[API] POST /api/admin/series/${params.id}/seasons - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la création de la saison" },
      { status: 500 }
    );
  }
}
