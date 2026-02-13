/**
 * IslamicPattern - Geometric background pattern
 * Matches prototype's BackgroundPattern: diamond + circle + inner diamond
 * SVG pattern tile at configurable opacity.
 */

import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, G } from 'react-native-svg';

interface IslamicPatternProps {
  opacity?: number;
  color?: string;
}

const TILE_SIZE = 100;

function IslamicPatternInner({ opacity = 0.05, color = '#78350f' }: IslamicPatternProps) {
  const { width, height } = Dimensions.get('window');
  const cols = Math.ceil(width / TILE_SIZE) + 1;
  const rows = Math.ceil(height / TILE_SIZE) + 1;

  const tiles: React.ReactElement[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * TILE_SIZE;
      const y = row * TILE_SIZE;
      tiles.push(
        <G key={`${row}-${col}`} transform={`translate(${x}, ${y})`}>
          {/* Outer diamond */}
          <Path d="M50 0 L100 50 L50 100 L0 50 Z" fill="none" stroke={color} strokeWidth={1} />
          {/* Center circle */}
          <Circle cx={50} cy={50} r={20} fill="none" stroke={color} strokeWidth={0.5} />
          {/* Inner diamond */}
          <Path
            d="M50 20 L80 50 L50 80 L20 50 Z"
            fill="none"
            stroke={color}
            strokeWidth={0.5}
            opacity={0.5}
          />
        </G>
      );
    }
  }

  return (
    <View style={[styles.container, { opacity }]} pointerEvents="none">
      <Svg width={width} height={height}>
        {tiles}
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

export const IslamicPattern = React.memo(IslamicPatternInner);
