/**
 * Settings Screen
 * Story 7.1 - Organized sections: Notifications, Sound, Account, Legal, Support
 * Story 7.2 - Notification preferences with permission handling and scheduling integration
 * Divine Geometry palette with premium styling
 */

import { useEffect, useState } from 'react';
import { View, Text, ScrollView, Pressable, Switch, Linking, Alert, Modal, Platform } from 'react-native';
import { router } from 'expo-router';
import { ArrowLeft, ChevronRight, Copy } from 'lucide-react-native';
import Constants from 'expo-constants';
import * as Clipboard from 'expo-clipboard';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { DeleteAccountDialog } from '@/components/ui/DeleteAccountDialog';
import { useSettingsStore } from '@/lib/stores/useSettingsStore';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useSubscription } from '@/lib/hooks/useSubscription';
import { useStreak } from '@/lib/hooks/useStreak';
import {
  getNotificationPermissionStatus,
  requestNotificationPermissions,
} from '@/lib/notifications/notificationService';
import { cancelAllStreakNotifications } from '@/lib/notifications/streakNotificationScheduler';
import { cancelAllReviewNotifications } from '@/lib/notifications/reviewNotificationScheduler';
import { scheduleLearningReminder, cancelAllLearningNotifications } from '@/lib/notifications/learningNotificationScheduler';
import { updateNotificationSchedule } from '@/lib/notifications/notificationOrchestrator';
import { updateReviewNotificationSchedule, updateBadgeCount } from '@/lib/notifications/reviewNotificationOrchestrator';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { config } from '@/constants/config';

function getRawAppVersion(): string {
  return Constants.expoConfig?.version ?? '1.0.0';
}

function getAppVersion(): string {
  return `Version ${getRawAppVersion()}`;
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View style={{ marginBottom: 32 }}>
      <Text
        style={{
          fontFamily: fonts.fraunces,
          fontSize: 20,
          color: colors.emeraldDeep,
          marginBottom: 12,
        }}>
        {title}
      </Text>
      <View style={{ gap: 8 }}>{children}</View>
    </View>
  );
}

function SettingsToggleRow({
  label,
  testID,
  value,
  onValueChange,
}: {
  label: string;
  testID: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(15, 46, 40, 0.05)',
      }}>
      <Text style={{ fontFamily: fonts.outfit, fontSize: 16, color: colors.emeraldDeep }}>
        {label}
      </Text>
      <Switch
        testID={testID}
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(15, 46, 40, 0.2)', true: 'rgba(13, 124, 102, 0.45)' }}
        thumbColor={value ? colors.emeraldDeep : '#f4f3f4'}
      />
    </View>
  );
}

function SettingsNavRow({
  label,
  value,
  testID,
  onPress,
  destructive,
}: {
  label: string;
  value?: string;
  testID?: string;
  onPress: () => void;
  destructive?: boolean;
}) {
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: destructive ? 'rgba(168, 84, 84, 0.15)' : 'rgba(15, 46, 40, 0.05)',
      }}>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 16,
          color: destructive ? colors.rating.again : colors.emeraldDeep,
        }}>
        {label}
      </Text>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
        {value ? (
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: 'rgba(15, 46, 40, 0.5)',
            }}>
            {value}
          </Text>
        ) : null}
        <ChevronRight size={16} color="rgba(15, 46, 40, 0.3)" />
      </View>
    </Pressable>
  );
}

function SettingsValueRow({ label, value }: { label: string; value: string }) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 14,
        paddingHorizontal: 20,
        backgroundColor: '#ffffff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(15, 46, 40, 0.05)',
      }}>
      <Text style={{ fontFamily: fonts.outfit, fontSize: 16, color: colors.emeraldDeep }}>
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 14,
          color: 'rgba(15, 46, 40, 0.5)',
        }}>
        {value}
      </Text>
    </View>
  );
}

