/**
 * Root Detail Screen - Full-Screen Bloom Visualization
 * Modal-style route for browsing root derivatives from Root Garden
 * Divine Geometry Design - Dark (Midnight) theme
 */

import { View, Text, Pressable, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { RootExplorer } from '@/components/learning/RootExplorer';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Root, Word } from '@/types/supabase.types';
import '@/global.css';

export default function RootDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  // Query root by ID
  const {
    data: root,
    isLoading: rootLoading,
    error: rootError,
  } = useQuery<Root>({
    queryKey: ['root', id],
    queryFn: async () => {
      const { data, error } = await supabase.from('roots').select('*').eq('id', id).single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });

  // Query all related words (not limited to 4)
  const { data: words = [], isLoading: wordsLoading } = useQuery<Word[]>({
    queryKey: ['rootWords', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('word_roots')
        .select(
          `
          words (
            id,
            arabic,
            transliteration,
            meaning,
            lesson_id
          )
        `
        )
        .eq('root_id', id);

      if (error) throw error;
      return data?.map((wr: any) => wr.words) ?? [];
    },
    enabled: !!id && !!root,
  });

  const isLoading = rootLoading || wordsLoading;

  if (rootError) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.05}>
        <SafeAreaView style={{ flex: 1 }}>
          <View
            style={{
              paddingHorizontal: 24,
              paddingTop: 12,
              paddingBottom: 16,
              flexDirection: 'row',
              alignItems: 'center',
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(207, 170, 107, 0.1)',
            }}>
            <Pressable
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/explore' as any);
                }
              }}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              accessibilityRole="button"
              accessibilityLabel="Go back">
              <ChevronLeft size={24} color={colors.cream} />
            </Pressable>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 20,
                color: colors.cream,
                marginLeft: 16,
              }}>
              Root Explorer
            </Text>
          </View>

          <View className="flex-1 items-center justify-center px-6">
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 20,
                color: colors.cream,
                textAlign: 'center',
                marginBottom: 16,
              }}>
              Root not found
            </Text>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.cream,
                opacity: 0.6,
                textAlign: 'center',
              }}>
              {rootError.message || 'Please try again'}
            </Text>
          </View>
        </SafeAreaView>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="midnight" patternOpacity={0.05}>
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header with back button */}
        <View
          style={{
            paddingHorizontal: 24,
            paddingTop: 12,
            paddingBottom: 16,
            flexDirection: 'row',
            alignItems: 'center',
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(207, 170, 107, 0.1)',
          }}>
          <Pressable
            onPress={() => router.back()}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            accessibilityRole="button"
            accessibilityLabel="Go back to root garden">
            <ChevronLeft size={24} color={colors.cream} />
          </Pressable>
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.cream,
              marginLeft: 16,
            }}>
            Root Explorer
          </Text>
        </View>

        {/* Full-screen bloom visualization with scroll */}
        {isLoading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color={colors.gold} />
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.cream,
                opacity: 0.6,
                marginTop: 16,
              }}>
              Loading root...
            </Text>
          </View>
        ) : root ? (
          <ScrollView
            contentContainerStyle={{
              flexGrow: 1,
              alignItems: 'center',
              justifyContent: 'center',
              paddingHorizontal: 24,
              paddingVertical: 24,
            }}
            showsVerticalScrollIndicator={false}>
            <RootExplorer
              root={root}
              relatedWords={words}
              isExpanded={true}
              onCollapse={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace('/(tabs)/explore' as any);
                }
              }}
              wordId="" // Not applicable in browse context
              fullScreen={true}
            />
          </ScrollView>
        ) : null}
      </SafeAreaView>
    </ScreenBackground>
  );
}
