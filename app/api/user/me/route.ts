import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import * as z from "zod";

const prisma = new PrismaClient();

// Schéma de validation pour la mise à jour du profil utilisateur
const updateProfileSchema = z.object({
  name: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional(),
  image: z.string().url("URL d'image invalide").optional(),
  bio: z
    .string()
    .max(500, "La bio ne peut pas dépasser 500 caractères")
    .optional(),
});

// GET /api/user/me
// Récupérer le profil de l'utilisateur connecté
export async function GET() {
  try {
    // Vérifier l'authentification de l'utilisateur
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer les détails de l'utilisateur avec les transactions et contenus achetés
    const user = await prisma.user.findUnique({
      where: {
        id: session.user.id,
      },
      include: {
        transactions: {
          where: {
            isPaid: true,
          },
          include: {
            content: true,
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        // Si l'utilisateur est un créateur, inclure ses contenus
        ...(session.user.role === "CREATOR" && {
          contents: {
            include: {
              film: true,
              series: {
                include: {
                  seasons: {
                    include: {
                      episodes: true,
                    },
                  },
                },
              },
            },
          },
        }),
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Filtrer les informations sensibles
    const { password, ...userInfo } = user;
    return NextResponse.json(userInfo);
  } catch (error) {
    console.error("Erreur lors de la récupération du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du profil" },
      { status: 500 }
    );
  }
}

// PATCH /api/user/me
// Mettre à jour le profil de l'utilisateur connecté
export async function PATCH(request: NextRequest) {
  try {
    // Vérifier l'authentification de l'utilisateur
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    // Récupérer et valider les données de la requête
    const body = await request.json();

    try {
      const validatedData = updateProfileSchema.parse(body);

      // Vérifier si l'email existe déjà si l'utilisateur essaie de le changer
      if (validatedData.email) {
        const existingUser = await prisma.user.findUnique({
          where: {
            email: validatedData.email,
          },
        });

        if (existingUser && existingUser.id !== session.user.id) {
          return NextResponse.json(
            { error: "Cet email est déjà utilisé" },
            { status: 400 }
          );
        }
      }

      // Mettre à jour le profil de l'utilisateur
      const updatedUser = await prisma.user.update({
        where: {
          id: session.user.id,
        },
        data: validatedData,
      });

      // Filtrer les informations sensibles
      const { password, ...userInfo } = updatedUser;

      return NextResponse.json({
        success: true,
        message: "Profil mis à jour avec succès",
        user: userInfo,
      });
    } catch (validationError) {
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Erreur lors de la mise à jour du profil:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du profil" },
      { status: 500 }
    );
  }
}
