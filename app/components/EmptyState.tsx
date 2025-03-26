"use client";

import { Box, Text, Button, VStack, useColorModeValue } from "@chakra-ui/react";
import { FiInbox } from "react-icons/fi";

interface EmptyStateProps {
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function EmptyState({
  message,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const textColor = useColorModeValue("white", "white");
  const bgColor = useColorModeValue("gray.800", "gray.700");

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
        <FiInbox size={48} color="white" />
        <Text color={textColor} fontSize="lg" textAlign="center">
          {message}
        </Text>
        {actionLabel && onAction && (
          <Button
            colorScheme="brand"
            variant="outline"
            onClick={onAction}
            _hover={{ bg: "brand.600" }}
          >
            {actionLabel}
          </Button>
        )}
      </VStack>
    </Box>
  );
}
