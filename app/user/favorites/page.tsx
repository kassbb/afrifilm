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
  SimpleGrid,
  Button,
  Badge,
  Flex,
  Image,
  Icon,
  IconButton,
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
  Tooltip,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiPlay,
  FiClock,
  FiHeart,
  FiFilm,
  FiTv,
  FiFilter,
  FiX,
  FiTrash2,
} from "react-icons/fi";
import Link from "next/link";

interface Favorite {
  id: string;
  contentId: string;
  addedAt: string;
  content: {
    id: string;
    title: string;
    type: "FILM" | "SERIE";
    thumbnail: string;
    description: string;
    genre: string;
    year: string;
    director: string;
  };
}

export default function FavoritesPage() {
  const { data: session, status } = useSession();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [filteredFavorites, setFilteredFavorites] = useState<Favorite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [selectedFavorite, setSelectedFavorite] = useState<Favorite | null>(
    null
  );

  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("red.500", "red.300");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated" && session) {
      fetchFavorites();
    }
  }, [session, status, router]);

  const fetchFavorites = async () => {
    try {
      setIsLoading(true);
      // Utiliser l'API user/me qui contient toutes les données utilisateur y compris les favoris
      const response = await fetch("/api/user/me");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des favoris");
      }

      const data = await response.json();
      // Extraire les favoris des données utilisateur
      // (Note: Cette partie dépend de comment les favoris sont stockés dans l'API)
      // Si les favoris sont directement accessibles comme favoris[]
      const userFavorites =
        data.favorites?.map((fav) => ({
          id: fav.id,
          contentId: fav.contentId,
          addedAt: fav.createdAt,
          content: {
            id: fav.content.id,
            title: fav.content.title,
            type: fav.content.type,
            thumbnail: fav.content.thumbnail || "/placeholder.jpg",
            description: fav.content.description,
            genre: fav.content.genre,
            year: fav.content.year,
            director: fav.content.director,
          },
        })) || [];

      setFavorites(userFavorites);
      setFilteredFavorites(userFavorites);
    } catch (error) {
      console.error("Erreur:", error);

      setFavorites([]);
      setFilteredFavorites([]);

      toast({
        title: "Erreur",
        description:
          "Impossible de charger vos favoris. Veuillez réessayer plus tard.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filtrer les favoris selon les critères
    let result = [...favorites];

    // Filtre par type de contenu
    if (contentTypeFilter !== "all") {
      result = result.filter(
        (favorite) => favorite.content.type === contentTypeFilter
      );
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (favorite) =>
          favorite.content.title.toLowerCase().includes(query) ||
          favorite.content.description.toLowerCase().includes(query) ||
          favorite.content.genre?.toLowerCase().includes(query) ||
          favorite.content.director?.toLowerCase().includes(query)
      );
    }

    // Tri par date d'ajout (le plus récent d'abord)
    result.sort((a, b) => {
      return new Date(b.addedAt).getTime() - new Date(a.addedAt).getTime();
    });

    setFilteredFavorites(result);
  }, [favorites, searchQuery, contentTypeFilter]);

  const handleRemoveFavorite = async (favoriteId: string) => {
    try {
      // Appeler l'API pour supprimer des favoris
      const response = await fetch(`/api/user/favorites/${favoriteId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la suppression du favori");
      }

      // Supprimer localement après confirmation de suppression par l'API
      setFavorites((prev) => prev.filter((fav) => fav.id !== favoriteId));

      toast({
        title: "Supprimé des favoris",
        description: "Le contenu a été retiré de vos favoris",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer ce favori",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openRemoveModal = (favorite: Favorite) => {
    setSelectedFavorite(favorite);
    onOpen();
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
              Mes favoris
            </Heading>
            <Text color="gray.500">
              {filteredFavorites.length}{" "}
              {filteredFavorites.length > 1 ? "contenus" : "contenu"}{" "}
              enregistrés
            </Text>
          </Box>

          <HStack spacing={4}>
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
              placeholder="Rechercher un favori..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Recherche"
            />
          </InputGroup>

          <Select
            value={contentTypeFilter}
            onChange={(e) => setContentTypeFilter(e.target.value)}
            maxW="150px"
            icon={<FiFilter />}
            aria-label="Filtrer par type"
          >
            <option value="all">Tous les types</option>
            <option value="FILM">Films</option>
            <option value="SERIE">Séries</option>
          </Select>
        </Flex>

        {filteredFavorites.length === 0 ? (
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
              Aucun favori trouvé
            </AlertTitle>
            <AlertDescription maxWidth="md">
              {searchQuery || contentTypeFilter !== "all"
                ? "Aucun favori ne correspond à votre recherche. Essayez de modifier vos filtres."
                : "Vous n'avez pas encore ajouté de contenu à vos favoris."}
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
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {filteredFavorites.map((favorite) => {
              const contentUrl =
                favorite.content.type === "FILM"
                  ? `/films/${favorite.content.id}`
                  : `/series/${favorite.content.id}`;

              return (
                <Box
                  key={favorite.id}
                  bg={cardBg}
                  borderRadius="lg"
                  overflow="hidden"
                  boxShadow="md"
                  borderWidth="1px"
                  borderColor={borderColor}
                  position="relative"
                  transition="transform 0.2s"
                  _hover={{ transform: "translateY(-5px)" }}
                >
                  <Box position="relative" h="200px">
                    <Image
                      src={favorite.content.thumbnail}
                      alt={favorite.content.title}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      fallbackSrc="/placeholder.jpg"
                    />
                    <Box
                      position="absolute"
                      bottom={0}
                      left={0}
                      right={0}
                      bgGradient="linear(to-t, blackAlpha.800, transparent)"
                      p={4}
                      color="white"
                    >
                      <Text fontWeight="bold" fontSize="lg" noOfLines={1}>
                        {favorite.content.title}
                      </Text>
                      <HStack spacing={2} mt={1}>
                        <Badge
                          colorScheme={
                            favorite.content.type === "FILM" ? "blue" : "purple"
                          }
                          textTransform="uppercase"
                          fontSize="xs"
                        >
                          {favorite.content.type === "FILM" ? "Film" : "Série"}
                        </Badge>
                        <Text fontSize="xs">{favorite.content.year}</Text>
                      </HStack>
                    </Box>
                    <Tooltip label="Retirer des favoris">
                      <IconButton
                        aria-label="Retirer des favoris"
                        icon={<FiX />}
                        size="sm"
                        colorScheme="red"
                        variant="solid"
                        position="absolute"
                        top={2}
                        right={2}
                        borderRadius="full"
                        onClick={() => openRemoveModal(favorite)}
                      />
                    </Tooltip>
                  </Box>

                  <Box p={4}>
                    <Text fontSize="sm" color="gray.500" mb={3} noOfLines={2}>
                      {favorite.content.description}
                    </Text>

                    <Text fontSize="xs" color="gray.500" mb={3}>
                      {favorite.content.genre} • Réalisé par{" "}
                      {favorite.content.director}
                    </Text>

                    <Text fontSize="xs" color="gray.500" mb={4}>
                      Ajouté le{" "}
                      {new Date(favorite.addedAt).toLocaleDateString()}
                    </Text>

                    <Flex justify="space-between" align="center">
                      <Box>
                        <Badge
                          colorScheme="gray"
                          fontSize="xs"
                          variant="subtle"
                        >
                          {favorite.content.genre?.split(",")[0]}
                        </Badge>
                      </Box>

                      <Link href={contentUrl} passHref>
                        <Button
                          size="sm"
                          colorScheme="red"
                          rightIcon={<FiPlay />}
                        >
                          Regarder
                        </Button>
                      </Link>
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>

      {/* Modal de confirmation de suppression */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Confirmer la suppression</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <Text>
              Êtes-vous sûr de vouloir retirer
              <Text as="span" fontWeight="bold">
                {" "}
                {selectedFavorite?.content.title}{" "}
              </Text>
              de vos favoris ?
            </Text>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="red"
              onClick={() =>
                selectedFavorite && handleRemoveFavorite(selectedFavorite.id)
              }
              leftIcon={<FiTrash2 />}
            >
              Supprimer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
