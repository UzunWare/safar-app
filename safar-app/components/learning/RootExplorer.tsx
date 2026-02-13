/**
 * RootExplorer Component
 * Story 3.3: Root Explorer - The "Aha Moment"
 *
 * Radial "bloom" visualization showing a central root circle
 * with derivative word tiles radiating outward in a diamond pattern.
 * Core differentiator feature of the Safar app.
 */

import { useState, useEffect, useRef } from 'react';
import { View, Text, Pressable, AccessibilityInfo } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { useAnimatedStyle, withSpring, withTiming } from 'react-native-reanimated';
import type { Word, Root } from '@/types';
import { fonts } from '@/constants';
import { colors } from '@/constants/colors';
import { trackEvent, AnalyticsEvents } from '@/lib/utils/analytics';
import '@/global.css';

export interface RootExplorerProps {
  root: Root;
  relatedWords: Word[];
  isExpanded: boolean;
  onCollapse: () => void;
  wordId: string;
  lessonId?: string;
  fullScreen?: boolean; // Full-screen mode for Root Garden browse
}

// Layout constants (Mobile-adapted from prototype - 375px screen width)
const ROOT_CIRCLE_SIZE = 100; // Mobile-friendly, was 128px desktop
const TILE_SIZE = 64; // Mobile-friendly, was 80px desktop
const BLOOM_RADIUS_INLINE = 110; // Inline mode compact preview
const BLOOM_RADIUS_FULLSCREEN = 145; // Increased to match prototype ratio (58.6% vs 37.5%)
const CONTAINER_HEIGHT_INLINE = 320; // Tighter inline
const CONTAINER_HEIGHT_FULLSCREEN = 500; // Mobile-appropriate
const BLOOM_AREA_SIZE_INLINE = 280; // Fits 375px screen
const BLOOM_AREA_HEIGHT_INLINE = 260;
const BLOOM_AREA_SIZE_FULLSCREEN = 320; // Fits 375px screen (not 450px!)

function getDerivativePosition(index: number, totalWords: number, bloomRadius: number) {
  // Evenly distribute words around circle with visually balanced starting position
  // 1 word: -90° (top)
  // 2 words: -45°, 135° (diagonal corners)
  // 3 words: -90°, 30°, 150° (top, bottom-right, bottom-left)
  // 4 words: -45°, 45°, 135°, 225° (diamond corners)
  // 5+ words: evenly distributed starting from -90° (top)

  const angleStep = 360 / totalWords;

  // Starting angle offset for visual balance
  let angleOffset: number;
  if (totalWords === 1) {
    angleOffset = -90; // Single word at top
  } else if (totalWords === 2) {
    angleOffset = -45; // Two words at diagonal corners
  } else if (totalWords === 4) {
    angleOffset = -45; // Four words as diamond (preserve current behavior)
  } else {
    angleOffset = -90; // Other counts start from top
  }

  const angle = index * angleStep + angleOffset;
  const rad = (angle * Math.PI) / 180;
  return {
    x: Math.cos(rad) * bloomRadius,
    y: Math.sin(rad) * bloomRadius,
    angle,
  };
}

