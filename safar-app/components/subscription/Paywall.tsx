/**
 * Paywall - Reusable subscription paywall component
 *
 * Can be shown as fullscreen or modal. Displays subscription options,
 * features, and dismiss option. Uses Divine Geometry palette.
 *
 * Story 6.3: Subscription Options Display - Task 7
 */

import React, { useMemo, useState } from 'react';
import { View, Text, Pressable, ScrollView, ActivityIndicator, Modal } from 'react-native';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { SubscriptionOption } from '@/components/subscription/SubscriptionOption';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

const FEATURES = [
  'All learning pathways',
  'Unlimited reviews',
  'Offline access',
  'No ads',
] as const;

function calculateSavingsPercent(monthlyPrice: number, annualPrice: number): number {
  if (monthlyPrice <= 0 || annualPrice <= 0) return 0;
  const annualMonthlyPrice = annualPrice / 12;
  const savings = Math.round((1 - annualMonthlyPrice / monthlyPrice) * 100);
  return Math.max(0, savings);
}

interface PaywallProps {
  variant?: 'fullscreen' | 'modal';
  onDismiss: () => void;
  onSubscribe?: (packageType: 'annual' | 'monthly') => void;
  onRestore?: () => void;
  isRestoring?: boolean;
  restored?: boolean;
  noSubscription?: boolean;
  restoreError?: string | null;
  onRetryRestore?: () => void;
}

