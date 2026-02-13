/**
 * Social Auth Buttons Component
 * Apple Sign-In (iOS only) and Google Sign-In buttons
 * Divine Geometry Design
 */

import { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/lib/stores/useAuthStore';

interface SocialAuthButtonsProps {
  mode?: 'sign-up' | 'sign-in';
}

export function SocialAuthDivider() {
  return (
    <View className="my-6 flex-row items-center">
      <View className="h-px flex-1 bg-gold/20" />
      <Text className="px-4 text-sm text-cream/40" style={{ fontFamily: 'Outfit' }}>
        or continue with
      </Text>
      <View className="h-px flex-1 bg-gold/20" />
    </View>
  );
}

export function SocialAuthButtons({ mode = 'sign-up' }: SocialAuthButtonsProps) {
  const [isAppleAvailable, setIsAppleAvailable] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<'apple' | 'google' | null>(null);
  const signInWithSocial = useAuthStore((state) => state.signInWithSocial);

  useEffect(() => {
    // Check Apple Sign-In availability (iOS only)
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setIsAppleAvailable);
    }
  }, []);

  const handleAppleSignIn = async () => {
    setLoadingProvider('apple');
    try {
      await signInWithSocial('apple');
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoadingProvider('google');
    try {
      await signInWithSocial('google');
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <View className="gap-3">
      {/* Apple Sign-In (iOS only, native button) */}
      {isAppleAvailable && (
        <View style={{ opacity: loadingProvider === 'apple' ? 0.5 : 1 }}>
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={
              mode === 'sign-up'
                ? AppleAuthentication.AppleAuthenticationButtonType.SIGN_UP
                : AppleAuthentication.AppleAuthenticationButtonType.SIGN_IN
            }
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.WHITE}
            cornerRadius={12}
            style={{ width: '100%', height: 50 }}
            onPress={handleAppleSignIn}
          />
        </View>
      )}

      {/* Google Sign-In */}
      <TouchableOpacity
        onPress={handleGoogleSignIn}
        disabled={loadingProvider !== null}
        className={`flex-row items-center justify-center gap-3 rounded-xl bg-white py-4 ${
          loadingProvider === 'google' ? 'opacity-70' : ''
        }`}
        activeOpacity={0.9}>
        {loadingProvider === 'google' ? (
          <ActivityIndicator color="#0a1f1b" />
        ) : (
          <>
            <Ionicons name="logo-google" size={20} color="#4285F4" />
            <Text
              className="text-base"
              style={{ color: '#0f2e28', fontFamily: 'Outfit', fontWeight: '500' }}>
              Continue with Google
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}
