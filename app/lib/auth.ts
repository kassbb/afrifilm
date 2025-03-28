import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";

const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-here";

// Configuration pour NextAuth
export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Mot de passe", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: { email: credentials.email },
          });

          if (!user) {
            console.log(`[Auth] Utilisateur non trouvé: ${credentials.email}`);
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );

          if (!isPasswordValid) {
            console.log(
              `[Auth] Mot de passe invalide pour: ${credentials.email}`
            );
            return null;
          }

          // Mettre à jour la date de dernière connexion
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLogin: new Date() },
          });

          console.log(`[Auth] Connexion réussie pour: ${credentials.email}`);
          return {
            id: user.id,
            email: user.email,
            name: user.name || user.email,
            role: user.role,
            image: user.avatar,
          };
        } catch (error) {
          console.error("[Auth] Erreur d'authentification:", error);
          return null;
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as "USER" | "CREATOR" | "ADMIN";
        session.user.email = token.email as string;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
    maxAge: 24 * 60 * 60, // 24 heures en secondes
  },
  jwt: {
    secret: JWT_SECRET,
    maxAge: 24 * 60 * 60, // 24 heures en secondes
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  debug: process.env.NODE_ENV === "development",
  secret: JWT_SECRET,
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export async function verifyToken(request: NextRequest) {
  try {
    // Récupérer le token du header Authorization
    const authorization = request.headers.get("Authorization");

    if (!authorization || !authorization.startsWith("Bearer ")) {
      return null;
    }

    const token = authorization.substring(7);

    // Vérifier et décoder le token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    // Vérifier si l'utilisateur existe toujours
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user) {
      return null;
    }

    return decoded;
  } catch (error) {
    console.error("Erreur de vérification du token:", error);
    return null;
  }
}

export function withAuth(
  handler: (
    req: NextRequest,
    tokenPayload: JwtPayload,
    ...args: any[]
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...rest: any[]) => {
    const tokenPayload = await verifyToken(request);

    if (!tokenPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    return handler(request, tokenPayload, ...rest);
  };
}

export function withRoleAuth(
  roles: string[],
  handler: (
    req: NextRequest,
    tokenPayload: JwtPayload,
    ...args: any[]
  ) => Promise<NextResponse>
) {
  return async (request: NextRequest, ...rest: any[]) => {
    const tokenPayload = await verifyToken(request);

    if (!tokenPayload) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!roles.includes(tokenPayload.role)) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    return handler(request, tokenPayload, ...rest);
  };
}
