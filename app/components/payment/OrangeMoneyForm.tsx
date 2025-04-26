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
  AlertTitle,
  AlertDescription,
  Icon,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { useSession, signIn } from "next-auth/react";
import { FiRefreshCw } from "react-icons/fi";

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
  const [existingTransaction, setExistingTransaction] = useState<any>(null);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

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

      // Vérifier la session avec un contrôle plus robuste
      console.log(
        "Vérification de session côté serveur, état client:",
        status,
        session?.user?.email
      );

      // Utiliser un nouveau timestamp à chaque requête pour éviter la mise en cache
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/auth/session?_=${timestamp}`, {
        method: "GET",
        credentials: "include",
        cache: "no-store",
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
      });

      // Vérifier d'abord le statut de la réponse
      if (!response.ok) {
        console.error(
          "Erreur HTTP lors de la vérification de session:",
          response.status
        );
        return false;
      }

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Erreur de parsing JSON:", jsonError);

        // En cas d'erreur de parsing, actualiser la session client
        await updateSession();

        // Vérifier si on a toujours une session côté client après actualisation
        return session !== null;
      }

      // Si pas de session dans les données retournées
      if (!data || !data.user) {
        console.log("Session invalide ou expirée côté serveur");

        // Si on a une session côté client mais pas côté serveur, essayer de la récupérer
        if (session) {
          console.log("État incohérent détecté, tentative de récupération...");
          await updateSession();
        }

        return false;
      }

      console.log("Vérification de session réussie:", data);
      return true;
    } catch (error) {
      console.error("Erreur lors de la vérification de session:", error);

      // Si on a encore une session côté client malgré l'erreur, on peut continuer
      if (session && status === "authenticated") {
        return true;
      }

      return false;
    } finally {
      setIsCheckingSession(false);
    }
  }, [session, status, updateSession]);

  // Vérifier l'état de la session avant de tenter de créer une transaction
  useEffect(() => {
    const initializePayment = async () => {
      // Si le statut est en chargement, attendre
      if (status === "loading") return;

      setSessionChecked(true);

      // Si non authentifié selon le client, demander connexion
      if (status === "unauthenticated") {
        setError("Vous devez être connecté pour effectuer un paiement.");
        setIsCheckingSession(false);
        return;
      }

      // Si authentifié côté client, vérifier côté serveur
      if (status === "authenticated" && session) {
        try {
          // Vérification côté serveur avec mécanisme de retry
          let isSessionValid = false;
          let retryCount = 0;
          const maxRetries = 2;

          while (!isSessionValid && retryCount <= maxRetries) {
            isSessionValid = await checkServerSession();

            if (!isSessionValid && retryCount < maxRetries) {
              console.log(
                `Tentative de récupération de session ${
                  retryCount + 1
                }/${maxRetries}...`
              );
              // Attendre un peu avant de réessayer (backoff exponentiel)
              await new Promise((r) =>
                setTimeout(r, 500 * Math.pow(2, retryCount))
              );
              // Actualiser la session
              await updateSession();
              retryCount++;
            } else {
              break;
            }
          }

          if (!isSessionValid) {
            setError(
              "Votre session a expiré. Veuillez vous reconnecter pour continuer."
            );
            setIsSessionExpired(true);
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
  }, [contentId, price, session, status, checkServerSession, updateSession]);

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

      console.log("Création de transaction pour le contenu:", contentId);

      // Génération d'un timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();

      // Construction de la requête
      const requestBody = {
        contentId,
      };

      console.log("Données envoyées:", requestBody);

      // Envoi de la requête avec plus de détails pour le débogage
      const response = await fetch(`/api/payment/create?_=${timestamp}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Cache-Control": "no-cache, no-store, must-revalidate",
          Pragma: "no-cache",
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });

      console.log("Statut de la réponse:", response.status);

      // Récupérer le texte brut de la réponse d'abord
      const responseText = await response.text();
      console.log("Réponse brute:", responseText);

      // Tenter de parser le JSON à partir du texte
      let data;
      try {
        data = JSON.parse(responseText);
        console.log("Données de réponse parsées:", data);
      } catch (parseError) {
        console.error("Erreur de parsing JSON:", parseError);
        console.error("Texte reçu:", responseText);
        throw new Error(
          `Erreur de format: Réponse serveur invalide (${response.status})`
        );
      }

      // Vérifier d'abord si la réponse est OK
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

          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }

        // Vérifier si l'erreur concerne une transaction existante
        if (
          response.status === 400 &&
          data.transaction &&
          data.error &&
          data.error.includes("transaction en cours")
        ) {
          console.log("Transaction existante détectée:", data.transaction);
          // Stocker la transaction existante pour permettre à l'utilisateur de la continuer
          setExistingTransaction(data.transaction);
          throw new Error(data.error);
        }

        // Utiliser le message d'erreur du serveur si disponible
        const errorMessage =
          data?.error ||
          `Erreur (${response.status}) lors de la création de la transaction`;

        console.error("Détails de l'erreur:", data);
        throw new Error(errorMessage);
      }

      // Vérifier que les données sont valides
      if (!data || !data.transaction || !data.transaction.id) {
        console.error("Données de transaction invalides:", data);
        throw new Error("Données de transaction invalides ou incomplètes");
      }

      console.log("Transaction créée avec succès:", data.transaction.id);
      setTransactionId(data.transaction.id);
      toast({
        title: "Transaction initiée",
        description: "Veuillez renseigner votre numéro Orange Money",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error("Erreur complète:", error);

      // Message d'erreur plus détaillé pour l'utilisateur
      const errorMessage =
        error instanceof Error
          ? `${error.message}${
              error.stack ? " (Détail: " + error.stack.split("\n")[0] + ")" : ""
            }`
          : "Une erreur est survenue lors de la création de la transaction";

      setError(errorMessage);

      // Ne pas afficher de toast si on a une transaction existante
      // On affichera plutôt l'UI pour continuer cette transaction
      if (!existingTransaction) {
        toast({
          title: "Erreur de transaction",
          description: errorMessage,
          status: "error",
          duration: 5000,
          isClosable: true,
        });
      }
    } finally {
      setIsCreatingTransaction(false);
    }
  };

  // Fonction pour utiliser une transaction existante
  const usePendingTransaction = () => {
    if (existingTransaction && existingTransaction.id) {
      setTransactionId(existingTransaction.id);
      setExistingTransaction(null);
      setError(null);
      toast({
        title: "Transaction en cours",
        description: "Veuillez finaliser votre paiement",
        status: "info",
        duration: 3000,
        isClosable: true,
      });
    }
  };

  // Fonction pour annuler une transaction en cours et réinitialiser le formulaire
  const cancelPendingTransaction = async () => {
    try {
      // Réinitialiser l'état local
      setExistingTransaction(null);
      setError(null);

      // Réinitialiser le formulaire pour pouvoir recommencer
      if (onCancel) onCancel();
    } catch (error) {
      console.error("Erreur lors de l'annulation:", error);
    }
  };

  // Fonction pour traiter le paiement
  const processPayment = async () => {
    if (!session) {
      setError(
        "Non authentifié. Veuillez vous connecter avant de procéder au paiement."
      );
      setIsSessionExpired(true);
      return;
    }

    try {
      setIsProcessingPayment(true);
      setError(null);

      // Vérification améliorée de la session avant paiement
      // avec plusieurs tentatives et une meilleure détection d'erreurs
      let isSessionValid = false;
      let sessionCheckAttempts = 0;
      const maxSessionCheckAttempts = 2;

      // Boucle pour tenter de valider la session plusieurs fois
      while (
        !isSessionValid &&
        sessionCheckAttempts <= maxSessionCheckAttempts
      ) {
        console.log(
          `Tentative de vérification de session #${sessionCheckAttempts + 1}`
        );
        try {
          // Utiliser un timestamp pour éviter le cache
          const timestamp = new Date().getTime();
          const sessionResponse = await fetch(
            `/api/auth/session?_=${timestamp}`,
            {
              method: "GET",
              credentials: "include",
              cache: "no-store",
              headers: {
                "Cache-Control": "no-cache, no-store, must-revalidate",
                Pragma: "no-cache",
              },
            }
          );

          if (sessionResponse.ok) {
            const sessionData = await sessionResponse.json();
            isSessionValid = sessionData.authenticated === true;
            console.log(
              "État session:",
              isSessionValid ? "Valide" : "Invalide",
              sessionData
            );
          } else {
            console.error(
              "Erreur HTTP lors de la vérification de session:",
              sessionResponse.status
            );
          }
        } catch (sessionError) {
          console.error(
            "Erreur lors de la vérification de session:",
            sessionError
          );
        }

        // Si la session n'est pas valide et qu'on n'a pas atteint le nombre max de tentatives
        if (!isSessionValid && sessionCheckAttempts < maxSessionCheckAttempts) {
          console.log("Tentative de récupération de session...");

          // Tentative de rafraîchir la session côté client
          await updateSession();

          // Attente courte avant nouvelle tentative (backoff exponentiel)
          const waitTime = 500 * Math.pow(2, sessionCheckAttempts);
          console.log(`Attente de ${waitTime}ms avant nouvelle tentative...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
        }

        sessionCheckAttempts++;
      }

      // Si après toutes les tentatives, la session n'est toujours pas valide
      if (!isSessionValid) {
        setIsSessionExpired(true);
        setError(
          "Votre session a expiré. Veuillez vous reconnecter pour finaliser le paiement."
        );

        // Sauvegarder les données pour les retrouver après reconnexion
        localStorage.setItem(
          "orangeMoneyFormData",
          JSON.stringify({
            transactionId,
            phoneNumber,
            code,
            contentId,
            timestamp: new Date().getTime(),
          })
        );

        // Informer l'utilisateur
        toast({
          title: "Session expirée",
          description:
            "Votre session a expiré. Utilisez le bouton Reconnecter ci-dessous.",
          status: "error",
          duration: 5000,
          isClosable: true,
        });

        return;
      }

      // Reste du code inchangé
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

      // Sauvegarder les données du formulaire pour reprise éventuelle
      localStorage.setItem(
        "orangeMoneyFormData",
        JSON.stringify({
          transactionId,
          phoneNumber,
          code,
          contentId,
          timestamp: new Date().getTime(),
        })
      );

      // Ajout d'un timestamp pour éviter la mise en cache
      const timestamp = new Date().getTime();

      // Inclure des headers pour contourner le cache et assurer la transmission des cookies
      const paymentResponse = await fetch(
        `/api/payment/simulate?_=${timestamp}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-cache, no-store, must-revalidate",
            Pragma: "no-cache",
          },
          body: JSON.stringify({
            transactionId,
            phoneNumber,
            code,
          }),
          credentials: "include",
        }
      );

      // Gestion améliorée des erreurs d'authentification
      if (paymentResponse.status === 401) {
        console.error("Erreur d'authentification lors du paiement (401)");
        setIsSessionExpired(true);

        // Sauvegarder l'état pour le retrouver après reconnexion
        localStorage.setItem(
          "orangeMoneyFormData",
          JSON.stringify({
            transactionId,
            phoneNumber,
            code,
            contentId,
            timestamp: new Date().getTime(),
          })
        );

        throw new Error(
          "Session expirée. Veuillez vous reconnecter pour finaliser votre paiement."
        );
      }

      // Pour les autres erreurs, lire le corps et examiner le message
      if (!paymentResponse.ok) {
        // Tenter de lire le message d'erreur même si le parsing échoue
        let errorMessage = `Erreur HTTP ${paymentResponse.status}`;
        try {
          const errorData = await paymentResponse.json();
          if (errorData && errorData.error) {
            errorMessage = errorData.error;
          }
        } catch (parseError) {
          console.error(
            "Erreur de parsing de la réponse d'erreur:",
            parseError
          );
        }

        throw new Error(errorMessage);
      }

      // Analyser la réponse
      const data = await paymentResponse.json().catch(() => {
        throw new Error("Format de réponse invalide");
      });

      // Effacer les données sauvegardées en cas de succès
      localStorage.removeItem("orangeMoneyFormData");

      setSuccess(true);
      setReferenceNumber(data.referenceNumber);

      toast({
        title: "Paiement réussi",
        description: "Votre paiement a été traité avec succès",
        status: "success",
        duration: 5000,
        isClosable: true,
      });

      // Effacer les données sauvegardées en cas de succès
      localStorage.removeItem("orangeMoneyFormData");

      // Force refresh the router cache to ensure updated content state
      router.refresh();

      // Appeler la fonction de rappel de succès si elle est fournie
      if (onSuccess) {
        // Pass the transaction ID to the success handler
        onSuccess(transactionId);
      }
    } catch (error) {
      console.error("Erreur lors du traitement du paiement:", error);

      // Message d'erreur plus détaillé pour l'utilisateur
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors du paiement";

      setError(errorMessage);
      toast({
        title: "Erreur de paiement",
        description: errorMessage,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // Gérer la reconnexion en préservant le contexte actuel
  const handleReconnect = () => {
    // Stocker l'information que nous sommes en train de nous reconnecter
    // pour un paiement en cours
    localStorage.setItem("reconnectingForPayment", "true");
    localStorage.setItem("paymentContentId", contentId);

    // Redirection vers la page de connexion
    signIn(undefined, {
      callbackUrl: window.location.href,
    });
  };

  // Vérifier au chargement s'il y a des données de formulaire sauvegardées
  useEffect(() => {
    // Ne vérifier que si on est authentifié et que la transaction n'est pas déjà initiée
    if (
      status === "authenticated" &&
      session &&
      !transactionId &&
      !isCreatingTransaction
    ) {
      try {
        const savedData = localStorage.getItem("orangeMoneyFormData");
        const reconnecting = localStorage.getItem("reconnectingForPayment");

        if (savedData && reconnecting === "true") {
          const parsedData = JSON.parse(savedData);

          // Vérifier si les données concernent ce contenu
          if (parsedData.contentId === contentId) {
            // Vérifier si les données ne sont pas trop anciennes (30 minutes max)
            const now = new Date().getTime();
            const savedTime = parsedData.timestamp || 0;

            if (now - savedTime < 30 * 60 * 1000) {
              // Restaurer l'état du formulaire
              setTransactionId(parsedData.transactionId);
              setPhoneNumber(parsedData.phoneNumber || "");
              setCode(parsedData.code || "");

              toast({
                title: "Données restaurées",
                description: "Vous pouvez maintenant finaliser votre paiement",
                status: "info",
                duration: 3000,
                isClosable: true,
              });
            }
          }
        }

        // Nettoyer le stockage
        localStorage.removeItem("reconnectingForPayment");
        localStorage.removeItem("paymentContentId");
      } catch (error) {
        console.error("Erreur lors de la restauration des données:", error);
      }
    }
  }, [status, session, contentId, transactionId, isCreatingTransaction]);

  // Si l'app est en train de vérifier la session, afficher un spinner
  if (isCheckingSession) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        bg={boxBg}
        color={textColor}
        maxW="md"
        mx="auto"
      >
        <VStack spacing={6}>
          <Center>
            <Image src="/logo.svg" alt="AfriFilm" height="60px" />
          </Center>
          <Heading size="md">Vérification de votre session</Heading>
          <Spinner size="xl" color={accentColor} thickness="4px" />
          <Text>Veuillez patienter...</Text>
        </VStack>
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

  // Remplacer le rendu existant en début de composant pour gérer l'affichage des erreurs
  if (error) {
    return (
      <Box
        borderWidth="1px"
        borderRadius="lg"
        p={6}
        bg={boxBg}
        color={textColor}
        maxW="md"
        mx="auto"
      >
        <VStack spacing={6} align="stretch">
          <Center>
            <Image src="/logo.svg" alt="AfriFilm" height="60px" />
          </Center>

          <Heading size="md" textAlign="center" color={accentColor}>
            Erreur de paiement
          </Heading>

          <Alert status="error" borderRadius="md" bg={highlightBg}>
            <AlertIcon />
            {error}
          </Alert>

          {/* Si une transaction existante est détectée, proposer de la continuer */}
          {existingTransaction && (
            <Box p={4} borderWidth="1px" borderRadius="md" mt={4}>
              <VStack spacing={4} align="stretch">
                <Heading size="md">Transaction en cours détectée</Heading>
                <Text>
                  Vous avez déjà une transaction en cours pour ce contenu.
                  Souhaitez-vous poursuivre cette transaction ou annuler?
                </Text>
                <HStack spacing={4}>
                  <Button
                    colorScheme="brand"
                    width="full"
                    onClick={usePendingTransaction}
                  >
                    Continuer cette transaction
                  </Button>
                  <Button
                    colorScheme="gray"
                    width="full"
                    onClick={cancelPendingTransaction}
                  >
                    Annuler
                  </Button>
                </HStack>
              </VStack>
            </Box>
          )}

          {!existingTransaction && (
            <HStack spacing={4}>
              <Button
                colorScheme="brand"
                width="full"
                onClick={handleReconnect}
                leftIcon={<FiRefreshCw />}
                isDisabled={!isSessionExpired}
              >
                Reconnecter
              </Button>
              <Button colorScheme="gray" width="full" onClick={onCancel}>
                Annuler
              </Button>
            </HStack>
          )}
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
