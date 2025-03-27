"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Box,
  Text,
  useToast,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  Button,
  FormControl,
  FormLabel,
  Switch,
  Flex,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  VStack,
  HStack,
  Heading,
  Divider,
  Select,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FiMoreVertical,
  FiCheck,
  FiX,
  FiSearch,
  FiEye,
  FiMail,
} from "react-icons/fi";
import NextLink from "next/link";

// Types
interface Creator {
  id: string;
  email: string;
  isVerified: boolean;
  createdAt: string;
  contentCount: number;
  totalSales: number;
}

export default function AdminCreatorsTable() {
  const [creators, setCreators] = useState<Creator[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    status: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCreator, setSelectedCreator] = useState<Creator | null>(null);
  const [newVerificationStatus, setNewVerificationStatus] = useState(false);

  const toast = useToast();

  // Fonction pour charger les créateurs
  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);

      try {
        // Dans un environnement réel, cela serait une requête API
        // await fetch('/api/admin/creators')

        // Pour la démo, on utilise des données fictives
        const mockCreators: Creator[] = [
          {
            id: "creator1",
            email: "creator@example.com",
            isVerified: true,
            createdAt: "2023-01-15T00:00:00.000Z",
            contentCount: 12,
            totalSales: 1250.75,
          },
          {
            id: "creator2",
            email: "filmmaker@example.com",
            isVerified: true,
            createdAt: "2023-02-20T00:00:00.000Z",
            contentCount: 8,
            totalSales: 786.5,
          },
          {
            id: "creator3",
            email: "director@example.com",
            isVerified: false,
            createdAt: "2023-03-10T00:00:00.000Z",
            contentCount: 3,
            totalSales: 0,
          },
          {
            id: "creator4",
            email: "producer@example.com",
            isVerified: true,
            createdAt: "2023-02-05T00:00:00.000Z",
            contentCount: 15,
            totalSales: 3245.25,
          },
          {
            id: "creator5",
            email: "newartist@example.com",
            isVerified: false,
            createdAt: "2023-04-01T00:00:00.000Z",
            contentCount: 0,
            totalSales: 0,
          },
        ];

        setCreators(mockCreators);
      } catch (err) {
        console.error("Erreur lors du chargement des créateurs:", err);
        setError("Impossible de charger les créateurs");
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, []);

  const handleUpdateVerification = async () => {
    if (!selectedCreator) return;

    try {
      // Dans un environnement réel, cela serait une requête API
      // await fetch(`/api/admin/creators/${selectedCreator.id}`, {
      //   method: 'PATCH',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({
      //     isVerified: newVerificationStatus,
      //   }),
      // });

      // Pour la démo, on met à jour localement
      setCreators(
        creators.map((creator) =>
          creator.id === selectedCreator.id
            ? { ...creator, isVerified: newVerificationStatus }
            : creator
        )
      );

      toast({
        title: newVerificationStatus
          ? "Créateur vérifié"
          : "Vérification retirée",
        status: newVerificationStatus ? "success" : "info",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du créateur:", err);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour du créateur",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openVerificationModal = (creator: Creator) => {
    setSelectedCreator(creator);
    setNewVerificationStatus(!creator.isVerified);
    onOpen();
  };

  const filteredCreators = creators
    .filter((creator) =>
      creator.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (creator) =>
        filter.status === "" ||
        (filter.status === "verified" && creator.isVerified) ||
        (filter.status === "unverified" && !creator.isVerified)
    );

  if (loading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="lg" color="red.500" />
      </Flex>
    );
  }

  if (error) {
    return (
      <Box p={4} borderRadius="md" bg="red.500" color="white">
        <Text>{error}</Text>
      </Box>
    );
  }

  return (
    <Box>
      {/* Filtres et recherche */}
      <Flex mb={6} gap={4} direction={{ base: "column", md: "row" }}>
        <InputGroup maxW={{ md: "300px" }}>
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Rechercher par email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="gray.700"
            border="none"
            color="white"
            aria-label="Rechercher par email"
          />
        </InputGroup>

        <Select
          placeholder="Statut"
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          maxW={{ md: "200px" }}
          bg="gray.700"
          border="none"
          color="white"
          aria-label="Filtrer par statut"
        >
          <option value="">Tous</option>
          <option value="verified">Vérifiés</option>
          <option value="unverified">Non vérifiés</option>
        </Select>
      </Flex>

      {/* Tableau des créateurs */}
      <Box overflowX="auto">
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th color="gray.400">Email</Th>
              <Th color="gray.400">Statut</Th>
              <Th color="gray.400">Date d'inscription</Th>
              <Th color="gray.400">Contenus</Th>
              <Th color="gray.400">Ventes</Th>
              <Th color="gray.400">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCreators.map((creator) => (
              <Tr key={creator.id} _hover={{ bg: "gray.700" }}>
                <Td color="white">{creator.email}</Td>
                <Td>
                  <Badge colorScheme={creator.isVerified ? "green" : "yellow"}>
                    {creator.isVerified ? "Vérifié" : "Non vérifié"}
                  </Badge>
                </Td>
                <Td color="white">
                  {new Date(creator.createdAt).toLocaleDateString("fr-FR")}
                </Td>
                <Td color="white">{creator.contentCount}</Td>
                <Td color="white">{creator.totalSales.toFixed(2)} €</Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      colorScheme="gray"
                      aria-label="Options"
                    />
                    <MenuList bg="gray.800" borderColor="gray.700">
                      <NextLink href={`/admin/creators/${creator.id}`} passHref>
                        <MenuItem
                          icon={<FiEye />}
                          _hover={{ bg: "gray.700" }}
                          color="white"
                        >
                          Profil
                        </MenuItem>
                      </NextLink>

                      <MenuItem
                        icon={creator.isVerified ? <FiX /> : <FiCheck />}
                        onClick={() => openVerificationModal(creator)}
                        _hover={{ bg: "gray.700" }}
                        color={creator.isVerified ? "red.400" : "green.400"}
                      >
                        {creator.isVerified
                          ? "Retirer vérification"
                          : "Vérifier"}
                      </MenuItem>

                      <MenuItem
                        icon={<FiMail />}
                        _hover={{ bg: "gray.700" }}
                        color="blue.400"
                      >
                        Contacter
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de vérification */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            {newVerificationStatus
              ? "Vérifier le créateur"
              : "Retirer la vérification"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedCreator && (
              <VStack spacing={4} align="stretch">
                <Text>
                  {newVerificationStatus
                    ? `Êtes-vous sûr de vouloir vérifier le créateur "${selectedCreator.email}" ?`
                    : `Êtes-vous sûr de vouloir retirer la vérification de "${selectedCreator.email}" ?`}
                </Text>

                <Divider />

                <Box>
                  <Heading size="sm" mb={2}>
                    Informations du créateur
                  </Heading>
                  <HStack>
                    <Text fontWeight="bold">Email:</Text>
                    <Text>{selectedCreator.email}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">Contenu publié:</Text>
                    <Text>{selectedCreator.contentCount}</Text>
                  </HStack>
                  <HStack>
                    <Text fontWeight="bold">Ventes totales:</Text>
                    <Text>{selectedCreator.totalSales.toFixed(2)} €</Text>
                  </HStack>
                </Box>

                <FormControl display="flex" alignItems="center">
                  <FormLabel htmlFor="verification-status" mb="0">
                    {newVerificationStatus
                      ? "Vérifier ce créateur"
                      : "Retirer la vérification"}
                  </FormLabel>
                  <Switch
                    id="verification-status"
                    isChecked={newVerificationStatus}
                    onChange={(e) => setNewVerificationStatus(e.target.checked)}
                    colorScheme="red"
                  />
                </FormControl>
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme={newVerificationStatus ? "green" : "red"}
              onClick={handleUpdateVerification}
            >
              Confirmer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
