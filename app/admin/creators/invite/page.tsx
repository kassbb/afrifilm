"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  FormErrorMessage,
  Heading,
  Input,
  Textarea,
  VStack,
  Text,
  useToast,
  Container,
  Flex,
  Spinner,
  Switch,
  HStack,
  Divider,
  IconButton,
} from "@chakra-ui/react";
import { FiArrowLeft } from "react-icons/fi";

export default function InviteCreatorPage() {
  const { data: session, status } = useSession();
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    bio: "",
    portfolio: "",
    identityDocument: null as File | null,
    sendEmail: true,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const toast = useToast();

  // Vérifier que l'utilisateur est bien administrateur
  if (status === "loading") {
    return (
      <Flex justify="center" align="center" minH="80vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  if (!session || session.user.role !== "ADMIN") {
    router.push("/auth/login");
    return null;
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) newErrors.email = "L'email est requis";
    else if (!/\S+@\S+\.\S+/.test(formData.email))
      newErrors.email = "Format d'email invalide";

    if (!formData.name) newErrors.name = "Le nom est requis";

    if (formData.portfolio && !/^https?:\/\//.test(formData.portfolio))
      newErrors.portfolio = "Le lien du portfolio doit être une URL valide";

    if (!formData.identityDocument)
      newErrors.identityDocument =
        "Une pièce d'identité est requise pour les créateurs";

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

      // Maintenant, inviter le créateur avec l'URL de la pièce d'identité
      const response = await fetch("/api/admin/creators", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          bio: formData.bio || undefined,
          portfolio: formData.portfolio || undefined,
          identityDocument: identityDocumentUrl,
          sendEmail: formData.sendEmail,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'invitation");
      }

      toast({
        title: "Invitation envoyée",
        description: formData.sendEmail
          ? "Un email d'invitation a été envoyé au créateur"
          : "Le créateur a été invité sans notification par email",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push("/admin/creators");
    } catch (error) {
      console.error("Erreur d'invitation:", error);
      toast({
        title: "Erreur",
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
    <Box p={4}>
      <Container maxW="container.md">
        <VStack spacing={8} align="stretch">
          <Flex justifyContent="space-between" alignItems="center">
            <HStack>
              <IconButton
                aria-label="Retour"
                icon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => router.push("/admin/creators")}
              />
              <Heading size="lg" color="white">
                Inviter un créateur
              </Heading>
            </HStack>
          </Flex>

          <Text color="gray.400">
            Invitez un créateur à rejoindre la plateforme. Un email sera envoyé
            avec les instructions de création de compte.
          </Text>

          <Divider />

          <Box
            as="form"
            onSubmit={handleSubmit}
            bg="gray.800"
            p={6}
            borderRadius="md"
          >
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.email} isRequired>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@exemple.com"
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.name} isRequired>
                <FormLabel>Nom complet</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Nom du créateur"
                />
                <FormErrorMessage>{errors.name}</FormErrorMessage>
              </FormControl>

              <FormControl>
                <FormLabel>Biographie (optionnelle)</FormLabel>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Entrez une biographie pour le créateur..."
                  resize="vertical"
                  rows={4}
                />
              </FormControl>

              <FormControl isInvalid={!!errors.portfolio}>
                <FormLabel>Portfolio (optionnel)</FormLabel>
                <Input
                  name="portfolio"
                  value={formData.portfolio}
                  onChange={handleChange}
                  placeholder="https://portfolio-du-createur.com"
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

              <FormControl display="flex" alignItems="center">
                <FormLabel htmlFor="send-email" mb="0">
                  Envoyer un email d'invitation
                </FormLabel>
                <Switch
                  id="send-email"
                  name="sendEmail"
                  isChecked={formData.sendEmail}
                  onChange={handleChange}
                  colorScheme="red"
                />
              </FormControl>

              <Button
                type="submit"
                colorScheme="red"
                w="full"
                mt={4}
                isLoading={isSubmitting}
              >
                Inviter le créateur
              </Button>
            </VStack>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
