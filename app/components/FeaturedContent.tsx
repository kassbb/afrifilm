"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  SimpleGrid,
  VStack,
  HStack,
  Badge,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { FiPlay, FiClock } from "react-icons/fi";

const featuredContent = [
  {
    id: 1,
    title: "La Vie Est Belle",
    thumbnail: "/images/film1.jpg",
    duration: "2h 15min",
    genre: "Drame",
    price: "4.99€",
  },
  {
    id: 2,
    title: "Bal Poussière",
    thumbnail: "/images/film2.jpg",
    duration: "1h 45min",
    genre: "Comédie",
    price: "3.99€",
  },
  {
    id: 3,
    title: "Yaaba",
    thumbnail: "/images/film3.jpg",
    duration: "1h 30min",
    genre: "Drame",
    price: "4.99€",
  },
  {
    id: 4,
    title: "Tilai",
    thumbnail: "/images/film4.jpg",
    duration: "2h 00min",
    genre: "Drame",
    price: "4.99€",
  },
];

export default function FeaturedContent() {
  const bgColor = useColorModeValue("gray.800", "gray.900");
  const cardBg = useColorModeValue("gray.700", "gray.800");

  return (
    <Box py={20} bg={bgColor}>
      <Container maxW="container.xl">
        <VStack spacing={12} align="stretch">
          <Heading
            as="h2"
            size="2xl"
            color="white"
            textAlign="center"
            fontWeight="bold"
          >
            Films en Vedette
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={8}>
            {featuredContent.map((content) => (
              <Box
                key={content.id}
                bg={cardBg}
                borderRadius="lg"
                overflow="hidden"
                boxShadow="lg"
                transition="transform 0.2s"
                _hover={{ transform: "translateY(-4px)" }}
              >
                <Box position="relative" h="300px">
                  <Image
                    src={content.thumbnail}
                    alt={content.title}
                    fill
                    style={{ objectFit: "cover" }}
                  />
                  <Box
                    position="absolute"
                    top={0}
                    left={0}
                    right={0}
                    bottom={0}
                    bgGradient="linear(to-t, blackAlpha.800, transparent)"
                    display="flex"
                    flexDirection="column"
                    justifyContent="flex-end"
                    p={4}
                  >
                    <VStack align="stretch" spacing={2}>
                      <Heading
                        as="h3"
                        size="md"
                        color="white"
                        noOfLines={2}
                        fontWeight="bold"
                      >
                        {content.title}
                      </Heading>
                      <HStack spacing={2}>
                        <Badge colorScheme="brand" variant="solid">
                          {content.genre}
                        </Badge>
                        <HStack color="gray.300" fontSize="sm">
                          <FiClock />
                          <Text>{content.duration}</Text>
                        </HStack>
                      </HStack>
                      <Text color="white" fontSize="xl" fontWeight="bold">
                        {content.price}
                      </Text>
                      <Link href={`/films/${content.id}`} passHref>
                        <Button
                          leftIcon={<FiPlay />}
                          colorScheme="brand"
                          size="sm"
                          w="full"
                          _hover={{ bg: "brand.600" }}
                        >
                          Regarder
                        </Button>
                      </Link>
                    </VStack>
                  </Box>
                </Box>
              </Box>
            ))}
          </SimpleGrid>
          <Box textAlign="center">
            <Link href="/films" passHref>
              <Button
                size="lg"
                colorScheme="brand"
                variant="outline"
                _hover={{ bg: "brand.600" }}
                px={8}
              >
                Voir tous les films
              </Button>
            </Link>
          </Box>
        </VStack>
      </Container>
    </Box>
  );
}
