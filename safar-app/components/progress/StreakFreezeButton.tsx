/**
 * StreakFreezeButton — Freeze icon/button near streak counter
 * Divine Geometry design — cream/gold accent when available, muted when used
 * Story 5.3: Streak Freeze — Task 1
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { Snowflake } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

export interface StreakFreezeButtonProps {
  isAvailable: boolean;
  nextAvailableDate: string | null;
  onPress: () => void;
}

function formatNextDate(dateStr: string): string {
  const [year, month, day] = dateStr.split('-').map(Number);
  const date = new Date(year, month - 1, day);
  const monthName = date.toLocaleDateString('en-US', { month: 'short' });
  return `Next freeze available ${monthName} ${day}`;
}

export function StreakFreezeButton({
  isAvailable,
  nextAvailableDate,
  onPress,
}: StreakFreezeButtonProps) {
  return (
    <Pressable
      testID="streak-freeze-button"
      onPress={isAvailable ? onPress : undefined}
      disabled={!isAvailable}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 16,
        backgroundColor: isAvailable ? 'rgba(207, 170, 107, 0.12)' : 'rgba(15, 46, 40, 0.04)',
        borderWidth: 1,
        borderColor: isAvailable ? 'rgba(207, 170, 107, 0.25)' : 'rgba(15, 46, 40, 0.06)',
      }}
      accessibilityRole="button"
      accessibilityLabel={
        isAvailable
          ? 'Use streak freeze'
          : `Streak freeze unavailable. ${nextAvailableDate ? formatNextDate(nextAvailableDate) : ''}`
      }>
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 18,
          backgroundColor: isAvailable ? 'rgba(207, 170, 107, 0.2)' : 'rgba(15, 46, 40, 0.06)',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
        <Snowflake color={isAvailable ? colors.gold : 'rgba(15, 46, 40, 0.25)'} size={18} />
      </View>
      <View style={{ marginLeft: 12, flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 14,
            fontWeight: '500',
            color: isAvailable ? colors.emeraldDeep : 'rgba(15, 46, 40, 0.35)',
          }}>
          Streak Freeze
        </Text>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 11,
            color: isAvailable ? colors.gold : 'rgba(15, 46, 40, 0.3)',
            marginTop: 1,
          }}>
          {isAvailable
            ? 'Available'
            : !isAvailable && nextAvailableDate
              ? formatNextDate(nextAvailableDate)
              : 'Used'}
        </Text>
      </View>
      {!isAvailable && (
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 11,
            fontWeight: '600',
            color: 'rgba(15, 46, 40, 0.3)',
            textTransform: 'uppercase',
            letterSpacing: 1,
          }}>
          Used
        </Text>
      )}
    </Pressable>
  );
}
