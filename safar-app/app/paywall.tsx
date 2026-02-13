/**
 * Paywall Screen Route
 *
 * Full-screen paywall showing subscription benefits and plan options.
 * Navigates to subscription screen for purchase.
 *
 * Story 6.5: Paywall Enforcement - Task 2
 */

import React from 'react';
import { View } from 'react-native';
import { router } from 'expo-router';
import { Paywall } from '@/components/subscription/Paywall';
import { useRestore } from '@/lib/hooks/useRestore';
import { colors } from '@/constants/colors';

export default function PaywallScreen() {
  const {
    isRestoring,
    restored,
    noSubscription,
    error: restoreError,
    restore,
    clearError,
  } = useRestore();

  return (
    <View style={{ flex: 1, backgroundColor: colors.midnight }}>
      <Paywall
        variant="fullscreen"
        onDismiss={() => router.back()}
        onSubscribe={() => router.push('/subscription')}
        onRestore={() => void restore()}
        isRestoring={isRestoring}
        restored={restored}
        noSubscription={noSubscription}
        restoreError={restoreError}
        onRetryRestore={() => {
          clearError();
          void restore();
        }}
      />
    </View>
  );
}
