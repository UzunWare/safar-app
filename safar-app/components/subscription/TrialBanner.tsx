/**
 * TrialBanner - Premium trial status indicator
 *
 * Shows trial days remaining, end date, and subscribe CTA.
 * Uses Divine Geometry palette: gold accents on cream/emerald.
 * Urgency state (≤2 days) uses solid gold background.
 *
 * Story 6.2: Free Trial Period - Tasks 4, 5, 6
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { router } from 'expo-router';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { useTrialStatus } from '@/lib/hooks/useTrialStatus';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function formatDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}`;
}

export function TrialBanner() {
  const { isInTrial, daysRemaining, endDate, isUrgent } = useTrialStatus();

  if (!isInTrial) return null;

  return (
    <View
      testID="trial-banner"
      style={{
        backgroundColor: isUrgent ? colors.gold : 'rgba(207, 170, 107, 0.12)',
        borderWidth: isUrgent ? 0 : 1,
        borderColor: 'rgba(207, 170, 107, 0.2)',
        borderRadius: 16,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
      }}>
      <View style={{ flex: 1 }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 14,
            fontWeight: '600',
            color: colors.emeraldDeep,
          }}>
          Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
        </Text>
        {endDate && (
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 13,
              color: isUrgent ? 'rgba(15, 46, 40, 0.7)' : 'rgba(15, 46, 40, 0.6)',
              marginTop: 2,
            }}>
            Your trial ends {formatDate(endDate)}
          </Text>
        )}
      </View>
      <Pressable
        testID="trial-subscribe-cta"
        onPress={() => router.push('/subscription')}
        style={{
          backgroundColor: isUrgent ? colors.emeraldDeep : colors.gold,
          paddingHorizontal: 16,
          paddingVertical: 8,
          borderRadius: 12,
        }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 13,
            fontWeight: '600',
            color: isUrgent ? colors.gold : colors.emeraldDeep,
          }}>
          Subscribe now
        </Text>
      </Pressable>
    </View>
  );
}
