"use client";

import { useState } from "react";
import {
  Box,
  Container,
  Heading,
  VStack,
  SimpleGrid,
  useColorModeValue,
} from "@chakra-ui/react";
import Footer from "@/app/components/Footer";
import FilmCard from "@/app/components/FilmCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import SearchBar from "@/app/components/SearchBar";
import Pagination from "@/app/components/Pagination";

// Données temporaires pour les films
const films = [
  {
    id: "1",
    title: "La Vie Est Belle",
    thumbnail: "/images/film1.jpg",
    duration: "2h 15min",
    genre: "Drame",
    price: "4.99€",
  },
  {
    id: "2",
    title: "Bal Poussière",
    thumbnail: "/images/film2.jpg",
    duration: "1h 45min",
    genre: "Comédie",
    price: "3.99€",
  },
  {
    id: "3",
    title: "Yaaba",
    thumbnail: "/images/film3.jpg",
    duration: "1h 30min",
    genre: "Drame",
    price: "4.99€",
  },
  {
    id: "4",
    title: "Tilai",
    thumbnail: "/images/film4.jpg",
    duration: "2h 00min",
    genre: "Drame",
    price: "4.99€",
  },
  // Ajoutez plus de films ici
];

export default function FilmsPage() {
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const totalPages = 5; // À remplacer par le nombre réel de pages

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <Box bg={bgColor} minH="100vh">
      <Container maxW="container.xl" py={12}>
        <VStack spacing={8} align="stretch">
          <Heading color="white" textAlign="center" size="2xl">
            Films
          </Heading>

          <SearchBar />

          <CategoryFilter onCategoryChange={handleCategoryChange} />

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {films.map((film) => (
              <FilmCard key={film.id} {...film} />
            ))}
          </SimpleGrid>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </VStack>
      </Container>
      <Footer />
    </Box>
  );
}
