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

// GET /api/admin/users/[id]
// Récupérer les détails d'un utilisateur spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer l'utilisateur avec ses transactions
    const user = await prisma.user.findUnique({
      where: {
        id,
      },
      include: {
        transactions: {
          include: {
            content: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        // Inclure les contenus si c'est un créateur
        ...(user) =>
          user?.role === "CREATOR"
            ? {
                contents: {
                  include: {
                    film: true,
                    series: true,
                  },
                },
              }
            : {},
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Filtrer les informations sensibles
    const { password, ...userData } = user;

    return NextResponse.json(userData);
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'utilisateur" },
      { status: 500 }
    );
  }
}

// PATCH /api/admin/users/[id]
// Mettre à jour un utilisateur
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    console.log(`[API] PATCH /api/admin/users/${params.id} - Début`);
    
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log(`[API] PATCH /api/admin/users/${params.id} - Erreur d'authentification:`, auth.message);
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      console.log(`[API] PATCH /api/admin/users/${params.id} - ID manquant`);
      return NextResponse.json(
        { error: "ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    // Récupérer les données de la requête
    const body = await request.json();
    const { name, email, role, isVerified, isActive } = body;
    
    console.log(`[API] PATCH /api/admin/users/${id} - Données:`, { name, email, role, isVerified, isActive });

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      console.log(`[API] PATCH /api/admin/users/${id} - Utilisateur non trouvé`);
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Construire les données de mise à jour
    const updateData: any = {};

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) {
      // Vérifier si l'email existe déjà pour un autre utilisateur
      if (email !== existingUser.email) {
        const emailExists = await prisma.user.findUnique({
          where: {
            email,
          },
        });

        if (emailExists) {
          return NextResponse.json(
            { error: "Cet email est déjà utilisé par un autre utilisateur" },
            { status: 400 }
          );
        }
      }

      updateData.email = email;
    }

    if (role !== undefined) {
      if (!["USER", "CREATOR", "ADMIN"].includes(role)) {
        return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
      }
      updateData.role = role;
    }

    // Ne mettre à jour isVerified que pour les créateurs ou si le rôle change pour/depuis CREATOR
    if (
      isVerified !== undefined &&
      (existingUser.role === "CREATOR" || updateData.role === "CREATOR")
    ) {
      updateData.isVerified = isVerified;
    }

    // Mettre à jour le statut actif/inactif (ne peut pas être appliqué aux admins)
    if (isActive !== undefined && existingUser.role !== "ADMIN") {
      updateData.isActive = isActive;
    }
    
    console.log(`[API] PATCH /api/admin/users/${id} - Données de mise à jour:`, updateData);

    // S'assurer que les champs existent dans le schéma
    try {
      // Mettre à jour l'utilisateur
      const updatedUser = await prisma.user.update({
        where: {
          id,
        },
        data: updateData,
      });

      // Filtrer les informations sensibles
      const { password, ...userData } = updatedUser;
      
      console.log(`[API] PATCH /api/admin/users/${id} - Mise à jour réussie`);

      return NextResponse.json({
        success: true,
        message: "Utilisateur mis à jour avec succès",
        user: userData,
      });
    } catch (prismaError) {
      console.error(`[API] PATCH /api/admin/users/${id} - Erreur Prisma:`, prismaError);
      
      // Si l'erreur est liée à un champ manquant
      if (prismaError instanceof Error && 
          prismaError.message.includes("Unknown field")) {
        
        // Supprimer les champs problématiques et réessayer
        const safeUpdateData = { ...updateData };
        if (prismaError.message.includes("isActive")) delete safeUpdateData.isActive;
        if (prismaError.message.includes("lastLogin")) delete safeUpdateData.lastLogin;
        
        if (Object.keys(safeUpdateData).length > 0) {
          console.log(`[API] PATCH /api/admin/users/${id} - Tentative avec données sécurisées:`, safeUpdateData);
          
          const updatedUser = await prisma.user.update({
            where: { id },
            data: safeUpdateData,
          });
          
          const { password, ...userData } = updatedUser;
          
          return NextResponse.json({
            success: true,
            message: "Utilisateur partiellement mis à jour avec succès (certains champs ignorés)",
            user: userData,
          });
        }
      }
      
      throw prismaError;
    }
  } catch (error) {
    console.error(`[API] PATCH /api/admin/users/${params.id} - Erreur:`, error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'utilisateur" },
      { status: 500 }
    );
  }
}

// DELETE /api/admin/users/[id]
// Supprimer un utilisateur
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    const { id } = params;

    if (!id) {
      return NextResponse.json(
        { error: "ID de l'utilisateur requis" },
        { status: 400 }
      );
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!existingUser) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Empêcher la suppression de son propre compte
    if (id === auth.session.user.id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      );
    }

    // Empêcher la suppression d'un autre administrateur
    if (existingUser.role === "ADMIN" && auth.session.user.id !== id) {
      return NextResponse.json(
        { error: "Vous ne pouvez pas supprimer un autre administrateur" },
        { status: 403 }
      );
    }

    // Supprimer l'utilisateur
    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
      message: "Utilisateur supprimé avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'utilisateur" },
      { status: 500 }
    );
  }
}
