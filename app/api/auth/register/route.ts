import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { z } from "zod";

const prisma = new PrismaClient();

// Schéma de validation pour l'inscription
const registerSchema = z.object({
  email: z.string().email("Format d'email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  accountType: z.enum(["USER", "CREATOR"], {
    errorMap: () => ({ message: "Type de compte invalide" }),
  }),
  // Champs optionnels
  name: z.string().optional(),
  bio: z.string().optional(),
  portfolio: z.string().url("Format d'URL invalide").nullish(),
  identityDocument: z.string().nullish(), // URL de la pièce d'identité
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("[API] POST /api/auth/register - Données reçues:", body);

    // Valider les données
    try {
      registerSchema.parse(body);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: error.errors[0].message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: "Données d'inscription invalides" },
        { status: 400 }
      );
    }

    const {
      email,
      password,
      accountType,
      name,
      bio,
      portfolio,
      identityDocument,
    } = body;

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Cet email est déjà utilisé" },
        { status: 400 }
      );
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer les données utilisateur en fonction du type de compte
    const userData: any = {
      email,
      password: hashedPassword,
      role: accountType,
      name,
      // Ajouter des champs supplémentaires si disponibles
      ...(bio && { bio }),
      ...(portfolio && { portfolio }),
      ...(identityDocument && { identityDocument }),
    };

    // Si c'est un créateur, définir isVerified à false
    if (accountType === "CREATOR") {
      userData.isVerified = false;

      // S'assurer que bio est défini pour les créateurs
      if (!bio && accountType === "CREATOR") {
        return NextResponse.json(
          { error: "Une biographie est requise pour les créateurs" },
          { status: 400 }
        );
      }

      // Pour les créateurs, une pièce d'identité est obligatoire
      if (accountType === "CREATOR" && !identityDocument) {
        return NextResponse.json(
          { error: "Une pièce d'identité est requise pour les créateurs" },
          { status: 400 }
        );
      }

      // Si une pièce d'identité est fournie, l'ajouter aux données
      if (identityDocument) {
        userData.identityDocument = identityDocument;
      }
    }

    console.log("[API] POST /api/auth/register - Création d'utilisateur:", {
      email,
      accountType,
      hasBio: !!bio,
      hasPortfolio: !!portfolio,
      hasIdentityDocument: !!identityDocument,
    });

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: userData,
    });

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: "Utilisateur créé avec succès",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[API] POST /api/auth/register - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
