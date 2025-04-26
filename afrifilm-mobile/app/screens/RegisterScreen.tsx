import React, { useState, useRef, useEffect } from "react";
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
  Chip,
  Card,
  SegmentedButtons,
  ActivityIndicator,
  Divider,
} from "react-native-paper";
import { useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import * as ImagePicker from "expo-image-picker";
import { useAuth } from "../hooks/useAuth";
import { UserRole } from "../types";

const { width, height } = Dimensions.get("window");

// Options pour les genres de contenu (pour les créateurs)
const contentGenres = [
  { label: "Action", value: "action" },
  { label: "Drame", value: "drame" },
  { label: "Comédie", value: "comedie" },
  { label: "Documentaire", value: "documentaire" },
  { label: "Romance", value: "romance" },
  { label: "Animation", value: "animation" },
  { label: "Historique", value: "historique" },
];

// Interface pour notre document
interface IdentityDocument {
  name: string;
  uri: string;
  mimeType?: string;
  size?: number;
}

export default function RegisterScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { register, isLoading } = useAuth();

  // État pour le type d'utilisateur
  const [activeTab, setActiveTab] = useState("user");
  const [currentStep, setCurrentStep] = useState(1);

  // Animation pour les transitions entre les étapes
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // États pour l'animation
  useEffect(() => {
    Animated.sequence([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
    ]).start();
  }, [currentStep]);

  // États pour le formulaire commun
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [error, setError] = useState("");

  // États spécifiques aux créateurs
  const [bio, setBio] = useState("");
  const [portfolio, setPortfolio] = useState("");
  const [identityDocument, setIdentityDocument] =
    useState<IdentityDocument | null>(null);
  const [identityDocumentUploaded, setIdentityDocumentUploaded] =
    useState(false);

  // Validation des champs
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [termsError, setTermsError] = useState("");
  const [bioError, setBioError] = useState("");
  const [portfolioError, setPortfolioError] = useState("");
  const [identityDocumentError, setIdentityDocumentError] = useState("");

  // Validation du formulaire de base (commun aux deux types d'utilisateurs)
  const validateBaseForm = () => {
    let isValid = true;

    if (!name) {
      setNameError("Le nom est requis");
      isValid = false;
    } else if (name.length < 2) {
      setNameError("Le nom doit contenir au moins 2 caractères");
      isValid = false;
    } else {
      setNameError("");
    }

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

    if (!confirmPassword) {
      setConfirmPasswordError("La confirmation du mot de passe est requise");
      isValid = false;
    } else if (confirmPassword !== password) {
      setConfirmPasswordError("Les mots de passe ne correspondent pas");
      isValid = false;
    } else {
      setConfirmPasswordError("");
    }

    if (!acceptTerms) {
      setTermsError("Vous devez accepter les conditions d'utilisation");
      isValid = false;
    } else {
      setTermsError("");
    }

    return isValid;
  };

  // Validation du formulaire créateur
  const validateCreatorForm = () => {
    let isValid = true;

    if (!bio && activeTab === "creator") {
      setBioError("Une biographie est requise pour les créateurs");
      isValid = false;
    } else {
      setBioError("");
    }

    if (portfolio && !/^https?:\/\//.test(portfolio)) {
      setPortfolioError("Le lien du portfolio doit être une URL valide");
      isValid = false;
    } else {
      setPortfolioError("");
    }

    if (!identityDocumentUploaded && activeTab === "creator") {
      setIdentityDocumentError(
        "Une pièce d'identité est requise pour la vérification"
      );
      isValid = false;
    } else {
      setIdentityDocumentError("");
    }

    return isValid;
  };

  // Gestion de l'avancement dans le formulaire créateur
  const handleNextStep = () => {
    if (currentStep === 1 && validateBaseForm()) {
      setCurrentStep(2);
    } else if (currentStep === 2 && validateCreatorForm()) {
      setCurrentStep(3);
    }
  };

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Fonction pour sélectionner un document (pièce d'identité)
  const pickDocument = async () => {
    try {
      // Demander la permission (spécifiquement sur iOS)
      if (Platform.OS !== "web") {
        const { status } =
          await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          setError(
            "Nous avons besoin des permissions pour accéder à vos photos"
          );
          return;
        }
      }

      // Tenter d'abord avec DocumentPicker
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: ["image/*", "application/pdf"],
          copyToCacheDirectory: true,
        });

        if (!result.canceled) {
          const document: IdentityDocument = {
            name: result.assets[0].name || "document.pdf",
            uri: result.assets[0].uri,
            mimeType: result.assets[0].mimeType,
            size: result.assets[0].size,
          };
          setIdentityDocument(document);
          setIdentityDocumentUploaded(true);
          setIdentityDocumentError("");
        }
      } catch (docError) {
        // Si DocumentPicker échoue, essayer avec ImagePicker
        try {
          const imageResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: true,
            aspect: [4, 3],
            quality: 0.8,
          });

          if (!imageResult.canceled) {
            const document: IdentityDocument = {
              name: "identity_document.jpg",
              uri: imageResult.assets[0].uri,
              mimeType: "image/jpeg",
              size: imageResult.assets[0].fileSize,
            };
            setIdentityDocument(document);
            setIdentityDocumentUploaded(true);
            setIdentityDocumentError("");
          }
        } catch (imgError) {
          console.error("Impossible de sélectionner l'image:", imgError);
          setError("Impossible de sélectionner l'image. Veuillez réessayer.");
        }
      }
    } catch (error) {
      console.error("Erreur lors de la sélection du document:", error);
      setError("Impossible de sélectionner le document. Veuillez réessayer.");
    }
  };

  // Gestion de la soumission du formulaire
  const handleRegister = async () => {
    setError("");

    if (activeTab === "user") {
      if (!validateBaseForm()) return;

      try {
        await register(name, email, password, UserRole.USER);
        router.replace("/screens/HomeScreen");
      } catch (err) {
        if (err instanceof Error) {
          setError(err.message || "Échec de l'inscription");
        } else {
          setError("Échec de l'inscription. Veuillez réessayer.");
        }
      }
    } else {
      // Pour les créateurs, valider toutes les étapes
      if (currentStep === 3) {
        if (!validateCreatorForm()) {
          setCurrentStep(2); // Retourner à l'étape du profil si validation échoue
          return;
        }

        try {
          // Créer un objet FormData pour l'upload de fichier si nécessaire
          const formData = new FormData();

          if (identityDocument) {
            // Ajouter le document à FormData
            // @ts-ignore - TypeScript ne comprend pas bien FormData avec les fichiers
            formData.append("identityDocument", {
              uri: identityDocument.uri,
              name: identityDocument.name,
              type: identityDocument.mimeType || "application/octet-stream",
            });
          }

          // Ajouter les autres données du formulaire
          formData.append("name", name);
          formData.append("email", email);
          formData.append("password", password);
          formData.append("role", UserRole.CREATOR);
          formData.append("bio", bio);
          if (portfolio) formData.append("portfolio", portfolio);

          // Pour le moment, nous n'utilisons pas formData car l'API back-end n'est pas configurée
          // Nous utilisons juste la fonction register existante
          await register(
            name,
            email,
            password,
            UserRole.CREATOR
            // Ces informations supplémentaires seraient normalement envoyées à l'API
            // dans formData si l'API était prête pour ça
          );
          router.replace("/screens/HomeScreen");
        } catch (err) {
          if (err instanceof Error) {
            setError(err.message || "Échec de l'inscription");
          } else {
            setError("Échec de l'inscription. Veuillez réessayer.");
          }
        }
      } else {
        handleNextStep();
      }
    }
  };

  // Rendu du formulaire de base (étape 1 pour les créateurs)
  const renderBaseForm = () => (
    <View style={styles.formStep}>
      <TextInput
        label="Nom complet"
        value={name}
        onChangeText={setName}
        style={styles.input}
        mode="outlined"
        error={!!nameError}
        left={<TextInput.Icon icon="account" />}
      />
      {nameError ? (
        <HelperText type="error" visible={!!nameError}>
          {nameError}
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

      <TextInput
        label="Confirmer le mot de passe"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry={!showPassword}
        style={styles.input}
        mode="outlined"
        error={!!confirmPasswordError}
        left={<TextInput.Icon icon="lock-check" />}
      />
      {confirmPasswordError ? (
        <HelperText type="error" visible={!!confirmPasswordError}>
          {confirmPasswordError}
        </HelperText>
      ) : null}

      <View style={styles.termsContainer}>
        <TouchableOpacity
          style={styles.checkbox}
          onPress={() => setAcceptTerms(!acceptTerms)}
        >
          <MaterialCommunityIcons
            name={acceptTerms ? "checkbox-marked" : "checkbox-blank-outline"}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
        <Text style={styles.termsText}>
          J'accepte les{" "}
          <Text
            style={[styles.termsLink, { color: theme.colors.primary }]}
            onPress={() => router.push("/screens/TermsScreen")}
          >
            conditions d'utilisation
          </Text>
        </Text>
      </View>
      {termsError ? (
        <HelperText type="error" visible={!!termsError}>
          {termsError}
        </HelperText>
      ) : null}
    </View>
  );

  // Rendu du formulaire de profil créateur (étape 2)
  const renderCreatorProfileForm = () => (
    <View style={styles.formStep}>
      <Title style={styles.stepTitle}>Profil Créateur</Title>
      <Text style={styles.stepDescription}>
        Votre profil sera vérifié par notre équipe avant activation.
      </Text>

      <TextInput
        label="Biographie / Présentation"
        value={bio}
        onChangeText={setBio}
        style={[styles.input, styles.multilineInput]}
        mode="outlined"
        multiline
        numberOfLines={4}
        left={<TextInput.Icon icon="text-box" />}
        error={!!bioError}
        placeholder="Présentez-vous en quelques lignes..."
      />
      {bioError ? (
        <HelperText type="error" visible={!!bioError}>
          {bioError}
        </HelperText>
      ) : null}

      <TextInput
        label="Lien portfolio (optionnel)"
        value={portfolio}
        onChangeText={setPortfolio}
        keyboardType="url"
        style={styles.input}
        mode="outlined"
        error={!!portfolioError}
        left={<TextInput.Icon icon="web" />}
        placeholder="https://votre-portfolio.com"
      />
      {portfolioError ? (
        <HelperText type="error" visible={!!portfolioError}>
          {portfolioError}
        </HelperText>
      ) : null}

      <Button
        mode="outlined"
        icon="file-document-outline"
        onPress={pickDocument}
        style={styles.documentButton}
      >
        {identityDocumentUploaded
          ? "Pièce d'identité téléchargée"
          : "Télécharger une pièce d'identité"}
      </Button>
      {identityDocument && (
        <Text style={styles.documentSelected}>
          Document sélectionné: {identityDocument.name}
        </Text>
      )}
      <Text style={styles.documentInfo}>
        Format accepté: JPG, PNG ou PDF (max 5MB)
      </Text>
      {identityDocumentError ? (
        <HelperText type="error" visible={!!identityDocumentError}>
          {identityDocumentError}
        </HelperText>
      ) : null}
    </View>
  );

  // Rendu du formulaire de confirmation (étape 3)
  const renderContentGenresForm = () => (
    <View style={styles.formStep}>
      <Title style={styles.stepTitle}>Confirmation</Title>
      <Text style={styles.stepDescription}>
        Vérifiez vos informations avant de finaliser l'inscription
      </Text>

      <Card style={styles.summaryCard}>
        <Card.Title title="Résumé de votre profil" />
        <Card.Content>
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Nom : </Text>
            {name}
          </Text>
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Email : </Text>
            {email}
          </Text>
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Portfolio : </Text>
            {portfolio || "Non spécifié"}
          </Text>
          <Text style={styles.summaryItem}>
            <Text style={styles.summaryLabel}>Pièce d'identité : </Text>
            {identityDocumentUploaded ? "Téléchargée" : "Non fournie"}
          </Text>
          <Divider style={styles.divider} />
          <Text style={styles.verificationNote}>
            Votre compte sera examiné par notre équipe avant d'être activé. Nous
            vérifierons votre identité et vos informations professionnelles.
          </Text>
        </Card.Content>
      </Card>
    </View>
  );

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
          {/* En-tête */}
          <View style={styles.header}>
            <Avatar.Icon
              size={80}
              icon="account-plus"
              color="white"
              style={{ backgroundColor: theme.colors.primary }}
            />
            <Title style={[styles.appTitle, { color: theme.colors.primary }]}>
              Créer un compte
            </Title>
          </View>

          {/* Tabs pour choisir le type d'utilisateur */}
          <SegmentedButtons
            value={activeTab}
            onValueChange={(value) => {
              setActiveTab(value);
              setCurrentStep(1);
            }}
            style={styles.segmentedButtons}
            buttons={[
              {
                value: "user",
                label: "Spectateur",
                icon: "account",
              },
              {
                value: "creator",
                label: "Créateur",
                icon: "video",
              },
            ]}
          />

          {error ? (
            <View style={styles.errorContainer}>
              <MaterialCommunityIcons
                name="alert-circle"
                size={20}
                color={theme.colors.error}
              />
              <Text style={[styles.errorText, { color: theme.colors.error }]}>
                {error}
              </Text>
            </View>
          ) : null}

          <Surface style={styles.formSurface} elevation={4}>
            {activeTab === "user" ? (
              // Formulaire utilisateur simple
              renderBaseForm()
            ) : (
              // Formulaire créateur à plusieurs étapes
              <Animated.View
                style={[
                  styles.formContainer,
                  {
                    opacity: fadeAnim,
                  },
                ]}
              >
                {currentStep === 1 && renderBaseForm()}
                {currentStep === 2 && renderCreatorProfileForm()}
                {currentStep === 3 && renderContentGenresForm()}

                {/* Indicateur d'étape pour les créateurs */}
                <View style={styles.stepsIndicator}>
                  {[1, 2, 3].map((step) => (
                    <View
                      key={step}
                      style={[
                        styles.stepDot,
                        {
                          backgroundColor:
                            currentStep >= step
                              ? theme.colors.primary
                              : theme.colors.outlineVariant,
                        },
                      ]}
                    />
                  ))}
                </View>
              </Animated.View>
            )}

            {/* Boutons de navigation */}
            <View style={styles.buttonContainer}>
              {activeTab === "creator" && currentStep > 1 && (
                <Button
                  mode="outlined"
                  onPress={handlePreviousStep}
                  style={styles.navigationButton}
                  icon="arrow-left"
                >
                  Précédent
                </Button>
              )}

              <Button
                mode="contained"
                onPress={activeTab === "user" ? handleRegister : handleRegister}
                style={[
                  styles.registerButton,
                  activeTab === "creator" && currentStep > 1
                    ? styles.navigationButton
                    : null,
                ]}
                loading={isLoading}
                disabled={isLoading}
              >
                {activeTab === "user"
                  ? "S'inscrire"
                  : currentStep < 3
                  ? "Continuer"
                  : "S'inscrire"}
              </Button>
            </View>
          </Surface>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Déjà un compte ?</Text>
            <TouchableOpacity
              onPress={() => router.push("/screens/LoginScreen")}
            >
              <Text style={[styles.loginLink, { color: theme.colors.primary }]}>
                Se connecter
              </Text>
            </TouchableOpacity>
          </View>
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
    padding: 16,
  },
  header: {
    alignItems: "center",
    marginVertical: 20,
  },
  appTitle: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 10,
  },
  segmentedButtons: {
    marginBottom: 20,
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
  formSurface: {
    padding: 24,
    borderRadius: 12,
  },
  formContainer: {
    width: "100%",
  },
  multiStepFormContainer: {
    width: width - 48 - 48, // Account for container padding and surface padding
    overflow: "hidden",
  },
  stepsContainer: {
    flexDirection: "row",
    width: (width - 48 - 48) * 3, // 3 steps, each with width of container
  },
  formStep: {
    width: "100%",
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  stepDescription: {
    marginBottom: 20,
    fontSize: 14,
    opacity: 0.7,
  },
  stepsIndicator: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  stepDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  input: {
    marginBottom: 12,
  },
  multilineInput: {
    height: 100,
  },
  termsContainer: {
    flexDirection: "row",
    marginVertical: 15,
    alignItems: "center",
  },
  checkbox: {
    marginRight: 10,
  },
  termsText: {
    flex: 1,
  },
  termsLink: {
    fontWeight: "bold",
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navigationButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  registerButton: {
    flex: 1,
  },
  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  loginText: {
    marginRight: 5,
  },
  loginLink: {
    fontWeight: "bold",
  },
  genresContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginVertical: 10,
  },
  genreChip: {
    margin: 4,
  },
  summaryCard: {
    marginTop: 20,
  },
  summaryItem: {
    marginBottom: 5,
  },
  summaryLabel: {
    fontWeight: "bold",
  },
  documentButton: {
    marginTop: 10,
    marginBottom: 5,
  },
  documentInfo: {
    fontSize: 12,
    opacity: 0.7,
    marginBottom: 15,
  },
  divider: {
    marginVertical: 10,
  },
  verificationNote: {
    fontSize: 12,
    fontStyle: "italic",
    opacity: 0.8,
    marginTop: 5,
  },
  documentSelected: {
    fontSize: 12,
    fontStyle: "italic",
    marginTop: 5,
    color: "green",
  },
});
