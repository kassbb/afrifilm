"use client";

import { Box, Container, Heading, useColorModeValue } from "@chakra-ui/react";
import UserPurchasesHistory from "@/app/components/public/UserPurchasesHistory";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";

export default function PurchasesPage() {
  const bgColor = useColorModeValue("gray.900", "gray.900");

  return (
    <Box bg={bgColor} minH="100vh">
      <Navbar />
      <Container maxW="container.xl" py={10}>
        <Heading mb={8} color="white">
          Historique des achats
        </Heading>
        <UserPurchasesHistory />
      </Container>
      <Footer />
    </Box>
  );
}
