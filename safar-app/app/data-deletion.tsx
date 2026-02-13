/**
 * Data Deletion Screen (GDPR)
 * Story 7.8 - Request personal data deletion (keeps account)
 * Divine Geometry palette with premium styling
 */

import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Trash2, AlertTriangle, Shield, Clock } from 'lucide-react-native';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { requestDataDeletion, getDeletionRequestStatus } from '@/lib/api/dataDeletion';
import type { DeletionRequestStatus } from '@/lib/api/dataDeletion';
import { fonts } from '@/constants/typography';
import { colors } from '@/constants/colors';

function DeletionItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.rating.again,
        }}
      />
      <Text style={{ fontFamily: fonts.outfit, fontSize: 15, color: colors.emeraldDeep }}>
        {text}
      </Text>
    </View>
  );
}

export default function DataDeletionScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<DeletionRequestStatus | null>(null);
  const user = useAuthStore((s) => s.user);

  const hasPendingRequest =
    existingRequest?.status === 'pending' || existingRequest?.status === 'processing';

  useEffect(() => {
    if (user?.id) {
      void getDeletionRequestStatus(user.id).then(setExistingRequest);
    }
  }, [user?.id]);

  function handleDeletePress() {
    Alert.alert(
      'Confirm Data Deletion',
      'This will permanently delete all your learning data. Your account will remain active but you will start fresh. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Delete', style: 'destructive', onPress: () => void submitDeletion() },
      ]
    );
  }

  async function submitDeletion() {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await requestDataDeletion();
      if (result.success) {
        const title = result.message ? 'Deletion In Progress' : 'Deletion Requested';
        const body = result.message ?? 'Your data will be deleted within 30 days. Your account will remain active.';
        Alert.alert(title, body, [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Deletion Failed', result.error ?? 'Failed to request data deletion. Please try again.');
      }
    } catch {
      Alert.alert('Deletion Failed', 'Failed to request data deletion. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <ScreenBackground variant="parchment" patternOpacity={0.02}>
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 120 }}>
        {/* Header */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 16,
            paddingTop: 48,
            marginBottom: 32,
          }}>
          <Pressable
            onPress={() => router.back()}
            accessibilityRole="button"
            accessibilityLabel="Go back"
            style={{ padding: 4 }}>
            <ArrowLeft size={24} color={colors.emeraldDeep} />
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 30,
              color: colors.emeraldDeep,
            }}>
            Delete Your Data
          </Text>
        </View>

        {/* Warning banner */}
        <View
          style={{
            backgroundColor: 'rgba(168, 84, 84, 0.08)',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(168, 84, 84, 0.15)',
            marginBottom: 20,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <AlertTriangle size={20} color={colors.rating.again} />
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.rating.again,
              }}>
              This cannot be undone
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.7)',
              lineHeight: 22,
            }}>
            Requesting data deletion will permanently remove all your learning data. This is
            different from deleting your account.
          </Text>
        </View>

        {/* What will be deleted */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(15, 46, 40, 0.05)',
            marginBottom: 20,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Trash2 size={20} color={colors.rating.again} />
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.emeraldDeep,
              }}>
              What Will Be Deleted
            </Text>
          </View>
          <DeletionItem text="All learning progress and history" />
          <DeletionItem text="Streak and XP data" />
          <DeletionItem text="Review schedules and word states" />
          <DeletionItem text="App preferences and settings" />
        </View>

        {/* What stays */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(15, 46, 40, 0.05)',
            marginBottom: 20,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Shield size={20} color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.emeraldDeep,
              }}>
              Your Account Stays
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.6)',
              lineHeight: 22,
            }}>
            Your account will remain active. You can continue using the app, but you'll start fresh
            as a new learner.
          </Text>
        </View>

        {/* GDPR note */}
        <View
          style={{
            backgroundColor: '#ffffff',
            borderRadius: 16,
            padding: 20,
            borderWidth: 1,
            borderColor: 'rgba(15, 46, 40, 0.05)',
            marginBottom: 20,
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.6)',
              lineHeight: 22,
            }}>
            Under GDPR, you have the right to request erasure of your personal data. Your data will
            be deleted within 30 days.
          </Text>
        </View>

        {/* Account deletion alternative */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', marginBottom: 24 }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 13,
              color: 'rgba(15, 46, 40, 0.5)',
              lineHeight: 20,
            }}>
            Want to remove your account entirely?{' '}
          </Text>
          <Pressable
            onPress={() => router.push('/settings')}
            accessibilityRole="link"
            accessibilityLabel="Delete account instead">
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 13,
                color: colors.emeraldDeep,
                fontWeight: '600',
                lineHeight: 20,
              }}>
              Delete account instead
            </Text>
          </Pressable>
        </View>

        {/* Existing request status banner */}
        {hasPendingRequest ? (
          <View
            testID="pending-deletion-banner"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(168, 84, 84, 0.08)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(168, 84, 84, 0.15)',
            }}>
            <Clock size={18} color={colors.rating.again} />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.emeraldDeep,
                flex: 1,
              }}>
              A deletion request is already being processed.
            </Text>
          </View>
        ) : null}

        {/* Request button */}
        <Pressable
          testID="request-deletion-button"
          onPress={handleDeletePress}
          disabled={isLoading || hasPendingRequest}
          style={{
            backgroundColor: colors.rating.again,
            paddingVertical: 16,
            borderRadius: 16,
            opacity: isLoading || hasPendingRequest ? 0.5 : 1,
          }}>
          {isLoading ? (
            <ActivityIndicator color="#ffffff" />
          ) : (
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 16,
                fontWeight: '600',
                color: '#ffffff',
                textAlign: 'center',
              }}>
              {hasPendingRequest ? 'Deletion In Progress' : 'Delete My Data'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}
