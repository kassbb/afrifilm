"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Flex,
  Image,
  Icon,
  useColorModeValue,
  Spinner,
  Center,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Divider,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  TableContainer,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiPlay,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiFilm,
  FiTv,
  FiFilter,
  FiEye,
  FiDownload,
  FiArrowDown,
  FiArrowUp,
} from "react-icons/fi";
import Link from "next/link";

interface Purchase {
  id: string;
  contentId: string;
  amount: number;
  createdAt: string;
  paymentMethod: string;
  content: {
    id: string;
    title: string;
    type: "FILM" | "SERIE";
    thumbnail: string;
    description: string;
    genre: string;
  };
}

export default function PurchasesPage() {
  const { data: session, status } = useSession();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [sortBy, setSortBy] = useState<"date" | "price">("date");
  const [dataLoaded, setDataLoaded] = useState(false);

  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const tableBg = useColorModeValue("white", "gray.800");
  const thBg = useColorModeValue("gray.50", "gray.700");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const hoverBg = useColorModeValue("gray.50", "gray.700");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated" && session && !dataLoaded) {
      fetchPurchases();
    }
  }, [session, status, router, dataLoaded]);

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      // Utiliser l'API user/me qui contient toutes les données utilisateur
      const response = await fetch("/api/user/me");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des achats");
      }

      const data = await response.json();
      // Extraire les transactions (achats) des données utilisateur
      const userPurchases =
        data.transactions?.map((purchase) => ({
          id: purchase.id,
          contentId: purchase.contentId,
          amount: purchase.amount,
          createdAt: purchase.createdAt,
          paymentMethod: purchase.paymentMethod || "Card",
          content: {
            id: purchase.content.id,
            title: purchase.content.title,
            type: purchase.content.type,
            thumbnail: purchase.content.thumbnail || "/placeholder.jpg",
            description: purchase.content.description,
            genre: purchase.content.genre,
          },
        })) || [];

      setPurchases(userPurchases);
      setFilteredPurchases(userPurchases);
      setDataLoaded(true);
    } catch (error) {
      console.error("Erreur:", error);

      setPurchases([]);
      setFilteredPurchases([]);

      toast({
        title: "Erreur",
        description:
          "Impossible de charger vos achats. Veuillez réessayer plus tard.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filtrer les achats selon les critères
    let result = [...purchases];

    // Filtre par type de contenu
    if (contentTypeFilter !== "all") {
      result = result.filter(
        (purchase) => purchase.content.type === contentTypeFilter
      );
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (purchase) =>
          purchase.content.title.toLowerCase().includes(query) ||
          purchase.content.description.toLowerCase().includes(query) ||
          purchase.content.genre?.toLowerCase().includes(query) ||
          purchase.paymentMethod.toLowerCase().includes(query)
      );
    }

    // Tri par date ou prix
    result.sort((a, b) => {
      if (sortBy === "date") {
        return sortOrder === "desc"
          ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      } else {
        return sortOrder === "desc" ? b.amount - a.amount : a.amount - b.amount;
      }
    });

    setFilteredPurchases(result);
  }, [purchases, searchQuery, contentTypeFilter, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder(sortOrder === "asc" ? "desc" : "asc");
  };

  const toggleSortBy = (newSortBy: "date" | "price") => {
    if (sortBy === newSortBy) {
      toggleSortOrder();
    } else {
      setSortBy(newSortBy);
      setSortOrder("desc");
    }
  };

  // Calcul du montant total des achats filtrés
  const totalAmount = filteredPurchases.reduce(
    (sum, purchase) => sum + purchase.amount,
    0
  );

  // Ajouter un bouton pour rafraîchir manuellement les données
  const handleRefresh = () => {
    setDataLoaded(false); // Réinitialiser pour permettre un nouveau chargement
  };

  if (isLoading) {
    return (
      <Center h="100vh">
        <Spinner size="xl" color="red.500" />
      </Center>
    );
  }

  return (
    <Container maxW="container.xl" py={{ base: 8, md: 16 }}>
      <VStack spacing={8} align="stretch">
        <Flex
          justify="space-between"
          align={{ base: "start", md: "center" }}
          direction={{ base: "column", md: "row" }}
          gap={4}
        >
          <Box>
            <Heading size="lg" mb={2}>
              Mes achats
            </Heading>
            <Text color="gray.500">
              {filteredPurchases.length}{" "}
              {filteredPurchases.length > 1 ? "achats" : "achat"} •{" "}
              <Text
                as="span"
                fontWeight="bold"
                color={useColorModeValue("red.500", "red.300")}
              >
                {totalAmount.toFixed(2)}€
              </Text>
            </Text>
          </Box>

          <HStack spacing={4}>
            <Button
              onClick={handleRefresh}
              colorScheme="red"
              variant="outline"
              leftIcon={<Icon as={FiArrowDown} />}
              isLoading={isLoading}
            >
              Actualiser
            </Button>
            <Button
              as={Link}
              href="/user/profile"
              colorScheme="gray"
              variant="outline"
              leftIcon={<Icon as={FiClock} />}
            >
              Retour au profil
            </Button>
          </HStack>
        </Flex>

        <Flex
          wrap="wrap"
          gap={4}
          mb={6}
          direction={{ base: "column", md: "row" }}
          align={{ base: "stretch", md: "center" }}
        >
          <InputGroup maxW={{ base: "100%", md: "300px" }}>
            <InputLeftElement pointerEvents="none">
              <FiSearch color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Rechercher un achat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Recherche"
            />
          </InputGroup>

          <Select
            id="content-type-filter"
            name="content-type-filter"
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
            maxW="150px"
            icon={<FiFilter />}
            aria-label="Filtrer par type de contenu"
            title="Filtrer par type de contenu"
          >
            <option value="all">Tous types</option>
            <option value="FILM">Films</option>
            <option value="SERIE">Séries</option>
          </Select>
        </Flex>

        {filteredPurchases.length === 0 ? (
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
              {searchQuery || contentTypeFilter !== "all"
                ? "Aucun achat ne correspond à votre recherche. Essayez de modifier vos filtres."
                : "Vous n'avez pas encore effectué d'achat sur la plateforme."}
              <HStack spacing={4} justify="center" mt={4}>
                <Link href="/films" passHref>
                  <Button colorScheme="red">Découvrir les films</Button>
                </Link>
                <Link href="/series" passHref>
                  <Button variant="outline" colorScheme="red">
                    Découvrir les séries
                  </Button>
                </Link>
              </HStack>
            </AlertDescription>
          </Alert>
        ) : (
          <TableContainer
            borderWidth="1px"
            borderColor={borderColor}
            borderRadius="lg"
            boxShadow="sm"
            bg={tableBg}
            overflowX="auto"
          >
            <Table variant="simple">
              <Thead bg={thBg}>
                <Tr>
                  <Th>Contenu</Th>
                  <Th>Type</Th>
                  <Th>
                    <Flex
                      align="center"
                      cursor="pointer"
                      onClick={() => toggleSortBy("date")}
                    >
                      <Text mr={1}>Date d'achat</Text>
                      {sortBy === "date" && (
                        <Icon
                          as={sortOrder === "asc" ? FiArrowUp : FiArrowDown}
                          fontSize="sm"
                        />
                      )}
                    </Flex>
                  </Th>
                  <Th>
                    <Flex
                      align="center"
                      cursor="pointer"
                      onClick={() => toggleSortBy("price")}
                    >
                      <Text mr={1}>Prix</Text>
                      {sortBy === "price" && (
                        <Icon
                          as={sortOrder === "asc" ? FiArrowUp : FiArrowDown}
                          fontSize="sm"
                        />
                      )}
                    </Flex>
                  </Th>
                  <Th>Paiement</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredPurchases.map((purchase) => {
                  const purchaseDate = new Date(purchase.createdAt);
                  const dateOptions: Intl.DateTimeFormatOptions = {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  };
                  const formattedDate = purchaseDate.toLocaleDateString(
                    "fr-FR",
                    dateOptions
                  );

                  const contentUrl =
                    purchase.content.type === "FILM"
                      ? `/films/${purchase.content.id}`
                      : `/series/${purchase.content.id}`;

                  return (
                    <Tr
                      key={purchase.id}
                      _hover={{ bg: hoverBg }}
                      transition="background 0.2s"
                    >
                      <Td>
                        <HStack spacing={3}>
                          <Box
                            width="60px"
                            height="40px"
                            overflow="hidden"
                            borderRadius="md"
                          >
                            <Image
                              src={purchase.content.thumbnail}
                              alt={purchase.content.title}
                              objectFit="cover"
                              fallbackSrc="/placeholder.jpg"
                              width="100%"
                              height="100%"
                            />
                          </Box>
                          <Text noOfLines={1} fontWeight="medium">
                            {purchase.content.title}
                          </Text>
                        </HStack>
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={
                            purchase.content.type === "FILM" ? "blue" : "purple"
                          }
                          fontSize="xs"
                        >
                          {purchase.content.type === "FILM" ? "Film" : "Série"}
                        </Badge>
                      </Td>
                      <Td>{formattedDate}</Td>
                      <Td>
                        <Text
                          fontWeight="medium"
                          color={useColorModeValue("red.500", "red.300")}
                        >
                          {purchase.amount.toFixed(2)}€
                        </Text>
                      </Td>
                      <Td>
                        <Badge variant="subtle" colorScheme="gray">
                          {purchase.paymentMethod}
                        </Badge>
                      </Td>
                      <Td>
                        <HStack spacing={2}>
                          <Link href={contentUrl} passHref>
                            <Button
                              size="sm"
                              colorScheme="red"
                              rightIcon={<FiPlay />}
                            >
                              Regarder
                            </Button>
                          </Link>
                        </HStack>
                      </Td>
                    </Tr>
                  );
                })}
              </Tbody>
            </Table>
          </TableContainer>
        )}
      </VStack>
    </Container>
  );
}
