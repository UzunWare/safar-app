import React from 'react';
import { Pressable, Text, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ChevronRight } from 'lucide-react-native';
import { fonts } from '@/constants/typography';

interface ContinueActionButtonProps {
  label: string;
  onPress: () => void;
  testID?: string;
  accessibilityLabel?: string;
}

export function ContinueActionButton({
  label,
  onPress,
  testID = 'quiz-continue-button',
  accessibilityLabel,
}: ContinueActionButtonProps) {
  const isComplete = label.toLowerCase().includes('complete');

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={
        accessibilityLabel ?? (isComplete ? 'Complete lesson' : 'Continue to next question')
      }
      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      style={({ pressed }) => ({
        marginTop: 10,
        borderRadius: 18,
        borderWidth: 3,
        borderColor: '#1b1208',
        overflow: 'hidden',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.34,
        shadowRadius: 14,
        elevation: 14,
        transform: [{ scale: pressed ? 0.985 : 1 }],
      })}>
      <LinearGradient
        colors={['#fff3e3', '#f3e4cb', '#e7d4b4']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={{
          minHeight: 64,
          paddingVertical: 18,
          paddingHorizontal: 16,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        }}>
        <LinearGradient
          pointerEvents="none"
          colors={[
            'rgba(255, 255, 255, 0.38)',
            'rgba(255, 255, 255, 0.12)',
            'rgba(255, 255, 255, 0)',
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 24,
          }}
        />

        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Text
            style={{
              fontFamily: fonts.outfit,
              fontSize: 19,
              fontWeight: '800',
              color: '#1f140a',
              letterSpacing: 0.9,
            }}>
            {label}
          </Text>
          {!isComplete && <ChevronRight size={21} color="#1f140a" style={{ marginLeft: 8 }} />}
        </View>
      </LinearGradient>
    </Pressable>
  );
}
