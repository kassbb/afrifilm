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
    <>
      <Box p="4">
        <Heading as="h1" color="white" mb={6}>
          Gestion des utilisateurs
        </Heading>

        <Text color="gray.400" mb={6}>
          Cette page vous permet de gérer tous les utilisateurs de la
          plateforme. Vous pouvez filtrer par rôle, modifier les statuts,
          réinitialiser les mots de passe ou supprimer des comptes.
        </Text>

        <AdminUsersTable />
      </Box>
    </>
  );
}
