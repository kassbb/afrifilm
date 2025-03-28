"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Badge,
  Button,
  Divider,
  AspectRatio,
  Grid,
  GridItem,
  SimpleGrid,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  useToast,
  Image,
  Spinner,
  Center,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  FiPlay,
  FiClock,
  FiCalendar,
  FiHeart,
  FiShoppingCart,
  FiCheck,
} from "react-icons/fi";
import OrangeMoneyForm from "@/app/components/payment/OrangeMoneyForm";
import VideoPlayer from "@/app/components/VideoPlayer";

interface ContentDetailProps {
  contentId: string;
}

export default function ContentDetail({ contentId }: ContentDetailProps) {
  const [content, setContent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favoriteId, setFavoriteId] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState<number>(1);
  const [selectedEpisode, setSelectedEpisode] = useState<any>(null);
  const [debugInfo, setDebugInfo] = useState<string>("");
  const [showVideo, setShowVideo] = useState(false);

  const { isOpen, onOpen, onClose } = useDisclosure();
  const { data: session, status } = useSession();
  const toast = useToast();
  const router = useRouter();

  // Ajouter un effet pour le débogage de session
  useEffect(() => {
    const sessionInfo = `Status: ${status}, User: ${
      session?.user?.email || "none"
    }`;
    console.log("Session debug:", sessionInfo);
    setDebugInfo(sessionInfo);
  }, [session, status]);

  useEffect(() => {
    const fetchContentDetails = async () => {
      setLoading(true);
      try {
        console.log("Fetching content details for ID:", contentId);
        const response = await fetch(`/api/public/contents/${contentId}`);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          const errorMsg = errorData.error || `Error ${response.status}`;
          console.error("API error:", errorMsg);
          throw new Error(errorMsg);
        }

        const data = await response.json();
        console.log("Content data received:", data);
        setContent(data);

        // Si c'est une série, définir la première saison et le premier épisode
        if (data.type === "SERIE" && data.seasons && data.seasons.length > 0) {
          setSelectedSeason(data.seasons[0].number);
          if (data.seasons[0].episodes && data.seasons[0].episodes.length > 0) {
            setSelectedEpisode(data.seasons[0].episodes[0]);
          }
        }

        // Vérifier si le contenu est dans les favoris
        if (session?.user) {
          checkFavorite();
        }
      } catch (err) {
        console.error("Error fetching content:", err);
        setError(
          err instanceof Error
            ? err.message
            : "Impossible de charger les détails du contenu"
        );
      } finally {
        setLoading(false);
      }
    };

    if (contentId) {
      fetchContentDetails();
    }
  }, [contentId, session]);

  const checkFavorite = async () => {
    try {
      const response = await fetch("/api/user/favorites");
      if (!response.ok) return;

      const data = await response.json();
      const favorite = data.favorites.find(
        (f: any) => f.contentId === contentId
      );

      if (favorite) {
        setIsFavorite(true);
        setFavoriteId(favorite.id);
      }
    } catch (error) {
      console.error("Erreur de vérification des favoris:", error);
    }
  };

  const toggleFavorite = async () => {
    if (!session?.user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour ajouter aux favoris",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      router.push("/auth/login");
      return;
    }

    try {
      if (isFavorite && favoriteId) {
        // Supprimer des favoris
        const response = await fetch(`/api/user/favorites/${favoriteId}`, {
          method: "DELETE",
        });

        if (!response.ok) {
          throw new Error("Erreur lors de la suppression des favoris");
        }

        setIsFavorite(false);
        setFavoriteId(null);
        toast({
          title: "Favoris mis à jour",
          description: "Contenu retiré de vos favoris",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Ajouter aux favoris
        const response = await fetch("/api/user/favorites", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ contentId }),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Erreur lors de l'ajout aux favoris");
        }

        setIsFavorite(true);
        setFavoriteId(data.favorite.id);
        toast({
          title: "Favoris mis à jour",
          description: "Contenu ajouté à vos favoris",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Erreur de gestion des favoris:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleBuyClick = () => {
    if (!session?.user) {
      toast({
        title: "Connexion requise",
        description: "Veuillez vous connecter pour acheter ce contenu",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      router.push("/auth/login");
      return;
    }

    onOpen();
  };

  const handlePaymentSuccess = (transactionId: string) => {
    toast({
      title: "Achat réussi",
      description: "Vous avez maintenant accès à ce contenu",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onClose();

    // Recharger les données du contenu pour mettre à jour les droits d'accès
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  // Déterminer si le contenu a besoin d'achat
  const requiresPurchase = content?.accessInfo?.requiresPurchase;
  const hasAccess = content?.accessInfo?.hasAccess || false;
  const isFree = content?.accessInfo?.isFree || false;
  const isAdmin = content?.accessInfo?.isAdmin || false;
  const hasValidVideo = !!content?.videoPath && content?.videoPath !== null;

  // Ajouter une vérification pour le debug
  useEffect(() => {
    if (content) {
      console.log("État d'accès au contenu:", {
        contentId,
        title: content.title,
        hasAccess,
        requiresPurchase,
        isFree,
        isAdmin,
        hasValidVideo,
        videoPath: content.videoPath || "Non disponible",
        accessInfo: content.accessInfo || "Non disponible",
      });
    }
  }, [content, hasAccess, requiresPurchase, contentId, isAdmin, isFree]);

  const handleWatchClick = () => {
    if (!content) return;

    // Vérifier que l'utilisateur a accès et que la vidéo existe
    const hasAccess = content.accessInfo?.hasAccess || false;
    const isFree = content.accessInfo?.isFree || false;
    const canWatch = hasAccess || isFree;
    const hasValidVideo = !!content.videoPath && content.videoPath !== null;

    console.log("Tentative de lecture vidéo:", {
      hasAccess,
      isFree,
      canWatch,
      hasValidVideo,
      videoPath: content.videoPath,
    });

    if (!canWatch) {
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas accès à ce contenu",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    if (!hasValidVideo) {
      toast({
        title: "Vidéo non disponible",
        description: "La vidéo de ce contenu n'est pas disponible actuellement",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Activer l'affichage de la vidéo
    setShowVideo(true);
    console.log("Lecture vidéo démarrée pour:", content.title);
    console.log("URL vidéo:", content.videoPath);
    console.log("hasAccess:", hasAccess);

    // Faire défiler jusqu'à la vidéo si nécessaire
    const videoElement = document.getElementById("content-video");
    if (videoElement) {
      videoElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleSeasonChange = (seasonNumber: number) => {
    setSelectedSeason(seasonNumber);
    const season = content.seasons.find((s: any) => s.number === seasonNumber);
    if (season && season.episodes.length > 0) {
      setSelectedEpisode(season.episodes[0]);
    } else {
      setSelectedEpisode(null);
    }
  };

  const handleEpisodeSelect = (episode: any) => {
    setSelectedEpisode(episode);
  };

  if (loading) {
    return (
      <Center minH="60vh">
        <VStack spacing={4}>
          <Spinner size="xl" color="brand.500" />
          <Text color="gray.400">Chargement du contenu...</Text>
          {debugInfo && (
            <Text fontSize="xs" color="gray.500">
              Debug: {debugInfo}
            </Text>
          )}
        </VStack>
      </Center>
    );
  }

  if (error || !content) {
    return (
      <Container maxW="container.xl" py={10}>
        <VStack spacing={4}>
          <Heading>Erreur</Heading>
          <Text>{error || "Contenu non disponible"}</Text>
          {debugInfo && (
            <Text fontSize="xs" color="gray.500">
              Debug: {debugInfo}
            </Text>
          )}
          <Button onClick={() => router.back()}>Retour</Button>
        </VStack>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={10}>
      <VStack spacing={8} align="stretch">
        {/* Section d'en-tête */}
        <Box position="relative" borderRadius="xl" overflow="hidden">
          <AspectRatio ratio={16 / 9} maxH="500px">
            {content.mainImagePath ? (
              <Image
                src={content.mainImagePath}
                alt={content.title}
                objectFit="cover"
              />
            ) : (
              <Box bg="gray.700" />
            )}
          </AspectRatio>
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient="linear(to-t, blackAlpha.800, transparent)"
            p={6}
            display="flex"
            flexDirection="column"
            justifyContent="flex-end"
          >
            <VStack align="flex-start" spacing={3}>
              <Heading size="2xl" color="white">
                {content.title}
              </Heading>
              <HStack spacing={4} wrap="wrap">
                {content.categories?.map((cat: any) => (
                  <Badge key={cat.id} colorScheme="brand" fontSize="sm">
                    {cat.name}
                  </Badge>
                ))}
                <HStack color="gray.300">
                  <FiCalendar />
                  <Text>{content.releaseYear}</Text>
                </HStack>
                {content.type === "FILM" && content.duration && (
                  <HStack color="gray.300">
                    <FiClock />
                    <Text>
                      {Math.floor(content.duration / 60)}h{" "}
                      {content.duration % 60}min
                    </Text>
                  </HStack>
                )}
                {content.isPremium && (
                  <Badge colorScheme="yellow" fontSize="sm">
                    Premium
                  </Badge>
                )}
              </HStack>
            </VStack>
          </Box>
        </Box>

        {/* Contenu principal */}
        <Grid templateColumns={{ base: "1fr", md: "3fr 1fr" }} gap={8}>
          <GridItem>
            <VStack align="stretch" spacing={8}>
              {/* Vidéo (si accès) ou bouton d'achat */}
              {content.type === "FILM" && (
                <Box
                  bg="gray.800"
                  borderRadius="md"
                  overflow="hidden"
                  boxShadow="md"
                  id="content-video"
                >
                  {(hasAccess || isFree) && hasValidVideo && showVideo ? (
                    <Box height="400px" position="relative">
                      <VideoPlayer
                        videoUrl={content.videoPath}
                        thumbnailUrl={content.mainImagePath}
                      />
                      
                    </Box>
                  ) : (
                    <Box
                      position="relative"
                      height="400px"
                      bgImage={`url(${content.mainImagePath})`}
                      bgSize="cover"
                      bgPosition="center"
                    >
                      <Box
                        position="absolute"
                        top={0}
                        left={0}
                        right={0}
                        bottom={0}
                        display="flex"
                        justifyContent="center"
                        alignItems="center"
                        bg="blackAlpha.700"
                      >
                        <VStack spacing={4}>
                          {!hasValidVideo && (hasAccess || isFree) && (
                            <Badge colorScheme="red" p={2} fontSize="md">
                              Vidéo non disponible - Contactez l'assistance
                            </Badge>
                          )}
                          {isAdmin && !hasValidVideo && (
                            <Badge colorScheme="orange" p={2} fontSize="md">
                              Admin: Vidéo manquante dans la base de données
                            </Badge>
                          )}
                          <Text color="white" fontSize="xl">
                            {requiresPurchase && !isFree
                              ? `Accès Premium: ${content.price.toFixed(2)} €`
                              : session?.user
                              ? hasValidVideo
                                ? "Cliquez pour regarder ce contenu"
                                : "Vidéo non disponible actuellement"
                              : "Connexion requise pour regarder"}
                          </Text>
                          <Button
                            leftIcon={
                              requiresPurchase && !isFree ? (
                                <FiShoppingCart />
                              ) : (
                                <FiPlay />
                              )
                            }
                            colorScheme="brand"
                            size="lg"
                            onClick={
                              requiresPurchase && !isFree
                                ? handleBuyClick
                                : session?.user
                                ? handleWatchClick
                                : () => router.push("/auth/login")
                            }
                            isDisabled={
                              session?.user &&
                              !(requiresPurchase && !isFree) &&
                              !hasValidVideo
                            }
                          >
                            {requiresPurchase && !isFree
                              ? "Acheter maintenant"
                              : session?.user
                              ? hasValidVideo
                                ? isFree
                                  ? "Regarder gratuitement"
                                  : "Regarder"
                                : "Vidéo non disponible"
                              : "Se connecter"}
                          </Button>
                        </VStack>
                      </Box>
                    </Box>
                  )}
                </Box>
              )}

              {/* Onglets d'informations */}
              <Tabs colorScheme="brand" variant="enclosed">
                <TabList>
                  <Tab>Détails</Tab>
                  {content.type === "SERIE" && <Tab>Épisodes</Tab>}
                </TabList>

                <TabPanels>
                  {/* Onglet des détails */}
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Text fontSize="lg">{content.description}</Text>
                      <Divider />
                      <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                        {content.director && (
                          <Box>
                            <Text fontWeight="bold">Réalisateur:</Text>
                            <Text>{content.director}</Text>
                          </Box>
                        )}
                        {content.actors && (
                          <Box>
                            <Text fontWeight="bold">Acteurs:</Text>
                            <Text>{content.actors}</Text>
                          </Box>
                        )}
                      </SimpleGrid>
                    </VStack>
                  </TabPanel>

                  {/* Onglet des épisodes pour les séries */}
                  {content.type === "SERIE" && (
                    <TabPanel>
                      <VStack align="stretch" spacing={6}>
                        {/* Sélecteur de saison */}
                        <HStack spacing={4} wrap="wrap">
                          {content.seasons?.map((season: any) => (
                            <Button
                              key={season.id}
                              size="sm"
                              variant={
                                selectedSeason === season.number
                                  ? "solid"
                                  : "outline"
                              }
                              colorScheme="brand"
                              onClick={() => handleSeasonChange(season.number)}
                            >
                              Saison {season.number}
                            </Button>
                          ))}
                        </HStack>

                        {/* Liste des épisodes */}
                        <VStack align="stretch" spacing={4}>
                          {content.seasons
                            ?.find((s: any) => s.number === selectedSeason)
                            ?.episodes?.map((episode: any) => (
                              <Box
                                key={episode.id}
                                p={4}
                                borderWidth="1px"
                                borderRadius="md"
                                _hover={{ bg: "gray.700" }}
                                cursor={hasAccess ? "pointer" : "default"}
                                onClick={() =>
                                  hasAccess && handleEpisodeSelect(episode)
                                }
                              >
                                <HStack justify="space-between">
                                  <VStack align="start" spacing={1}>
                                    <HStack>
                                      <Text fontWeight="bold">
                                        Épisode {episode.number}
                                      </Text>
                                      <Text color="gray.400">
                                        {episode.title}
                                      </Text>
                                    </HStack>
                                    <HStack color="gray.400">
                                      <FiClock />
                                      <Text>{episode.duration} min</Text>
                                    </HStack>
                                  </VStack>
                                  {hasAccess ? (
                                    <Button
                                      leftIcon={<FiPlay />}
                                      size="sm"
                                      colorScheme="brand"
                                    >
                                      Regarder
                                    </Button>
                                  ) : (
                                    <Button
                                      leftIcon={<FiShoppingCart />}
                                      size="sm"
                                      colorScheme="brand"
                                      onClick={handleBuyClick}
                                    >
                                      Acheter
                                    </Button>
                                  )}
                                </HStack>
                              </Box>
                            ))}
                        </VStack>

                        {/* Lecteur pour l'épisode sélectionné */}
                        {hasAccess && selectedEpisode && (
                          <Box mt={6}>
                            <Heading size="md" mb={4}>
                              {selectedEpisode.title}
                            </Heading>
                            <VideoPlayer
                              videoUrl={selectedEpisode.videoPath}
                              thumbnailUrl={
                                selectedEpisode.thumbnailPath ||
                                content.mainImagePath
                              }
                            />
                          </Box>
                        )}
                      </VStack>
                    </TabPanel>
                  )}
                </TabPanels>
              </Tabs>
            </VStack>
          </GridItem>

          {/* Barre latérale */}
          <GridItem>
            <VStack align="stretch" spacing={6}>
              {/* Actions */}
              <Box bg="gray.800" p={4} borderRadius="md" boxShadow="md">
                <VStack align="stretch" spacing={4}>
                  <Heading size="md">Actions</Heading>
                  <HStack>
                    {!hasAccess && requiresPurchase ? (
                      <Button
                        leftIcon={<FiShoppingCart />}
                        colorScheme="brand"
                        onClick={handleBuyClick}
                        w="full"
                      >
                        Acheter {content.price.toFixed(2)} €
                      </Button>
                    ) : (
                      <Button
                        leftIcon={<FiPlay />}
                        colorScheme="brand"
                        w="full"
                        isDisabled={!hasAccess}
                      >
                        {hasAccess ? "Regarder" : "Non disponible"}
                      </Button>
                    )}
                  </HStack>
                  <Button
                    leftIcon={isFavorite ? <FiCheck /> : <FiHeart />}
                    variant={isFavorite ? "solid" : "outline"}
                    colorScheme={isFavorite ? "red" : "gray"}
                    onClick={toggleFavorite}
                  >
                    {isFavorite ? "Dans vos favoris" : "Ajouter aux favoris"}
                  </Button>
                </VStack>
              </Box>

              {/* Informations */}
              <Box bg="gray.800" p={4} borderRadius="md" boxShadow="md">
                <VStack align="stretch" spacing={3}>
                  <Heading size="md">Informations</Heading>
                  <Divider />
                  <HStack justify="space-between">
                    <Text>Type</Text>
                    <Badge colorScheme="brand">
                      {content.type === "FILM" ? "Film" : "Série"}
                    </Badge>
                  </HStack>
                  {content.type === "SERIE" && (
                    <>
                      <HStack justify="space-between">
                        <Text>Saisons</Text>
                        <Text>{content.seasons?.length || 0}</Text>
                      </HStack>
                      <HStack justify="space-between">
                        <Text>Épisodes</Text>
                        <Text>
                          {content.seasons?.reduce(
                            (acc: number, s: any) => acc + s.episodes.length,
                            0
                          ) || 0}
                        </Text>
                      </HStack>
                    </>
                  )}
                  <HStack justify="space-between">
                    <Text>Année</Text>
                    <Text>{content.releaseYear}</Text>
                  </HStack>
                  {hasAccess && content.accessInfo?.purchaseInfo && (
                    <>
                      <Divider />
                      <Text fontWeight="bold" color="green.400">
                        Accès confirmé
                      </Text>
                      <Text fontSize="sm" color="gray.400">
                        Acheté le{" "}
                        {new Date(
                          content.accessInfo.purchaseInfo.purchaseDate
                        ).toLocaleDateString()}
                      </Text>
                    </>
                  )}
                </VStack>
              </Box>
            </VStack>
          </GridItem>
        </Grid>
      </VStack>

      {/* Modal de paiement */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Paiement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <OrangeMoneyForm
              contentId={contentId}
              contentTitle={content.title}
              price={content.price}
              onSuccess={handlePaymentSuccess}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
