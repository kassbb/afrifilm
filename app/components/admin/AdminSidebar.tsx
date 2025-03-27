"use client";

import {
  Box,
  Flex,
  VStack,
  Text,
  Icon,
  Divider,
  Button,
  useColorModeValue,
  Tooltip,
  CloseButton,
  IconButton,
  Drawer,
  DrawerContent,
  useDisclosure,
  Image,
  Avatar,
  AvatarBadge,
  Collapse,
  createIcon,
} from "@chakra-ui/react";
import {
  FiHome,
  FiVideo,
  FiUsers,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiDollarSign,
  FiHelpCircle,
  FiChevronRight,
  FiChevronLeft,
  FiChevronsLeft,
  FiChevronsRight,
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { createContext, useContext, useState } from "react";

// Contexte pour l'état de la barre latérale
interface SidebarContextType {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

const SidebarContext = createContext<SidebarContextType>({
  isCollapsed: false,
  toggleSidebar: () => {},
});

export const useSidebar = () => useContext(SidebarContext);

export const SidebarProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const toggleSidebar = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{ isCollapsed, toggleSidebar }}>
      {children}
    </SidebarContext.Provider>
  );
};

interface NavItemProps {
  icon: any;
  children: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
  isCollapsed?: boolean;
}

const NavItem = ({
  icon,
  children,
  path,
  active,
  onClick,
  isCollapsed,
}: NavItemProps) => {
  const activeBg = useColorModeValue("red.600", "red.500");
  const inactiveBg = useColorModeValue("transparent", "transparent");
  const activeColor = useColorModeValue("white", "white");
  const inactiveColor = useColorModeValue("gray.300", "gray.300");
  const hoverBg = useColorModeValue("red.500", "red.500");

  return (
    <Tooltip
      label={children}
      placement="right"
      hasArrow
      openDelay={500}
      isDisabled={!isCollapsed}
    >
      <Link href={path} passHref style={{ width: "100%" }}>
        <Flex
          align="center"
          p="4"
          mx={isCollapsed ? "2" : "4"}
          mb="1"
          borderRadius="lg"
          role="group"
          cursor="pointer"
          fontSize="sm"
          fontWeight={active ? "bold" : "medium"}
          bg={active ? activeBg : inactiveBg}
          color={active ? activeColor : inactiveColor}
          _hover={{
            bg: hoverBg,
            color: "white",
            transform: "translateX(3px)",
          }}
          transition="all 0.2s ease"
          onClick={onClick}
          position="relative"
          justifyContent={isCollapsed ? "center" : "flex-start"}
        >
          <Icon
            mr={isCollapsed ? "0" : "4"}
            fontSize="18"
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
          {!isCollapsed && (
            <>
              {children}
              {active && (
                <Icon
                  as={FiChevronRight}
                  ml="auto"
                  fontSize="14"
                  opacity="0.7"
                />
              )}
            </>
          )}
        </Flex>
      </Link>
    </Tooltip>
  );
};

