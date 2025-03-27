"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Heading,
  Text,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  Icon,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Badge,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Button,
} from "@chakra-ui/react";
import { FiUsers, FiVideo, FiDollarSign, FiRefreshCw } from "react-icons/fi";

// Types pour les données du tableau de bord
interface Transaction {
  id: string;
  amount: number;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name?: string;
  };
  content: {
    id: string;
    title: string;
  };
}

interface Content {
  id: string;
  title: string;
  type: "FILM" | "SERIE";
  isApproved: boolean;
  createdAt: string;
  creator: {
    id: string;
    email: string;
    name?: string;
  };
}

interface DashboardData {
  users: {
    total: number;
  };
  creators: {
    total: number;
  };
  contents: {
    total: number;
    pending: number;
  };
  sales: {
    total: number;
  };
  recentTransactions: Transaction[];
  recentContents: Content[];
}

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Fonction pour charger les données du tableau de bord
  const fetchDashboardData = async () => {
    try {
      setIsRefreshing(true);

      const response = await fetch("/api/admin/dashboard");

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Erreur ${response.status}`);
      }

      const data = await response.json();
      console.log("Données du tableau de bord reçues:", data);

      // Vérification des propriétés requises
      if (!data.users || !data.creators || !data.contents || !data.sales) {
        throw new Error("Format de données incorrect reçu de l'API");
      }

      setDashboardData(data);
      setError(null);
    } catch (err) {
      console.error("Erreur lors du chargement du tableau de bord:", err);
      setError(err instanceof Error ? err.message : "Une erreur est survenue");
    } finally {
      setIsRefreshing(false);
    }
  };

  // Vérifier l'authentification et charger les données
  useEffect(() => {
    // Vérifier d'abord l'authentification
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    // Une fois authentifié, charger les données
    fetchDashboardData().finally(() => {
      setLoading(false);
    });
  }, [session, status, router]);

  // Formatter les valeurs monétaires
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value || 0);
  };

  // Formatter les dates
  const formatDate = (dateString: string): string => {
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat("fr-FR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(date);
    } catch (error) {
      console.error("Erreur de formatage de date:", error);
      return "Date invalide";
    }
  };

  // Afficher le spinner pendant le chargement initial
  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  // Afficher l'erreur si présente
  if (error) {
    return (
      <Box p={8}>
        <Alert status="error" variant="solid" borderRadius="md" mb={6}>
          <AlertIcon />
          <AlertTitle mr={2}>Erreur!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={fetchDashboardData}
          colorScheme="red"
        >
          Réessayer
        </Button>
      </Box>
    );
  }

  // Si les données ne sont pas disponibles (cas improbable après vérification)
  if (!dashboardData) {
    return (
      <Box p={8}>
        <Alert status="warning" variant="solid" borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Attention!</AlertTitle>
          <AlertDescription>
            Aucune donnée disponible pour le tableau de bord
          </AlertDescription>
        </Alert>
        <Button
          mt={4}
          leftIcon={<FiRefreshCw />}
          onClick={fetchDashboardData}
          colorScheme="blue"
        >
          Actualiser
        </Button>
      </Box>
    );
  }

  return (
    <Box p={4}>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading as="h1" color="white">
          Tableau de bord
        </Heading>
        <Button
          leftIcon={<FiRefreshCw />}
          onClick={fetchDashboardData}
          isLoading={isRefreshing}
          size="sm"
          colorScheme="blue"
        >
          Actualiser
        </Button>
      </Flex>

      <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6} mb={8}>
        {/* Carte Utilisateurs */}
        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
          <CardBody>
            <Flex align="center">
              <Box p={2} bg="red.500" borderRadius="md" mr={4} color="white">
                <Icon as={FiUsers} boxSize={6} />
              </Box>
              <Stat>
                <StatLabel color="gray.400">Utilisateurs</StatLabel>
                <StatNumber color="white" fontSize="2xl">
                  {dashboardData.users?.total || 0}
                </StatNumber>
                <StatHelpText color="gray.400">
                  Utilisateurs inscrits
                </StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>

        {/* Carte Créateurs */}
        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
          <CardBody>
            <Flex align="center">
              <Box p={2} bg="blue.500" borderRadius="md" mr={4} color="white">
                <Icon as={FiUsers} boxSize={6} />
              </Box>
              <Stat>
                <StatLabel color="gray.400">Créateurs</StatLabel>
                <StatNumber color="white" fontSize="2xl">
                  {dashboardData.creators?.total || 0}
                </StatNumber>
                <StatHelpText color="gray.400">Créateurs actifs</StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>

        {/* Carte Contenus */}
        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
          <CardBody>
            <Flex align="center">
              <Box p={2} bg="green.500" borderRadius="md" mr={4} color="white">
                <Icon as={FiVideo} boxSize={6} />
              </Box>
              <Stat>
                <StatLabel color="gray.400">Contenus</StatLabel>
                <StatNumber color="white" fontSize="2xl">
                  {dashboardData.contents?.total || 0}
                </StatNumber>
                <StatHelpText color="gray.400">
                  {dashboardData.contents?.pending || 0} en attente
                </StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>

        {/* Carte Chiffre d'affaires */}
        <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
          <CardBody>
            <Flex align="center">
              <Box p={2} bg="purple.500" borderRadius="md" mr={4} color="white">
                <Icon as={FiDollarSign} boxSize={6} />
              </Box>
              <Stat>
                <StatLabel color="gray.400">Chiffre d'affaires</StatLabel>
                <StatNumber color="white" fontSize="2xl">
                  {formatCurrency(dashboardData.sales?.total || 0)}
                </StatNumber>
                <StatHelpText color="gray.400">Total des ventes</StatHelpText>
              </Stat>
            </Flex>
          </CardBody>
        </Card>
      </SimpleGrid>

      {/* Section Transactions récentes */}
      <Heading as="h2" size="md" color="white" mb={4}>
        Transactions récentes
      </Heading>
      <Card bg="gray.800" borderColor="gray.700" borderWidth="1px" mb={8}>
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.400">Utilisateur</Th>
                  <Th color="gray.400">Contenu</Th>
                  <Th color="gray.400">Montant</Th>
                  <Th color="gray.400">Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData.recentTransactions &&
                dashboardData.recentTransactions.length > 0 ? (
                  dashboardData.recentTransactions.map((transaction) => (
                    <Tr key={transaction.id}>
                      <Td color="gray.300">
                        {transaction.user?.name ||
                          transaction.user?.email ||
                          "Utilisateur inconnu"}
                      </Td>
                      <Td color="gray.300">
                        {transaction.content?.title || "Contenu inconnu"}
                      </Td>
                      <Td color="gray.300">
                        {formatCurrency(transaction.amount)}
                      </Td>
                      <Td color="gray.300">
                        {formatDate(transaction.createdAt)}
                      </Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={4} textAlign="center" color="gray.500">
                      Aucune transaction récente
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>

      {/* Section Contenus récents */}
      <Heading as="h2" size="md" color="white" mb={4}>
        Contenus récents
      </Heading>
      <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.400">Titre</Th>
                  <Th color="gray.400">Type</Th>
                  <Th color="gray.400">Créateur</Th>
                  <Th color="gray.400">Statut</Th>
                  <Th color="gray.400">Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {dashboardData.recentContents &&
                dashboardData.recentContents.length > 0 ? (
                  dashboardData.recentContents.map((content) => (
                    <Tr key={content.id}>
                      <Td color="gray.300">{content.title}</Td>
                      <Td color="gray.300">
                        {content.type === "FILM" ? "Film" : "Série"}
                      </Td>
                      <Td color="gray.300">
                        {content.creator?.name ||
                          content.creator?.email ||
                          "Créateur inconnu"}
                      </Td>
                      <Td>
                        <Badge
                          colorScheme={content.isApproved ? "green" : "orange"}
                        >
                          {content.isApproved ? "Approuvé" : "En attente"}
                        </Badge>
                      </Td>
                      <Td color="gray.300">{formatDate(content.createdAt)}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" color="gray.500">
                      Aucun contenu récent
                    </Td>
                  </Tr>
                )}
              </Tbody>
            </Table>
          </TableContainer>
        </CardBody>
      </Card>
    </Box>
  );
}
