/**
 * ContentPreview - Shows limited word preview with blur overlay
 *
 * Displays first N words from a lesson with remaining content obscured.
 * Used in paywall enforcement to let users preview lesson content.
 *
 * Story 6.5: Paywall Enforcement - Task 3
 */

import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface PreviewWord {
  id: string;
  arabic: string;
  transliteration?: string;
  meaning?: string;
}

interface ContentPreviewProps {
  words: PreviewWord[];
  previewCount?: number;
}

export function ContentPreview({ words, previewCount = 2 }: ContentPreviewProps) {
  if (words.length === 0) {
    return (
      <View testID="content-preview-empty" style={{ padding: 24, alignItems: 'center' }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 14,
            color: colors.cream,
            opacity: 0.5,
          }}>
          No content available
        </Text>
      </View>
    );
  }

  const previewWords = words.slice(0, previewCount);
  const remainingCount = Math.max(0, words.length - previewCount);
  const hasMore = remainingCount > 0;

  return (
    <View style={{ paddingHorizontal: 24, paddingTop: 16 }}>
      {/* Preview words */}
      <View
        style={{
          flexDirection: 'row-reverse',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: 12,
          marginBottom: 16,
        }}>
        {previewWords.map((word) => (
          <View
            key={word.id}
            style={{
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 12,
              backgroundColor: 'rgba(207, 170, 107, 0.08)',
              borderWidth: 1,
              borderColor: 'rgba(207, 170, 107, 0.15)',
              alignItems: 'center',
            }}>
            <Text
              style={{
                fontFamily: fonts.amiri,
                fontSize: 32,
                lineHeight: 64,
                color: colors.cream,
              }}>
              {word.arabic}
            </Text>
            {word.transliteration && (
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 12,
                  color: colors.cream,
                  opacity: 0.5,
                  marginTop: 2,
                }}>
                {word.transliteration}
              </Text>
            )}
          </View>
        ))}
      </View>

      {/* Blur overlay for remaining content */}
      {hasMore && (
        <View
          testID="content-blur-overlay"
          style={{
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
            backgroundColor: 'rgba(10, 31, 27, 0.6)',
            borderWidth: 1,
            borderColor: 'rgba(207, 170, 107, 0.1)',
          }}>
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 18,
              color: colors.gold,
              marginBottom: 6,
            }}>
            Subscribe to continue
          </Text>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 13,
              color: colors.cream,
              opacity: 0.5,
            }}>
            {remainingCount} more word{remainingCount !== 1 ? 's' : ''} in this lesson
          </Text>
        </View>
      )}
    </View>
  );
}
