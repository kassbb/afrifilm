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
import { IconType } from "react-icons";

interface FormInputProps {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  icon?: IconType;
  error?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
  step?: string;
}

export default function FormInput({
  label,
  name,
  type = "text",
  placeholder,
  icon: Icon,
  error,
  value,
  onChange,
  required = false,
  step,
}: FormInputProps) {
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const placeholderColor = useColorModeValue("gray.400", "gray.500");
  const borderColor = useColorModeValue("gray.600", "gray.500");

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel color={textColor}>{label}</FormLabel>
      <InputGroup>
        {Icon && (
          <InputLeftElement pointerEvents="none">
            <Icon color={placeholderColor} />
          </InputLeftElement>
        )}
        <Input
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          required={required}
          step={step}
          bg={bgColor}
          color={textColor}
          borderColor={borderColor}
          _hover={{ borderColor: "gray.500" }}
          _focus={{ borderColor: "brand.500" }}
          _placeholder={{ color: placeholderColor }}
        />
      </InputGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
