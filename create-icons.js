const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const BACKGROUND_COLOR = "#1A1A1A"; // Noir
const ICON_COLOR = "#FF6B00"; // Orange

const assetsDir = path.join(__dirname, "afrifilm-mobile", "assets");

// Créer le répertoire assets s'il n'existe pas
if (!fs.existsSync(assetsDir)) {
  fs.mkdirSync(assetsDir, { recursive: true });
}

// Créer une icône simple
async function createIcon(size, outputPath) {
  try {
    // Créer un carré avec fond noir
    const baseImage = sharp({
      create: {
        width: size,
        height: size,
        channels: 4,
        background: BACKGROUND_COLOR,
      },
    });

    // Créer un cercle orange plus petit à l'intérieur
    const circleSize = Math.floor(size * 0.7);
    const circle = Buffer.from(
      `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
        <circle cx="${size / 2}" cy="${size / 2}" r="${
        circleSize / 2
      }" fill="${ICON_COLOR}"/>
      </svg>`
    );

    // Superposer le cercle sur le fond
    await baseImage
      .composite([{ input: circle }])
      .png()
      .toFile(outputPath);

    console.log(`Icône créée avec succès : ${outputPath}`);
  } catch (error) {
    console.error(
      `Erreur lors de la création de l'icône ${outputPath}:`,
      error
    );
  }
}

// Création des icônes
async function generateIcons() {
  console.log("Génération des icônes pour Afrifilm Mobile...");

  // icon.png - icône principale de l'application
  await createIcon(1024, path.join(assetsDir, "icon.png"));

  // splash.png - écran de démarrage
  await createIcon(2048, path.join(assetsDir, "splash.png"));

  // adaptive-icon.png - icône adaptative pour Android
  await createIcon(1024, path.join(assetsDir, "adaptive-icon.png"));

  // favicon.png - icône pour le web
  await createIcon(196, path.join(assetsDir, "favicon.png"));

  console.log("Génération des icônes terminée avec succès!");
}

// Exécuter le script
generateIcons();
