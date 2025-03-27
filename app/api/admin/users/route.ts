import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import bcrypt from "bcryptjs";

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

// GET /api/admin/users
// Récupérer tous les utilisateurs pour les administrateurs
export async function GET(request: NextRequest) {
  try {
    console.log("[API] GET /api/admin/users - Début");
    
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log("[API] GET /api/admin/users - Erreur d'authentification:", auth.message);
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    console.log("[API] GET /api/admin/users - Authentification OK");

    // Récupérer les paramètres de requête
    const { searchParams } = new URL(request.url);
    const role = searchParams.get("role");
    const search = searchParams.get("search");

    // Construire les filtres de la requête
    const filters: any = {};

    if (role) {
      filters.role = role;
    }

    if (search) {
      filters.OR = [
        { email: { contains: search } },
        { name: { contains: search } },
      ];
    }

    console.log("[API] GET /api/admin/users - Filtres:", filters);

    // Récupérer les utilisateurs
    try {
      const users = await prisma.user.findMany({
        where: filters,
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          isVerified: true,
          createdAt: true,
          lastLogin: true,
          isActive: true,
          _count: {
            select: {
              transactions: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      console.log(`[API] GET /api/admin/users - ${users.length} utilisateurs trouvés`);
      
      // Pas besoin de filtrer le mot de passe car nous utilisons select au lieu de include
      return NextResponse.json(users);
    } catch (prismaError) {
      console.error("[API] GET /api/admin/users - Erreur Prisma:", prismaError);
      
      // Si l'erreur concerne un champ manquant dans le schéma
      if (prismaError instanceof Error && 
          prismaError.message.includes("Unknown field")) {
        // Essayer une requête plus simple sans les champs qui peuvent poser problème
        console.log("[API] GET /api/admin/users - Tentative de requête alternative");
        const users = await prisma.user.findMany({
          where: filters,
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isVerified: true,
            createdAt: true,
            // Pas de lastLogin ou isActive qui pourraient manquer
            _count: {
              select: {
                transactions: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        });
        
        // Ajouter les champs manquants avec des valeurs par défaut
        const usersWithDefaults = users.map(user => ({
          ...user,
          lastLogin: null,
          isActive: true,
        }));
        
        console.log("[API] GET /api/admin/users - Requête alternative OK");
        return NextResponse.json(usersWithDefaults);
      }
      
      throw prismaError; // Relancer l'erreur si ce n'est pas lié à un champ manquant
    }
  } catch (error) {
    console.error("[API] GET /api/admin/users - Erreur:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des utilisateurs" },
      { status: 500 }
    );
  }
}

// POST /api/admin/users
// Créer un nouvel utilisateur (administrateur uniquement)
export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/admin/users - Début");
    
    // Vérifier l'authentification et les permissions
    const auth = await verifyAdminAccess();
    if (!auth.authenticated) {
      console.log("[API] POST /api/admin/users - Erreur d'authentification:", auth.message);
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les données de la requête
    let body;
    try {
      body = await request.json();
      console.log("[API] POST /api/admin/users - Données reçues:", JSON.stringify(body));
    } catch (parseError) {
      console.error("[API] POST /api/admin/users - Erreur de parsing du corps de la requête:", parseError);
      return NextResponse.json({ 
        error: "Format de requête invalide",
        details: parseError instanceof Error ? parseError.message : "Erreur inconnue"
      }, { status: 400 });
    }
    
    const { email, name, password, role, bio, portfolio, identityProvided } = body;
    
    console.log("[API] POST /api/admin/users - Données validées:", { 
      email, 
      name, 
      role, 
      passwordLength: password?.length || 0,
      bio: bio ? `${bio.substring(0, 20)}...` : undefined,
      portfolio,
      identityProvided
    });

    // Validation des données
    if (!email || !name || !password || !role) {
      const missingFields = [];
      if (!email) missingFields.push("email");
      if (!name) missingFields.push("name");
      if (!password) missingFields.push("password");
      if (!role) missingFields.push("role");
      
      console.log("[API] POST /api/admin/users - Champs manquants:", missingFields);
      return NextResponse.json(
        { 
          error: "Tous les champs sont requis", 
          missingFields 
        },
        { status: 400 }
      );
    }

    if (!["USER", "CREATOR", "ADMIN"].includes(role)) {
      console.log("[API] POST /api/admin/users - Rôle invalide:", role);
      return NextResponse.json({ error: "Rôle invalide" }, { status: 400 });
    }

    // Validation supplémentaire pour les créateurs
    if (role === "CREATOR") {
      const creatorErrors = [];
      
      if (!bio) {
        creatorErrors.push("bio");
      }
      
      if (!portfolio) {
        creatorErrors.push("portfolio");
      }
      
      if (!identityProvided) {
        creatorErrors.push("identityProvided");
      }
      
      if (creatorErrors.length > 0) {
        console.log("[API] POST /api/admin/users - Champs créateur manquants:", creatorErrors);
        return NextResponse.json(
          { 
            error: `Les champs suivants sont requis pour les créateurs: ${creatorErrors.join(", ")}`,
            missingFields: creatorErrors
          },
          { status: 400 }
        );
      }
    }

    // Vérifier si l'email existe déjà
    try {
      const existingUser = await prisma.user.findUnique({
        where: {
          email,
        },
      });

      if (existingUser) {
        console.log("[API] POST /api/admin/users - Email déjà utilisé:", email);
        return NextResponse.json(
          { error: "Cet email est déjà utilisé" },
          { status: 400 }
        );
      }
    } catch (dbError) {
      console.error("[API] POST /api/admin/users - Erreur lors de la vérification de l'email:", dbError);
      return NextResponse.json(
        { 
          error: "Erreur lors de la vérification de l'email", 
          details: dbError instanceof Error ? dbError.message : "Erreur inconnue" 
        },
        { status: 500 }
      );
    }

    // Hasher le mot de passe avec bcrypt
    let hashedPassword;
    try {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
      console.log("[API] POST /api/admin/users - Mot de passe hashé avec succès");
    } catch (hashError) {
      console.error("[API] POST /api/admin/users - Erreur de hachage du mot de passe:", hashError);
      return NextResponse.json(
        { error: "Erreur lors du traitement du mot de passe" },
        { status: 500 }
      );
    }

    // Créer l'utilisateur
    const userData: any = {
      email,
      name,
      password: hashedPassword,
      role,
      isActive: true, // Par défaut, les utilisateurs sont actifs
    };

    // Ajouter les champs spécifiques aux créateurs
    if (role === "CREATOR") {
      userData.bio = bio;
      userData.portfolio = portfolio;
      userData.identityDocument = "pending_upload"; // Placeholder en attendant le téléversement réel
      userData.isVerified = false; // Les créateurs doivent être vérifiés par un admin
    }
    // Définir isVerified en fonction du rôle
    else if (role === "ADMIN") {
      userData.isVerified = true;
    }

    console.log("[API] POST /api/admin/users - Tentative de création avec:", {
      email: userData.email,
      name: userData.name,
      role: userData.role,
      isVerified: userData.isVerified,
      hasBio: !!userData.bio,
      hasPortfolio: !!userData.portfolio,
    });
    
    try {
      const newUser = await prisma.user.create({
        data: userData,
      });

      // Filtrer les informations sensibles
      const { password: _, ...userDataResponse } = newUser;
      
      console.log("[API] POST /api/admin/users - Utilisateur créé avec succès, ID:", userDataResponse.id);

      return NextResponse.json({
        success: true,
        message: "Utilisateur créé avec succès",
        user: userDataResponse,
      });
    } catch (createError) {
      console.error("[API] POST /api/admin/users - Erreur Prisma lors de la création:", createError);
      
      // Analyse des erreurs Prisma courantes
      if (createError instanceof Error) {
        if (createError.message.includes("Unique constraint")) {
          return NextResponse.json({ 
            error: "Un utilisateur avec cet email existe déjà" 
          }, { status: 400 });
        } else if (createError.message.includes("Foreign key constraint")) {
          return NextResponse.json({ 
            error: "Erreur de référence dans la base de données" 
          }, { status: 400 });
        } else if (createError.message.includes("Unknown field")) {
          // Identifier le champ problématique
          const match = createError.message.match(/Unknown field `([^`]+)`/);
          const fieldName = match ? match[1] : "inconnu";
          
          return NextResponse.json({ 
            error: `Le champ '${fieldName}' n'existe pas dans le schéma de base de données` 
          }, { status: 400 });
        }
      }
      
      return NextResponse.json({
        error: "Erreur lors de la création de l'utilisateur dans la base de données",
        details: createError instanceof Error ? createError.message : "Erreur inconnue"
      }, { status: 500 });
    }
  } catch (error) {
    console.error("[API] POST /api/admin/users - Erreur générale:", error);
    return NextResponse.json(
      { 
        error: "Erreur lors de la création de l'utilisateur",
        details: error instanceof Error ? error.message : "Erreur inconnue"
      },
      { status: 500 }
    );
  }
}
