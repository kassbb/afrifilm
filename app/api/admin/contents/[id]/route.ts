import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../../auth/[...nextauth]/route";

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

// GET /api/admin/contents/[id]
// Récupérer un contenu spécifique (pour les administrateurs)
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification admin
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID du contenu manquant" },
        { status: 400 }
      );
    }

    const content = await prisma.content.findUnique({
      where: { id },
      include: {
        film: true,
        serie: {
          include: {
            seasons: {
              include: {
                episodes: true,
              },
              orderBy: {
                number: "asc",
              },
            },
          },
        },
        creator: {
          select: {
            id: true,
            email: true,
            role: true,
            isVerified: true,
          },
        },
        transactions: {
          select: {
            id: true,
            isPaid: true,
            amount: true,
            createdAt: true,
          },
        },
      },
    });

    if (!content) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json(content);
  } catch (error) {
    console.error("Erreur lors de la récupération du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du contenu" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/contents/[id]
// Mettre à jour un contenu spécifique (pour les administrateurs)
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification admin
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = params.id;
    const body = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: "ID du contenu manquant" },
        { status: 400 }
      );
    }

    // Vérifier si le contenu existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le contenu
    const updatedContent = await prisma.content.update({
      where: { id },
      data: {
        title: body.title !== undefined ? body.title : undefined,
        description:
          body.description !== undefined ? body.description : undefined,
        price: body.price !== undefined ? body.price : undefined,
        thumbnail: body.thumbnail !== undefined ? body.thumbnail : undefined,
        isApproved: body.isApproved !== undefined ? body.isApproved : undefined,
        rejectionReason:
          body.rejectionReason !== undefined ? body.rejectionReason : undefined,
      },
      include: {
        film: true,
        serie: true,
      },
    });

    return NextResponse.json(updatedContent);
  } catch (error) {
    console.error("Erreur lors de la mise à jour du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du contenu" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/contents/[id]
// Supprimer un contenu spécifique (pour les administrateurs)
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Vérifier l'authentification admin
  const auth = await verifyAdminAccess();
  if (!auth.success) {
    return NextResponse.json({ error: auth.error }, { status: auth.status });
  }

  try {
    const id = params.id;

    if (!id) {
      return NextResponse.json(
        { error: "ID du contenu manquant" },
        { status: 400 }
      );
    }

    // Vérifier si le contenu existe
    const existingContent = await prisma.content.findUnique({
      where: { id },
      include: {
        film: true,
        serie: {
          include: {
            seasons: {
              include: {
                episodes: true,
              },
            },
          },
        },
      },
    });

    if (!existingContent) {
      return NextResponse.json(
        { error: "Contenu non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le contenu et ses relations (cascade delete configuré dans le schéma Prisma)
    await prisma.content.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Contenu supprimé avec succès" });
  } catch (error) {
    console.error("Erreur lors de la suppression du contenu:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du contenu" },
      { status: 500 }
    );
  }
}
