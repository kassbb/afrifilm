"use client";

import { HStack, Button, useColorModeValue } from "@chakra-ui/react";
import { useState } from "react";

const categories = [
  "Tous",
  "Drame",
  "Comédie",
  "Action",
  "Romance",
  "Documentaire",
  "Animation",
  "Thriller",
  "Science-fiction",
  "Horreur",
];

interface CategoryFilterProps {
  onCategoryChange: (category: string) => void;
}

export default function CategoryFilter({
  onCategoryChange,
}: CategoryFilterProps) {
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const hoverBgColor = useColorModeValue("gray.700", "gray.600");

  const handleCategoryClick = (category: string) => {
    setSelectedCategory(category);
    onCategoryChange(category);
  };

  return (
    <HStack spacing={2} overflowX="auto" py={2} px={4}>
      {categories.map((category) => (
        <Button
          key={category}
          size="sm"
          variant={selectedCategory === category ? "solid" : "outline"}
          colorScheme={selectedCategory === category ? "brand" : "gray"}
          bg={selectedCategory === category ? "brand.500" : bgColor}
          color={textColor}
          borderColor={selectedCategory === category ? "brand.500" : "gray.600"}
          _hover={{
            bg: selectedCategory === category ? "brand.600" : hoverBgColor,
            borderColor:
              selectedCategory === category ? "brand.600" : "gray.500",
          }}
          onClick={() => handleCategoryClick(category)}
        >
          {category}
        </Button>
      ))}
    </HStack>
  );
}
