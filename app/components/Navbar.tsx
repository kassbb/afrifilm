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
  MenuDivider,
} from "@chakra-ui/react";
import { HamburgerIcon, CloseIcon, ChevronDownIcon } from "@chakra-ui/icons";

export default function Navbar() {
  const { data: session, status } = useSession();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const bgColor = useColorModeValue("gray.900", "gray.900");
  const borderColor = useColorModeValue("gray.800", "gray.800");

  // Indicateur visuel de l'état de session
  const sessionStatusColor =
    status === "loading"
      ? "yellow.400"
      : status === "authenticated"
      ? "green.400"
      : "red.400";

  return (
    <Box
      bg={bgColor}
      px={4}
      borderBottom="1px"
      borderColor={borderColor}
      position="fixed"
      width="100%"
      zIndex={1000}
    >
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
              <>
                <Box
                  w="10px"
                  h="10px"
                  borderRadius="full"
                  bg={sessionStatusColor}
                  mr={2}
                  title={`Session: ${status}, User: ${
                    session?.user?.email || "none"
                  }`}
                />
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDownIcon />}
                    variant="ghost"
                    colorScheme="whiteAlpha"
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
                  <MenuList bg="gray.800">
                    <Link href="/user/profile" passHref>
                      <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }}>
                        Mon profil
                      </MenuItem>
                    </Link>
                    <Link href="/user/purchases" passHref>
                      <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }}>
                        Mes achats
                      </MenuItem>
                    </Link>
                    <Link href="/user/favorites" passHref>
                      <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }}>
                        Favoris
                      </MenuItem>
                    </Link>
                    {session.user.role === "CREATOR" && (
                      <Link href="/creator/dashboard" passHref>
                        <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }}>
                          Espace créateur
                        </MenuItem>
                      </Link>
                    )}
                    {session.user.role === "ADMIN" && (
                      <Link href="/admin/dashboard" passHref>
                        <MenuItem bg="gray.800" _hover={{ bg: "gray.700" }}>
                          Administration
                        </MenuItem>
                      </Link>
                    )}
                    <MenuDivider />
                    <MenuItem
                      bg="gray.800"
                      _hover={{ bg: "gray.700" }}
                      onClick={() => signOut()}
                    >
                      Déconnexion
                    </MenuItem>
                  </MenuList>
                </Menu>
              </>
            ) : (
              <>
                <Box
                  w="10px"
                  h="10px"
                  borderRadius="full"
                  bg={sessionStatusColor}
                  mr={2}
                  title={`Session: ${status}`}
                />
                <Link href="/auth/login" passHref>
                  <Button colorScheme="red" variant="solid">
                    Connexion
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
                      _hover={{ color: "red.300" }}
                      fontWeight="medium"
                      mb={2}
                    >
                      Connexion
                    </Text>
                  </Link>
                  <Link href="/auth/register" passHref>
                    <Text
                      color="red.400"
                      _hover={{ color: "red.300" }}
                      fontWeight="medium"
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
