"use client";

import {
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  useColorModeValue,
  Tooltip,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { FiPlay, FiClock, FiCalendar, FiLayers, FiTag } from "react-icons/fi";

interface ContentCardProps {
  id: string;
  title: string;
  imagePath: string;
  type: "FILM" | "SERIE";
  releaseYear?: number;
  duration?: number;
  price: number;
  isPremium: boolean;
  isNew?: boolean;
  categories?: Array<{ id: string; name: string }>;
  seasonsCount?: number;
  episodesCount?: number;
}

export default function ContentCard({
  id,
  title,
  imagePath,
  type,
  releaseYear,
  duration,
  price,
  isPremium,
  isNew,
  categories,
  seasonsCount,
  episodesCount,
}: ContentCardProps) {
  const cardBg = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");
  const accentColor = useColorModeValue("brand.500", "brand.300");

  // Déterminer l'URL de redirection en fonction du type
  const detailsUrl = type === "FILM" ? `/films/${id}` : `/series/${id}`;

  // Formater la durée pour les films (convertir minutes en heures/minutes)
  const formattedDuration = duration
    ? `${Math.floor(duration / 60)}h ${duration % 60}min`
    : "";

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      transition="transform 0.2s, box-shadow 0.2s"
      _hover={{
        transform: "translateY(-4px)",
        boxShadow: "xl",
      }}
      position="relative"
    >
      {/* Indicateur "Nouveau" */}
      {isNew && (
        <Badge
          position="absolute"
          top={3}
          right={3}
          colorScheme="green"
          zIndex={2}
          fontSize="xs"
          borderRadius="full"
          px={2}
        >
          Nouveau
        </Badge>
      )}

      <Box position="relative" h="300px">
        <Image
          src={imagePath || "/images/placeholder.jpg"}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          style={{ objectFit: "cover" }}
        />
        <Box
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bgGradient="linear(to-t, blackAlpha.900, blackAlpha.500, transparent)"
          display="flex"
          flexDirection="column"
          justifyContent="flex-end"
          p={4}
        >
          <VStack align="stretch" spacing={2}>
            <HStack spacing={2} flexWrap="wrap">
              <Badge colorScheme={type === "FILM" ? "blue" : "purple"}>
                {type === "FILM" ? "Film" : "Série"}
              </Badge>
              {isPremium && (
                <Badge colorScheme="yellow" variant="solid">
                  Premium
                </Badge>
              )}
            </HStack>

            <Text
              fontSize="xl"
              fontWeight="bold"
              color={textColor}
              noOfLines={1}
            >
              {title}
            </Text>

            <HStack spacing={4} flexWrap="wrap">
              {releaseYear && (
                <HStack color="gray.300" fontSize="sm">
                  <FiCalendar />
                  <Text>{releaseYear}</Text>
                </HStack>
              )}

              {type === "FILM" && duration && (
                <HStack color="gray.300" fontSize="sm">
                  <FiClock />
                  <Text>{formattedDuration}</Text>
                </HStack>
              )}

              {type === "SERIE" && seasonsCount && (
                <Tooltip label={`${episodesCount} épisodes`}>
                  <HStack color="gray.300" fontSize="sm">
                    <FiLayers />
                    <Text>
                      {seasonsCount} {seasonsCount > 1 ? "saisons" : "saison"}
                    </Text>
                  </HStack>
                </Tooltip>
              )}
            </HStack>

            {categories && categories.length > 0 && (
              <HStack spacing={2} flexWrap="wrap">
                <FiTag color="gray.400" />
                <Text color="gray.400" fontSize="xs" noOfLines={1}>
                  {categories
                    .slice(0, 2)
                    .map((c) => c.name)
                    .join(", ")}
                  {categories.length > 2 ? "..." : ""}
                </Text>
              </HStack>
            )}

            <HStack justify="space-between" align="center">
              <Text color={accentColor} fontWeight="bold">
                {price > 0 ? `${price.toFixed(2)} €` : "Gratuit"}
              </Text>
              <Link href={detailsUrl} passHref>
                <Button
                  leftIcon={<FiPlay />}
                  colorScheme="brand"
                  size="sm"
                  _hover={{ bg: "brand.600" }}
                >
                  {isPremium ? "Détails" : "Regarder"}
                </Button>
              </Link>
            </HStack>
          </VStack>
        </Box>
      </Box>
    </Box>
  );
}
