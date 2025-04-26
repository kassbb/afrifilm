import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { v4 as uuidv4 } from "uuid";

// Vérifier si l'utilisateur est authentifié (admin ou créateur)
async function verifyAccess() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return {
      authenticated: false,
      message: "Non authentifié",
    };
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "CREATOR") {
    return {
      authenticated: false,
      message: "Accès non autorisé. Réservé aux administrateurs et créateurs.",
    };
  }

  return {
    authenticated: true,
    session,
  };
}

export async function POST(request: NextRequest) {
  try {
    console.log("[API] POST /api/upload - Début");

    // Vérifier l'authentification
    const auth = await verifyAccess();
    if (!auth.authenticated) {
      console.log(
        "[API] POST /api/upload - Erreur d'authentification:",
        auth.message
      );
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const type = (formData.get("type") as string | null) || "thumbnails"; // valeur par défaut: thumbnails

    console.log(
      "[API] POST /api/upload - Type:",
      type,
      "Fichier reçu:",
      file?.name,
      "Taille:",
      file?.size
    );

    if (!file) {
      console.log("[API] POST /api/upload - Erreur: Aucun fichier fourni");
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 }
      );
    }

    // Vérifier le type
    if (!["thumbnails", "videos", "trailers", "identity"].includes(type)) {
      console.log(
        "[API] POST /api/upload - Erreur: Type de fichier invalide:",
        type
      );
      return NextResponse.json(
        {
          error: `Type de fichier invalide. Doit être 'thumbnails', 'videos', 'trailers' ou 'identity'. Reçu: ${type}`,
        },
        { status: 400 }
      );
    }

    // Obtenir les bytes du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Valider le type de fichier
    const allowedImageTypes = [
      "image/jpeg",
      "image/png",
      "image/jpg",
      "image/webp",
    ];
    const allowedVideoTypes = ["video/mp4", "video/webm", "video/ogg"];

    console.log("[API] POST /api/upload - Type MIME:", file.type);

    if (
      (type === "thumbnails" || type === "identity") &&
      !allowedImageTypes.includes(file.type)
    ) {
      console.log(
        "[API] POST /api/upload - Erreur: Format d'image non pris en charge:",
        file.type
      );
      return NextResponse.json(
        {
          error: `Format d'image non pris en charge. Utilisez JPEG, PNG ou WebP. Type reçu: ${file.type}`,
        },
        { status: 400 }
      );
    }

    if (
      (type === "videos" || type === "trailers") &&
      !allowedVideoTypes.includes(file.type)
    ) {
      console.log(
        "[API] POST /api/upload - Erreur: Format vidéo non pris en charge:",
        file.type
      );
      return NextResponse.json(
        {
          error: `Format vidéo non pris en charge. Utilisez MP4, WebM ou OGG. Type reçu: ${file.type}`,
        },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const uniqueId = uuidv4();
    const fileExtension = file.name.split(".").pop();
    const fileName = `${uniqueId}.${fileExtension}`;

    // Créer le dossier s'il n'existe pas
    const uploadsDir = join(process.cwd(), "public", "uploads", type);
    console.log("[API] POST /api/upload - Répertoire cible:", uploadsDir);

    try {
      await mkdir(uploadsDir, { recursive: true });
      console.log(
        "[API] POST /api/upload - Répertoire vérifié/créé avec succès"
      );
    } catch (mkdirError) {
      console.error(
        "[API] POST /api/upload - Erreur lors de la création du répertoire:",
        mkdirError
      );
      return NextResponse.json(
        { error: "Impossible de créer le répertoire de destination" },
        { status: 500 }
      );
    }

    // Chemin complet du fichier
    const filePath = join(uploadsDir, fileName);
    const dbPath = `/uploads/${type}/${fileName}`;
    console.log(
      "[API] POST /api/upload - Tentative d'écriture dans:",
      filePath
    );

    // Écrire le fichier
    try {
      await writeFile(filePath, buffer);
      console.log(
        `[API] POST /api/upload - Fichier enregistré avec succès: ${filePath}`
      );
    } catch (writeError: any) {
      console.error(
        "[API] POST /api/upload - Erreur lors de l'écriture du fichier:",
        writeError.code,
        writeError.message
      );
      return NextResponse.json(
        {
          error: `Erreur lors de l'écriture du fichier: ${writeError.message}`,
        },
        { status: 500 }
      );
    }

    // Retourner le chemin du fichier
    console.log(
      "[API] POST /api/upload - Terminé avec succès, chemin:",
      dbPath
    );
    return NextResponse.json({
      message: "Fichier uploadé avec succès",
      filePath: dbPath,
    });
  } catch (error: any) {
    console.error(
      "[API] POST /api/upload - Erreur générale:",
      error.message,
      error.stack
    );
    return NextResponse.json(
      {
        error: `Une erreur est survenue lors de l'upload du fichier: ${error.message}`,
      },
      { status: 500 }
    );
  }
}
