"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
  Flex,
  Stack,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiPlay, FiInfo } from "react-icons/fi";
import { useSession } from "next-auth/react";

export default function Hero() {
  const { data: session } = useSession();
  const bgGradient = useColorModeValue(
    "linear(to-b, gray.900, black)",
    "linear(to-b, gray.900, black)"
  );
  const textColor = useColorModeValue("white", "white");

  return (
    <Box
      bgGradient={bgGradient}
      py={20}
      px={4}
      backgroundImage="url('/images/hero-bg.jpg')"
      backgroundSize="cover"
      backgroundPosition="center"
      position="relative"
      _after={{
        content: '""',
        display: "block",
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        bg: "black",
        opacity: 0.7,
        zIndex: 0,
      }}
    >
      <Flex
        direction="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        maxW="container.md"
        mx="auto"
        position="relative"
        zIndex={1}
      >
        <Heading
          as="h1"
          size="3xl"
          fontWeight="bold"
          color={textColor}
          mb={6}
        >
          Découvrez le meilleur du cinéma africain
        </Heading>
        <Text
          fontSize={{ base: "xl", md: "2xl" }}
          color={textColor}
          mb={10}
          maxW="3xl"
        >
          AfriFilm vous propose une sélection unique de films et séries africains. 
          Explorez la richesse culturelle du continent à travers des histoires captivantes.
        </Text>

        {!session ? (
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Link href="/auth/register" passHref>
              <Button
                size="lg"
                colorScheme="red"
                fontWeight="bold"
                px={8}
              >
                S'inscrire gratuitement
              </Button>
            </Link>
            <Link href="/auth/login" passHref>
              <Button
                size="lg"
                colorScheme="whiteAlpha"
                fontWeight="bold"
                px={8}
              >
                Se connecter
              </Button>
            </Link>
          </Stack>
        ) : (
          <Stack direction={{ base: "column", md: "row" }} spacing={4}>
            <Link href="/films" passHref>
              <Button
                size="lg"
                colorScheme="red"
                fontWeight="bold"
                px={8}
              >
                Explorer les films
              </Button>
            </Link>
            <Link href="/series" passHref>
              <Button
                size="lg"
                colorScheme="whiteAlpha"
                fontWeight="bold"
                px={8}
              >
                Voir les séries
              </Button>
            </Link>
          </Stack>
        )}
      </Flex>
    </Box>
  );
}
