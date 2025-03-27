import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Box } from "@chakra-ui/react";
import Navbar from "./components/Navbar";
import { Providers } from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AfriFilm - Streaming de films et séries africains",
  description: "Regardez les meilleurs films et séries africains en streaming",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <Providers>
          <Navbar />
          <Box pt="70px">{children}</Box>
        </Providers>
      </body>
    </html>
  );
}
