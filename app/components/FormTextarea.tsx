"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
  useColorModeValue,
} from "@chakra-ui/react";

interface FormTextareaProps {
  label: string;
  name: string;
  placeholder?: string;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  required?: boolean;
  rows?: number;
}

export default function FormTextarea({
  label,
  name,
  placeholder,
  error,
  value,
  onChange,
  required = false,
  rows = 4,
}: FormTextareaProps) {
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const borderColor = useColorModeValue("gray.600", "gray.500");

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel color={textColor}>{label}</FormLabel>
      <Textarea
        name={name}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
        rows={rows}
        bg={bgColor}
        color={textColor}
        borderColor={borderColor}
        _hover={{ borderColor: "gray.500" }}
        _focus={{ borderColor: "brand.500" }}
        _placeholder={{ color: placeholderColor }}
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
