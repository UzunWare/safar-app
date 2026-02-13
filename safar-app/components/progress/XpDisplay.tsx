/**
 * XpDisplay - Total XP points display with star icon
 * Divine Geometry design — gold accent on parchment
 * Story 5.4 - Task 3
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Star } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface XpDisplayProps {
  totalXp: number;
  compact?: boolean;
}

export function XpDisplay({ totalXp, compact = false }: XpDisplayProps) {
  if (compact) {
    return (
      <View testID="xp-display" style={{ flexDirection: 'row', alignItems: 'center' }}>
        <Star color={colors.gold} size={16} fill={colors.gold} />
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 14,
            fontWeight: '600',
            color: colors.emeraldDeep,
            marginLeft: 4,
          }}>
          {totalXp}
        </Text>
      </View>
    );
  }

  return (
    <View
      testID="xp-display"
      style={{
        flex: 1,
        backgroundColor: '#ffffff',
        padding: 20,
        borderRadius: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.03,
        shadowRadius: 6,
        elevation: 1,
        borderWidth: 1,
        borderColor: 'rgba(15, 46, 40, 0.05)',
      }}>
      <View
        style={{
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(207, 170, 107, 0.2)',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 12,
        }}>
        <Star color={colors.gold} size={20} fill={colors.gold} />
      </View>
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 30,
          color: colors.emeraldDeep,
        }}>
        {totalXp}
      </Text>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 10,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: colors.emeraldDeep,
          opacity: 0.5,
        }}>
        Total XP
      </Text>
    </View>
  );
}
