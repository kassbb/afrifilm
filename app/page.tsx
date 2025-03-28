"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";
import Hero from "@/app/components/Hero";
import HomeContent from "@/app/components/public/HomeContent";
import Footer from "@/app/components/Footer";

export default function HomePage() {
  const bgColor = useColorModeValue("gray.900", "gray.900");

  return (
    <Box
      bg={bgColor}
      minH="100vh"
      position="relative"
      _before={{
        content: '""',
        position: "absolute",
        top: 0,
        right: 0,
        bottom: 0,
        left: 0,
        backgroundImage: "url('/images/baniere_afrifilm.webp')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        opacity: 0.15,
        zIndex: 0,
      }}
    >
      <Box position="relative" zIndex={1}>
        <Hero />
        <HomeContent />
        <Footer />
      </Box>
    </Box>
  );
}
