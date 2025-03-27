import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

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

// GET /api/admin/creators/[id]
// Récupérer les détails d'un créateur spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] GET /api/admin/creators/${params.id} - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] GET /api/admin/creators/${params.id} - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    console.log(
      `[API] GET /api/admin/creators/${params.id} - Authentification OK`
    );

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Récupérer les détails de base du créateur
    const creator = await prisma.user.findUnique({
      where: { id, role: "CREATOR" },
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        isVerified: true,
        createdAt: true,
      },
    });

    if (!creator) {
      console.log(
        `[API] GET /api/admin/creators/${params.id} - Créateur non trouvé`
      );
      return NextResponse.json(
        { error: "Créateur non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer les champs additionnels portfolio et identityDocument
    const additionalFields = await prisma.user.findUnique({
      where: { id },
      select: {
        portfolio: true,
        identityDocument: true,
      },
    });

    // Récupérer les contenus du créateur
    const contents = await prisma.content.findMany({
      where: { creatorId: id },
      select: { id: true },
    });

    console.log(`[API] GET /api/admin/creators/${params.id} - Créateur trouvé`);

    // Calculer les ventes totales
    const totalSales = await prisma.transaction.aggregate({
      where: {
        contentId: {
          in: contents.map((content) => content.id),
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Renvoyer les données du créateur avec les statistiques
    const creatorWithStats = {
      ...creator,
      portfolio: additionalFields?.portfolio || null,
      identityDocument: additionalFields?.identityDocument || null,
      contentCount: contents.length,
      totalSales: totalSales._sum?.amount || 0,
    };

    return NextResponse.json(creatorWithStats);
  } catch (error) {
    console.error(`[API] GET /api/admin/creators/[id] - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du créateur" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/creators/[id]
// Mettre à jour un créateur (vérification, etc.)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] PATCH /api/admin/creators/${params.id} - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] PATCH /api/admin/creators/${params.id} - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    console.log(
      `[API] PATCH /api/admin/creators/${params.id} - Authentification OK`
    );

    const { id } = params;
    const body = await request.json();

    console.log(
      `[API] PATCH /api/admin/creators/${params.id} - Données reçues:`,
      body
    );

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Vérifier si le créateur existe
    const existingCreator = await prisma.user.findUnique({
      where: { id, role: "CREATOR" },
    });

    if (!existingCreator) {
      console.log(
        `[API] PATCH /api/admin/creators/${params.id} - Créateur non trouvé`
      );
      return NextResponse.json(
        { error: "Créateur non trouvé" },
        { status: 404 }
      );
    }

    // Préparer les données à mettre à jour
    const updateData: any = {};

    // Mise à jour du statut de vérification
    if (body.isVerified !== undefined) {
      updateData.isVerified = body.isVerified;
    }

    // Autres champs à mettre à jour (si nécessaire)
    if (body.name) updateData.name = body.name;
    if (body.bio) updateData.bio = body.bio;
    if (body.portfolio !== undefined) updateData.portfolio = body.portfolio;
    if (body.identityDocument !== undefined)
      updateData.identityDocument = body.identityDocument;

    // Mettre à jour le créateur
    console.log(
      `[API] PATCH /api/admin/creators/${params.id} - Mise à jour avec:`,
      updateData
    );

    const updatedCreator = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        bio: true,
        isVerified: true,
        createdAt: true,
      },
    });

    // Récupérer les champs additionnels qui ne sont pas inclus dans le select
    const additionalFields = await prisma.user.findUnique({
      where: { id },
      select: {
        portfolio: true,
        identityDocument: true,
      },
    });

    console.log(
      `[API] PATCH /api/admin/creators/${params.id} - Mise à jour réussie`
    );

    return NextResponse.json({
      message: "Créateur mis à jour avec succès",
      creator: {
        ...updatedCreator,
        portfolio: additionalFields?.portfolio || null,
        identityDocument: additionalFields?.identityDocument || null,
      },
    });
  } catch (error) {
    console.error(`[API] PATCH /api/admin/creators/[id] - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du créateur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/creators/[id]
// Supprimer un créateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] DELETE /api/admin/creators/${params.id} - Début`);

    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(
        `[API] DELETE /api/admin/creators/${params.id} - Erreur d'authentification:`,
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    console.log(
      `[API] DELETE /api/admin/creators/${params.id} - Authentification OK`
    );

    const { id } = params;

    if (!id) {
      return NextResponse.json({ error: "ID manquant" }, { status: 400 });
    }

    // Vérifier si le créateur existe
    const existingCreator = await prisma.user.findUnique({
      where: { id, role: "CREATOR" },
    });

    if (!existingCreator) {
      console.log(
        `[API] DELETE /api/admin/creators/${params.id} - Créateur non trouvé`
      );
      return NextResponse.json(
        { error: "Créateur non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le créateur
    await prisma.user.delete({
      where: { id },
    });

    console.log(
      `[API] DELETE /api/admin/creators/${params.id} - Suppression réussie`
    );

    return NextResponse.json({
      message: "Créateur supprimé avec succès",
    });
  } catch (error) {
    console.error(`[API] DELETE /api/admin/creators/[id] - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du créateur" },
      { status: 500 }
    );
  }
}
