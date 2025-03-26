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
  useColorModeValue,
} from "@chakra-ui/react";
import { useState, useRef, useEffect } from "react";
import {
  FiPlay,
  FiPause,
  FiVolume2,
  FiVolumeX,
  FiMaximize,
  FiMinimize,
} from "react-icons/fi";

interface VideoPlayerProps {
  videoUrl: string;
  onEnded?: () => void;
}

export default function VideoPlayer({ videoUrl, onEnded }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();

  const bgColor = useColorModeValue("blackAlpha.800", "blackAlpha.900");
  const textColor = useColorModeValue("white", "white");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
    };
  }, []);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
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
      videoRef.current?.parentElement?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  const handleMouseMove = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 3000);
  };

  return (
    <Box
      position="relative"
      w="full"
      h="full"
      bg="black"
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowControls(true)}
    >
      <video
        ref={videoRef}
        src={videoUrl}
        style={{ width: "100%", height: "100%", objectFit: "contain" }}
        onEnded={onEnded}
      />

      {showControls && (
        <Box
          position="absolute"
          bottom={0}
          left={0}
          right={0}
          bg={bgColor}
          p={4}
          transition="opacity 0.3s"
        >
          <Slider
            value={currentTime}
            min={0}
            max={duration}
            onChange={handleTimeChange}
            mb={2}
          >
            <SliderTrack bg="gray.700">
              <SliderFilledTrack bg="brand.500" />
            </SliderTrack>
            <SliderThumb boxSize={4} />
          </Slider>

          <HStack justify="space-between" align="center">
            <HStack spacing={4}>
              <IconButton
                aria-label={isPlaying ? "Pause" : "Play"}
                icon={isPlaying ? <FiPause /> : <FiPlay />}
                onClick={togglePlay}
                variant="ghost"
                color={textColor}
                _hover={{ bg: "whiteAlpha.200" }}
              />
              <Text color={textColor} fontSize="sm">
                {formatTime(currentTime)} / {formatTime(duration)}
              </Text>
            </HStack>

            <HStack spacing={2}>
              <IconButton
                aria-label={isMuted ? "Unmute" : "Mute"}
                icon={isMuted ? <FiVolumeX /> : <FiVolume2 />}
                onClick={toggleMute}
                variant="ghost"
                color={textColor}
                _hover={{ bg: "whiteAlpha.200" }}
              />
              <Slider
                value={volume}
                min={0}
                max={1}
                step={0.1}
                onChange={handleVolumeChange}
                w="100px"
              >
                <SliderTrack bg="gray.700">
                  <SliderFilledTrack bg="brand.500" />
                </SliderTrack>
                <SliderThumb boxSize={4} />
              </Slider>
              <IconButton
                aria-label={
                  isFullscreen ? "Exit fullscreen" : "Enter fullscreen"
                }
                icon={isFullscreen ? <FiMinimize /> : <FiMaximize />}
                onClick={toggleFullscreen}
                variant="ghost"
                color={textColor}
                _hover={{ bg: "whiteAlpha.200" }}
              />
            </HStack>
          </HStack>
        </Box>
      )}
    </Box>
  );
}
