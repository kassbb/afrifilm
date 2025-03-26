"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  Button,
  useToast,
  useColorModeValue,
} from "@chakra-ui/react";
import FormInput from "@/app/components/FormInput";
import FormTextarea from "@/app/components/FormTextarea";
import FormSelect from "@/app/components/FormSelect";
import FormFile from "@/app/components/FormFile";
import FormCheckbox from "@/app/components/FormCheckbox";
import FormSwitch from "@/app/components/FormSwitch";
import { FiFilm, FiUser, FiCalendar, FiGlobe, FiTag } from "react-icons/fi";

const genreOptions = [
  { value: "drame", label: "Drame" },
  { value: "comedie", label: "Comédie" },
  { value: "action", label: "Action" },
  { value: "romance", label: "Romance" },
  { value: "documentaire", label: "Documentaire" },
  { value: "animation", label: "Animation" },
  { value: "thriller", label: "Thriller" },
  { value: "science-fiction", label: "Science-fiction" },
  { value: "horreur", label: "Horreur" },
];

const languageOptions = [
  { value: "francais", label: "Français" },
  { value: "anglais", label: "Anglais" },
  { value: "wolof", label: "Wolof" },
  { value: "bambara", label: "Bambara" },
  { value: "swahili", label: "Swahili" },
];

export default function AddFilmPage() {
  const toast = useToast();
  const bgColor = useColorModeValue("gray.800", "gray.900");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    director: "",
    year: "",
    country: "",
    genre: "",
    language: "",
    duration: "",
    price: "",
    thumbnail: null as File | null,
    video: null as File | null,
    isFeatured: false,
    isNew: true,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      setFormData((prev) => ({ ...prev, [name]: files[0] }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    const newErrors: Record<string, string> = {};
    if (!formData.title) newErrors.title = "Le titre est requis";
    if (!formData.description)
      newErrors.description = "La description est requise";
    if (!formData.director) newErrors.director = "Le réalisateur est requis";
    if (!formData.year) newErrors.year = "L'année est requise";
    if (!formData.country) newErrors.country = "Le pays est requis";
    if (!formData.genre) newErrors.genre = "Le genre est requis";
    if (!formData.language) newErrors.language = "La langue est requise";
    if (!formData.duration) newErrors.duration = "La durée est requise";
    if (!formData.price) newErrors.price = "Le prix est requis";
    if (!formData.thumbnail) newErrors.thumbnail = "La miniature est requise";
    if (!formData.video) newErrors.video = "La vidéo est requise";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // TODO: Implémenter la logique d'envoi du formulaire
    toast({
      title: "Film ajouté avec succès",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <Box bg={bgColor} minH="100vh" py={12}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Heading color="white" textAlign="center">
            Ajouter un nouveau film
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormInput
                label="Titre du film"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                error={errors.title}
                icon={FiFilm}
                required
              />

              <FormTextarea
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                error={errors.description}
                required
              />

              <FormInput
                label="Réalisateur"
                name="director"
                value={formData.director}
                onChange={handleInputChange}
                error={errors.director}
                icon={FiUser}
                required
              />

              <FormInput
                label="Année de sortie"
                name="year"
                type="number"
                value={formData.year}
                onChange={handleInputChange}
                error={errors.year}
                icon={FiCalendar}
                required
              />

              <FormInput
                label="Pays d'origine"
                name="country"
                value={formData.country}
                onChange={handleInputChange}
                error={errors.country}
                icon={FiGlobe}
                required
              />

              <FormSelect
                label="Genre"
                name="genre"
                options={genreOptions}
                value={formData.genre}
                onChange={handleInputChange}
                error={errors.genre}
                required
              />

              <FormSelect
                label="Langue"
                name="language"
                options={languageOptions}
                value={formData.language}
                onChange={handleInputChange}
                error={errors.language}
                required
              />

              <FormInput
                label="Durée (en minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
                icon={FiTag}
                required
              />

              <FormInput
                label="Prix (€)"
                name="price"
                type="number"
                step="0.01"
                value={formData.price}
                onChange={handleInputChange}
                error={errors.price}
                required
              />

              <FormFile
                label="Miniature du film"
                name="thumbnail"
                accept="image/*"
                onChange={handleFileChange}
                error={errors.thumbnail}
                required
              />

              <FormFile
                label="Fichier vidéo"
                name="video"
                accept="video/*"
                onChange={handleFileChange}
                error={errors.video}
                required
              />

              <FormSwitch
                label="Film en vedette"
                name="isFeatured"
                isChecked={formData.isFeatured}
                onChange={handleCheckboxChange}
              />

              <FormSwitch
                label="Nouveau film"
                name="isNew"
                isChecked={formData.isNew}
                onChange={handleCheckboxChange}
              />

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                _hover={{ bg: "brand.600" }}
              >
                Ajouter le film
              </Button>
            </VStack>
          </form>
        </VStack>
      </Container>
    </Box>
  );
}
