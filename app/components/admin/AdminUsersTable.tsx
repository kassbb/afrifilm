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
  Flex,
  Spinner,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";
import { useState, useEffect, useRef } from "react";
import {
  FiMoreVertical,
  FiSearch,
  FiUserX,
  FiUserCheck,
  FiTrash2,
  FiMail,
  FiLock,
} from "react-icons/fi";

// Types
interface User {
  id: string;
  email: string;
  role: "USER" | "CREATOR" | "ADMIN";
  createdAt: string;
  lastLogin?: string | null;
  isActive: boolean;
}

export default function AdminUsersTable() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [filter, setFilter] = useState({
    role: "",
    status: "",
  });

  // Modal pour la suspension d'un utilisateur
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [selectedAction, setSelectedAction] = useState<
    "activate" | "deactivate"
  >("deactivate");

  // Alerte pour la suppression d'un utilisateur
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  // Fonction pour charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        // Utilisation de l'API réelle
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors du chargement des utilisateurs"
          );
        }

        const data = await response.json();
        setUsers(data);
      } catch (err) {
        console.error("Erreur lors du chargement des utilisateurs:", err);
        setError("Impossible de charger les utilisateurs");
        toast({
          title: "Erreur",
          description:
            err instanceof Error
              ? err.message
              : "Impossible de charger les utilisateurs",
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleUserStatusUpdate = async () => {
    if (!selectedUser) return;

    try {
      // Utilisation de l'API réelle
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: selectedAction === "activate",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la mise à jour de l'utilisateur"
        );
      }

      // Mettre à jour localement après confirmation de la réponse API
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { ...user, isActive: selectedAction === "activate" }
            : user
        )
      );

      toast({
        title:
          selectedAction === "activate"
            ? "Utilisateur activé"
            : "Utilisateur désactivé",
        status: selectedAction === "activate" ? "success" : "info",
        duration: 3000,
        isClosable: true,
      });

      onClose();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de l'utilisateur:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la mise à jour de l'utilisateur",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      // Utilisation de l'API réelle
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Erreur lors de la suppression de l'utilisateur"
        );
      }

      // Mettre à jour localement après confirmation de la réponse API
      setUsers(users.filter((user) => user.id !== selectedUser.id));

      toast({
        title: "Utilisateur supprimé",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      setIsDeleteAlertOpen(false);
    } catch (err) {
      console.error("Erreur lors de la suppression de l'utilisateur:", err);
      toast({
        title: "Erreur",
        description:
          err instanceof Error
            ? err.message
            : "Une erreur est survenue lors de la suppression de l'utilisateur",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const openUserStatusModal = (
    user: User,
    action: "activate" | "deactivate"
  ) => {
    setSelectedUser(user);
    setSelectedAction(action);
    onOpen();
  };

  const openDeleteAlert = (user: User) => {
    setSelectedUser(user);
    setIsDeleteAlertOpen(true);
  };

  const openResetPasswordModal = (user: User) => {
    setSelectedUser(user);

    toast({
      title: "Envoi d'un email de réinitialisation",
      description: "Fonctionnalité en cours d'implémentation",
      status: "info",
      duration: 3000,
      isClosable: true,
    });

    // Dans une version complète, nous appellerions l'API
    // fetch(`/api/admin/users/${user.id}/reset-password`, {
    //   method: 'POST',
    // });
  };

  const filteredUsers = users
    .filter((user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .filter(
      (user) =>
        (filter.role === "" || user.role === filter.role) &&
        (filter.status === "" ||
          (filter.status === "active" && user.isActive) ||
          (filter.status === "inactive" && !user.isActive))
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
          placeholder="Rôle"
          value={filter.role}
          onChange={(e) => setFilter({ ...filter, role: e.target.value })}
          maxW={{ md: "200px" }}
          bg="gray.700"
          border="none"
          color="white"
          aria-label="Filtrer par rôle"
          title="Filtrer par rôle"
        >
          <option value="">Tous</option>
          <option value="USER">Utilisateurs</option>
          <option value="CREATOR">Créateurs</option>
          <option value="ADMIN">Administrateurs</option>
        </Select>

        <Select
          placeholder="Statut"
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
          <option value="active">Actifs</option>
          <option value="inactive">Inactifs</option>
        </Select>
      </Flex>

      {/* Tableau des utilisateurs */}
      <Box overflowX="auto">
        <Table variant="simple" colorScheme="gray">
          <Thead>
            <Tr>
              <Th color="gray.400">Email</Th>
              <Th color="gray.400">Rôle</Th>
              <Th color="gray.400">Date d'inscription</Th>
              <Th color="gray.400">Dernière connexion</Th>
              <Th color="gray.400">Statut</Th>
              <Th color="gray.400">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredUsers.map((user) => (
              <Tr key={user.id} _hover={{ bg: "gray.700" }}>
                <Td color="white">{user.email}</Td>
                <Td>
                  <Badge
                    colorScheme={
                      user.role === "ADMIN"
                        ? "red"
                        : user.role === "CREATOR"
                        ? "purple"
                        : "blue"
                    }
                  >
                    {user.role}
                  </Badge>
                </Td>
                <Td color="white">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </Td>
                <Td color="white">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString("fr-FR")
                    : "Jamais connecté"}
                </Td>
                <Td>
                  <Badge colorScheme={user.isActive ? "green" : "red"}>
                    {user.isActive ? "Actif" : "Inactif"}
                  </Badge>
                </Td>
                <Td>
                  <Menu>
                    <MenuButton
                      as={IconButton}
                      icon={<FiMoreVertical />}
                      variant="ghost"
                      size="sm"
                      colorScheme="gray"
                      aria-label="Options pour cet utilisateur"
                    />
                    <MenuList bg="gray.800" borderColor="gray.700">
                      {user.isActive ? (
                        <MenuItem
                          icon={<FiUserX />}
                          onClick={() =>
                            openUserStatusModal(user, "deactivate")
                          }
                          _hover={{ bg: "gray.700" }}
                          color="red.400"
                        >
                          Désactiver
                        </MenuItem>
                      ) : (
                        <MenuItem
                          icon={<FiUserCheck />}
                          onClick={() => openUserStatusModal(user, "activate")}
                          _hover={{ bg: "gray.700" }}
                          color="green.400"
                        >
                          Activer
                        </MenuItem>
                      )}

                      <MenuItem
                        icon={<FiLock />}
                        onClick={() => openResetPasswordModal(user)}
                        _hover={{ bg: "gray.700" }}
                        color="blue.400"
                      >
                        Réinitialiser mot de passe
                      </MenuItem>

                      <MenuItem
                        icon={<FiMail />}
                        _hover={{ bg: "gray.700" }}
                        color="blue.400"
                      >
                        Envoyer un email
                      </MenuItem>

                      <MenuItem
                        icon={<FiTrash2 />}
                        onClick={() => openDeleteAlert(user)}
                        _hover={{ bg: "gray.700" }}
                        color="red.400"
                      >
                        Supprimer
                      </MenuItem>
                    </MenuList>
                  </Menu>
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      </Box>

      {/* Modal de changement de statut */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>
            {selectedAction === "activate"
              ? "Activer l'utilisateur"
              : "Désactiver l'utilisateur"}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {selectedUser && (
              <Text>
                {selectedAction === "activate"
                  ? `Êtes-vous sûr de vouloir activer l'utilisateur "${selectedUser.email}" ?`
                  : `Êtes-vous sûr de vouloir désactiver l'utilisateur "${selectedUser.email}" ?`}
              </Text>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Annuler
            </Button>
            <Button
              colorScheme={selectedAction === "activate" ? "green" : "red"}
              onClick={handleUserStatusUpdate}
            >
              Confirmer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {/* Alerte de confirmation de suppression */}
      <AlertDialog
        isOpen={isDeleteAlertOpen}
        leastDestructiveRef={cancelRef}
        onClose={() => setIsDeleteAlertOpen(false)}
      >
        <AlertDialogOverlay>
          <AlertDialogContent bg="gray.800" color="white">
            <AlertDialogHeader fontSize="lg" fontWeight="bold">
              Supprimer l'utilisateur
            </AlertDialogHeader>

            <AlertDialogBody>
              {selectedUser && (
                <Text>
                  Êtes-vous sûr de vouloir supprimer définitivement
                  l'utilisateur "{selectedUser.email}" ? Cette action ne peut
                  pas être annulée.
                </Text>
              )}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button
                ref={cancelRef}
                onClick={() => setIsDeleteAlertOpen(false)}
              >
                Annuler
              </Button>
              <Button colorScheme="red" onClick={handleDeleteUser} ml={3}>
                Supprimer
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </Box>
  );
}