function PaywallContent({
  onDismiss,
  onSubscribe,
  onRestore,
  isRestoring = false,
  restored = false,
  noSubscription = false,
  restoreError = null,
  onRetryRestore,
}: {
  onDismiss: () => void;
  onSubscribe?: (packageType: 'annual' | 'monthly') => void;
  onRestore?: () => void;
  isRestoring?: boolean;
  restored?: boolean;
  noSubscription?: boolean;
  restoreError?: string | null;
  onRetryRestore?: () => void;
}) {
  const { packages, isLoading } = useSubscription();
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');

  const monthlyPackage = useMemo(
    () => packages.find((p) => p.packageType === 'MONTHLY'),
    [packages]
  );
  const annualPackage = useMemo(
    () => packages.find((p) => p.packageType === 'ANNUAL'),
    [packages]
  );

  const monthlyPrice = monthlyPackage?.product.price ?? 4.99;
  const annualPrice = annualPackage?.product.price ?? 34.99;
  const savingsPercent = calculateSavingsPercent(monthlyPrice, annualPrice);

  return (
    <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}>
      {/* Dismiss button */}
      <View style={{ alignItems: 'flex-end', marginTop: 12, marginBottom: 8 }}>
        <Pressable
          testID="paywall-dismiss"
          onPress={onDismiss}
          accessibilityRole="button"
          accessibilityLabel="Dismiss"
          style={{
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          <Text style={{ color: colors.cream, fontSize: 16 }}>✕</Text>
        </Pressable>
      </View>

      {/* Header */}
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 28,
          color: colors.cream,
          textAlign: 'center',
          marginBottom: 8,
        }}>
        Unlock All Content
      </Text>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 15,
          color: 'rgba(232, 220, 197, 0.7)',
          textAlign: 'center',
          marginBottom: 20,
        }}>
        Continue your Quran learning journey
      </Text>

      {/* Features list */}
      <View testID="features-list" style={{ marginBottom: 24, gap: 10 }}>
        {FEATURES.map((feature) => (
          <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <View
              style={{
                width: 22,
                height: 22,
                borderRadius: 11,
                backgroundColor: 'rgba(207, 170, 107, 0.2)',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <Text style={{ color: colors.gold, fontSize: 13 }}>✓</Text>
            </View>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 15,
                color: colors.cream,
              }}>
              {feature}
            </Text>
          </View>
        ))}
      </View>

      {/* Subscription options */}
      {isLoading ? (
        <ActivityIndicator testID="paywall-loading" size="large" color={colors.gold} />
      ) : (
        <View style={{ gap: 10 }}>
          {annualPackage && (
            <SubscriptionOption
              testID="subscription-option-annual"
              title="Annual"
              price={annualPackage.product.priceString}
              priceDetail="per year"
              badge={monthlyPackage && savingsPercent > 0 ? `Save ${savingsPercent}%` : undefined}
              isRecommended
              isSelected={selectedPlan === 'annual'}
              onSelect={() => setSelectedPlan('annual')}
            />
          )}

          {monthlyPackage && (
            <SubscriptionOption
              testID="subscription-option-monthly"
              title="Monthly"
              price={monthlyPackage.product.priceString}
              priceDetail="per month"
              isSelected={selectedPlan === 'monthly'}
              onSelect={() => setSelectedPlan('monthly')}
            />
          )}
        </View>
      )}

      {/* Subscribe button */}
      {!isLoading && packages.length > 0 && (
        <Pressable
          testID="paywall-subscribe-btn"
          onPress={() => onSubscribe?.(selectedPlan)}
          accessibilityRole="button"
          accessibilityLabel="Subscribe now"
          style={{
            borderRadius: 14,
            backgroundColor: colors.gold,
            paddingVertical: 14,
            alignItems: 'center',
            marginTop: 20,
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 15,
              color: colors.midnight,
              fontWeight: '700',
            }}>
            Subscribe now
          </Text>
        </Pressable>
      )}

      {/* Restore Purchases */}
      <Pressable
        testID="restore-purchases-btn"
        onPress={onRestore}
        disabled={isRestoring || !onRestore}
        accessibilityState={{ disabled: isRestoring || !onRestore }}
        accessibilityRole="button"
        accessibilityLabel="Restore Purchases"
        style={{
          paddingVertical: 12,
          alignItems: 'center',
          marginTop: 16,
        }}>
        {isRestoring ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <ActivityIndicator
              testID="restore-loading"
              size="small"
              color="rgba(232, 220, 197, 0.6)"
            />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: 'rgba(232, 220, 197, 0.6)',
              }}>
              Restoring...
            </Text>
          </View>
        ) : (
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(232, 220, 197, 0.6)',
            }}>
            Restore Purchases
          </Text>
        )}
      </Pressable>

      {restored && (
        <View
          style={{
            borderRadius: 14,
            padding: 14,
            backgroundColor: 'rgba(95, 179, 154, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(95, 179, 154, 0.3)',
            marginTop: 12,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: colors.cream,
            }}>
            Subscription restored!
          </Text>
        </View>
      )}

      {noSubscription && (
        <View
          style={{
            borderRadius: 14,
            padding: 14,
            backgroundColor: 'rgba(207, 170, 107, 0.12)',
            borderWidth: 1,
            borderColor: 'rgba(207, 170, 107, 0.24)',
            marginTop: 12,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: colors.cream,
            }}>
            No active subscription found
          </Text>
        </View>
      )}

      {restoreError && (
        <View
          style={{
            borderRadius: 14,
            padding: 14,
            backgroundColor: 'rgba(168, 84, 84, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(168, 84, 84, 0.3)',
            marginTop: 12,
            alignItems: 'center',
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: colors.cream,
              textAlign: 'center',
              marginBottom: 12,
            }}>
            {restoreError}
          </Text>
          <Pressable
            testID="restore-retry-btn"
            onPress={onRetryRestore}
            accessibilityRole="button"
            accessibilityLabel="Retry restore"
            style={{
              borderRadius: 10,
              backgroundColor: colors.gold,
              paddingVertical: 10,
              paddingHorizontal: 24,
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.midnight,
                fontWeight: '600',
              }}>
              Retry
            </Text>
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

export function Paywall({
  variant = 'fullscreen',
  onDismiss,
  onSubscribe,
  onRestore,
  isRestoring = false,
  restored = false,
  noSubscription = false,
  restoreError = null,
  onRetryRestore,
}: PaywallProps) {
  if (variant === 'modal') {
    return (
      <Modal
        visible
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={onDismiss}>
        <View
          testID="paywall-modal"
          style={{ flex: 1, backgroundColor: colors.midnight }}>
          <View testID="paywall">
            <PaywallContent
              onDismiss={onDismiss}
              onSubscribe={onSubscribe}
              onRestore={onRestore}
              isRestoring={isRestoring}
              restored={restored}
              noSubscription={noSubscription}
              restoreError={restoreError}
              onRetryRestore={onRetryRestore}
            />
          </View>
        </View>
      </Modal>
    );
  }

  return (
    <View testID="paywall" style={{ flex: 1, backgroundColor: colors.midnight }}>
      <PaywallContent
        onDismiss={onDismiss}
        onSubscribe={onSubscribe}
        onRestore={onRestore}
        isRestoring={isRestoring}
        restored={restored}
        noSubscription={noSubscription}
        restoreError={restoreError}
        onRetryRestore={onRetryRestore}
      />
    </View>
  );
}
