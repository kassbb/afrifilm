import { NextRequest, NextResponse } from "next/server";
import * as bcrypt from "bcrypt";
import * as jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-here";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Validation de base
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email et mot de passe requis" },
        { status: 400 }
      );
    }

    // Rechercher l'utilisateur
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Vérifier le mot de passe
    const passwordIsValid = await bcrypt.compare(password, user.password);

    if (!passwordIsValid) {
      return NextResponse.json(
        { error: "Identifiants invalides" },
        { status: 401 }
      );
    }

    // Pour les créateurs, vérifier s'ils sont vérifiés
    if (user.role === "CREATOR" && !user.isVerified) {
      return NextResponse.json(
        { error: "Compte créateur en attente de vérification" },
        { status: 403 }
      );
    }

    // Générer le token JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Ne pas renvoyer le mot de passe dans la réponse
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json({
      message: "Connexion réussie",
      user: userWithoutPassword,
      token,
    });
  } catch (error) {
    console.error("Erreur de connexion:", error);
    return NextResponse.json(
      { error: "Erreur lors de la connexion" },
      { status: 500 }
    );
  }
}
