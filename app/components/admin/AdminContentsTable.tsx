"use client";

import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Box,
  Text,
  HStack,
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
  FormControl,
  FormLabel,
  Textarea,
  Select,
  Flex,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Tag,
  TagLabel,
  Image,
  Tooltip,
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useEffect } from "react";
import {
  FiMoreVertical,
  FiCheck,
  FiX,
  FiSearch,
  FiEye,
  FiTrash2,
  FiEdit2,
  FiFilter,
  FiClock,
  FiDollarSign,
  FiUser,
} from "react-icons/fi";
import NextLink from "next/link";

// Type des contenus
interface Content {
  id: string;
  title: string;
  type: "FILM" | "SERIE";
  price: number | null;
  isApproved: boolean;
  createdAt: string;
  creator: {
    id: string;
    email: string;
  };
  rejectionReason?: string | null;
}

export default function AdminContentsTable() {
  const [contents, setContents] = useState<Content[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    type: "",
    status: "",
  });

  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedContent, setSelectedContent] = useState<Content | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [approvalAction, setApprovalAction] = useState<"approve" | "reject">(
    "approve"
  );

  const toast = useToast();
  const borderColor = useColorModeValue("gray.700", "gray.700");
  const hoverBg = useColorModeValue("gray.800", "gray.700");

  // Fonction pour charger les contenus
  useEffect(() => {
    const fetchContents = async () => {
      setLoading(true);

      try {
        // Appel à l'API admin/contents
        const response = await fetch("/api/admin/contents");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors du chargement des contenus"
          );
        }

        const data = await response.json();
        setContents(data);
      } catch (err) {
        console.error("Erreur lors du chargement des contenus:", err);
        setError("Impossible de charger les contenus");
        toast({
          title: "Erreur",
          description:
            err instanceof Error
              ? err.message
              : "Impossible de charger les contenus",
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top-right",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchContents();
  }, [toast]);

  const handleApproveReject = async () => {
    if (!selectedContent) return;

    try {
      // Appel à l'API réelle
      const response = await fetch(
        `/api/admin/contents/${selectedContent.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            isApproved: approvalAction === "approve",
            rejectionReason:
              approvalAction === "reject" ? rejectionReason : null,
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour du contenu"
        );
      }

      // Mise à jour locale après confirmation de l'API
      setContents(
        contents.map((content) =>
          content.id === selectedContent.id
            ? {
                ...content,
                isApproved: approvalAction === "approve",
                rejectionReason:
                  approvalAction === "reject" ? rejectionReason : null,
              }
            : content
        )
      );

      toast({
        title:
          approvalAction === "approve" ? "Contenu approuvé" : "Contenu rejeté",
        status: approvalAction === "approve" ? "success" : "info",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });

      onClose();
    } catch (err) {
      console.error("Erreur lors de la mise à jour du contenu:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la mise à jour du contenu",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  // Ajout d'une fonction pour supprimer un contenu
  const handleDeleteContent = async (contentId: string) => {
    try {
      // Appel à l'API réelle
      const response = await fetch(`/api/admin/contents/${contentId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la suppression du contenu"
        );
      }

      // Mise à jour locale après confirmation de l'API
      setContents(contents.filter((content) => content.id !== contentId));

      toast({
        title: "Contenu supprimé",
        status: "success",
        duration: 3000,
        isClosable: true,
        position: "top-right",
      });
    } catch (err) {
      console.error("Erreur lors de la suppression du contenu:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la suppression du contenu",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
    }
  };

  const openApproveModal = (content: Content) => {
    setSelectedContent(content);
    setApprovalAction("approve");
    setRejectionReason("");
    onOpen();
  };

  const openRejectModal = (content: Content) => {
    setSelectedContent(content);
    setApprovalAction("reject");
    setRejectionReason(content.rejectionReason || "");
    onOpen();
  };

  const filteredContents = contents
    .filter(
      (content) =>
        content.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        content.creator.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (content) =>
        (filter.type === "" || content.type === filter.type) &&
        (filter.status === "" ||
          (filter.status === "approved" && content.isApproved) ||
          (filter.status === "pending" && !content.isApproved))
    );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  if (loading) {
    return (
      <Flex justify="center" align="center" h="300px">
        <Spinner size="lg" color="red.500" thickness="3px" />
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
      <Flex
        justify="space-between"
        align="center"
        mb={4}
        flexWrap="wrap"
        gap={3}
      >
        <InputGroup maxW="400px">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder="Rechercher un contenu..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            bg="gray.700"
            border="none"
            _focus={{ boxShadow: "outline" }}
          />
        </InputGroup>

        <HStack spacing={2}>
          <Menu closeOnSelect={false}>
            <MenuButton
              as={Button}
              rightIcon={<FiFilter />}
              size="sm"
              variant="outline"
              borderColor="gray.600"
              _hover={{ bg: "gray.700" }}
            >
              Filtres
            </MenuButton>
            <MenuList bgColor="gray.800" borderColor="gray.700">
              <Box p={3}>
                <FormControl mb={3}>
                  <FormLabel fontSize="sm" color="gray.400">
                    Type
                  </FormLabel>
                  <Select
                    size="sm"
                    value={filter.type}
                    onChange={(e) =>
                      setFilter({ ...filter, type: e.target.value })
                    }
                    bg="gray.700"
                    borderColor="gray.600"
                    title="Filtrer par type"
                    aria-label="Filtrer par type"
                  >
                    <option value="">Tous</option>
                    <option value="FILM">Film</option>
                    <option value="SERIE">Série</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel fontSize="sm" color="gray.400">
                    Statut
                  </FormLabel>
                  <Select
                    size="sm"
                    value={filter.status}
                    onChange={(e) =>
                      setFilter({ ...filter, status: e.target.value })
                    }
                    bg="gray.700"
                    borderColor="gray.600"
                    title="Filtrer par statut"
                    aria-label="Filtrer par statut"
                  >
                    <option value="">Tous</option>
                    <option value="approved">Approuvé</option>
                    <option value="pending">En attente</option>
                  </Select>
                </FormControl>
              </Box>
            </MenuList>
          </Menu>

          <Button
            size="sm"
            colorScheme="red"
            onClick={() => setFilter({ type: "", status: "" })}
            isDisabled={filter.type === "" && filter.status === ""}
          >
            Réinitialiser
          </Button>
        </HStack>
      </Flex>

      <Box overflowX="auto" boxShadow="sm" borderRadius="lg" mb={4}>
        <Table variant="simple" size="md">
          <Thead>
            <Tr bg="gray.700">
              <Th color="gray.300" borderColor={borderColor}>
                Titre
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Type
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Prix
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Statut
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Date
              </Th>
              <Th color="gray.300" borderColor={borderColor}>
                Créateur
              </Th>
              <Th color="gray.300" borderColor={borderColor} textAlign="right">
                Actions
              </Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredContents.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={10} color="gray.400">
                  <Flex direction="column" align="center">
                    <Text mb={2}>Aucun contenu trouvé</Text>
                    <Text fontSize="sm">
                      Modifiez vos critères de recherche ou ajoutez un nouveau
                      contenu
                    </Text>
                  </Flex>
                </Td>
              </Tr>
            ) : (
              filteredContents.map((content) => (
                <Tr
                  key={content.id}
                  _hover={{ bg: hoverBg }}
                  transition="background 0.2s"
                  cursor="pointer"
                >
                  <Td borderColor={borderColor} fontWeight="medium">
                    <NextLink href={`/admin/contents/${content.id}`} passHref>
                      {content.title}
                    </NextLink>
                  </Td>
                  <Td borderColor={borderColor}>
                    <Tag
                      size="sm"
                      colorScheme={content.type === "FILM" ? "red" : "purple"}
                      borderRadius="full"
                    >
                      <TagLabel>
                        {content.type === "FILM" ? "Film" : "Série"}
                      </TagLabel>
                    </Tag>
                  </Td>
                  <Td borderColor={borderColor}>
                    {content.price ? (
                      <HStack>
                        <FiDollarSign />
                        <Text>{content.price.toFixed(2)} €</Text>
                      </HStack>
                    ) : (
                      <Badge colorScheme="green">Gratuit</Badge>
                    )}
                  </Td>
                  <Td borderColor={borderColor}>
                    {content.isApproved ? (
                      <Badge
                        colorScheme="green"
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        <HStack spacing={1}>
                          <FiCheck size={12} />
                          <Text>Approuvé</Text>
                        </HStack>
                      </Badge>
                    ) : (
                      <Badge
                        colorScheme="orange"
                        variant="subtle"
                        px={2}
                        py={1}
                        borderRadius="md"
                      >
                        <HStack spacing={1}>
                          <FiClock size={12} />
                          <Text>En attente</Text>
                        </HStack>
                      </Badge>
                    )}
                  </Td>
                  <Td borderColor={borderColor} fontSize="sm" color="gray.300">
                    {formatDate(content.createdAt)}
                  </Td>
                  <Td borderColor={borderColor}>
                    <HStack>
                      <FiUser size={14} />
                      <Text fontSize="sm">{content.creator.email}</Text>
                    </HStack>
                  </Td>
                  <Td borderColor={borderColor} textAlign="right">
                    <HStack spacing={1} justifyContent="flex-end">
                      <Tooltip label="Voir les détails" placement="top">
                        <IconButton
                          aria-label="Détails"
                          icon={<FiEye />}
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          as={NextLink}
                          href={`/admin/contents/${content.id}`}
                        />
                      </Tooltip>

                      {!content.isApproved && (
                        <Tooltip label="Approuver" placement="top">
                          <IconButton
                            aria-label="Approuver"
                            icon={<FiCheck />}
                            size="sm"
                            variant="ghost"
                            colorScheme="green"
                            onClick={() => openApproveModal(content)}
                          />
                        </Tooltip>
                      )}

                      {content.isApproved && (
                        <Tooltip label="Rejeter" placement="top">
                          <IconButton
                            aria-label="Rejeter"
                            icon={<FiX />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => openRejectModal(content)}
                          />
                        </Tooltip>
                      )}

                      <Tooltip label="Supprimer" placement="top">
                        <IconButton
                          aria-label="Supprimer"
                          icon={<FiTrash2 />}
                          size="sm"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteContent(content.id)}
                        />
                      </Tooltip>
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Modal d'approbation/rejet */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            {approvalAction === "approve"
              ? "Approuver le contenu"
              : "Rejeter le contenu"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedContent && (
              <Box>
                <Text mb={4}>
                  {approvalAction === "approve"
                    ? `Êtes-vous sûr de vouloir approuver "${selectedContent.title}" ?`
                    : `Êtes-vous sûr de vouloir rejeter "${selectedContent.title}" ?`}
                </Text>

                {approvalAction === "reject" && (
                  <FormControl isRequired>
                    <FormLabel>Raison du rejet</FormLabel>
                    <Textarea
                      value={rejectionReason}
                      onChange={(e) => setRejectionReason(e.target.value)}
                      placeholder="Expliquez pourquoi ce contenu est rejeté..."
                      bg="gray.700"
                      border="none"
                    />
                  </FormControl>
                )}
              </Box>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme={approvalAction === "approve" ? "green" : "red"}
              onClick={handleApproveReject}
              isDisabled={
                approvalAction === "reject" && !rejectionReason.trim()
              }
            >
              {approvalAction === "approve" ? "Approuver" : "Rejeter"}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
