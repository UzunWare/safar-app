/**
 * Reset Password Screen - Divine Geometry Design
 * Set new password after email link
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
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Lock, Eye, EyeOff, CheckCircle } from 'lucide-react-native';
import { resetPasswordSchema, type ResetPasswordInput } from '@/lib/validation/auth.schema';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import '@/global.css';

export default function ResetPasswordScreen() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [success, setSuccess] = useState(false);
  const updatePassword = useAuthStore((state) => state.updatePassword);
  const isLoading = useAuthStore((state) => state.isLoading);
  const error = useAuthStore((state) => state.error);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    const result = await updatePassword(data.password);
    if (result.success) {
      setSuccess(true);
      // Navigation will be handled by useProtectedRoute after session updates
    }
  };

  if (success) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.03}>
        <View className="flex-1 items-center justify-center px-8">
          <View className="mb-6 h-20 w-20 items-center justify-center rounded-full border border-gold/30 bg-gold/10">
            <CheckCircle color="#cfaa6b" size={40} />
          </View>
          <Text className="mb-3 text-center text-3xl text-cream" style={{ fontFamily: 'Fraunces' }}>
            Password Updated
          </Text>
          <Text className="text-center text-cream/60" style={{ fontFamily: 'Outfit' }}>
            Your password has been updated. You will be redirected shortly...
          </Text>
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
          <View className="flex-1 px-8 pb-8 pt-16">
            {/* Header */}
            <View className="mb-12">
              <Text className="mb-3 text-5xl text-cream" style={{ fontFamily: 'Fraunces' }}>
                New Password
              </Text>
              <Text className="text-lg text-cream/60" style={{ fontFamily: 'Outfit' }}>
                Enter your new password below
              </Text>
            </View>

            {/* Form */}
            <View className="gap-5">
              {/* New Password Input */}
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
                        placeholder="New password (min 8 characters)"
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

              {/* Confirm Password Input */}
              <View>
                <View className="flex-row items-center rounded-2xl border border-gold/20 bg-white/5 px-4">
                  <Lock color="#cfaa6b" size={20} />
                  <Controller
                    control={control}
                    name="confirmPassword"
                    render={({ field: { onChange, onBlur, value } }) => (
                      <TextInput
                        className="flex-1 px-3 py-4 text-base text-cream"
                        style={{ fontFamily: 'Outfit' }}
                        placeholder="Confirm new password"
                        placeholderTextColor="rgba(232, 220, 197, 0.3)"
                        secureTextEntry={!showConfirmPassword}
                        autoCapitalize="none"
                        autoComplete="password-new"
                        onBlur={onBlur}
                        onChangeText={onChange}
                        value={value}
                      />
                    )}
                  />
                  <TouchableOpacity
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
                    {showConfirmPassword ? (
                      <EyeOff color="#cfaa6b" size={20} />
                    ) : (
                      <Eye color="#cfaa6b" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
                {errors.confirmPassword && (
                  <Text
                    className="ml-1 mt-2 text-sm"
                    style={{ fontFamily: 'Outfit', color: colors.rating.again }}>
                    {errors.confirmPassword.message}
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
                  }}
                  accessibilityRole="alert">
                  <Text
                    className="text-center"
                    style={{ fontFamily: 'Outfit', color: colors.rating.again }}>
                    {error}
                  </Text>
                </View>
              )}

              {/* Submit Button */}
              <TouchableOpacity
                onPress={handleSubmit(onSubmit)}
                disabled={isLoading}
                accessibilityRole="button"
                accessibilityLabel="Update Password"
                className={`mt-4 rounded-xl bg-gold py-4 ${isLoading ? 'opacity-70' : ''}`}
                activeOpacity={0.9}>
                {isLoading ? (
                  <ActivityIndicator color="#0a1f1b" />
                ) : (
                  <Text
                    className="text-center text-lg text-midnight"
                    style={{ fontFamily: 'Fraunces', fontWeight: '600' }}>
                    Update Password
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ScreenBackground>
  );
}
