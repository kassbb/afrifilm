"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  useColorModeValue,
  Text,
  Spinner,
  Center,
  Select,
  Flex,
  Alert,
  AlertIcon,
} from "@chakra-ui/react";
import Footer from "@/app/components/Footer";
import SearchBar from "@/app/components/SearchBar";
import Pagination from "@/app/components/Pagination";
import ContentCard from "@/app/components/public/ContentCard";

export default function SeriesPage() {
  const [series, setSeries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 12;

  const bgColor = useColorModeValue("gray.900", "gray.900");

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("/api/contents/categories?type=SERIE");
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }
        const data = await response.json();
        setCategories(data.categories || []);
      } catch (error: any) {
        console.error("Erreur lors du chargement des catégories:", error);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchSeries = async () => {
      setLoading(true);
      setError(null);

      try {
        // Construire les paramètres d'API
        const params = new URLSearchParams({
          type: "SERIE",
          limit: itemsPerPage.toString(),
          page: currentPage.toString(),
        });

        if (searchQuery) {
          params.append("search", searchQuery);
        }

        if (selectedCategory) {
          params.append("genre", selectedCategory);
        }

        const apiUrl = `/api/contents?${params.toString()}`;
        console.log("Appel API:", apiUrl);

        // Appeler l'API
        const response = await fetch(apiUrl);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error ||
              `Erreur HTTP: ${response.status} ${response.statusText}`
          );
        }

        const data = await response.json();
        console.log("Données reçues:", data);

        setSeries(data.contents || []);
        setTotalItems(data.pagination?.totalCount || 0);
      } catch (err: any) {
        console.error("Erreur lors du chargement des séries:", err);
        setError(
          `Impossible de charger les séries: ${
            err.message || "Erreur inconnue"
          }`
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSeries();
  }, [currentPage, searchQuery, selectedCategory]);

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value;
    setSelectedCategory(value === "all" ? null : value);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={{ base: 6, md: 12 }}>
        <VStack spacing={8} align="stretch">
          <Heading color="white" textAlign="center" size="2xl">
            Séries
          </Heading>

          {error && (
            <Alert status="error" borderRadius="md">
              <AlertIcon />
              {error}
            </Alert>
          )}

          <Flex
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            gap={4}
          >
            <SearchBar onSearch={handleSearch} />

            <Select
              placeholder="Tous les genres"
              onChange={handleCategoryChange}
              maxW={{ base: "full", md: "200px" }}
              bg="gray.800"
              color="white"
              borderColor="gray.600"
              aria-label="Filtrer par genre"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.contentCount || 0})
                </option>
              ))}
            </Select>
          </Flex>

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" color="white" />
            </Center>
          ) : series.length === 0 ? (
            <Center py={10}>
              <Text color="white">
                Aucune série ne correspond à vos critères.
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {series.map((serie) => (
                <ContentCard
                  key={serie.id}
                  id={serie.id}
                  title={serie.title}
                  imagePath={serie.thumbnail}
                  type={serie.type}
                  releaseYear={serie.year}
                  duration={0}
                  price={serie.price}
                  isPremium={serie.price > 0}
                  isNew={serie.isNew}
                  categories={[{ id: "1", name: serie.genre }]}
                />
              ))}
            </SimpleGrid>
          )}

          {!loading && series.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={Math.ceil(totalItems / itemsPerPage)}
              onPageChange={handlePageChange}
            />
          )}
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
