"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Flex,
  Heading,
  Spinner,
  Text,
  HStack,
  Tag,
  Badge,
  IconButton,
  useToast,
  Select,
  Input,
  Textarea,
  FormControl,
  FormLabel,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Tooltip,
  Image,
  Divider,
  SimpleGrid,
  VStack,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  FormHelperText,
} from "@chakra-ui/react";
import {
  FiCheck,
  FiX,
  FiEye,
  FiTrash2,
  FiSearch,
  FiFilter,
  FiDollarSign,
  FiUser,
  FiVideo,
  FiPlay,
} from "react-icons/fi";
import NextLink from "next/link";

// Type des contenus
interface Content {
  id: string;
  title: string;
  type: "FILM" | "SERIE";
  thumbnail: string;
  description: string;
  price: number | null;
  isApproved: boolean;
  rejectionReason: string | null;
  createdAt: string;
  creator: {
    id: string;
    email: string;
    name: string | null;
  };
  film?: {
    id: string;
    duration: number;
    videoPath: string;
  };
  serie?: {
    id: string;
    seasons: {
      id: string;
      number: number;
      title: string;
      episodes: {
        id: string;
        title: string;
        duration: number;
        videoPath: string;
        number?: number;
      }[];
    }[];
  };
  genre?: string;
  director?: string;
  year?: string;
  country?: string;
  language?: string;
  cast?: string;
}

// Modal de détails du contenu
interface ContentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onApprove: (content: Content) => void;
  onReject: (content: Content, reason: string) => void;
}

