"use client";

import {
  Box,
  Container,
  Heading,
  Text,
  Stack,
  Avatar,
  Divider,
  SimpleGrid,
  useColorModeValue,
  Badge,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

interface Transaction {
  id: string;
  content: {
    title: string;
    type: "FILM" | "SERIE";
    thumbnail: string;
  };
  amount: number;
  createdAt: string;
}

export default function ProfilePage() {
  const { data: session } = useSession();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const response = await fetch("/api/user/transactions");
        if (response.ok) {
          const data = await response.json();
          setTransactions(data);
        }
      } catch (error) {
        console.error("Error fetching transactions:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session) {
      fetchTransactions();
    }
  }, [session]);

  const bgColor = useColorModeValue("whiteAlpha.100", "whiteAlpha.50");

  if (!session) {
    return null;
  }

  return (
    <Container maxW="container.xl" py={20}>
      <Stack spacing={8}>
        {/* Profile Header */}
        <Box p={6} borderRadius="lg" bg={bgColor} boxShadow="lg">
          <Stack
            direction={{ base: "column", md: "row" }}
            spacing={6}
            align="center"
          >
            <Avatar
              size="2xl"
              name={session.user?.email || "User"}
              bg="brand.gold"
            />
            <Stack spacing={2}>
              <Heading size="lg">{session.user?.email}</Heading>
              <Stack direction="row" spacing={2}>
                <Badge
                  colorScheme={
                    session.user?.role === "CREATOR" ? "purple" : "blue"
                  }
                >
                  {session.user?.role === "CREATOR" ? "Créateur" : "Spectateur"}
                </Badge>
              </Stack>
            </Stack>
          </Stack>
        </Box>

        {/* Purchased Content */}
        <Box>
          <Heading size="md" mb={6}>
            Contenu Acheté
          </Heading>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={6}>
            {transactions.map((transaction) => (
              <Box
                key={transaction.id}
                p={4}
                borderRadius="lg"
                bg={bgColor}
                boxShadow="md"
              >
                <Box
                  height="200px"
                  backgroundImage={`url(${transaction.content.thumbnail})`}
                  backgroundSize="cover"
                  backgroundPosition="center"
                  borderRadius="md"
                  mb={4}
                />
                <Stack spacing={2}>
                  <Heading size="sm">{transaction.content.title}</Heading>
                  <Text color="gray.300">
                    {transaction.content.type === "FILM" ? "Film" : "Série"}
                  </Text>
                  <Text color="brand.gold">
                    {transaction.amount.toFixed(2)} FCFA
                  </Text>
                  <Text fontSize="sm" color="gray.400">
                    Acheté le{" "}
                    {new Date(transaction.createdAt).toLocaleDateString(
                      "fr-FR"
                    )}
                  </Text>
                </Stack>
              </Box>
            ))}
          </SimpleGrid>
        </Box>
      </Stack>
    </Container>
  );
}
