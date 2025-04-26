"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  SimpleGrid,
  Flex,
  Badge,
  VStack,
  HStack,
  IconButton,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useToast,
  Select,
  Input,
  Skeleton,
  Image,
  useColorModeValue,
  InputGroup,
  InputLeftElement,
  Tag,
  Divider,
  Tooltip,
  Icon,
  FormControl,
  FormLabel,
  Spinner,
} from "@chakra-ui/react";
import {
  ChevronDownIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  SearchIcon,
  AddIcon,
  CheckIcon,
  TimeIcon,
  StarIcon,
} from "@chakra-ui/icons";
import Link from "next/link";
import { motion } from "framer-motion";
import { FiFilm, FiTv } from "react-icons/fi";

// Wrapper pour ajouter les animations framer-motion aux composants Chakra
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionSimpleGrid = motion(SimpleGrid);

interface Content {
  id: string;
  title: string;
  type: "FILM" | "SERIE";
  description: string;
  thumbnail: string;
  isApproved: boolean;
  createdAt: string;
  salesCount: number;
  revenue: number;
}

export default function CreatorContentList() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const [contents, setContents] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSessionLoading, setIsSessionLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<string>(
    searchParams.get("type") || "all"
  );
  const [statusFilter, setStatusFilter] = useState<string>(
    searchParams.get("status") || "all"
  );
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Styles
  const cardBg = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const headerBg = useColorModeValue(
    "linear(to-r, red.500, pink.500)",
    "linear(to-r, red.500, pink.500)"
  );
  const inputBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const accentColor = "red.500";

  useEffect(() => {
    if (status === "loading") {
      setIsSessionLoading(true);
      return;
    }

    setIsSessionLoading(false);

    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "CREATOR") {
      router.push("/dashboard");
      return;
    }

    // Seulement charger les contenus si l'authentification est réussie
    fetchContents();
  }, [session, status]);

  // Effet séparé pour les filtres
  useEffect(() => {
    if (status !== "loading" && session?.user?.role === "CREATOR") {
      fetchContents();
    }
  }, [typeFilter, statusFilter]);

  const fetchContents = async () => {
    try {
      setIsLoading(true);

      let queryParams = new URLSearchParams();

      if (typeFilter !== "all") {
        queryParams.append("type", typeFilter);
      }

      if (statusFilter === "approved") {
        queryParams.append("isApproved", "true");
      } else if (statusFilter === "pending") {
        queryParams.append("isApproved", "false");
      }

      const response = await fetch(`/api/creator/contents?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        cache: "no-store",
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(
          `Erreur (${response.status}): ${
            errorData.error || "Erreur lors du chargement des contenus"
          }`
        );
      }

      const data = await response.json();

      if (!data.contents || !Array.isArray(data.contents)) {
        throw new Error("Format de données invalide");
      }

      // Ajouter un petit délai pour être sûr que l'état est mis à jour
      setTimeout(() => {
        setContents(data.contents);
        setIsLoading(false);
      }, 100);
    } catch (error) {
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger vos contenus",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      setContents([]);
      setIsLoading(false);
    }
  };

  const deleteContent = async (contentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce contenu ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/creator/contents/${contentId}`, {
        method: "DELETE",
        credentials: "include",
      });

 

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Erreur de suppression:", errorData);
        throw new Error(
          `Erreur (${response.status}): ${
            errorData.error || "Erreur lors de la suppression"
          }`
        );
      }

      toast({
        title: "Contenu supprimé",
        description: "Le contenu a été supprimé avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Recharger la liste
      fetchContents();
    } catch (error) {
      console.error("Erreur complète:", error);
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de supprimer ce contenu",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const filteredContents = contents.filter((content) =>
    content.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

 

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  // Formatage de la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  // Force l'actualisation sur tous les changements d'état
  useEffect(() => {
    if (filteredContents.length > 0) {
      // Forcer un re-render
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [filteredContents.length, typeFilter, statusFilter, searchQuery]);

  return (
    <Container maxW="container.xl" py={8}>
      {isSessionLoading ? (
        <Flex
          justify="center"
          align="center"
          minHeight="70vh"
          direction="column"
        >
          <Spinner
            size="xl"
            color="red.500"
            thickness="4px"
            speed="0.65s"
            mb={4}
          />
          <Text fontSize="xl" color="gray.600">
            Chargement de votre espace créateur...
          </Text>
        </Flex>
      ) : (
        <>
          <MotionBox
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            mb={8}
          >
            <Box
              position="relative"
              borderRadius="xl"
              overflow="hidden"
              mb={8}
              height="200px"
            >
              <Box
                position="absolute"
                top={0}
                left={0}
                right={0}
                bottom={0}
                bgGradient={headerBg}
                zIndex={0}
              />
              <Flex
                direction="column"
                justify="center"
                align="center"
                height="100%"
                position="relative"
                zIndex={1}
                textAlign="center"
                px={4}
              >
                <Heading
                  color="white"
                  fontSize={{ base: "3xl", md: "4xl" }}
                  fontWeight="bold"
                  mb={2}
                >
                  Votre Bibliothèque de Contenus
                </Heading>
                <Text color="white" fontSize="lg" maxW="container.md" mb={6}>
                  Gérez tous vos films et séries en un seul endroit
                </Text>
                <Link href="/creator/content/new" passHref>
                  <Button
                    size="lg"
                    leftIcon={<AddIcon />}
                    colorScheme="white"
                    bg="white"
                    color="red.500"
                    _hover={{ bg: "gray.100" }}
                    fontWeight="bold"
                    boxShadow="lg"
                  >
                    Ajouter un Nouveau Contenu
                  </Button>
                </Link>
              </Flex>
            </Box>

            <Box
              p={6}
              bg={cardBg}
              borderRadius="xl"
              boxShadow="lg"
              border="1px"
              borderColor={borderColor}
              mb={8}
            >
              <Flex
                wrap="wrap"
                direction={{ base: "column", md: "row" }}
                gap={4}
                justify="space-between"
                align={{ base: "stretch", md: "center" }}
              >
                <HStack spacing={4} flex={{ base: "auto", md: 2 }}>
                  <FormControl minW="180px">
                    <FormLabel htmlFor="type-filter" srOnly>
                      Filtrer par type de contenu
                    </FormLabel>
                    <Select
                      id="type-filter"
                      value={typeFilter}
                      onChange={(e) => setTypeFilter(e.target.value)}
                      bg={inputBg}
                      variant="filled"
                      borderRadius="md"
                      size="lg"
                      boxShadow="sm"
                      _hover={{ bg: inputBg }}
                      aria-label="Filtrer par type de contenu"
                    >
                      <option value="all">Tous les types</option>
                      <option value="FILM">Films</option>
                      <option value="SERIE">Séries</option>
                    </Select>
                  </FormControl>

                  <FormControl minW="180px">
                    <FormLabel htmlFor="status-filter" srOnly>
                      Filtrer par statut d'approbation
                    </FormLabel>
                    <Select
                      id="status-filter"
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      bg={inputBg}
                      variant="filled"
                      borderRadius="md"
                      size="lg"
                      boxShadow="sm"
                      _hover={{ bg: inputBg }}
                      aria-label="Filtrer par statut d'approbation"
                    >
                      <option value="all">Tous les statuts</option>
                      <option value="approved">Approuvé</option>
                      <option value="pending">En attente</option>
                    </Select>
                  </FormControl>
                </HStack>

                <InputGroup
                  flex={{ base: "auto", md: 3 }}
                  size="lg"
                  maxW={{ base: "100%", md: "400px" }}
                >
                  <InputLeftElement pointerEvents="none">
                    <SearchIcon color="gray.400" />
                  </InputLeftElement>
                  <Input
                    placeholder="Rechercher par titre..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    bg={inputBg}
                    variant="filled"
                    borderRadius="md"
                    _hover={{ bg: inputBg }}
                  />
                </InputGroup>
              </Flex>
            </Box>
          </MotionBox>

          {isLoading ? (
            <MotionSimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {[...Array(6)].map((_, i) => (
                <Skeleton
                  key={i}
                  height="350px"
                  borderRadius="xl"
                  startColor="pink.100"
                  endColor="purple.200"
                />
              ))}
            </MotionSimpleGrid>
          ) : filteredContents.length === 0 ? (
            <MotionBox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              p={10}
              textAlign="center"
              bg={cardBg}
              borderRadius="xl"
              boxShadow="xl"
            >
              <Image
                src="/empty-content.svg"
                alt="Aucun contenu"
                maxW="200px"
                mx="auto"
                mb={6}
                fallback={
                  <Box
                    height="200px"
                    width="100%"
                    display="flex"
                    alignItems="center"
                    justifyContent="center"
                  >
                    <Icon as={ViewIcon} w={20} h={20} color="gray.300" />
                  </Box>
                }
              />
              <Heading size="lg" mb={4} color={textColor}>
                Aucun contenu trouvé
              </Heading>
              <Text fontSize="lg" color="gray.500" mb={8}>
                Commencez à créer du contenu pour développer votre audience et
                générer des revenus.
              </Text>
              <Flex justify="center">
                <Link href="/creator/content/new" passHref>
                  <Button
                    colorScheme="red"
                    size="lg"
                    leftIcon={<AddIcon />}
                    boxShadow="md"
                  >
                    Ajouter mon premier contenu
                  </Button>
                </Link>
              </Flex>
            </MotionBox>
          ) : (
            <MotionSimpleGrid
              columns={{ base: 1, md: 2, lg: 3 }}
              spacing={6}
              initial="hidden"
              animate="visible"
              variants={{
                visible: {
                  transition: {
                    staggerChildren: 0.05,
                  },
                },
              }}
            >
              {filteredContents.map((content, index) => (
                <MotionBox
                  key={content.id}
                  variants={cardVariants}
                  transition={{ duration: 0.2 }}
                  borderRadius="xl"
                  overflow="hidden"
                  bg={cardBg}
                  boxShadow="lg"
                  border="1px solid"
                  borderColor={borderColor}
                  _hover={{ transform: "translateY(-5px)", boxShadow: "xl" }}
                  position="relative"
                >
                  <Box position="relative" h="220px">
                    <Box
                      w="100%"
                      h="100%"
                      bg="gray.200"
                      position="absolute"
                      top={0}
                      left={0}
                    />
                    <Image
                      src={content.thumbnail || "/placeholder.jpg"}
                      alt={content.title}
                      objectFit="cover"
                      w="100%"
                      h="100%"
                      position="relative"
                      zIndex={1}
                      loading="eager"
                      fallback={
                        <Flex
                          h="100%"
                          w="100%"
                          bg="gray.200"
                          justify="center"
                          align="center"
                        >
                          <Icon
                            as={content.type === "FILM" ? FiFilm : FiTv}
                            boxSize={16}
                            color="gray.500"
                          />
                        </Flex>
                      }
                    />
                    <Box
                      position="absolute"
                      top={0}
                      left={0}
                      right={0}
                      bottom={0}
                      bg="transparent"
                      zIndex={1}
                    />
                    <Box
                      position="absolute"
                      left={0}
                      right={0}
                      bottom={0}
                      height="50%"
                      bgGradient="linear(to-t, blackAlpha.700, transparent)"
                      zIndex={1}
                    />

                    <Flex
                      position="absolute"
                      top={0}
                      right={0}
                      zIndex={2}
                      m={3}
                      gap={2}
                    >
                      <Tooltip
                        label={content.type === "FILM" ? "Film" : "Série"}
                        placement="top"
                        hasArrow
                      >
                        <Badge
                          colorScheme={
                            content.type === "FILM" ? "blue" : "purple"
                          }
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                          textTransform="uppercase"
                          boxShadow="md"
                          bg={
                            content.type === "FILM" ? "blue.500" : "purple.500"
                          }
                          color="white"
                        >
                          {content.type}
                        </Badge>
                      </Tooltip>
                    </Flex>

                    <Flex position="absolute" top={0} left={0} zIndex={2} m={3}>
                      <Tooltip
                        label={
                          content.isApproved
                            ? "Contenu approuvé"
                            : "En attente d'approbation"
                        }
                        placement="top"
                        hasArrow
                      >
                        <Badge
                          colorScheme={content.isApproved ? "green" : "orange"}
                          px={3}
                          py={1}
                          borderRadius="full"
                          fontSize="xs"
                          fontWeight="bold"
                          boxShadow="md"
                          bg={content.isApproved ? "green.500" : "orange.500"}
                          color="white"
                        >
                          <Flex align="center">
                            {content.isApproved ? (
                              <>
                                <CheckIcon mr={1} boxSize={3} />
                                Approuvé
                              </>
                            ) : (
                              <>
                                <TimeIcon mr={1} boxSize={3} />
                                En attente
                              </>
                            )}
                          </Flex>
                        </Badge>
                      </Tooltip>
                    </Flex>
                  </Box>

                  <Box p={5} bg={cardBg}>
                    <Heading
                      as="h3"
                      size="md"
                      mb={2}
                      noOfLines={1}
                      color={textColor}
                      fontWeight="bold"
                    >
                      {content.title}
                    </Heading>

                    <Text
                      fontSize="sm"
                      color="gray.600"
                      mb={3}
                      noOfLines={2}
                      lineHeight="1.4"
                    >
                      {content.description}
                    </Text>

                    <Tag
                      size="sm"
                      colorScheme="gray"
                      mb={4}
                      fontWeight="normal"
                      borderRadius="full"
                    >
                      Créé le {formatDate(content.createdAt)}
                    </Tag>

                    <Divider mb={4} />

                    <Flex justify="space-between" align="center">
                      <HStack spacing={4}>
                        <VStack align="flex-start" spacing={0}>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="medium"
                          >
                            Ventes
                          </Text>
                          <Flex align="center">
                            <Text fontWeight="bold">{content.salesCount}</Text>
                          </Flex>
                        </VStack>

                        <VStack align="flex-start" spacing={0}>
                          <Text
                            fontSize="xs"
                            color="gray.500"
                            fontWeight="medium"
                          >
                            Revenus
                          </Text>
                          <Flex align="center">
                            <Text fontWeight="bold" color={accentColor}>
                              {content.revenue.toLocaleString()} FCFA
                            </Text>
                          </Flex>
                        </VStack>
                      </HStack>

                      <HStack>
                        <Tooltip label="Voir" placement="top" hasArrow>
                          <Link href={`/content/${content.id}`} passHref>
                            <IconButton
                              aria-label="Voir le contenu"
                              icon={<ViewIcon />}
                              variant="ghost"
                              colorScheme="blue"
                              size="md"
                            />
                          </Link>
                        </Tooltip>

                        <Menu>
                          <MenuButton
                            as={Button}
                            rightIcon={<ChevronDownIcon />}
                            variant="outline"
                            size="sm"
                            borderRadius="md"
                          >
                            Actions
                          </MenuButton>
                          <MenuList>
                            <Link
                              href={`/creator/content/edit/${content.id}`}
                              passHref
                            >
                              <MenuItem icon={<EditIcon />}>Modifier</MenuItem>
                            </Link>
                            <MenuItem
                              icon={<DeleteIcon />}
                              onClick={() => deleteContent(content.id)}
                              color="red.500"
                            >
                              Supprimer
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </HStack>
                    </Flex>
                  </Box>
                </MotionBox>
              ))}
            </MotionSimpleGrid>
          )}
        </>
      )}
    </Container>
  );
}