// Composant Modal pour les détails
function ContentDetailsModal({
  isOpen,
  onClose,
  content,
  onApprove,
  onReject,
}: ContentDetailsModalProps) {
  const [rejectionReason, setRejectionReason] = useState("");
  const [activeTab, setActiveTab] = useState<
    "info" | "video" | "actions" | "seasons"
  >("info");
  const [selectedSeason, setSelectedSeason] = useState(1);
  const [selectedEpisode, setSelectedEpisode] = useState<string | null>(null);

  // État pour le formulaire d'ajout de saison
  const [newSeason, setNewSeason] = useState({
    number: 1,
    title: "",
  });

  // État pour le formulaire d'ajout d'épisode
  const [showAddEpisodeForm, setShowAddEpisodeForm] = useState(false);
  const [selectedSeasonForEpisode, setSelectedSeasonForEpisode] = useState<
    string | null
  >(null);
  const [newEpisode, setNewEpisode] = useState({
    title: "",
    duration: 0,
    videoPath: "",
    number: 1,
  });

  // État pour gérer les actions en cours
  const [isAddingSeason, setIsAddingSeason] = useState(false);
  const [isAddingEpisode, setIsAddingEpisode] = useState(false);
  const [uploadingEpisodeVideo, setUploadingEpisodeVideo] = useState(false);

  // Toast pour les notifications
  const toast = useToast();

  useEffect(() => {
    if (content && content.rejectionReason) {
      setRejectionReason(content.rejectionReason);
    } else {
      setRejectionReason("");
    }

    // Reset selected episode when content changes
    setSelectedEpisode(null);

    // Reset to first season when content changes
    if (content?.serie?.seasons && content.serie.seasons.length > 0) {
      setSelectedSeason(content.serie.seasons[0].number);
    }

    // Réinitialiser le formulaire de saison quand le contenu change
    if (content?.serie?.seasons && content.serie.seasons.length > 0) {
      // Définir le numéro de la nouvelle saison comme la dernière saison + 1
      const highestSeasonNumber = Math.max(
        ...content.serie.seasons.map((s) => s.number)
      );
      setNewSeason((prev) => ({ ...prev, number: highestSeasonNumber + 1 }));
    } else {
      setNewSeason({ number: 1, title: "" });
    }

    // Réinitialiser le formulaire d'épisode
    setShowAddEpisodeForm(false);
    setSelectedSeasonForEpisode(null);
    setNewEpisode({
      title: "",
      duration: 0,
      videoPath: "",
      number: 1,
    });
  }, [content]);

  // Gestionnaire pour le formulaire d'ajout de saison
  const handleSeasonInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewSeason((prev) => ({ ...prev, [name]: value }));
  };

  const handleSeasonNumberChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setNewSeason((prev) => ({ ...prev, number: valueAsNumber || 1 }));
  };

  // Gestionnaire pour le formulaire d'ajout d'épisode
  const handleEpisodeInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewEpisode((prev) => ({ ...prev, [name]: value }));
  };

  const handleEpisodeDurationChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setNewEpisode((prev) => ({ ...prev, duration: valueAsNumber || 0 }));
  };

  const handleEpisodeNumberChange = (
    valueAsString: string,
    valueAsNumber: number
  ) => {
    setNewEpisode((prev) => ({ ...prev, number: valueAsNumber || 1 }));
  };

  // Gestionnaire pour l'upload de vidéo d'épisode
  const handleEpisodeVideoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    try {
      setUploadingEpisodeVideo(true);

      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "videos");

      toast({
        title: "Upload en cours",
        description: "Veuillez patienter pendant l'upload de la vidéo...",
        status: "info",
        duration: null,
        isClosable: false,
        id: "episode-video-upload",
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload de la vidéo");
      }

      const data = await response.json();

      // Mettre à jour le champ videoPath dans le formulaire
      setNewEpisode((prev) => ({ ...prev, videoPath: data.filePath }));

      // Fermer la notification d'upload
      toast.close("episode-video-upload");

      toast({
        title: "Upload réussi",
        description: "La vidéo a été uploadée avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Fermer la notification d'upload
      toast.close("episode-video-upload");

      toast({
        title: "Erreur",
        description: "Impossible d'uploader la vidéo",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setUploadingEpisodeVideo(false);
    }
  };

  // Fonction pour ajouter une saison
  const handleAddSeason = async () => {
    if (!content) return;

    console.log("Contenu série:", content);
    console.log("Type de contenu:", content.type);
    console.log("Données série:", content.serie);

    // Vérifier que c'est bien une série
    if (content.type !== "SERIE") {
      toast({
        title: "Erreur",
        description: "Ce contenu n'est pas une série",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Vérifier que la série existe
    if (!content.serie?.id) {
      toast({
        title: "Erreur de données",
        description:
          "Impossible d'identifier la série pour ajouter une saison. ID manquant dans les données.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      // Afficher des informations supplémentaires pour le débogage
      console.error("Erreur: ID de série manquant");
      console.error("Contenu:", content);
      console.error("Type:", content.type);
      console.error("Serie:", content.serie);

      // Essayer de récupérer les dernières données
      try {
        const response = await fetch(`/api/admin/contents/${content.id}`);
        if (response.ok) {
          const updatedContent = await response.json();
          console.log("Contenu récupéré:", updatedContent);

          if (updatedContent.serie?.id) {
            // Mettre à jour le contenu
            window.location.reload();
            return;
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des données:", error);
      }

      toast({
        title: "Solution possible",
        description:
          "Essayez de rafraîchir la page ou de rouvrir les détails de la série",
        status: "info",
        duration: 8000,
        isClosable: true,
      });

      return;
    }

    if (newSeason.number < 1) {
      toast({
        title: "Erreur de validation",
        description: "Le numéro de saison doit être supérieur à 0",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    // Vérifier si le numéro de saison existe déjà
    if (
      content.serie?.seasons &&
      content.serie.seasons.some((s) => s.number === newSeason.number)
    ) {
      toast({
        title: "Erreur de validation",
        description: `La saison ${newSeason.number} existe déjà`,
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsAddingSeason(true);

      // Récupérer l'ID de la série
      const serieId = content.serie.id;

      console.log(`Tentative d'ajout de saison pour la série: ${serieId}`);

      // Appeler l'API pour ajouter une saison
      const response = await fetch(`/api/admin/series/${serieId}/seasons`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          number: newSeason.number,
          title: newSeason.title.trim() || `Saison ${newSeason.number}`,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de l'ajout de la saison"
        );
      }

      // Récupérer les données mises à jour
      const data = await response.json();

      toast({
        title: "Saison ajoutée",
        description: `La saison ${newSeason.number} a été ajoutée avec succès`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Réinitialiser le formulaire et incrémenter le numéro pour la prochaine saison
      setNewSeason({
        number: newSeason.number + 1,
        title: "",
      });

      // Recharger les données du contenu pour afficher la nouvelle saison
      // Note: Ceci devrait être remplacé par une mise à jour de l'état local dans une implémentation complète
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAddingSeason(false);
    }
  };

  // Fonction pour ouvrir le formulaire d'ajout d'épisode
  const handleShowAddEpisodeForm = (seasonId: string) => {
    setSelectedSeasonForEpisode(seasonId);
    setShowAddEpisodeForm(true);

    // Trouver la saison sélectionnée
    const season = content?.serie?.seasons?.find((s) => s.id === seasonId);

    // Déterminer le numéro d'épisode suivant
    if (season && season.episodes && season.episodes.length > 0) {
      const highestEpisodeNumber = Math.max(
        ...season.episodes.map((e) => e.number || 0)
      );
      setNewEpisode((prev) => ({ ...prev, number: highestEpisodeNumber + 1 }));
    } else {
      setNewEpisode((prev) => ({ ...prev, number: 1 }));
    }
  };

  // Fonction pour ajouter un épisode
  const handleAddEpisode = async () => {
    if (!content || !selectedSeasonForEpisode) return;

    if (
      !newEpisode.title ||
      newEpisode.duration <= 0 ||
      !newEpisode.videoPath
    ) {
      toast({
        title: "Formulaire incomplet",
        description: "Tous les champs sont obligatoires",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      setIsAddingEpisode(true);

      // Appeler l'API pour ajouter un épisode
      const response = await fetch(
        `/api/admin/seasons/${selectedSeasonForEpisode}/episodes`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: newEpisode.title,
            duration: newEpisode.duration,
            videoPath: newEpisode.videoPath,
            number: newEpisode.number,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de l'ajout de l'épisode"
        );
      }

      // Récupérer les données mises à jour
      const data = await response.json();

      toast({
        title: "Épisode ajouté",
        description: `L'épisode "${newEpisode.title}" a été ajouté avec succès`,
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Fermer le formulaire et réinitialiser
      setShowAddEpisodeForm(false);
      setSelectedSeasonForEpisode(null);
      setNewEpisode({
        title: "",
        duration: 0,
        videoPath: "",
        number: 1,
      });

      // Recharger les données du contenu pour afficher le nouvel épisode
      // Note: Ceci devrait être remplacé par une mise à jour de l'état local dans une implémentation complète
      window.location.reload();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsAddingEpisode(false);
    }
  };

  const handleApprove = () => {
    if (content) {
      onApprove(content);
    }
  };

  const handleReject = () => {
    if (content) {
      onReject(content, rejectionReason);
    }
  };

  if (!content) return null;

  // Vérifier si le contenu a une vidéo (film ou série)
  const hasVideo =
    (content.type === "FILM" && content.film?.videoPath) ||
    (content.type === "SERIE" &&
      content.serie?.seasons &&
      content.serie.seasons.length > 0 &&
      content.serie.seasons.some(
        (season) => season.episodes && season.episodes.length > 0
      ));

  // Vérifier si la saison sélectionnée a des épisodes
  const selectedSeasonData =
    content.type === "SERIE" && content.serie?.seasons
      ? content.serie.seasons.find((s) => s.number === selectedSeason)
      : null;

  const hasEpisodesInSelectedSeason =
    !!selectedSeasonData &&
    !!selectedSeasonData.episodes &&
    selectedSeasonData.episodes.length > 0;

  const videoPath =
    content.type === "FILM"
      ? content.film?.videoPath
      : selectedEpisode !== null &&
        selectedSeasonData &&
        selectedSeasonData.episodes
      ? selectedSeasonData.episodes.find((e) => e.id === selectedEpisode)
          ?.videoPath
      : null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white" maxW="900px">
        <ModalHeader>
          <HStack justify="space-between">
            <Text>Détails du contenu</Text>
            <HStack spacing={4}>
              <Button
                size="sm"
                colorScheme={activeTab === "info" ? "blue" : "gray"}
                onClick={() => setActiveTab("info")}
                variant={activeTab === "info" ? "solid" : "outline"}
                data-tab="info"
              >
                Informations
              </Button>
              {hasVideo && (
                <Button
                  size="sm"
                  colorScheme={activeTab === "video" ? "blue" : "gray"}
                  onClick={() => setActiveTab("video")}
                  variant={activeTab === "video" ? "solid" : "outline"}
                  data-tab="video"
                >
                  Vidéo
                </Button>
              )}
              {content.type === "SERIE" && (
                <Button
                  size="sm"
                  colorScheme={activeTab === "seasons" ? "blue" : "gray"}
                  onClick={() => setActiveTab("seasons")}
                  variant={activeTab === "seasons" ? "solid" : "outline"}
                  data-tab="seasons"
                >
                  Saisons et épisodes
                </Button>
              )}
              <Button
                size="sm"
                colorScheme={activeTab === "actions" ? "blue" : "gray"}
                onClick={() => setActiveTab("actions")}
                variant={activeTab === "actions" ? "solid" : "outline"}
                data-tab="actions"
              >
                Actions
              </Button>
            </HStack>
          </HStack>
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {activeTab === "info" && (
            <Box>
              {content.thumbnail && (
                <Box mb={4} position="relative" height="200px">
                  <Image
                    src={content.thumbnail}
                    alt={content.title}
                    objectFit="cover"
                    borderRadius="md"
                    width="100%"
                    height="100%"
                  />
                </Box>
              )}

              <HStack mb={2} justify="space-between">
                <Heading as="h3" size="md">
                  {content.title}
                </Heading>
                <Tag
                  size="sm"
                  colorScheme={content.type === "FILM" ? "red" : "purple"}
                  borderRadius="full"
                >
                  {content.type === "FILM" ? "Film" : "Série"}
                </Tag>
              </HStack>

              <HStack spacing={2} mb={4} wrap="wrap">
                {content.price ? (
                  <Tag size="sm" colorScheme="green" borderRadius="full">
                    <HStack spacing={1}>
                      <FiDollarSign />
                      <Text>{content.price.toFixed(2)} €</Text>
                    </HStack>
                  </Tag>
                ) : (
                  <Tag size="sm" colorScheme="gray" borderRadius="full">
                    Gratuit
                  </Tag>
                )}

                {content.isApproved ? (
                  <Badge colorScheme="green">Approuvé</Badge>
                ) : (
                  <Badge colorScheme="yellow">En attente</Badge>
                )}

                {content.type === "FILM" && content.film?.duration && (
                  <Tag size="sm" colorScheme="blue" borderRadius="full">
                    {content.film.duration} min
                  </Tag>
                )}
              </HStack>

              <Text fontSize="sm" color="gray.400" mb={4}>
                Créé par {content.creator.name || content.creator.email} le{" "}
                {new Date(content.createdAt).toLocaleDateString("fr-FR")}
              </Text>

              <Text mb={4}>{content.description}</Text>

              <Divider my={4} />

              <Heading as="h4" size="sm" mb={3}>
                Métadonnées
              </Heading>

              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} mb={4}>
                {content.genre && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      Genre:
                    </Text>
                    <Text>{content.genre}</Text>
                  </Box>
                )}

                {content.director && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      Réalisateur:
                    </Text>
                    <Text>{content.director}</Text>
                  </Box>
                )}

                {content.year && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      Année:
                    </Text>
                    <Text>{content.year}</Text>
                  </Box>
                )}

                {content.country && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      Pays:
                    </Text>
                    <Text>{content.country}</Text>
                  </Box>
                )}

                {content.language && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      Langue:
                    </Text>
                    <Text>{content.language}</Text>
                  </Box>
                )}

                {content.cast && (
                  <Box>
                    <Text fontWeight="bold" fontSize="sm">
                      Casting:
                    </Text>
                    <Text>{content.cast}</Text>
                  </Box>
                )}
              </SimpleGrid>

              {content.rejectionReason && (
                <Box mt={4} p={3} bg="red.900" borderRadius="md">
                  <Text fontWeight="bold" fontSize="sm" mb={1}>
                    Raison du rejet:
                  </Text>
                  <Text>{content.rejectionReason}</Text>
                </Box>
              )}

              {hasVideo && (
                <Box textAlign="center" mt={6}>
                  <Button
                    colorScheme="red"
                    size="lg"
                    onClick={() => setActiveTab("video")}
                    leftIcon={<Box as="span">▶</Box>}
                    width="200px"
                  >
                    Voir la vidéo
                  </Button>
                </Box>
              )}
            </Box>
          )}

          {activeTab === "video" && (
            <Box>
              <Heading as="h4" size="sm" mb={3}>
                Vidéo
              </Heading>

              {content.type === "SERIE" &&
                content.serie?.seasons &&
                content.serie.seasons.length > 0 && (
                  <Box mb={4}>
                    <HStack mb={3} wrap="wrap">
                      <Text fontWeight="bold" mr={2}>
                        Saison:
                      </Text>
                      {content.serie.seasons.map((season) => (
                        <Button
                          key={season.id}
                          size="sm"
                          colorScheme={
                            selectedSeason === season.number ? "blue" : "gray"
                          }
                          variant={
                            selectedSeason === season.number
                              ? "solid"
                              : "outline"
                          }
                          onClick={() => {
                            setSelectedSeason(season.number);
                            setSelectedEpisode(null);
                          }}
                        >
                          {season.number}
                        </Button>
                      ))}
                    </HStack>

                    <HStack mb={4} wrap="wrap">
                      <Text fontWeight="bold" mr={2}>
                        Épisode:
                      </Text>
                      {hasEpisodesInSelectedSeason ? (
                        selectedSeasonData.episodes.map((episode) => (
                          <Button
                            key={episode.id}
                            size="sm"
                            colorScheme={
                              selectedEpisode === episode.id ? "blue" : "gray"
                            }
                            variant={
                              selectedEpisode === episode.id
                                ? "solid"
                                : "outline"
                            }
                            onClick={() => setSelectedEpisode(episode.id)}
                          >
                            {episode.title}
                          </Button>
                        ))
                      ) : (
                        <Text fontSize="sm" color="gray.400">
                          Aucun épisode disponible pour cette saison
                        </Text>
                      )}
                    </HStack>
                  </Box>
                )}

              {videoPath ? (
                <Box position="relative">
                  <Box
                    as="video"
                    controls
                    width="100%"
                    src={videoPath}
                    borderRadius="md"
                    bg="black"
                    poster={content.thumbnail}
                    h="400px"
                    id="content-video-player"
                  />
                  <Button
                    position="absolute"
                    top="50%"
                    left="50%"
                    transform="translate(-50%, -50%)"
                    colorScheme="red"
                    size="lg"
                    borderRadius="full"
                    width="80px"
                    height="80px"
                    opacity="0.9"
                    _hover={{ opacity: 1 }}
                    onClick={() => {
                      const videoElement = document.getElementById(
                        "content-video-player"
                      ) as HTMLVideoElement;
                      if (videoElement) {
                        if (videoElement.paused) {
                          videoElement.play();
                        } else {
                          videoElement.pause();
                        }
                      }
                    }}
                    aria-label="Lire la vidéo"
                    title="Lire la vidéo"
                  >
                    <Box as="span" fontSize="3xl">
                      ▶
                    </Box>
                  </Button>
                </Box>
              ) : (
                <Box
                  height="300px"
                  bg="gray.900"
                  borderRadius="md"
                  display="flex"
                  alignItems="center"
                  justifyContent="center"
                  flexDirection="column"
                  p={5}
                >
                  {content.type === "FILM" ? (
                    <Text textAlign="center">
                      Aucune vidéo disponible pour ce film
                    </Text>
                  ) : !content.serie?.seasons ||
                    content.serie.seasons.length === 0 ? (
                    <Text textAlign="center">
                      Aucune saison disponible pour cette série
                    </Text>
                  ) : !hasEpisodesInSelectedSeason ? (
                    <Text textAlign="center">
                      Aucun épisode disponible pour la saison {selectedSeason}
                    </Text>
                  ) : (
                    <Text textAlign="center">
                      Veuillez sélectionner un épisode pour voir la vidéo
                    </Text>
                  )}
                </Box>
              )}

              {content.type === "SERIE" && selectedEpisode && (
                <Text mt={1} fontSize="sm" color="gray.400">
                  Durée:{" "}
                  {selectedSeasonData?.episodes.find(
                    (e) => e.id === selectedEpisode
                  )?.duration || "N/A"}{" "}
                  minutes
                </Text>
              )}
            </Box>
          )}

          {activeTab === "seasons" && content.type === "SERIE" && (
            <Box>
              <Heading as="h4" size="sm" mb={3}>
                Gestion des saisons et épisodes
              </Heading>

              {/* Liste des saisons existantes */}
              <Box mb={4}>
                <Text fontWeight="bold" mb={2}>
                  Saisons existantes:
                </Text>
                {content.serie?.seasons && content.serie.seasons.length > 0 ? (
                  <VStack align="stretch" spacing={3}>
                    {content.serie.seasons
                      .sort((a, b) => a.number - b.number)
                      .map((season) => (
                        <Box
                          key={season.id}
                          p={3}
                          borderWidth="1px"
                          borderColor="gray.600"
                          borderRadius="md"
                        >
                          <Flex justify="space-between" align="center">
                            <HStack>
                              <Badge
                                colorScheme="purple"
                                fontSize="0.8em"
                                p={1}
                              >
                                Saison {season.number}
                              </Badge>
                              <Text fontWeight="medium">
                                {season.title || `Saison ${season.number}`}
                              </Text>
                            </HStack>
                            <Text fontSize="sm" color="gray.400">
                              {season.episodes?.length || 0} épisode(s)
                            </Text>
                          </Flex>

                          {/* Liste des épisodes de cette saison */}
                          {season.episodes && season.episodes.length > 0 && (
                            <Box mt={2} pl={4}>
                              <Text fontSize="sm" fontWeight="medium" mb={1}>
                                Épisodes:
                              </Text>
                              <VStack align="stretch" spacing={1}>
                                {season.episodes.map((episode) => (
                                  <HStack
                                    key={episode.id}
                                    fontSize="sm"
                                    spacing={3}
                                  >
                                    <Text fontWeight="bold" minW="100px">
                                      {episode.title}
                                    </Text>
                                    <Tag size="sm" colorScheme="blue">
                                      {episode.duration} min
                                    </Tag>
                                    {episode.videoPath && (
                                      <Badge colorScheme="green">
                                        Vidéo disponible
                                      </Badge>
                                    )}
                                  </HStack>
                                ))}
                              </VStack>
                            </Box>
                          )}

                          {/* Boutons d'action pour cette saison */}
                          <HStack mt={2} spacing={2} justifyContent="flex-end">
                            <Button
                              size="xs"
                              colorScheme="teal"
                              leftIcon={<FiVideo />}
                              onClick={() =>
                                handleShowAddEpisodeForm(season.id)
                              }
                            >
                              Ajouter un épisode
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="blue"
                              variant="outline"
                            >
                              Modifier
                            </Button>
                            <Button
                              size="xs"
                              colorScheme="red"
                              variant="outline"
                            >
                              Supprimer
                            </Button>
                          </HStack>
                        </Box>
                      ))}
                  </VStack>
                ) : (
                  <Box p={4} bg="gray.700" borderRadius="md" textAlign="center">
                    <Text>
                      Aucune saison n'a encore été ajoutée à cette série.
                    </Text>
                  </Box>
                )}
              </Box>

              {/* Formulaire pour ajouter un épisode lorsqu'une saison est sélectionnée */}
              {showAddEpisodeForm && selectedSeasonForEpisode && (
                <Box mt={5} mb={6} p={4} bg="gray.700" borderRadius="md">
                  <Heading as="h4" size="sm" mb={3}>
                    Ajouter un épisode
                  </Heading>
                  <Text fontSize="sm" mb={4}>
                    Saison:{" "}
                    {content.serie?.seasons?.find(
                      (s) => s.id === selectedSeasonForEpisode
                    )?.number || "-"}
                  </Text>

                  <FormControl mb={3} isRequired>
                    <FormLabel>Titre de l'épisode</FormLabel>
                    <Input
                      name="title"
                      value={newEpisode.title}
                      onChange={handleEpisodeInputChange}
                      placeholder="Ex: Épisode 1 - Le commencement"
                      bg="gray.600"
                      border="none"
                    />
                  </FormControl>

                  <HStack spacing={4} mb={3}>
                    <FormControl isRequired flex="1">
                      <FormLabel>Durée (minutes)</FormLabel>
                      <NumberInput
                        min={1}
                        value={newEpisode.duration}
                        onChange={handleEpisodeDurationChange}
                        bg="gray.600"
                        borderRadius="md"
                      >
                        <NumberInputField placeholder="Ex: 25" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>

                    <FormControl flex="1">
                      <FormLabel>Numéro d'épisode</FormLabel>
                      <NumberInput
                        min={1}
                        value={newEpisode.number}
                        onChange={handleEpisodeNumberChange}
                        bg="gray.600"
                        borderRadius="md"
                      >
                        <NumberInputField placeholder="Ex: 1" />
                        <NumberInputStepper>
                          <NumberIncrementStepper />
                          <NumberDecrementStepper />
                        </NumberInputStepper>
                      </NumberInput>
                    </FormControl>
                  </HStack>

                  <FormControl mb={4} isRequired>
                    <FormLabel>Vidéo</FormLabel>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleEpisodeVideoUpload}
                      bg="gray.600"
                      border="none"
                      height="auto"
                      py={1}
                    />
                    <FormHelperText>
                      Formats acceptés: MP4, WebM (max 1 Go)
                    </FormHelperText>
                  </FormControl>

                  {newEpisode.videoPath && (
                    <Text fontSize="sm" color="green.300" mb={4}>
                      Vidéo uploadée: {newEpisode.videoPath}
                    </Text>
                  )}

                  <HStack spacing={3} justifyContent="flex-end">
                    <Button
                      colorScheme="gray"
                      onClick={() => {
                        setShowAddEpisodeForm(false);
                        setSelectedSeasonForEpisode(null);
                      }}
                    >
                      Annuler
                    </Button>
                    <Button
                      colorScheme="teal"
                      leftIcon={<FiCheck />}
                      onClick={handleAddEpisode}
                      isLoading={isAddingEpisode}
                      loadingText="Ajout en cours..."
                      isDisabled={
                        !newEpisode.title ||
                        newEpisode.duration <= 0 ||
                        !newEpisode.videoPath
                      }
                    >
                      Ajouter l'épisode
                    </Button>
                  </HStack>
                </Box>
              )}

              {/* Formulaire pour ajouter une nouvelle saison */}
              {!showAddEpisodeForm && (
                <Box mt={6}>
                  <Flex align="center" mb={4}>
                    <Divider flex="1" />
                    <Text px={3} fontWeight="medium">
                      Ajouter une nouvelle saison
                    </Text>
                    <Divider flex="1" />
                  </Flex>

                  <FormControl mb={3}>
                    <FormLabel>Numéro de saison</FormLabel>
                    <NumberInput
                      min={1}
                      value={newSeason.number}
                      onChange={handleSeasonNumberChange}
                      bg="gray.700"
                      borderRadius="md"
                    >
                      <NumberInputField placeholder="Ex: 1" />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>Titre de la saison (optionnel)</FormLabel>
                    <Input
                      name="title"
                      value={newSeason.title}
                      onChange={handleSeasonInputChange}
                      placeholder="Ex: Première saison"
                      bg="gray.700"
                      border="none"
                    />
                  </FormControl>

                  <Button
                    colorScheme="purple"
                    leftIcon={<FiCheck />}
                    width="100%"
                    onClick={handleAddSeason}
                    isLoading={isAddingSeason}
                    loadingText="Ajout en cours..."
                    isDisabled={!content.serie?.id}
                    title={
                      !content.serie?.id
                        ? "Impossible d'ajouter une saison car la série n'est pas correctement initialisée"
                        : "Ajouter une nouvelle saison"
                    }
                  >
                    {content.serie?.id
                      ? "Ajouter la saison"
                      : "Erreur: Série non initialisée correctement"}
                  </Button>

                  {!content.serie?.id && (
                    <Text mt={2} fontSize="sm" color="red.300">
                      La série n'est pas correctement initialisée. Essayez de
                      rafraîchir la page ou contactez l'administrateur.
                    </Text>
                  )}
                </Box>
              )}
            </Box>
          )}

          {activeTab === "actions" && (
            <Box mt={4}>
              <Text fontWeight="bold" mb={2}>
                Actions
              </Text>
              {!content.isApproved ? (
                <>
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<FiCheck />}
                      colorScheme="green"
                      size="sm"
                      onClick={handleApprove}
                    >
                      Approuver
                    </Button>
                    <Button
                      leftIcon={<FiX />}
                      colorScheme="red"
                      size="sm"
                      onClick={() =>
                        document.getElementById("rejection-reason")?.focus()
                      }
                    >
                      Rejeter
                    </Button>
                  </HStack>

                  <FormControl mt={4}>
                    <FormLabel>Raison du rejet</FormLabel>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi ce contenu est rejeté..."
                      bg="gray.700"
                      border="none"
                    />
                  </FormControl>

                  <Button
                    colorScheme="red"
                    mt={3}
                    size="sm"
                    isDisabled={!rejectionReason.trim()}
                    onClick={handleReject}
                  >
                    Confirmer le rejet
                  </Button>
                </>
              ) : (
                <>
                  <HStack spacing={4}>
                    <Button
                      leftIcon={<FiX />}
                      colorScheme="red"
                      size="sm"
                      onClick={() =>
                        document.getElementById("rejection-reason")?.focus()
                      }
                    >
                      Rejeter
                    </Button>
                  </HStack>

                  <FormControl mt={4}>
                    <FormLabel>Raison du rejet</FormLabel>
                    <Textarea
                      id="rejection-reason"
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi ce contenu est rejeté..."
                      bg="gray.700"
                      border="none"
                    />
                  </FormControl>

                  <Button
                    colorScheme="red"
                    mt={3}
                    size="sm"
                    isDisabled={!rejectionReason.trim()}
                    onClick={handleReject}
                  >
                    Confirmer le rejet
                  </Button>
                </>
              )}
            </Box>
          )}
        </ModalBody>
        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={onClose}>
            Fermer
          </Button>
          {activeTab === "info" && hasVideo && (
            <Button
              colorScheme="red"
              onClick={() => setActiveTab("video")}
              leftIcon={<Box as="span">▶</Box>}
            >
              Voir la vidéo
            </Button>
          )}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Modal de confirmation de suppression
interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: Content | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

function DeleteConfirmationModal({
  isOpen,
  onClose,
  content,
  onConfirm,
  isDeleting,
}: DeleteConfirmationModalProps) {
  if (!content) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent bg="gray.800" color="white">
        <ModalHeader>Confirmer la suppression</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text>
            Êtes-vous sûr de vouloir supprimer le contenu "{content.title}" ?
          </Text>
          <Text mt={2} color="red.300">
            Cette action est irréversible.
          </Text>
        </ModalBody>
        <ModalFooter>
          <Button variant="ghost" mr={3} onClick={onClose}>
            Annuler
          </Button>
          <Button
            colorScheme="red"
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText="Suppression..."
          >
            Supprimer
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

// Composant principal
export default function AdminContentsTable() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    type: "",
    status: "",
  });

  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const {
    isOpen: isDeleteModalOpen,
    onOpen: onOpenDeleteModal,
    onClose: onCloseDeleteModal,
  } = useDisclosure();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Afficher une notification concernant le problème de création des séries
  useEffect(() => {


    toast({
      title: "Nouvelle fonctionnalité",
      description:
        "Cliquez sur le titre d'une série dans la liste pour accéder à l'interface d'ajout de saisons et d'épisodes.",
      status: "success",
      duration: 10000,
      isClosable: true,
      position: "top",
    });
  }, [toast]);

  // Fonction pour charger les contenus
  const fetchContents = async () => {
    setLoading(true);

    try {
      // Appel à l'API admin/contents
      const response = await fetch("/api/admin/contents");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors du chargement des contenus"
        );
      }

      const data = await response.json();
      setContents(data.contents);
      setError("");
    } catch (err) {
      console.error("Erreur lors du chargement des contenus:", err);
      setError("Impossible de charger les contenus");
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors du chargement des contenus",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  // Charger les contenus au chargement du composant
  useEffect(() => {
    fetchContents();
  }, []);

  // Fonction de recherche
  const handleSearch = () => {
    // La recherche se fait déjà côté client avec les filtres
  };

  // Fonction de suppression d'un contenu
  const handleDelete = async () => {
    if (!selectedContent) return;

    setIsDeleting(true);

    try {
      const response = await fetch(
        `/api/admin/contents/${selectedContent.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la suppression du contenu"
        );
      }

      setContents(contents.filter((c) => c.id !== selectedContent.id));

      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onCloseDeleteModal();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de la suppression",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // Fonction pour approuver un contenu
  const handleApprove = async (content: Content) => {
    try {
      const response = await fetch(`/api/admin/contents/${content.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: true,
          rejectionReason: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de l'approbation du contenu"
        );
      }

      // Mettre à jour l'état local
      setContents(
        contents.map((c) =>
          c.id === content.id
            ? { ...c, isApproved: true, rejectionReason: null }
            : c
        )
      );

      toast({
        title: "Contenu approuvé",
        description: "Le contenu a été approuvé avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors de l'approbation",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fonction pour rejeter un contenu
  const handleReject = async (content: Content, reason: string) => {
    if (!reason.trim()) {
      toast({
        title: "Raison requise",
        description: "Veuillez fournir une raison pour le rejet",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      const response = await fetch(`/api/admin/contents/${content.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isApproved: false,
          rejectionReason: reason,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors du rejet du contenu");
      }

      // Mettre à jour l'état local
      setContents(
        contents.map((c) =>
          c.id === content.id
            ? { ...c, isApproved: false, rejectionReason: reason }
            : c
        )
      );

      toast({
        title: "Contenu rejeté",
        description: "Le contenu a été rejeté avec succès",
        status: "info",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Une erreur est survenue lors du rejet",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Fonction pour ouvrir le modal de détails
  const openDetails = async (content: Content) => {
    try {
      // Récupérer les données complètes du contenu avant d'ouvrir le modal
      const response = await fetch(`/api/admin/contents/${content.id}`);

      if (response.ok) {
        const fullContent = await response.json();
        setSelectedContent(fullContent);
      } else {
        // En cas d'erreur, utiliser les données existantes
        setSelectedContent(content);
        toast({
          title: "Attention",
          description: "Impossible de charger les détails complets du contenu",
          status: "warning",
          duration: 3000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Erreur lors du chargement des détails:", error);
      setSelectedContent(content);
    }

    onOpen();
  };

  // Fonction pour ouvrir le modal de confirmation de suppression
  const openDeleteConfirmation = (content: Content) => {
    setSelectedContent(content);
    onOpenDeleteModal();
  };

  // Filtrer les contenus en fonction des critères de recherche
  const filteredContents = contents
    .filter(
      (content) =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.creator.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (content) =>
        (filter.type === "" || content.type === filter.type) &&
        (filter.status === "" ||
          (filter.status === "approved" && content.isApproved) ||
          (filter.status === "pending" && !content.isApproved))
    );

  // Formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Afficher un spinner pendant le chargement
  if (loading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="lg" color="red.500" thickness="3px" />
      </Flex>
    );
  }

  // Afficher un message d'erreur si nécessaire
  if (error) {
    return (
      <Box p={4} borderRadius="md" bg="red.500" color="white">
        <Text>{error}</Text>
      </Box>
    );
  }

  // Bordure et couleur de fond pour les lignes du tableau
  const borderColor = "gray.700";
  const hoverBg = "gray.700";

  return (
    <Box>
      {/* Section de filtres */}
      <Box mb={6} bg="gray.800" p={4} borderRadius="md">
        <Flex
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
          mb={{ base: 4, md: 0 }}
          gap={3}
        >
          <Box maxW="400px">
            <Flex>
              <Input
                placeholder="Rechercher un contenu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                bg="gray.700"
                border="none"
                _focus={{ boxShadow: "outline" }}
                title="Rechercher un contenu"
              />
              <IconButton
                aria-label="Rechercher"
                icon={<FiSearch />}
                ml={2}
                colorScheme="blue"
                onClick={handleSearch}
              />
            </Flex>
          </Box>

          <HStack spacing={2}>
            <Box>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="content-type" mb={0} fontSize="sm" mr={2}>
                  Type:
                </FormLabel>
                <Select
                  id="content-type"
                  size="sm"
                  value={filter.type}
                  onChange={(e) =>
                    setFilter({ ...filter, type: e.target.value })
                  }
                  bg="gray.700"
                  border="none"
                  w="auto"
                  title="Filtrer par type"
                >
                  <option value="">Tous</option>
                  <option value="FILM">Films</option>
                  <option value="SERIE">Séries</option>
                </Select>
              </FormControl>
            </Box>

            <Box>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="content-status" mb={0} fontSize="sm" mr={2}>
                  Statut:
                </FormLabel>
                <Select
                  id="content-status"
                  size="sm"
                  value={filter.status}
                  onChange={(e) =>
                    setFilter({ ...filter, status: e.target.value })
                  }
                  bg="gray.700"
                  border="none"
                  w="auto"
                  title="Filtrer par statut"
                >
                  <option value="">Tous</option>
                  <option value="approved">Approuvés</option>
                  <option value="pending">En attente</option>
                </Select>
              </FormControl>
            </Box>

            <Button
              size="sm"
              colorScheme="red"
              leftIcon={<FiFilter />}
              onClick={() => setFilter({ type: "", status: "" })}
              isDisabled={filter.type === "" && filter.status === ""}
              title="Réinitialiser les filtres"
            >
              Réinitialiser
            </Button>
          </HStack>
        </Flex>
      </Box>

      {/* Tableau des contenus */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr bg="gray.700">
              <Th color="gray.300" borderColor={borderColor}>
                Titre
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Type
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Prix
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Statut
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Date
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Créateur
              </Th>
              <Th color="gray.300" borderColor={borderColor} textAlign="right">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredContents.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10} color="gray.400">
                  <Flex direction="column" align="center">
                    <Box fontSize="xl" mb={3}>
                      Aucun contenu trouvé
                    </Box>
                    <Text>
                      Essayez d'ajuster vos filtres ou de créer un nouveau
                      contenu
                    </Text>
                  </Flex>
                </Td>
              </Tr>
            ) : (
              filteredContents.map((content) => (
                <Tr
                  key={content.id}
                  _hover={{ bg: hoverBg }}
                  transition="background 0.2s"
                  cursor="pointer"
                >
                  <Td borderColor={borderColor} fontWeight="medium">
                    <Text
                      cursor="pointer"
                      _hover={{ textDecoration: "underline" }}
                      onClick={() => openDetails(content)}
                    >
                      {content.title}
                    </Text>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Tag
                      size="sm"
                      colorScheme={content.type === "FILM" ? "red" : "purple"}
                      borderRadius="full"
                    >
                      {content.type === "FILM" ? "Film" : "Série"}
                    </Tag>
                  </Td>
                  <Td borderColor={borderColor}>
                    {content.price ? (
                      <HStack>
                        <FiDollarSign />
                        <Text>{content.price.toFixed(2)} €</Text>
                      </HStack>
                    ) : (
                      <Text color="gray.400">Gratuit</Text>
                    )}
                  </Td>
                  <Td borderColor={borderColor}>
                    {content.isApproved ? (
                      <Badge colorScheme="green">Approuvé</Badge>
                    ) : (
                      <Badge colorScheme="yellow">En attente</Badge>
                    )}
                  </Td>
                  <Td borderColor={borderColor} fontSize="sm" color="gray.300">
                    {formatDate(content.createdAt)}
                  </Td>
                  <Td borderColor={borderColor}>
                    <HStack>
                      <FiUser />
                      <Text fontSize="sm">{content.creator.email}</Text>
                    </HStack>
                  </Td>
                  <Td borderColor={borderColor} textAlign="right">
                    <HStack spacing={1} justifyContent="flex-end">
                      <Tooltip label="Voir les détails" placement="top">
                        <IconButton
                          aria-label="Voir les détails"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => openDetails(content)}
                        />
                      </Tooltip>

                      {!content.isApproved && (
                        <Tooltip label="Approuver" placement="top">
                          <IconButton
                            aria-label="Approuver"
                            icon={<FiCheck />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => handleApprove(content)}
                          />
                        </Tooltip>
                      )}

                      {content.isApproved && (
                        <Tooltip label="Rejeter" placement="top">
                          <IconButton
                            aria-label="Rejeter"
                            icon={<FiX />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => {
                              setSelectedContent(content);
                              onOpen();
                              setTimeout(() => {
                                const actionsTab = document.querySelector(
                                  '[data-tab="actions"]'
                                );
                                if (actionsTab) {
                                  (actionsTab as HTMLButtonElement).click();
                                }
                              }, 100);
                            }}
                          />
                        </Tooltip>
                      )}

                      <Tooltip label="Voir la vidéo" placement="top">
                        <IconButton
                          aria-label="Voir la vidéo"
                          icon={<FiPlay />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          isDisabled={
                            !(
                              (content.type === "FILM" &&
                                content.film?.videoPath) ||
                              (content.type === "SERIE" &&
                                content.serie?.seasons &&
                                content.serie.seasons.length > 0 &&
                                content.serie.seasons.some(
                                  (season) =>
                                    season.episodes &&
                                    season.episodes.length > 0
                                ))
                            )
                          }
                          onClick={() => {
                            setSelectedContent(content);
                            onOpen();
                            setTimeout(() => {
                              const videoTab =
                                document.querySelector('[data-tab="video"]');
                              if (videoTab) {
                                (videoTab as HTMLButtonElement).click();
                              }
                            }, 100);
                          }}
                        />
                      </Tooltip>

                      <Tooltip label="Supprimer" placement="top">
                        <IconButton
                          aria-label="Supprimer"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => openDeleteConfirmation(content)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de détails / approbation / rejet */}
      <ContentDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        content={selectedContent}
        onApprove={handleApprove}
        onReject={handleReject}
      />

      {/* Modal de confirmation de suppression */}
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={onCloseDeleteModal}
        content={selectedContent}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
      />
    </Box>
  );
}
