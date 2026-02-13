import React from 'react';
import { View, Text, Platform } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { QuizOption, type QuizOptionState } from './QuizOption';
import type { QuizQuestionData, QuizOptionData } from '@/lib/utils/quiz';

export type QuizPhase = 'selecting' | 'checked';

interface QuizCardProps {
  question: QuizQuestionData;
  selectedOptionId: string | null;
  phase: QuizPhase;
  onSelectOption: (optionId: string) => void;
}

export function getOptionState(
  option: QuizOptionData,
  selectedOptionId: string | null,
  phase: QuizPhase
): QuizOptionState {
  if (phase === 'selecting') {
    return option.id === selectedOptionId ? 'selected' : 'normal';
  }
  // phase === 'checked'
  if (option.isCorrect && option.id === selectedOptionId) return 'correct';
  if (option.isCorrect) return 'revealed';
  if (option.id === selectedOptionId) return 'incorrect';
  return 'normal';
}

function getOptionTestID(option: QuizOptionData): string {
  if (option.isCorrect) return 'quiz-option-correct';
  return `quiz-option-${option.id}`;
}

export function QuizCard({ question, selectedOptionId, phase, onSelectOption }: QuizCardProps) {
  const isChecked = phase === 'checked';

  return (
    <View
      testID="quiz-card"
      style={{
        backgroundColor: colors.cream,
        borderRadius: 28,
        paddingVertical: 32,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: colors.goldAlpha[30],
        minHeight: 420,
        justifyContent: 'center',
        // Gold ambient glow
        shadowColor: colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
      }}>
      {/* Arabic Word with emerald glow */}
      <View
        style={{
          alignItems: 'center',
          marginBottom: 24,
          paddingTop: 8,
        }}>
        {/* Outer emerald glow */}
        <View
          style={{
            position: 'absolute',
            width: 140,
            height: 140,
            borderRadius: 70,
            backgroundColor: colors.goldAlpha[10],
            top: -10,
          }}
        />
        {/* Inner emerald glow */}
        <View
          style={{
            position: 'absolute',
            width: 100,
            height: 100,
            borderRadius: 50,
            backgroundColor: colors.goldAlpha[20],
            top: 10,
          }}
        />
        <Text
          testID="quiz-arabic-word"
          style={{
            fontFamily: fonts.amiri,
            fontSize: 48,
            lineHeight: 86,
            color: colors.emeraldDeep,
            textAlign: 'center',
            writingDirection: 'rtl',
            ...(Platform.OS === 'android' ? { includeFontPadding: true } : {}),
          }}>
          {question.arabic}
        </Text>
      </View>

      {/* Decorative separator with amber center dot */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
        }}>
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.goldAlpha[20],
          }}
        />
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            marginHorizontal: 12,
            backgroundColor: colors.rating.hard,
          }}
        />
        <View
          style={{
            flex: 1,
            height: 1,
            backgroundColor: colors.goldAlpha[20],
          }}
        />
      </View>

      {/* Question prompt */}
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 18,
          color: colors.emeraldDeep,
          textAlign: 'center',
          marginBottom: 28,
        }}>
        What does this word mean?
      </Text>

      {/* Answer Options */}
      <View
        style={{
          gap: 14,
        }}>
        {question.options.map((option, index) => {
          const optState = getOptionState(option, selectedOptionId, phase);
          return (
            <QuizOption
              key={option.id}
              testID={getOptionTestID(option)}
              label={String.fromCharCode(65 + index)}
              text={option.text}
              state={optState}
              onPress={() => onSelectOption(option.id)}
              disabled={isChecked}
            />
          );
        })}
      </View>
    </View>
  );
}
