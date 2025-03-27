"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
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
  FormErrorMessage,
  Divider,
  Flex,
} from "@chakra-ui/react";
import { z } from "zod";

// Schéma de validation du formulaire
const loginSchema = z.object({
  email: z.string().email("Adresse email invalide"),
  password: z.string().min(1, "Le mot de passe est requis"),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Effacer l'erreur lorsque l'utilisateur modifie le champ
    if (errors[name as keyof LoginFormData]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Valider les données du formulaire
      loginSchema.parse(formData);

      // Tenter la connexion avec NextAuth
      const result = await signIn("credentials", {
        redirect: false,
        email: formData.email,
        password: formData.password,
      });

      if (result?.error) {
        toast({
          title: "Échec de la connexion",
          description: "Email ou mot de passe incorrect",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        // Connexion réussie
        toast({
          title: "Connexion réussie",
          status: "success",
          duration: 3000,
          isClosable: true,
        });

        // Rediriger vers la page d'accueil
        router.push("/");
      }
    } catch (error) {
      // Gérer les erreurs de validation Zod
      if (error instanceof z.ZodError) {
        const newErrors: Partial<LoginFormData> = {};
        error.errors.forEach((err) => {
          if (err.path) {
            newErrors[err.path[0] as keyof LoginFormData] = err.message;
          }
        });
        setErrors(newErrors);
      } else {
        // Afficher un message d'erreur général
        toast({
          title: "Erreur",
          description: "Une erreur s'est produite. Veuillez réessayer.",
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
            Se connecter
          </Heading>
          <Text color="gray.600">
            Connectez-vous pour accéder à votre compte AfriFilm
          </Text>
        </Box>

        <Box as="form" onSubmit={handleSubmit}>
          <VStack spacing={4}>
            <FormControl isInvalid={!!errors.email} isRequired>
              <FormLabel htmlFor="email">Email</FormLabel>
              <Input
                id="email"
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
              <FormLabel htmlFor="password">Mot de passe</FormLabel>
              <Input
                id="password"
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

            <Button
              type="submit"
              colorScheme="blue"
              width="full"
              mt={6}
              isLoading={isLoading}
              loadingText="Connexion..."
            >
              Se connecter
            </Button>

            <Divider my={6} />

            <Flex justifyContent="center">
              <Text mr={2}>Vous n'avez pas de compte ?</Text>
              <Link href="/auth/register">
                <Text color="blue.500" fontWeight="semibold">
                  S'inscrire
                </Text>
              </Link>
            </Flex>
          </VStack>
        </Box>
      </VStack>
    </Container>
  );
}
