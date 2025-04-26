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
  Avatar,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  Button,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  useColorModeValue,
  Badge,
  Flex,
  Card,
  CardHeader,
  CardBody,
  IconButton,
  Tooltip,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useToast,
  Stack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Spinner,
  Center,
} from "@chakra-ui/react";
import {
  FiEdit,
  FiUser,
  FiShoppingBag,
  FiClock,
  FiStar,
  FiUpload,
  FiFilm,
  FiTv,
} from "react-icons/fi";
import Link from "next/link";

interface Transaction {
  id: string;
  contentId: string;
  amount: number;
  createdAt: string;
  content: {
    title: string;
    type: string;
    thumbnail: string;
  };
}

interface UserProfile {
  id: string;
  name: string | null;
  email: string;
  role: string;
  avatar: string | null;
  bio: string | null;
  isVerified: boolean;
  createdAt: string;
  lastLogin: string | null;
}

interface UserStats {
  totalPurchases: number;
  totalSpent: number;
  favoriteGenre: string;
  recentViewCount: number;
}

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recentTransactions, setRecentTransactions] = useState<Transaction[]>(
    []
  );
  const [stats, setStats] = useState<UserStats>({
    totalPurchases: 0,
    totalSpent: 0,
    favoriteGenre: "Aucun",
    recentViewCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    avatar: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const router = useRouter();
  const toast = useToast();

  const bgColor = useColorModeValue("gray.100", "gray.800");
  const cardBg = useColorModeValue("white", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const borderColor = useColorModeValue("gray.200", "gray.600");
  const accentColor = useColorModeValue("red.500", "red.300");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
    }

    if (status === "authenticated" && session) {
      fetchUserProfile();
      fetchRecentTransactions();
    }
  }, [session, status, router]);

  const fetchUserProfile = async () => {
    try {
      setIsLoading(true);

      // Vérifier que la session est correctement chargée avant de continuer
      if (!session || !session.user || !session.user.id) {
        throw new Error("Session utilisateur non valide");
      }

      // Appel API avec gestion d'erreurs améliorée
      let response;
      try {
        response = await fetch("/api/user/me");
      } catch (fetchError) {
        console.error("Erreur de réseau:", fetchError);
        throw new Error("Problème de connexion au serveur");
      }

      if (!response.ok) {
        const errorText = await response.text().catch(() => "Erreur inconnue");
        console.error(`Erreur HTTP ${response.status}: ${errorText}`);
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Erreur lors du parsing JSON:", jsonError);
        throw new Error("Réponse serveur invalide");
      }

      // Vérifier que les données contiennent l'information minimale requise
      if (!data || !data.id) {
        console.error("Données invalides reçues:", data);
        throw new Error("Format de données invalide");
      }

      // Mise à jour des données utilisateur avec les valeurs reçues
      setUserProfile({
        id: data.id,
        name: data.name || "",
        email: data.email || "",
        role: data.role || "USER",
        avatar: data.image || null,
        bio: data.bio || null,
        isVerified: Boolean(data.emailVerified),
        createdAt: data.createdAt || new Date().toISOString(),
        lastLogin: data.lastLoginAt || null,
      });

      setFormData({
        name: data.name || "",
        bio: data.bio || "",
        avatar: data.image || "",
      });

      // Statistiques basées sur les transactions
      const transactions = Array.isArray(data.transactions)
        ? data.transactions
        : [];
      setStats({
        totalPurchases: transactions.length,
        totalSpent: transactions.reduce(
          (sum: number, t: { amount?: number }) =>
            sum + (Number(t.amount) || 0),
          0
        ),
        favoriteGenre: "Drame", // À calculer depuis les transactions
        recentViewCount: 12, // À implémenter
      });
    } catch (error) {
      console.error(
        "Erreur complète lors de la récupération du profil:",
        error
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error
            ? error.message
            : "Impossible de charger votre profil",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecentTransactions = async () => {
    try {
      const response = await fetch("/api/user/me");

      if (!response.ok) {
        throw new Error("Erreur lors de la récupération des transactions");
      }

      const data = await response.json();
      // Prendre les 3 transactions les plus récentes
      const transactions =
        data.transactions?.slice(0, 3).map(
          (t: {
            id: string;
            contentId: string;
            amount: number;
            createdAt: string;
            content: {
              title: string;
              type: string;
              thumbnail?: string;
            };
          }) => ({
            id: t.id,
            contentId: t.contentId,
            amount: t.amount,
            createdAt: t.createdAt,
            content: {
              title: t.content.title,
              type: t.content.type,
              thumbnail: t.content.thumbnail || "/placeholder.jpg",
            },
          })
        ) || [];

      setRecentTransactions(transactions);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      // Pas de données mockées, ne rien afficher en cas d'erreur
      setRecentTransactions([]);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      const response = await fetch("/api/user/me", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          bio: formData.bio,
          image: formData.avatar,
        }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de la mise à jour du profil");
      }

      const data = await response.json();

      // Mettre à jour les données du profil en utilisant le format reçu
      setUserProfile({
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        role: data.user.role,
        avatar: data.user.image,
        bio: data.user.bio,
        isVerified: data.user.emailVerified !== null,
        createdAt: data.user.createdAt,
        lastLogin: data.user.lastLoginAt,
      });

      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été mises à jour avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour votre profil",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsUpdating(false);
    }
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
        {/* En-tête du profil */}
        <Flex
          direction={{ base: "column", md: "row" }}
          bg={cardBg}
          borderRadius="xl"
          overflow="hidden"
          boxShadow="md"
          p={6}
          gap={6}
        >
          <Flex justifyContent="center" alignItems="center">
            <Box position="relative">
              <Avatar
                size="2xl"
                name={userProfile?.name || userProfile?.email}
                src={userProfile?.avatar || undefined}
                bg={accentColor}
              />
              <Tooltip label="Modifier le profil">
                <IconButton
                  aria-label="Modifier le profil"
                  icon={<FiEdit />}
                  size="sm"
                  colorScheme="red"
                  position="absolute"
                  bottom={0}
                  right={0}
                  borderRadius="full"
                  onClick={onOpen}
                />
              </Tooltip>
            </Box>
          </Flex>

          <VStack align="start" spacing={3} flex={1}>
            <Heading size="lg" color={textColor}>
              {userProfile?.name || "Utilisateur AfriFilm"}
            </Heading>
            <Text color="gray.500">{userProfile?.email}</Text>
            <HStack>
              <Badge
                colorScheme={
                  userProfile?.role === "CREATOR" ? "purple" : "blue"
                }
              >
                {userProfile?.role === "CREATOR" ? "Créateur" : "Utilisateur"}
              </Badge>
              {userProfile?.isVerified && (
                <Badge colorScheme="green">Vérifié</Badge>
              )}
            </HStack>
            <Text fontSize="sm" color="gray.500">
              Membre depuis{" "}
              {userProfile
                ? new Date(userProfile.createdAt).toLocaleDateString()
                : "-"}
            </Text>
            {userProfile?.bio && (
              <Text mt={2} color={textColor} fontSize="md">
                {userProfile.bio}
              </Text>
            )}
          </VStack>

          <VStack
            align="start"
            justify="center"
            spacing={4}
            minW={{ md: "200px" }}
          >
            <Button
              as={Link}
              href="/user/purchases"
              rightIcon={<FiShoppingBag />}
              colorScheme="red"
              variant="outline"
              w="full"
            >
              Mes achats
            </Button>
            <Button
              as={Link}
              href="/user/favorites"
              rightIcon={<FiStar />}
              colorScheme="red"
              variant="outline"
              w="full"
            >
              Mes favoris
            </Button>
            <Button
              as={Link}
              href="/user/history"
              rightIcon={<FiClock />}
              colorScheme="red"
              variant="outline"
              w="full"
            >
              Historique
            </Button>
          </VStack>
        </Flex>

        {/* Statistiques utilisateur */}
        <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6}>
          <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <StatLabel color="gray.500">Achats</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>
              {stats.totalPurchases}
            </StatNumber>
            <Text fontSize="sm" color="gray.500">
              films et séries achetés
            </Text>
          </Stat>

          <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <StatLabel color="gray.500">Dépenses</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>
              {stats.totalSpent.toLocaleString()} FCFA
            </StatNumber>
            <Text fontSize="sm" color="gray.500">
              montant total dépensé
            </Text>
          </Stat>

          <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <StatLabel color="gray.500">Genre préféré</StatLabel>
            <StatNumber fontSize="2xl" color={accentColor}>
              {stats.favoriteGenre}
            </StatNumber>
            <Text fontSize="sm" color="gray.500">
              basé sur vos achats
            </Text>
          </Stat>

          <Stat bg={cardBg} p={5} borderRadius="lg" boxShadow="sm">
            <StatLabel color="gray.500">Visionnages récents</StatLabel>
            <StatNumber fontSize="3xl" color={accentColor}>
              {stats.recentViewCount}
            </StatNumber>
            <Text fontSize="sm" color="gray.500">
              des 30 derniers jours
            </Text>
          </Stat>
        </SimpleGrid>

        {/* Achats récents */}
        <Box bg={cardBg} p={6} borderRadius="xl" boxShadow="md">
          <Flex justify="space-between" align="center" mb={4}>
            <Heading size="md" color={textColor}>
              Achats récents
            </Heading>
            <Button
              as={Link}
              href="/user/purchases"
              size="sm"
              colorScheme="red"
              variant="ghost"
            >
              Voir tous
            </Button>
          </Flex>

          {recentTransactions.length > 0 ? (
            <SimpleGrid columns={{ base: 1, md: 3 }} spacing={4}>
              {recentTransactions.map((transaction) => (
                <Card
                  key={transaction.id}
                  variant="outline"
                  borderColor={borderColor}
                >
                  <CardHeader p={4} pb={2}>
                    <Flex justify="space-between" align="center">
                      <Heading size="sm" noOfLines={1}>
                        {transaction.content.title}
                      </Heading>
                      <Badge
                        colorScheme={
                          transaction.content.type === "FILM"
                            ? "blue"
                            : "purple"
                        }
                      >
                        {transaction.content.type === "FILM" ? (
                          <FiFilm />
                        ) : (
                          <FiTv />
                        )}
                      </Badge>
                    </Flex>
                  </CardHeader>
                  <CardBody p={4} pt={0}>
                    <Flex direction="column" gap={2}>
                      <Text fontSize="lg" fontWeight="bold">
                        {transaction.amount.toLocaleString()} FCFA
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        Acheté le{" "}
                        {new Date(transaction.createdAt).toLocaleDateString()}
                      </Text>
                    </Flex>
                  </CardBody>
                </Card>
              ))}
            </SimpleGrid>
          ) : (
            <Text color="gray.500" fontSize="md" textAlign="center" py={4}>
              Vous n'avez pas encore effectué d'achat
            </Text>
          )}
        </Box>
      </VStack>

      {/* Modal de mise à jour du profil */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Modifier votre profil</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Nom</FormLabel>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Votre nom"
                />
              </FormControl>

              <FormControl>
                <FormLabel>Biographie</FormLabel>
                <Textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Parlez de vous"
                  resize="vertical"
                  rows={4}
                />
              </FormControl>

              <FormControl>
                <FormLabel>URL de l'avatar (optionnel)</FormLabel>
                <Input
                  name="avatar"
                  value={formData.avatar}
                  onChange={handleInputChange}
                  placeholder="https://exemple.com/avatar.jpg"
                />
              </FormControl>
            </VStack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme="red"
              onClick={handleProfileUpdate}
              isLoading={isUpdating}
            >
              Enregistrer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
}
