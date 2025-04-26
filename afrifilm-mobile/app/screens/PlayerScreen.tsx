import React, { useState, useRef, useEffect } from "react";
import {
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  StatusBar,
  Platform,
  SafeAreaView,
  ActivityIndicator as RNActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Video, ResizeMode } from "expo-av";
import { Ionicons } from "@expo/vector-icons";
import {
  Text,
  IconButton,
  ProgressBar,
  useTheme,
  ActivityIndicator,
  Button,
} from "react-native-paper";
import Slider from "@react-native-community/slider";
import * as ScreenOrientation from "expo-screen-orientation";

const { width, height } = Dimensions.get("window");

// Fonction utilitaire pour formater le temps (en millisecondes) au format mm:ss
const formatTime = (timeMs: number) => {
  const totalSeconds = Math.floor(timeMs / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
};

export default function PlayerScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const theme = useTheme();
  const { mediaId, title } = params;

  // Références et états
  const videoRef = useRef<Video>(null);
  const [status, setStatus] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Effet pour gérer l'orientation de l'écran
  useEffect(() => {
    const lockOrientation = async () => {
      if (isFullscreen) {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.LANDSCAPE
        );
      } else {
        await ScreenOrientation.lockAsync(
          ScreenOrientation.OrientationLock.PORTRAIT
        );
      }
    };

    lockOrientation();

    // Nettoyer les verrous d'orientation lors du démontage
    return () => {
      ScreenOrientation.unlockAsync();
    };
  }, [isFullscreen]);

  // Effet pour masquer automatiquement les contrôles après un certain temps
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (showControls && !status.isPlaying) {
      timer = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [showControls, status.isPlaying]);

  // Gérer le chargement de la vidéo
  const handleLoad = (status: any) => {
    setIsLoading(false);
    setStatus(status);
  };

  // Gérer les erreurs de lecture
  const handleError = (error: string) => {
    setIsLoading(false);
    setError(error);
  };

  // Basculer la lecture/pause
  const togglePlayback = async () => {
    if (videoRef.current) {
      if (status.isPlaying) {
        await videoRef.current.pauseAsync();
      } else {
        await videoRef.current.playAsync();
      }
    }
  };

  // Naviguer 10 secondes en avant
  const seekForward = async () => {
    if (videoRef.current && status.positionMillis) {
      const newPosition = status.positionMillis + 10000; // 10 secondes
      await videoRef.current.setPositionAsync(
        Math.min(newPosition, status.durationMillis || 0)
      );
    }
  };

  // Naviguer 10 secondes en arrière
  const seekBackward = async () => {
    if (videoRef.current && status.positionMillis) {
      const newPosition = status.positionMillis - 10000; // 10 secondes
      await videoRef.current.setPositionAsync(Math.max(newPosition, 0));
    }
  };

  // Basculer en mode plein écran
  const toggleFullscreen = async () => {
    setIsFullscreen(!isFullscreen);
  };

  // Basculer l'affichage des contrôles
  const toggleControls = () => {
    setShowControls(!showControls);
  };

  // Gérer les changements de curseur de la vidéo
  const handleSliderValueChange = async (value: number) => {
    if (videoRef.current) {
      await videoRef.current.setPositionAsync(value);
    }
  };

  // Quitter le lecteur
  const handleBack = async () => {
    await ScreenOrientation.lockAsync(
      ScreenOrientation.OrientationLock.PORTRAIT
    );
    router.back();
  };

  // URL de la vidéo de démonstration (à remplacer par l'URL réelle)
  // Cette URL pointe vers une vidéo Creative Commons pour les tests
  const videoUrl =
    "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4";

  // Si une erreur est survenue
  if (error) {
    return (
      <SafeAreaView
        style={[
          styles.errorContainer,
          { backgroundColor: theme.colors.background },
        ]}
      >
        <Ionicons name="alert-circle" size={64} color={theme.colors.error} />
        <Text style={[styles.errorText, { color: theme.colors.onBackground }]}>
          Impossible de charger la vidéo
        </Text>
        <Text
          style={[
            styles.errorSubtext,
            { color: theme.colors.onSurfaceVariant },
          ]}
        >
          {error}
        </Text>
        <Button
          mode="contained"
          onPress={handleBack}
          style={[
            styles.errorButton,
            { backgroundColor: theme.colors.primary },
          ]}
        >
          Retour
        </Button>
      </SafeAreaView>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: "#000000" }]}>
      <StatusBar hidden={isFullscreen} />

      {/* Vidéo */}
      <TouchableOpacity
        activeOpacity={1}
        style={styles.videoContainer}
        onPress={toggleControls}
      >
        <Video
          ref={videoRef}
          style={isFullscreen ? styles.fullscreenVideo : styles.video}
          source={{ uri: videoUrl }}
          resizeMode={ResizeMode.CONTAIN}
          onLoad={handleLoad}
          onError={() => handleError("Erreur de lecture")}
          onPlaybackStatusUpdate={setStatus}
          shouldPlay={false}
          useNativeControls={false}
        />

        {/* Indicateur de chargement */}
        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator animating size="large" color="#FFFFFF" />
          </View>
        )}

        {/* Contrôles de lecture */}
        {showControls && (
          <View style={styles.controlsOverlay}>
            {/* Bouton de retour */}
            <View style={styles.headerControls}>
              <IconButton
                icon="arrow-left"
                iconColor="#FFFFFF"
                size={24}
                onPress={handleBack}
                style={styles.backButton}
              />
              <Text style={styles.videoTitle} numberOfLines={1}>
                {title as string}
              </Text>
            </View>

            {/* Contrôles principaux */}
            <View style={styles.mainControls}>
              <IconButton
                icon="rewind-10"
                iconColor="#FFFFFF"
                size={32}
                onPress={seekBackward}
              />
              <IconButton
                icon={status.isPlaying ? "pause" : "play"}
                iconColor="#FFFFFF"
                size={48}
                onPress={togglePlayback}
                style={styles.playButton}
              />
              <IconButton
                icon="fast-forward-10"
                iconColor="#FFFFFF"
                size={32}
                onPress={seekForward}
              />
            </View>

            {/* Contrôles inférieurs */}
            <View style={styles.bottomControls}>
              <Text style={styles.timeText}>
                {status.positionMillis
                  ? formatTime(status.positionMillis)
                  : "0:00"}
              </Text>
              <Slider
                style={styles.progressSlider}
                minimumValue={0}
                maximumValue={status.durationMillis || 1}
                value={status.positionMillis || 0}
                onValueChange={handleSliderValueChange}
                minimumTrackTintColor="#FF6B00"
                maximumTrackTintColor="rgba(255, 255, 255, 0.3)"
                thumbTintColor="#FF6B00"
              />
              <Text style={styles.timeText}>
                {status.durationMillis
                  ? formatTime(status.durationMillis)
                  : "0:00"}
              </Text>
              <IconButton
                icon={isFullscreen ? "fullscreen-exit" : "fullscreen"}
                iconColor="#FFFFFF"
                size={24}
                onPress={toggleFullscreen}
              />
            </View>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  videoContainer: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: width * 0.5625, // 16:9 aspect ratio
  },
  fullscreenVideo: {
    width: "100%",
    height: "100%",
  },
  loadingContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  controlsOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "space-between",
    padding: 16,
  },
  headerControls: {
    flexDirection: "row",
    alignItems: "center",
  },
  backButton: {
    marginRight: 16,
  },
  videoTitle: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
    flex: 1,
  },
  mainControls: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  playButton: {
    backgroundColor: "rgba(255, 107, 0, 0.7)",
    borderRadius: 30,
    marginHorizontal: 20,
  },
  bottomControls: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Platform.OS === "ios" ? 20 : 0,
  },
  progressSlider: {
    flex: 1,
    height: 40,
    marginHorizontal: 8,
  },
  timeText: {
    color: "#FFFFFF",
    fontSize: 12,
    width: 40,
    textAlign: "center",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 16,
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    marginTop: 8,
    textAlign: "center",
    marginBottom: 24,
  },
  errorButton: {
    marginTop: 16,
  },
});
