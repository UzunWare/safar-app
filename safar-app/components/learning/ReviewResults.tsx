/**
 * ReviewResults - Review session completion screen
 * Shows stats: words reviewed, time spent
 * Divine Geometry Design - Midnight background with gold accents
 */

import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { CheckCircle } from 'lucide-react-native';
import { XpGainAnimation } from '@/components/progress/XpGainAnimation';

interface ReviewResultsProps {
  wordsReviewed: number;
  xpEarned?: number;
  onDone: () => void;
}

export function ReviewResults({ wordsReviewed, xpEarned, onDone }: ReviewResultsProps) {
  return (
    <View
      testID="review-results"
      style={{
        flex: 1,
        backgroundColor: colors.midnight,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 32,
      }}>
      {xpEarned != null && xpEarned > 0 && (
        <View
          style={{
            position: 'absolute',
            top: '40%',
            left: 0,
            right: 0,
            zIndex: 10,
          }}
          pointerEvents="none">
          <XpGainAnimation amount={xpEarned} />
        </View>
      )}

      {/* Celebration icon */}
      <View
        testID="review-celebration"
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: colors.gold,
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 32,
          shadowColor: colors.gold,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.4,
          shadowRadius: 24,
          elevation: 8,
        }}>
        <CheckCircle color={colors.midnight} size={40} />
      </View>

      {/* Title */}
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 30,
          color: colors.cream,
          textAlign: 'center',
          marginBottom: 8,
        }}>
        Reviews Complete!
      </Text>

      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 16,
          color: 'rgba(232, 220, 197, 0.6)',
          textAlign: 'center',
          marginBottom: 40,
        }}>
        Great work reinforcing your vocabulary
      </Text>

      {/* Stats card */}
      <View
        testID="review-results-stats"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 20,
          padding: 24,
          width: '100%',
          borderWidth: 1,
          borderColor: 'rgba(207, 170, 107, 0.15)',
          marginBottom: 40,
        }}>
        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 40 }}>
          <View style={{ alignItems: 'center' }}>
            <Text
              testID="review-results-count"
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 36,
                color: colors.gold,
              }}>
              {wordsReviewed}
            </Text>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'rgba(232, 220, 197, 0.5)',
                marginTop: 4,
              }}>
              Words Reviewed
            </Text>
          </View>
          {xpEarned != null && xpEarned > 0 && (
            <View style={{ alignItems: 'center' }}>
              <Text
                testID="review-results-xp"
                style={{
                  fontFamily: fonts.fraunces,
                  fontSize: 36,
                  color: colors.gold,
                }}>
                +{xpEarned}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'rgba(232, 220, 197, 0.5)',
                  marginTop: 4,
                }}>
                XP Earned
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Done button */}
      <Pressable
        testID="review-done-button"
        onPress={onDone}
        style={{
          backgroundColor: colors.gold,
          paddingVertical: 18,
          paddingHorizontal: 48,
          borderRadius: 16,
          shadowColor: colors.gold,
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 12,
          elevation: 4,
        }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 18,
            fontWeight: '600',
            color: colors.midnight,
          }}>
          Done
        </Text>
      </Pressable>
    </View>
  );
}
