import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

// Middleware sans utiliser withAuth pour éviter les conflits
export async function middleware(req: NextRequest) {
  try {
    // Vérification manuelle du token avec options élargies
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: "next-auth.session-token",
      secureCookie: false, // Important pour le développement local
    });

    // Log détaillé
    console.log("[Middleware] Vérification token:", {
      exists: !!token,
      role: token?.role,
      path: req.nextUrl.pathname,
      cookies: req.cookies.getAll().map((c) => c.name),
    });

    const isAuthenticated = !!token;

    // Routes protégées qui nécessitent une authentification
    const isAuthRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/profile") ||
      req.nextUrl.pathname.startsWith("/creator");

    // Pages d'authentification
    const isLoginPage = req.nextUrl.pathname.startsWith("/auth/login");
    const isRegisterPage = req.nextUrl.pathname.startsWith("/auth/register");

    // Pour les pages d'authentification, rediriger si déjà connecté
    if ((isLoginPage || isRegisterPage) && isAuthenticated) {
      console.log("[Middleware] Utilisateur déjà connecté, redirection:", {
        role: token?.role,
      });

      // Rediriger vers le dashboard approprié selon le rôle
      if (token?.role === "CREATOR") {
        return NextResponse.redirect(new URL("/creator/dashboard", req.url));
      } else if (token?.role === "ADMIN") {
        return NextResponse.redirect(new URL("/admin/dashboard", req.url));
      } else {
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    // Pour les routes protégées, rediriger vers la page de connexion si non connecté
    if (isAuthRoute && !isAuthenticated) {
      console.log(
        "[Middleware] Utilisateur non connecté, redirection vers login"
      );
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(req.url)}`,
          req.url
        )
      );
    }

    // Vérification des accès selon le rôle
    const isCreatorRoute = req.nextUrl.pathname.startsWith("/creator");
    const isAdminRoute = req.nextUrl.pathname.startsWith("/admin");

    if (isAuthenticated) {
      if (isCreatorRoute && token?.role !== "CREATOR") {
        console.log("[Middleware] Accès refusé - route créateur");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }

      if (isAdminRoute && token?.role !== "ADMIN") {
        console.log("[Middleware] Accès refusé - route admin");
        return NextResponse.redirect(new URL("/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware] Erreur:", error);
    return NextResponse.next();
  }
}

// Configuration du middleware
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/creator/:path*",
    "/admin/:path*",
    "/auth/:path*",
  ],
};
