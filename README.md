Prompt Complet pour le Développement de l'Application de Streaming "AfroStream"
🎯 Contexte
Je souhaite développer une application de streaming premium (films & séries) pour le Mali et l'Afrique, avec :

Deux types d’utilisateurs : Viewers (normaux) et Créateurs (upload + monétisation).

Deux types de contenus : Films (achat à l’unité) et Séries (par saison/épisode).

Design haut de gamme : Inspiré de Netflix mais avec une identité africaine (couleurs, motifs, UX locale).

Phase 1 : MVP avec paiement simulé (Orange Money intégré plus tard).

🚀 Spécifications Techniques
📌 Stack Technique
Fonctionnalité	Technologie	Détails
Frontend	Next.js 14 (App Router) + TypeScript	SSR optimisé
UI/UX	ChakraUI + Framer Motion	Animations fluides
Backend	Next.js API Routes → NestJS plus tard
Base de Données	PostgreSQL + Prisma ORM	Schéma relationnel
Stockage Vidéo	Fichiers locaux (dev) → Cloudflare Stream (prod)
Authentification	NextAuth.js + JWT	Rôles (USER, CREATOR, ADMIN)
Paiements (simulés)	Mock API → Orange Money (Phase 2)
🎨 Design Guidelines
1. Identité Visuelle
Couleurs :

Noir (#0F0F0F) : Fond principal.

Or (#FFD700) : Accents (boutons, icônes).

Rouge brique (#A23829) : CTA (acheter, abonnements).

Typographie :

Titres : "Poppins Bold" (moderne).

Texte : "Open Sans" (lisible).

Motifs Africains :

Bogolan (Mali) en fonds de section.

Icônes custom (masques, tambours).

2. Micro-Interactions
Hover Effects :

Cartes : Zoom (scale: 1.05) + ombre portée.

Boutons : Changement de couleur (or → rouge).

Chargements :

Squelettes animés + motifs Kente.

Notifications :

Vibration style "tam-tam" pour nouveaux contenus.

📂 Schéma de Base de Données (Prisma)
prisma
Copy
model User {  
  id          String    @id @default(uuid())  
  email       String    @unique  
  password    String    // Bcrypt  
  role        Role      @default(USER) // USER, CREATOR, ADMIN  
  isVerified  Boolean   @default(false) // Créateurs validés  
  createdAt   DateTime  @default(now())  
  contents    Content[]  
}  

model Content {  
  id          String    @id @default(uuid())  
  title       String  
  type        ContentType // FILM ou SERIE  
  price       Float?     // Null = gratuit  
  thumbnail   String     // URL de l'affiche  
  description String  
  creator     User      @relation(fields: [creatorId], references: [id])  
  creatorId   String  
  isApproved  Boolean   @default(false) // Validation admin  
  film        Film?     // Relation optionnelle  
  serie       Serie?    // Relation optionnelle  
}  

model Film {  
  id        String    @id @default(uuid())  
  duration  Int       // Minutes  
  videoPath String    // Chemin local (ex: /films/[id].mp4)  
  content   Content   @relation(fields: [contentId], references: [id])  
  contentId String    @unique  
}  

model Serie {  
  id        String    @id @default(uuid())  
  seasons   Season[]  
  content   Content   @relation(fields: [contentId], references: [id])  
  contentId String    @unique  
}  

model Season {  
  id       String    @id @default(uuid())  
  number   Int  
  episodes Episode[]  
  serie    Serie     @relation(fields: [serieId], references: [id])  
  serieId  String  
}  

model Episode {  
  id       String    @id @default(uuid())  
  title    String  
  duration Int  
  videoPath String  
  season   Season    @relation(fields: [seasonId], references: [id])  
  seasonId String  
}  

model Transaction {  
  id        String    @id @default(uuid())  
  userId    String  
  contentId String  
  amount    Float  
  isPaid    Boolean   @default(true) // Simulation  
  createdAt DateTime  @default(now())  
}  
📋 Fonctionnalités Clés
1. Pour les Utilisateurs (Viewers)
Inscription/Connexion simple (email + mot de passe).

Catalogue :

Filtres par type (film/série), genre, prix.

Section "Gratuit cette semaine" (badge animé).

Player Vidéo :

Plein écran + contrôles custom (style Netflix).

Téléchargement hors ligne (phase 2).

2. Pour les Créateurs
Backoffice :

Upload de films/séries (drag & drop).

Prix personnalisable (ou gratuit).

Statistiques (vues, revenus estimés).

Validation Admin :

Envoi de pièce d’identité + portfolio.

3. Pour l’Admin (Toi)
Dashboard :

Approbation des créateurs/contenus.

Gestion des signalements.

Analytics (revenus, contenus populaires).

⚙️ Phase 1 (MVP - Paiement Simulé)
Fake Payment Flow :

Bouton "Acheter" → Met isPaid: true en BDD.

Accès immédiat au contenu.

Stockage Local :

Vidéos : Dossier /public/videos/[type]/[id].mp4.

Affiches : Dossier /public/thumbnails/[id].jpg.

📌 Instructions pour l’IA/Développeur
*"Développez une MVP avec :

Un frontend premium (Next.js + ChakraUI) avec animations.

Un backend mocké (Next.js API Routes) pour :

Auth (USER/CREATOR/ADMIN).

Upload de vidéos (films/séries).

Simulation de paiement.

Une BDD PostgreSQL (schéma Prisma fourni).

Un dashboard admin (validation des créateurs/contenus).

Livrables attendus :

Code source bien documenté.

Maquettes Figma/Adobe XD avant codage.

Scripts SQL/MongoDB pour la BDD.

Guide de déploiement local."*

🌍 Touches Africaines à Intégrer
Écran de bienvenue : Fond vidéo de paysages maliens (Désert, Fleuve Niger).

Émojis culturels : 🥁 (tambour), 🎭 (masque), 🌍 (Afrique).

Noms de sections : "Tendances du Sahel", "Classiques Africains".
Ce prompt est prêt à l’emploi pour un dev ou une IA. Besoin d’ajouts ? 🛠️
