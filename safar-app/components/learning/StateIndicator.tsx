/**
 * StateIndicator Component
 *
 * Visual indicator for word learning states.
 * Displays a colored dot (and optional label) representing the state.
 *
 * Story 4.6: Word Learning States - Task 4 (AC#1)
 */

import React from 'react';
import { View, Text } from 'react-native';
import { getStateColor, getStateLabel, type LearningState } from '@/lib/utils/learningState';

interface StateIndicatorProps {
  state: LearningState;
  showLabel?: boolean;
}

/**
 * AC#1: Color-coded state indicator
 * - New: gray (#9CA3AF)
 * - Learning: amber (#F59E0B)
 * - Review: orange (#F97316)
 * - Mastered: emerald (#10B981)
 */
export function StateIndicator({ state, showLabel = false }: StateIndicatorProps) {
  const color = getStateColor(state);
  const label = getStateLabel(state);

  return (
    <View className="flex-row items-center" testID="state-indicator">
      <View
        style={{ backgroundColor: color }}
        className="h-3 w-3 rounded-full"
        testID="state-dot"
      />
      {showLabel && <Text className="ml-2 text-sm text-gray-600">{label}</Text>}
    </View>
  );
}
