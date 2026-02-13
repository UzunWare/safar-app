/**
 * Main Tabs Layout
 * Bottom tab navigation for authenticated users
 * Divine Geometry Design - Floating pill navigation
 */

import { Tabs } from 'expo-router';
import { FloatingTabBar } from '@/components/ui/FloatingTabBar';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import '@/global.css';

export default function TabsLayout() {
  return (
    <ProtectedRoute>
      <Tabs
        tabBar={(props) => <FloatingTabBar {...props} />}
        screenOptions={{
          headerShown: false,
        }}>
        <Tabs.Screen name="index" options={{ title: 'Home' }} />
        <Tabs.Screen name="learn" options={{ title: 'Learn' }} />
        <Tabs.Screen name="explore" options={{ title: 'Explore' }} />
        <Tabs.Screen name="review" options={{ title: 'Review' }} />
        <Tabs.Screen name="progress" options={{ title: 'Progress' }} />
        <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
      </Tabs>
    </ProtectedRoute>
  );
}