// Composant principal de la barre latérale
export function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { isCollapsed, toggleSidebar } = useSidebar();

  const bgColor = useColorModeValue("gray.800", "gray.800");
  const borderColor = useColorModeValue("gray.700", "gray.700");
  const logoColor = useColorModeValue("red.500", "red.400");

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const SidebarContent = () => (
    <Box
      bg={bgColor}
      borderRight="1px"
      borderRightColor={borderColor}
      w={isCollapsed ? { base: "full", md: "20" } : { base: "full", md: 64 }}
      pos="fixed"
      h="full"
      color="white"
      boxShadow="0 4px 12px 0 rgba(0,0,0,0.2)"
      transition="all 0.3s ease"
      zIndex="10"
    >
      <Flex
        h="20"
        alignItems="center"
        mx={isCollapsed ? "3" : "8"}
        justifyContent="space-between"
      >
        {!isCollapsed ? (
          <Flex alignItems="center">
            <Text
              fontSize="2xl"
              fontWeight="bold"
              color={logoColor}
              letterSpacing="tight"
            >
              AfriFilm
              <Box as="span" color="white">
                {" "}
                Admin
              </Box>
            </Text>
          </Flex>
        ) : (
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={logoColor}
            letterSpacing="tight"
          >
            AF
          </Text>
        )}
        <IconButton
          aria-label={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
          icon={isCollapsed ? <FiChevronsRight /> : <FiChevronsLeft />}
          onClick={toggleSidebar}
          size="sm"
          variant="ghost"
          colorScheme="gray"
          display={{ base: "none", md: "flex" }}
        />
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      {/* Profil administrateur */}
      {session && !isCollapsed && (
        <Flex
          direction="column"
          alignItems="center"
          mb={6}
          mt={2}
          mx={8}
          p={3}
          borderRadius="xl"
          bg="whiteAlpha.100"
        >
          <Avatar
            size="md"
            name={session.user?.name || session.user?.email}
            mb={2}
          >
            <AvatarBadge boxSize="1em" bg="green.500" />
          </Avatar>
          <Text
            fontSize="sm"
            fontWeight="medium"
            textAlign="center"
            noOfLines={1}
          >
            {session.user?.name || session.user?.email}
          </Text>
          <Text fontSize="xs" color="gray.400">
            Administrateur
          </Text>
        </Flex>
      )}

      {session && isCollapsed && (
        <Flex justifyContent="center" my={6}>
          <Avatar size="sm" name={session.user?.name || session.user?.email}>
            <AvatarBadge boxSize="0.8em" bg="green.500" />
          </Avatar>
        </Flex>
      )}

      <VStack spacing={2} align="stretch" mt={2}>
        <NavItem
          icon={FiHome}
          path="/admin/dashboard"
          active={pathname === "/admin/dashboard"}
          isCollapsed={isCollapsed}
        >
          Tableau de bord
        </NavItem>
        <NavItem
          icon={FiVideo}
          path="/admin/contents"
          active={pathname === "/admin/contents"}
          isCollapsed={isCollapsed}
        >
          Contenus
        </NavItem>
        <NavItem
          icon={FiUsers}
          path="/admin/creators"
          active={pathname === "/admin/creators"}
          isCollapsed={isCollapsed}
        >
          Créateurs
        </NavItem>
        <NavItem
          icon={FiUsers}
          path="/admin/users"
          active={pathname === "/admin/users"}
          isCollapsed={isCollapsed}
        >
          Utilisateurs
        </NavItem>
        <NavItem
          icon={FiDollarSign}
          path="/admin/transactions"
          active={pathname === "/admin/transactions"}
          isCollapsed={isCollapsed}
        >
          Transactions
        </NavItem>

        <Divider my={4} borderColor="gray.600" opacity="0.7" />

        <NavItem
          icon={FiSettings}
          path="/admin/settings"
          active={pathname === "/admin/settings"}
          isCollapsed={isCollapsed}
        >
          Paramètres
        </NavItem>
        <NavItem
          icon={FiHelpCircle}
          path="/admin/help"
          active={pathname === "/admin/help"}
          isCollapsed={isCollapsed}
        >
          Aide
        </NavItem>

        {!isCollapsed && (
          <Box px={4} mt={8}>
            <Button
              leftIcon={<FiLogOut />}
              variant="outline"
              colorScheme="red"
              width="full"
              size="md"
              borderRadius="lg"
              onClick={handleSignOut}
              transition="all 0.2s"
              _hover={{
                bg: "red.600",
                color: "white",
                borderColor: "red.600",
              }}
            >
              Déconnexion
            </Button>
          </Box>
        )}

        {isCollapsed && (
          <Box mt={8} display="flex" justifyContent="center">
            <Tooltip label="Déconnexion" placement="right" hasArrow>
              <IconButton
                aria-label="Déconnexion"
                icon={<FiLogOut />}
                colorScheme="red"
                variant="outline"
                size="md"
                borderRadius="lg"
                onClick={handleSignOut}
              />
            </Tooltip>
          </Box>
        )}
      </VStack>
    </Box>
  );

  return (
    <Box>
      <Drawer
        autoFocus={false}
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        returnFocusOnClose={false}
        onOverlayClick={onClose}
        size="full"
      >
        <DrawerContent>
          <SidebarContent />
        </DrawerContent>
      </Drawer>

      {/* Mobile nav icon */}
      <IconButton
        aria-label="Menu"
        display={{ base: "flex", md: "none" }}
        position="fixed"
        top={4}
        left={4}
        icon={<FiMenu />}
        onClick={onOpen}
        zIndex={20}
        colorScheme="red"
        size="md"
        boxShadow="lg"
      />

      {/* Desktop sidebar */}
      <Box display={{ base: "none", md: "block" }}>
        <SidebarContent />
      </Box>
    </Box>
  );
}

// Exportation par défaut pour la compatibilité avec l'import dynamique
export default AdminSidebar;
