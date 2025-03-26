"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  SimpleGrid,
  Button,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface DashboardStats {
  totalContent: number;
  totalRevenue: number;
  pendingApproval: number;
  approvedContent: number;
}

export default function CreatorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    approvedContent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/creator/stats");
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          throw new Error("Failed to fetch stats");
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les statistiques",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchStats();
    }
  }, [session, toast]);

  const bgColor = useColorModeValue("whiteAlpha.100", "whiteAlpha.50");

  if (!session || session.user?.role !== "CREATOR") {
    return null;
  }

  return (
    <Container maxW="container.xl" py={20}>
      <Stack spacing={8}>
        <Box>
          <Stack
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align="center"
            mb={8}
          >
            <Heading>Tableau de Bord</Heading>
            <Link href="/creator/content/new" passHref>
              <Button colorScheme="red" size="lg">
                Ajouter du Contenu
              </Button>
            </Link>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Stat>
                <StatLabel>Contenu Total</StatLabel>
                <StatNumber>{stats.totalContent}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                </StatHelpText>
              </Stat>
            </Box>

            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Stat>
                <StatLabel>Revenus Totaux</StatLabel>
                <StatNumber>{stats.totalRevenue.toFixed(2)} FCFA</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                </StatHelpText>
              </Stat>
            </Box>

            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Stat>
                <StatLabel>En Attente d'Approbation</StatLabel>
                <StatNumber>{stats.pendingApproval}</StatNumber>
                <StatHelpText>
                  <StatArrow type="decrease" />
                </StatHelpText>
              </Stat>
            </Box>

            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Stat>
                <StatLabel>Contenu Approuvé</StatLabel>
                <StatNumber>{stats.approvedContent}</StatNumber>
                <StatHelpText>
                  <StatArrow type="increase" />
                </StatHelpText>
              </Stat>
            </Box>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading size="md" mb={6}>
            Actions Rapides
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            <Link href="/creator/content/new" passHref>
              <Button
                w="100%"
                h="100px"
                variant="outline"
                colorScheme="red"
                p={6}
                borderRadius="lg"
                textAlign="center"
                whiteSpace="normal"
              >
                Ajouter un Nouveau Film
              </Button>
            </Link>
            <Link href="/creator/content/new?type=serie" passHref>
              <Button
                w="100%"
                h="100px"
                variant="outline"
                colorScheme="red"
                p={6}
                borderRadius="lg"
                textAlign="center"
                whiteSpace="normal"
              >
                Ajouter une Nouvelle Série
              </Button>
            </Link>
            <Link href="/creator/content" passHref>
              <Button
                w="100%"
                h="100px"
                variant="outline"
                colorScheme="red"
                p={6}
                borderRadius="lg"
                textAlign="center"
                whiteSpace="normal"
              >
                Gérer le Contenu
              </Button>
            </Link>
          </SimpleGrid>
        </Box>
      </Stack>
    </Container>
  );
}
