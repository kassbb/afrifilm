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
  Link,
  Image,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FiMoreVertical,
  FiCheck,
  FiX,
  FiSearch,
  FiEye,
  FiMail,
  FiFile,
} from "react-icons/fi";
import NextLink from "next/link";

// Types
interface Creator {
  id: string;
  email: string;
  name: string;
  isVerified: boolean;
  createdAt: string;
  contentCount: number;
  totalSales: number;
  bio?: string;
  portfolio?: string;
  identityDocument?: string;
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
  const [viewMode, setViewMode] = useState<"verify" | "details">("verify");

  const toast = useToast();

  // Fonction pour charger les créateurs
  useEffect(() => {
    const fetchCreators = async () => {
      setLoading(true);

      try {
        // Appel à l'API réelle
        const response = await fetch("/api/admin/creators");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors du chargement des créateurs"
          );
        }

        const data = await response.json();
        setCreators(data);
      } catch (err) {
        console.error("Erreur lors du chargement des créateurs:", err);
        setError("Impossible de charger les créateurs");
        toast({
          title: "Erreur",
          description:
            err instanceof Error
              ? err.message
              : "Impossible de charger les créateurs",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCreators();
  }, [toast]);

  const handleUpdateVerification = async () => {
    if (!selectedCreator) return;

    try {
      // Appel à l'API réelle
      const response = await fetch(
        `/api/admin/creators/${selectedCreator.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isVerified: newVerificationStatus,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour du créateur"
        );
      }

      // Mise à jour locale après confirmation de l'API
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
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la mise à jour du créateur",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openVerificationModal = (creator: Creator) => {
    setSelectedCreator(creator);
    setNewVerificationStatus(!creator.isVerified);
    setViewMode("verify");
    onOpen();
  };

  const openDetailsModal = (creator: Creator) => {
    setSelectedCreator(creator);
    setViewMode("details");
    onOpen();
  };

  const handleSendEmail = (creator: Creator) => {
    toast({
      title: "Email envoyé",
      description: `Un email a été envoyé à ${creator.email}`,
      status: "success",
      duration: 3000,
      isClosable: true,
    });

    // Dans une version complète, nous ferions un appel API
    // fetch(`/api/admin/creators/${creator.id}/send-email`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     subject: "Message de l'administrateur de la plateforme",
    //     message: "Votre message ici..."
    //   }),
    // });
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
          value={filter.status}
          onChange={(e) => setFilter({ ...filter, status: e.target.value })}
          maxW={{ md: "200px" }}
          bg="gray.700"
          border="none"
          color="white"
          aria-label="Filtrer par statut"
          title="Filtrer par statut"
        >
          <option value="">Tous</option>
          <option value="verified">Vérifiés</option>
          <option value="unverified">Non vérifiés</option>
        </Select>
      </Flex>

      {/* Tableau des créateurs */}
      <Box overflowX="auto">
        <Table variant="simple" size="md">
          <Thead bg="gray.800">
            <Tr>
              <Th color="gray.400">Créateur</Th>
              <Th color="gray.400">Statut</Th>
              <Th color="gray.400" isNumeric>
                Films
              </Th>
              <Th color="gray.400" isNumeric>
                Ventes
              </Th>
              <Th color="gray.400">Inscription</Th>
              <Th color="gray.400" textAlign="right">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredCreators.length === 0 ? (
              <Tr>
                <Td colSpan={6} textAlign="center" py={10}>
                  <Text>Aucun créateur trouvé</Text>
                </Td>
              </Tr>
            ) : (
              filteredCreators.map((creator) => (
                <Tr key={creator.id}>
                  <Td>
                    <VStack align="start" spacing={1}>
                      <Text fontWeight="medium">
                        {creator.name || "Sans nom"}
                      </Text>
                      <Text fontSize="sm" color="gray.500">
                        {creator.email}
                      </Text>
                    </VStack>
                  </Td>
                  <Td>
                    <Badge
                      colorScheme={creator.isVerified ? "green" : "yellow"}
                    >
                      {creator.isVerified ? "Vérifié" : "En attente"}
                    </Badge>
                  </Td>
                  <Td isNumeric>{creator.contentCount}</Td>
                  <Td isNumeric>{`${creator.totalSales.toFixed(2)} €`}</Td>
                  <Td>{new Date(creator.createdAt).toLocaleDateString()}</Td>
                  <Td textAlign="right">
                    <HStack spacing={1} justify="flex-end">
                      <IconButton
                        aria-label="Voir les détails"
                        icon={<FiEye />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openDetailsModal(creator)}
                      />
                      <IconButton
                        aria-label={
                          creator.isVerified
                            ? "Retirer la vérification"
                            : "Vérifier ce créateur"
                        }
                        icon={creator.isVerified ? <FiX /> : <FiCheck />}
                        size="sm"
                        variant="ghost"
                        colorScheme={creator.isVerified ? "red" : "green"}
                        onClick={() => openVerificationModal(creator)}
                      />
                      <IconButton
                        aria-label="Envoyer un email"
                        icon={<FiMail />}
                        size="sm"
                        variant="ghost"
                        onClick={() => handleSendEmail(creator)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de vérification/détails */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            {viewMode === "verify"
              ? `${
                  newVerificationStatus ? "Vérifier" : "Annuler la vérification"
                }`
              : "Détails du créateur"}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            {selectedCreator && (
              <>
                {viewMode === "details" ? (
                  <VStack align="stretch" spacing={4}>
                    <Box>
                      <Heading size="sm" mb={2}>
                        Informations générales
                      </Heading>
                      <HStack>
                        <Text fontWeight="bold">Nom:</Text>
                        <Text>{selectedCreator.name || "Non spécifié"}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Email:</Text>
                        <Text>{selectedCreator.email}</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Statut:</Text>
                        <Badge
                          colorScheme={
                            selectedCreator.isVerified ? "green" : "yellow"
                          }
                        >
                          {selectedCreator.isVerified
                            ? "Vérifié"
                            : "En attente"}
                        </Badge>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Date d'inscription:</Text>
                        <Text>
                          {new Date(
                            selectedCreator.createdAt
                          ).toLocaleDateString()}
                        </Text>
                      </HStack>
                    </Box>

                    <Divider />

                    <Box>
                      <Heading size="sm" mb={2}>
                        Biographie
                      </Heading>
                      <Text>
                        {selectedCreator.bio || "Aucune biographie fournie"}
                      </Text>
                    </Box>

                    {selectedCreator.portfolio && (
                      <>
                        <Divider />
                        <Box>
                          <Heading size="sm" mb={2}>
                            Portfolio
                          </Heading>
                          <Link
                            href={selectedCreator.portfolio}
                            isExternal
                            color="red.400"
                          >
                            {selectedCreator.portfolio}
                          </Link>
                        </Box>
                      </>
                    )}

                    <Divider />

                    <Box>
                      <Heading size="sm" mb={2}>
                        Statistiques
                      </Heading>
                      <HStack>
                        <Text fontWeight="bold">Contenu publié:</Text>
                        <Text>{selectedCreator.contentCount} films/séries</Text>
                      </HStack>
                      <HStack>
                        <Text fontWeight="bold">Ventes totales:</Text>
                        <Text>{selectedCreator.totalSales.toFixed(2)} €</Text>
                      </HStack>
                    </Box>

                    {selectedCreator.identityDocument && (
                      <>
                        <Divider />
                        <Box>
                          <Heading size="sm" mb={2}>
                            Pièce d'identité
                          </Heading>
                          <VStack align="start" spacing={2}>
                            <Link
                              href={selectedCreator.identityDocument}
                              isExternal
                              color="red.400"
                            >
                              Voir la pièce d'identité
                            </Link>

                            {/* Prévisualiser si c'est une image */}
                            {selectedCreator.identityDocument.match(
                              /\.(jpeg|jpg|png|gif)$/i
                            ) && (
                              <Box
                                mt={2}
                                border="1px solid"
                                borderColor="gray.600"
                                borderRadius="md"
                                overflow="hidden"
                              >
                                <Image
                                  src={selectedCreator.identityDocument}
                                  alt="Pièce d'identité"
                                  maxH="200px"
                                  objectFit="contain"
                                />
                              </Box>
                            )}

                            {/* Si c'est un PDF, ajouter un bouton spécifique */}
                            {selectedCreator.identityDocument.endsWith(
                              ".pdf"
                            ) && (
                              <Button
                                as="a"
                                href={selectedCreator.identityDocument}
                                target="_blank"
                                rel="noopener noreferrer"
                                leftIcon={<FiFile />}
                                variant="outline"
                                size="sm"
                                mt={2}
                              >
                                Ouvrir le PDF
                              </Button>
                            )}
                          </VStack>
                        </Box>
                      </>
                    )}

                    {!selectedCreator.identityDocument && (
                      <>
                        <Divider />
                        <Box>
                          <Heading size="sm" mb={2}>
                            Pièce d'identité
                          </Heading>
                          <Text color="yellow.400">
                            Aucune pièce d'identité n'a été fournie par ce
                            créateur.
                          </Text>
                        </Box>
                      </>
                    )}

                    <Button
                      leftIcon={
                        selectedCreator.isVerified ? <FiX /> : <FiCheck />
                      }
                      colorScheme={selectedCreator.isVerified ? "red" : "green"}
                      onClick={() => {
                        setViewMode("verify");
                        setNewVerificationStatus(!selectedCreator.isVerified);
                      }}
                    >
                      {selectedCreator.isVerified
                        ? "Retirer la vérification"
                        : "Vérifier ce créateur"}
                    </Button>
                  </VStack>
                ) : (
                  <>
                    <Text mb={4}>
                      {newVerificationStatus
                        ? `Vous êtes sur le point de vérifier le compte créateur de ${
                            selectedCreator.name || selectedCreator.email
                          }. Cela lui permettra de publier du contenu sur la plateforme.`
                        : `Vous êtes sur le point de retirer la vérification du compte créateur de ${
                            selectedCreator.name || selectedCreator.email
                          }. Cela l'empêchera de publier du nouveau contenu.`}
                    </Text>

                    {selectedCreator.identityDocument && (
                      <Box mb={4} p={3} bg="gray.700" borderRadius="md">
                        <Heading size="sm" mb={2}>
                          Vérification de la pièce d'identité
                        </Heading>

                        {/* Prévisualiser si c'est une image */}
                        {selectedCreator.identityDocument.match(
                          /\.(jpeg|jpg|png|gif)$/i
                        ) && (
                          <Box
                            mt={2}
                            border="1px solid"
                            borderColor="gray.600"
                            borderRadius="md"
                            overflow="hidden"
                            mb={3}
                          >
                            <Image
                              src={selectedCreator.identityDocument}
                              alt="Pièce d'identité"
                              maxH="200px"
                              objectFit="contain"
                            />
                          </Box>
                        )}

                        {/* Si c'est un PDF, ajouter un bouton spécifique */}
                        {selectedCreator.identityDocument.endsWith(".pdf") && (
                          <Button
                            as="a"
                            href={selectedCreator.identityDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            leftIcon={<FiFile />}
                            variant="outline"
                            size="sm"
                            mb={3}
                          >
                            Ouvrir le PDF
                          </Button>
                        )}

                        <Text fontSize="sm" color="yellow.400">
                          Assurez-vous que la pièce d'identité est valide avant
                          de vérifier le créateur.
                        </Text>
                      </Box>
                    )}

                    <FormControl display="flex" alignItems="center" mb={4}>
                      <FormLabel mb="0">
                        {newVerificationStatus
                          ? "Vérifier ce créateur"
                          : "Retirer la vérification"}
                      </FormLabel>
                      <Switch
                        isChecked={newVerificationStatus}
                        onChange={(e) =>
                          setNewVerificationStatus(e.target.checked)
                        }
                        colorScheme="red"
                      />
                    </FormControl>
                  </>
                )}
              </>
            )}
          </ModalBody>

          <ModalFooter>
            {viewMode === "verify" ? (
              <>
                <Button variant="ghost" mr={3} onClick={onClose}>
                  Annuler
                </Button>
                <Button
                  colorScheme={newVerificationStatus ? "green" : "red"}
                  onClick={handleUpdateVerification}
                >
                  Confirmer
                </Button>
              </>
            ) : (
              <Button colorScheme="blue" onClick={onClose}>
                Fermer
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
