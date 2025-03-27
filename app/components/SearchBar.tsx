"use client";

import {
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiSearch } from "react-icons/fi";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
}

export default function SearchBar({
  onSearch,
  placeholder = "Rechercher un film ou une série...",
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (query.trim()) {
      if (onSearch) {
        // Utiliser le callback si fourni
        onSearch(query.trim());
      } else {
        // Sinon, rediriger vers la page de recherche
        router.push(`/search?q=${encodeURIComponent(query.trim())}`);
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);

    // Option: recherche en temps réel si onSearch est fourni
    // if (onSearch && newQuery.length > 2) {
    //   onSearch(newQuery);
    // }
  };

  return (
    <form onSubmit={handleSearch}>
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none">
          <FiSearch color={placeholderColor} />
        </InputLeftElement>
        <Input
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          bg={bgColor}
          color={textColor}
          borderColor="gray.600"
          _hover={{ borderColor: "gray.500" }}
          _focus={{ borderColor: "brand.500" }}
          _placeholder={{ color: placeholderColor }}
        />
      </InputGroup>
    </form>
  );
}
