import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, ContentType } from "@prisma/client";
import { withRoleAuth } from "@/app/lib/auth";

const prisma = new PrismaClient();

// GET /api/creator/contents - Récupérer tous les contenus d'un créateur
export const GET = withRoleAuth(
  ["CREATOR"],
  async (request: NextRequest, tokenPayload) => {
    try {
      const { searchParams } = new URL(request.url);
      const creatorId = tokenPayload.userId;

      // Filtres optionnels
      const type = searchParams.get("type") as ContentType | null;
      const isApproved =
        searchParams.get("isApproved") === "true"
          ? true
          : searchParams.get("isApproved") === "false"
          ? false
          : undefined;

      // Pagination
      const page = parseInt(searchParams.get("page") || "1");
      const limit = parseInt(searchParams.get("limit") || "10");
      const skip = (page - 1) * limit;

      // Construction de la requête avec filtres
      const where: any = {
        creatorId,
      };

      if (type) {
        where.type = type;
      }

      if (isApproved !== undefined) {
        where.isApproved = isApproved;
      }

      // Récupérer les contenus du créateur
      const contents = await prisma.content.findMany({
        where,
        skip,
        take: limit,
        include: {
          film: true,
          serie: {
            include: {
              seasons: {
                include: {
                  _count: {
                    select: { episodes: true },
                  },
                },
              },
            },
          },
          transactions: {
            select: {
              amount: true,
              createdAt: true,
            },
          },
          _count: {
            select: { transactions: true },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      // Calculer les revenus pour chaque contenu
      const contentsWithRevenue = contents.map((content) => {
        const revenue = content.transactions.reduce(
          (sum, transaction) => sum + transaction.amount,
          0
        );

        return {
          ...content,
          revenue,
          salesCount: content._count.transactions,
        };
      });

      // Compter le nombre total pour la pagination
      const total = await prisma.content.count({ where });

      return NextResponse.json({
        contents: contentsWithRevenue,
        meta: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      console.error("Erreur lors de la récupération des contenus:", error);
      return NextResponse.json(
        { error: "Erreur lors de la récupération des contenus" },
        { status: 500 }
      );
    }
  }
);

// POST /api/creator/contents - Soumettre un nouveau contenu
export const POST = withRoleAuth(
  ["CREATOR"],
  async (request: NextRequest, tokenPayload) => {
    try {
      const body = await request.json();
      const creatorId = tokenPayload.userId;

      // Vérifier si le créateur est vérifié
      const creator = await prisma.user.findUnique({
        where: { id: creatorId },
      });

      if (!creator || !creator.isVerified) {
        return NextResponse.json(
          { error: "Votre compte créateur n'est pas encore vérifié" },
          { status: 403 }
        );
      }

      // Validation de base
      const {
        title,
        description,
        type,
        price,
        thumbnail,
        genre,
        director,
        year,
        country,
        language,
        cast,
        // Pour les films
        duration,
        videoPath,
        // Pour les séries
        seasons,
      } = body;

      if (!title || !description || !type || !thumbnail) {
        return NextResponse.json(
          { error: "Informations incomplètes" },
          { status: 400 }
        );
      }

      // Validation spécifique par type
      if (type === "FILM" && (!duration || !videoPath)) {
        return NextResponse.json(
          { error: "Durée et chemin vidéo requis pour un film" },
          { status: 400 }
        );
      }

      if (
        type === "SERIE" &&
        (!seasons || !Array.isArray(seasons) || seasons.length === 0)
      ) {
        return NextResponse.json(
          { error: "Au moins une saison est requise pour une série" },
          { status: 400 }
        );
      }

      try {
        // Création du contenu de base
        const content = await prisma.content.create({
          data: {
            title,
            description,
            type,
            price: price ? parseFloat(price) : null,
            thumbnail,
            genre,
            director,
            year,
            country,
            language,
            cast: cast
              ? typeof cast === "string"
                ? cast
                : JSON.stringify(cast)
              : null,
            creatorId,
            isApproved: false, // Par défaut non approuvé
            isNew: true, // Marquer comme nouveau
          },
        });

        // Création de la partie spécifique au type
        if (type === "FILM") {
          await prisma.film.create({
            data: {
              duration: parseInt(duration),
              videoPath,
              contentId: content.id,
            },
          });
        } else if (type === "SERIE") {
          const serie = await prisma.serie.create({
            data: {
              contentId: content.id,
            },
          });

          // Création des saisons et épisodes
          for (const season of seasons) {
            const createdSeason = await prisma.season.create({
              data: {
                number: season.number,
                serieId: serie.id,
                title: season.title || `Saison ${season.number}`,
              },
            });

            if (season.episodes && Array.isArray(season.episodes)) {
              for (const episode of season.episodes) {
                await prisma.episode.create({
                  data: {
                    title: episode.title,
                    duration: parseInt(episode.duration),
                    videoPath: episode.videoPath,
                    seasonId: createdSeason.id,
                    number: episode.number,
                    thumbnail: episode.thumbnail,
                    description: episode.description,
                  },
                });
              }
            }
          }
        }

        return NextResponse.json({
          message: "Contenu soumis avec succès en attente d'approbation",
          contentId: content.id,
        });
      } catch (error) {
        console.error("Erreur lors de la création du contenu:", error);
        return NextResponse.json(
          {
            error: "Erreur lors de la création du contenu",
            details: error,
          },
          { status: 500 }
        );
      }
    } catch (error) {
      console.error("Erreur lors de la création du contenu:", error);
      return NextResponse.json(
        { error: "Erreur lors de la création du contenu" },
        { status: 500 }
      );
    }
  }
);
