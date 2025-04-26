"use client";

import { Box, useColorModeValue } from "@chakra-ui/react";
import { useParams } from "next/navigation";
import ContentDetail from "@/app/components/public/ContentDetail";
import Footer from "@/app/components/Footer";
import Navbar from "@/app/components/Navbar";

export default function SerieDetailPage() {
  const params = useParams();
  const serieId = params.id as string;
  const bgColor = useColorModeValue("gray.900", "gray.900");

  return (
    <Box bg={bgColor} minH="100vh">
      <Box pt="70px">
        <ContentDetail contentId={serieId} />
      </Box>
      <Footer />
    </Box>
  );
}
