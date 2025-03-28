import { FormEvent, useState } from "react";
import { signIn } from "next-auth/react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Text,
  useToast,
  InputGroup,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { useRouter } from "next/navigation";
import { ViewIcon, ViewOffIcon } from "@chakra-ui/icons";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const toast = useToast();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMessage("");

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setErrorMessage(
          result.error === "CredentialsSignin"
            ? "Email ou mot de passe incorrect"
            : result.error
        );
        toast({
          title: "Erreur de connexion",
          description: "Email ou mot de passe incorrect",
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Connexion réussie
        toast({
          title: "Connexion réussie",
          description: "Vous êtes maintenant connecté",
          status: "success",
          duration: 3000,
          isClosable: true,
        });
        router.push("/");
        router.refresh(); // Force le rafraîchissement pour mettre à jour l'état d'authentification
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      setErrorMessage("Une erreur est survenue lors de la connexion");
      toast({
        title: "Erreur de connexion",
        description: "Une erreur est survenue lors de la connexion",
        status: "error",
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box as="form" onSubmit={handleSubmit} w="100%">
      <VStack spacing={4}>
        {errorMessage && (
          <Text color="red.500" fontSize="sm">
            {errorMessage}
          </Text>
        )}
        <FormControl isRequired>
          <FormLabel>Email</FormLabel>
          <Input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Votre email"
            bg="white"
            size="lg"
          />
        </FormControl>
        <FormControl isRequired>
          <FormLabel>Mot de passe</FormLabel>
          <InputGroup>
            <Input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              bg="white"
              size="lg"
            />
            <InputRightElement h="full">
              <IconButton
                aria-label={showPassword ? "Masquer" : "Afficher"}
                icon={showPassword ? <ViewOffIcon /> : <ViewIcon />}
                onClick={() => setShowPassword(!showPassword)}
                variant="ghost"
                size="sm"
              />
            </InputRightElement>
          </InputGroup>
        </FormControl>
        <Button
          type="submit"
          colorScheme="teal"
          width="100%"
          size="lg"
          isLoading={loading}
        >
          Se connecter
        </Button>
      </VStack>
    </Box>
  );
}
