import { Link, Stack } from 'expo-router';
import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import '@/global.css';

/**
 * 404 Not Found Screen - Divine Geometry Design
 */
export default function NotFoundScreen() {
  return (
    <SafeAreaView className="flex-1 bg-midnight">
      <View className="flex-1 items-center justify-center px-8">
        <Stack.Screen options={{ title: 'Oops!' }} />

        {/* Title */}
        <Text className="mb-4 text-center text-3xl text-cream" style={{ fontFamily: 'Fraunces' }}>
          Page not found
        </Text>

        <Text className="mb-8 text-center text-lg text-cream/60" style={{ fontFamily: 'Outfit' }}>
          {"This screen doesn't exist."}
        </Text>

        <Link href="/" asChild>
          <View className="rounded-xl bg-gold px-8 py-4">
            <Text
              className="text-lg text-midnight"
              style={{ fontFamily: 'Outfit', fontWeight: '500' }}>
              Go to home screen
            </Text>
          </View>
        </Link>
      </View>
    </SafeAreaView>
  );
}
