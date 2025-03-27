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
} from "@chakra-ui/react";

import AdminSidebar from "../../components/admin/AdminSidebar";
import AdminUsersTable from "../../components/admin/AdminUsersTable";

export default function AdminUsersPage() {
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
        <Heading as="h1" mb={6} color="white">
          Gestion des utilisateurs
        </Heading>

        <Text color="gray.400" mb={6}>
          Cette page vous permet de gérer tous les utilisateurs de la
          plateforme. Vous pouvez filtrer par rôle, modifier les statuts,
          réinitialiser les mots de passe ou supprimer des comptes.
        </Text>

        <AdminUsersTable />
      </Box>
    </Flex>
  );
}
