/**
 * FreezeConfirmModal — Confirmation dialog for using streak freeze
 * Divine Geometry design — emerald/gold/cream palette
 * Story 5.3: Streak Freeze — Task 2
 */

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import { Snowflake } from 'lucide-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

export interface FreezeConfirmModalProps {
  visible: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

export function FreezeConfirmModal({
  visible,
  onConfirm,
  onCancel,
  isLoading,
}: FreezeConfirmModalProps) {
  if (!visible) return null;

  return (
    <Modal transparent animationType="fade" visible={visible} onRequestClose={onCancel}>
      <View
        testID="freeze-confirm-modal"
        style={{
          flex: 1,
          backgroundColor: 'rgba(10, 31, 27, 0.7)',
          justifyContent: 'center',
          alignItems: 'center',
          padding: 32,
        }}>
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 24,
            padding: 28,
            width: '100%',
            maxWidth: 340,
            alignItems: 'center',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.12,
            shadowRadius: 24,
            elevation: 8,
          }}>
          {/* Icon */}
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: 'rgba(207, 170, 107, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
            <Snowflake color={colors.gold} size={28} />
          </View>

          {/* Title */}
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 22,
              color: colors.emeraldDeep,
              textAlign: 'center',
              marginBottom: 12,
            }}>
            Use Streak Freeze?
          </Text>

          {/* Explanation */}
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.6)',
              textAlign: 'center',
              lineHeight: 20,
              marginBottom: 24,
            }}>
            This will protect your streak for today. You can use one freeze per week.
          </Text>

          {/* Confirm Button */}
          <Pressable
            onPress={isLoading ? undefined : onConfirm}
            disabled={isLoading}
            style={{
              width: '100%',
              backgroundColor: colors.emeraldDeep,
              borderRadius: 16,
              paddingVertical: 14,
              alignItems: 'center',
              marginBottom: 10,
              opacity: isLoading ? 0.6 : 1,
            }}
            accessibilityRole="button">
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 16,
                fontWeight: '600',
                color: '#ffffff',
              }}>
              Use Freeze
            </Text>
          </Pressable>

          {/* Cancel Button */}
          <Pressable
            onPress={onCancel}
            style={{
              width: '100%',
              paddingVertical: 14,
              alignItems: 'center',
            }}
            accessibilityRole="button">
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 16,
                fontWeight: '500',
                color: 'rgba(15, 46, 40, 0.5)',
              }}>
              Cancel
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}
