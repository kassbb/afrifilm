"use client";

import {
  Box,
  Button,
  Container,
  FormControl,
  FormLabel,
  Input,
  Stack,
  Text,
  useToast,
  Heading,
  Link as ChakraLink,
  Radio,
  RadioGroup,
  FormErrorMessage,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

const registerSchema = z
  .object({
    email: z.string().email("Email invalide"),
    password: z
      .string()
      .min(8, "Le mot de passe doit contenir au moins 8 caractères"),
    confirmPassword: z.string(),
    role: z.enum(["USER", "CREATOR"]),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export default function RegisterPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrors({});

    const formData = new FormData(e.currentTarget);
    const data = {
      email: formData.get("email") as string,
      password: formData.get("password") as string,
      confirmPassword: formData.get("confirmPassword") as string,
      role: formData.get("role") as "USER" | "CREATOR",
    };

    try {
      registerSchema.parse(data);

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          password: data.password,
          role: data.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: "Compte créé avec succès",
        description: "Vous pouvez maintenant vous connecter",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      router.push("/auth/login");
    } catch (error) {
      if (error instanceof z.ZodError) {
        const formattedErrors: Record<string, string> = {};
        error.errors.forEach((err) => {
          if (err.path[0]) {
            formattedErrors[err.path[0] as string] = err.message;
          }
        });
        setErrors(formattedErrors);
      } else {
        toast({
          title: "Erreur",
          description:
            error instanceof Error ? error.message : "Une erreur est survenue",
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
    <Container maxW="container.sm" py={20}>
      <Box
        p={8}
        borderWidth={1}
        borderRadius="lg"
        boxShadow="lg"
        bg="whiteAlpha.100"
      >
        <Stack spacing={6}>
          <Heading textAlign="center" color="brand.gold">
            Créer un compte
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  name="email"
                  type="email"
                  placeholder="votre@email.com"
                  bg="whiteAlpha.200"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "whiteAlpha.400" }}
                  _focus={{ borderColor: "brand.gold" }}
                />
                <FormErrorMessage>{errors.email}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.password}>
                <FormLabel>Mot de passe</FormLabel>
                <Input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  bg="whiteAlpha.200"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "whiteAlpha.400" }}
                  _focus={{ borderColor: "brand.gold" }}
                />
                <FormErrorMessage>{errors.password}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired isInvalid={!!errors.confirmPassword}>
                <FormLabel>Confirmer le mot de passe</FormLabel>
                <Input
                  name="confirmPassword"
                  type="password"
                  placeholder="••••••••"
                  bg="whiteAlpha.200"
                  borderColor="whiteAlpha.300"
                  _hover={{ borderColor: "whiteAlpha.400" }}
                  _focus={{ borderColor: "brand.gold" }}
                />
                <FormErrorMessage>{errors.confirmPassword}</FormErrorMessage>
              </FormControl>
              <FormControl isRequired>
                <FormLabel>Type de compte</FormLabel>
                <RadioGroup name="role" defaultValue="USER">
                  <Stack direction="row" spacing={8}>
                    <Radio value="USER">Spectateur</Radio>
                    <Radio value="CREATOR">Créateur</Radio>
                  </Stack>
                </RadioGroup>
              </FormControl>
              <Button
                type="submit"
                colorScheme="red"
                size="lg"
                isLoading={isLoading}
              >
                S'inscrire
              </Button>
            </Stack>
          </form>
          <Text textAlign="center">
            Déjà un compte ?{" "}
            <Link href="/auth/login" passHref>
              <ChakraLink color="brand.gold">Se connecter</ChakraLink>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
}
