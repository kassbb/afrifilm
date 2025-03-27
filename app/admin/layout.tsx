"use client";

import { SidebarProvider, useSidebar } from "../components/admin/AdminSidebar";
import { Box, Flex, useColorModeValue } from "@chakra-ui/react";
import { ReactNode } from "react";
import dynamic from "next/dynamic";

// Import dynamique pour éviter les problèmes d'hydratation
const AdminSidebar = dynamic(
  () =>
    import("../components/admin/AdminSidebar").then((mod) => mod.AdminSidebar),
  { ssr: false }
);

// Composant qui gère l'adaptation du contenu à l'état de la barre latérale
function AdminLayoutContent({ children }: { children: ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <Flex minH="100vh" bg={useColorModeValue("gray.900", "gray.900")}>
      <AdminSidebar />

      <Box
        flex="1"
        ml={{ base: 0, md: isCollapsed ? "20" : "64" }}
        pl={{ base: 0, md: 6 }}
        transition="all 0.3s ease"
        w="100%"
      >
        {children}
      </Box>
    </Flex>
  );
}

// Layout principal qui fournit le contexte de la barre latérale
export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarProvider>
      <AdminLayoutContent>{children}</AdminLayoutContent>
    </SidebarProvider>
  );
}
