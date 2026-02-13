/**
 * Data Export Screen (GDPR)
 * Story 7.7 - Export personal data request
 * Divine Geometry palette with premium styling
 */

import { useState, useEffect } from 'react';
import { View, Text, Pressable, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, Download, Mail, Shield, Clock } from 'lucide-react-native';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { requestDataExport, getExportRequestStatus } from '@/lib/api/dataExport';
import type { ExportRequestStatus } from '@/lib/api/dataExport';
import { fonts } from '@/constants/typography';
import { colors } from '@/constants/colors';

function DataItem({ text }: { text: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingVertical: 6 }}>
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 3,
          backgroundColor: colors.gold,
        }}
      />
      <Text style={{ fontFamily: fonts.outfit, fontSize: 15, color: colors.emeraldDeep }}>
        {text}
      </Text>
    </View>
  );
}

export default function DataExportScreen() {
  const [isLoading, setIsLoading] = useState(false);
  const [existingRequest, setExistingRequest] = useState<ExportRequestStatus | null>(null);
  const user = useAuthStore((s) => s.user);

  const hasPendingRequest =
    existingRequest?.status === 'pending' || existingRequest?.status === 'processing';

  useEffect(() => {
    if (user?.id) {
      void getExportRequestStatus(user.id).then(setExistingRequest);
    }
  }, [user?.id]);

  async function handleRequestExport() {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const result = await requestDataExport();
      if (result.success) {
        const title = result.message ? 'Export In Progress' : 'Export Requested';
        const body = result.message ?? "We'll email your data within 30 days.";
        Alert.alert(title, body, [{ text: 'OK', onPress: () => router.back() }]);
      } else {
        Alert.alert('Export Failed', result.error ?? 'Failed to request export. Please try again.');
      }
    } catch {
      Alert.alert('Export Failed', 'Failed to request export. Please try again.');
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
            Export Your Data
          </Text>
        </View>

        {/* Explanation */}
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
            <Download size={20} color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.emeraldDeep,
              }}>
              What's Included
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.6)',
              marginBottom: 12,
            }}>
            You can request a copy of all your personal data. This includes:
          </Text>
          <DataItem text="Profile information" />
          <DataItem text="Learning progress and history" />
          <DataItem text="App settings and preferences" />
          <DataItem text="Streak and XP data" />
        </View>

        {/* Delivery method */}
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
            <Mail size={20} color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.emeraldDeep,
              }}>
              Delivery
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.6)',
              lineHeight: 22,
            }}>
            Your data will be compiled and sent to your email address ({user?.email}) within 30 days
            as a JSON file.
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
            marginBottom: 32,
          }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <Shield size={20} color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 18,
                color: colors.emeraldDeep,
              }}>
              Your Rights
            </Text>
          </View>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.6)',
              lineHeight: 22,
            }}>
            Under GDPR, you have the right to receive your personal data in a portable format. This
            export fulfills that right.
          </Text>
        </View>

        {/* Existing request status banner */}
        {hasPendingRequest ? (
          <View
            testID="pending-export-banner"
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 10,
              backgroundColor: 'rgba(191, 155, 48, 0.1)',
              borderRadius: 16,
              padding: 16,
              marginBottom: 16,
              borderWidth: 1,
              borderColor: 'rgba(191, 155, 48, 0.2)',
            }}>
            <Clock size={18} color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.emeraldDeep,
                flex: 1,
              }}>
              An export request is already being processed.
            </Text>
          </View>
        ) : null}

        {/* Request button */}
        <Pressable
          testID="request-export-button"
          onPress={() => void handleRequestExport()}
          disabled={isLoading || hasPendingRequest}
          style={{
            backgroundColor: colors.emeraldDeep,
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
              {hasPendingRequest ? 'Export In Progress' : 'Request Export'}
            </Text>
          )}
        </Pressable>
      </ScrollView>
    </ScreenBackground>
  );
}
