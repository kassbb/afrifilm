"use client";

import { HStack, Button, Text, useColorModeValue } from "@chakra-ui/react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const hoverBgColor = useColorModeValue("gray.700", "gray.600");

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <HStack spacing={4} justify="center" py={8}>
      <Button
        onClick={handlePreviousPage}
        isDisabled={currentPage === 1}
        variant="outline"
        colorScheme="gray"
        bg={bgColor}
        color={textColor}
        borderColor="gray.600"
        _hover={{
          bg: hoverBgColor,
          borderColor: "gray.500",
        }}
        _disabled={{
          bg: "gray.900",
          color: "gray.500",
          borderColor: "gray.700",
        }}
      >
        <FiChevronLeft />
      </Button>
      <Text color={textColor}>
        Page {currentPage} sur {totalPages}
      </Text>
      <Button
        onClick={handleNextPage}
        isDisabled={currentPage === totalPages}
        variant="outline"
        colorScheme="gray"
        bg={bgColor}
        color={textColor}
        borderColor="gray.600"
        _hover={{
          bg: hoverBgColor,
          borderColor: "gray.500",
        }}
        _disabled={{
          bg: "gray.900",
          color: "gray.500",
          borderColor: "gray.700",
        }}
      >
        <FiChevronRight />
      </Button>
    </HStack>
  );
}
