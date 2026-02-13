/**
 * ScreenBackground - Composite background wrapper
 * Combines background color + IslamicPattern + NoiseTexture
 * for consistent premium screen setup.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { IslamicPattern } from './IslamicPattern';
import { NoiseTexture } from './NoiseTexture';
import { colors } from '@/constants/colors';

interface ScreenBackgroundProps {
  variant: 'parchment' | 'midnight';
  patternOpacity?: number;
  showPattern?: boolean;
  showNoise?: boolean;
  children: React.ReactNode;
  /** Use SafeAreaView wrapper (default true) */
  safeArea?: boolean;
  /** Additional style for the container */
  style?: object;
}

export function ScreenBackground({
  variant,
  patternOpacity,
  showPattern = true,
  showNoise = true,
  children,
  safeArea = true,
  style,
}: ScreenBackgroundProps) {
  const bgColor = variant === 'parchment' ? colors.parchment : colors.midnight;
  const defaultPatternOpacity = variant === 'parchment' ? 0.03 : 0.05;
  const patternColor = variant === 'parchment' ? '#78350f' : '#78350f';

  const Container = safeArea ? SafeAreaView : View;

  return (
    <Container style={[styles.container, { backgroundColor: bgColor }, style]}>
      {showPattern && (
        <IslamicPattern opacity={patternOpacity ?? defaultPatternOpacity} color={patternColor} />
      )}
      {showNoise && <NoiseTexture />}
      <View style={styles.content}>{children}</View>
    </Container>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    zIndex: 1,
  },
});
