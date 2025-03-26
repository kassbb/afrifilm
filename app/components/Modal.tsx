"use client";

import {
  Modal as ChakraModal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
}: ModalProps) {
  const bgColor = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const borderColor = useColorModeValue("gray.600", "gray.500");

  return (
    <ChakraModal isOpen={isOpen} onClose={onClose} isCentered>
      <ModalOverlay bg="blackAlpha.700" />
      <ModalContent bg={bgColor} borderColor={borderColor}>
        <ModalHeader color={textColor}>{title}</ModalHeader>
        <ModalCloseButton color={textColor} />
        <ModalBody color={textColor}>{children}</ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </ChakraModal>
  );
}
