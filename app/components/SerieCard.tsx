"use client";

import {
  Box,
  Text,
  Badge,
  HStack,
  VStack,
  Button,
  useColorModeValue,
} from "@chakra-ui/react";
import Link from "next/link";
import Image from "next/image";
import { FiPlay, FiClock } from "react-icons/fi";

interface SerieCardProps {
  id: string;
  title: string;
  thumbnail: string;
  seasons: number;
  genre: string;
  price: string;
}

export default function SerieCard({
  id,
  title,
  thumbnail,
  seasons,
  genre,
  price,
}: SerieCardProps) {
  const cardBg = useColorModeValue("gray.800", "gray.700");
  const textColor = useColorModeValue("white", "white");

  return (
    <Box
      bg={cardBg}
      borderRadius="lg"
      overflow="hidden"
      boxShadow="lg"
      transition="transform 0.2s"
      _hover={{ transform: "translateY(-4px)" }}
    >
      <Box position="relative" h="300px">
        <Image
          src={thumbnail}
          alt={title}
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
            <Text
              fontSize="xl"
              fontWeight="bold"
              color={textColor}
              noOfLines={2}
            >
              {title}
            </Text>
            <HStack spacing={2}>
              <Badge colorScheme="brand" variant="solid">
                {genre}
              </Badge>
              <HStack color="gray.300" fontSize="sm">
                <FiClock />
                <Text>{seasons} saisons</Text>
              </HStack>
            </HStack>
            <Text color={textColor} fontSize="xl" fontWeight="bold">
              {price}
            </Text>
            <Link href={`/series/${id}`} passHref>
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
  );
}
