/**
 * Subscription Screen
 *
 * Displays subscription options with pricing, features, legal disclosures,
 * purchase flow, and current plan view for subscribed users.
 * Uses Divine Geometry palette.
 *
 * Story 6.3: Subscription Options Display - Tasks 1-6
 * Story 6.4: Purchase Flow - Tasks 1-7
 * Story 6.6: Purchase Restoration
 */

import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  Pressable,
  ScrollView,
  ActivityIndicator,
  Linking,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useTrialStatus } from '@/lib/hooks/useTrialStatus';
import { usePurchase } from '@/lib/hooks/usePurchase';
import { useRestore } from '@/lib/hooks/useRestore';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { SubscriptionOption } from '@/components/subscription/SubscriptionOption';
import { PurchaseSuccessModal } from '@/components/subscription/PurchaseSuccessModal';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';

const TERMS_URL = 'https://safar.app/terms';
const PRIVACY_URL = 'https://safar.app/privacy';
const APPLE_SUBSCRIPTIONS_URL = 'https://apps.apple.com/account/subscriptions';
const GOOGLE_SUBSCRIPTIONS_URL = 'https://play.google.com/store/account/subscriptions';

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

async function safeOpenURL(url: string): Promise<void> {
  try {
    const canOpen = await Linking.canOpenURL(url);
    if (canOpen) {
      await Linking.openURL(url);
    }
  } catch {
    // External URL opening should never break subscription UI flow.
  }
}

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
] as const;

function formatRenewalDate(dateStr: string): string | null {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return null;
  return `${MONTH_NAMES[date.getUTCMonth()]} ${date.getUTCDate()}, ${date.getUTCFullYear()}`;
}

function CurrentPlanView({
  currentPlan,
  isInTrial,
  daysRemaining,
  endDate,
  expirationDate,
  priceString,
  showRestoreSuccess = false,
}: {
  currentPlan: 'annual' | 'monthly' | null;
  isInTrial: boolean;
  daysRemaining: number;
  endDate: Date | null;
  expirationDate: string | null;
  priceString: string | null;
  showRestoreSuccess?: boolean;
}) {
  const formattedRenewalDate = expirationDate ? formatRenewalDate(expirationDate) : null;
  const planLabel =
    currentPlan === 'annual'
      ? 'Annual'
      : currentPlan === 'monthly'
        ? 'Monthly'
        : 'Active Subscription';

  return (
    <View testID="current-plan-view">
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 32,
          color: colors.cream,
          marginBottom: 24,
        }}>
        Your Plan
      </Text>

      {showRestoreSuccess && (
        <View
          style={{
            borderRadius: 14,
            padding: 16,
            backgroundColor: 'rgba(95, 179, 154, 0.15)',
            borderWidth: 1,
            borderColor: 'rgba(95, 179, 154, 0.3)',
            marginBottom: 16,
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

      <View
        style={{
          borderRadius: 18,
          padding: 20,
          backgroundColor: 'rgba(207, 170, 107, 0.12)',
          borderWidth: 1,
          borderColor: 'rgba(207, 170, 107, 0.24)',
          marginBottom: 16,
        }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 12,
            color: 'rgba(232, 220, 197, 0.6)',
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            marginBottom: 6,
          }}>
          Current plan
        </Text>
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 24,
            color: colors.cream,
          }}>
          {planLabel}
        </Text>

        {priceString && (
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(232, 220, 197, 0.7)',
              marginTop: 4,
            }}>
            {priceString}/{currentPlan === 'annual' ? 'year' : 'month'}
          </Text>
        )}

        {isInTrial && (
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: colors.gold,
              marginTop: 8,
            }}>
            Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
            {endDate ? ` (ends ${endDate.toLocaleDateString()})` : ''}
          </Text>
        )}

        {formattedRenewalDate && !isInTrial && (
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(232, 220, 197, 0.7)',
              marginTop: 8,
            }}>
            Renews · Next billing: {formattedRenewalDate}
          </Text>
        )}
      </View>

      <Pressable
        testID="manage-subscription-btn"
        onPress={() =>
          void safeOpenURL(
            Platform.OS === 'ios' ? APPLE_SUBSCRIPTIONS_URL : GOOGLE_SUBSCRIPTIONS_URL
          )
        }
        accessibilityRole="button"
        accessibilityLabel="Manage Subscription"
        style={{
          borderRadius: 14,
          backgroundColor: colors.gold,
          paddingVertical: 14,
          alignItems: 'center',
        }}>
        <Text
          style={{
            fontFamily: fonts.outfit,
            fontSize: 15,
            color: colors.midnight,
            fontWeight: '700',
          }}>
          Manage Subscription
        </Text>
      </Pressable>
    </View>
  );
}

