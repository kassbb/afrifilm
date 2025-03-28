"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  HStack,
  VStack,
  useToast,
  FormHelperText,
  Divider,
  Text,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  Switch,
} from "@chakra-ui/react";
import { FiSave, FiArrowLeft } from "react-icons/fi";

export default function CreateContentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [creators, setCreators] = useState<any[]>([]);
  const [contentType, setContentType] = useState<"FILM" | "SERIE" | "">("");

  // Données du formulaire
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    type: "",
    price: "",
    thumbnail: "",
    creatorId: "",
    isFeatured: false,
    isApproved: false,
    genre: "",
    director: "",
    year: "",
    country: "",
    language: "",
    cast: "",
    // Pour les films
    duration: "",
    videoPath: "",
  });

  // Vérification de l'authentification et des permissions
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    // Charger la liste des créateurs
    fetchCreators();
  }, [session, status, router]);

  // Récupérer la liste des créateurs
  const fetchCreators = async () => {
    try {
      const response = await fetch("/api/admin/creators");
      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des créateurs");
      }
      const data = await response.json();
      setCreators(data);
      setLoading(false);
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger la liste des créateurs",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setLoading(false);
    }
  };

  // Gérer les changements dans le formulaire
  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "checkbox") {
      const { checked } = e.target as HTMLInputElement;
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }

    // Mettre à jour le type de contenu pour l'affichage conditionnel
    if (name === "type") {
      setContentType(value as "FILM" | "SERIE" | "");
    }
  };

  // Gérer le changement de prix
  const handlePriceChange = (valueAsString: string) => {
    setFormData((prev) => ({
      ...prev,
      price: valueAsString,
    }));
  };

  // Gérer l'upload de la vignette
  const handleThumbnailUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];
    const maxSize = 2 * 1024 * 1024; // 2MB

    if (file.size > maxSize) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale est de 2Mo",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "thumbnails");

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload de l'image");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        thumbnail: data.filePath,
      }));

      toast({
        title: "Upload réussi",
        description: "L'image a été uploadée avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible d'uploader l'image",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Gérer l'upload de la vidéo (pour les films)
  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;

    const file = e.target.files[0];

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("type", "videos");

      toast({
        title: "Upload en cours",
        description: "Veuillez patienter pendant l'upload de la vidéo...",
        status: "info",
        duration: null,
        isClosable: false,
        id: "video-upload",
      });

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'upload de la vidéo");
      }

      const data = await response.json();
      setFormData((prev) => ({
        ...prev,
        videoPath: data.filePath,
      }));

      // Fermer la notification d'upload
      toast.close("video-upload");

      toast({
        title: "Upload réussi",
        description: "La vidéo a été uploadée avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      // Fermer la notification d'upload
      toast.close("video-upload");

      toast({
        title: "Erreur",
        description: "Impossible d'uploader la vidéo",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  // Validation du formulaire
  const validateForm = () => {
    // Champs obligatoires pour tous les contenus
    if (
      !formData.title ||
      !formData.description ||
      !formData.type ||
      !formData.creatorId
    ) {
      toast({
        title: "Formulaire incomplet",
        description: "Veuillez remplir tous les champs obligatoires",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Champs spécifiques pour les films
    if (
      formData.type === "FILM" &&
      (!formData.duration || !formData.videoPath)
    ) {
      toast({
        title: "Formulaire incomplet",
        description: "Pour un film, la durée et la vidéo sont obligatoires",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return false;
    }

    // Pas de validation spécifique pour les séries à ce stade
    // Les saisons et épisodes seront ajoutés ultérieurement

    return true;
  };

  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      // Préparer les données
      const contentData = {
        ...formData,
        price: formData.price ? parseFloat(formData.price) : null,
        duration: formData.duration ? parseInt(formData.duration) : null,
      };

      // Si c'est une série, ajouter une structure de base pour les saisons (sera complétée plus tard)
      if (formData.type === "SERIE") {
        // Afficher une info pour avertir l'utilisateur avant de soumettre
        toast({
          title: "Création de série",
          description:
            "Vous devrez ajouter des saisons et des épisodes après la création de la série.",
          status: "info",
          duration: 5000,
          isClosable: true,
        });
      }

      const response = await fetch("/api/admin/contents", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(contentData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const responseData = await response.json();

      toast({
        title: "Contenu créé",
        description:
          formData.type === "SERIE"
            ? "La série a été créée avec succès. Vous pourrez ajouter des saisons et des épisodes ultérieurement."
            : "Le contenu a été créé avec succès",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Rediriger vers la liste des contenus dans tous les cas
      router.push("/admin/contents");
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
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" color="white" size="lg">
          Ajouter un nouveau contenu
        </Heading>
        <Button
          leftIcon={<FiArrowLeft />}
          variant="outline"
          onClick={() => router.back()}
        >
          Retour
        </Button>
      </Flex>

      <Box as="form" onSubmit={handleSubmit}>
        <Box bg="gray.800" p={6} borderRadius="md" mb={6}>
          <Text fontWeight="bold" fontSize="lg" mb={4}>
            Informations générales
          </Text>

          <VStack spacing={4} align="stretch">
            <FormControl isRequired>
              <FormLabel>Titre</FormLabel>
              <Input
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Titre du contenu"
                bg="gray.700"
                border="none"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Description</FormLabel>
              <Textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Description du contenu"
                bg="gray.700"
                border="none"
                minH="120px"
              />
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Type de contenu</FormLabel>
              <Select
                name="type"
                value={formData.type}
                onChange={handleChange}
                placeholder="Sélectionner un type"
                bg="gray.700"
                border="none"
              >
                <option value="FILM">Film</option>
                <option value="SERIE">Série</option>
              </Select>
            </FormControl>

            <FormControl isRequired>
              <FormLabel>Créateur</FormLabel>
              <Select
                name="creatorId"
                value={formData.creatorId}
                onChange={handleChange}
                placeholder="Sélectionner un créateur"
                bg="gray.700"
                border="none"
              >
                {creators.map((creator) => (
                  <option key={creator.id} value={creator.id}>
                    {creator.name || creator.email}
                  </option>
                ))}
              </Select>
            </FormControl>

            <HStack spacing={6}>
              <FormControl>
                <FormLabel>Prix (€)</FormLabel>
                <NumberInput
                  min={0}
                  value={formData.price}
                  onChange={handlePriceChange}
                  bg="gray.700"
                  border="none"
                  borderRadius="md"
                >
                  <NumberInputField
                    name="price"
                    placeholder="Prix (laisser vide pour gratuit)"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
                <FormHelperText>
                  Laisser vide pour un contenu gratuit
                </FormHelperText>
              </FormControl>

              <FormControl>
                <FormLabel>Image de couverture</FormLabel>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  bg="gray.700"
                  border="none"
                  height="auto"
                  py={1}
                />
                <FormHelperText>
                  Format recommandé: 16:9, max 2 Mo
                </FormHelperText>
              </FormControl>
            </HStack>

            <Divider my={2} />

            <Text fontWeight="bold" fontSize="md" mb={2}>
              Métadonnées
            </Text>

            <HStack spacing={6} wrap="wrap">
              <FormControl flex="1" minW="200px">
                <FormLabel>Genre</FormLabel>
                <Input
                  name="genre"
                  value={formData.genre}
                  onChange={handleChange}
                  placeholder="Ex: Action, Drame, Comédie"
                  bg="gray.700"
                  border="none"
                />
              </FormControl>

              <FormControl flex="1" minW="200px">
                <FormLabel>Réalisateur</FormLabel>
                <Input
                  name="director"
                  value={formData.director}
                  onChange={handleChange}
                  placeholder="Nom du réalisateur"
                  bg="gray.700"
                  border="none"
                />
              </FormControl>
            </HStack>

            <HStack spacing={6} wrap="wrap">
              <FormControl flex="1" minW="200px">
                <FormLabel>Année de sortie</FormLabel>
                <Input
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  placeholder="Ex: 2023"
                  bg="gray.700"
                  border="none"
                />
              </FormControl>

              <FormControl flex="1" minW="200px">
                <FormLabel>Pays</FormLabel>
                <Input
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                  placeholder="Ex: Sénégal, Nigeria"
                  bg="gray.700"
                  border="none"
                />
              </FormControl>
            </HStack>

            <HStack spacing={6} wrap="wrap">
              <FormControl flex="1" minW="200px">
                <FormLabel>Langue</FormLabel>
                <Input
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  placeholder="Ex: Français, Wolof"
                  bg="gray.700"
                  border="none"
                />
              </FormControl>

              <FormControl flex="1" minW="200px">
                <FormLabel>Casting</FormLabel>
                <Input
                  name="cast"
                  value={formData.cast}
                  onChange={handleChange}
                  placeholder="Acteurs principaux"
                  bg="gray.700"
                  border="none"
                />
              </FormControl>
            </HStack>

            <HStack spacing={6} wrap="wrap" mt={2}>
              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="is-featured" mb={0}>
                  Mettre en avant
                </FormLabel>
                <Switch
                  id="is-featured"
                  name="isFeatured"
                  isChecked={formData.isFeatured}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isFeatured: e.target.checked,
                    }))
                  }
                  colorScheme="blue"
                />
              </FormControl>

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="is-approved" mb={0}>
                  Approuver immédiatement
                </FormLabel>
                <Switch
                  id="is-approved"
                  name="isApproved"
                  isChecked={formData.isApproved}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      isApproved: e.target.checked,
                    }))
                  }
                  colorScheme="green"
                />
              </FormControl>
            </HStack>
          </VStack>
        </Box>

        {contentType === "FILM" && (
          <Box bg="gray.800" p={6} borderRadius="md" mb={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4}>
              Informations spécifiques au film
            </Text>

            <VStack spacing={4} align="stretch">
              <FormControl isRequired>
                <FormLabel>Durée (minutes)</FormLabel>
                <NumberInput
                  min={1}
                  value={formData.duration}
                  onChange={(value) =>
                    setFormData((prev) => ({ ...prev, duration: value }))
                  }
                  bg="gray.700"
                  border="none"
                  borderRadius="md"
                >
                  <NumberInputField
                    name="duration"
                    placeholder="Durée en minutes"
                  />
                  <NumberInputStepper>
                    <NumberIncrementStepper />
                    <NumberDecrementStepper />
                  </NumberInputStepper>
                </NumberInput>
              </FormControl>

              <FormControl isRequired>
                <FormLabel>Vidéo</FormLabel>
                <Input
                  type="file"
                  accept="video/*"
                  onChange={handleVideoUpload}
                  bg="gray.700"
                  border="none"
                  height="auto"
                  py={1}
                />
                <FormHelperText>
                  Formats acceptés: MP4, WebM (max 1 Go)
                </FormHelperText>
              </FormControl>

              {formData.videoPath && (
                <Text fontSize="sm" color="green.300">
                  Vidéo uploadée: {formData.videoPath}
                </Text>
              )}
            </VStack>
          </Box>
        )}

        {contentType === "SERIE" && (
          <Box bg="gray.800" p={6} borderRadius="md" mb={6}>
            <Text fontWeight="bold" fontSize="lg" mb={4}>
              Informations spécifiques à la série
            </Text>

            <VStack spacing={4} align="stretch">
              <Box bg="green.700" p={4} borderRadius="md">
                <Text fontWeight="bold" mb={2}>
                  ✅ Gestion complète des séries
                </Text>
                <Text>
                  Vous pouvez désormais créer une série et gérer facilement ses
                  saisons et épisodes.
                </Text>
                <Text mt={2}>Processus amélioré :</Text>
                <Text as="ol" pl={6} mt={1}>
                  <Text as="li">
                    1. Créez d'abord la série de base avec les informations
                    générales
                  </Text>
                  <Text as="li">
                    2. Après création, retournez à la liste des contenus
                  </Text>
                  <Text as="li">
                    3. Cliquez sur le titre de votre série dans la liste
                  </Text>
                  <Text as="li">
                    4. Dans la fenêtre de détails, allez dans l'onglet "Saisons
                    et épisodes"
                  </Text>
                  <Text as="li">
                    5. Ajoutez des saisons puis des épisodes avec l'interface
                    intuitive
                  </Text>
                </Text>
                <Text fontStyle="italic" mt={2} fontSize="sm">
                  Note : Pour que votre série soit visible par les utilisateurs,
                  elle doit avoir au moins une saison avec un épisode.
                </Text>
              </Box>

              <Text color="gray.300">
                Cette nouvelle interface vous permet de gérer facilement
                l'intégralité de vos séries et de leurs contenus.
              </Text>
            </VStack>
          </Box>
        )}

        <Flex justify="flex-end" mt={6}>
          <Button
            leftIcon={<FiSave />}
            colorScheme="blue"
            type="submit"
            isLoading={submitting}
            loadingText="Création en cours..."
            size="lg"
          >
            Créer le contenu
          </Button>
        </Flex>
      </Box>
    </Box>
  );
}
