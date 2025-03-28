"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Box,
  Button,
  Flex,
  Heading,
  Spinner,
  HStack,
  Text,
} from "@chakra-ui/react";
import { FiPlus } from "react-icons/fi";
import AdminContentsTable from "../../components/admin/AdminContentsTable";

export default function AdminContentsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Vérification de l'authentification et des permissions
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

  // Redirection vers la page de création de contenu
  const handleCreateContent = () => {
    router.push("/admin/contents/create");
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" minH="100vh">
        <Spinner size="xl" color="red.500" />
      </Flex>
    );
  }

  return (
    <Box p={4}>
      <Flex
        justify="space-between"
        align={{ base: "flex-start", md: "center" }}
        direction={{ base: "column", md: "row" }}
        mb={6}
        gap={4}
      >
        <Box>
          <Heading as="h1" color="white" size="lg">
            Gestion des contenus
          </Heading>
          <Text color="gray.400" mt={1}>
            Gérez les films et séries de la plateforme
          </Text>
        </Box>
        <Button
          leftIcon={<FiPlus />}
          colorScheme="blue"
          onClick={handleCreateContent}
        >
          Ajouter un contenu
        </Button>
      </Flex>

      <AdminContentsTable />
    </Box>
  );
}
