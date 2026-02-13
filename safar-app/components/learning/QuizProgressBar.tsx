import React from 'react';
import { View, Text } from 'react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface QuizProgressBarProps {
  totalQuestions: number;
  currentIndex: number;
  answerHistory: ('correct' | 'incorrect')[];
}

const MAX_SEGMENTS = 20;

function getSegmentColor(
  segmentIndex: number,
  segmentCount: number,
  totalQuestions: number,
  currentIndex: number,
  answerHistory: ('correct' | 'incorrect')[]
): string {
  if (totalQuestions <= 0) return colors.white[10];

  const start = Math.floor((segmentIndex * totalQuestions) / segmentCount);
  const endExclusive = Math.floor(((segmentIndex + 1) * totalQuestions) / segmentCount);
  const end = Math.max(start, endExclusive - 1);

  if (end < answerHistory.length) {
    const segmentAnswers = answerHistory.slice(start, end + 1);
    return segmentAnswers.includes('incorrect') ? colors.rating.again : colors.rating.easy;
  }

  if (currentIndex >= start && currentIndex <= end) {
    return colors.goldAlpha[30];
  }

  return colors.white[10];
}

export function QuizProgressBar({
  totalQuestions,
  currentIndex,
  answerHistory,
}: QuizProgressBarProps) {
  const safeTotal = Math.max(totalQuestions, 0);
  const safeCurrent = safeTotal > 0 ? Math.min(currentIndex + 1, safeTotal) : 0;
  const segmentCount = Math.max(1, Math.min(safeTotal || 1, MAX_SEGMENTS));
  const correctCount = answerHistory.filter((result) => result === 'correct').length;
  const incorrectCount = answerHistory.filter((result) => result === 'incorrect').length;

  return (
    <View
      testID="quiz-progress-bar"
      accessibilityRole="progressbar"
      accessibilityLabel={`Question ${safeCurrent} of ${safeTotal}. ${correctCount} correct, ${incorrectCount} incorrect.`}
      accessibilityValue={{
        min: 0,
        max: safeTotal,
        now: safeCurrent,
      }}
      style={{ paddingHorizontal: 20, paddingBottom: 16 }}>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 13,
          color: colors.cream,
          opacity: 0.6,
          letterSpacing: 0.5,
          marginBottom: 8,
        }}>
        Question {safeCurrent} of {safeTotal}
      </Text>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 12,
          color: colors.cream,
          opacity: 0.7,
          marginBottom: 8,
        }}>
        Correct: {correctCount} Incorrect: {incorrectCount}
      </Text>
      <View
        style={{
          flexDirection: 'row',
          gap: 3,
          height: 6,
          borderRadius: 3,
          overflow: 'hidden',
        }}>
        {Array.from({ length: segmentCount }).map((_, i) => (
          <View
            key={i}
            testID={`progress-segment-${i}`}
            style={{
              flex: 1,
              height: 6,
              borderRadius: 3,
              backgroundColor: getSegmentColor(
                i,
                segmentCount,
                safeTotal,
                currentIndex,
                answerHistory
              ),
            }}
          />
        ))}
      </View>
    </View>
  );
}
