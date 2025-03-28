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

// GET /api/admin/seasons/[id]/episodes
// Récupérer tous les épisodes d'une saison
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] GET /api/admin/seasons/${params.id}/episodes - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] GET /api/admin/seasons/${params.id}/episodes - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    // Vérifier si la saison existe
    const season = await prisma.season.findUnique({
      where: { id },
      include: {
        serie: {
          include: {
            content: true,
          },
        },
      },
    });

    if (!season) {
      console.log(
        `[API] GET /api/admin/seasons/${id}/episodes - Saison non trouvée`
      );
      return NextResponse.json(
        { error: "Saison non trouvée" },
        { status: 404 }
      );
    }

    // Récupérer tous les épisodes de la saison
    const episodes = await prisma.episode.findMany({
      where: { seasonId: id },
      orderBy: [{ number: "asc" }, { title: "asc" }],
    });

    console.log(
      `[API] GET /api/admin/seasons/${id}/episodes - ${episodes.length} épisodes trouvés`
    );
    return NextResponse.json({
      season,
      episodes,
    });
  } catch (error) {
    console.error(
      `[API] GET /api/admin/seasons/${params.id}/episodes - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la récupération des épisodes" },
      { status: 500 }
    );
  }
}

// POST /api/admin/seasons/[id]/episodes
// Ajouter un épisode à une saison
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] POST /api/admin/seasons/${params.id}/episodes - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] POST /api/admin/seasons/${params.id}/episodes - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;
    const body = await request.json();
    console.log(
      `[API] POST /api/admin/seasons/${id}/episodes - Données reçues:`,
      body
    );

    // Vérifier si la saison existe
    const season = await prisma.season.findUnique({
      where: { id },
      include: {
        episodes: true,
      },
    });

    if (!season) {
      console.log(
        `[API] POST /api/admin/seasons/${id}/episodes - Saison non trouvée`
      );
      return NextResponse.json(
        { error: "Saison non trouvée" },
        { status: 404 }
      );
    }

    // Valider les données requises
    const { title, duration, videoPath, number, description, thumbnail } = body;

    if (!title || !duration || !videoPath) {
      return NextResponse.json(
        { error: "Le titre, la durée et le chemin vidéo sont obligatoires" },
        { status: 400 }
      );
    }

    // Vérifier si le numéro d'épisode est déjà utilisé
    if (number && season.episodes.some((e) => e.number === number)) {
      return NextResponse.json(
        {
          error: `Un épisode avec le numéro ${number} existe déjà dans cette saison`,
        },
        { status: 400 }
      );
    }

    // Créer l'épisode
    const newEpisode = await prisma.episode.create({
      data: {
        seasonId: id,
        title,
        duration: parseInt(duration.toString()),
        videoPath,
        number: number ? parseInt(number.toString()) : null,
        thumbnail,
        description,
      },
    });

    console.log(
      `[API] POST /api/admin/seasons/${id}/episodes - Épisode créé avec succès. ID: ${newEpisode.id}`
    );

    // Mettre à jour le statut de vérification pour la série associée
    // Cela permet de s'assurer que la série est maintenant valide avec au moins un épisode
    const serieId = season.serieId;

    // Récupérer l'ID du contenu lié à la série
    const serie = await prisma.serie.findUnique({
      where: { id: serieId },
      select: { contentId: true },
    });

    if (serie) {
      await prisma.content.update({
        where: { id: serie.contentId },
        data: { isApproved: true },
      });

      console.log(
        `[API] POST /api/admin/seasons/${id}/episodes - Série mise à jour pour approbation`
      );
    }

    return NextResponse.json({
      message: "Épisode créé avec succès",
      episode: newEpisode,
    });
  } catch (error) {
    console.error(
      `[API] POST /api/admin/seasons/${params.id}/episodes - Erreur:`,
      error
    );
    return NextResponse.json(
      { error: "Erreur lors de la création de l'épisode" },
      { status: 500 }
    );
  }
}
