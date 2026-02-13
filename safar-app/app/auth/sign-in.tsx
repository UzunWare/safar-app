/**
 * Sign In Screen - Divine Geometry Design
 * Placeholder for Story 1.5
 */

import { useEffect, useRef, useState } from 'react';
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
import { Link } from 'expo-router';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { signInSchema, type SignInInput } from '@/lib/validation/auth.schema';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { SocialAuthDivider, SocialAuthButtons } from '@/components/auth/SocialAuthButtons';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import '@/global.css';

export default function SignInScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useAuthStore((state) => state.signIn);
  const clearError = useAuthStore((state) => state.clearError);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);
  const passwordInputRef = useRef<TextInput>(null);

  useEffect(() => {
    clearError();
  }, [clearError]);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInInput>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: SignInInput) => {
    clearError();
    await signIn(data.email, data.password);
    // Navigation handled by useProtectedRoute in root layout
  };

  return (
    <ScreenBackground variant="midnight" patternOpacity={0.03}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
          <View className="flex-1 justify-center px-8 pb-8">
            {/* Header */}
            <View className="mb-12">
              <Text className="mb-3 text-5xl text-cream" style={{ fontFamily: 'Fraunces' }}>
                Welcome Back
              </Text>
              <Text className="text-lg text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Continue your learning journey
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
                        returnKeyType="next"
                        editable={!isLoading}
                        blurOnSubmit={false}
                        onSubmitEditing={() => passwordInputRef.current?.focus()}
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
                        ref={passwordInputRef}
                        className="flex-1 px-3 py-4 text-base text-cream"
                        style={{ fontFamily: 'Outfit' }}
                        placeholder="Password"
                        placeholderTextColor="rgba(232, 220, 197, 0.3)"
                        secureTextEntry={!showPassword}
                        autoCapitalize="none"
                        autoComplete="password"
                        returnKeyType="done"
                        editable={!isLoading}
                        onSubmitEditing={handleSubmit(onSubmit)}
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

              {/* Forgot Password Link */}
              <Link href="/auth/forgot-password" asChild>
                <TouchableOpacity className="self-end">
                  <Text className="text-gold/80" style={{ fontFamily: 'Outfit' }}>
                    Forgot password?
                  </Text>
                </TouchableOpacity>
              </Link>

              {/* API Error */}
              {error && (
                <View
                  className="rounded-xl p-4"
                  accessibilityRole="alert"
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
                </View>
              )}

              {/* Sign In Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                className={`mt-2 flex-row items-center justify-center gap-2 rounded-xl bg-gold px-8 py-4 ${
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
                  <ActivityIndicator testID="sign-in-loading" color="#0a1f1b" />
                ) : (
                  <>
                    <Text
                      className="text-lg text-midnight"
                      style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
                      Sign In
                    </Text>
                    <ArrowRight color="#0a1f1b" size={20} />
                  </>
                )}
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="mt-8 flex-row items-center justify-center">
              <Text className="text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Don&apos;t have an account?{' '}
              </Text>
              <Link href="/auth/sign-up" asChild>
                <TouchableOpacity>
                  <Text className="text-gold" style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
                    Sign up
                  </Text>
                </TouchableOpacity>
              </Link>
            </View>

            {/* Social Auth */}
            <SocialAuthDivider />
            <SocialAuthButtons mode="sign-in" />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
