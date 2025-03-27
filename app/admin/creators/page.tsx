"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Flex,
  Heading,
  Spinner,
  Text,
  useColorModeValue,
  Button,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Stack,
} from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminCreatorsTable from "../../components/admin/AdminCreatorsTable";

export default function AdminCreatorsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.900", "gray.900")}>
      <AdminSidebar />

      <Box flex="1" ml={{ base: 0, md: 60 }} p="4">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" color="white">
            Gestion des créateurs
          </Heading>

          <Button
            leftIcon={<FiMail />}
            colorScheme="blue"
            size="sm"
            variant="outline"
          >
            Contacter tous les créateurs
          </Button>
        </Flex>

        <Stack spacing={6} mb={6}>
          <Text color="gray.400">
            Gérez les comptes créateurs de la plateforme. Vous pouvez vérifier
            les comptes des nouveaux créateurs, consulter leurs statistiques et
            gérer leurs droits.
          </Text>

          <Alert status="info" borderRadius="md" bg="blue.900" color="white">
            <AlertIcon color="blue.200" />
            <Box>
              <AlertTitle fontWeight="bold">
                Nouvelles demandes de vérification
              </AlertTitle>
              <AlertDescription>
                Il y a actuellement 3 créateurs en attente de vérification.
                Vérifiez leur identité et leurs documents avant d'approuver leur
                compte.
              </AlertDescription>
            </Box>
          </Alert>
        </Stack>

        <AdminCreatorsTable />
      </Box>
    </Flex>
  );
}
