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
  useToast,
  Flex,
  Icon,
  Badge,
  VStack,
  HStack,
  Image,
  Divider,
  chakra,
} from "@chakra-ui/react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FiFilm,
  FiTv,
  FiPlus,
  FiBarChart2,
  FiDollarSign,
  FiClock,
  FiCheck,
} from "react-icons/fi";

// Wrapper pour ajouter les animations framer-motion aux composants Chakra
const MotionBox = motion(Box);
const MotionFlex = motion(Flex);
const MotionSimpleGrid = motion(SimpleGrid);

interface DashboardStats {
  totalContent: number;
  totalRevenue: number;
  pendingApproval: number;
  approvedContent: number;
}

export default function CreatorDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({
    totalContent: 0,
    totalRevenue: 0,
    pendingApproval: 0,
    approvedContent: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const toast = useToast();

  // Couleurs et styles
  const bgGradient = useColorModeValue(
    "linear(to-r, red.500, pink.500)",
    "linear(to-r, red.500, pink.500)"
  );
  const cardBg = useColorModeValue("white", "gray.800");
  const hoverBg = useColorModeValue("gray.50", "gray.700");
  const textColor = useColorModeValue("gray.800", "white");
  const statBg = useColorModeValue("white", "gray.800");
  const accentColor = "red.500";

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/auth/login");
      return;
    }

    if (status === "authenticated" && session?.user?.role !== "CREATOR") {
      router.push("/dashboard");
      return;
    }

    if (session?.user?.role === "CREATOR") {
      fetchStats();
    }
  }, [session, status, router]);

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

  if (status === "loading" || isLoading) {
    return (
      <Container maxW="container.xl" py={20}>
        <Flex justify="center" align="center" height="50vh">
          <VStack spacing={4}>
            <Box
              as={motion.div}
              animation={{
                opacity: [0.5, 1, 0.5],
                scale: [0.9, 1, 0.9],
                transition: { duration: 1.5, repeat: Infinity },
              }}
            >
              <Icon as={FiFilm} boxSize={12} color="red.500" />
            </Box>
            <Text fontSize="xl">Chargement de votre espace créateur...</Text>
          </VStack>
        </Flex>
      </Container>
    );
  }

  if (!session || session.user?.role !== "CREATOR") {
    return null;
  }

  return (
    <Container maxW="container.xl" py={12}>
      <MotionBox
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        mb={10}
      >
        <Flex
          direction="column"
          position="relative"
          p={8}
          borderRadius="xl"
          overflow="hidden"
          mb={10}
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="150px"
            bgGradient={bgGradient}
            zIndex={0}
          />
          <Flex
            position="relative"
            zIndex={1}
            direction={{ base: "column", md: "row" }}
            justify="space-between"
            align={{ base: "center", md: "flex-end" }}
            pt={{ base: 12, md: 16 }}
            pb={5}
          >
            <VStack align={{ base: "center", md: "flex-start" }} spacing={1}>
              <Heading
                fontSize={{ base: "3xl", md: "4xl" }}
                fontWeight="bold"
                color="white"
              >
                Bienvenue dans votre Studio
              </Heading>
              <Text color="white" fontSize="lg">
                Créez, gérez et monétisez votre contenu
              </Text>
            </VStack>
            <HStack spacing={3} mt={{ base: 6, md: 0 }}>
              <Link href="/creator/content/new" passHref>
                <Button
                  leftIcon={<FiPlus />}
                  colorScheme="white"
                  backgroundColor="white"
                  color="red.500"
                  size="lg"
                  _hover={{ bg: "gray.100" }}
                  boxShadow="md"
                >
                  Ajouter du Contenu
                </Button>
              </Link>
            </HStack>
          </Flex>
        </Flex>
      </MotionBox>

      <MotionSimpleGrid
        columns={{ base: 1, md: 2, lg: 4 }}
        spacing={8}
        mb={12}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <MotionBox
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          bg={statBg}
          p={6}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.100"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="6px"
            bg="red.500"
          />
          <Flex justify="space-between">
            <Stat>
              <StatLabel fontSize="lg" fontWeight="medium">
                Contenu Total
              </StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" mt={2}>
                {stats.totalContent}
              </StatNumber>
              <StatHelpText>
                <Flex align="center" color="gray.500">
                  <Icon as={FiFilm} mr={1} /> Films et Séries
                </Flex>
              </StatHelpText>
            </Stat>
            <Flex
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="red.50"
              color="red.500"
              boxSize={14}
              flexShrink={0}
            >
              <Icon as={FiFilm} boxSize={6} />
            </Flex>
          </Flex>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          bg={statBg}
          p={6}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.100"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="6px"
            bg="green.500"
          />
          <Flex justify="space-between">
            <Stat>
              <StatLabel fontSize="lg" fontWeight="medium">
                Revenus Totaux
              </StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" mt={2}>
                {stats.totalRevenue.toLocaleString()} FCFA
              </StatNumber>
              <StatHelpText>
                <Flex align="center" color="gray.500">
                  <Icon as={FiBarChart2} mr={1} /> Toutes ventes
                </Flex>
              </StatHelpText>
            </Stat>
            <Flex
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="green.50"
              color="green.500"
              boxSize={14}
              flexShrink={0}
            >
              <Icon as={FiDollarSign} boxSize={6} />
            </Flex>
          </Flex>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          bg={statBg}
          p={6}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.100"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="6px"
            bg="orange.500"
          />
          <Flex justify="space-between">
            <Stat>
              <StatLabel fontSize="lg" fontWeight="medium">
                En Attente
              </StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" mt={2}>
                {stats.pendingApproval}
              </StatNumber>
              <StatHelpText>
                <Link href="/creator/content?status=pending" passHref>
                  <Text as="span" color="blue.500" cursor="pointer">
                    Voir le détail
                  </Text>
                </Link>
              </StatHelpText>
            </Stat>
            <Flex
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="orange.50"
              color="orange.500"
              boxSize={14}
              flexShrink={0}
            >
              <Icon as={FiClock} boxSize={6} />
            </Flex>
          </Flex>
        </MotionBox>

        <MotionBox
          whileHover={{ y: -5 }}
          transition={{ duration: 0.2 }}
          bg={statBg}
          p={6}
          borderRadius="xl"
          boxShadow="xl"
          border="1px solid"
          borderColor="gray.100"
          position="relative"
          overflow="hidden"
        >
          <Box
            position="absolute"
            top={0}
            left={0}
            right={0}
            height="6px"
            bg="blue.500"
          />
          <Flex justify="space-between">
            <Stat>
              <StatLabel fontSize="lg" fontWeight="medium">
                Contenu Approuvé
              </StatLabel>
              <StatNumber fontSize="4xl" fontWeight="bold" mt={2}>
                {stats.approvedContent}
              </StatNumber>
              <StatHelpText>
                <Link href="/creator/content?status=approved" passHref>
                  <Text as="span" color="blue.500" cursor="pointer">
                    Voir le détail
                  </Text>
                </Link>
              </StatHelpText>
            </Stat>
            <Flex
              alignItems="center"
              justifyContent="center"
              borderRadius="full"
              bg="blue.50"
              color="blue.500"
              boxSize={14}
              flexShrink={0}
            >
              <Icon as={FiCheck} boxSize={6} />
            </Flex>
          </Flex>
        </MotionBox>
      </MotionSimpleGrid>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        mb={12}
      >
        <Heading
          size="lg"
          mb={6}
          display="flex"
          alignItems="center"
          color={textColor}
        >
          <Icon as={FiPlus} mr={2} color={accentColor} /> Actions Rapides
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={8}>
          <MotionBox
            whileHover={{
              y: -5,
              boxShadow: "0 20px 30px -10px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/creator/content/new" passHref>
              <Flex
                direction="column"
                align="center"
                justify="center"
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                textAlign="center"
                height="220px"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                border="1px solid"
                borderColor="red.100"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="10px"
                  bgGradient="linear(to-r, red.500, orange.500)"
                />
                <Flex
                  align="center"
                  justify="center"
                  bg="red.50"
                  color="red.500"
                  boxSize={20}
                  borderRadius="full"
                  mb={4}
                >
                  <Icon as={FiFilm} boxSize={10} />
                </Flex>
                <Heading size="md" mb={2} color={textColor}>
                  Ajouter un Film
                </Heading>
                <Text color="gray.500">
                  Publiez facilement votre film et commencez à le monétiser
                </Text>
              </Flex>
            </Link>
          </MotionBox>

          <MotionBox
            whileHover={{
              y: -5,
              boxShadow: "0 20px 30px -10px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/creator/content/new?type=serie" passHref>
              <Flex
                direction="column"
                align="center"
                justify="center"
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                textAlign="center"
                height="220px"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                border="1px solid"
                borderColor="purple.100"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="10px"
                  bgGradient="linear(to-r, purple.500, pink.500)"
                />
                <Flex
                  align="center"
                  justify="center"
                  bg="purple.50"
                  color="purple.500"
                  boxSize={20}
                  borderRadius="full"
                  mb={4}
                >
                  <Icon as={FiTv} boxSize={10} />
                </Flex>
                <Heading size="md" mb={2} color={textColor}>
                  Ajouter une Série
                </Heading>
                <Text color="gray.500">
                  Créez des saisons et des épisodes pour fidéliser votre
                  audience
                </Text>
              </Flex>
            </Link>
          </MotionBox>

          <MotionBox
            whileHover={{
              y: -5,
              boxShadow: "0 20px 30px -10px rgba(0,0,0,0.1)",
            }}
            transition={{ duration: 0.2 }}
          >
            <Link href="/creator/content" passHref>
              <Flex
                direction="column"
                align="center"
                justify="center"
                bg={cardBg}
                p={6}
                borderRadius="xl"
                boxShadow="lg"
                textAlign="center"
                height="220px"
                position="relative"
                overflow="hidden"
                cursor="pointer"
                border="1px solid"
                borderColor="blue.100"
              >
                <Box
                  position="absolute"
                  top={0}
                  left={0}
                  right={0}
                  height="10px"
                  bgGradient="linear(to-r, blue.500, cyan.500)"
                />
                <Flex
                  align="center"
                  justify="center"
                  bg="blue.50"
                  color="blue.500"
                  boxSize={20}
                  borderRadius="full"
                  mb={4}
                >
                  <Icon as={FiBarChart2} boxSize={10} />
                </Flex>
                <Heading size="md" mb={2} color={textColor}>
                  Gérer Mes Contenus
                </Heading>
                <Text color="gray.500">
                  Accédez à tous vos films, séries et suivez leurs performances
                </Text>
              </Flex>
            </Link>
          </MotionBox>
        </SimpleGrid>
      </MotionBox>

      <MotionBox
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        <Heading
          size="lg"
          mb={6}
          display="flex"
          alignItems="center"
          color={textColor}
        >
          <Icon as={FiBarChart2} mr={2} color={accentColor} /> Statistiques
        </Heading>
        <SimpleGrid columns={{ base: 1, md: 2 }} spacing={8}>
          <MotionBox
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="10px"
              bgGradient="linear(to-r, teal.500, green.500)"
            />
            <Heading size="md" mb={4} color={textColor}>
              Contenus les plus populaires
            </Heading>
            <Flex
              align="center"
              justify="center"
              my={8}
              height="120px"
              opacity={0.5}
            >
              <Icon as={FiBarChart2} boxSize={20} />
            </Flex>
            <Text color="gray.500" textAlign="center">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez voir
              quels contenus génèrent le plus de revenus et de vues.
            </Text>
          </MotionBox>

          <MotionBox
            whileHover={{ y: -5 }}
            transition={{ duration: 0.2 }}
            bg={cardBg}
            p={6}
            borderRadius="xl"
            boxShadow="lg"
            border="1px solid"
            borderColor="gray.100"
            position="relative"
            overflow="hidden"
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              height="10px"
              bgGradient="linear(to-r, blue.500, purple.500)"
            />
            <Heading size="md" mb={4} color={textColor}>
              Évolution des revenus
            </Heading>
            <Flex
              align="center"
              justify="center"
              my={8}
              height="120px"
              opacity={0.5}
            >
              <Icon as={FiDollarSign} boxSize={20} />
            </Flex>
            <Text color="gray.500" textAlign="center">
              Cette fonctionnalité sera bientôt disponible. Vous pourrez
              analyser l'évolution de vos revenus dans le temps.
            </Text>
          </MotionBox>
        </SimpleGrid>
      </MotionBox>
    </Container>
  );
}
