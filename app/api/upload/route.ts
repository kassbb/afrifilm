import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';

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
      console.log("[API] POST /api/upload - Erreur d'authentification:", auth.message);
      return NextResponse.json({ error: auth.message }, { status: 401 });
    }

    // Récupérer les données du formulaire
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const type = formData.get('type') as string | null; // thumbnails, videos, trailers
    
    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier n'a été fourni" },
        { status: 400 }
      );
    }

    if (!type || !['thumbnails', 'videos', 'trailers'].includes(type)) {
      return NextResponse.json(
        { error: "Type de fichier invalide. Doit être 'thumbnails', 'videos' ou 'trailers'" },
        { status: 400 }
      );
    }

    // Obtenir les bytes du fichier
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Valider le type de fichier
    const allowedImageTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const allowedVideoTypes = ['video/mp4', 'video/webm', 'video/ogg'];
    
    if (type === 'thumbnails' && !allowedImageTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format d'image non pris en charge. Utilisez JPEG, PNG ou WebP" },
        { status: 400 }
      );
    }
    
    if ((type === 'videos' || type === 'trailers') && !allowedVideoTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Format vidéo non pris en charge. Utilisez MP4, WebM ou OGG" },
        { status: 400 }
      );
    }

    // Générer un nom de fichier unique
    const uniqueId = uuidv4();
    const fileExtension = file.name.split('.').pop();
    const fileName = `${uniqueId}.${fileExtension}`;

    // Créer le dossier s'il n'existe pas
    const uploadsDir = join(process.cwd(), 'public', 'uploads', type);
    await mkdir(uploadsDir, { recursive: true });

    // Chemin complet du fichier
    const filePath = join(uploadsDir, fileName);
    const dbPath = `/uploads/${type}/${fileName}`;

    // Écrire le fichier
    await writeFile(filePath, buffer);

    console.log(`[API] POST /api/upload - Fichier enregistré: ${filePath}`);

    // Retourner le chemin du fichier
    return NextResponse.json({
      message: "Fichier uploadé avec succès",
      filePath: dbPath,
    });
  } catch (error) {
    console.error("[API] POST /api/upload - Erreur:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'upload du fichier" },
      { status: 500 }
    );
  }
} 