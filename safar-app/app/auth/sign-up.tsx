/**
 * Sign Up Screen - Divine Geometry Design
 * Email/password registration with form validation
 */

import { useState, useEffect } from 'react';
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
import { Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle } from 'lucide-react-native';
import { signUpSchema, type SignUpInput } from '@/lib/validation/auth.schema';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { SocialAuthDivider, SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import '@/global.css';

export default function SignUpScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [accountCreated, setAccountCreated] = useState(false);
  const signUp = useAuthStore((state) => state.signUp);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const clearError = useAuthStore((state) => state.clearError);
  const accountDeleted = useAuthStore((state) => state.accountDeleted);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    control,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<SignUpInput>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignUpInput) => {
    clearError();
    const result = await signUp(data.email, data.password);
    if (result.success) {
      router.replace('/onboarding');
    } else if (result.error === 'Please check your email to confirm your account') {
      setAccountCreated(true);
    }
  };

  if (accountCreated) {
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
            We sent a confirmation link to {getValues('email')}
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
          <View className="flex-1 justify-center px-8 pb-8">
            {/* Account Deleted Confirmation */}
            {accountDeleted && (
              <View className="mb-6 rounded-xl border border-gold/30 bg-gold/10 p-4">
                <Text
                  className="text-center text-gold"
                  style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                  Your account has been successfully deleted.
                </Text>
              </View>
            )}

            {/* Header */}
            <View className="mb-12">
              <Text className="mb-3 text-5xl text-cream" style={{ fontFamily: 'Fraunces' }}>
                Create Account
              </Text>
              <Text className="text-lg text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Begin your journey to understanding
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

              {/* Password Input */}
              <View>
                <View className="flex-row items-center rounded-2xl border border-gold/20 bg-white/5 px-4">
                  <Lock color="#cfaa6b" size={20} />
                  <Controller
                    control={control}
                    name="password"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="flex-1 px-3 py-4 text-base text-cream"
                        style={{ fontFamily: 'Outfit' }}
                        placeholder="Password (min 8 characters)"
                        placeholderTextColor="rgba(232, 220, 197, 0.3)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password-new"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showPassword ? (
                      <EyeOff color="#cfaa6b" size={20} />
                    ) : (
                      <Eye color="#cfaa6b" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.password && (
                  <Text
                    className="ml-1 mt-2 text-sm"
                    style={{ fontFamily: 'Outfit', color: colors.rating.again }}>
                    {errors.password.message}
                  </Text>
                )}
              </View>

              {/* API Error */}
              {error && (
                <View
                  className="rounded-xl p-4"
                  style={{
                    borderWidth: 1,
                    borderColor: 'rgba(168, 84, 84, 0.30)',
                    backgroundColor: 'rgba(168, 84, 84, 0.10)',
                  }}>
                  <Text
                    className="text-center"
                    style={{ fontFamily: 'Outfit', color: colors.rating.again }}>
                    {error}
                  </Text>
                  {error.includes('already exists') && (
                    <Link href="/auth/sign-in" asChild>
                      <TouchableOpacity className="mt-2">
                        <Text
                          className="text-center text-gold underline"
                          style={{ fontFamily: 'Outfit' }}>
                          Sign in instead
                        </Text>
                      </TouchableOpacity>
                    </Link>
                  )}
                </View>
              )}

              {/* Sign Up Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                className={`mt-4 flex-row items-center justify-center gap-2 rounded-xl bg-gold px-8 py-4 ${
                  isLoading ? 'opacity-70' : ''
                }`}
                style={{
                  shadowColor: '#cfaa6b',
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.3,
                  shadowRadius: 30,
                  elevation: 8,
                }}
                activeOpacity={0.9}>
                {isLoading ? (
                  <ActivityIndicator color="#0a1f1b" />
                ) : (
                  <>
                    <Text
                      className="text-lg text-midnight"
                      style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
                      Create Account
                    </Text>
                    <ArrowRight color="#0a1f1b" size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign In Link */}
            <View className="mt-8 flex-row items-center justify-center">
              <Text className="text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Already have an account?{' '}
              </Text>
              <Link href="/auth/sign-in" asChild>
                <TouchableOpacity>
                  <Text className="text-gold" style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                    Sign in
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Social Auth */}
            <SocialAuthDivider />
            <SocialAuthButtons mode="sign-up" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
