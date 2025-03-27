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
  HStack,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminContentsTable from "../../components/admin/AdminContentsTable";

export default function AdminContentsPage() {
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
            Gestion des contenus
          </Heading>

          <Button
            leftIcon={<FiPlus />}
            colorScheme="red"
            size="sm"
            onClick={() => router.push("/admin/contents/create")}
          >
            Ajouter un contenu
          </Button>
        </Flex>

        <Text color="gray.400" mb={6}>
          Gérez tous les films et séries de la plateforme. Vous pouvez approuver
          ou rejeter les nouveaux contenus, modifier les informations existantes
          ou supprimer des contenus.
        </Text>

        <AdminContentsTable />
      </Box>
    </Flex>
  );
}
