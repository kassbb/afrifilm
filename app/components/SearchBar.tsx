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

export default function SearchBar() {
  const [query, setQuery] = useState("");
  const router = useRouter();
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <form onSubmit={handleSearch}>
      <InputGroup size="lg">
        <InputLeftElement pointerEvents="none">
          <FiSearch color={placeholderColor} />
        </InputLeftElement>
        <Input
          placeholder="Rechercher un film ou une série..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
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
