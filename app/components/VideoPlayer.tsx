"use client";

import {
  Box,
  IconButton,
  Slider,
  SliderTrack,
  SliderFilledTrack,
  SliderThumb,
  HStack,
  Text,
  VStack,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  useColorModeValue,
  Flex,
  Spinner,
  Badge,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
  FiSettings,
  FiDownload,
  FiRotateCcw,
  FiRotateCw,
  FiChevronsLeft,
  FiChevronsRight,
  FiSkipBack,
  FiSkipForward,
} from "react-icons/fi";

interface VideoPlayerProps {
  videoUrl: string;
  thumbnailUrl?: string;
  title?: string;
  onEnded?: () => void;
  showDownload?: boolean;
}

export default function VideoPlayer({
  videoUrl,
  thumbnailUrl,
  title,
  onEnded,
  showDownload = true,
}: VideoPlayerProps) {
  // Refs
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const bufferingTimerRef = useRef<NodeJS.Timeout>();

  // État du lecteur
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [isBuffering, setIsBuffering] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [isLargeScreen, setIsLargeScreen] = useState(true);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showShortcuts, setShowShortcuts] = useState(false);

  const toast = useToast();
  const bgColor = useColorModeValue("blackAlpha.800", "blackAlpha.900");
  const textColor = useColorModeValue("white", "white");

  // Détecter la taille de l'écran pour adapter l'UI
  useEffect(() => {
    const handleResize = () => {
      setIsLargeScreen(window.innerWidth >= 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Surveiller le changement d'état du plein écran
  useEffect(() => {
    const handleFullScreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullScreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullScreenChange);
    };
  }, []);

  // Initialiser le lecteur vidéo
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    console.log("VideoPlayer initialisé avec URL:", videoUrl);
    setIsLoading(true);
    setVideoError(null);

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
      console.log("Métadonnées vidéo chargées, durée:", video.duration);
      setIsLoading(false);
      // Démarrer automatiquement la lecture
      try {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => {
              console.log("Lecture démarrée automatiquement");
              setIsPlaying(true);
              setIsBuffering(false);
            })
            .catch((err) => {
              console.error("Erreur lors du démarrage automatique:", err);
              // La lecture automatique n'est pas autorisée
              setIsPlaying(false);
              setIsBuffering(false);
            });
        }
      } catch (err) {
        console.error("Erreur lors de la tentative de lecture:", err);
        setIsBuffering(false);
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    const handleProgress = () => {
      if (video.buffered.length > 0) {
        // Si nous avons des données buffered, nous ne sommes plus en bufferisation
        if (isBuffering && video.buffered.end(0) > video.currentTime + 3) {
          setIsBuffering(false);
        }
      }
    };

    const handleWaiting = () => {
      // Éviter les flashs de l'indicateur de bufferisation pour de courts délais
      bufferingTimerRef.current = setTimeout(() => {
        setIsBuffering(true);
      }, 500);
    };

    const handlePlaying = () => {
      if (bufferingTimerRef.current) {
        clearTimeout(bufferingTimerRef.current);
      }
      setIsBuffering(false);
      setIsLoading(false);
    };

    const handleError = (e: Event) => {
      console.error("Erreur de chargement de la vidéo:", e, video.error);
      let errorMessage = "Erreur de chargement de la vidéo";

      if (video.error) {
        switch (video.error.code) {
          case 1:
            errorMessage = "Opération annulée";
            break;
          case 2:
            errorMessage = "Erreur réseau";
            break;
          case 3:
            errorMessage = "Format non supporté";
            break;
          case 4:
            errorMessage = "Contenu non disponible ou protégé";
            break;
        }
      }

      setVideoError(errorMessage);
      setIsLoading(false);
      setIsBuffering(false);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      if (onEnded) onEnded();
    };

    // Raccourcis clavier
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          togglePlay();
          break;
        case "ArrowRight":
          e.preventDefault();
          skip(10);
          break;
        case "ArrowLeft":
          e.preventDefault();
          skip(-10);
          break;
        case "f":
          e.preventDefault();
          toggleFullscreen();
          break;
        case "m":
          e.preventDefault();
          toggleMute();
          break;
        case "?":
          e.preventDefault();
          setShowShortcuts((prev) => !prev);
          break;
        case "0":
        case "1":
        case "2":
        case "3":
        case "4":
        case "5":
        case "6":
        case "7":
        case "8":
        case "9":
          e.preventDefault();
          if (video && duration) {
            const percent = parseInt(e.key) * 10;
            video.currentTime = (duration * percent) / 100;
          }
          break;
      }
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("progress", handleProgress);
    video.addEventListener("waiting", handleWaiting);
    video.addEventListener("playing", handlePlaying);
    video.addEventListener("error", handleError);
    video.addEventListener("ended", handleEnded);
    document.addEventListener("keydown", handleKeyDown);

    // Définir le volume initial
    video.volume = volume;

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("progress", handleProgress);
      video.removeEventListener("waiting", handleWaiting);
      video.removeEventListener("playing", handlePlaying);
      video.removeEventListener("error", handleError);
      video.removeEventListener("ended", handleEnded);
      document.removeEventListener("keydown", handleKeyDown);

      if (bufferingTimerRef.current) {
        clearTimeout(bufferingTimerRef.current);
      }
    };
  }, [videoUrl, volume, isBuffering, onEnded]);

  // Mettre à jour la vitesse de lecture quand elle change
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  // Actions du lecteur
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.error("Erreur lors de la lecture:", error);
          });
        }
      }
      setIsPlaying(!isPlaying);
    }
  };

  const skip = (seconds: number) => {
    if (videoRef.current) {
      const newTime = videoRef.current.currentTime + seconds;
      videoRef.current.currentTime = Math.max(0, Math.min(newTime, duration));
    }
  };

  const handleTimeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.currentTime = value;
      setCurrentTime(value);
    }
  };

  const handleVolumeChange = (value: number) => {
    if (videoRef.current) {
      videoRef.current.volume = value;
      setVolume(value);
      setIsMuted(value === 0);
    }
  };

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen().catch((err) => {
        console.error("Erreur lors du passage en plein écran:", err);
      });
    } else {
      document.exitFullscreen().catch((err) => {
        console.error("Erreur lors de la sortie du plein écran:", err);
      });
    }
  };

  const changePlaybackRate = (rate: number) => {
    setPlaybackRate(rate);
    if (videoRef.current) {
      videoRef.current.playbackRate = rate;
    }
  };

  const downloadVideo = () => {
    // Créer un lien temporaire pour télécharger la vidéo
    const a = document.createElement("a");
    a.href = videoUrl;
    a.download = title || "video";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast({
      title: "Téléchargement démarré",
      description: "Votre vidéo est en cours de téléchargement",
      status: "success",
      duration: 3000,
      isClosable: true,
    });
  };

  const formatTime = (time: number) => {
    const hours = Math.floor(time / 3600);
    const minutes = Math.floor((time % 3600) / 60);
    const seconds = Math.floor(time % 60);

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`;
    }
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }

    if (isPlaying) {
      controlsTimeoutRef.current = setTimeout(() => {
        setShowControls(false);
      }, 3000);
    }
  };

  return (
    <Box
      ref={containerRef}
      position="relative"
      w="full"
      h="full"
      bg="black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      onClick={() => setShowControls(true)}
      tabIndex={0}
      borderRadius="md"
      overflow="hidden"
    >
      {/* Interface d'erreur */}
      {videoError ? (
        <Flex
          height="100%"
          direction="column"
          align="center"
          justify="center"
          color="red.500"
          p={4}
          bg="gray.900"
        >
          <Text fontSize="lg" fontWeight="bold" mb={2}>
            {videoError}
          </Text>
          <Text fontSize="sm" mb={4}>
            URL: {videoUrl}
          </Text>
          <Button
            colorScheme="red"
            size="sm"
            onClick={() => window.open(videoUrl, "_blank")}
          >
            Essayer dans un nouvel onglet
          </Button>
        </Flex>
      ) : (
        <>
          {/* Écran de chargement */}
          {isLoading && (
            <Flex
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.700"
              zIndex={5}
              justify="center"
              align="center"
              flexDirection="column"
            >
              <Spinner size="xl" color="white" mb={4} />
              <Text color="white">Chargement de la vidéo...</Text>
            </Flex>
          )}

          {/* Indicateur de mise en mémoire tampon */}
          {isBuffering && !isLoading && (
            <Flex
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              bg="blackAlpha.700"
              borderRadius="full"
              p={4}
              zIndex={5}
            >
              <Spinner size="lg" color="white" />
            </Flex>
          )}

          {/* Élément vidéo */}
          <video
            ref={videoRef}
            src={videoUrl}
            style={{ width: "100%", height: "100%", objectFit: "contain" }}
            onEnded={onEnded}
            poster={thumbnailUrl}
            playsInline
            controls={false}
            onClick={(e) => {
              e.stopPropagation();
              togglePlay();
            }}
          />

          {/* Bouton central de lecture/pause */}
          {showControls && !isLoading && (
            <IconButton
              aria-label={isPlaying ? "Pause" : "Play"}
              icon={isPlaying ? <FiPause size={40} /> : <FiPlay size={40} />}
              position="absolute"
              top="50%"
              left="50%"
              transform="translate(-50%, -50%)"
              fontSize="3xl"
              size="lg"
              isRound
              colorScheme="blackAlpha"
              bg="blackAlpha.700"
              _hover={{ bg: "blackAlpha.800" }}
              onClick={togglePlay}
              zIndex={4}
            />
          )}

          {/* Aide des raccourcis clavier */}
          {showShortcuts && (
            <Flex
              position="absolute"
              top={0}
              left={0}
              right={0}
              bottom={0}
              bg="blackAlpha.900"
              zIndex={10}
              justify="center"
              align="center"
              padding={5}
              onClick={() => setShowShortcuts(false)}
            >
              <VStack spacing={3} align="start" maxW="400px">
                <Text color="white" fontSize="xl" fontWeight="bold" mb={2}>
                  Raccourcis clavier
                </Text>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    Espace/K:
                  </Text>
                  <Text color="white">Lecture/Pause</Text>
                </HStack>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    Flèche gauche:
                  </Text>
                  <Text color="white">Reculer de 10s</Text>
                </HStack>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    Flèche droite:
                  </Text>
                  <Text color="white">Avancer de 10s</Text>
                </HStack>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    M:
                  </Text>
                  <Text color="white">Couper/Activer le son</Text>
                </HStack>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    F:
                  </Text>
                  <Text color="white">Plein écran</Text>
                </HStack>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    0-9:
                  </Text>
                  <Text color="white">Aller à x% de la vidéo</Text>
                </HStack>
                <HStack>
                  <Text color="gray.300" fontWeight="bold">
                    ?:
                  </Text>
                  <Text color="white">Afficher/Masquer les raccourcis</Text>
                </HStack>
                <Button
                  mt={4}
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowShortcuts(false);
                  }}
                >
                  Fermer
                </Button>
              </VStack>
            </Flex>
          )}

          {/* Contrôles vidéo */}
          {showControls && !videoError && (
            <Box
              position="absolute"
              bottom={0}
              left={0}
              right={0}
              bg={bgColor}
              p={isLargeScreen ? 4 : 2}
              transition="opacity 0.3s"
              zIndex={3}
            >
              {/* Barre de progression */}
              <Box position="relative" mb={2}>
                <Slider
                  value={currentTime}
                  min={0}
                  max={duration || 1}
                  onChange={handleTimeChange}
                  focusThumbOnChange={false}
                >
                  <SliderTrack bg="gray.700" h="8px" borderRadius="full">
                    <SliderFilledTrack bg="red.500" />
                  </SliderTrack>
                  <SliderThumb boxSize={4} />
                </Slider>
              </Box>

              {isLargeScreen ? (
                // Interface Bureau
                <HStack justify="space-between" align="center">
                  <HStack spacing={4}>
                    {/* Contrôles de lecture */}
                    <IconButton
                      aria-label="Reculer 10s"
                      icon={<FiRotateCcw />}
                      onClick={() => skip(-10)}
                      variant="ghost"
                      color={textColor}
                      size="sm"
                      _hover={{ bg: "whiteAlpha.200" }}
                    />
                    <IconButton
                      aria-label={isPlaying ? "Pause" : "Play"}
                      icon={isPlaying ? <FiPause /> : <FiPlay />}
                      onClick={togglePlay}
                      variant="ghost"
                      color={textColor}
                      _hover={{ bg: "whiteAlpha.200" }}
                    />
                    <IconButton
                      aria-label="Avancer 10s"
                      icon={<FiRotateCw />}
                      onClick={() => skip(10)}
                      variant="ghost"
                      color={textColor}
                      size="sm"
                      _hover={{ bg: "whiteAlpha.200" }}
                    />

                    {/* Affichage du temps */}
                    <Text color={textColor} fontSize="sm">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </Text>
                  </HStack>

                  <HStack spacing={3}>
                    {/* Contrôle du volume */}
                    <HStack spacing={2}>
                      <IconButton
                        aria-label={
                          isMuted ? "Activer le son" : "Couper le son"
                        }
                        icon={isMuted ? <FiVolumeX /> : <FiVolume2 />}
                        onClick={toggleMute}
                        variant="ghost"
                        color={textColor}
                        _hover={{ bg: "whiteAlpha.200" }}
                      />
                      <Slider
                        value={isMuted ? 0 : volume}
                        min={0}
                        max={1}
                        step={0.1}
                        onChange={handleVolumeChange}
                        w="80px"
                      >
                        <SliderTrack bg="gray.700">
                          <SliderFilledTrack bg="red.500" />
                        </SliderTrack>
                        <SliderThumb boxSize={3} />
                      </Slider>
                    </HStack>

                    {/* Vitesse de lecture */}
                    <Menu closeOnSelect>
                      <Tooltip label="Vitesse de lecture" placement="top">
                        <MenuButton
                          as={Button}
                          variant="ghost"
                          color={textColor}
                          size="sm"
                          _hover={{ bg: "whiteAlpha.200" }}
                          leftIcon={<FiSettings />}
                        >
                          {playbackRate}x
                        </MenuButton>
                      </Tooltip>
                      <MenuList>
                        <MenuItem onClick={() => changePlaybackRate(0.5)}>
                          0.5x
                        </MenuItem>
                        <MenuItem onClick={() => changePlaybackRate(0.75)}>
                          0.75x
                        </MenuItem>
                        <MenuItem onClick={() => changePlaybackRate(1)}>
                          1x (Normal)
                        </MenuItem>
                        <MenuItem onClick={() => changePlaybackRate(1.25)}>
                          1.25x
                        </MenuItem>
                        <MenuItem onClick={() => changePlaybackRate(1.5)}>
                          1.5x
                        </MenuItem>
                        <MenuItem onClick={() => changePlaybackRate(2)}>
                          2x
                        </MenuItem>
                      </MenuList>
                    </Menu>

                    {/* Téléchargement */}
                    {showDownload && (
                      <Tooltip label="Télécharger" placement="top">
                        <IconButton
                          aria-label="Télécharger"
                          icon={<FiDownload />}
                          onClick={downloadVideo}
                          variant="ghost"
                          color={textColor}
                          _hover={{ bg: "whiteAlpha.200" }}
                        />
                      </Tooltip>
                    )}

                    {/* Aide */}
                    <Tooltip label="Raccourcis clavier" placement="top">
                      <IconButton
                        aria-label="Aide"
                        icon={<Text fontSize="xl">?</Text>}
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowShortcuts(true);
                        }}
                        variant="ghost"
                        color={textColor}
                        _hover={{ bg: "whiteAlpha.200" }}
                      />
                    </Tooltip>

                    {/* Plein écran */}
                    <Tooltip
                      label={
                        isFullscreen ? "Quitter le plein écran" : "Plein écran"
                      }
                      placement="top"
                    >
                      <IconButton
                        aria-label={
                          isFullscreen
                            ? "Quitter le plein écran"
                            : "Plein écran"
                        }
                        icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
                        onClick={toggleFullscreen}
                        variant="ghost"
                        color={textColor}
                        _hover={{ bg: "whiteAlpha.200" }}
                      />
                    </Tooltip>
                  </HStack>
                </HStack>
              ) : (
                // Interface Mobile
                <VStack spacing={2} align="stretch">
                  <HStack justify="space-between" align="center">
                    <HStack spacing={1}>
                      <IconButton
                        aria-label={isPlaying ? "Pause" : "Play"}
                        icon={isPlaying ? <FiPause /> : <FiPlay />}
                        onClick={togglePlay}
                        variant="ghost"
                        color={textColor}
                        size="sm"
                        _hover={{ bg: "whiteAlpha.200" }}
                      />
                      <Text color={textColor} fontSize="xs">
                        {formatTime(currentTime)}
                      </Text>
                    </HStack>

                    <HStack spacing={1}>
                      <Menu closeOnSelect size="sm">
                        <MenuButton
                          as={IconButton}
                          aria-label="Réglages"
                          icon={<FiSettings />}
                          variant="ghost"
                          color={textColor}
                          size="sm"
                          _hover={{ bg: "whiteAlpha.200" }}
                        />
                        <MenuList fontSize="sm">
                          <MenuItem onClick={() => changePlaybackRate(0.5)}>
                            0.5x
                          </MenuItem>
                          <MenuItem onClick={() => changePlaybackRate(1)}>
                            1x (Normal)
                          </MenuItem>
                          <MenuItem onClick={() => changePlaybackRate(1.5)}>
                            1.5x
                          </MenuItem>
                          <MenuItem onClick={() => changePlaybackRate(2)}>
                            2x
                          </MenuItem>
                        </MenuList>
                      </Menu>

                      <IconButton
                        aria-label={
                          isMuted ? "Activer le son" : "Couper le son"
                        }
                        icon={isMuted ? <FiVolumeX /> : <FiVolume2 />}
                        onClick={toggleMute}
                        variant="ghost"
                        color={textColor}
                        size="sm"
                        _hover={{ bg: "whiteAlpha.200" }}
                      />

                      <IconButton
                        aria-label={
                          isFullscreen
                            ? "Quitter le plein écran"
                            : "Plein écran"
                        }
                        icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
                        onClick={toggleFullscreen}
                        variant="ghost"
                        color={textColor}
                        size="sm"
                        _hover={{ bg: "whiteAlpha.200" }}
                      />
                    </HStack>
                  </HStack>
                </VStack>
              )}
            </Box>
          )}
        </>
      )}
    </Box>
  );
}
