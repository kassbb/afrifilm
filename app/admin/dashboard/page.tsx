"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Grid,
  GridItem,
  Heading,
  Spinner,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
  useColorModeValue,
  SimpleGrid,
  Container,
  Badge,
  Button,
  HStack,
  Icon,
} from "@chakra-ui/react";
import {
  FiUsers,
  FiFilm,
  FiVideo,
  FiDollarSign,
  FiClock,
  FiPlus,
  FiRefreshCw,
} from "react-icons/fi";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminContentsTable from "../../components/admin/AdminContentsTable";
import AdminCreatorsTable from "../../components/admin/AdminCreatorsTable";
import AdminStatisticsCard from "../../components/admin/AdminStatisticsCard";

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

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

  const handleRefresh = () => {
    // Simuler un rafraîchissement des données
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setLastUpdate(new Date());
    }, 800);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh" bg="gray.900">
        <Flex direction="column" align="center">
          <Spinner
            size="xl"
            color="red.500"
            thickness="4px"
            speed="0.65s"
            mb={4}
          />
          <Text color="gray.300" fontSize="lg">
            Chargement du tableau de bord...
          </Text>
        </Flex>
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.900", "gray.900")}>
      <AdminSidebar />

      <Box flex="1" ml={{ base: 0, md: 60 }} p={0}>
        {/* Header du dashboard */}
        <Box
          bg="gray.800"
          p={6}
          borderBottom="1px solid"
          borderColor="gray.700"
          boxShadow="sm"
        >
          <Flex justify="space-between" align="center">
            <Box>
              <Heading as="h1" size="lg" color="white" mb={1}>
                Tableau de bord
              </Heading>
              <Text color="gray.400" fontSize="sm">
                Bienvenue, {session?.user?.name || "administrateur"} | Dernière
                mise à jour: {lastUpdate.toLocaleTimeString()}
              </Text>
            </Box>
            <HStack>
              <Button
                leftIcon={<Icon as={FiPlus} />}
                colorScheme="red"
                size="sm"
                onClick={() => router.push("/admin/contents/add")}
              >
                Nouveau contenu
              </Button>
              <Button
                leftIcon={<Icon as={FiRefreshCw} />}
                variant="outline"
                colorScheme="gray"
                size="sm"
                onClick={handleRefresh}
              >
                Actualiser
              </Button>
            </HStack>
          </Flex>
        </Box>

        <Container maxW="container.xl" py={8}>
          {/* Bannière pour contenus en attente */}
          <Box
            bg="orange.500"
            color="white"
            p={4}
            borderRadius="lg"
            mb={8}
            boxShadow="md"
          >
            <Flex justify="space-between" align="center">
              <HStack>
                <Icon as={FiClock} fontSize="xl" />
                <Text fontWeight="bold">
                  28 contenus en attente d'approbation
                </Text>
              </HStack>
              <Button
                size="sm"
                colorScheme="whiteAlpha"
                onClick={() => router.push("/admin/contents?filter=pending")}
              >
                Voir tous
              </Button>
            </Flex>
          </Box>

          {/* Statistiques */}
          <Heading as="h2" size="md" color="white" mb={4}>
            Aperçu général
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 5 }} spacing={5} mb={10}>
            <AdminStatisticsCard
              title="Utilisateurs"
              value="8,749"
              icon={FiUsers}
              color="blue"
              change={12}
              changeLabel="ce mois"
            />
            <AdminStatisticsCard
              title="Films"
              value="352"
              icon={FiFilm}
              color="red"
              change={8}
              changeLabel="ce mois"
            />
            <AdminStatisticsCard
              title="Séries"
              value="124"
              icon={FiVideo}
              color="purple"
              change={5}
              changeLabel="ce mois"
            />
            <AdminStatisticsCard
              title="Revenus"
              value="35,892 €"
              icon={FiDollarSign}
              color="green"
              change={15}
              changeLabel="ce mois"
            />
            <AdminStatisticsCard
              title="En attente"
              value="28"
              icon={FiClock}
              color="orange"
              change={-7}
              changeLabel="depuis hier"
            />
          </SimpleGrid>

          {/* Tableaux */}
          <Box bg="gray.800" borderRadius="xl" p={5} boxShadow="md" mb={8}>
            <Heading as="h2" size="md" color="white" mb={5}>
              Gestion des données
            </Heading>
            <Tabs variant="line" colorScheme="red" isLazy>
              <TabList borderBottomColor="gray.700">
                <Tab
                  color="gray.400"
                  _selected={{ color: "red.500", borderColor: "red.500" }}
                  fontWeight="medium"
                >
                  Contenus
                </Tab>
                <Tab
                  color="gray.400"
                  _selected={{ color: "red.500", borderColor: "red.500" }}
                  fontWeight="medium"
                >
                  Créateurs
                </Tab>
                <Badge
                  ml={3}
                  mt={2}
                  colorScheme="red"
                  variant="solid"
                  borderRadius="full"
                  px={2}
                >
                  Nouveaux
                </Badge>
              </TabList>

              <TabPanels>
                <TabPanel px={0}>
                  <AdminContentsTable />
                </TabPanel>
                <TabPanel px={0}>
                  <AdminCreatorsTable />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </Box>
        </Container>
      </Box>
    </Flex>
  );
}
