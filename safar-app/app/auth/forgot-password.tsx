/**
 * Forgot Password Screen - Divine Geometry Design
 * Request password reset email
 */

import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { Link, router } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react-native';
import { forgotPasswordSchema, type ForgotPasswordInput } from '@/lib/validation/auth.schema';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import '@/global.css';

export default function ForgotPasswordScreen() {
  const [emailSent, setEmailSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const requestPasswordReset = useAuthStore((state) => state.requestPasswordReset);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true);
    const success = await requestPasswordReset(data.email);
    setIsLoading(false);
    // Always show success (security - don't reveal if email exists)
    if (success) {
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.03}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
            <CheckCircle color="#cfaa6b" size={40} />
          </View>
          <Text className="mb-3 text-center text-3xl text-cream" style={{ fontFamily: 'Fraunces' }}>
            Check Your Email
          </Text>
          <Text className="mb-8 text-center text-cream/60" style={{ fontFamily: 'Outfit' }}>
            We sent a password reset link to {getValues('email')}
          </Text>
          <TouchableOpacity
            onPress={() => router.replace('/auth/sign-in')}
            accessibilityRole="button"
            accessibilityLabel="Back to Sign In"
            className="w-full rounded-2xl bg-gold py-4"
            activeOpacity={0.9}>
            <Text
              className="text-center text-lg text-midnight"
              style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
              Back to Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="midnight" patternOpacity={0.03}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 px-8 pb-8 pt-4">
            {/* Back Button */}
            <TouchableOpacity
              onPress={() => router.back()}
              className="mb-6 flex-row items-center"
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <ArrowLeft color="#cfaa6b" size={24} />
              <Text className="ml-2 text-gold" style={{ fontFamily: 'Outfit' }}>
                Back
              </Text>
            </TouchableOpacity>

            {/* Header */}
            <View className="mb-12">
              <Text className="mb-3 text-5xl text-cream" style={{ fontFamily: 'Fraunces' }}>
                Reset Password
              </Text>
              <Text className="text-lg text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Enter your email address and we&apos;ll send you a link to reset your password
              </Text>
            </View>

            {/* Form */}
            <View className="gap-5">
              {/* Email Input */}
              <View>
                <View className="flex-row items-center rounded-2xl border border-gold/20 bg-white/5 px-4">
                  <Mail color="#cfaa6b" size={20} />
                  <Controller
                    control={control}
                    name="email"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="flex-1 px-3 py-4 text-base text-cream"
                        style={{ fontFamily: 'Outfit' }}
                        placeholder="Email address"
                        placeholderTextColor="rgba(232, 220, 197, 0.3)"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                </View>
                {errors.email && (
                  <Text
                    className="ml-1 mt-2 text-sm"
                    style={{ fontFamily: 'Outfit', color: colors.rating.again }}>
                    {errors.email.message}
                  </Text>
                )}
              </View>

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Send Reset Link"
                className={`mt-4 rounded-xl bg-gold py-4 ${isLoading ? 'opacity-70' : ''}`}
                activeOpacity={0.9}>
                {isLoading ? (
                  <ActivityIndicator color="#0a1f1b" />
                ) : (
                  <Text
                    className="text-center text-lg text-midnight"
                    style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
                    Send Reset Link
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Back to Sign In */}
            <View className="mt-8 flex-row items-center justify-center">
              <Text className="text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Remember your password?{' '}
              </Text>
              <Link href="/auth/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-gold" style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                    Sign in
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
