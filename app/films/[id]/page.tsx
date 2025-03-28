"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import ContentDetail from "@/app/components/public/ContentDetail";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";

export default function FilmDetailPage() {
  const params = useParams();
  const filmId = params.id as string;
  const bgColor = useColorModeValue("gray.900", "gray.900");

  return (
    <Box bg={bgColor} minH="100vh">
     
      <ContentDetail contentId={filmId} />
      <Footer />
    </Box>
  );
}
