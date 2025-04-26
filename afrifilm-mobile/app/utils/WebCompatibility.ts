import { Platform, ViewStyle, TextStyle } from 'react-native';

/**
 * Convertit les styles shadow* de React Native en styles boxShadow compatibles web
 */
export const getShadowStyle = (
  color: string = '#000',
  offset: { width: number; height: number } = { width: 0, height: 2 },
  opacity: number = 0.1,
  radius: number = 5
): ViewStyle => {
  if (Platform.OS === 'web') {
    // Style web
    return {
      boxShadow: `${offset.width}px ${offset.height}px ${radius}px rgba(0, 0, 0, ${opacity})`,
    } as ViewStyle;
  }
  
  // Style natif (iOS/Android)
  return {
    shadowColor: color,
    shadowOffset: offset,
    shadowOpacity: opacity,
    shadowRadius: radius,
    elevation: radius * 1.5, // Approximation pour Android
  } as ViewStyle;
};

/**
 * Convertit les styles textShadow* de React Native en style textShadow compatible web
 */
export const getTextShadowStyle = (
  color: string = '#000',
  offset: { width: number; height: number } = { width: 0, height: 1 },
  radius: number = 1
): TextStyle => {
  if (Platform.OS === 'web') {
    // Style web
    return {
      textShadow: `${offset.width}px ${offset.height}px ${radius}px ${color}`,
    } as TextStyle;
  }
  
  // Style natif (iOS/Android)
  return {
    textShadowColor: color,
    textShadowOffset: offset,
    textShadowRadius: radius,
  } as TextStyle;
};

/**
 * Crée un style pointerEvents compatible avec le web et les plateformes natives
 */
export const getPointerEventsStyle = (value: 'none' | 'auto' | 'box-none' | 'box-only'): ViewStyle => {
  if (Platform.OS === 'web') {
    return { pointerEvents: value } as ViewStyle;
  }
  
  // Sur les plateformes natives, nous pouvons utiliser pointerEvents comme prop
  return {} as ViewStyle;
};

/**
 * Détermine s'il faut utiliser useNativeDriver en fonction de la plateforme
 */
export const shouldUseNativeDriver = (): boolean => {
  return Platform.OS !== 'web';
};