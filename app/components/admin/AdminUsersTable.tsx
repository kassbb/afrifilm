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
  FormControl,
  FormLabel,
  FormErrorMessage,
  Textarea,
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
  FiUserPlus,
} from "react-icons/fi";

// Types
interface User {
  id: string;
  email: string;
  role: "USER" | "CREATOR" | "ADMIN";
  createdAt: string;
  lastLogin?: string | null;
  isActive?: boolean;
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

  // Modale pour l'ajout d'un utilisateur
  const {
    isOpen: isAddUserOpen,
    onOpen: onAddUserOpen,
    onClose: onAddUserClose,
  } = useDisclosure();
  const [newUser, setNewUser] = useState({
    email: "",
    name: "",
    password: "",
    role: "USER",
    bio: "",
    portfolio: "",
    identityVerified: false,
  });
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  // Alerte pour la suppression d'un utilisateur
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const cancelRef = useRef<HTMLButtonElement>(null);

  const toast = useToast();

  // Fonction pour charger les utilisateurs
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      try {
        console.log("Chargement des utilisateurs...");
        // Utilisation de l'API réelle
        const response = await fetch("/api/admin/users");

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Erreur lors du chargement des utilisateurs"
          );
        }

        const data = await response.json();
        console.log("Utilisateurs chargés:", data.length);
        
        // Normaliser les données pour s'assurer que tous les utilisateurs ont les champs requis
        const normalizedUsers = data.map((user: any) => ({
          ...user,
          isActive: user.isActive !== undefined ? user.isActive : true,
          lastLogin: user.lastLogin || null
        }));
        
        setUsers(normalizedUsers);
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
      console.log(`Mise à jour du statut pour l'utilisateur ${selectedUser.id} à ${selectedAction}`);
      
      // Utilisation de l'API réelle
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          isActive: selectedAction === "activate",
        }),
      });

      const responseData = await response.json();
      
      if (!response.ok) {
        throw new Error(
          responseData.error || "Erreur lors de la mise à jour de l'utilisateur"
        );
      }

      console.log("Réponse API:", responseData);

      // Mettre à jour localement après confirmation de la réponse API
      setUsers(
        users.map((user) =>
          user.id === selectedUser.id
            ? { 
                ...user, 
                isActive: selectedAction === "activate",
                // Si l'API renvoie un utilisateur mis à jour, utilisez ses propriétés
                ...(responseData.user ? {
                  email: responseData.user.email,
                  name: responseData.user.name,
                  role: responseData.user.role,
                  // Ne pas écraser les autres propriétés
                } : {})
              }
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
      console.log(`Suppression de l'utilisateur ${selectedUser.id}`);
      
      // Utilisation de l'API réelle
      const response = await fetch(`/api/admin/users/${selectedUser.id}`, {
        method: "DELETE",
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(
          responseData.error || "Erreur lors de la suppression de l'utilisateur"
        );
      }

      console.log("Réponse API:", responseData);

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

  // Fonction pour valider le formulaire
  const validateForm = () => {
    const errors: {[key: string]: string} = {};
    if (!newUser.email) {
      errors.email = "L'email est requis";
    } else if (!/\S+@\S+\.\S+/.test(newUser.email)) {
      errors.email = "L'email n'est pas valide";
    }

    if (!newUser.name) {
      errors.name = "Le nom est requis";
    }

    if (!newUser.password) {
      errors.password = "Le mot de passe est requis";
    } else if (newUser.password.length < 6) {
      errors.password = "Le mot de passe doit faire au moins 6 caractères";
    }

    if (!newUser.role) {
      errors.role = "Le rôle est requis";
    }

    // Validation des champs spécifiques aux créateurs
    if (newUser.role === "CREATOR") {
      if (!newUser.bio || newUser.bio.trim().length < 10) {
        errors.bio = "Une biographie de 10 caractères minimum est requise pour les créateurs";
      }
      
      if (!newUser.portfolio) {
        errors.portfolio = "Un lien vers un portfolio ou des travaux antérieurs est requis";
      } else if (!/^(http|https):\/\/[^ "]+$/.test(newUser.portfolio)) {
        errors.portfolio = "Veuillez entrer une URL valide";
      }
      
      if (!selectedFile) {
        errors.identity = "Une pièce d'identité est requise pour vérification";
      }
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Gestion du téléversement de fichier
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFile(e.target.files[0]);
    }
  };

  // Fonction pour ajouter un utilisateur
  const handleAddUser = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    setFormErrors({});

    try {
      console.log("Ajout d'un nouvel utilisateur:", newUser);
      
      // Dans une implémentation réelle, téléversez le fichier d'identité vers un stockage sécurisé
      // et sauvegardez l'URL ou la référence dans les métadonnées de l'utilisateur
      
      // Préparation des données pour l'API
      const userData = {
        email: newUser.email,
        name: newUser.name,
        password: newUser.password,
        role: newUser.role,
        ...(newUser.role === "CREATOR" ? {
          bio: newUser.bio,
          portfolio: newUser.portfolio,
          // En situation réelle, nous aurions une URL de l'identité téléversée
          identityProvided: !!selectedFile
        } : {})
      };
      
      console.log("Données envoyées à l'API:", JSON.stringify(userData));
      
      // Appel à l'API
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      console.log("Réponse de l'API:", data);

      if (!response.ok) {
        // Gestion des erreurs de validation spécifiques
        if (data.missingFields && Array.isArray(data.missingFields)) {
          const newErrors: {[key: string]: string} = {};
          data.missingFields.forEach((field: string) => {
            newErrors[field] = `Le champ ${field} est requis`;
          });
          setFormErrors(newErrors);
        }
        
        throw new Error(
          data.error || data.details || "Erreur lors de la création de l'utilisateur"
        );
      }

      // Ajouter le nouvel utilisateur à la liste
      setUsers([data.user, ...users]);

      toast({
        title: "Utilisateur créé",
        description: "L'utilisateur a été créé avec succès",
        status: "success",
        duration: 3000,
        isClosable: true,
      });

      // Réinitialiser le formulaire et fermer la modale
      setNewUser({
        email: "",
        name: "",
        password: "",
        role: "USER",
        bio: "",
        portfolio: "",
        identityVerified: false,
      });
      setSelectedFile(null);
      onAddUserClose();
    } catch (err) {
      console.error("Erreur lors de la création de l'utilisateur:", err);
      
      // Afficher le message d'erreur avec plus de détails
      toast({
        title: "Erreur",
        description: err instanceof Error 
          ? err.message 
          : "Une erreur est survenue lors de la création de l'utilisateur",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        variant: "left-accent",
      });
    } finally {
      setIsSubmitting(false);
    }
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
      <Flex mb={6} gap={4} direction={{ base: "column", md: "row" }} justifyContent="space-between">
        <Flex gap={4} direction={{ base: "column", md: "row" }}>
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

        {/* Bouton d'ajout d'utilisateur */}
        <Button
          leftIcon={<FiUserPlus />}
          colorScheme="blue"
          onClick={onAddUserOpen}
          aria-label="Ajouter un utilisateur"
        >
          Ajouter un utilisateur
        </Button>
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
                  <Badge colorScheme={user.isActive !== false ? "green" : "red"}>
                    {user.isActive !== false ? "Actif" : "Inactif"}
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

      {/* Modal pour l'ajout d'un utilisateur */}
      <Modal isOpen={isAddUserOpen} onClose={onAddUserClose} size={newUser.role === "CREATOR" ? "xl" : "md"}>
        <ModalOverlay />
        <ModalContent bg="gray.800" color="white">
          <ModalHeader>Ajouter un {newUser.role === "CREATOR" ? "créateur" : "utilisateur"}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isInvalid={!!formErrors.email} mb={4}>
              <FormLabel>Email</FormLabel>
              <Input
                type="email"
                placeholder="email@exemple.com"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
              />
              {formErrors.email && (
                <FormErrorMessage>{formErrors.email}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.name} mb={4}>
              <FormLabel>Nom</FormLabel>
              <Input
                placeholder="Nom complet"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
              />
              {formErrors.name && (
                <FormErrorMessage>{formErrors.name}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.password} mb={4}>
              <FormLabel>Mot de passe</FormLabel>
              <Input
                type="password"
                placeholder="Mot de passe"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
              />
              {formErrors.password && (
                <FormErrorMessage>{formErrors.password}</FormErrorMessage>
              )}
            </FormControl>

            <FormControl isInvalid={!!formErrors.role} mb={4}>
              <FormLabel>Rôle</FormLabel>
              <Select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
              >
                <option value="USER">Utilisateur</option>
                <option value="CREATOR">Créateur</option>
                <option value="ADMIN">Administrateur</option>
              </Select>
              {formErrors.role && (
                <FormErrorMessage>{formErrors.role}</FormErrorMessage>
              )}
            </FormControl>

            {/* Champs supplémentaires pour les créateurs */}
            {newUser.role === "CREATOR" && (
              <>
                <Text fontWeight="bold" my={4} fontSize="lg" color="red.300">
                  Informations supplémentaires pour les créateurs
                </Text>
                
                <FormControl isInvalid={!!formErrors.bio} mb={4}>
                  <FormLabel>Biographie</FormLabel>
                  <Textarea
                    placeholder="Présentez-vous et décrivez votre travail..."
                    value={newUser.bio}
                    onChange={(e) => setNewUser({ ...newUser, bio: e.target.value })}
                    minH="100px"
                  />
                  {formErrors.bio && (
                    <FormErrorMessage>{formErrors.bio}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!formErrors.portfolio} mb={4}>
                  <FormLabel>Lien portfolio/travaux</FormLabel>
                  <Input
                    placeholder="https://votre-portfolio.com"
                    value={newUser.portfolio}
                    onChange={(e) => setNewUser({ ...newUser, portfolio: e.target.value })}
                  />
                  {formErrors.portfolio && (
                    <FormErrorMessage>{formErrors.portfolio}</FormErrorMessage>
                  )}
                </FormControl>

                <FormControl isInvalid={!!formErrors.identity} mb={4}>
                  <FormLabel>Pièce d'identité (pour vérification)</FormLabel>
                  <Input
                    type="file"
                    accept="image/jpeg,image/png,application/pdf"
                    onChange={handleFileChange}
                    py={1}
                  />
                  {selectedFile && (
                    <Text fontSize="sm" color="green.300" mt={1}>
                      Fichier sélectionné: {selectedFile.name}
                    </Text>
                  )}
                  {formErrors.identity && (
                    <FormErrorMessage>{formErrors.identity}</FormErrorMessage>
                  )}
                  <Text fontSize="xs" color="gray.400" mt={1}>
                    Formats acceptés: JPG, PNG, PDF. Les documents d'identité sont conservés de manière sécurisée.
                  </Text>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onAddUserClose}>
              Annuler
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={handleAddUser}
              isLoading={isSubmitting}
              loadingText="Création..."
            >
              Créer
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
}
