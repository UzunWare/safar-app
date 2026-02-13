/**
 * FloatingTabBar - Premium floating pill navigation
 * Matches prototype Navigation: floating pill, gold dividers,
 * backdrop-blur, translateY active animation.
 */

import React from 'react';
import { View, Pressable, StyleSheet } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import Animated, { useAnimatedStyle, withTiming, Easing } from 'react-native-reanimated';
import { Home, BookOpen, LayoutGrid, RotateCcw, Award, User } from 'lucide-react-native';
import { colors } from '@/constants/colors';

const ICONS = [Home, BookOpen, LayoutGrid, RotateCcw, Award, User] as const;
const ICON_SIZE = 22;

function TabButton({
  index,
  isFocused,
  onPress,
  onLongPress,
  accessibilityLabel,
}: {
  index: number;
  isFocused: boolean;
  onPress: () => void;
  onLongPress: () => void;
  accessibilityLabel?: string;
}) {
  const Icon = ICONS[index];
  const iconColor = isFocused ? colors.gold : 'rgba(232, 220, 197, 0.4)';

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      {
        translateY: withTiming(isFocused ? -4 : 0, {
          duration: 200,
          easing: Easing.out(Easing.ease),
        }),
      },
    ],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Pressable
        onPress={onPress}
        onLongPress={onLongPress}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={accessibilityLabel}
        style={styles.tabButton}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
        <Icon size={ICON_SIZE} color={iconColor} strokeWidth={isFocused ? 2 : 1.5} />
      </Pressable>
    </Animated.View>
  );
}

export function FloatingTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.wrapper} pointerEvents="box-none">
      <View style={styles.container}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name, route.params);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          return (
            <React.Fragment key={route.key}>
              <TabButton
                index={index}
                isFocused={isFocused}
                onPress={onPress}
                onLongPress={onLongPress}
                accessibilityLabel={options.tabBarAccessibilityLabel}
              />
              {index < state.routes.length - 1 && <View style={styles.divider} />}
            </React.Fragment>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    position: 'absolute',
    bottom: 32,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 40,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(10, 31, 27, 0.95)',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(207, 170, 107, 0.2)',
    gap: 0,
    // Shadow matching prototype: shadow-[0_10px_40px_-10px_rgba(0,0,0,0.5)]
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 40,
    elevation: 20,
  },
  tabButton: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  divider: {
    width: 1,
    height: 32,
    backgroundColor: 'rgba(207, 170, 107, 0.1)',
  },
});
