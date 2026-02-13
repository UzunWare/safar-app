import { ReactNode } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import { useProtectedRoute } from '@/lib/hooks/useAuth';
import { colors } from '@/constants/colors';

interface ProtectedRouteProps {
  children: ReactNode;
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  useProtectedRoute();

  const session = useAuthStore((state) => state.session);
  const isInitialized = useAuthStore((state) => state.isInitialized);
  const isLoading = useAuthStore((state) => state.isLoading);

  if (!isInitialized || isLoading || !session) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.midnight,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
        <ActivityIndicator size="large" color={colors.gold} />
        <Text style={{ color: colors.cream, marginTop: 12 }}>Checking authentication...</Text>
      </View>
    );
  }

  return <>{children}</>;
}
