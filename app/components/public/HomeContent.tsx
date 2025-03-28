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
  const [activeTab, setActiveTab] = useState("all");

  const bgColor = useColorModeValue("gray.900", "gray.900");
  const headingColor = useColorModeValue("white", "white");
  const sectionBg = useColorModeValue("gray.800", "gray.800");

  useEffect(() => {
    const fetchFeaturedContent = async () => {
      try {
        const response = await fetch(
          "/api/public/contents?featured=true&limit=4"
        );
        const data = await response.json();
        setFeaturedContent(data.contents || []);
      } catch (error) {
        console.error(
          "Erreur lors du chargement des contenus en vedette:",
          error
        );
      } finally {
        setLoadingFeatured(false);
      }
    };

    const fetchNewContent = async () => {
      try {
        // On utilise le tri par date de création pour obtenir les contenus les plus récents
        const response = await fetch("/api/public/contents?limit=8");
        const data = await response.json();
        // Filtrer pour ne garder que les nouveautés
        const newContentItems = data.contents.filter(
          (content: any) => content.isNew
        );
        setNewContent(newContentItems.slice(0, 8));
      } catch (error) {
        console.error("Erreur lors du chargement des nouveautés:", error);
      } finally {
        setLoadingNew(false);
      }
    };

    const fetchFreeContent = async () => {
      try {
        // On récupère les contenus gratuits
        const response = await fetch("/api/public/contents?limit=8");
        const data = await response.json();
        // Filtrer pour ne garder que les contenus gratuits
        const freeContentItems = data.contents.filter(
          (content: any) => !content.isPremium
        );
        setFreeContent(freeContentItems.slice(0, 8));
      } catch (error) {
        console.error(
          "Erreur lors du chargement des contenus gratuits:",
          error
        );
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
    if (type === "all") return contents;
    return contents.filter((content) =>
      type === "films" ? content.type === "FILM" : content.type === "SERIE"
    );
  };

  // Contenus filtrés en fonction de l'onglet actif
  const filteredNewContent = filterContentByType(newContent, activeTab);
  const filteredFreeContent = filterContentByType(freeContent, activeTab);

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

    if (contents.length === 0) {
      return (
        <Center py={10}>
          <Text color="gray.400">{emptyMessage}</Text>
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
            imagePath={content.imagePath}
            type={content.type}
            releaseYear={content.releaseYear}
            duration={content.duration}
            price={content.price}
            isPremium={content.isPremium}
            isNew={content.isNew}
            categories={content.categories}
            seasonsCount={content.seasonsCount}
            episodesCount={content.episodesCount}
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
                  setActiveTab(types[index]);
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
                  setActiveTab(types[index]);
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
