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
import FormSwitch from "@/app/components/FormSwitch";
import { FiFilm, FiClock, FiTag, FiList } from "react-icons/fi";

export default function AddEpisodePage({ params }: { params: { id: string } }) {
  const toast = useToast();
  const bgColor = useColorModeValue("gray.800", "gray.900");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    seasonNumber: "",
    episodeNumber: "",
    duration: "",
    price: "",
    thumbnail: null as File | null,
    video: null as File | null,
    isPreview: false,
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
    if (!formData.seasonNumber)
      newErrors.seasonNumber = "Le numéro de saison est requis";
    if (!formData.episodeNumber)
      newErrors.episodeNumber = "Le numéro d'épisode est requis";
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
      title: "Épisode ajouté avec succès",
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
            Ajouter un nouvel épisode
          </Heading>

          <form onSubmit={handleSubmit}>
            <VStack spacing={6} align="stretch">
              <FormInput
                label="Titre de l'épisode"
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
                label="Numéro de saison"
                name="seasonNumber"
                type="number"
                value={formData.seasonNumber}
                onChange={handleInputChange}
                error={errors.seasonNumber}
                icon={FiList}
                required
              />

              <FormInput
                label="Numéro d'épisode"
                name="episodeNumber"
                type="number"
                value={formData.episodeNumber}
                onChange={handleInputChange}
                error={errors.episodeNumber}
                icon={FiTag}
                required
              />

              <FormInput
                label="Durée (en minutes)"
                name="duration"
                type="number"
                value={formData.duration}
                onChange={handleInputChange}
                error={errors.duration}
                icon={FiClock}
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
                label="Miniature de l'épisode"
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
                label="Épisode en prévisualisation"
                name="isPreview"
                isChecked={formData.isPreview}
                onChange={handleCheckboxChange}
              />

              <Button
                type="submit"
                colorScheme="brand"
                size="lg"
                _hover={{ bg: "brand.600" }}
              >
                Ajouter l'épisode
              </Button>
            </VStack>
          </form>
        </VStack>
      </Container>
    </Box>
  );
}
