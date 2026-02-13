/**
 * WelcomeBack - Graceful broken streak message
 * Shows encouraging message when user returns after a streak break.
 * NO shame messaging — purely welcoming.
 *
 * Story 5.2: Streak Tracking - Task 7 (AC#4)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { Heart } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface WelcomeBackProps {
  dueReviews: number;
}

export function WelcomeBack({ dueReviews }: WelcomeBackProps) {
  return (
    <View
      testID="welcome-back"
      style={{
        backgroundColor: 'rgba(15, 46, 40, 0.04)',
        borderWidth: 1,
        borderColor: 'rgba(15, 46, 40, 0.08)',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
      }}>
      <Heart color={colors.gold} size={24} fill={colors.gold} />
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 22,
          color: colors.emeraldDeep,
          marginTop: 12,
        }}>
        Welcome back!
      </Text>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 14,
          color: 'rgba(15, 46, 40, 0.6)',
          textAlign: 'center',
          marginTop: 6,
        }}>
        Your knowledge is still here.
      </Text>
      {dueReviews > 0 && (
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 14,
            fontWeight: '600',
            color: colors.emeraldDeep,
            marginTop: 8,
          }}>
          {dueReviews} words ready for review.
        </Text>
      )}
    </View>
  );
}
