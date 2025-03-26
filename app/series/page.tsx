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
import SerieCard from "@/app/components/SerieCard";
import CategoryFilter from "@/app/components/CategoryFilter";
import SearchBar from "@/app/components/SearchBar";
import Pagination from "@/app/components/Pagination";

// Données temporaires pour les séries
const series = [
  {
    id: "1",
    title: "La Saga des Ancêtres",
    thumbnail: "/images/serie1.jpg",
    seasons: 3,
    genre: "Drame",
    price: "14.99€",
  },
  {
    id: "2",
    title: "Les Secrets du Sahel",
    thumbnail: "/images/serie2.jpg",
    seasons: 2,
    genre: "Thriller",
    price: "12.99€",
  },
  {
    id: "3",
    title: "La Voix des Ancêtres",
    thumbnail: "/images/serie3.jpg",
    seasons: 4,
    genre: "Histoire",
    price: "16.99€",
  },
  {
    id: "4",
    title: "Le Dernier Combat",
    thumbnail: "/images/serie4.jpg",
    seasons: 2,
    genre: "Action",
    price: "13.99€",
  },
  // Ajoutez plus de séries ici
];

export default function SeriesPage() {
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
            Séries
          </Heading>

          <SearchBar />

          <CategoryFilter onCategoryChange={handleCategoryChange} />

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {series.map((serie) => (
              <SerieCard key={serie.id} {...serie} />
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
