import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { v4 as uuidv4 } from "uuid";
import * as fs from "fs";
import * as path from "path";

// Fonction pour valider le type de fichier
function isValidFileType(file: File): boolean {
  const acceptedTypes = ["image/jpeg", "image/png", "application/pdf"];
  return acceptedTypes.includes(file.type);
}

// Fonction pour valider la taille du fichier
function isValidFileSize(file: File): boolean {
  // 5MB en octets
  const maxSizeInBytes = 5 * 1024 * 1024;
  return file.size <= maxSizeInBytes;
}

// Fonction pour créer le dossier de stockage s'il n'existe pas
function ensureDirectoryExists(directory: string) {
  if (!fs.existsSync(directory)) {
    fs.mkdirSync(directory, { recursive: true });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérifier l'authentification (optionnel pour l'inscription)
    const session = await getServerSession(authOptions);

    // Si c'est un utilisateur authentifié, assurez-vous qu'il s'agit d'un créateur ou d'un admin
    if (
      session &&
      session.user.role !== "CREATOR" &&
      session.user.role !== "ADMIN"
    ) {
      return NextResponse.json(
        {
          error:
            "Non autorisé. Seuls les créateurs et administrateurs peuvent télécharger des documents.",
        },
        { status: 403 }
      );
    }

    // Traiter le fichier
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { error: "Aucun fichier trouvé" },
        { status: 400 }
      );
    }

    // Valider le type de fichier
    if (!isValidFileType(file)) {
      return NextResponse.json(
        { error: "Type de fichier non valide. Accepté: JPG, PNG et PDF." },
        { status: 400 }
      );
    }

    // Valider la taille du fichier
    if (!isValidFileSize(file)) {
      return NextResponse.json(
        { error: "Fichier trop volumineux. Taille maximale: 5MB." },
        { status: 400 }
      );
    }

    // Créer un nom de fichier unique
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Obtenir l'extension du fichier
    const fileExtension =
      file.type === "application/pdf"
        ? ".pdf"
        : file.type === "image/png"
        ? ".png"
        : ".jpg";

    // Générer un nom de fichier unique
    const fileName = `${uuidv4()}${fileExtension}`;

    // Chemin de stockage (ajustez selon votre structure de projet)
    const uploadDir = path.join(process.cwd(), "public", "uploads", "identity");
    ensureDirectoryExists(uploadDir);

    const filePath = path.join(uploadDir, fileName);

    // Écrire le fichier
    fs.writeFileSync(filePath, buffer);

    // URL relative pour accéder au fichier
    const fileUrl = `/uploads/identity/${fileName}`;

    return NextResponse.json({
      success: true,
      url: fileUrl,
    });
  } catch (error) {
    console.error("Erreur lors du téléchargement du fichier:", error);
    return NextResponse.json(
      { error: "Erreur lors du téléchargement de la pièce d'identité" },
      { status: 500 }
    );
  }
}
