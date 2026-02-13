/**
 * NoiseTexture - Subtle paper/grain texture overlay
 * Matches prototype's TextureOverlay: feTurbulence at 4% opacity, mix-blend-overlay
 * Applied globally to all screens for premium tactile feel.
 */

import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, { Rect } from 'react-native-svg';

interface NoiseTextureProps {
  opacity?: number;
}

function NoiseTextureInner({ opacity = 0.04 }: NoiseTextureProps) {
  // React Native SVG doesn't support feTurbulence, so we use a deterministic
  // dot pattern that gives a similar subtle grain effect.
  // The pattern is extremely subtle at 4% opacity — just enough to add tactile depth.
  const dots: React.ReactElement[] = [];
  const size = 200;
  const spacing = 8;

  for (let y = 0; y < size; y += spacing) {
    for (let x = 0; x < size; x += spacing) {
      // Pseudo-random offset for organic feel
      const hash = ((x * 7 + y * 13) % 17) / 17;
      const ox = (hash - 0.5) * 4;
      const oy = (((x * 11 + y * 3) % 13) / 13 - 0.5) * 4;
      const r = 0.5 + hash * 1.5;
      dots.push(
        <Rect
          key={`${x}-${y}`}
          x={x + ox}
          y={y + oy}
          width={r}
          height={r}
          fill="white"
          opacity={0.3 + hash * 0.7}
        />
      );
    }
  }

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox={`0 0 ${size} ${size}`} preserveAspectRatio="none">
        {dots}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: -1,
  },
});

export const NoiseTexture = React.memo(NoiseTextureInner);
