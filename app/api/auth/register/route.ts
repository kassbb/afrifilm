import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import * as z from "zod";

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
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
    }

    const { email, password, accountType } = body;

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
    };

    // Si c'est un créateur, définir isVerified à false
    if (accountType === "CREATOR") {
      userData.isVerified = false;
    }

    // Créer l'utilisateur
    const user = await prisma.user.create({
      data: userData,
    });

    // Ne pas renvoyer le mot de passe
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message:
        accountType === "CREATOR"
          ? "Compte créé avec succès. Un administrateur va examiner votre demande."
          : "Compte créé avec succès",
      user: userWithoutPassword,
    });
  } catch (error) {
    console.error("Erreur lors de l'inscription:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du compte" },
      { status: 500 }
    );
  }
}
