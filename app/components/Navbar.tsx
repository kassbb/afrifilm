"use client";

import { useState } from "react";
import {
  Box,
  Flex,
  Button,
  IconButton,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  VStack,
  HStack,
  useColorModeValue,
  Text,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
} from "@chakra-ui/react";
import { FiMenu, FiX, FiUser, FiLogOut, FiSettings } from "react-icons/fi";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NavLink = ({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) => {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <Link href={href} passHref>
      <Box position="relative">
        <Text
          as="span"
          color={isActive ? "orange.400" : "gray.300"}
          fontWeight={isActive ? "bold" : "medium"}
          fontSize="md"
          _hover={{ color: "orange.300" }}
          transition="color 0.2s"
        >
          {children}
        </Text>
        {isActive && (
          <Box
            position="absolute"
            bottom="-10px"
            left="0"
            right="0"
            height="3px"
            bg="orange.400"
            borderRadius="full"
          />
        )}
      </Box>
    </Link>
  );
};

export default function Navbar() {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("gray.700", "gray.700");

  return (
    <Box
      as="nav"
      position="fixed"
      top={0}
      left={0}
      right={0}
      bg={bgColor}
      borderBottom="1px"
      borderColor={borderColor}
      zIndex={1000}
    >
      <Flex
        maxW="container.xl"
        mx="auto"
        px={4}
        h="16"
        align="center"
        justify="space-between"
      >
        <Link href="/" passHref>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color="white"
            _hover={{ color: "brand.500" }}
            transition="color 0.2s"
          >
            AfriFilm
          </Text>
        </Link>

        {/* Desktop Navigation */}
        <HStack spacing={8} display={{ base: "none", md: "flex" }}>
          <NavLink href="/films">Films</NavLink>
          <NavLink href="/series">Séries</NavLink>
          <NavLink href="/nouveautes">Nouveautés</NavLink>
          <NavLink href="/categories">Catégories</NavLink>
        </HStack>

        {/* Desktop Actions */}
        <HStack spacing={4} display={{ base: "none", md: "flex" }}>
          <Button
            variant="ghost"
            color="white"
            _hover={{ bg: "whiteAlpha.200" }}
            onClick={toggleColorMode}
          >
            {colorMode === "light" ? "🌙" : "☀️"}
          </Button>
          <Menu>
            <MenuButton
              as={Button}
              variant="ghost"
              color="white"
              _hover={{ bg: "whiteAlpha.200" }}
              leftIcon={<FiUser />}
            >
              Mon Compte
            </MenuButton>
            <MenuList bg="gray.800" borderColor="gray.700">
              <MenuItem color="white" _hover={{ bg: "whiteAlpha.200" }}>
                <FiUser style={{ marginRight: "8px" }} />
                Profil
              </MenuItem>
              <MenuItem color="white" _hover={{ bg: "whiteAlpha.200" }}>
                <FiSettings style={{ marginRight: "8px" }} />
                Paramètres
              </MenuItem>
              <MenuDivider borderColor="gray.700" />
              <MenuItem color="white" _hover={{ bg: "whiteAlpha.200" }}>
                <FiLogOut style={{ marginRight: "8px" }} />
                Déconnexion
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>

        {/* Mobile Menu Button */}
        <IconButton
          display={{ base: "flex", md: "none" }}
          aria-label="Menu"
          icon={isOpen ? <FiX /> : <FiMenu />}
          variant="ghost"
          color="white"
          _hover={{ bg: "whiteAlpha.200" }}
          onClick={isOpen ? onClose : onOpen}
        />
      </Flex>

      {/* Mobile Navigation */}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg="gray.900">
          <DrawerCloseButton color="white" />
          <DrawerHeader color="white">Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={6} align="stretch">
              <NavLink href="/films">Films</NavLink>
              <NavLink href="/series">Séries</NavLink>
              <NavLink href="/nouveautes">Nouveautés</NavLink>
              <NavLink href="/categories">Catégories</NavLink>
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                onClick={toggleColorMode}
                justifyContent="flex-start"
              >
                {colorMode === "light" ? "🌙 Mode Sombre" : "☀️ Mode Clair"}
              </Button>
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                leftIcon={<FiUser />}
                justifyContent="flex-start"
              >
                Mon Compte
              </Button>
              <Button
                variant="ghost"
                color="white"
                _hover={{ bg: "whiteAlpha.200" }}
                leftIcon={<FiLogOut />}
                justifyContent="flex-start"
              >
                Déconnexion
              </Button>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Box>
  );
}
