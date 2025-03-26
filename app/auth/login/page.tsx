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
} from "@chakra-ui/react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

export default function LoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        toast({
          title: "Erreur de connexion",
          description: result.error,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } else {
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
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
            Connexion
          </Heading>
          <form onSubmit={handleSubmit}>
            <Stack spacing={4}>
              <FormControl isRequired>
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
              </FormControl>
              <FormControl isRequired>
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
              </FormControl>
              <Button
                type="submit"
                colorScheme="red"
                size="lg"
                isLoading={isLoading}
              >
                Se connecter
              </Button>
            </Stack>
          </form>
          <Text textAlign="center">
            Pas encore de compte ?{" "}
            <Link href="/auth/register" passHref>
              <ChakraLink color="brand.gold">S'inscrire</ChakraLink>
            </Link>
          </Text>
        </Stack>
      </Box>
    </Container>
  );
}
