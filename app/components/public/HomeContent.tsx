"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Button,
  useColorModeValue,
  Spinner,
  Center,
  Flex,
  Tabs,
  TabList,
  Tab,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiArrowRight } from "react-icons/fi";
import ContentCard from "./ContentCard";

export default function HomeContent() {
  const [featuredContent, setFeaturedContent] = useState<any[]>([]);
  const [newContent, setNewContent] = useState<any[]>([]);
  const [freeContent, setFreeContent] = useState<any[]>([]);
  const [loadingFeatured, setLoadingFeatured] = useState(true);
  const [loadingNew, setLoadingNew] = useState(true);
  const [loadingFree, setLoadingFree] = useState(true);
  const [newContentTab, setNewContentTab] = useState("all");
  const [freeContentTab, setFreeContentTab] = useState("all");

  const bgColor = useColorModeValue("gray.900", "gray.900");
  const headingColor = useColorModeValue("white", "white");
  const sectionBg = useColorModeValue("gray.800", "gray.800");

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const response = await fetch("/api/contents?featured=true&limit=4");
        const data = await response.json();
        if (data && data.contents && Array.isArray(data.contents)) {
          
          setFeaturedContent(data.contents);
        } else {
          console.error(
            "Format de réponse API incorrect pour les contenus en vedette:",
            data
          );
          setFeaturedContent([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des contenus en vedette:",
          error
        );
        setFeaturedContent([]);
      } finally {
        setLoadingFeatured(false);
      }
    };

    const fetchNewContent = async () => {
      try {
        // On utilise le tri par date de création pour obtenir les contenus les plus récents
        const response = await fetch("/api/contents?limit=8");
        const data = await response.json();
        // Vérifier que data.contents existe avant de filtrer
        if (data && data.contents && Array.isArray(data.contents)) {
          // Filtrer pour ne garder que les nouveautés
          const newContentItems = data.contents.filter(
            (content: any) => content.isNew
          );
          
          setNewContent(newContentItems.slice(0, 8));
        } else {
          console.error(
            "Format de réponse API incorrect pour les nouveautés:",
            data
          );
          setNewContent([]);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des nouveautés:", error);
        setNewContent([]);
      } finally {
        setLoadingNew(false);
      }
    };

    const fetchFreeContent = async () => {
      try {
        // On récupère les contenus gratuits
        const response = await fetch("/api/contents?limit=8&price=0");
        const data = await response.json();
        // Vérifier que data.contents existe avant de filtrer
        if (data && data.contents && Array.isArray(data.contents)) {
          // Filtrer pour ne garder que les contenus réellement gratuits
          const freeContentItems = data.contents.filter(
            (content: any) => content.price === 0 || content.price === null
          );
         
          setFreeContent(freeContentItems.slice(0, 8));
        } else {
          console.error(
            "Format de réponse API incorrect pour les contenus gratuits:",
            data
          );
          setFreeContent([]);
        }
      } catch (error) {
        console.error(
          "Erreur lors du chargement des contenus gratuits:",
          error
        );
        setFreeContent([]);
      } finally {
        setLoadingFree(false);
      }
    };

    fetchFeaturedContent();
    fetchNewContent();
    fetchFreeContent();
  }, []);

  // Filtrer les contenus en fonction de l'onglet actif
  const filterContentByType = (contents: any[], type: string) => {
    if (!contents || !Array.isArray(contents)) return [];
    if (type === "all") return contents;
    return contents.filter((content) =>
      type === "films" ? content.type === "FILM" : content.type === "SERIE"
    );
  };

  // Contenus filtrés en fonction de l'onglet actif
  const filteredNewContent = filterContentByType(newContent, newContentTab);
  const filteredFreeContent = filterContentByType(freeContent, freeContentTab);

  const renderContentGrid = (
    contents: any[],
    loading: boolean,
    emptyMessage: string
  ) => {
    if (loading) {
      return (
        <Center py={10}>
          <Spinner size="xl" color="brand.500" />
        </Center>
      );
    }

    if (!contents || contents.length === 0) {
      return (
        <Center py={10}>
          <VStack>
            <Text color="gray.400">{emptyMessage}</Text>
            <Text color="red.400" fontSize="sm">
              Aucun contenu disponible
            </Text>
          </VStack>
        </Center>
      );
    }

    return (
      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
        {contents.map((content) => (
          <ContentCard
            key={content.id}
            id={content.id}
            title={content.title}
            imagePath={content.thumbnail || content.imagePath}
            type={content.type}
            releaseYear={content.year || content.releaseYear}
            duration={content.duration || 0}
            price={content.price || 0}
            isPremium={content.isPremium || content.price > 0}
            isNew={content.isNew}
            categories={
              content.categories || [
                { id: "1", name: content.genre || "Non catégorisé" },
              ]
            }
            seasonsCount={content.seasons?.length || content.seasonsCount || 0}
            episodesCount={
              content.episodes?.length || content.episodesCount || 0
            }
          />
        ))}
      </SimpleGrid>
    );
  };

  return (
    <Box py={20} bg={bgColor}>
      <Container maxW="container.xl">
        <VStack spacing={20} align="stretch">
          {/* Section Contenu en Vedette */}
          <Box>
            <Flex justify="space-between" align="center" mb={8}>
              <Heading as="h2" size="xl" color={headingColor}>
                Contenus en Vedette
              </Heading>
            </Flex>
            {renderContentGrid(
              featuredContent,
              loadingFeatured,
              "Aucun contenu en vedette disponible"
            )}
          </Box>

          {/* Section Nouveautés */}
          <Box bg={sectionBg} p={{ base: 4, md: 8 }} borderRadius="lg">
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={4}
              mb={8}
            >
              <Heading as="h2" size="xl" color={headingColor}>
                Nouveautés
              </Heading>
              <Tabs
                variant="soft-rounded"
                colorScheme="brand"
                onChange={(index) => {
                  const types = ["all", "films", "series"];
                  const newTab = types[index];
                  setNewContentTab(newTab);
                }}
                size="sm"
              >
                <TabList>
                  <Tab>Tous</Tab>
                  <Tab>Films</Tab>
                  <Tab>Séries</Tab>
                </TabList>
              </Tabs>
              <HStack>
                <Link href="/films" passHref>
                  <Button
                    variant="outline"
                    colorScheme="brand"
                    size="sm"
                    rightIcon={<FiArrowRight />}
                  >
                    Voir tous les films
                  </Button>
                </Link>
                <Link href="/series" passHref>
                  <Button
                    variant="outline"
                    colorScheme="brand"
                    size="sm"
                    rightIcon={<FiArrowRight />}
                  >
                    Voir toutes les séries
                  </Button>
                </Link>
              </HStack>
            </Flex>
            {renderContentGrid(
              filteredNewContent,
              loadingNew,
              "Aucune nouveauté disponible"
            )}
          </Box>

          {/* Section Contenus Gratuits */}
          <Box>
            <Flex
              justify="space-between"
              align="center"
              wrap="wrap"
              gap={4}
              mb={8}
            >
              <Heading as="h2" size="xl" color={headingColor}>
                Contenus Gratuits
              </Heading>
              <Tabs
                variant="soft-rounded"
                colorScheme="brand"
                onChange={(index) => {
                  const types = ["all", "films", "series"];
                  const newTab = types[index];
                  setFreeContentTab(newTab);
                }}
                size="sm"
              >
                <TabList>
                  <Tab>Tous</Tab>
                  <Tab>Films</Tab>
                  <Tab>Séries</Tab>
                </TabList>
              </Tabs>
            </Flex>
            {renderContentGrid(
              filteredFreeContent,
              loadingFree,
              "Aucun contenu gratuit disponible"
            )}
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
