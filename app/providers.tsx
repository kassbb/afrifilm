"use client";

import { ChakraProvider, extendTheme } from "@chakra-ui/react";
import { CacheProvider } from "@chakra-ui/next-js";
import { SessionProvider } from "next-auth/react";

// Définition du thème
const theme = extendTheme({
  colors: {
    brand: {
      50: "#F9E9EA",
      100: "#F5D3D5",
      200: "#ECA6AB",
      300: "#E27A81",
      400: "#D94D57",
      500: "#CF212D",
      600: "#A61A24",
      700: "#7D141B",
      800: "#530D12",
      900: "#2A0709",
    },
    orange: {
      400: "#FF9E44",
      300: "#FFB777",
    },
  },
  config: {
    initialColorMode: "dark",
    useSystemColorMode: false,
  },
  fonts: {
    heading: "var(--font-montserrat)",
    body: "var(--font-montserrat)",
  },
  styles: {
    global: {
      body: {
        bg: "brand.black",
        color: "white",
      },
    },
  },
  components: {
    Table: {
      defaultProps: {
        variant: "simple",
      },
      variants: {
        simple: {
          th: {
            borderColor: "whiteAlpha.300",
          },
          td: {
            borderColor: "whiteAlpha.300",
          },
        },
      },
    },
  },
});

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <CacheProvider>
        <ChakraProvider theme={theme}>{children}</ChakraProvider>
      </CacheProvider>
    </SessionProvider>
  );
}
