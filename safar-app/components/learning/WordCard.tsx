/**
 * WordCard Component
 * Story 3.2: Word Card Display
 *
 * Displays a vocabulary word with Arabic text, transliteration,
 * meaning, root indicator, and audio button.
 * Follows Divine Geometry design system.
 */

import { View, Text, Pressable } from 'react-native';
import { Search, ChevronRight } from 'lucide-react-native';
import { Word, Root } from '@/types';
import { fonts } from '@/constants';
import { colors } from '@/constants/colors';
import { AudioButton } from './AudioButton';
import { StateIndicator } from './StateIndicator';
import { useWordState } from '@/lib/hooks/useWordState';
import '@/global.css';

export interface WordCardProps {
  word: Word;
  root?: Root;
  onRootTap: (rootId: string) => void;
  onAudioPlay?: () => void;
  showLearningState?: boolean; // Story 4.6: Optional state indicator
}

export function WordCard({
  word,
  root,
  onRootTap,
  onAudioPlay,
  showLearningState = false,
}: WordCardProps) {
  const { state } = useWordState(word.id);

  const accessibilityLabel = root
    ? `Arabic word ${word.transliteration}, meaning ${word.meaning}, from root ${root.letters}`
    : `Arabic word ${word.transliteration}, meaning ${word.meaning}`;

  return (
    <View
      style={{
        borderRadius: 32,
        backgroundColor: colors.parchment,
        padding: 32,
        borderWidth: 1,
        borderColor: 'rgba(207, 170, 107, 0.2)',
        overflow: 'hidden',
      }}
      accessible={true}
      accessibilityLabel={accessibilityLabel}>
      {/* Decorative gold corner accent - top right */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 80,
          height: 80,
          backgroundColor: 'rgba(207, 170, 107, 0.15)',
          borderBottomLeftRadius: 64,
        }}
      />

      {/* Header: Word Analysis pill + Learning State + Audio button */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View
            style={{
              paddingHorizontal: 12,
              paddingVertical: 6,
              backgroundColor: 'rgba(15, 46, 40, 0.08)',
              borderRadius: 20,
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.emeraldDeep,
                opacity: 0.6,
              }}>
              Word Analysis
            </Text>
          </View>
          {/* Story 4.6: Learning state indicator (AC#1) */}
          {showLearningState && <StateIndicator state={state} showLabel />}
        </View>
        <AudioButton audioUrl={word.audio_url} onPlay={onAudioPlay} />
      </View>

      {/* Arabic word - prominent display */}
      <Text
        style={{
          fontFamily: fonts.amiri,
          fontSize: 48,
          writingDirection: 'rtl',
          color: colors.emeraldDeep,
          lineHeight: 80,
          marginBottom: 24,
        }}>
        {word.arabic}
      </Text>

      {/* Translation section */}
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 11,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: colors.emeraldDeep,
            opacity: 0.4,
            marginBottom: 6,
          }}>
          Translation
        </Text>
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 24,
            color: colors.emeraldDeep,
            marginBottom: 4,
          }}>
          {word.transliteration}
        </Text>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 18,
            color: colors.emeraldDeep,
            opacity: 0.7,
          }}>
          {word.meaning}
        </Text>
      </View>

      {/* Root indicator - tappable card */}
      {root && (
        <Pressable
          onPress={() => onRootTap(root.id)}
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            padding: 16,
            borderRadius: 16,
            backgroundColor: 'rgba(207, 170, 107, 0.1)',
            borderWidth: 1,
            borderColor: 'rgba(207, 170, 107, 0.2)',
            minWidth: 44,
            minHeight: 44,
            gap: 16,
          }}
          accessibilityRole="button"
          accessibilityLabel={`Explore root ${root.letters}`}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 20,
              backgroundColor: colors.emeraldDeep,
              alignItems: 'center',
              justifyContent: 'center',
            }}>
            <Search size={16} color={colors.gold} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: colors.emeraldDeep,
                opacity: 0.6,
              }}>
              Root Family
            </Text>
            <Text
              style={{
                fontFamily: fonts.amiri,
                fontSize: 22,
                color: colors.emeraldDeep,
              }}>
              {root.letters}
            </Text>
          </View>
          <ChevronRight size={16} color={colors.emeraldDeep} style={{ opacity: 0.5 }} />
        </Pressable>
      )}
    </View>
  );
}
