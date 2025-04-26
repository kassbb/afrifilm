import React, { useState } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  TouchableOpacity,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Surface,
  IconButton,
  Title,
  Caption,
  HelperText,
  Appbar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { StatusBar } from "expo-status-bar";

export default function ForgotPasswordScreen() {
  const theme = useTheme();
  const router = useRouter();

  // États
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  // Validation de l'email
  const validateEmail = () => {
    if (!email) {
      setEmailError("L'email est requis");
      return false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("L'email est invalide");
      return false;
    } else {
      setEmailError("");
      return true;
    }
  };

  // Gestion de la soumission du formulaire
  const handleResetPassword = async () => {
    setError("");
    if (!validateEmail()) return;

    setIsLoading(true);
    try {
      // Simuler une demande API pour la réinitialisation du mot de passe
      // En production, remplacez par un vrai appel API
      setTimeout(() => {
        setIsSent(true);
        setIsLoading(false);
      }, 1500);
    } catch (err) {
      setError("Une erreur s'est produite. Veuillez réessayer.");
      setIsLoading(false);
    }
  };

  return (
    <ImageBackground
      source={require("../../assets/bg.jpg")}
      style={styles.background}
    >
      <StatusBar style="light" />
      <LinearGradient
        colors={["rgba(0,0,0,0.7)", "rgba(0,0,0,0.9)"]}
        style={styles.overlay}
      >
        <Appbar.Header style={styles.appbar}>
          <Appbar.BackAction
            iconColor="white"
            onPress={() => router.push("/screens/LoginScreen")}
          />
          <Appbar.Content
            title="Mot de passe oublié"
            titleStyle={{ color: "white" }}
          />
        </Appbar.Header>

        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.header}>
              <Title style={styles.logo}>AfriFilm</Title>
              <Caption style={styles.tagline}>
                Réinitialisation de mot de passe
              </Caption>
            </View>

            <Surface style={styles.formContainer}>
              {!isSent ? (
                <>
                  <Text style={styles.description}>
                    Entrez votre adresse email et nous vous enverrons un lien
                    pour réinitialiser votre mot de passe.
                  </Text>

                  {error ? (
                    <HelperText type="error" visible={!!error}>
                      {error}
                    </HelperText>
                  ) : null}

                  <TextInput
                    label="Email"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                    style={styles.input}
                    mode="outlined"
                    error={!!emailError}
                  />
                  {emailError ? (
                    <HelperText type="error" visible={!!emailError}>
                      {emailError}
                    </HelperText>
                  ) : null}

                  <Button
                    mode="contained"
                    onPress={handleResetPassword}
                    style={styles.button}
                    loading={isLoading}
                    disabled={isLoading}
                  >
                    Envoyer le lien de réinitialisation
                  </Button>
                </>
              ) : (
                <View style={styles.successContainer}>
                  <IconButton
                    icon="check-circle"
                    size={60}
                    iconColor={theme.colors.primary}
                    style={styles.successIcon}
                  />
                  <Title style={styles.successTitle}>Email envoyé !</Title>
                  <Text style={styles.successText}>
                    Si un compte existe avec l'adresse {email}, vous recevrez
                    bientôt un email avec les instructions pour réinitialiser
                    votre mot de passe.
                  </Text>
                  <Button
                    mode="contained"
                    onPress={() => router.push("/screens/LoginScreen")}
                    style={styles.button}
                  >
                    Retour à la connexion
                  </Button>
                </View>
              )}

              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Vous avez retrouvé votre mot de passe ?
                </Text>
                <TouchableOpacity
                  onPress={() => router.push("/screens/LoginScreen")}
                >
                  <Text style={styles.loginLink}>Se connecter</Text>
                </TouchableOpacity>
              </View>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>
      </LinearGradient>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  overlay: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  appbar: {
    backgroundColor: "transparent",
    elevation: 0,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logo: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#FF6B00",
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  formContainer: {
    padding: 20,
    borderRadius: 10,
  },
  description: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: "center",
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 10,
    paddingVertical: 6,
  },
  successContainer: {
    alignItems: "center",
    padding: 16,
  },
  successIcon: {
    marginBottom: 16,
  },
  successTitle: {
    fontSize: 22,
    marginBottom: 16,
    textAlign: "center",
  },
  successText: {
    fontSize: 16,
    marginBottom: 24,
    textAlign: "center",
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
    flexWrap: "wrap",
  },
  loginText: {
    marginRight: 5,
  },
  loginLink: {
    color: "#FF6B00",
    fontWeight: "bold",
  },
});
