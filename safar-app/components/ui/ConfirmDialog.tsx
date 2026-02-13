/**
 * Confirm Dialog Component
 * Reusable confirmation modal with destructive action support
 * Divine Geometry Design
 */

import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import '@/global.css';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export function ConfirmDialog({
  visible,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isDestructive = false,
}: ConfirmDialogProps) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      {/* Backdrop - tap to dismiss */}
      <Pressable className="flex-1 items-center justify-center bg-black/60" onPress={onCancel}>
        {/* Dialog content - capture touch to prevent dismiss */}
        <Pressable
          className="mx-6 w-full max-w-sm rounded-2xl border border-gold/20 bg-midnight p-6"
          onPress={(e) => e.stopPropagation()}>
          <Text className="mb-2 text-xl text-cream" style={{ fontFamily: 'Fraunces' }}>
            {title}
          </Text>
          <Text className="mb-6 text-cream/70" style={{ fontFamily: 'Outfit' }}>
            {message}
          </Text>

          <View className="flex-row gap-3">
            {/* Cancel Button */}
            <TouchableOpacity
              onPress={onCancel}
              accessibilityRole="button"
              accessibilityLabel={cancelText}
              className="flex-1 rounded-xl border border-gold/30 bg-white/5 py-3"
              activeOpacity={0.8}>
              <Text
                className="text-center text-cream"
                style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                {cancelText}
              </Text>
            </TouchableOpacity>

            {/* Confirm Button */}
            <TouchableOpacity
              onPress={onConfirm}
              accessibilityRole="button"
              accessibilityLabel={confirmText}
              className={`flex-1 rounded-xl py-3 ${isDestructive ? 'bg-red-600' : 'bg-gold'}`}
              activeOpacity={0.8}>
              <Text
                className={`text-center ${isDestructive ? 'text-white' : 'text-midnight'}`}
                style={{ fontFamily: 'Outfit', fontWeight: '600' }}>
                {confirmText}
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}
