"use client";

import { useState } from "react";
import {
  Box,
  Button,
  Container,
  Heading,
  Text,
  VStack,
  Card,
  CardBody,
  Image,
  Stack,
  Divider,
  CardFooter,
  ButtonGroup,
  Flex,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
} from "@chakra-ui/react";
import OrangeMoneyForm from "@/app/components/payment/OrangeMoneyForm";

export default function PaymentDemo() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContent, setSelectedContent] = useState<{
    id: string;
    title: string;
    price: number;
    image: string;
    description: string;
  } | null>(null);

  // Contenu de démonstration
  const demoContents = [
    {
      id: "film1",
      title: "Aventures en Afrique",
      price: 4.99,
      image: "/images/film1.jpg",
      description:
        "Un film d'aventure captivant à travers les paysages africains.",
    },
    {
      id: "serie1",
      title: "Mystères du Sahara",
      price: 7.99,
      image: "/images/serie1.jpg",
      description:
        "Une série palpitante explorant les secrets cachés du désert.",
    },
    {
      id: "film2",
      title: "Traditions et Modernité",
      price: 3.99,
      image: "/images/film2.jpg",
      description:
        "Un documentaire sur l'équilibre entre tradition et vie moderne.",
    },
  ];

  const handleBuyClick = (content: (typeof demoContents)[0]) => {
    setSelectedContent(content);
    onOpen();
  };

  const handlePaymentSuccess = (transactionId: string) => {
    console.log(`Paiement réussi, transaction ID: ${transactionId}`);
    onClose();
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        <Box textAlign="center" mb={6}>
          <Heading as="h1" size="xl" mb={2}>
            Démo Paiement Orange Money
          </Heading>
          <Text color="gray.600">
            Cette page démontre l'intégration du système de paiement Orange
            Money pour AfriFilm
          </Text>
        </Box>

        <Flex wrap="wrap" justify="center" gap={6}>
          {demoContents.map((content) => (
            <Card
              key={content.id}
              maxW="sm"
              overflow="hidden"
              variant="outline"
            >
              <Image
                src={content.image}
                alt={content.title}
                height="200px"
                objectFit="cover"
                fallbackSrc="https://via.placeholder.com/300x200?text=AfriFilm"
              />
              <CardBody>
                <Stack mt="2" spacing="3">
                  <Heading size="md">{content.title}</Heading>
                  <Text>{content.description}</Text>
                  <Text color="blue.600" fontSize="2xl">
                    {content.price.toFixed(2)} €
                  </Text>
                </Stack>
              </CardBody>
              <Divider />
              <CardFooter>
                <ButtonGroup spacing="2">
                  <Button
                    variant="solid"
                    colorScheme="blue"
                    onClick={() => handleBuyClick(content)}
                  >
                    Acheter
                  </Button>
                  <Button variant="ghost" colorScheme="blue">
                    Plus d'infos
                  </Button>
                </ButtonGroup>
              </CardFooter>
            </Card>
          ))}
        </Flex>
      </VStack>

      {/* Modal pour le paiement */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Paiement</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {selectedContent && (
              <OrangeMoneyForm
                contentId={selectedContent.id}
                contentTitle={selectedContent.title}
                price={selectedContent.price}
                onSuccess={handlePaymentSuccess}
                onCancel={onClose}
              />
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </Container>
  );
}
