"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";
import Hero from "@/app/components/Hero";
import FeaturedContent from "@/app/components/FeaturedContent";
import Footer from "@/app/components/Footer";

export default function HomePage() {
  const bgColor = useColorModeValue("gray.900", "gray.900");

  return (
    <Box bg={bgColor} minH="100vh">
      <Hero />
      <FeaturedContent />
      <Footer />
    </Box>
  );
}
