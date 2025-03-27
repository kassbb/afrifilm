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
} from "@chakra-ui/react";
import Footer from "@/app/components/Footer";
import FilmCard from "@/app/components/FilmCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import SearchBar from "@/app/components/SearchBar";
import Pagination from "@/app/components/Pagination";
import { getContents, Content } from "@/app/services/api";

export default function FilmsPage() {
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const [films, setFilms] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtres et pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  // Paramètres de l'API
  const [apiParams, setApiParams] = useState({
    type: "FILM" as const,
    page: 1,
    limit: 12,
  });

  useEffect(() => {
    const fetchFilms = async () => {
      setLoading(true);
      try {
        // Construire les paramètres d'API en fonction des filtres
        const params: any = {
          ...apiParams,
          page: currentPage,
        };

        // Ajouter les filtres si nécessaire
        if (selectedGenre !== "Tous") {
          params.genre = selectedGenre;
        }

        if (searchQuery) {
          params.title = searchQuery;
        }

        // Appeler l'API
        const response = await getContents(params);
        setFilms(response.contents || []);
        setTotalPages(response.meta?.pages || 1);
      } catch (err) {
        console.error("Erreur lors du chargement des films:", err);
        setError(
          "Impossible de charger les films. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [apiParams, currentPage, selectedGenre, searchQuery]);

  const handleCategoryChange = (category: string) => {
    setSelectedGenre(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Heading color="white" textAlign="center" size="2xl">
            Films
          </Heading>

          <SearchBar onSearch={handleSearch} />

          <CategoryFilter onCategoryChange={handleCategoryChange} />

          {loading ? (
            <Center py={10}>
              <Spinner size="xl" color="white" />
            </Center>
          ) : error ? (
            <Center py={10}>
              <Text color="red.500">{error}</Text>
            </Center>
          ) : films.length === 0 ? (
            <Center py={10}>
              <Text color="white">
                Aucun film ne correspond à vos critères.
              </Text>
            </Center>
          ) : (
            <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
              {films.map((film) => (
                <FilmCard
                  key={film.id}
                  id={film.id}
                  title={film.title}
                  thumbnail={film.thumbnail}
                  duration={
                    film.film?.duration
                      ? `${Math.floor(film.film.duration / 60)}h ${
                          film.film.duration % 60
                        }min`
                      : ""
                  }
                  genre={film.genre || ""}
                  price={film.price ? `${film.price}€` : "Gratuit"}
                />
              ))}
            </SimpleGrid>
          )}

          {!loading && !error && films.length > 0 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          )}
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
