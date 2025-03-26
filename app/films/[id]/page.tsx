"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  Badge,
  useColorModeValue,
  Divider,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { VideoPlayer } from "@/app/components/VideoPlayer";
import NextImage from "next/image";

const film = {
  id: "1",
  title: "Le Dernier Combat",
  thumbnail: "/thumbnails/film1.jpg",
  videoUrl: "/videos/film1.mp4",
  price: 9.99,
  duration: "2h 15min",
  genre: "Action",
  description:
    "Un film captivant qui raconte l'histoire d'un guerrier malien face aux défis de son temps. Une épopée moderne qui mêle tradition et modernité.",
  director: "Mamadou Diallo",
  year: 2023,
  country: "Mali",
  language: "Bambara, Français",
  cast: [
    "Ibrahim Koné",
    "Fatoumata Coulibaly",
    "Moussa Diarra",
    "Aminata Traoré",
  ],
};

export default function FilmPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const [isPurchased, setIsPurchased] = useState(false);
  const [isWatching, setIsWatching] = useState(false);
  const textColor = useColorModeValue("gray.600", "gray.300");

  const handlePurchase = () => {
    // Simuler l'achat
    setIsPurchased(true);
  };

  const handleWatch = () => {
    setIsWatching(true);
  };

  return (
    <Box py={8}>
      <Container maxW="container.xl">
        <VStack spacing={8} align="stretch">
          {isWatching ? (
            <VideoPlayer src={film.videoUrl} title={film.title} />
          ) : (
            <>
              {/* En-tête du film */}
              <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
                <Box position="relative" height="400px">
                  <NextImage
                    src={film.thumbnail}
                    alt={film.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    style={{ objectFit: "cover", borderRadius: "0.5rem" }}
                  />
                </Box>
                <VStack align="start" spacing={4}>
                  <Heading size="2xl">{film.title}</Heading>
                  <HStack spacing={4}>
                    <Badge colorScheme="red">{film.price}€</Badge>
                    <Badge>{film.duration}</Badge>
                    <Badge>{film.genre}</Badge>
                  </HStack>
                  <Text color={textColor}>{film.description}</Text>
                  <VStack align="start" spacing={2}>
                    <Text>
                      <strong>Réalisateur :</strong> {film.director}
                    </Text>
                    <Text>
                      <strong>Année :</strong> {film.year}
                    </Text>
                    <Text>
                      <strong>Pays :</strong> {film.country}
                    </Text>
                    <Text>
                      <strong>Langue :</strong> {film.language}
                    </Text>
                  </VStack>
                  {!isPurchased ? (
                    <Button
                      colorScheme="red"
                      size="lg"
                      onClick={handlePurchase}
                      isDisabled={!session}
                    >
                      {session ? "Acheter" : "Connectez-vous pour acheter"}
                    </Button>
                  ) : (
                    <Button colorScheme="green" size="lg" onClick={handleWatch}>
                      Regarder
                    </Button>
                  )}
                </VStack>
              </SimpleGrid>

              <Divider />

              {/* Distribution */}
              <VStack align="start" spacing={4}>
                <Heading size="lg" color="white">
                  Distribution
                </Heading>
                <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
                  {film.cast.map((actor, index) => (
                    <Box
                      key={index}
                      p={4}
                      borderRadius="md"
                      bg="gray.800"
                      borderLeft="4px solid"
                      borderColor="orange.400"
                      _hover={{
                        transform: "translateY(-2px)",
                        transition: "transform 0.3s",
                      }}
                    >
                      <Text color="white">{actor}</Text>
                    </Box>
                  ))}
                </SimpleGrid>
              </VStack>
            </>
          )}
        </VStack>
      </Container>
    </Box>
  );
}
