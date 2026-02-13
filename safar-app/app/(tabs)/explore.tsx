/**
 * Explore Tab - Root Garden
 * Browse all Arabic roots with search functionality
 * Divine Geometry Design - Dark (Midnight) theme
 */

import { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { Search } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { useAllRoots } from '@/lib/hooks/useAllRoots';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { trackEvent } from '@/lib/utils/analytics';
import type { RootWithCount } from '@/lib/hooks/useAllRoots';
import '@/global.css';

function RootCard({ root, onPress }: { root: RootWithCount; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={`${root.letters} root, ${root.meaning}, ${root.derivative_count} derivative words`}
      style={{
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 16,
        padding: 20,
      }}
      className="active:border-gold/30 active:bg-white/10">
      {/* Top row: Arabic letters and badge */}
      <View className="mb-3 flex-row items-start justify-between">
        <Text style={{ fontFamily: fonts.amiri, fontSize: 24, color: colors.gold }}>
          {root.letters}
        </Text>
        <View
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.3)',
            paddingHorizontal: 8,
            paddingVertical: 4,
            borderRadius: 6,
          }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 10,
              color: colors.cream,
              opacity: 0.6,
              letterSpacing: 1.5,
              textTransform: 'uppercase',
            }}>
            {root.derivative_count} {root.derivative_count === 1 ? 'word' : 'words'}
          </Text>
        </View>
      </View>

      {/* Transliteration */}
      {root.transliteration && (
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 18,
            color: colors.cream,
            marginBottom: 4,
          }}>
          {root.transliteration}
        </Text>
      )}

      {/* Meaning */}
      <Text
        style={{
          fontFamily: fonts.outfit,
          fontSize: 14,
          color: colors.cream,
          opacity: 0.6,
        }}>
        {root.meaning}
      </Text>
    </Pressable>
  );
}

export default function ExploreScreen() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  const { data: roots, isLoading, error, refetch } = useAllRoots(debouncedQuery);

  // Track screen view on mount
  useEffect(() => {
    trackEvent('root_garden_viewed', {});
  }, []);

  // Debounce search input (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);

      // Track search event if query is not empty
      if (searchQuery.trim()) {
        trackEvent('root_searched', {
          search_query: searchQuery.trim(),
          results_count: roots?.length ?? 0,
        });
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery, roots?.length]);

  // Memoize column calculation for FlatList
  const numColumns = 2;

  if (error) {
    return (
      <ScreenBackground variant="midnight" patternOpacity={0.05}>
        <View className="flex-1 items-center justify-center px-6">
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.cream,
              textAlign: 'center',
              marginBottom: 16,
            }}>
            Unable to load roots
          </Text>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 14,
              color: colors.cream,
              opacity: 0.6,
              textAlign: 'center',
              marginBottom: 24,
            }}>
            {error.message || 'Please try again'}
          </Text>
          <Pressable
            onPress={() => refetch()}
            style={{
              backgroundColor: colors.gold,
              paddingHorizontal: 24,
              paddingVertical: 12,
              borderRadius: 12,
            }}>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 16,
                color: colors.midnight,
                fontWeight: '600',
              }}>
              Retry
            </Text>
          </Pressable>
        </View>
      </ScreenBackground>
    );
  }

  return (
    <ScreenBackground variant="midnight" patternOpacity={0.05}>
      {/* Sticky Header */}
      <View
        style={{
          backgroundColor: 'rgba(10, 31, 27, 0.9)',
          paddingHorizontal: 24,
          paddingTop: 48,
          paddingBottom: 24,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(207, 170, 107, 0.1)',
        }}>
        <Text
          style={{
            fontFamily: fonts.fraunces,
            fontSize: 30,
            color: colors.cream,
            marginBottom: 16,
          }}>
          Root Garden
        </Text>

        {/* Search Bar */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            borderWidth: 1,
            borderColor: 'rgba(207, 170, 107, 0.2)',
            borderRadius: 12,
            paddingHorizontal: 16,
            paddingVertical: 12,
          }}>
          <Search size={20} color="rgba(207, 170, 107, 0.5)" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Search roots..."
            placeholderTextColor="rgba(232, 220, 197, 0.3)"
            autoCapitalize="none"
            autoCorrect={false}
            accessibilityLabel="Search roots by meaning, Arabic letters, or transliteration"
            style={{
              flex: 1,
              marginLeft: 12,
              fontFamily: fonts.outfit,
              fontSize: 16,
              color: colors.cream,
            }}
          />
          {searchQuery.length > 0 && (
            <Pressable
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
              <Text style={{ color: colors.cream, opacity: 0.5, fontSize: 18 }}>×</Text>
            </Pressable>
          )}
        </View>
      </View>

      {/* Root Grid */}
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
            Loading roots...
          </Text>
        </View>
      ) : roots && roots.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.cream,
              opacity: 0.6,
              textAlign: 'center',
            }}>
            No roots found
          </Text>
          {debouncedQuery && (
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 14,
                color: colors.cream,
                opacity: 0.4,
                textAlign: 'center',
                marginTop: 8,
              }}>
              Try a different search term
            </Text>
          )}
        </View>
      ) : (
        <FlatList
          data={roots}
          keyExtractor={(item) => item.id}
          numColumns={numColumns}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 24,
            paddingBottom: 128, // Tab bar clearance
          }}
          columnWrapperStyle={{
            gap: 16,
          }}
          renderItem={({ item }) => (
            <View style={{ flex: 1 / numColumns }}>
              <RootCard root={item} onPress={() => router.push(`/root-detail/${item.id}` as any)} />
            </View>
          )}
          ItemSeparatorComponent={() => <View style={{ height: 16 }} />}
        />
      )}
    </ScreenBackground>
  );
}
