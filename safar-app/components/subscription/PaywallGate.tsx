/**
 * PaywallGate - Content gating component
 *
 * Two modes:
 * 1. Standalone (no children): Shows paywall card (backward compatible)
 * 2. Wrapper (with children): Checks entitlement, shows children or paywall
 *
 * Supports content preview and lapsed subscription messaging.
 *
 * Story 6.5: Paywall Enforcement - Task 1
 */

import React from 'react';
import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSubscriptionStore } from '@/lib/stores/useSubscriptionStore';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

interface PaywallGateProps {
  children?: React.ReactNode;
  preview?: React.ReactNode;
  title?: string;
  message?: string;
}

export function PaywallGate({ children, preview, title, message }: PaywallGateProps) {
  const isPremium = useSubscriptionStore((s) => s.isPremium);
  const isTrialActive = useSubscriptionStore((s) => s.isTrialActive);
  const isLoading = useSubscriptionStore((s) => s.isLoading);
  const entitlementStatus = useSubscriptionStore((s) => s.entitlementStatus);

  const hasAccess = isPremium || isTrialActive;

  // Wrapper mode: check entitlement and show children or paywall
  if (children) {
    if (isLoading) {
      return (
        <View
          testID="paywall-gate-loading"
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size="large" color={colors.gold} />
        </View>
      );
    }

    if (hasAccess) {
      return <>{children}</>;
    }

    // No access: show preview + paywall
    return (
      <View style={{ flex: 1 }}>
        {preview}
        <PaywallCard entitlementStatus={entitlementStatus} title={title} message={message} />
      </View>
    );
  }

  // Standalone mode: render optional preview above paywall card
  if (preview) {
    return (
      <View style={{ flex: 1 }}>
        {preview}
        <PaywallCard entitlementStatus={entitlementStatus} title={title} message={message} />
      </View>
    );
  }

  return <PaywallCard entitlementStatus={entitlementStatus} title={title} message={message} />;
}

function PaywallCard({
  entitlementStatus,
  title,
  message,
}: {
  entitlementStatus: string;
  title?: string;
  message?: string;
}) {
  const isLapsed = entitlementStatus === 'expired';

  const resolvedTitle = title ?? (isLapsed ? 'Welcome back!' : 'Trial ended');
  const resolvedMessage =
    message ??
    (isLapsed
      ? 'Renew your subscription to continue learning.'
      : 'Subscribe to continue learning lessons and reviews.');

  return (
    <View
      testID="paywall-gate"
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 24,
      }}>
      <View
        style={{
          width: '100%',
          maxWidth: 360,
          borderRadius: 24,
          padding: 24,
          backgroundColor: 'rgba(207, 170, 107, 0.12)',
          borderWidth: 1,
          borderColor: 'rgba(207, 170, 107, 0.25)',
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 28,
            color: colors.cream,
            textAlign: 'center',
            marginBottom: 8,
          }}>
          {resolvedTitle}
        </Text>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 15,
            color: 'rgba(232, 220, 197, 0.82)',
            textAlign: 'center',
            lineHeight: 22,
            marginBottom: 20,
          }}>
          {resolvedMessage}
        </Text>

        <Pressable
          testID="paywall-subscribe-cta"
          onPress={() => router.push('/subscription')}
          accessibilityRole="button"
          accessibilityLabel="Start Subscription"
          style={{
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 14,
            backgroundColor: colors.gold,
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 15,
              color: colors.midnight,
              fontWeight: '700',
            }}>
            Start Subscription
          </Text>
        </Pressable>
      </View>
    </View>
  );
}
