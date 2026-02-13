/**
 * Auth Stack Layout
 * Stack navigator for authentication screens
 */

import { Stack } from 'expo-router';
import '@/global.css';

export default function AuthLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: '#0a1f1b' }, // midnight
        animation: 'none', // Instant transitions for snappier feel
      }}
    />
  );
}
