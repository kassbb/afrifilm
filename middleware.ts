import { NextResponse } from "next/server";
import { withAuth } from "next-auth/middleware";
import { getToken } from "next-auth/jwt";
import type { NextRequest } from "next/server";

export default withAuth(
  async function middleware(req: NextRequest) {
    const token = await getToken({ req, secret: process.env.JWT_SECRET });
    const isAuthenticated = !!token;

    // Routes protégées qui nécessitent une authentification
    const isAuthRoute =
      req.nextUrl.pathname.startsWith("/dashboard") ||
      req.nextUrl.pathname.startsWith("/profile") ||
      req.nextUrl.pathname.startsWith("/creator");

    // Pages d'authentification
    const isLoginPage = req.nextUrl.pathname.startsWith("/auth/login");
    const isRegisterPage = req.nextUrl.pathname.startsWith("/auth/register");

    // API endpoints de vérification d'authentification
    const isAuthVerifyEndpoint = req.nextUrl.pathname === "/api/auth/verify";
    const isAuthSessionEndpoint = req.nextUrl.pathname === "/api/auth/session";

    // Pour les pages d'authentification, rediriger vers le dashboard si l'utilisateur est déjà connecté
    if ((isLoginPage || isRegisterPage) && isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }

    // Pour les routes protégées, rediriger vers la page de connexion si l'utilisateur n'est pas connecté
    if (isAuthRoute && !isAuthenticated) {
      return NextResponse.redirect(
        new URL(
          `/auth/login?callbackUrl=${encodeURIComponent(req.url)}`,
          req.url
        )
      );
    }

    // Ajouter des en-têtes pour empêcher la mise en cache des endpoints d'authentification
    if (isAuthVerifyEndpoint || isAuthSessionEndpoint) {
      const response = NextResponse.next();
      response.headers.set(
        "Cache-Control",
        "no-store, max-age=0, must-revalidate"
      );
      response.headers.set("Pragma", "no-cache");
      response.headers.set("Expires", "0");
      return response;
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      // Autoriser l'accès à l'API d'authentification sans authentification
      authorized: ({ req, token }) => {
        if (
          req.nextUrl.pathname.startsWith("/api/auth") ||
          req.nextUrl.pathname.startsWith("/auth") ||
          (!req.nextUrl.pathname.startsWith("/dashboard") &&
            !req.nextUrl.pathname.startsWith("/profile") &&
            !req.nextUrl.pathname.startsWith("/creator"))
        ) {
          return true;
        }
        return !!token;
      },
    },
  }
);

// Configuration du middleware - définir les chemins où le middleware sera appliqué
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/profile/:path*",
    "/creator/:path*",
    "/auth/:path*",
    "/api/auth/verify",
    "/api/auth/session",
  ],
};
