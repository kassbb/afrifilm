import { Platform, Animated, Easing } from "react-native";

/**
 * Crée une animation compatible avec toutes les plateformes
 * Gère automatiquement useNativeDriver en fonction de la plateforme
 */
export const createCompatibleAnimation = (
  animatedValue: Animated.Value,
  config: {
    toValue: number;
    duration?: number;
    delay?: number;
    easing?: Animated.EasingFunction;
    useNativeDriver?: boolean;
  }
): Animated.CompositeAnimation => {
  // Par défaut, utilisez useNativeDriver sauf sur le web
  const useNativeDriver =
    config.useNativeDriver !== undefined
      ? config.useNativeDriver
      : Platform.OS !== "web";

  return Animated.timing(animatedValue, {
    toValue: config.toValue,
    duration: config.duration || 300,
    delay: config.delay || 0,
    easing: config.easing || Easing.ease,
    useNativeDriver,
  });
};

/**
 * Crée une animation de ressort compatible avec toutes les plateformes
 */
export const createCompatibleSpring = (
  animatedValue: Animated.Value,
  config: {
    toValue: number;
    friction?: number;
    tension?: number;
    speed?: number;
    bounciness?: number;
    useNativeDriver?: boolean;
  }
): Animated.CompositeAnimation => {
  // Par défaut, utilisez useNativeDriver sauf sur le web
  const useNativeDriver =
    config.useNativeDriver !== undefined
      ? config.useNativeDriver
      : Platform.OS !== "web";

  return Animated.spring(animatedValue, {
    toValue: config.toValue,
    friction: config.friction || 7,
    tension: config.tension || 40,
    useNativeDriver,
  });
};

/**
 * Génère des styles d'interpolation compatibles web et natifs
 */
export const getCompatibleInterpolation = (
  animatedValue: Animated.Value,
  config: {
    inputRange: number[];
    outputRange: number[] | string[];
    extrapolate?: "extend" | "clamp" | "identity";
  }
): Animated.AnimatedInterpolation<number | string> => {
  return animatedValue.interpolate({
    inputRange: config.inputRange,
    outputRange: config.outputRange,
    extrapolate: config.extrapolate || "clamp",
  });
};
