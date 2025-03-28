"use client";

import { useState, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  Spinner,
  Center,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Link as ChakraLink,
  Button,
  useToast,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { FiPlay, FiClock, FiCalendar, FiFilm, FiTv } from "react-icons/fi";

interface Purchase {
  id: string;
  transactionId: string;
  contentId: string;
  contentTitle: string;
  contentType: "FILM" | "SERIE";
  price: number;
  referenceNumber: string;
  purchaseDate: string;
  imagePath?: string;
}

export default function UserPurchasesHistory() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const toast = useToast();

  useEffect(() => {
    const fetchPurchases = async () => {
      if (!session?.user) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch("/api/user/purchases");

        if (!response.ok) {
          throw new Error("Erreur lors de la récupération des achats");
        }

        const data = await response.json();
        setPurchases(data.purchases || []);
      } catch (error) {
        console.error("Erreur:", error);
        setError(
          "Impossible de charger vos achats. Veuillez réessayer plus tard."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPurchases();
  }, [session]);

  if (loading) {
    return (
      <Center p={10}>
        <Spinner size="xl" color="brand.500" />
      </Center>
    );
  }

  if (!session?.user) {
    return (
      <Alert
        status="warning"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="lg"
        p={6}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Connexion requise
        </AlertTitle>
        <AlertDescription maxWidth="md">
          Veuillez vous connecter pour voir votre historique d'achats.
          <HStack spacing={4} justify="center" mt={4}>
            <Link href="/auth/login" passHref>
              <Button colorScheme="brand">Se connecter</Button>
            </Link>
            <Link href="/auth/register" passHref>
              <Button variant="outline" colorScheme="brand">
                S'inscrire
              </Button>
            </Link>
          </HStack>
        </AlertDescription>
      </Alert>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (purchases.length === 0) {
    return (
      <Alert
        status="info"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="lg"
        p={6}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Aucun achat trouvé
        </AlertTitle>
        <AlertDescription maxWidth="md">
          Vous n'avez pas encore effectué d'achat sur AfriFilm.
          <HStack spacing={4} justify="center" mt={4}>
            <Link href="/films" passHref>
              <Button colorScheme="brand">Découvrir les films</Button>
            </Link>
            <Link href="/series" passHref>
              <Button variant="outline" colorScheme="brand">
                Découvrir les séries
              </Button>
            </Link>
          </HStack>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <VStack align="stretch" spacing={6}>
      <Heading size="lg">Mes Achats</Heading>
      <Divider />

      <Table variant="simple" colorScheme="gray">
        <Thead>
          <Tr>
            <Th>Date</Th>
            <Th>Contenu</Th>
            <Th>Type</Th>
            <Th isNumeric>Prix</Th>
            <Th>Référence</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {purchases.map((purchase) => {
            const date = new Date(purchase.purchaseDate);
            const formattedDate = date.toLocaleDateString();
            const contentUrl =
              purchase.contentType === "FILM"
                ? `/films/${purchase.contentId}`
                : `/series/${purchase.contentId}`;

            return (
              <Tr key={purchase.id}>
                <Td>
                  <HStack>
                    <FiCalendar />
                    <Text>{formattedDate}</Text>
                  </HStack>
                </Td>
                <Td>
                  <Link href={contentUrl} passHref>
                    <ChakraLink fontWeight="bold" color="brand.500">
                      {purchase.contentTitle}
                    </ChakraLink>
                  </Link>
                </Td>
                <Td>
                  <Badge
                    colorScheme={
                      purchase.contentType === "FILM" ? "blue" : "purple"
                    }
                  >
                    {purchase.contentType === "FILM" ? (
                      <HStack spacing={1}>
                        <Icon as={FiFilm} />
                        <Text>Film</Text>
                      </HStack>
                    ) : (
                      <HStack spacing={1}>
                        <Icon as={FiTv} />
                        <Text>Série</Text>
                      </HStack>
                    )}
                  </Badge>
                </Td>
                <Td isNumeric fontWeight="bold">
                  {purchase.price.toFixed(2)} €
                </Td>
                <Td>
                  <Text fontSize="sm" fontFamily="mono">
                    {purchase.referenceNumber}
                  </Text>
                </Td>
                <Td>
                  <Link href={contentUrl} passHref>
                    <Button leftIcon={<FiPlay />} size="sm" colorScheme="brand">
                      Regarder
                    </Button>
                  </Link>
                </Td>
              </Tr>
            );
          })}
        </Tbody>
      </Table>
    </VStack>
  );
}
