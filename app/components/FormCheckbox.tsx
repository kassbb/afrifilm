"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Checkbox,
  useColorModeValue,
} from "@chakra-ui/react";

interface FormCheckboxProps {
  label: string;
  name: string;
  error?: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function FormCheckbox({
  label,
  name,
  error,
  isChecked,
  onChange,
  required = false,
}: FormCheckboxProps) {
  const textColor = useColorModeValue("white", "white");

  return (
    <FormControl isInvalid={!!error}>
      <Checkbox
        name={name}
        isChecked={isChecked}
        onChange={onChange}
        required={required}
        colorScheme="brand"
        color={textColor}
      >
        <FormLabel color={textColor} mb={0}>
          {label}
        </FormLabel>
      </Checkbox>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
