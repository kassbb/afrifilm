"use client";

import {
  Box,
  Text,
  IconButton,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiX } from "react-icons/fi";

interface ToastProps {
  message: string;
  type?: "success" | "error" | "info" | "warning";
  onClose: () => void;
}

export default function Toast({ message, type = "info", onClose }: ToastProps) {
  const bgColor = useColorModeValue(
    type === "success"
      ? "green.900"
      : type === "error"
      ? "red.900"
      : type === "warning"
      ? "yellow.900"
      : "blue.900",
    type === "success"
      ? "green.800"
      : type === "error"
      ? "red.800"
      : type === "warning"
      ? "yellow.800"
      : "blue.800"
  );
  const textColor = useColorModeValue("white", "white");

  return (
    <Box
      position="fixed"
      bottom={4}
      right={4}
      bg={bgColor}
      color={textColor}
      px={6}
      py={4}
      borderRadius="lg"
      boxShadow="lg"
      zIndex={1000}
      maxW="400px"
    >
      <HStack justify="space-between">
        <Text>{message}</Text>
        <IconButton
          aria-label="Close"
          icon={<FiX />}
          size="sm"
          variant="ghost"
          color={textColor}
          onClick={onClose}
          _hover={{ bg: "whiteAlpha.200" }}
        />
      </HStack>
    </Box>
  );
}
