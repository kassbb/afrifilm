"use client";

import { useState } from "react";
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
  IconButton,
} from "@chakra-ui/react";
import { FiArrowLeft, FiClock, FiPlay } from "react-icons/fi";
import { useRouter } from "next/navigation";
import Footer from "@/app/components/Footer";
import VideoPlayer from "@/app/components/VideoPlayer";

// Données temporaires pour l'épisode
const episode = {
  id: "1",
  title: "Le Début",
  description:
    "Dans ce premier épisode, nous découvrons la vie quotidienne des habitants du village...",
  videoUrl: "/videos/episode1.mp4",
  duration: "45min",
  season: 1,
  episode: 1,
  thumbnail: "/images/episode1.jpg",
  serie: {
    id: "1",
    title: "La Vie Dans Le Village",
    thumbnail: "/images/serie1.jpg",
  },
};

export default function EpisodePage({
  params,
}: {
  params: { id: string; episodeId: string };
}) {
  const router = useRouter();
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const [isWatching, setIsWatching] = useState(false);

  const handleBack = () => {
    router.push(`/series/${params.id}`);
  };

  const handleWatch = () => {
    setIsWatching(true);
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <HStack spacing={4}>
            <IconButton
              aria-label="Retour"
              icon={<FiArrowLeft />}
              onClick={handleBack}
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
            />
            <Heading color="white" size="xl">
              {episode.serie.title}
            </Heading>
          </HStack>

          {isWatching ? (
            <Box h="80vh">
              <VideoPlayer videoUrl={episode.videoUrl} />
            </Box>
          ) : (
            <Box
              position="relative"
              h="60vh"
              bgImage={`url(${episode.thumbnail})`}
              bgSize="cover"
              bgPosition="center"
              borderRadius="lg"
              overflow="hidden"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient="linear(to-t, blackAlpha.800, transparent)"
                display="flex"
                flexDirection="column"
                justifyContent="flex-end"
                p={8}
              >
                <VStack align="stretch" spacing={4}>
                  <Heading color="white" size="3xl">
                    {episode.title}
                  </Heading>
                  <HStack spacing={4}>
                    <Badge colorScheme="brand" variant="solid">
                      Saison {episode.season} • Épisode {episode.episode}
                    </Badge>
                    <HStack color="white">
                      <FiClock />
                      <Text>{episode.duration}</Text>
                    </HStack>
                  </HStack>
                  <Text color="white" fontSize="lg">
                    {episode.description}
                  </Text>
                  <Button
                    colorScheme="brand"
                    size="lg"
                    w="fit-content"
                    leftIcon={<FiPlay />}
                    onClick={handleWatch}
                  >
                    Regarder
                  </Button>
                </VStack>
              </Box>
            </Box>
          )}
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
