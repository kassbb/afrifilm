"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Heading,
  Input,
  Text,
  VStack,
  useToast,
  Select,
  FormErrorMessage,
  Divider,
  HStack,
  Flex,
} from "@chakra-ui/react";
import { z } from "zod";

// Schéma de validation du formulaire
const registerSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z
    .string()
    .min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  accountType: z.enum(["USER", "CREATOR"], {
    errorMap: () => ({ message: "Type de compte requis" }),
  }),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<RegisterFormData>({
    email: "",
    password: "",
    accountType: "USER",
  });
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Valider les données du formulaire
      const validatedData = registerSchema.parse(formData);

      // Appel API pour l'inscription
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(validatedData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de l'inscription");
      }

      // Afficher un message de succès
      toast({
        title: "Inscription réussie",
        description: "Vous pouvez maintenant vous connecter.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Rediriger vers la page de connexion
      router.push("/auth/login");
    } catch (error) {
      // Gérer les erreurs de validation Zod
      if (error instanceof z.ZodError) {
        const newErrors: Partial<RegisterFormData> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as keyof RegisterFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else if (error instanceof Error) {
        // Afficher un message d'erreur général
        toast({
          title: "Erreur",
          description: error.message,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxW="md" py={12}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center">
          <Heading size="xl" mb={2}>
            Créer un compte
          </Heading>
          <Text color="gray.600">
            Rejoignez la communauté AfriFilm dès aujourd'hui
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="votre@email.com"
              />
              {errors.email && (
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.password} isRequired>
              <FormLabel>Mot de passe</FormLabel>
              <Input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="******"
              />
              {errors.password && (
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!errors.accountType} isRequired>
              <FormLabel htmlFor="accountType">Type de compte</FormLabel>
              <Select
                id="accountType"
                name="accountType"
                value={formData.accountType}
                onChange={handleChange}
                aria-label="Sélectionner le type de compte"
              >
                <option value="USER">Spectateur</option>
                <option value="CREATOR">Créateur de contenu</option>
              </Select>
              {errors.accountType && (
                <FormErrorMessage>{errors.accountType}</FormErrorMessage>
              )}
              {formData.accountType === "CREATOR" && (
                <Text fontSize="sm" color="gray.500" mt={2}>
                  Les comptes créateurs nécessitent une vérification par nos
                  administrateurs.
                </Text>
              )}
            </FormControl>

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={6}
              isLoading={isLoading}
              loadingText="Inscription..."
            >
              S'inscrire
            </Button>

            <Divider my={6} />

            <Flex justifyContent="center">
              <Text mr={2}>Vous avez déjà un compte?</Text>
              <Link href="/auth/login">
                <Text color="blue.500" fontWeight="semibold">
                  Connexion
                </Text>
              </Link>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
