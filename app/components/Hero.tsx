"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  VStack,
  HStack,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import { FiPlay, FiInfo } from "react-icons/fi";

export default function Hero() {
  const bgGradient = useColorModeValue(
    "linear(to-r, gray.900, gray.800)",
    "linear(to-r, gray.900, gray.800)"
  );

  return (
    <Box
      position="relative"
      h="80vh"
      bgGradient={bgGradient}
      overflow="hidden"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'url("/images/hero-bg.jpg")',
        bgSize: "cover",
        bgPosition: "center",
        opacity: 0.3,
        zIndex: 1,
      }}
    >
      <Container maxW="container.xl" h="full" position="relative" zIndex={2}>
        <VStack
          h="full"
          justify="center"
          align="flex-start"
          spacing={8}
          maxW="2xl"
        >
          <Heading
            as="h1"
            size="4xl"
            color="white"
            fontWeight="bold"
            lineHeight="shorter"
            textShadow="2px 2px 4px rgba(0,0,0,0.5)"
          >
            Découvrez le Meilleur du Cinéma Africain
          </Heading>
          <Text
            fontSize="xl"
            color="gray.200"
            maxW="xl"
            textShadow="1px 1px 2px rgba(0,0,0,0.5)"
          >
            Plongez dans une collection exclusive de films et séries africains
            de qualité. Des histoires authentiques qui vous transportent au cœur
            de l'Afrique.
          </Text>
          <HStack spacing={4}>
            <Link href="/films" passHref>
              <Button
                leftIcon={<FiPlay />}
                size="lg"
                colorScheme="brand"
                bg="brand.500"
                _hover={{ bg: "brand.600" }}
                px={8}
              >
                Commencer à regarder
              </Button>
            </Link>
            <Link href="/about" passHref>
              <Button
                leftIcon={<FiInfo />}
                size="lg"
                variant="outline"
                color="white"
                borderColor="white"
                _hover={{ bg: "whiteAlpha.200" }}
                px={8}
              >
                En savoir plus
              </Button>
            </Link>
          </HStack>
        </VStack>
      </Container>
    </Box>
  );
}
