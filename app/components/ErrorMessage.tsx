"use client";

import { Box, Text, Button, VStack, useColorModeValue } from "@chakra-ui/react";
import { FiAlertCircle } from "react-icons/fi";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  const textColor = useColorModeValue("white", "white");
  const bgColor = useColorModeValue("red.900", "red.800");

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minH="200px"
      w="full"
      bg={bgColor}
      borderRadius="lg"
      p={8}
    >
      <VStack spacing={4}>
        <FiAlertCircle size={48} color="white" />
        <Text color={textColor} fontSize="lg" textAlign="center">
          {message}
        </Text>
        {onRetry && (
          <Button
            colorScheme="red"
            variant="outline"
            onClick={onRetry}
            _hover={{ bg: "red.700" }}
          >
            Réessayer
          </Button>
        )}
      </VStack>
    </Box>
  );
}
