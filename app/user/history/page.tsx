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
  Progress,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Tooltip,
} from "@chakra-ui/react";
import {
  FiSearch,
  FiPlay,
  FiClock,
  FiCalendar,
  FiFilm,
  FiTv,
  FiFilter,
  FiEye,
  FiArrowRight,
} from "react-icons/fi";
import Link from "next/link";

interface ViewHistory {
  id: string;
  contentId: string;
  progress: number;
  lastWatchedAt: string;
  completedAt: string | null;
  content: {
    id: string;
    title: string;
    type: "FILM" | "SERIE";
    thumbnail: string;
    description: string;
    genre: string;
    year: string;
    director: string;
    duration: number; // en minutes
  };
}

export default function HistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<ViewHistory[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<ViewHistory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [contentTypeFilter, setContentTypeFilter] = useState("all");
  const [completionFilter, setCompletionFilter] = useState("all");

  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue("gray.50", "gray.900");
  const cardBg = useColorModeValue("white", "gray.800");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated" && session) {
      fetchHistory();
    }
  }, [session, status, router]);

  const fetchHistory = async () => {
    try {
      setIsLoading(true);
      // Utiliser l'API user/me qui contient toutes les données utilisateur
      const response = await fetch("/api/user/me");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération de l'historique");
      }

      const data = await response.json();
      // Extraire l'historique des données utilisateur
      // Cette partie dépend de comment l'historique est stocké dans l'API
      const userHistory =
        data.viewHistory?.map((item) => ({
          id: item.id,
          contentId: item.contentId,
          progress: item.progress,
          lastWatchedAt: item.updatedAt || item.createdAt,
          completedAt: item.completedAt,
          content: {
            id: item.content.id,
            title: item.content.title,
            type: item.content.type,
            thumbnail: item.content.thumbnail || "/placeholder.jpg",
            description: item.content.description,
            genre: item.content.genre,
            year: item.content.year,
            director: item.content.director,
            duration:
              item.content.duration ||
              (item.content.type === "FILM" ? 120 : 45),
          },
        })) || [];

      setHistory(userHistory);
      setFilteredHistory(userHistory);
    } catch (error) {
      console.error("Erreur:", error);

      setHistory([]);
      setFilteredHistory([]);

      toast({
        title: "Erreur",
        description:
          "Impossible de charger votre historique. Veuillez réessayer plus tard.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Filtrer l'historique selon les critères
    let result = [...history];

    // Filtre par type de contenu
    if (contentTypeFilter !== "all") {
      result = result.filter((item) => item.content.type === contentTypeFilter);
    }

    // Filtre par état de complétion
    if (completionFilter !== "all") {
      if (completionFilter === "completed") {
        result = result.filter((item) => item.completedAt !== null);
      } else {
        result = result.filter((item) => item.completedAt === null);
      }
    }

    // Filtre par recherche
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.content.title.toLowerCase().includes(query) ||
          item.content.description.toLowerCase().includes(query) ||
          item.content.genre?.toLowerCase().includes(query) ||
          item.content.director?.toLowerCase().includes(query)
      );
    }

    // Tri par date de visionnage (le plus récent d'abord)
    result.sort((a, b) => {
      return (
        new Date(b.lastWatchedAt).getTime() -
        new Date(a.lastWatchedAt).getTime()
      );
    });

    setFilteredHistory(result);
  }, [history, searchQuery, contentTypeFilter, completionFilter]);

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
              Mon historique de visionnage
            </Heading>
            <Text color="gray.500">
              {filteredHistory.length}{" "}
              {filteredHistory.length > 1
                ? "contenus visionnés"
                : "contenu visionné"}
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
              placeholder="Rechercher dans l'historique..."
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
            aria-label="Filtrer par type de contenu"
          >
            <option value="all">Tous types</option>
            <option value="FILM">Films</option>
            <option value="SERIE">Séries</option>
          </Select>

          <Select
            value={completionFilter}
            onChange={(e) => setCompletionFilter(e.target.value)}
            maxW="200px"
            icon={<FiFilter />}
            aria-label="Filtrer par état de complétion"
          >
            <option value="all">Tous états</option>
            <option value="completed">Terminés</option>
            <option value="inprogress">En cours</option>
          </Select>
        </Flex>

        {filteredHistory.length === 0 ? (
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
              Aucun historique trouvé
            </AlertTitle>
            <AlertDescription maxWidth="md">
              {searchQuery ||
              contentTypeFilter !== "all" ||
              completionFilter !== "all"
                ? "Aucun contenu visionné ne correspond à votre recherche. Essayez de modifier vos filtres."
                : "Vous n'avez pas encore visionné de contenu."}
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
            {filteredHistory.map((item) => {
              const contentUrl =
                item.content.type === "FILM"
                  ? `/films/${item.content.id}`
                  : `/series/${item.content.id}`;

              // Formatage de la durée en heures et minutes
              const hours = Math.floor(item.content.duration / 60);
              const minutes = item.content.duration % 60;
              const durationText =
                hours > 0
                  ? `${hours}h ${minutes > 0 ? minutes + "min" : ""}`
                  : `${minutes}min`;

              // Formatage de la date
              const watchDate = new Date(item.lastWatchedAt);
              const dateOptions: Intl.DateTimeFormatOptions = {
                day: "numeric",
                month: "long",
                year: "numeric",
              };
              const formattedDate = watchDate.toLocaleDateString(
                "fr-FR",
                dateOptions
              );

              return (
                <Box
                  key={item.id}
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
                      src={item.content.thumbnail}
                      alt={item.content.title}
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
                        {item.content.title}
                      </Text>
                      <HStack spacing={2} mt={1}>
                        <Badge
                          colorScheme={
                            item.content.type === "FILM" ? "blue" : "purple"
                          }
                          textTransform="uppercase"
                          fontSize="xs"
                        >
                          {item.content.type === "FILM" ? "Film" : "Série"}
                        </Badge>
                        <Text fontSize="xs">{item.content.year}</Text>
                      </HStack>
                    </Box>

                    {item.completedAt && (
                      <Badge
                        position="absolute"
                        top={2}
                        right={2}
                        colorScheme="green"
                        rounded="full"
                        px={2}
                        py={1}
                      >
                        Terminé
                      </Badge>
                    )}
                  </Box>

                  <Box p={4}>
                    <HStack justify="space-between" mb={3}>
                      <Text fontSize="sm" fontWeight="medium">
                        Progression
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {item.progress}%
                      </Text>
                    </HStack>

                    <Progress
                      value={item.progress}
                      size="sm"
                      colorScheme={item.completedAt ? "green" : "red"}
                      borderRadius="full"
                      mb={4}
                    />

                    <HStack fontSize="xs" color="gray.500" mb={2}>
                      <Icon as={FiClock} />
                      <Text>{durationText}</Text>
                      <Box flex={1} />
                      <Icon as={FiEye} />
                      <Text>Visionné le {formattedDate}</Text>
                    </HStack>

                    <Divider my={3} />

                    <Text fontSize="xs" color="gray.500" mb={4}>
                      {item.content.genre} • Réalisé par {item.content.director}
                    </Text>

                    <Flex justify="space-between" align="center">
                      <Badge colorScheme="gray" fontSize="xs" variant="subtle">
                        {item.content.genre?.split(",")[0]}
                      </Badge>

                      <HStack>
                        <Link href={contentUrl} passHref>
                          <Button
                            size="sm"
                            colorScheme="red"
                            rightIcon={<FiPlay />}
                          >
                            {item.completedAt ? "Revoir" : "Continuer"}
                          </Button>
                        </Link>
                      </HStack>
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </SimpleGrid>
        )}
      </VStack>
    </Container>
  );
}
