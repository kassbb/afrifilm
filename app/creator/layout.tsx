"use client";

import {
  Box,
  Flex,
  useColorModeValue,
  Button,
  Icon,
  HStack,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Heading,
  Container,
  IconButton,
} from "@chakra-ui/react";
import { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import {
  FiHome,
  FiChevronRight,
  FiArrowLeft,
  FiPlus,
  FiLogOut,
} from "react-icons/fi";

function getBreadcrumbItems(pathname: string) {
  const parts = pathname.split("/").filter(Boolean);
  let currentPath = "";

  return parts.map((part, index) => {
    currentPath += `/${part}`;

    // Personnaliser les noms affichés
    let label = part.charAt(0).toUpperCase() + part.slice(1);
    if (part === "creator") label = "Espace Créateur";
    if (part === "dashboard") label = "Tableau de bord";
    if (part === "content") label = "Contenus";
    if (part === "new") label = "Nouveau contenu";
    if (part === "stats") label = "Statistiques";
    if (part === "revenue") label = "Revenus";
    if (part === "settings") label = "Paramètres";

    return {
      label,
      path: currentPath,
      isCurrentPage: index === parts.length - 1,
    };
  });
}

function CreatorNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const bgColor = useColorModeValue("white", "gray.800");
  const borderColor = useColorModeValue("gray.200", "gray.700");
  const breadcrumbItems = getBreadcrumbItems(pathname);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <Box
      as="nav"
      position="sticky"
      top={0}
      bg={bgColor}
      borderBottom="1px"
      borderBottomColor={borderColor}
      py={3}
      px={6}
      zIndex={10}
      boxShadow="sm"
    >
      <Flex justify="space-between" align="center">
        <HStack spacing={4}>
          <IconButton
            aria-label="Retour"
            icon={<FiArrowLeft />}
            variant="ghost"
            onClick={() => router.back()}
          />

          <Breadcrumb
            separator={<Icon as={FiChevronRight} color="gray.500" />}
            fontSize="sm"
          >
            <BreadcrumbItem>
              <BreadcrumbLink as={Link} href="/creator/dashboard">
                <Icon as={FiHome} mr={1} />
                Accueil
              </BreadcrumbLink>
            </BreadcrumbItem>

            {breadcrumbItems.map((item, index) => (
              <BreadcrumbItem key={index} isCurrentPage={item.isCurrentPage}>
                {item.isCurrentPage ? (
                  <Text color="blue.500" fontWeight="medium">
                    {item.label}
                  </Text>
                ) : (
                  <BreadcrumbLink as={Link} href={item.path}>
                    {item.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            ))}
          </Breadcrumb>
        </HStack>

        <HStack spacing={3}>
          {pathname.includes("/creator/content") &&
            !pathname.includes("/new") && (
              <Button
                as={Link}
                href="/creator/content/new"
                size="sm"
                colorScheme="blue"
                leftIcon={<FiPlus />}
              >
                Nouveau contenu
              </Button>
            )}

          <Button
            size="sm"
            variant="outline"
            colorScheme="red"
            leftIcon={<FiLogOut />}
            onClick={handleSignOut}
          >
            Déconnexion
          </Button>
        </HStack>
      </Flex>
    </Box>
  );
}

export default function CreatorLayout({ children }: { children: ReactNode }) {
  const bgColor = useColorModeValue("gray.50", "gray.900");

  return (
    <Box minH="100vh" bg={bgColor}>
      <CreatorNavBar />
      <Container maxW="container.xl" py={6}>
        {children}
      </Container>
    </Box>
  );
}
