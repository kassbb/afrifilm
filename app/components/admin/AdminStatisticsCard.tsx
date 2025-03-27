"use client";

import {
  Box,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  StatArrow,
  Icon,
  Flex,
  useColorModeValue,
} from "@chakra-ui/react";
import { keyframes } from "@emotion/react";
import { IconType } from "react-icons";

// Animation de pulsation pour l'icône
const pulse = keyframes`
  0% { transform: scale(1); opacity: 0.8; }
  50% { transform: scale(1.05); opacity: 1; }
  100% { transform: scale(1); opacity: 0.8; }
`;

interface AdminStatisticsCardProps {
  title: string;
  value: string | number;
  icon: IconType;
  color: string;
  change?: number;
  changeLabel?: string;
}

export default function AdminStatisticsCard({
  title,
  value,
  icon,
  color,
  change,
  changeLabel,
}: AdminStatisticsCardProps) {
  // Animation pour l'icône
  const pulseAnimation = `${pulse} 3s ease-in-out infinite`;

  // Couleurs dynamiques basées sur la propriété color
  const bgGradient = `linear(to-br, ${color}.800, ${color}.900)`;
  const iconBg = `${color}.700`;
  const iconColor = `${color}.200`;
  const borderColor = `${color}.600`;

  return (
    <Box
      p={5}
      borderRadius="2xl"
      bg={useColorModeValue("gray.800", "gray.700")}
      borderLeft="4px solid"
      borderColor={borderColor}
      boxShadow="lg"
      position="relative"
      overflow="hidden"
      transition="all 0.3s ease"
      _hover={{
        transform: "translateY(-5px)",
        boxShadow: "xl",
      }}
    >
      <Flex justify="space-between" alignItems="center">
        <Stat>
          <StatLabel
            fontWeight="medium"
            isTruncated
            fontSize="sm"
            color="gray.400"
            mb={1}
            textTransform="uppercase"
            letterSpacing="wider"
          >
            {title}
          </StatLabel>
          <StatNumber fontSize="2xl" fontWeight="bold" color="white" mb={1}>
            {value}
          </StatNumber>
          {change !== undefined && changeLabel && (
            <StatHelpText
              color="gray.300"
              fontSize="xs"
              fontWeight="medium"
              mt={0}
            >
              <StatArrow
                type={change >= 0 ? "increase" : "decrease"}
                color={change >= 0 ? "green.300" : "red.300"}
              />
              <Box
                as="span"
                fontWeight="bold"
                color={change >= 0 ? "green.300" : "red.300"}
              >
                {Math.abs(change)}%
              </Box>{" "}
              {changeLabel}
            </StatHelpText>
          )}
        </Stat>
        <Flex
          align="center"
          justify="center"
          h="3.5rem"
          w="3.5rem"
          bg={iconBg}
          borderRadius="full"
          boxShadow="md"
          animation={pulseAnimation}
        >
          <Icon as={icon} boxSize="1.75rem" color={iconColor} />
        </Flex>
      </Flex>

      {/* Effet de gradient en arrière-plan */}
      <Box
        position="absolute"
        top="0"
        right="0"
        bottom="0"
        left="0"
        bgGradient={bgGradient}
        opacity="0.05"
        zIndex="0"
        borderRadius="2xl"
        pointerEvents="none"
      />
    </Box>
  );
}
