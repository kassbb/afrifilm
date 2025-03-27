import * as jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET || "your-jwt-secret-here";

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
