/**
 * Delete Account Dialog Component
 * Confirmation dialog requiring "DELETE" text input for account deletion
 * Divine Geometry Design
 */

import { useState } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { AlertTriangle } from 'lucide-react-native';
import '@/global.css';

interface DeleteAccountDialogProps {
  visible: boolean;
  isDeleting: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteAccountDialog({
  visible,
  isDeleting,
  onConfirm,
  onCancel,
}: DeleteAccountDialogProps) {
  const [confirmText, setConfirmText] = useState('');
  const isConfirmEnabled = confirmText.toUpperCase() === 'DELETE';

  const handleConfirm = () => {
    if (isConfirmEnabled) {
      setConfirmText('');
      onConfirm();
    }
  };

  const handleCancel = () => {
    setConfirmText('');
    onCancel();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={handleCancel}>
      {/* Backdrop */}
      <Pressable className="flex-1 items-center justify-center bg-black/70" onPress={handleCancel}>
        {/* Dialog content */}
        <Pressable
          className="mx-6 w-full max-w-sm rounded-2xl border border-red-500/30 bg-midnight p-6"
          onPress={(e) => e.stopPropagation()}>
          {/* Warning Icon */}
          <View className="mb-4 items-center">
            <View className="h-16 w-16 items-center justify-center rounded-full border border-red-500/30 bg-red-500/10">
              <AlertTriangle color="#ef4444" size={32} />
            </View>
          </View>

          {/* Title */}
          <Text className="mb-2 text-center text-xl text-cream" style={{ fontFamily: 'Fraunces' }}>
            Delete Account
          </Text>

          {/* Warning Message */}
          <Text className="mb-4 text-center text-cream/70" style={{ fontFamily: 'Outfit' }}>
            This action is permanent and cannot be undone. All your data will be deleted, including
            your progress, streaks, and settings.
          </Text>

          {/* Confirmation Input */}
          <View className="mb-4">
            <Text
              className="mb-2 text-center text-sm text-cream/60"
              style={{ fontFamily: 'Outfit' }}>
              Type <Text className="font-bold text-red-400">DELETE</Text> to confirm:
            </Text>
            <TextInput
              className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-center text-base text-cream"
              style={{ fontFamily: 'Outfit' }}
              placeholder="DELETE"
              placeholderTextColor="rgba(239, 68, 68, 0.3)"
              value={confirmText}
              onChangeText={setConfirmText}
              autoCapitalize="characters"
              editable={!isDeleting}
            />
          </View>

          {/* Buttons */}
          <View className="gap-3">
            {/* Delete Button */}
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={!isConfirmEnabled || isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Delete My Account"
              className={`rounded-xl py-4 ${
                isConfirmEnabled && !isDeleting ? 'bg-red-600' : 'bg-red-600/30'
              }`}
              activeOpacity={0.8}>
              {isDeleting ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text
                  className={`text-center ${isConfirmEnabled ? 'text-white' : 'text-white/40'}`}
                  style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                  Delete My Account
                </Text>
              )}
            </TouchableOpacity>

            {/* Cancel Button */}
            <TouchableOpacity
              onPress={handleCancel}
              disabled={isDeleting}
              accessibilityRole="button"
              accessibilityLabel="Cancel"
              className="rounded-xl border border-gold/30 bg-white/5 py-4"
              activeOpacity={0.8}>
              <Text
                className="text-center text-cream"
                style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