export default function SubscriptionScreen() {
  const { packages, isPremium, currentPlan, entitlementStatus, expirationDate, isLoading } =
    useSubscription();
  const { isInTrial, daysRemaining, endDate } = useTrialStatus();
  const { isPurchasing, showSuccess, error, purchasePackage, dismissSuccess, clearError } =
    usePurchase();
  const {
    isRestoring,
    restored,
    noSubscription,
    error: restoreError,
    restore,
    clearError: clearRestoreError,
  } = useRestore();
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

  const currentPriceString = useMemo(() => {
    if (!currentPlan) return null;
    const pkg = currentPlan === 'annual' ? annualPackage : monthlyPackage;
    return pkg?.product.priceString ?? null;
  }, [currentPlan, annualPackage, monthlyPackage]);

  // Already subscribed users see current plan view
  if (isPremium) {
    return (
      <ScreenBackground variant="midnight" safeArea>
        <SafeAreaView style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 40 }}>
            <Pressable
              testID="subscription-back"
              onPress={() => router.back()}
              accessibilityRole="button"
              accessibilityLabel="Go back"
              style={{ marginTop: 8, marginBottom: 16 }}>
              <Text style={{ fontFamily: fonts.outfit, fontSize: 14, color: colors.gold }}>
                Back
              </Text>
            </Pressable>

            <CurrentPlanView
              currentPlan={currentPlan}
              isInTrial={isInTrial}
              daysRemaining={daysRemaining}
              endDate={endDate}
              expirationDate={expirationDate}
              priceString={currentPriceString}
              showRestoreSuccess={restored}
            />
          </ScrollView>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="midnight" safeArea>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
          <Pressable
            testID="subscription-back"
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ marginTop: 8, marginBottom: 16 }}>
            <Text style={{ fontFamily: fonts.outfit, fontSize: 14, color: colors.gold }}>
              Back
            </Text>
          </Pressable>

          {/* Header */}
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 32,
              color: colors.cream,
              textAlign: 'center',
              marginBottom: 8,
            }}>
            Unlock All Content
          </Text>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 16,
              color: 'rgba(232, 220, 197, 0.7)',
              textAlign: 'center',
              marginBottom: 24,
            }}>
            Start your journey to understanding the Quran
          </Text>

          {/* Expiration banner */}
          {entitlementStatus === 'expired' && (
            <View
              style={{
                borderRadius: 18,
                padding: 16,
                backgroundColor: 'rgba(168, 84, 84, 0.15)',
                borderWidth: 1,
                borderColor: 'rgba(168, 84, 84, 0.3)',
                marginBottom: 20,
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 15,
                  color: colors.cream,
                  textAlign: 'center',
                }}>
                Your subscription has expired
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 13,
                  color: 'rgba(232, 220, 197, 0.6)',
                  textAlign: 'center',
                  marginTop: 4,
                }}>
                Re-subscribe to continue learning
              </Text>
            </View>
          )}

          {/* Trial banner */}
          {isInTrial && (
            <View
              style={{
                borderRadius: 18,
                padding: 16,
                backgroundColor: 'rgba(207, 170, 107, 0.12)',
                borderWidth: 1,
                borderColor: 'rgba(207, 170, 107, 0.24)',
                marginBottom: 20,
              }}>
              <Text style={{ fontFamily: fonts.outfit, fontSize: 15, color: colors.cream }}>
                Trial: {daysRemaining} {daysRemaining === 1 ? 'day' : 'days'} remaining
              </Text>
            </View>
          )}

          {/* Features list */}
          <View testID="features-list" style={{ marginBottom: 24, gap: 12 }}>
            {FEATURES.map((feature) => (
              <View key={feature} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                <View
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: 12,
                    backgroundColor: 'rgba(207, 170, 107, 0.2)',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}>
                  <Text style={{ color: colors.gold, fontSize: 14 }}>✓</Text>
                </View>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 16,
                    color: colors.cream,
                  }}>
                  {feature}
                </Text>
              </View>
            ))}
          </View>

          {/* Subscription options */}
          {isLoading ? (
            <ActivityIndicator testID="subscription-loading" size="large" color={colors.gold} />
          ) : packages.length === 0 ? (
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: 'rgba(232, 220, 197, 0.7)',
                textAlign: 'center',
              }}>
              No plans available right now. Please try again later.
            </Text>
          ) : (
            <View style={{ gap: 12 }}>
              {/* Annual - Recommended */}
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

              {/* Monthly */}
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

          {/* Legal disclosures */}
          <View style={{ marginTop: 24 }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 12,
                color: 'rgba(232, 220, 197, 0.5)',
                textAlign: 'center',
                lineHeight: 18,
              }}>
              Payment will be charged to your {Platform.OS === 'ios' ? 'Apple ID' : 'Google Play'}{' '}
              account. Subscription automatically renews unless canceled at least 24 hours before
              the end of the current period. Your account will be charged for renewal within 24
              hours prior to the end of the current period.
            </Text>

            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                gap: 16,
                marginTop: 12,
              }}>
              <Pressable onPress={() => void safeOpenURL(TERMS_URL)}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 12,
                    color: colors.gold,
                    textDecorationLine: 'underline',
                  }}>
                  Terms of Service
                </Text>
              </Pressable>
              <Pressable onPress={() => void safeOpenURL(PRIVACY_URL)}>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 12,
                    color: colors.gold,
                    textDecorationLine: 'underline',
                  }}>
                  Privacy Policy
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>

        {/* Error banner */}
        {error && (
          <View
            testID="purchase-error-banner"
            style={{
              borderRadius: 14,
              padding: 16,
              backgroundColor: 'rgba(168, 84, 84, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(168, 84, 84, 0.3)',
              marginTop: 16,
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
              {error}
            </Text>
            <Pressable
              testID="purchase-retry-btn"
              onPress={() => {
                clearError();
                const selectedPkg =
                  selectedPlan === 'annual' ? annualPackage : monthlyPackage;
                if (selectedPkg) {
                  void purchasePackage(selectedPkg as any);
                }
              }}
              accessibilityRole="button"
              accessibilityLabel="Retry purchase"
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

        {/* Subscribe/restore actions - fixed at bottom */}
        {!isLoading && (
          <View
            style={{
              position: 'absolute',
              left: 24,
              right: 24,
              bottom: 40,
            }}>
            {packages.length > 0 && (
              <Pressable
                testID="subscription-subscribe-btn"
                disabled={isPurchasing}
                accessibilityState={{ disabled: isPurchasing }}
                onPress={() => {
                  const selectedPkg =
                    selectedPlan === 'annual' ? annualPackage : monthlyPackage;
                  if (selectedPkg) {
                    void purchasePackage(selectedPkg as any);
                  }
                }}
                accessibilityRole="button"
                accessibilityLabel="Subscribe now"
                style={{
                  borderRadius: 14,
                  backgroundColor: isPurchasing
                    ? 'rgba(207, 170, 107, 0.5)'
                    : colors.gold,
                  paddingVertical: 14,
                  alignItems: 'center',
                }}>
                {isPurchasing ? (
                  <ActivityIndicator
                    testID="purchase-loading"
                    size="small"
                    color={colors.midnight}
                  />
                ) : (
                  <Text
                    style={{
                      fontFamily: fonts.outfit,
                      fontSize: 15,
                      color: colors.midnight,
                      fontWeight: '700',
                    }}>
                    Subscribe now
                  </Text>
                )}
              </Pressable>
            )}

            <Pressable
              testID="restore-purchases-btn"
              onPress={() => void restore()}
              disabled={isRestoring}
              accessibilityState={{ disabled: isRestoring }}
              accessibilityRole="button"
              accessibilityLabel="Restore Purchases"
              style={{
                paddingVertical: 12,
                alignItems: 'center',
                marginTop: packages.length > 0 ? 8 : 0,
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
          </View>
        )}

        {/* Restore status messages */}
        {restored && (
          <View
            style={{
              borderRadius: 14,
              padding: 16,
              backgroundColor: 'rgba(95, 179, 154, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(95, 179, 154, 0.3)',
              marginHorizontal: 24,
              marginBottom: 16,
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
              padding: 16,
              backgroundColor: 'rgba(207, 170, 107, 0.12)',
              borderWidth: 1,
              borderColor: 'rgba(207, 170, 107, 0.24)',
              marginHorizontal: 24,
              marginBottom: 16,
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
              padding: 16,
              backgroundColor: 'rgba(168, 84, 84, 0.15)',
              borderWidth: 1,
              borderColor: 'rgba(168, 84, 84, 0.3)',
              marginHorizontal: 24,
              marginBottom: 16,
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
              onPress={() => {
                clearRestoreError();
                void restore();
              }}
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

        {/* Success modal */}
        <PurchaseSuccessModal
          visible={showSuccess}
          onDismiss={() => {
            dismissSuccess();
            router.back();
          }}
        />
      </SafeAreaView>
    </ScreenBackground>
  );
}