export default function SettingsScreen() {
  const streakReminders = useSettingsStore((state) => state.streakReminders);
  const reviewReminders = useSettingsStore((state) => state.reviewReminders);
  const learningReminders = useSettingsStore((state) => state.learningReminders);
  const soundEnabled = useSettingsStore((state) => state.soundEnabled);
  const isLoaded = useSettingsStore((state) => state.isLoaded);
  const updateSetting = useSettingsStore((state) => state.updateSetting);
  const loadSettings = useSettingsStore((state) => state.loadSettings);
  const userId = useAuthStore((state) => state.user?.id);
  const deleteAccount = useAuthStore((state) => state.deleteAccount);
  const isDeletingAccount = useAuthStore((state) => state.isDeletingAccount);
  const clearAuthError = useAuthStore((state) => state.clearError);
  const { isPremium } = useSubscription();
  const { currentStreak, status: streakStatus } = useStreak();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showEmailFallback, setShowEmailFallback] = useState(false);

  const subscriptionStatus = isPremium ? 'Premium' : 'Free';

  useEffect(() => {
    if (!isLoaded) {
      void loadSettings();
    }
  }, [isLoaded, loadSettings]);

  async function handleNotificationToggle(key: string, value: boolean) {
    if (value) {
      const status = await getNotificationPermissionStatus();
      if (status !== 'granted') {
        const granted = await requestNotificationPermissions();
        if (!granted) {
          setShowPermissionModal(true);
          return;
        }
      }
    }

    await updateSetting(key, value);

    if (key === 'streakReminders') {
      if (!value) {
        await cancelAllStreakNotifications();
      } else {
        await updateNotificationSchedule({
          currentStreak,
          hasLearnedToday: streakStatus === 'active',
          enabled: true,
        });
      }
      return;
    }

    if (key === 'reviewReminders') {
      if (!value) {
        await cancelAllReviewNotifications();
      } else if (userId) {
        await updateReviewNotificationSchedule(userId, undefined, true);
        await updateBadgeCount(userId);
      }
      return;
    }

    if (key === 'learningReminders') {
      if (!value) {
        await cancelAllLearningNotifications();
      } else {
        await cancelAllLearningNotifications();
        await scheduleLearningReminder();
      }
    }
  }

  async function safeOpenUrl(url: string, title: string, fallbackMessage: string) {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert(title, fallbackMessage);
        return;
      }
      await Linking.openURL(url);
    } catch {
      Alert.alert(title, fallbackMessage);
    }
  }

  function getDiagnosticInfo(): string {
    const version = getRawAppVersion();
    const platform = Platform.OS;
    const osVersion = String(Platform.Version);
    const anonymizedId = userId?.substring(0, 8) || 'anonymous';

    return [
      '',
      '',
      '---',
      `App Version: ${version}`,
      `Platform: ${platform} ${osVersion}`,
      `User ID: ${anonymizedId}...`,
      '---',
      '',
      'Please describe your issue below:',
      '',
      '',
    ].join('\n');
  }

  async function handleContactSupport() {
    const body = getDiagnosticInfo();
    const mailtoUrl = `mailto:${config.supportEmail}?subject=${encodeURIComponent(config.supportSubject)}&body=${encodeURIComponent(body)}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
      } else {
        setShowEmailFallback(true);
      }
    } catch {
      setShowEmailFallback(true);
    }
  }

  async function handleCopyEmail() {
    try {
      await Clipboard.setStringAsync(config.supportEmail);
      Alert.alert('Copied', 'Email address copied to clipboard.');
    } catch {
      Alert.alert('Copy Failed', `Please copy manually: ${config.supportEmail}`);
    }
  }

  function handleOpenLegal(url: string) {
    void safeOpenUrl(url, 'Unable to Open Link', 'Please try again later.');
  }

  async function handleDeleteAccount() {
    const result = await deleteAccount();
    if (result.success) {
      setShowDeleteDialog(false);
      return;
    }

    Alert.alert('Delete Account Failed', result.error ?? 'Please try again.');
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
            Settings
          </Text>
        </View>

        {/* Notifications Section */}
        <SettingsSection title="Notifications">
          <SettingsToggleRow
            label="Streak Reminders"
            testID="toggle-streakReminders"
            value={streakReminders}
            onValueChange={(v) => void handleNotificationToggle('streakReminders', v)}
          />
          <SettingsToggleRow
            label="Review Reminders"
            testID="toggle-reviewReminders"
            value={reviewReminders}
            onValueChange={(v) => void handleNotificationToggle('reviewReminders', v)}
          />
          <SettingsToggleRow
            label="Learning Reminders"
            testID="toggle-learningReminders"
            value={learningReminders}
            onValueChange={(v) => void handleNotificationToggle('learningReminders', v)}
          />
        </SettingsSection>

        {/* Sound Section */}
        <SettingsSection title="Sound">
          <SettingsToggleRow
            label="Sound Effects"
            testID="toggle-soundEnabled"
            value={soundEnabled}
            onValueChange={(v) => updateSetting('soundEnabled', v)}
          />
        </SettingsSection>

        {/* Account Section */}
        <SettingsSection title="Account">
          <SettingsNavRow
            label="Subscription"
            testID="settings-row-subscription"
            value={subscriptionStatus}
            onPress={() => router.push('/subscription')}
          />
          <SettingsNavRow
            label="Export My Data"
            testID="settings-row-export-data"
            onPress={() => router.push('/data-export')}
          />
          <SettingsNavRow
            label="Delete My Data"
            testID="settings-row-delete-data"
            onPress={() => router.push('/data-deletion')}
            destructive
          />
          <SettingsNavRow
            label="Delete Account"
            testID="settings-row-delete-account"
            onPress={() => {
              clearAuthError();
              setShowDeleteDialog(true);
            }}
            destructive
          />
        </SettingsSection>

        {/* Legal Section */}
        <SettingsSection title="Legal">
          <SettingsNavRow
            label="Privacy Policy"
            testID="settings-row-privacy-policy"
            onPress={() => handleOpenLegal(config.privacyPolicyUrl)}
          />
          <SettingsNavRow
            label="Terms of Service"
            testID="settings-row-terms"
            onPress={() => handleOpenLegal(config.termsOfServiceUrl)}
          />
        </SettingsSection>

        {/* Support Section */}
        <SettingsSection title="Support">
          <SettingsNavRow
            label="Contact Support"
            testID="settings-row-contact-support"
            onPress={() => void handleContactSupport()}
          />
          <SettingsValueRow label="App Version" value={getAppVersion()} />
        </SettingsSection>
      </ScrollView>

      <DeleteAccountDialog
        visible={showDeleteDialog}
        isDeleting={isDeletingAccount}
        onConfirm={handleDeleteAccount}
        onCancel={() => setShowDeleteDialog(false)}
      />

      <Modal visible={showPermissionModal} transparent animationType="fade" onRequestClose={() => setShowPermissionModal(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 24,
              marginHorizontal: 32,
              width: '85%',
            }}>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 20,
                color: colors.emeraldDeep,
              }}>
              Notifications Disabled
            </Text>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 15,
                color: 'rgba(15, 46, 40, 0.7)',
                marginTop: 8,
              }}>
              To receive reminders, you need to enable notifications in your device settings.
            </Text>
            <Pressable
              onPress={() => {
                Linking.openSettings();
                setShowPermissionModal(false);
              }}
              style={{
                backgroundColor: colors.emeraldDeep,
                paddingVertical: 14,
                borderRadius: 12,
                marginTop: 20,
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 16,
                  fontWeight: '600',
                  color: '#ffffff',
                  textAlign: 'center',
                }}>
                Open Settings
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setShowPermissionModal(false)}
              style={{
                paddingVertical: 12,
                marginTop: 8,
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 15,
                  color: 'rgba(15, 46, 40, 0.5)',
                  textAlign: 'center',
                }}>
                Not Now
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
      <Modal testID="email-fallback-modal" visible={showEmailFallback} transparent animationType="fade" onRequestClose={() => setShowEmailFallback(false)}>
        <View
          style={{
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}>
          <View
            style={{
              backgroundColor: '#ffffff',
              borderRadius: 16,
              padding: 24,
              marginHorizontal: 32,
              width: '85%',
            }}>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 20,
                color: colors.emeraldDeep,
              }}>
              Contact Support
            </Text>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 15,
                color: 'rgba(15, 46, 40, 0.7)',
                marginTop: 8,
              }}>
              No email app found. Please send an email to:
            </Text>
            <Pressable
              testID="copy-support-email"
              accessibilityRole="button"
              accessibilityLabel="Copy support email address"
              onPress={() => void handleCopyEmail()}
              style={{
                backgroundColor: 'rgba(15, 46, 40, 0.05)',
                paddingVertical: 14,
                paddingHorizontal: 16,
                borderRadius: 12,
                marginTop: 16,
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 16,
                  color: colors.emeraldDeep,
                  fontWeight: '600',
                }}>
                {config.supportEmail}
              </Text>
              <Copy size={18} color={colors.emeraldDeep} />
            </Pressable>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 13,
                color: 'rgba(15, 46, 40, 0.5)',
                marginTop: 12,
              }}>
              Please include your app version and a description of your issue.
            </Text>
            <Pressable
              testID="close-email-fallback"
              accessibilityRole="button"
              accessibilityLabel="Close support dialog"
              onPress={() => setShowEmailFallback(false)}
              style={{
                paddingVertical: 12,
                marginTop: 8,
              }}>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 15,
                  color: 'rgba(15, 46, 40, 0.5)',
                  textAlign: 'center',
                }}>
                Done
              </Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenBackground>
  );
}
