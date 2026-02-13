/**
 * StreakCounter - Day streak display with flame icon
 * Divine Geometry design — gold accent on parchment
 * Story 5.1 - Task 3
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface StreakCounterProps {
  count: number;
  isActive?: boolean;
}

export function StreakCounter({ count, isActive = true }: StreakCounterProps) {
  return (
    <View
      testID="streak-counter"
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
        <Flame
          color={isActive ? colors.gold : 'rgba(15, 46, 40, 0.3)'}
          size={20}
          fill={isActive ? colors.gold : 'none'}
        />
      </View>
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 30,
          color: colors.emeraldDeep,
        }}>
        {count}
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
        Day Streak
      </Text>
    </View>
  );
}
