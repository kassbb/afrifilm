"use client";

import {
  Box,
  Spinner,
  Text,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

interface LoadingSpinnerProps {
  message?: string;
}

export default function LoadingSpinner({
  message = "Chargement...",
}: LoadingSpinnerProps) {
  const textColor = useColorModeValue("white", "white");

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="200px"
      w="full"
    >
      <VStack spacing={4}>
        <Spinner
          thickness="4px"
          speed="0.65s"
          emptyColor="gray.700"
          color="brand.500"
          size="xl"
        />
        <Text color={textColor} fontSize="lg">
          {message}
        </Text>
      </VStack>
    </Box>
  );
}
