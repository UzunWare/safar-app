/**
 * SubscriptionOption - Selectable subscription plan card
 *
 * Displays plan title, price, period detail, optional savings badge,
 * and recommended label. Uses Divine Geometry palette.
 *
 * Story 6.3: Subscription Options Display - Task 2
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface SubscriptionOptionProps {
  title: string;
  price: string;
  priceDetail: string;
  badge?: string;
  isRecommended?: boolean;
  isSelected?: boolean;
  onSelect: () => void;
  testID?: string;
}

export function SubscriptionOption({
  title,
  price,
  priceDetail,
  badge,
  isRecommended,
  isSelected,
  onSelect,
  testID,
}: SubscriptionOptionProps) {
  const highlighted = isRecommended || isSelected;

  return (
    <Pressable
      testID={testID}
      onPress={onSelect}
      accessibilityRole="button"
      accessibilityLabel={`${title} plan, ${price} ${priceDetail}`}
      style={{
        borderRadius: 18,
        padding: 18,
        backgroundColor: highlighted
          ? 'rgba(207, 170, 107, 0.12)'
          : 'rgba(15, 46, 40, 0.55)',
        borderWidth: highlighted ? 2 : 1,
        borderColor: highlighted
          ? colors.gold
          : 'rgba(207, 170, 107, 0.2)',
      }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 20,
                fontWeight: '600',
                color: colors.cream,
              }}>
              {title}
            </Text>
            {badge && (
              <View
                testID="savings-badge"
                style={{
                  backgroundColor: colors.gold,
                  paddingHorizontal: 10,
                  paddingVertical: 3,
                  borderRadius: 10,
                }}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 12,
                    fontWeight: '700',
                    color: colors.midnight,
                  }}>
                  {badge}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(232, 220, 197, 0.6)',
              marginTop: 2,
            }}>
            {priceDetail}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 26,
            fontWeight: '700',
            color: colors.gold,
          }}>
          {price}
        </Text>
      </View>
      {isRecommended && (
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 12,
            fontWeight: '600',
            color: colors.gold,
            marginTop: 6,
            letterSpacing: 1,
            textTransform: 'uppercase',
          }}>
          Recommended
        </Text>
      )}
    </Pressable>
  );
}
