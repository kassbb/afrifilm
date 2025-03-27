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
  Container,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";

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
    <>
      <Box p="4">
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
    </>
  );
}
