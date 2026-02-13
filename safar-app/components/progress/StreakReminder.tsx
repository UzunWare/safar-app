/**
 * StreakReminder - Subtle at-risk streak indicator
 * Shows when it's evening and user hasn't completed activity today.
 * Uses warm gold tones — never guilt-tripping.
 *
 * Story 5.2: Streak Tracking - Task 6 (AC#3)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Flame } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { FreezeStreakStatus } from '@/lib/utils/streak';

interface StreakReminderProps {
  status: FreezeStreakStatus;
  streakCount: number;
  isEvening: boolean;
}

export function StreakReminder({ status, streakCount, isEvening }: StreakReminderProps) {
  if (status !== 'at-risk' || !isEvening) return null;

  return (
    <View
      testID="streak-reminder"
      style={{
        backgroundColor: 'rgba(207, 170, 107, 0.12)',
        borderWidth: 1,
        borderColor: 'rgba(207, 170, 107, 0.2)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <Flame color={colors.gold} size={20} fill={colors.gold} />
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 14,
            fontWeight: '600',
            color: colors.emeraldDeep,
          }}>
          Keep your {streakCount}-day streak going!
        </Text>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 13,
            color: 'rgba(15, 46, 40, 0.6)',
            marginTop: 2,
          }}>
          Complete a quick review or lesson today.
        </Text>
      </View>
    </View>
  );
}
