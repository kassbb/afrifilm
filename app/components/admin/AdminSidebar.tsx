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
} from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

interface NavItemProps {
  icon: any;
  children: string;
  path: string;
  active?: boolean;
  onClick?: () => void;
}

const NavItem = ({ icon, children, path, active, onClick }: NavItemProps) => {
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
      display={{ base: "none", md: "block" }}
    >
      <Link href={path} passHref style={{ width: "100%" }}>
        <Flex
          align="center"
          p="4"
          mx="4"
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
        >
          <Icon
            mr="4"
            fontSize="18"
            _groupHover={{
              color: "white",
            }}
            as={icon}
          />
          {children}
          {active && (
            <Icon as={FiChevronRight} ml="auto" fontSize="14" opacity="0.7" />
          )}
        </Flex>
      </Link>
    </Tooltip>
  );
};

export default function AdminSidebar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const { isOpen, onOpen, onClose } = useDisclosure();

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
      w={{ base: "full", md: 64 }}
      pos="fixed"
      h="full"
      color="white"
      boxShadow="0 4px 12px 0 rgba(0,0,0,0.2)"
    >
      <Flex h="20" alignItems="center" mx="8" justifyContent="space-between">
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
        <CloseButton display={{ base: "flex", md: "none" }} onClick={onClose} />
      </Flex>

      {/* Profil administrateur */}
      {session && (
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

      <VStack spacing={2} align="stretch" mt={2}>
        <NavItem
          icon={FiHome}
          path="/admin/dashboard"
          active={pathname === "/admin/dashboard"}
        >
          Tableau de bord
        </NavItem>
        <NavItem
          icon={FiVideo}
          path="/admin/contents"
          active={pathname === "/admin/contents"}
        >
          Contenus
        </NavItem>
        <NavItem
          icon={FiUsers}
          path="/admin/creators"
          active={pathname === "/admin/creators"}
        >
          Créateurs
        </NavItem>
        <NavItem
          icon={FiUsers}
          path="/admin/users"
          active={pathname === "/admin/users"}
        >
          Utilisateurs
        </NavItem>
        <NavItem
          icon={FiDollarSign}
          path="/admin/transactions"
          active={pathname === "/admin/transactions"}
        >
          Transactions
        </NavItem>

        <Divider my={4} borderColor="gray.600" opacity="0.7" />

        <NavItem
          icon={FiSettings}
          path="/admin/settings"
          active={pathname === "/admin/settings"}
        >
          Paramètres
        </NavItem>
        <NavItem
          icon={FiHelpCircle}
          path="/admin/help"
          active={pathname === "/admin/help"}
        >
          Aide
        </NavItem>

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
