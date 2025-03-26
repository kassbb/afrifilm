"use client";

import {
  Box,
  Container,
  SimpleGrid,
  VStack,
  HStack,
  Text,
  Link,
  Icon,
  useColorModeValue,
} from "@chakra-ui/react";
import { FiFacebook, FiTwitter, FiInstagram, FiYoutube } from "react-icons/fi";

export default function Footer() {
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const textColor = useColorModeValue("gray.300", "gray.300");

  return (
    <Box as="footer" bg={bgColor} color={textColor} py={12}>
      <Container maxW="container.xl">
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={8}>
          <VStack align="start" spacing={4}>
            <Text fontSize="2xl" fontWeight="bold" color="white">
              AfroStream
            </Text>
            <Text>
              Votre plateforme de streaming pour découvrir le meilleur du cinéma
              africain.
            </Text>
            <HStack spacing={4}>
              <Link href="#" isExternal>
                <Icon
                  as={FiFacebook}
                  w={6}
                  h={6}
                  color="white"
                  _hover={{ color: "brand.400" }}
                />
              </Link>
              <Link href="#" isExternal>
                <Icon
                  as={FiTwitter}
                  w={6}
                  h={6}
                  color="white"
                  _hover={{ color: "brand.400" }}
                />
              </Link>
              <Link href="#" isExternal>
                <Icon
                  as={FiInstagram}
                  w={6}
                  h={6}
                  color="white"
                  _hover={{ color: "brand.400" }}
                />
              </Link>
              <Link href="#" isExternal>
                <Icon
                  as={FiYoutube}
                  w={6}
                  h={6}
                  color="white"
                  _hover={{ color: "brand.400" }}
                />
              </Link>
            </HStack>
          </VStack>

          <VStack align="start" spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              Navigation
            </Text>
            <Link
              href="/films"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Films
            </Link>
            <Link
              href="/series"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Séries
            </Link>
            <Link
              href="/nouveautes"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Nouveautés
            </Link>
            <Link
              href="/categories"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Catégories
            </Link>
          </VStack>

          <VStack align="start" spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              À propos
            </Text>
            <Link
              href="/about"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              À propos de nous
            </Link>
            <Link
              href="/contact"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Contact
            </Link>
            <Link href="/faq" color={textColor} _hover={{ color: "brand.400" }}>
              FAQ
            </Link>
            <Link
              href="/blog"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Blog
            </Link>
          </VStack>

          <VStack align="start" spacing={4}>
            <Text fontSize="lg" fontWeight="bold" color="white">
              Légal
            </Text>
            <Link
              href="/privacy"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Politique de confidentialité
            </Link>
            <Link
              href="/terms"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Conditions d'utilisation
            </Link>
            <Link
              href="/cookies"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Politique des cookies
            </Link>
            <Link
              href="/refund"
              color={textColor}
              _hover={{ color: "brand.400" }}
            >
              Politique de remboursement
            </Link>
          </VStack>
        </SimpleGrid>

        <Box mt={12} pt={8} borderTop="1px" borderColor="gray.700">
          <Text textAlign="center" color={textColor}>
            © {new Date().getFullYear()} AfroStream. Tous droits réservés.
          </Text>
        </Box>
      </Container>
    </Box>
  );
}
