"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  Text,
  VStack,
  HStack,
  useToast,
  Heading,
  Divider,
  Image,
  PinInput,
  PinInputField,
  InputGroup,
  InputLeftAddon,
  Alert,
  AlertIcon,
  Spinner,
  Center,
  useColorModeValue,
  Link,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";

interface OrangeMoneyFormProps {
  contentId: string;
  contentTitle: string;
  price: number;
  onSuccess?: (transactionId: string) => void;
  onCancel?: () => void;
}

export default function OrangeMoneyForm({
  contentId,
  contentTitle,
  price,
  onSuccess,
  onCancel,
}: OrangeMoneyFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [code, setCode] = useState("");
  const [isCreatingTransaction, setIsCreatingTransaction] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [referenceNumber, setReferenceNumber] = useState<string | null>(null);
  const [sessionChecked, setSessionChecked] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);

  const toast = useToast();
  const router = useRouter();
  const { data: session, status, update: updateSession } = useSession();

  // Couleurs adaptées au thème
  const boxBg = useColorModeValue("gray.700", "gray.800");
  const textColor = useColorModeValue("white", "gray.100");
  const inputBg = useColorModeValue("gray.600", "gray.700");
  const accentColor = "red.500";
  const highlightBg = useColorModeValue("red.900", "red.800");

  // Fonction pour vérifier explicitement l'état de la session côté serveur
  const checkServerSession = useCallback(async () => {
    try {
      setIsCheckingSession(true);

      // On vérifie d'abord si nous avons une session côté client
      if (!session || status !== "authenticated") {
        console.log("Session client invalide, statut:", status);
        return false;
      }

      console.log(
        "Vérification de session côté serveur, état client:",
        status,
        session?.user?.email
      );

      // Force refresh de la session avant d'appeler l'API
      await updateSession();

      // Utilisation de notre API de vérification avec un paramètre pour éviter la mise en cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/auth/verify?_=${timestamp}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      // Analyser la réponse
      const data = await response.json();

      if (!response.ok || !data.authenticated) {
        console.error("Vérification de session échouée:", data);

        // Dernière tentative - redirection forcée pour rafraîchir complètement la session
        if (session && !data.authenticated) {
          // On est dans un état incohérent, on force un rafraîchissement complet
          console.log("État incohérent détecté, tentative de récupération...");

          // Forcer une mise à jour de la session
          await updateSession();

          // Si on a toujours une session client, on peut essayer l'API de paiement directement
          if (session) {
            console.log("Session client encore valide, tentative directe");
            return true;
          }
        }

        return false;
      }

      console.log("Vérification de session réussie:", data);
      return data.authenticated;
    } catch (error) {
      console.error("Erreur de vérification de session:", error);
      return session !== null; // On se fie à la session client en cas d'erreur
    } finally {
      setIsCheckingSession(false);
    }
  }, [updateSession, session, status]);

  // Vérifier l'état de la session avant de tenter de créer une transaction
  useEffect(() => {
    const initializePayment = async () => {
      // Si le statut est en chargement, attendre
      if (status === "loading") return;

      setSessionChecked(true);

      // Si non authentifié selon le client
      if (status === "unauthenticated") {
        setError(
          "Non authentifié. Veuillez vous connecter avant de procéder au paiement."
        );
        setIsCheckingSession(false);
        return;
      }

      // Double vérification côté serveur
      if (status === "authenticated" && session) {
        try {
          // Vérification côté serveur
          const isSessionValid = await checkServerSession();

          if (!isSessionValid) {
            setError(
              "Votre session a expiré ou est invalide. Veuillez vous reconnecter."
            );
            return;
          }

          // Si toutes les vérifications passent, créer la transaction
          if (contentId && price > 0) {
            await createTransaction();
          }
        } catch (error) {
          console.error("Erreur lors de l'initialisation du paiement:", error);
          setError(
            "Erreur lors de l'initialisation du paiement. Veuillez réessayer."
          );
        }
      }
    };

    initializePayment();
  }, [contentId, price, session, status, checkServerSession]);

  // Fonction pour créer une transaction
  const createTransaction = async () => {
    if (!session) {
      setError(
        "Non authentifié. Veuillez vous connecter avant de procéder au paiement."
      );
      return;
    }

    try {
      setIsCreatingTransaction(true);
      setError(null);

      const response = await fetch("/api/payment/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          contentId,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          // Erreur d'authentification
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });

          // Attendre un peu avant de rediriger pour que l'utilisateur puisse voir le message
          setTimeout(() => {
            // Utiliser signIn directement plutôt que la redirection
            signIn(undefined, { callbackUrl: window.location.href });
          }, 2000);

          throw new Error("Session expirée. Veuillez vous reconnecter.");
        } else {
          throw new Error(
            data.error || "Erreur lors de la création de la transaction"
          );
        }
      }

      setTransactionId(data.transaction.id);
      toast({
        title: "Transaction initiée",
        description: "Veuillez renseigner votre numéro Orange Money",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  // Fonction pour traiter le paiement
  const processPayment = async () => {
    if (!session) {
      setError(
        "Non authentifié. Veuillez vous connecter avant de procéder au paiement."
      );
      return;
    }

    // Vérifier à nouveau la session côté serveur avant le paiement
    const isSessionValid = await checkServerSession();
    if (!isSessionValid) {
      toast({
        title: "Session expirée",
        description: "Votre session a expiré. Veuillez vous reconnecter.",
        status: "error",
        duration: 5000,
        isClosable: true,
      });

      setTimeout(() => {
        signIn(undefined, { callbackUrl: window.location.href });
      }, 2000);

      return;
    }

    if (!transactionId) {
      setError("Aucune transaction initiée. Veuillez réessayer.");
      return;
    }

    if (!phoneNumber || !code) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    if (phoneNumber.length !== 8 && phoneNumber.length !== 9) {
      setError("Le numéro de téléphone doit contenir 8 ou 9 chiffres");
      return;
    }

    if (code.length !== 4) {
      setError("Le code doit contenir 4 chiffres");
      return;
    }

    try {
      setIsProcessingPayment(true);
      setError(null);

      const response = await fetch("/api/payment/simulate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          transactionId,
          phoneNumber,
          code,
        }),
        credentials: "include",
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          toast({
            title: "Session expirée",
            description: "Votre session a expiré. Veuillez vous reconnecter.",
            status: "error",
            duration: 5000,
            isClosable: true,
          });

          setTimeout(() => {
            signIn(undefined, { callbackUrl: window.location.href });
          }, 2000);

          throw new Error("Session expirée. Veuillez vous reconnecter.");
        } else {
          throw new Error(
            data.error || "Erreur lors du traitement du paiement"
          );
        }
      }

      setSuccess(true);
      setReferenceNumber(data.referenceNumber);

      toast({
        title: "Paiement réussi",
        description: "Votre paiement a été traité avec succès",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Appeler la fonction de rappel de succès si elle est fournie
      if (onSuccess) {
        onSuccess(transactionId);
      }
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Une erreur est survenue"
      );
      toast({
        title: "Erreur",
        description:
          error instanceof Error ? error.message : "Une erreur est survenue",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Si l'app est en train de vérifier la session, afficher un spinner
  if (isCheckingSession) {
    return (
      <Box
        maxW="md"
        mx="auto"
        p={6}
        borderWidth={1}
        borderRadius="lg"
        shadow="md"
        bg={boxBg}
        color={textColor}
      >
        <Center p={10}>
          <VStack spacing={4}>
            <Spinner size="xl" color={accentColor} />
            <Text>Vérification de votre session...</Text>
          </VStack>
        </Center>
      </Box>
    );
  }

  // Si la session n'est pas authentifiée, afficher un message d'erreur
  if (sessionChecked && !session) {
    return (
      <Box
        maxW="md"
        mx="auto"
        p={6}
        borderWidth={1}
        borderRadius="lg"
        shadow="md"
        bg={boxBg}
        color={textColor}
      >
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          Non authentifié. Veuillez vous connecter pour effectuer un paiement.
        </Alert>

        <Center mt={6}>
          <Button
            onClick={() =>
              signIn(undefined, { callbackUrl: window.location.href })
            }
            colorScheme="red"
            _hover={{ bg: "red.600" }}
          >
            Se connecter
          </Button>
        </Center>
      </Box>
    );
  }

  // Si la transaction est réussie, afficher la confirmation
  if (success) {
    return (
      <Box
        maxW="md"
        mx="auto"
        p={6}
        borderWidth={1}
        borderRadius="lg"
        shadow="md"
        bg={boxBg}
        color={textColor}
      >
        <VStack spacing={4} align="center">
          <Box
            w="80px"
            h="80px"
            borderRadius="full"
            bg={highlightBg}
            display="flex"
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Text fontSize="3xl">✓</Text>
          </Box>
          <Heading size="md" textAlign="center">
            Paiement Réussi
          </Heading>
          <Text textAlign="center">
            Votre paiement pour <b>{contentTitle}</b> a été traité avec succès.
          </Text>
          {referenceNumber && (
            <Text fontSize="sm" mt={2}>
              Référence: <b>{referenceNumber}</b>
            </Text>
          )}
          <Button
            mt={6}
            colorScheme="red"
            onClick={() => {
              // Rediriger vers la page du contenu
              router.refresh();
              router.push(`/films/${contentId}`);
            }}
          >
            Voir le contenu
          </Button>
        </VStack>
      </Box>
    );
  }

  return (
    <Box
      maxW="md"
      mx="auto"
      p={6}
      borderWidth={1}
      borderRadius="lg"
      shadow="md"
      bg={boxBg}
      color={textColor}
    >
      <Heading size="md" mb={4}>
        Paiement Orange Money
      </Heading>

      <Box mb={4} p={3} bg={highlightBg} borderRadius="md">
        <HStack>
          <Text fontSize="2xl" fontWeight="bold" color={accentColor}>
            €
          </Text>
          <VStack align="start" spacing={0}>
            <Text fontWeight="bold">{contentTitle}</Text>
            <Text fontWeight="bold" color={accentColor}>
              {price.toFixed(2)} €
            </Text>
          </VStack>
        </HStack>
      </Box>

      {error && (
        <Alert status="error" mb={4} borderRadius="md">
          <AlertIcon />
          {error}
        </Alert>
      )}

      {isCreatingTransaction ? (
        <Center p={6}>
          <VStack>
            <Spinner size="lg" color={accentColor} />
            <Text mt={2}>Initialisation du paiement...</Text>
          </VStack>
        </Center>
      ) : (
        <VStack spacing={6} align="stretch">
          <FormControl isRequired>
            <FormLabel>Numéro Orange Money</FormLabel>
            <InputGroup>
              <InputLeftAddon bg={inputBg} color={textColor}>
                +
              </InputLeftAddon>
              <Input
                type="tel"
                placeholder="Numéro de téléphone"
                value={phoneNumber}
                onChange={(e) =>
                  setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))
                }
                isDisabled={isProcessingPayment}
                bg={inputBg}
                _hover={{ bg: "gray.600" }}
                _focus={{ borderColor: accentColor }}
              />
            </InputGroup>
          </FormControl>

          <FormControl isRequired>
            <FormLabel>Code de confirmation</FormLabel>
            <Center>
              <HStack>
                <PinInput
                  otp
                  size="lg"
                  value={code}
                  onChange={setCode}
                  isDisabled={isProcessingPayment}
                  colorScheme="red"
                >
                  <PinInputField
                    bg={inputBg}
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: accentColor }}
                  />
                  <PinInputField
                    bg={inputBg}
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: accentColor }}
                  />
                  <PinInputField
                    bg={inputBg}
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: accentColor }}
                  />
                  <PinInputField
                    bg={inputBg}
                    borderColor="gray.600"
                    _hover={{ borderColor: "gray.500" }}
                    _focus={{ borderColor: accentColor }}
                  />
                </PinInput>
              </HStack>
            </Center>
            <Text fontSize="xs" color="gray.400" mt={2} textAlign="center">
              Pour la démo, utilisez le code 1234
            </Text>
          </FormControl>

          <Divider my={2} />

          <HStack spacing={4} justify="flex-end">
            <Button
              variant="outline"
              onClick={onCancel}
              isDisabled={isProcessingPayment}
              borderColor="gray.600"
              color={textColor}
              _hover={{ bg: "gray.700" }}
            >
              Annuler
            </Button>
            <Button
              colorScheme="red"
              onClick={processPayment}
              isLoading={isProcessingPayment}
              loadingText="Traitement..."
              isDisabled={!phoneNumber || code.length !== 4 || !transactionId}
            >
              Payer {price.toFixed(2)} €
            </Button>
          </HStack>

          <Text fontSize="xs" color="gray.400" mt={4} textAlign="center">
            Ceci est une simulation de paiement Orange Money pour des fins de
            démonstration. Aucun paiement réel ne sera effectué.
          </Text>
        </VStack>
      )}
    </Box>
  );
}
