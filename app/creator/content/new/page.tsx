"use client";

import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Container,
  Box,
  Heading,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Button,
  Select,
  VStack,
  HStack,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useToast,
  Text,
  FormHelperText,
  Badge,
  Flex,
  Divider,
  IconButton,
  InputGroup,
  InputRightAddon,
  useColorModeValue,
  Image,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Stack,
  Icon,
} from "@chakra-ui/react";
import {
  AddIcon,
  CloseIcon,
  DeleteIcon,
  WarningTwoIcon,
} from "@chakra-ui/icons";
import { motion } from "framer-motion";
import { FiFilm, FiTv, FiUpload, FiImage, FiClock } from "react-icons/fi";

// Wrapper pour ajouter les animations framer-motion aux composants Chakra
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionContainer = motion(Container);

export default function NewContent() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const inputFileRef = useRef<HTMLInputElement>(null);
  const episodeFileRef = useRef<HTMLInputElement>(null);
  const videoFileRef = useRef<HTMLInputElement>(null);
  const episodeThumbnailRef = useRef<HTMLInputElement>(null);

  const initialType = searchParams.get("type") === "serie" ? "SERIE" : "FILM";

  // Styles
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue(
    "linear(to-r, red.500, pink.500)",
    "linear(to-r, red.500, pink.500)"
  );
  const secondaryBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = "red.500";
  const inputBg = useColorModeValue("white", "gray.700");

  // État général du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: initialType,
    price: "",
    genre: "",
    director: "",
    year: new Date().getFullYear().toString(),
    country: "",
    language: "",
    cast: "",
    thumbnail: "",
    thumbnailPreview: "",
  });

  // État pour les films
  const [filmData, setFilmData] = useState({
    duration: "",
    videoPath: "",
  });

  // État pour les séries
  const [seasons, setSeasons] = useState([
    {
      number: 1,
      title: "Saison 1",
      episodes: [
        {
          number: 1,
          title: "Épisode 1",
          description: "",
          duration: "",
          videoPath: "",
          thumbnail: "",
          thumbnailPreview: "",
        },
      ],
    },
  ]);

  // État de soumission
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // État pour suivre la progression de l'upload
  const [uploadProgress, setUploadProgress] = useState({
    thumbnail: 0,
    video: 0,
    episodeThumbnail: { seasonIndex: -1, episodeIndex: -1, progress: 0 },
    episodeVideo: { seasonIndex: -1, episodeIndex: -1, progress: 0 },
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    } else if (
      status === "authenticated" &&
      session?.user?.role !== "CREATOR"
    ) {
      router.push("/dashboard");
    }
  }, [session, status, router]);

  // Gestion des changements dans le formulaire principal
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Gestion des changements pour les films
  const handleFilmChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilmData((prev) => ({ ...prev, [name]: value }));
  };

  // Fonction utilitaire pour réinitialiser la progression après un délai
  const resetProgressAfterDelay = (
    type: string,
    seasonIndex = -1,
    episodeIndex = -1
  ) => {
    setTimeout(() => {
      if (type === "thumbnail") {
        setUploadProgress((prev) => ({ ...prev, thumbnail: 0 }));
      } else if (type === "video") {
        setUploadProgress((prev) => ({ ...prev, video: 0 }));
      } else if (type === "episodeThumbnail") {
        setUploadProgress((prev) => ({
          ...prev,
          episodeThumbnail: { seasonIndex: -1, episodeIndex: -1, progress: 0 },
        }));
      } else if (type === "episodeVideo") {
        setUploadProgress((prev) => ({
          ...prev,
          episodeVideo: { seasonIndex: -1, episodeIndex: -1, progress: 0 },
        }));
      }
    }, 1500);
  };

  // Modification de la fonction d'upload de miniature
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "thumbnails");

      // Création d'un XMLHttpRequest pour suivre la progression
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prev) => ({ ...prev, thumbnail: progress }));
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);

            setFormData((prev) => ({
              ...prev,
              thumbnail: data.filePath,
              thumbnailPreview: URL.createObjectURL(file),
            }));

            toast({
              title: "Upload réussi",
              description: "L'image a été uploadée avec succès",
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            resetProgressAfterDelay("thumbnail");
          } catch (error) {
            console.error("Erreur de parsing JSON:", error);
            toast({
              title: "Erreur d'upload",
              description: "Le serveur a répondu avec un format invalide",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            setUploadProgress((prev) => ({ ...prev, thumbnail: 0 }));
          }
        } else {
          // Essayer d'extraire des détails d'erreur de la réponse
          let errorMessage = "Erreur lors de l'upload";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch (e) {
            // Si le parsing échoue, utiliser le message par défaut
          }

          console.error(`Erreur HTTP ${xhr.status}: ${errorMessage}`);
          toast({
            title: `Erreur d'upload (${xhr.status})`,
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setUploadProgress((prev) => ({ ...prev, thumbnail: 0 }));
        }
      };

      xhr.onerror = function () {
        console.error("Erreur réseau lors de l'upload");
        toast({
          title: "Erreur de connexion",
          description:
            "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setUploadProgress((prev) => ({ ...prev, thumbnail: 0 }));
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader l'image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUploadProgress((prev) => ({ ...prev, thumbnail: 0 }));
    }
  };

  // Modification de la fonction d'upload de vidéo
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "videos");

      // Création d'un XMLHttpRequest pour suivre la progression
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress((prev) => ({ ...prev, video: progress }));
        }
      };

      xhr.onload = function () {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);

            setFilmData((prev) => ({
              ...prev,
              videoPath: data.filePath,
            }));

            toast({
              title: "Upload réussi",
              description: "La vidéo a été uploadée avec succès",
              status: "success",
              duration: 3000,
              isClosable: true,
            });

            resetProgressAfterDelay("video");
          } catch (error) {
            console.error("Erreur de parsing JSON:", error);
            toast({
              title: "Erreur d'upload",
              description: "Le serveur a répondu avec un format invalide",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            setUploadProgress((prev) => ({ ...prev, video: 0 }));
          }
        } else {
          // Essayer d'extraire des détails d'erreur de la réponse
          let errorMessage = "Erreur lors de l'upload";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch (e) {
            // Si le parsing échoue, utiliser le message par défaut
          }

          console.error(`Erreur HTTP ${xhr.status}: ${errorMessage}`);
          toast({
            title: `Erreur d'upload (${xhr.status})`,
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setUploadProgress((prev) => ({ ...prev, video: 0 }));
        }
      };

      xhr.onerror = function () {
        console.error("Erreur réseau lors de l'upload");
        toast({
          title: "Erreur de connexion",
          description:
            "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setUploadProgress((prev) => ({ ...prev, video: 0 }));
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader la vidéo",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUploadProgress((prev) => ({ ...prev, video: 0 }));
    }
  };

  // Gestion des saisons
  const addSeason = () => {
    const nextSeasonNumber = seasons.length + 1;
    setSeasons([
      ...seasons,
      {
        number: nextSeasonNumber,
        title: `Saison ${nextSeasonNumber}`,
        episodes: [
          {
            number: 1,
            title: "Épisode 1",
            description: "",
            duration: "",
            videoPath: "",
            thumbnail: "",
            thumbnailPreview: "",
          },
        ],
      },
    ]);
  };

  const removeSeason = (seasonIndex: number) => {
    if (seasons.length <= 1) {
      toast({
        title: "Impossible",
        description: "Une série doit avoir au moins une saison",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newSeasons = [...seasons];
    newSeasons.splice(seasonIndex, 1);

    // Renuméroter les saisons
    const reorderedSeasons = newSeasons.map((season, idx) => ({
      ...season,
      number: idx + 1,
      title: `Saison ${idx + 1}`,
    }));

    setSeasons(reorderedSeasons);
  };

  const handleSeasonChange = (
    seasonIndex: number,
    field: string,
    value: string
  ) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex] = {
      ...newSeasons[seasonIndex],
      [field]: value,
    };
    setSeasons(newSeasons);
  };

  // Gestion des épisodes
  const addEpisode = (seasonIndex: number) => {
    const newSeasons = [...seasons];
    const nextEpisodeNumber = newSeasons[seasonIndex].episodes.length + 1;

    newSeasons[seasonIndex].episodes.push({
      number: nextEpisodeNumber,
      title: `Épisode ${nextEpisodeNumber}`,
      description: "",
      duration: "",
      videoPath: "",
      thumbnail: "",
      thumbnailPreview: "",
    });

    setSeasons(newSeasons);
  };

  const removeEpisode = (seasonIndex: number, episodeIndex: number) => {
    if (seasons[seasonIndex].episodes.length <= 1) {
      toast({
        title: "Impossible",
        description: "Une saison doit avoir au moins un épisode",
        status: "warning",
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes.splice(episodeIndex, 1);

    // Renuméroter les épisodes
    newSeasons[seasonIndex].episodes = newSeasons[seasonIndex].episodes.map(
      (episode, idx) => ({
        ...episode,
        number: idx + 1,
        title:
          episode.title === `Épisode ${episodeIndex + 1}`
            ? `Épisode ${idx + 1}`
            : episode.title,
      })
    );

    setSeasons(newSeasons);
  };

  const handleEpisodeChange = (
    seasonIndex: number,
    episodeIndex: number,
    field: string,
    value: string
  ) => {
    const newSeasons = [...seasons];
    newSeasons[seasonIndex].episodes[episodeIndex] = {
      ...newSeasons[seasonIndex].episodes[episodeIndex],
      [field]: value,
    };
    setSeasons(newSeasons);
  };

  // Modification de la fonction d'upload de vidéo pour épisode
  const handleEpisodeVideoUpload = async (
    seasonIndex: number,
    episodeIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "videos");

      // Mise à jour de l'état pour suivre cet épisode spécifique
      setUploadProgress(prev => ({ 
        ...prev, 
        episodeVideo: { seasonIndex, episodeIndex, progress: 0 } 
      }));

      // Création d'un XMLHttpRequest pour suivre la progression
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ 
            ...prev, 
            episodeVideo: { ...prev.episodeVideo, progress }
          }));
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            
            const newSeasons = [...seasons];
            newSeasons[seasonIndex].episodes[episodeIndex].videoPath = data.filePath;
            setSeasons(newSeasons);

            toast({
              title: "Upload réussi",
              description: "La vidéo a été uploadée avec succès",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            
            resetProgressAfterDelay('episodeVideo', seasonIndex, episodeIndex);
          } catch (error) {
            console.error("Erreur de parsing JSON:", error);
            toast({
              title: "Erreur d'upload",
              description: "Le serveur a répondu avec un format invalide",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            setUploadProgress(prev => ({ 
              ...prev, 
              episodeVideo: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
            }));
          }
        } else {
          // Essayer d'extraire des détails d'erreur de la réponse
          let errorMessage = "Erreur lors de l'upload";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch (e) {
            // Si le parsing échoue, utiliser le message par défaut
          }
          
          console.error(`Erreur HTTP ${xhr.status}: ${errorMessage}`);
          toast({
            title: `Erreur d'upload (${xhr.status})`,
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setUploadProgress(prev => ({ 
            ...prev, 
            episodeVideo: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
          }));
        }
      };

      xhr.onerror = function() {
        console.error("Erreur réseau lors de l'upload");
        toast({
          title: "Erreur de connexion",
          description: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setUploadProgress(prev => ({ 
          ...prev, 
          episodeVideo: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
        }));
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader la vidéo",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUploadProgress(prev => ({ 
        ...prev, 
        episodeVideo: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
      }));
    }
  };

  // Modification de la fonction d'upload de miniature pour épisode
  const handleEpisodeThumbnailUpload = async (
    seasonIndex: number,
    episodeIndex: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "thumbnails");

      // Mise à jour de l'état pour suivre cet épisode spécifique
      setUploadProgress(prev => ({ 
        ...prev, 
        episodeThumbnail: { seasonIndex, episodeIndex, progress: 0 } 
      }));

      // Création d'un XMLHttpRequest pour suivre la progression
      const xhr = new XMLHttpRequest();
      xhr.open("POST", "/api/upload", true);
      
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          setUploadProgress(prev => ({ 
            ...prev, 
            episodeThumbnail: { ...prev.episodeThumbnail, progress }
          }));
        }
      };

      xhr.onload = function() {
        if (xhr.status === 200) {
          try {
            const data = JSON.parse(xhr.responseText);
            
            const newSeasons = [...seasons];
            newSeasons[seasonIndex].episodes[episodeIndex].thumbnail = data.filePath;
            newSeasons[seasonIndex].episodes[episodeIndex].thumbnailPreview = URL.createObjectURL(file);
            setSeasons(newSeasons);

            toast({
              title: "Upload réussi",
              description: "L'image a été uploadée avec succès",
              status: "success",
              duration: 3000,
              isClosable: true,
            });
            
            resetProgressAfterDelay('episodeThumbnail', seasonIndex, episodeIndex);
          } catch (error) {
            console.error("Erreur de parsing JSON:", error);
            toast({
              title: "Erreur d'upload",
              description: "Le serveur a répondu avec un format invalide",
              status: "error",
              duration: 5000,
              isClosable: true,
            });
            setUploadProgress(prev => ({ 
              ...prev, 
              episodeThumbnail: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
            }));
          }
        } else {
          // Essayer d'extraire des détails d'erreur de la réponse
          let errorMessage = "Erreur lors de l'upload";
          try {
            const errorResponse = JSON.parse(xhr.responseText);
            errorMessage = errorResponse.error || errorMessage;
          } catch (e) {
            // Si le parsing échoue, utiliser le message par défaut
          }
          
          console.error(`Erreur HTTP ${xhr.status}: ${errorMessage}`);
          toast({
            title: `Erreur d'upload (${xhr.status})`,
            description: errorMessage,
            status: "error",
            duration: 5000,
            isClosable: true,
          });
          setUploadProgress(prev => ({ 
            ...prev, 
            episodeThumbnail: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
          }));
        }
      };

      xhr.onerror = function() {
        console.error("Erreur réseau lors de l'upload");
        toast({
          title: "Erreur de connexion",
          description: "Impossible de contacter le serveur. Vérifiez votre connexion internet.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
        setUploadProgress(prev => ({ 
          ...prev, 
          episodeThumbnail: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
        }));
      };

      xhr.send(formData);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'uploader l'image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setUploadProgress(prev => ({ 
        ...prev, 
        episodeThumbnail: { seasonIndex: -1, episodeIndex: -1, progress: 0 } 
      }));
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    // Validation des champs communs
    if (!formData.title) newErrors.title = "Le titre est requis";
    if (!formData.description)
      newErrors.description = "La description est requise";
    if (!formData.thumbnail) newErrors.thumbnail = "La miniature est requise";
    if (formData.price && isNaN(Number(formData.price)))
      newErrors.price = "Le prix doit être un nombre";

    // Validation spécifique par type
    if (formData.type === "FILM") {
      if (!filmData.duration) newErrors.duration = "La durée est requise";
      if (!filmData.videoPath) newErrors.videoPath = "La vidéo est requise";
    } else if (formData.type === "SERIE") {
      let hasEpisodeErrors = false;

      seasons.forEach((season, seasonIdx) => {
        if (!season.title) {
          newErrors[`season_${seasonIdx}_title`] =
            "Le titre de la saison est requis";
        }

        season.episodes.forEach((episode, episodeIdx) => {
          if (!episode.title) {
            hasEpisodeErrors = true;
            newErrors[`season_${seasonIdx}_episode_${episodeIdx}_title`] =
              "Le titre de l'épisode est requis";
          }
          if (!episode.duration) {
            hasEpisodeErrors = true;
            newErrors[`season_${seasonIdx}_episode_${episodeIdx}_duration`] =
              "La durée est requise";
          }
          if (!episode.videoPath) {
            hasEpisodeErrors = true;
            newErrors[`season_${seasonIdx}_episode_${episodeIdx}_videoPath`] =
              "La vidéo est requise";
          }
        });
      });

      if (hasEpisodeErrors) {
        newErrors.episodes =
          "Certains épisodes ont des informations manquantes";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      toast({
        title: "Erreur de validation",
        description: "Veuillez corriger les erreurs dans le formulaire",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        type: formData.type,
        price: formData.price ? parseFloat(formData.price) : null,
        ...(formData.type === "FILM" && {
          duration: filmData.duration,
          videoPath: filmData.videoPath,
        }),
        ...(formData.type === "SERIE" && { seasons }),
      };

      const response = await fetch("/api/creator/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erreur lors de la soumission");
      }

      const data = await response.json();

      toast({
        title: "Succès",
        description:
          "Votre contenu a été soumis avec succès et est en attente d'approbation",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push("/creator/content");
    } catch (error: any) {
      console.error("Erreur de soumission:", error);
      toast({
        title: "Erreur",
        description:
          error.message || "Une erreur est survenue lors de la soumission",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Rendu
  return (
    <MotionContainer
      maxW="container.xl"
      py={8}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* En-tête */}
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={8}
      >
        <Box
          position="relative"
          borderRadius="xl"
          overflow="hidden"
          mb={8}
          height="200px"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            bgGradient={headerBg}
            zIndex={0}
          />
          <Flex
            direction="column"
            justify="center"
            align="center"
            height="100%"
            position="relative"
            zIndex={1}
            textAlign="center"
            px={4}
          >
            <Heading
              color="white"
              fontSize={{ base: "3xl", md: "4xl" }}
              fontWeight="bold"
              mb={2}
            >
              Créer votre Nouveau Contenu
            </Heading>
            <Text color="white" fontSize="lg" maxW="container.md" mb={5}>
              Partagez vos films et séries avec le monde entier
            </Text>
            <Flex gap={4}>
              <Badge
                px={4}
                py={2}
                borderRadius="full"
                fontSize="md"
                bg="white"
                color={formData.type === "FILM" ? "blue.500" : "purple.500"}
              >
                <Flex align="center">
                  <Icon as={formData.type === "FILM" ? FiFilm : FiTv} mr={2} />
                  {formData.type === "FILM" ? "Film" : "Série"}
                </Flex>
              </Badge>
            </Flex>
          </Flex>
        </Box>
      </MotionBox>

      <MotionBox
        as="form"
        onSubmit={handleSubmit}
        bg={bgColor}
        p={8}
        borderRadius="xl"
        shadow="lg"
        borderColor={borderColor}
        borderWidth="1px"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Tabs variant="soft-rounded" colorScheme="red" mb={8}>
          <TabList>
            <Tab
              onClick={() => setFormData((prev) => ({ ...prev, type: "FILM" }))}
              _selected={{ bg: "red.500", color: "white" }}
            >
              <Icon as={FiFilm} mr={2} />
              Film
            </Tab>
            <Tab
              onClick={() =>
                setFormData((prev) => ({ ...prev, type: "SERIE" }))
              }
              _selected={{ bg: "purple.500", color: "white" }}
            >
              <Icon as={FiTv} mr={2} />
              Série
            </Tab>
          </TabList>
        </Tabs>

        <VStack spacing={6} align="stretch">
          <Box>
            <Heading size="md" mb={4}>
              Informations Générales
            </Heading>

            <VStack spacing={4} align="stretch">
              <FormControl isRequired isInvalid={!!errors.title}>
                <FormLabel>Titre</FormLabel>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Titre du contenu"
                  bg={inputBg}
                  size="lg"
                  borderRadius="md"
                />
                {errors.title && (
                  <FormHelperText color="red.500">
                    {errors.title}
                  </FormHelperText>
                )}
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.description}>
                <FormLabel>Description</FormLabel>
                <Textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description du contenu"
                  rows={4}
                  bg={inputBg}
                  size="lg"
                  borderRadius="md"
                />
                {errors.description && (
                  <FormHelperText color="red.500">
                    {errors.description}
                  </FormHelperText>
                )}
              </FormControl>

              <HStack spacing={4}>
                <FormControl isInvalid={!!errors.price} flex={1}>
                  <FormLabel>Prix (FCFA)</FormLabel>
                  <Input
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    placeholder="Prix (laisser vide pour gratuit)"
                    type="number"
                    bg={inputBg}
                    size="lg"
                    borderRadius="md"
                  />
                  {errors.price ? (
                    <FormHelperText color="red.500">
                      {errors.price}
                    </FormHelperText>
                  ) : (
                    <FormHelperText>
                      Laissez vide pour rendre le contenu gratuit
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Genre</FormLabel>
                  <Input
                    name="genre"
                    value={formData.genre}
                    onChange={handleChange}
                    placeholder="Genre (ex: Action, Comédie)"
                    bg={inputBg}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel>Réalisateur</FormLabel>
                  <Input
                    name="director"
                    value={formData.director}
                    onChange={handleChange}
                    placeholder="Nom du réalisateur"
                    bg={inputBg}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Année</FormLabel>
                  <Input
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    placeholder="Année de production"
                    type="number"
                    bg={inputBg}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>
              </HStack>

              <HStack spacing={4}>
                <FormControl flex={1}>
                  <FormLabel>Pays</FormLabel>
                  <Input
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    placeholder="Pays d'origine"
                    bg={inputBg}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>

                <FormControl flex={1}>
                  <FormLabel>Langue</FormLabel>
                  <Input
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    placeholder="Langue principale"
                    bg={inputBg}
                    size="lg"
                    borderRadius="md"
                  />
                </FormControl>
              </HStack>

              <FormControl>
                <FormLabel>Distribution</FormLabel>
                <Input
                  name="cast"
                  value={formData.cast}
                  onChange={handleChange}
                  placeholder="Acteurs principaux, séparés par des virgules"
                  bg={inputBg}
                  size="lg"
                  borderRadius="md"
                />
              </FormControl>

              <FormControl isRequired isInvalid={!!errors.thumbnail}>
                <FormLabel>Miniature</FormLabel>
                <Box
                  borderWidth={1}
                  p={2}
                  borderRadius="md"
                  borderStyle="dashed"
                >
                  <input
                    type="file"
                    accept="image/*"
                    ref={inputFileRef}
                    onChange={handleThumbnailUpload}
                    style={{ display: "none" }}
                    title="Uploader une miniature"
                    aria-label="Uploader une miniature pour le contenu"
                  />
                  {formData.thumbnailPreview ? (
                    <VStack spacing={2}>
                      <Image
                        src={formData.thumbnailPreview}
                        alt="Aperçu"
                        boxSize="150px"
                        objectFit="cover"
                        borderRadius="md"
                      />
                      <Button
                        size="sm"
                        onClick={() => inputFileRef.current?.click()}
                        leftIcon={<FiImage />}
                        colorScheme="blue"
                      >
                        Changer
                      </Button>
                    </VStack>
                  ) : (
                    <Button
                      onClick={() => inputFileRef.current?.click()}
                      leftIcon={<FiUpload />}
                      colorScheme="blue"
                      width="100%"
                      py={10}
                    >
                      Uploader une miniature
                    </Button>
                  )}
                  {uploadProgress.thumbnail > 0 &&
                    uploadProgress.thumbnail < 100 && (
                      <Box mt={2}>
                        <Text fontSize="xs" mb={1}>
                          Upload en cours: {uploadProgress.thumbnail}%
                        </Text>
                        <Box
                          w="100%"
                          bg="gray.200"
                          borderRadius="full"
                          h="4px"
                          overflow="hidden"
                        >
                          <Box
                            w={`${uploadProgress.thumbnail}%`}
                            bg="blue.500"
                            h="100%"
                            borderRadius="full"
                            transition="width 0.3s ease"
                          />
                        </Box>
                      </Box>
                    )}
                </Box>
              </FormControl>
            </VStack>
          </Box>

          <Divider my={6} />

          {/* Section spécifique pour les Films */}
          {formData.type === "FILM" && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Flex align="center" mb={4} bg="blue.50" p={4} borderRadius="md">
                <Icon as={FiFilm} boxSize={5} color="blue.500" mr={3} />
                <Heading size="md" color="blue.700">
                  Informations spécifiques au Film
                </Heading>
              </Flex>

              <VStack
                spacing={6}
                align="stretch"
                p={4}
                bg={secondaryBg}
                borderRadius="md"
              >
                <FormControl isRequired isInvalid={!!errors.duration}>
                  <FormLabel>Durée (minutes)</FormLabel>
                  <InputGroup size="lg">
                    <Input
                      name="duration"
                      value={filmData.duration}
                      onChange={handleFilmChange}
                      placeholder="Durée en minutes"
                      type="number"
                      bg={inputBg}
                      borderRadius="md"
                    />
                    <InputRightAddon children="min" bg="blue.100" />
                  </InputGroup>
                  {errors.duration && (
                    <FormHelperText color="red.500">
                      {errors.duration}
                    </FormHelperText>
                  )}
                </FormControl>

                <FormControl isRequired isInvalid={!!errors.videoPath}>
                  <FormLabel>Fichier Vidéo</FormLabel>
                  <Flex
                    direction="column"
                    gap={2}
                    p={filmData.videoPath ? 4 : 5}
                    border="2px dashed"
                    borderColor={errors.videoPath ? "red.300" : "blue.200"}
                    borderRadius="md"
                    bg={filmData.videoPath ? "blue.50" : secondaryBg}
                    align="center"
                    justify="center"
                    transition="all 0.3s"
                    _hover={
                      !filmData.videoPath
                        ? {
                            borderColor: "blue.400",
                          }
                        : {}
                    }
                  >
                    {filmData.videoPath ? (
                      <Flex
                        align="center"
                        justify="space-between"
                        w="100%"
                        bg="white"
                        p={4}
                        borderRadius="md"
                        boxShadow="sm"
                      >
                        <Flex align="center">
                          <Icon
                            as={FiFilm}
                            boxSize={6}
                            color="blue.500"
                            mr={3}
                          />
                          <VStack align="start" spacing={0}>
                            <Text fontWeight="bold">
                              {filmData.videoPath.split("/").pop()}
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                              Vidéo téléchargée avec succès
                            </Text>
                          </VStack>
                        </Flex>
                        <Button
                          onClick={() => videoFileRef.current?.click()}
                          leftIcon={<FiUpload />}
                          colorScheme="blue"
                          size="sm"
                        >
                          Remplacer
                        </Button>
                      </Flex>
                    ) : (
                      <MotionBox
                        onClick={() => videoFileRef.current?.click()}
                        cursor="pointer"
                        whileHover={{ scale: 1.02 }}
                        transition={{ duration: 0.2 }}
                      >
                        <VStack spacing={3} p={4}>
                          <Icon as={FiUpload} boxSize={12} color="blue.400" />
                          <Text color="blue.600" fontWeight="medium">
                            Cliquez pour uploader votre vidéo
                          </Text>
                          <Text color="gray.500" fontSize="sm">
                            MP4, MOV ou AVI • Taille max recommandée: 2GB
                          </Text>
                        </VStack>
                      </MotionBox>
                    )}
                    <Input
                      type="file"
                      accept="video/*"
                      ref={videoFileRef}
                      onChange={handleVideoUpload}
                      display="none"
                      title="Uploader une vidéo"
                      aria-label="Uploader la vidéo du film"
                    />
                    {errors.videoPath && (
                      <FormHelperText color="red.500">
                        {errors.videoPath}
                      </FormHelperText>
                    )}
                  </Flex>
                </FormControl>
              </VStack>
            </MotionBox>
          )}

          {/* Section spécifique pour les Séries */}
          {formData.type === "SERIE" && (
            <MotionBox
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Flex
                justify="space-between"
                align="center"
                mb={4}
                bg="purple.50"
                p={4}
                borderRadius="md"
              >
                <Flex align="center">
                  <Icon as={FiTv} boxSize={5} color="purple.500" mr={3} />
                  <Heading size="md" color="purple.700">
                    Saisons et Épisodes
                  </Heading>
                </Flex>
                <Button
                  onClick={addSeason}
                  leftIcon={<AddIcon />}
                  colorScheme="purple"
                  size="sm"
                  boxShadow="sm"
                >
                  Ajouter une saison
                </Button>
              </Flex>

              {errors.episodes && (
                <Flex p={4} mb={4} bg="red.50" borderRadius="md" align="center">
                  <Icon as={WarningTwoIcon} color="red.500" mr={2} />
                  <Text color="red.500" fontWeight="medium">
                    {errors.episodes}
                  </Text>
                </Flex>
              )}

              <Accordion defaultIndex={[0]} allowMultiple>
                {seasons.map((season, seasonIndex) => (
                  <AccordionItem
                    key={seasonIndex}
                    mb={4}
                    bg={secondaryBg}
                    borderRadius="md"
                    overflow="hidden"
                    border="1px solid"
                    borderColor={borderColor}
                  >
                    <AccordionButton
                      py={4}
                      px={5}
                      bg={secondaryBg}
                      _hover={{ bg: "purple.50" }}
                    >
                      <Flex flex="1" align="center">
                        <Icon as={FiTv} color="purple.500" mr={3} />
                        <Text fontWeight="bold" fontSize="lg">
                          {season.title || `Saison ${season.number}`}
                        </Text>
                      </Flex>
                      <Flex gap={3} align="center">
                        <Badge
                          colorScheme="purple"
                          px={2}
                          py={1}
                          borderRadius="full"
                        >
                          {season.episodes.length} épisode
                          {season.episodes.length > 1 ? "s" : ""}
                        </Badge>
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          aria-label="Supprimer la saison"
                          colorScheme="red"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeSeason(seasonIndex);
                          }}
                        />
                        <AccordionIcon color="purple.500" />
                      </Flex>
                    </AccordionButton>
                    <AccordionPanel pb={4} px={5}>
                      <VStack spacing={6} align="stretch">
                        <FormControl
                          isRequired
                          isInvalid={!!errors[`season_${seasonIndex}_title`]}
                        >
                          <FormLabel>Titre de la saison</FormLabel>
                          <Input
                            value={season.title}
                            onChange={(e) =>
                              handleSeasonChange(
                                seasonIndex,
                                "title",
                                e.target.value
                              )
                            }
                            placeholder="Titre de la saison"
                            bg={inputBg}
                            size="lg"
                            borderRadius="md"
                          />
                          {errors[`season_${seasonIndex}_title`] && (
                            <FormHelperText color="red.500">
                              {errors[`season_${seasonIndex}_title`]}
                            </FormHelperText>
                          )}
                        </FormControl>

                        <Box borderWidth="0px" borderRadius="md" p={0}>
                          <Flex
                            justify="space-between"
                            align="center"
                            mb={4}
                            bg="purple.100"
                            p={3}
                            borderRadius="md"
                          >
                            <Heading size="sm">Épisodes</Heading>
                            <Button
                              onClick={() => addEpisode(seasonIndex)}
                              leftIcon={<AddIcon />}
                              colorScheme="purple"
                              size="xs"
                              variant="outline"
                            >
                              Ajouter un épisode
                            </Button>
                          </Flex>

                          {season.episodes.map((episode, episodeIndex) => (
                            <MotionBox
                              key={episodeIndex}
                              p={4}
                              borderWidth="1px"
                              borderRadius="md"
                              mb={4}
                              bg="white"
                              boxShadow="sm"
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ duration: 0.3 }}
                            >
                              <Flex
                                justify="space-between"
                                align="center"
                                mb={4}
                              >
                                <Flex align="center">
                                  <Badge
                                    colorScheme="purple"
                                    borderRadius="full"
                                    px={2}
                                    py={1}
                                    mr={2}
                                  >
                                    {episode.number}
                                  </Badge>
                                  <Heading size="xs">
                                    {episode.title ||
                                      `Épisode ${episode.number}`}
                                  </Heading>
                                </Flex>
                                <IconButton
                                  size="xs"
                                  icon={<DeleteIcon />}
                                  aria-label="Supprimer l'épisode"
                                  colorScheme="red"
                                  variant="ghost"
                                  onClick={() =>
                                    removeEpisode(seasonIndex, episodeIndex)
                                  }
                                />
                              </Flex>

                              <VStack spacing={4} align="stretch">
                                <FormControl
                                  isRequired
                                  isInvalid={
                                    !!errors[
                                      `season_${seasonIndex}_episode_${episodeIndex}_title`
                                    ]
                                  }
                                >
                                  <FormLabel>Titre</FormLabel>
                                  <Input
                                    value={episode.title}
                                    onChange={(e) =>
                                      handleEpisodeChange(
                                        seasonIndex,
                                        episodeIndex,
                                        "title",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Titre de l'épisode"
                                    bg={inputBg}
                                    size="md"
                                    borderRadius="md"
                                  />
                                </FormControl>

                                <FormControl>
                                  <FormLabel>Description</FormLabel>
                                  <Textarea
                                    value={episode.description}
                                    onChange={(e) =>
                                      handleEpisodeChange(
                                        seasonIndex,
                                        episodeIndex,
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    placeholder="Description de l'épisode"
                                    rows={2}
                                    bg={inputBg}
                                    size="md"
                                    borderRadius="md"
                                  />
                                </FormControl>

                                <FormControl
                                  isRequired
                                  isInvalid={
                                    !!errors[
                                      `season_${seasonIndex}_episode_${episodeIndex}_duration`
                                    ]
                                  }
                                >
                                  <FormLabel>Durée (minutes)</FormLabel>
                                  <InputGroup size="md">
                                    <Input
                                      value={episode.duration}
                                      onChange={(e) =>
                                        handleEpisodeChange(
                                          seasonIndex,
                                          episodeIndex,
                                          "duration",
                                          e.target.value
                                        )
                                      }
                                      placeholder="Durée en minutes"
                                      type="number"
                                      bg={inputBg}
                                      borderRadius="md"
                                    />
                                    <InputRightAddon
                                      children="min"
                                      bg="purple.100"
                                    />
                                  </InputGroup>
                                </FormControl>

                                <FormControl
                                  isRequired
                                  isInvalid={
                                    !!errors[
                                      `season_${seasonIndex}_episode_${episodeIndex}_videoPath`
                                    ]
                                  }
                                >
                                  <FormLabel>Vidéo</FormLabel>
                                  <Box
                                    borderWidth={1}
                                    borderRadius="md"
                                    p={2}
                                    borderStyle="dashed"
                                    mt={2}
                                  >
                                    <input
                                      type="file"
                                      accept="video/*"
                                      id={`episode-video-${seasonIndex}-${episodeIndex}`}
                                      ref={episodeFileRef}
                                      onChange={(e) =>
                                        handleEpisodeVideoUpload(
                                          seasonIndex,
                                          episodeIndex,
                                          e
                                        )
                                      }
                                      style={{ display: "none" }}
                                      title="Vidéo de l'épisode"
                                      aria-label="Uploader la vidéo de l'épisode"
                                    />
                                    <Button
                                      leftIcon={<FiUpload />}
                                      colorScheme={
                                        episode.videoPath ? "green" : "blue"
                                      }
                                      size="sm"
                                      w="100%"
                                      onClick={() =>
                                        document
                                          .getElementById(
                                            `episode-video-${seasonIndex}-${episodeIndex}`
                                          )
                                          ?.click()
                                      }
                                    >
                                      {episode.videoPath
                                        ? "Vidéo uploadée ✓ (Changer)"
                                        : "Uploader la vidéo"}
                                    </Button>

                                    {/* Barre de progression pour l'upload vidéo de l'épisode */}
                                    {uploadProgress.episodeVideo.seasonIndex ===
                                      seasonIndex &&
                                      uploadProgress.episodeVideo
                                        .episodeIndex === episodeIndex &&
                                      uploadProgress.episodeVideo.progress >
                                        0 && (
                                        <Box mt={2}>
                                          <Text fontSize="xs" mb={1}>
                                            Upload en cours:{" "}
                                            {
                                              uploadProgress.episodeVideo
                                                .progress
                                            }
                                            %
                                          </Text>
                                          <Box
                                            w="100%"
                                            bg="gray.200"
                                            borderRadius="full"
                                            h="4px"
                                            overflow="hidden"
                                          >
                                            <Box
                                              w={`${uploadProgress.episodeVideo.progress}%`}
                                              bg="blue.500"
                                              h="100%"
                                              borderRadius="full"
                                              transition="width 0.3s ease"
                                            />
                                          </Box>
                                        </Box>
                                      )}
                                  </Box>
                                </FormControl>

                                <FormControl>
                                  <FormLabel>Miniature (optionnel)</FormLabel>
                                  <Box
                                    borderWidth={1}
                                    borderRadius="md"
                                    p={2}
                                    borderStyle="dashed"
                                    mt={2}
                                  >
                                    <input
                                      type="file"
                                      accept="image/*"
                                      id={`episode-thumbnail-${seasonIndex}-${episodeIndex}`}
                                      ref={episodeThumbnailRef}
                                      onChange={(e) =>
                                        handleEpisodeThumbnailUpload(
                                          seasonIndex,
                                          episodeIndex,
                                          e
                                        )
                                      }
                                      style={{ display: "none" }}
                                      title="Miniature de l'épisode"
                                      aria-label="Uploader la miniature de l'épisode"
                                    />

                                    {episode.thumbnailPreview ? (
                                      <VStack spacing={2}>
                                        <Image
                                          src={episode.thumbnailPreview}
                                          alt={`Miniature de l'épisode ${episode.number}`}
                                          boxSize="100px"
                                          objectFit="cover"
                                          borderRadius="md"
                                        />
                                        <Button
                                          size="sm"
                                          onClick={() =>
                                            document
                                              .getElementById(
                                                `episode-thumbnail-${seasonIndex}-${episodeIndex}`
                                              )
                                              ?.click()
                                          }
                                          leftIcon={<FiImage />}
                                          colorScheme="blue"
                                        >
                                          Changer
                                        </Button>
                                      </VStack>
                                    ) : (
                                      <Button
                                        leftIcon={<FiImage />}
                                        size="sm"
                                        w="100%"
                                        onClick={() =>
                                          document
                                            .getElementById(
                                              `episode-thumbnail-${seasonIndex}-${episodeIndex}`
                                            )
                                            ?.click()
                                        }
                                        colorScheme="blue"
                                      >
                                        Uploader une miniature
                                      </Button>
                                    )}

                                    {/* Barre de progression pour l'upload de miniature */}
                                    {uploadProgress.episodeThumbnail
                                      .seasonIndex === seasonIndex &&
                                      uploadProgress.episodeThumbnail
                                        .episodeIndex === episodeIndex &&
                                      uploadProgress.episodeThumbnail.progress >
                                        0 && (
                                        <Box mt={2}>
                                          <Text fontSize="xs" mb={1}>
                                            Upload en cours:{" "}
                                            {
                                              uploadProgress.episodeThumbnail
                                                .progress
                                            }
                                            %
                                          </Text>
                                          <Box
                                            w="100%"
                                            bg="gray.200"
                                            borderRadius="full"
                                            h="4px"
                                            overflow="hidden"
                                          >
                                            <Box
                                              w={`${uploadProgress.episodeThumbnail.progress}%`}
                                              bg="blue.500"
                                              h="100%"
                                              borderRadius="full"
                                              transition="width 0.3s ease"
                                            />
                                          </Box>
                                        </Box>
                                      )}
                                  </Box>
                                </FormControl>
                              </VStack>
                            </MotionBox>
                          ))}
                        </Box>
                      </VStack>
                    </AccordionPanel>
                  </AccordionItem>
                ))}
              </Accordion>
            </MotionBox>
          )}

          <MotionBox
            pt={8}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <VStack spacing={3}>
              <Button
                type="submit"
                colorScheme="red"
                size="lg"
                width="100%"
                height="60px"
                fontSize="lg"
                fontWeight="bold"
                isLoading={isSubmitting}
                boxShadow="lg"
                _hover={{
                  transform: "translateY(-2px)",
                  boxShadow: "xl",
                }}
                transition="all 0.2s"
              >
                Soumettre le contenu
              </Button>
              <Flex
                p={4}
                bg="blue.50"
                borderRadius="md"
                align="center"
                width="100%"
              >
                <Icon as={FiClock} color="blue.500" boxSize={5} mr={3} />
                <Text fontSize="sm" color="blue.600">
                  Le contenu sera examiné par un administrateur avant d'être
                  publié.
                </Text>
              </Flex>
            </VStack>
          </MotionBox>
        </VStack>
      </MotionBox>
    </MotionContainer>
  );
}
