/**
 * PurchaseSuccessModal - Celebration modal after successful subscription
 *
 * Shows "Welcome to Safar Premium!" with celebration animation
 * and a continue button. Uses Divine Geometry palette.
 *
 * Story 6.4: Purchase Flow - Task 4
 */

import React from 'react';
import { View, Text, Pressable, Modal } from 'react-native';
import LottieView from 'lottie-react-native';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface PurchaseSuccessModalProps {
  visible: boolean;
  onDismiss: () => void;
}

export function PurchaseSuccessModal({ visible, onDismiss }: PurchaseSuccessModalProps) {
  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      onRequestClose={onDismiss}>
      <View
        testID="purchase-success-modal"
        style={{
          flex: 1,
          backgroundColor: 'rgba(10, 31, 27, 0.92)',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 32,
        }}>
        <View
          style={{
            borderRadius: 24,
            padding: 32,
            backgroundColor: colors.emeraldDeep,
            borderWidth: 1,
            borderColor: 'rgba(207, 170, 107, 0.24)',
            alignItems: 'center',
            width: '100%',
            maxWidth: 340,
          }}>
          {/* Celebration animation */}
          <View
            testID="celebration-icon"
            style={{
              width: 80,
              height: 80,
              borderRadius: 40,
              backgroundColor: 'rgba(207, 170, 107, 0.15)',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 20,
            }}>
            <LottieView
              testID="celebration-animation"
              source={require('@/assets/animations/celebration.json')}
              autoPlay
              loop={false}
              style={{ width: 72, height: 72 }}
            />
          </View>

          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 24,
              color: colors.cream,
              textAlign: 'center',
              marginBottom: 12,
            }}>
            Welcome to Safar Premium!
          </Text>

          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 15,
              color: 'rgba(232, 220, 197, 0.7)',
              textAlign: 'center',
              marginBottom: 28,
              lineHeight: 22,
            }}>
            You now have full access to all content and features.
          </Text>

          <Pressable
            onPress={onDismiss}
            accessibilityRole="button"
            accessibilityLabel="Continue Learning"
            style={{
              borderRadius: 14,
              backgroundColor: colors.gold,
              paddingVertical: 14,
              paddingHorizontal: 32,
              alignItems: 'center',
              width: '100%',
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 15,
                color: colors.midnight,
                fontWeight: '700',
              }}>
              Continue Learning
            </Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}