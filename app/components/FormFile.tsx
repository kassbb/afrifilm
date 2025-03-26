"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Input,
  InputGroup,
  InputLeftElement,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiUpload } from "react-icons/fi";

interface FormFileProps {
  label: string;
  name: string;
  error?: string;
  accept?: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function FormFile({
  label,
  name,
  error,
  accept,
  onChange,
  required = false,
}: FormFileProps) {
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const borderColor = useColorModeValue("gray.600", "gray.500");

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel color={textColor}>{label}</FormLabel>
      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FiUpload color={textColor} />
        </InputLeftElement>
        <Input
          type="file"
          name={name}
          accept={accept}
          onChange={onChange}
          required={required}
          bg={bgColor}
          color={textColor}
          borderColor={borderColor}
          _hover={{ borderColor: "gray.500" }}
          _focus={{ borderColor: "brand.500" }}
          sx={{
            "&::file-selector-button": {
              bg: "brand.500",
              color: "white",
              border: "none",
              padding: "8px 16px",
              borderRadius: "md",
              cursor: "pointer",
              _hover: {
                bg: "brand.600",
              },
            },
          }}
        />
      </InputGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
