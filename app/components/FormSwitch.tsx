"use client";

import {
  FormControl,
  FormLabel,
  FormErrorMessage,
  Switch,
  useColorModeValue,
} from "@chakra-ui/react";

interface FormSwitchProps {
  label: string;
  name: string;
  error?: string;
  isChecked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}

export default function FormSwitch({
  label,
  name,
  error,
  isChecked,
  onChange,
  required = false,
}: FormSwitchProps) {
  const textColor = useColorModeValue("white", "white");

  return (
    <FormControl isInvalid={!!error}>
      <FormLabel color={textColor}>{label}</FormLabel>
      <Switch
        name={name}
        isChecked={isChecked}
        onChange={onChange}
        required={required}
        colorScheme="brand"
      />
      <FormErrorMessage>{error}</FormErrorMessage>
    </FormControl>
  );
}
