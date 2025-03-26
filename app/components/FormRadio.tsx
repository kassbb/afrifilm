"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Radio,
  RadioGroup,
  VStack,
  useColorModeValue,
} from "@chakra-ui/react";

interface Option {
  value: string;
  label: string;
}

interface FormRadioProps {
  label: string;
  name: string;
  options: Option[];
  error?: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
}

export default function FormRadio({
  label,
  name,
  options,
  error,
  value,
  onChange,
  required = false,
}: FormRadioProps) {
  const textColor = useColorModeValue("white", "white");

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel color={textColor}>{label}</FormLabel>
      <RadioGroup name={name} value={value} onChange={onChange}>
        <VStack align="start" spacing={2}>
          {options.map((option) => (
            <Radio
              key={option.value}
              value={option.value}
              required={required}
              colorScheme="brand"
              color={textColor}
            >
              {option.label}
            </Radio>
          ))}
        </VStack>
      </RadioGroup>
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
