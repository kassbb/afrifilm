"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import {
  Box,
  Flex,
  HStack,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
  Container,
  IconButton,
  useDisclosure,
  Stack,
  Text,
  Avatar,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("gray.800", "gray.800");

  return (
    <Box bg={bgColor} px={4} borderBottom="1px" borderColor={borderColor} position="fixed" width="100%" zIndex={1000}>
      <Container maxW="container.xl">
        <Flex h={16} alignItems="center" justifyContent="space-between">
          <IconButton
            size="md"
            icon={isOpen ? <CloseIcon /> : <HamburgerIcon />}
            aria-label="Open Menu"
            display={{ md: "none" }}
            onClick={isOpen ? onClose : onOpen}
            colorScheme="gray"
            variant="ghost"
          />

          <HStack spacing={8} alignItems="center">
            <Link href="/" passHref>
              <Text
                fontWeight="bold"
                fontSize="xl"
                color="red.500"
                cursor="pointer"
              >
                AfriFilm
              </Text>
            </Link>
            <HStack as="nav" spacing={4} display={{ base: "none", md: "flex" }}>
              <Link href="/films" passHref>
                <Text
                  color="gray.200"
                  _hover={{ color: "red.500" }}
                  cursor="pointer"
                >
                  Films
                </Text>
              </Link>
              <Link href="/series" passHref>
                <Text
                  color="gray.200"
                  _hover={{ color: "red.500" }}
                  cursor="pointer"
                >
                  Séries
                </Text>
              </Link>
            </HStack>
          </HStack>

          <HStack>
            {status === "loading" ? (
              <Text color="gray.400">Chargement...</Text>
            ) : session ? (
              <Menu>
                <MenuButton
                  as={Button}
                  rightIcon={<ChevronDownIcon />}
                  bg="transparent"
                  color="white"
                  _hover={{ bg: "gray.800" }}
                  _active={{ bg: "gray.800" }}
                >
                  <HStack>
                    <Avatar
                      size="sm"
                      name={session.user.name || session.user.email}
                      src={session.user.image || undefined}
                    />
                    <Box display={{ base: "none", md: "block" }}>
                      <Text fontWeight="medium">
                        {session.user.name || session.user.email}
                      </Text>
                    </Box>
                  </HStack>
                </MenuButton>
                <MenuList bg="gray.800" borderColor="gray.700">
                  <Link href="/profile" passHref>
                    <MenuItem as="a" bg="gray.800" _hover={{ bg: "gray.700" }}>
                      Mon profil
                    </MenuItem>
                  </Link>
                  {session.user.role === "CREATOR" && (
                    <Link href="/creator/dashboard" passHref>
                      <MenuItem
                        as="a"
                        bg="gray.800"
                        _hover={{ bg: "gray.700" }}
                      >
                        Espace créateur
                      </MenuItem>
                    </Link>
                  )}
                  {session.user.role === "ADMIN" && (
                    <Link href="/admin/dashboard" passHref>
                      <MenuItem
                        as="a"
                        bg="gray.800"
                        _hover={{ bg: "gray.700" }}
                      >
                        Administration
                      </MenuItem>
                    </Link>
                  )}
                  <MenuItem
                    bg="gray.800"
                    _hover={{ bg: "gray.700" }}
                    onClick={() => signOut({ callbackUrl: "/" })}
                  >
                    Déconnexion
                  </MenuItem>
                </MenuList>
              </Menu>
            ) : (
              <>
                <Link href="/auth/login" passHref>
                  <Button variant="ghost" colorScheme="red" size="sm" mr={2}>
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/register" passHref>
                  <Button colorScheme="red" size="sm">
                    Inscription
                  </Button>
                </Link>
              </>
            )}
          </HStack>
        </Flex>

        {isOpen && (
          <Box pb={4} display={{ md: "none" }}>
            <Stack as="nav" spacing={4}>
              <Link href="/films" passHref>
                <Text
                  color="gray.200"
                  _hover={{ color: "red.500" }}
                  cursor="pointer"
                >
                  Films
                </Text>
              </Link>
              <Link href="/series" passHref>
                <Text
                  color="gray.200"
                  _hover={{ color: "red.500" }}
                  cursor="pointer"
                >
                  Séries
                </Text>
              </Link>
              {!session && (
                <>
                  <Link href="/auth/login" passHref>
                    <Text
                      color="red.400"
                      _hover={{ color: "red.500" }}
                      cursor="pointer"
                    >
                      Connexion
                    </Text>
                  </Link>
                  <Link href="/auth/register" passHref>
                    <Text
                      color="red.400"
                      _hover={{ color: "red.500" }}
                      cursor="pointer"
                    >
                      Inscription
                    </Text>
                  </Link>
                </>
              )}
            </Stack>
          </Box>
        )}
      </Container>
    </Box>
  );
}
