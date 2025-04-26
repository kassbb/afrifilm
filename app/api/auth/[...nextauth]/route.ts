import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/app/lib/prisma";
import bcrypt from "bcryptjs";

// Étendre les types NextAuth pour inclure l'ID, le rôle et le statut de vérification
declare module "next-auth" {
  interface User {
    id: string;
    email: string;
    role: "USER" | "CREATOR" | "ADMIN";
    isVerified?: boolean;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "USER" | "CREATOR" | "ADMIN";
    isVerified?: boolean;
  }
}

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
          throw new Error("Email et mot de passe requis");
        }

        console.log("[Auth] Tentative de connexion pour:", credentials.email);

        // Rechercher l'utilisateur par email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          console.log("[Auth] Utilisateur non trouvé:", credentials.email);
          throw new Error("Email ou mot de passe incorrect");
        }

        // Vérifier le mot de passe
        const passwordMatch = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!passwordMatch) {
          console.log("[Auth] Mot de passe incorrect pour:", credentials.email);
          throw new Error("Email ou mot de passe incorrect");
        }

        // Vérifier si un compte CREATOR est vérifié
        if (user.role === "CREATOR" && user.isVerified === false) {
          console.log("[Auth] Compte créateur non vérifié:", credentials.email);
          throw new Error(
            "Votre compte créateur est en attente de vérification par un administrateur"
          );
        }

        // Mettre à jour la date de dernière connexion
        await prisma.user.update({
          where: { id: user.id },
          data: { lastLogin: new Date() },
        });

        console.log("[Auth] Connexion réussie pour:", {
          email: credentials.email,
          role: user.role,
          isVerified: user.isVerified,
        });

        return {
          id: user.id,
          email: user.email,
          role: user.role,
          isVerified: user.isVerified,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      console.log("[Auth] Callback JWT:", {
        hasUser: !!user,
        tokenRole: token.role,
        userRole: user?.role,
      });
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.isVerified = user.isVerified;
      }
      return token;
    },
    async session({ session, token }) {
      console.log("[Auth] Callback Session:", {
        hasToken: !!token,
        tokenRole: token.role,
        sessionUserRole: session.user?.role,
      });
      if (token) {
        session.user.id = token.id;
        session.user.role = token.role;
        session.user.isVerified = token.isVerified;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
  session: {
    strategy: "jwt",
    maxAge: 2 * 60 * 60, // Session durée: 2 heures (en secondes)
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
  cookies: {
    sessionToken: {
      name: `next-auth.session-token`,
      options: {
        httpOnly: true,
        sameSite: "lax" as const,
        path: "/",
        secure: process.env.NODE_ENV === "production",
        maxAge: 2 * 60 * 60, // Durée cookie: 2 heures (en secondes)
      },
    },
    callbackUrl: {
      name: `next-auth.callback-url`,
      options: {
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
    csrfToken: {
      name: "next-auth.csrf-token",
      options: {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env.NODE_ENV === "production",
      },
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
