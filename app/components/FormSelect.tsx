"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Select,
  useColorModeValue,
} from "@chakra-ui/react";

interface Option {
  value: string;
  label: string;
}

interface FormSelectProps {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  required?: boolean;
}

export default function FormSelect({
  label,
  name,
  options,
  error,
  value,
  onChange,
  required = false,
}: FormSelectProps) {
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const borderColor = useColorModeValue("gray.600", "gray.500");

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel color={textColor}>{label}</FormLabel>
      <Select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        bg={bgColor}
        color={textColor}
        borderColor={borderColor}
        _hover={{ borderColor: "gray.500" }}
        _focus={{ borderColor: "brand.500" }}
        title={label}
      >
        <option value="" disabled>
          Sélectionner une option
        </option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
