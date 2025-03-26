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
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  useToast,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  role: string;
  isVerified: boolean;
  createdAt: string;
}

interface Content {
  id: string;
  title: string;
  type: string;
  creator: {
    email: string;
  };
  isApproved: boolean;
  createdAt: string;
}

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [users, setUsers] = useState<User[]>([]);
  const [content, setContent] = useState<Content[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersResponse, contentResponse] = await Promise.all([
          fetch("/api/admin/users"),
          fetch("/api/admin/content"),
        ]);

        if (usersResponse.ok) {
          const usersData = await usersResponse.json();
          setUsers(usersData);
        }

        if (contentResponse.ok) {
          const contentData = await contentResponse.json();
          setContent(contentData);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchData();
    }
  }, [session, toast]);

  const bgColor = useColorModeValue("whiteAlpha.100", "whiteAlpha.50");

  if (!session || session.user?.role !== "ADMIN") {
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
            <Heading>Tableau de Bord Administrateur</Heading>
            <Stack direction="row" spacing={4}>
              <Link href="/admin/users" passHref>
                <Button colorScheme="red" variant="outline">
                  Gérer les Utilisateurs
                </Button>
              </Link>
              <Link href="/admin/content" passHref>
                <Button colorScheme="red" variant="outline">
                  Gérer le Contenu
                </Button>
              </Link>
            </Stack>
          </Stack>

          <SimpleGrid columns={{ base: 1, md: 2, lg: 4 }} spacing={6}>
            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Utilisateurs Totaux
              </Text>
              <Text fontSize="3xl">{users.length}</Text>
            </Box>
            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Créateurs
              </Text>
              <Text fontSize="3xl">
                {users.filter((user) => user.role === "CREATOR").length}
              </Text>
            </Box>
            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                Contenu Total
              </Text>
              <Text fontSize="3xl">{content.length}</Text>
            </Box>
            <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
              <Text fontSize="lg" fontWeight="bold" mb={2}>
                En Attente d'Approbation
              </Text>
              <Text fontSize="3xl">
                {content.filter((item) => !item.isApproved).length}
              </Text>
            </Box>
          </SimpleGrid>
        </Box>

        <Box>
          <Heading size="md" mb={6}>
            Derniers Utilisateurs
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Email</Th>
                  <Th>Rôle</Th>
                  <Th>Statut</Th>
                  <Th>Date d'inscription</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.slice(0, 5).map((user) => (
                  <Tr key={user.id}>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          user.role === "ADMIN"
                            ? "red"
                            : user.role === "CREATOR"
                            ? "purple"
                            : "blue"
                        }
                      >
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Badge colorScheme={user.isVerified ? "green" : "yellow"}>
                        {user.isVerified ? "Vérifié" : "Non vérifié"}
                      </Badge>
                    </Td>
                    <Td>
                      {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                    </Td>
                    <Td>
                      <Link href={`/admin/users/${user.id}`} passHref>
                        <Button size="sm" variant="ghost">
                          Gérer
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>

        <Box>
          <Heading size="md" mb={6}>
            Contenu Récent
          </Heading>
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Titre</Th>
                  <Th>Type</Th>
                  <Th>Créateur</Th>
                  <Th>Statut</Th>
                  <Th>Date</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {content.slice(0, 5).map((item) => (
                  <Tr key={item.id}>
                    <Td>{item.title}</Td>
                    <Td>
                      <Badge
                        colorScheme={item.type === "FILM" ? "blue" : "purple"}
                      >
                        {item.type}
                      </Badge>
                    </Td>
                    <Td>{item.creator.email}</Td>
                    <Td>
                      <Badge colorScheme={item.isApproved ? "green" : "yellow"}>
                        {item.isApproved ? "Approuvé" : "En attente"}
                      </Badge>
                    </Td>
                    <Td>
                      {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                    </Td>
                    <Td>
                      <Link href={`/admin/content/${item.id}`} passHref>
                        <Button size="sm" variant="ghost">
                          Gérer
                        </Button>
                      </Link>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
