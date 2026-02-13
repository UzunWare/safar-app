import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import {
  calculateNextReview,
  formatInterval,
  type DifficultyRating as Rating,
  type SM2Input,
} from '@/lib/utils/sm2';

const RATING_CONFIG = [
  { label: 'Again', quality: 0 as Rating, color: colors.rating.again },
  { label: 'Hard', quality: 1 as Rating, color: colors.rating.hard },
  { label: 'Good', quality: 2 as Rating, color: colors.rating.good },
  { label: 'Easy', quality: 3 as Rating, color: colors.rating.easy },
] as const;

interface DifficultyRatingProps {
  currentProgress: SM2Input;
  onRate: (rating: Rating) => void;
  disabled?: boolean;
}

export function DifficultyRating({
  currentProgress,
  onRate,
  disabled = false,
}: DifficultyRatingProps) {
  const intervals = RATING_CONFIG.map(
    ({ quality }) => calculateNextReview(quality, currentProgress).interval
  );

  return (
    <View
      testID="difficulty-rating"
      style={{
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        gap: 8,
      }}>
      {RATING_CONFIG.map((config, index) => {
        const intervalText = formatInterval(intervals[index]);

        return (
          <Pressable
            key={config.label}
            onPress={() => !disabled && onRate(config.quality)}
            disabled={disabled}
            accessibilityRole="button"
            accessibilityLabel={`Rate as ${config.label}, next review in ${intervalText}`}
            style={{
              flex: 1,
              backgroundColor: config.color,
              paddingVertical: 14,
              borderRadius: 16,
              alignItems: 'center',
              opacity: disabled ? 0.5 : 1,
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                fontWeight: '600',
                color: '#ffffff',
                marginBottom: 2,
              }}>
              {config.label}
            </Text>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 12,
                color: 'rgba(255, 255, 255, 0.8)',
              }}>
              {intervalText}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