export function RootExplorer({
  root,
  relatedWords,
  isExpanded,
  onCollapse,
  wordId,
  lessonId,
  fullScreen = false,
}: RootExplorerProps) {
  const router = useRouter();
  const [reduceMotion, setReduceMotion] = useState(false);
  const hasTracked = useRef(false);

  // Adjust layout constants based on mode
  const BLOOM_RADIUS = fullScreen ? BLOOM_RADIUS_FULLSCREEN : BLOOM_RADIUS_INLINE;
  const CONTAINER_HEIGHT = fullScreen ? CONTAINER_HEIGHT_FULLSCREEN : CONTAINER_HEIGHT_INLINE;
  const BLOOM_AREA_WIDTH = fullScreen ? BLOOM_AREA_SIZE_FULLSCREEN : BLOOM_AREA_SIZE_INLINE;
  const BLOOM_AREA_HEIGHT = fullScreen ? BLOOM_AREA_SIZE_FULLSCREEN : BLOOM_AREA_HEIGHT_INLINE;
  const maxWords = fullScreen ? 8 : 4;

  useEffect(() => {
    AccessibilityInfo.isReduceMotionEnabled().then(setReduceMotion);
    const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
    return () => subscription.remove();
  }, []);

  // Track root_tapped analytics event when panel expands
  useEffect(() => {
    if (isExpanded && !hasTracked.current) {
      hasTracked.current = true;
      trackEvent(AnalyticsEvents.ROOT_TAPPED, {
        root_id: root.id,
        root_letters: root.letters,
        word_id: wordId,
        source: fullScreen ? 'browse' : 'lesson',
        ...(lessonId && { lesson_id: lessonId }),
      });
    }
    if (!isExpanded) {
      hasTracked.current = false;
    }
  }, [isExpanded, root.id, root.letters, wordId, lessonId, fullScreen]);

  // Container animation (height + opacity)
  const containerStyle = useAnimatedStyle(() => {
    const height = isExpanded ? CONTAINER_HEIGHT : 0;
    const opacity = isExpanded ? 1 : 0;

    if (reduceMotion) {
      return {
        height: withTiming(height, { duration: 0 }),
        opacity: withTiming(opacity, { duration: 0 }),
      };
    }

    return {
      height: withSpring(height, { damping: 15 }),
      opacity: withTiming(opacity, { duration: 200 }),
    };
  });

  const displayWords = relatedWords.slice(0, maxWords);

  return (
    <Animated.View style={containerStyle}>
      <View
        className="mt-2 items-center"
        style={{ height: CONTAINER_HEIGHT, overflow: 'visible' }}
        accessible={true}
        accessibilityLabel={`Root ${root.letters} means ${root.meaning}`}>
        {/* Radial bloom area */}
        <View
          className="items-center justify-center"
          style={{ width: BLOOM_AREA_WIDTH, height: BLOOM_AREA_HEIGHT }}>
          {/* Connecting lines */}
          {displayWords.map((_, idx) => {
            const { angle } = getDerivativePosition(idx, displayWords.length, BLOOM_RADIUS);
            return (
              <View
                key={`line-${idx}`}
                style={{
                  position: 'absolute',
                  width: 1,
                  height: BLOOM_RADIUS,
                  backgroundColor: colors.gold,
                  opacity: isExpanded ? 0.5 : 0, // Prototype: bg-[#cfaa6b]/50 (50%), was 0.3
                  top: '50%',
                  left: '50%',
                  transformOrigin: 'top center',
                  transform: [
                    { translateX: -0.5 },
                    { rotate: `${angle - 90}deg` }, // Fixed: was angle + 90, now angle - 90
                  ],
                }}
              />
            );
          })}

          {/* Derivative tiles */}
          {displayWords.map((word, idx) => {
            const { x, y } = getDerivativePosition(idx, displayWords.length, BLOOM_RADIUS);
            return (
              <View
                key={word.id}
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  marginTop: -(TILE_SIZE / 2),
                  marginLeft: -(TILE_SIZE / 2),
                  transform: isExpanded
                    ? [{ translateX: x }, { translateY: y }]
                    : [{ translateX: 0 }, { translateY: 0 }, { scale: 0 }],
                  opacity: isExpanded ? 1 : 0,
                  alignItems: 'center',
                }}>
                <Pressable
                  style={{
                    width: TILE_SIZE,
                    height: TILE_SIZE,
                    backgroundColor: word.lesson_id ? colors.cream : 'rgba(232, 220, 197, 0.4)',
                    borderWidth: 2,
                    borderColor: word.lesson_id ? colors.gold : 'rgba(207, 170, 107, 0.4)',
                    borderRadius: 14,
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: [{ rotate: '45deg' }],
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: word.lesson_id ? 0.2 : 0.1,
                    shadowRadius: 10,
                    elevation: word.lesson_id ? 7 : 3,
                  }}
                  onPress={() => {
                    // Navigate to word's lesson (only if lesson exists)
                    if (word.lesson_id) {
                      router.push(`/lesson/${word.lesson_id}`);
                    }
                  }}
                  disabled={!word.lesson_id}
                  accessibilityRole="button"
                  accessibilityLabel={`${word.transliteration}, ${word.meaning}${!word.lesson_id ? ' (no lesson available)' : ''}`}
                  accessibilityHint={word.lesson_id ? 'Tap to view lesson' : undefined}>
                  {/* Counter-rotate text to keep upright - wrap in View for proper transform isolation */}
                  <View style={{ transform: [{ rotate: '-45deg' }] }}>
                    <Text
                      style={{
                        fontFamily: fonts.amiri,
                        fontSize: fullScreen ? 22 : 18, // Mobile-scaled: 22px fullscreen, 18px inline
                        fontWeight: 'bold',
                        color: colors.emeraldDeep,
                        textAlign: 'center',
                      }}>
                      {word.arabic}
                    </Text>
                  </View>
                </Pressable>
                {/* Transliteration & meaning label below tile */}
                <Text
                  style={{
                    fontFamily: fonts.fraunces,
                    fontSize: fullScreen ? 13 : 11, // Mobile-scaled
                    color: colors.gold,
                    marginTop: fullScreen ? 12 : 8, // Mobile-scaled: 12px fullscreen, 8px inline
                    textAlign: 'center',
                    maxWidth: 80,
                  }}
                  numberOfLines={1}>
                  {word.transliteration}
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: fullScreen ? 11 : 9, // Mobile-scaled
                    color: colors.cream,
                    opacity: 0.7,
                    textAlign: 'center',
                    maxWidth: 80,
                  }}
                  numberOfLines={1}>
                  {word.meaning}
                </Text>
              </View>
            );
          })}

          {/* Root center circle - tappable to collapse (AC #3) */}
          <Pressable
            onPress={onCollapse}
            accessibilityRole="button"
            accessibilityLabel={`Collapse root ${root.letters}`}
            style={{
              width: ROOT_CIRCLE_SIZE,
              height: ROOT_CIRCLE_SIZE,
              borderRadius: ROOT_CIRCLE_SIZE / 2,
              backgroundColor: colors.emeraldDeep,
              borderWidth: 2,
              borderColor: colors.gold,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.gold,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: 0.25,
              shadowRadius: 25,
              elevation: 10,
              zIndex: 20,
            }}>
            <Text
              style={{
                fontFamily: fonts.amiri,
                fontSize: fullScreen ? 32 : 26, // Mobile-scaled: 32px fullscreen, 26px inline
                color: colors.cream,
              }}>
              {root.letters}
            </Text>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 9,
                letterSpacing: 3,
                textTransform: 'uppercase',
                color: colors.gold,
              }}>
              Root
            </Text>
          </Pressable>
        </View>

        {/* Root meaning below bloom */}
        <View
          className="items-center"
          style={{
            opacity: isExpanded ? 1 : 0,
            marginTop: fullScreen ? 20 : 8, // Mobile-scaled: 20px fullscreen, 8px inline
          }}>
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: fullScreen ? 24 : 18, // Mobile-scaled: 24px fullscreen, 18px inline
              color: colors.gold,
              marginBottom: 6,
            }}>
            {root.transliteration
              ? root.transliteration.toUpperCase().split('-').join(' - ')
              : root.letters}
          </Text>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: fullScreen ? 16 : 14, // Mobile-scaled: 16px fullscreen, 14px inline
              color: colors.cream,
              opacity: 0.7,
              marginTop: 2,
            }}>
            {root.meaning}
          </Text>
        </View>
      </View>
    </Animated.View>
  );
}
