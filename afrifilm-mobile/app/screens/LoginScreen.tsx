import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
  Animated,
  Dimensions,
} from "react-native";
import {
  Text,
  TextInput,
  Button,
  useTheme,
  Surface,
  Title,
  HelperText,
  Avatar,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useAuth } from "../hooks/useAuth";

const { width } = Dimensions.get("window");

export default function LoginScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { login, isLoading } = useAuth();

  // États pour l'animation
  const logoPosition = new Animated.Value(0);
  const formOpacity = new Animated.Value(0);
  const buttonScale = new Animated.Value(0.8);

  // États du formulaire
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  // Validation des champs
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Animation lors du montage du composant
  useEffect(() => {
    Animated.sequence([
      Animated.timing(logoPosition, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(formOpacity, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(buttonScale, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  // Gestion de la validation du formulaire
  const validateForm = () => {
    let isValid = true;

    if (!email) {
      setEmailError("L'email est requis");
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      setEmailError("L'email est invalide");
      isValid = false;
    } else {
      setEmailError("");
    }

    if (!password) {
      setPasswordError("Le mot de passe est requis");
      isValid = false;
    } else if (password.length < 6) {
      setPasswordError("Le mot de passe doit contenir au moins 6 caractères");
      isValid = false;
    } else {
      setPasswordError("");
    }

    return isValid;
  };

  // Gestion de la soumission du formulaire
  const handleLogin = async () => {
    setError("");
    if (!validateForm()) return;

    try {
      await login(email, password);
      router.replace("/screens/HomeScreen");
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message || "Échec de la connexion");
      } else {
        setError("Échec de la connexion. Veuillez réessayer.");
      }
    }
  };

  // Animations
  const logoTranslateY = logoPosition.interpolate({
    inputRange: [0, 1],
    outputRange: [-50, 0],
  });

  return (
    <View
      style={[styles.container, { backgroundColor: theme.colors.background }]}
    >
      <StatusBar style="light" />

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardAvoidContainer}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Logo et titre animés */}
          <Animated.View
            style={[
              styles.logoContainer,
              {
                transform: [{ translateY: logoTranslateY }],
                opacity: logoPosition,
              },
            ]}
          >
            <Avatar.Icon
              size={80}
              icon="movie"
              color="white"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Title style={[styles.appTitle, { color: theme.colors.primary }]}>
              AfriFilm
            </Title>
            <Text style={styles.tagline}>Le meilleur du cinéma africain</Text>
          </Animated.View>

          {/* Formulaire animé */}
          <Animated.View
            style={[
              styles.formContainer,
              {
                opacity: formOpacity,
                transform: [
                  {
                    translateY: formOpacity.interpolate({
                      inputRange: [0, 1],
                      outputRange: [20, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            <Surface style={styles.formSurface} elevation={4}>
              <Title style={styles.formTitle}>Connexion</Title>

              {error ? (
                <View style={styles.errorContainer}>
                  <MaterialCommunityIcons
                    name="alert-circle"
                    size={20}
                    color={theme.colors.error}
                  />
                  <Text
                    style={[styles.errorText, { color: theme.colors.error }]}
                  >
                    {error}
                  </Text>
                </View>
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
                left={<TextInput.Icon icon="email" />}
              />
              {emailError ? (
                <HelperText type="error" visible={!!emailError}>
                  {emailError}
                </HelperText>
              ) : null}

              <TextInput
                label="Mot de passe"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="outlined"
                error={!!passwordError}
                left={<TextInput.Icon icon="lock" />}
                right={
                  <TextInput.Icon
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                  />
                }
              />
              {passwordError ? (
                <HelperText type="error" visible={!!passwordError}>
                  {passwordError}
                </HelperText>
              ) : null}

              <TouchableOpacity
                style={styles.forgotPassword}
                onPress={() => router.push("/screens/ForgotPasswordScreen")}
              >
                <Text style={{ color: theme.colors.primary }}>
                  Mot de passe oublié ?
                </Text>
              </TouchableOpacity>

              <Animated.View
                style={[
                  styles.buttonContainer,
                  { transform: [{ scale: buttonScale }] },
                ]}
              >
                <Button
                  mode="contained"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  contentStyle={styles.buttonContent}
                  loading={isLoading}
                  disabled={isLoading}
                  labelStyle={styles.buttonLabel}
                >
                  Se connecter
                </Button>
              </Animated.View>

              <View style={styles.divider}>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
                <Text
                  style={[
                    styles.dividerText,
                    { color: theme.colors.onSurfaceVariant },
                  ]}
                >
                  ou
                </Text>
                <View
                  style={[
                    styles.dividerLine,
                    { backgroundColor: theme.colors.outlineVariant },
                  ]}
                />
              </View>

              <Button
                mode="outlined"
                icon="google"
                onPress={() => {}}
                style={styles.socialButton}
              >
                Continuer avec Google
              </Button>

              <View style={styles.registerContainer}>
                <Text style={styles.registerText}>Pas encore de compte ?</Text>
                <TouchableOpacity
                  onPress={() => router.push("/screens/RegisterScreen")}
                >
                  <Text
                    style={[
                      styles.registerLink,
                      { color: theme.colors.primary },
                    ]}
                  >
                    S'inscrire
                  </Text>
                </TouchableOpacity>
              </View>
            </Surface>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardAvoidContainer: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  appTitle: {
    fontSize: 36,
    fontWeight: "bold",
    marginTop: 10,
  },
  tagline: {
    marginTop: 5,
    fontSize: 16,
    opacity: 0.7,
  },
  formContainer: {
    width: "100%",
    maxWidth: 400,
    alignSelf: "center",
  },
  formSurface: {
    padding: 24,
    borderRadius: 12,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
  },
  errorText: {
    marginLeft: 10,
    flex: 1,
  },
  input: {
    marginBottom: 8,
  },
  forgotPassword: {
    alignSelf: "flex-end",
    marginVertical: 8,
  },
  buttonContainer: {
    marginTop: 8,
  },
  loginButton: {
    marginTop: 8,
    borderRadius: 4,
  },
  buttonContent: {
    height: 50,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: "bold",
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: 10,
  },
  socialButton: {
    marginVertical: 8,
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  registerText: {
    marginRight: 5,
  },
  registerLink: {
    fontWeight: "bold",
  },
});
