/**
 * DiamondBadge - Diamond-shaped milestone badge
 * Matches prototype's rotate-45 badge pattern with earned/unearned states.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface DiamondBadgeProps {
  icon: string;
  name: string;
  earned: boolean;
}

export function DiamondBadge({ icon, name, earned }: DiamondBadgeProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.diamond, earned ? styles.diamondEarned : styles.diamondUnearned]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <Text style={styles.label}>{name}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: 8,
  },
  diamond: {
    width: 56,
    height: 56,
    borderRadius: 12,
    transform: [{ rotate: '45deg' }],
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  diamondEarned: {
    backgroundColor: colors.emeraldDeep,
    borderWidth: 2,
    borderColor: colors.gold,
  },
  diamondUnearned: {
    backgroundColor: colors.parchment,
    borderWidth: 1,
    borderColor: 'rgba(15, 46, 40, 0.1)',
    opacity: 0.5,
  },
  icon: {
    fontSize: 24,
    transform: [{ rotate: '-45deg' }],
  },
  label: {
    fontFamily: fonts.outfit,
    fontSize: 10,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.emeraldDeep,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 4,
  },
});
