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
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  List,
  ListItem,
  ListIcon,
  SimpleGrid,
  Image,
} from "@chakra-ui/react";
import {
  FiUser,
  FiCalendar,
  FiGlobe,
  FiTag,
  FiClock,
  FiPlay,
} from "react-icons/fi";
import Footer from "@/app/components/Footer";

// Données temporaires pour la série
const serie = {
  id: "1",
  title: "La Vie Dans Le Village",
  thumbnail: "/images/serie1.jpg",
  price: "9.99€",
  seasons: 3,
  genre: "Drame",
  description:
    "Une série captivante qui suit la vie quotidienne des habitants d'un village africain...",
  director: "Moussa Sene",
  year: "2023",
  country: "Sénégal",
  language: "Wolof",
  cast: ["Omar Sy", "Fatou N'Diaye", "Mamadou Diallo", "Aminata Sow"],
  episodes: [
    {
      id: "1",
      title: "Le Début",
      thumbnail: "/images/episode1.jpg",
      duration: "45min",
      season: 1,
      episode: 1,
    },
    {
      id: "2",
      title: "Les Premiers Pas",
      thumbnail: "/images/episode2.jpg",
      duration: "45min",
      season: 1,
      episode: 2,
    },
    // Ajoutez plus d'épisodes ici
  ],
};

export default function SeriePage({ params }: { params: { id: string } }) {
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const [selectedSeason, setSelectedSeason] = useState(1);

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Box
            position="relative"
            h="60vh"
            bgImage={`url(${serie.thumbnail})`}
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
                  {serie.title}
                </Heading>
                <HStack spacing={4}>
                  <Badge colorScheme="brand" variant="solid">
                    {serie.genre}
                  </Badge>
                  <HStack color="white">
                    <FiClock />
                    <Text>{serie.seasons} Saisons</Text>
                  </HStack>
                </HStack>
                <Text color="white" fontSize="xl">
                  {serie.price}
                </Text>
              </VStack>
            </Box>
          </Box>

          <VStack spacing={6} align="stretch">
            <Heading color="white" size="xl">
              À propos de la série
            </Heading>
            <Text color="white" fontSize="lg">
              {serie.description}
            </Text>

            <HStack spacing={8} wrap="wrap">
              <HStack color="white">
                <FiUser />
                <Text>Réalisateur : {serie.director}</Text>
              </HStack>
              <HStack color="white">
                <FiCalendar />
                <Text>Année : {serie.year}</Text>
              </HStack>
              <HStack color="white">
                <FiGlobe />
                <Text>Pays : {serie.country}</Text>
              </HStack>
              <HStack color="white">
                <FiTag />
                <Text>Langue : {serie.language}</Text>
              </HStack>
            </HStack>

            <Accordion allowToggle>
              <AccordionItem borderColor="gray.700">
                <h2>
                  <AccordionButton _hover={{ bg: "whiteAlpha.200" }}>
                    <Box flex="1" textAlign="left" color="white">
                      Distribution
                    </Box>
                    <AccordionIcon color="white" />
                  </AccordionButton>
                </h2>
                <AccordionPanel pb={4}>
                  <List spacing={3}>
                    {serie.cast.map((actor, index) => (
                      <ListItem key={index} color="white">
                        <ListIcon as={FiUser} color="orange.400" />
                        {actor}
                      </ListItem>
                    ))}
                  </List>
                </AccordionPanel>
              </AccordionItem>
            </Accordion>

            <VStack spacing={4} align="stretch">
              <Heading color="white" size="lg">
                Épisodes
              </Heading>
              <HStack spacing={4}>
                {Array.from({ length: serie.seasons }, (_, i) => i + 1).map(
                  (season) => (
                    <Button
                      key={season}
                      colorScheme={selectedSeason === season ? "brand" : "gray"}
                      variant={selectedSeason === season ? "solid" : "outline"}
                      onClick={() => setSelectedSeason(season)}
                    >
                      Saison {season}
                    </Button>
                  )
                )}
              </HStack>
              <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
                {serie.episodes
                  .filter((ep) => ep.season === selectedSeason)
                  .map((episode) => (
                    <Box
                      key={episode.id}
                      position="relative"
                      borderRadius="lg"
                      overflow="hidden"
                      cursor="pointer"
                      _hover={{
                        transform: "scale(1.02)",
                        transition: "transform 0.2s",
                      }}
                    >
                      <Image
                        src={episode.thumbnail}
                        alt={episode.title}
                        w="100%"
                        h="200px"
                        objectFit="cover"
                      />
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
                        p={4}
                      >
                        <VStack align="stretch" spacing={2}>
                          <HStack justify="space-between">
                            <Text color="white" fontWeight="bold">
                              {episode.title}
                            </Text>
                            <HStack color="white">
                              <FiClock />
                              <Text>{episode.duration}</Text>
                            </HStack>
                          </HStack>
                          <HStack color="white">
                            <FiPlay />
                            <Text>Épisode {episode.episode}</Text>
                          </HStack>
                        </VStack>
                      </Box>
                    </Box>
                  ))}
              </SimpleGrid>
            </VStack>
          </VStack>
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
