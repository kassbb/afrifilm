"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Heading,
  Text,
  useColorModeValue,
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
} from "@chakra-ui/react";
import {
  FiUsers,
  FiVideo,
  FiDollarSign,
  FiTrendingUp,
  FiClock,
} from "react-icons/fi";
import { useAdminDashboard } from "../../hooks/useAdminApi";

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
  const {
    data: dashboardData,
    loading: dashboardLoading,
    error: dashboardError,
  } = useAdminDashboard<DashboardData>();

  // Rediriger si l'utilisateur n'est pas connecté ou n'est pas admin
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/login");
      return;
    }

    if (session?.user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    setLoading(false);
  }, [session, status, router]);

  if (loading || dashboardLoading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  if (dashboardError) {
    return (
      <Box p={4} borderRadius="md" bg="red.500" color="white">
        <Text>Une erreur est survenue lors du chargement des données</Text>
      </Box>
    );
  }

  // S'assurer que dashboardData est traité comme DashboardData
  const data = dashboardData as DashboardData;

  // Formatter les valeurs monétaires
  const formatCurrency = (value: number): string => {
    return new Intl.NumberFormat("fr-FR", {
      style: "currency",
      currency: "EUR",
    }).format(value);
  };

  // Formatter les dates
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Box p={4}>
      <Heading as="h1" color="white" mb={6}>
        Tableau de bord
      </Heading>

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
                  {data?.users?.total || 0}
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
                  {data?.creators?.total || 0}
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
                  {data?.contents?.total || 0}
                </StatNumber>
                <StatHelpText color="gray.400">
                  {data?.contents?.pending || 0} en attente
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
                  {formatCurrency(data?.sales?.total || 0)}
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
                {data?.recentTransactions?.length > 0 ? (
                  data.recentTransactions.map((transaction) => (
                    <Tr key={transaction.id}>
                      <Td color="gray.300">{transaction.user.email}</Td>
                      <Td color="gray.300">{transaction.content.title}</Td>
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
                    <Td colSpan={4} textAlign="center" color="gray.300">
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
        Contenus récemment ajoutés
      </Heading>
      <Card bg="gray.800" borderColor="gray.700" borderWidth="1px">
        <CardBody>
          <TableContainer>
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th color="gray.400">Titre</Th>
                  <Th color="gray.400">Créateur</Th>
                  <Th color="gray.400">Type</Th>
                  <Th color="gray.400">Statut</Th>
                  <Th color="gray.400">Date</Th>
                </Tr>
              </Thead>
              <Tbody>
                {data?.recentContents?.length > 0 ? (
                  data.recentContents.map((content) => (
                    <Tr key={content.id}>
                      <Td color="gray.300">{content.title}</Td>
                      <Td color="gray.300">{content.creator.email}</Td>
                      <Td color="gray.300">{content.type}</Td>
                      <Td>
                        <Badge
                          colorScheme={content.isApproved ? "green" : "yellow"}
                        >
                          {content.isApproved ? "Approuvé" : "En attente"}
                        </Badge>
                      </Td>
                      <Td color="gray.300">{formatDate(content.createdAt)}</Td>
                    </Tr>
                  ))
                ) : (
                  <Tr>
                    <Td colSpan={5} textAlign="center" color="gray.300">
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
