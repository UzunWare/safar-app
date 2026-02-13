/**
 * ReviewCard - Spaced repetition review card with tap-to-reveal
 * Shows Arabic word first, tap to reveal meaning/transliteration
 * Divine Geometry Design - Parchment card on midnight background
 */

import React, { useState } from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface ReviewCardWord {
  id: string;
  arabic: string;
  transliteration: string;
  meaning: string;
  audio_url: string | null;
}

interface ReviewCardProps {
  word: ReviewCardWord;
  onReveal: () => void;
}

export function ReviewCard({ word, onReveal }: ReviewCardProps) {
  const [revealed, setRevealed] = useState(false);

  const handleReveal = () => {
    if (!revealed) {
      setRevealed(true);
      onReveal();
    }
  };

  return (
    <Pressable
      testID="review-card"
      onPress={handleReveal}
      accessibilityRole="button"
      accessibilityLabel={
        revealed ? `${word.arabic} means ${word.meaning}` : 'Tap to reveal meaning'
      }
      style={{
        backgroundColor: colors.parchment,
        borderRadius: 24,
        padding: 40,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(207, 170, 107, 0.2)',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        elevation: 4,
        minHeight: 280,
        justifyContent: 'center',
      }}>
      {/* Arabic word (always visible) */}
      <Text
        testID="review-card-arabic"
        style={{
          fontFamily: fonts.amiri,
          fontSize: 56,
          color: colors.emeraldDeep,
          textAlign: 'center',
          lineHeight: 100,
        }}>
        {word.arabic}
      </Text>

      {revealed ? (
        <View testID="review-card-revealed" style={{ alignItems: 'center', marginTop: 16 }}>
          {/* Divider */}
          <View
            style={{
              width: 40,
              height: 1,
              backgroundColor: colors.goldAlpha[30],
              marginBottom: 16,
            }}
          />

          {/* Transliteration */}
          <Text
            testID="review-card-transliteration"
            style={{
              fontFamily: fonts.outfit,
              fontSize: 18,
              color: 'rgba(15, 46, 40, 0.5)',
              marginBottom: 8,
            }}>
            {word.transliteration}
          </Text>

          {/* Meaning */}
          <Text
            testID="review-card-meaning"
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 24,
              color: colors.emeraldDeep,
              textAlign: 'center',
            }}>
            {word.meaning}
          </Text>
        </View>
      ) : (
        <View testID="review-card-prompt" style={{ marginTop: 24 }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.4)',
              letterSpacing: 1,
              textTransform: 'uppercase',
            }}>
            Tap to reveal
          </Text>
        </View>
      )}
    </Pressable>
  );
}
