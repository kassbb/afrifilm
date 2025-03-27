"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  useColorModeValue,
  Divider,
  SimpleGrid,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import VideoPlayer from "@/app/components/VideoPlayer";
import NextImage from "next/image";
import {
  getContentById,
  checkPurchase,
  purchaseContent,
  Content,
} from "@/app/services/api";
import Footer from "@/app/components/Footer";

export default function FilmPage({ params }: { params: { id: string } }) {
  const { data: session, status } = useSession();
  const [film, setFilm] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPurchased, setIsPurchased] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const [videoPath, setVideoPath] = useState<string | null>(null);
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  const toast = useToast();
  const textColor = useColorModeValue("gray.600", "gray.300");

  useEffect(() => {
    const fetchFilmDetails = async () => {
      setLoading(true);
      try {
        // Récupérer les détails du film
        const filmData = await getContentById(params.id);

        if (!filmData.content || filmData.content.type !== "FILM") {
          setError("Film non trouvé");
          return;
        }

        setFilm(filmData.content);

        // Vérifier si l'utilisateur a déjà acheté ce film
        if (session) {
          try {
            const purchaseData = await checkPurchase(params.id);
            setIsPurchased(purchaseData.hasPurchased);
            setVideoPath(purchaseData.videoPath);
          } catch (err) {
            console.error("Erreur lors de la vérification d'achat:", err);
            // Ne pas afficher d'erreur à l'utilisateur, simplement considérer qu'il n'a pas acheté
          }
        }
      } catch (err) {
        console.error("Erreur lors du chargement du film:", err);
        setError("Impossible de charger les détails du film.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilmDetails();
  }, [params.id, session]);

  const handlePurchase = async () => {
    if (!session) {
      toast({
        title: "Vous devez être connecté",
        description: "Veuillez vous connecter pour acheter ce film",
        status: "warning",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setPurchaseLoading(true);
    try {
      const response = await purchaseContent(params.id);
      setIsPurchased(true);

      // Récupérer le chemin vidéo après l'achat
      const purchaseData = await checkPurchase(params.id);
      setVideoPath(purchaseData.videoPath);

      toast({
        title: "Achat réussi",
        description: "Vous pouvez maintenant regarder ce film",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (err: any) {
      toast({
        title: "Erreur lors de l'achat",
        description: err.message || "Une erreur est survenue lors de l'achat",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setPurchaseLoading(false);
    }
  };

  const handleWatch = () => {
    setIsWatching(true);
  };

  if (loading) {
    return (
      <Center py={20}>
        <Spinner size="xl" color="white" />
      </Center>
    );
  }

  if (error || !film) {
    return (
      <Center py={20}>
        <Text color="red.500">{error || "Film non trouvé"}</Text>
      </Center>
    );
  }

  // Formatage du casting pour l'affichage
  const cast = film.cast
    ? typeof film.cast === "string"
      ? JSON.parse(film.cast)
      : film.cast
    : [];

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {isWatching && videoPath ? (
            <VideoPlayer videoUrl={videoPath} />
          ) : (
            <>
              {/* En-tête du film */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box position="relative" height="400px">
                  <NextImage
                    src={film.thumbnail}
                    alt={film.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover", borderRadius: "0.5rem" }}
                  />
                </Box>
                <VStack align="start" spacing={4}>
                  <Heading size="2xl">{film.title}</Heading>
                  <HStack spacing={4}>
                    <Badge colorScheme="red">
                      {film.price ? `${film.price}€` : "Gratuit"}
                    </Badge>
                    {film.film?.duration && (
                      <Badge>
                        {Math.floor(film.film.duration / 60)}h{" "}
                        {film.film.duration % 60}min
                      </Badge>
                    )}
                    {film.genre && <Badge>{film.genre}</Badge>}
                  </HStack>
                  <Text color={textColor}>{film.description}</Text>
                  <VStack align="start" spacing={2}>
                    {film.director && (
                      <Text>
                        <strong>Réalisateur :</strong> {film.director}
                      </Text>
                    )}
                    {film.year && (
                      <Text>
                        <strong>Année :</strong> {film.year}
                      </Text>
                    )}
                    {film.country && (
                      <Text>
                        <strong>Pays :</strong> {film.country}
                      </Text>
                    )}
                    {film.language && (
                      <Text>
                        <strong>Langue :</strong> {film.language}
                      </Text>
                    )}
                  </VStack>
                  {!isPurchased ? (
                    <Button
                      colorScheme="red"
                      size="lg"
                      onClick={handlePurchase}
                      isDisabled={!session || purchaseLoading}
                      isLoading={purchaseLoading}
                    >
                      {session
                        ? `Acheter${
                            film.price ? ` (${film.price}€)` : " (Gratuit)"
                          }`
                        : "Connectez-vous pour acheter"}
                    </Button>
                  ) : (
                    <Button
                      colorScheme="green"
                      size="lg"
                      onClick={handleWatch}
                      isDisabled={!videoPath}
                    >
                      Regarder
                    </Button>
                  )}
                </VStack>
              </SimpleGrid>

              <Divider />

              {/* Distribution */}
              {cast.length > 0 && (
                <VStack align="start" spacing={4}>
                  <Heading size="lg" color="white">
                    Distribution
                  </Heading>
                  <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                    {cast.map((actor: string, index: number) => (
                      <Box
                        key={index}
                        p={4}
                        borderRadius="md"
                        bg="gray.800"
                        borderLeft="4px solid"
                        borderColor="orange.400"
                        _hover={{
                          transform: "translateY(-2px)",
                          transition: "transform 0.3s",
                        }}
                      >
                        <Text color="white">{actor}</Text>
                      </Box>
                    ))}
                  </SimpleGrid>
                </VStack>
              )}
            </>
          )}
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
