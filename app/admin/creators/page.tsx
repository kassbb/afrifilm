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
  Icon,
} from "@chakra-ui/react";
import { FiMail } from "react-icons/fi";

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
    <>
      <Box p="4">
        <Flex justify="space-between" align="center" mb={6}>
          <Heading as="h1" color="white">
            Gestion des créateurs
          </Heading>

          <Button
            leftIcon={<Icon as={FiMail} />}
            colorScheme="red"
            size="sm"
            onClick={() => router.push("/admin/creators/invite")}
          >
            Inviter un créateur
          </Button>
        </Flex>

        <Text color="gray.400" mb={6}>
          Gérez tous les créateurs de la plateforme. Vous pouvez approuver ou
          rejeter les demandes de créateurs, modifier les informations ou
          supprimer des comptes.
        </Text>

        <AdminCreatorsTable />
      </Box>
    </>
  );
}
