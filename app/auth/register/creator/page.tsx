"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  FormErrorMessage,
  Heading,
  Text,
  useToast,
  VStack,
  Container,
  Link,
  Textarea,
  Checkbox,
  HStack,
  Divider,
} from "@chakra-ui/react";
import NextLink from "next/link";

export default function CreatorRegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    bio: "",
    portfolio: "",
    identityDocument: null as File | null,
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format d'email invalide";

    if (!formData.password) newErrors.password = "Le mot de passe est requis";
    else if (formData.password.length < 6)
      newErrors.password =
        "Le mot de passe doit contenir au moins 6 caractères";

    if (!formData.name) newErrors.name = "Le nom est requis";

    if (!formData.bio) newErrors.bio = "Une courte biographie est requise";

    if (formData.portfolio && !/^https?:\/\//.test(formData.portfolio))
      newErrors.portfolio = "Le lien du portfolio doit être une URL valide";

    if (!formData.identityDocument)
      newErrors.identityDocument =
        "Une pièce d'identité est requise pour la vérification";

    if (!formData.agreeTerms)
      newErrors.agreeTerms = "Vous devez accepter les conditions d'utilisation";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    if (type === "file") {
      const fileInput = e.target as HTMLInputElement;
      const file = fileInput.files ? fileInput.files[0] : null;
      setFormData((prev) => ({
        ...prev,
        [name]: file,
      }));
    } else {
      const val =
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value;

      setFormData((prev) => ({
        ...prev,
        [name]: val,
      }));
    }

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Si nous avons un fichier de pièce d'identité, nous devons d'abord le télécharger
      let identityDocumentUrl = null;

      if (formData.identityDocument) {
        // Créer un FormData pour télécharger le fichier
        const fileFormData = new FormData();
        fileFormData.append("file", formData.identityDocument);

        const uploadResponse = await fetch("/api/upload/identity", {
          method: "POST",
          body: fileFormData,
        });

        if (!uploadResponse.ok) {
          const errorData = await uploadResponse.json();
          throw new Error(
            errorData.error ||
              "Erreur lors du téléchargement de la pièce d'identité"
          );
        }

        const uploadData = await uploadResponse.json();
        identityDocumentUrl = uploadData.url;
      }

      // Maintenant, enregistrer l'utilisateur avec l'URL de la pièce d'identité
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          name: formData.name,
          bio: formData.bio,
          portfolio: formData.portfolio || null,
          identityDocument: identityDocumentUrl,
          accountType: "CREATOR",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      toast({
        title: "Inscription réussie",
        description:
          "Votre compte créateur a été créé. Un administrateur va vérifier vos informations.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Rediriger vers la page de connexion après inscription
      router.push("/auth/login");
    } catch (error) {
      console.error("Erreur d'inscription:", error);
      toast({
        title: "Erreur d'inscription",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading as="h1" size="xl" mb={2}>
            Devenir Créateur
          </Heading>
          <Text color="gray.500">
            Créez votre compte créateur pour partager votre contenu
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4} align="stretch">
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
              />
              <FormErrorMessage>{errors.email}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel>Mot de passe</FormLabel>
              <Input
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="********"
              />
              <FormErrorMessage>{errors.password}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.name} isRequired>
              <FormLabel>Nom complet</FormLabel>
              <Input
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Votre nom complet"
              />
              <FormErrorMessage>{errors.name}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.bio} isRequired>
              <FormLabel>Biographie</FormLabel>
              <Textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Présentez-vous en quelques lignes..."
                resize="vertical"
                rows={4}
              />
              <FormErrorMessage>{errors.bio}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.portfolio}>
              <FormLabel>Lien du portfolio (optionnel)</FormLabel>
              <Input
                name="portfolio"
                value={formData.portfolio}
                onChange={handleChange}
                placeholder="https://votre-portfolio.com"
              />
              <FormErrorMessage>{errors.portfolio}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.identityDocument} isRequired>
              <FormLabel>Pièce d'identité</FormLabel>
              <Input
                name="identityDocument"
                type="file"
                accept="image/jpeg,image/png,application/pdf"
                onChange={handleChange}
                p={1}
              />
              <Text fontSize="xs" color="gray.400" mt={1}>
                Format accepté: JPG, PNG ou PDF (max 5MB)
              </Text>
              <FormErrorMessage>{errors.identityDocument}</FormErrorMessage>
            </FormControl>

            <FormControl isInvalid={!!errors.agreeTerms}>
              <HStack>
                <Checkbox
                  name="agreeTerms"
                  isChecked={formData.agreeTerms}
                  onChange={handleChange}
                />
                <Text fontSize="sm">
                  J'accepte les{" "}
                  <Link as={NextLink} href="/terms" color="red.500">
                    conditions d'utilisation
                  </Link>
                </Text>
              </HStack>
              <FormErrorMessage>{errors.agreeTerms}</FormErrorMessage>
            </FormControl>

            <Text fontSize="sm" color="gray.500" mt={2}>
              En vous inscrivant, vous acceptez que vos informations soient
              vérifiées par nos administrateurs avant validation de votre
              compte.
            </Text>

            <Button
              type="submit"
              colorScheme="red"
              isLoading={isSubmitting}
              w="full"
              mt={4}
            >
              S'inscrire comme créateur
            </Button>
          </VStack>
        </Box>

        <Divider />

        <Text textAlign="center">
          Vous avez déjà un compte?{" "}
          <Link as={NextLink} href="/auth/login" color="red.500">
            Connectez-vous
          </Link>
        </Text>
      </VStack>
    </Container>
  );
}
