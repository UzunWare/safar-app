/**
 * Progress Tab - Your Progress
 * Parchment background, pathway stats, unit milestones
 * Matches prototype aesthetic with Divine Geometry design
 */

import { View, Text, ScrollView } from 'react-native';
import { Award, BookOpen, Target, CheckCircle } from 'lucide-react-native';
import { usePathway } from '@/lib/hooks/usePathway';
import { useProgress } from '@/lib/hooks/useProgress';
import { ScreenBackground } from '@/components/ui/ScreenBackground';
import { colors } from '@/constants/colors';
import { fonts } from '@/constants/typography';
import type { Unit } from '@/types/supabase.types';
import '@/global.css';

export default function ProgressScreen() {
  const { data: pathway } = usePathway();
  const units = pathway?.units ?? [];
  const progress = useProgress(units);

  return (
    <ScreenBackground variant="parchment" patternOpacity={0.02}>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ padding: 24, paddingTop: 48 }}>
          {/* Header */}
          <View style={{ marginBottom: 32 }}>
            <Text
              style={{
                fontFamily: fonts.fraunces,
                fontSize: 30,
                color: colors.emeraldDeep,
                marginBottom: 4,
              }}>
              Your Progress
            </Text>
            <Text
              style={{ fontFamily: fonts.outfit, fontSize: 16, color: 'rgba(15, 46, 40, 0.6)' }}>
              {pathway ? pathway.name : 'Start learning to track your progress'}
            </Text>
          </View>

          {/* Overall Stats Grid */}
          <View style={{ flexDirection: 'row', gap: 16, marginBottom: 32 }}>
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(207, 170, 107, 0.2)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                <Target color={colors.emeraldDeep} size={20} />
              </View>
              <Text style={{ fontFamily: fonts.fraunces, fontSize: 30, color: colors.emeraldDeep }}>
                {progress.pathwayPercent}%
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: colors.emeraldDeep,
                  opacity: 0.5,
                }}>
                Complete
              </Text>
            </View>
            <View
              style={{
                flex: 1,
                backgroundColor: '#ffffff',
                padding: 20,
                borderRadius: 16,
                alignItems: 'center',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 20,
                  backgroundColor: 'rgba(15, 46, 40, 0.1)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 12,
                }}>
                <BookOpen color={colors.emeraldDeep} size={20} />
              </View>
              <Text style={{ fontFamily: fonts.fraunces, fontSize: 30, color: colors.emeraldDeep }}>
                {units.length}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 10,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: colors.emeraldDeep,
                  opacity: 0.5,
                }}>
                Units
              </Text>
            </View>
          </View>

          {/* Pathway Progress Bar */}
          {pathway && (
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 24,
                marginBottom: 32,
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 1 },
                shadowOpacity: 0.03,
                shadowRadius: 6,
                elevation: 1,
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 16,
                }}>
                <Text
                  style={{ fontFamily: fonts.fraunces, fontSize: 18, color: colors.emeraldDeep }}>
                  Pathway Progress
                </Text>
                <Text
                  style={{
                    fontFamily: fonts.outfit,
                    fontSize: 14,
                    color: 'rgba(15, 46, 40, 0.5)',
                  }}>
                  {progress.pathwayPercent}%
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: 'rgba(15, 46, 40, 0.06)',
                  overflow: 'hidden',
                }}>
                <View
                  style={{
                    height: '100%',
                    borderRadius: 4,
                    backgroundColor: colors.gold,
                    width: `${progress.pathwayPercent}%`,
                  }}
                />
              </View>
            </View>
          )}

          {/* Unit Milestones */}
          <Text
            style={{
              fontFamily: fonts.fraunces,
              fontSize: 20,
              color: colors.emeraldDeep,
              marginBottom: 16,
            }}>
            Unit Milestones
          </Text>

          {units.length > 0 ? (
            <View style={{ gap: 12 }}>
              {units.map((unit: Unit, index: number) => {
                const isComplete = progress.isUnitComplete(unit.id);
                const percent = progress.unitPercent(unit.id);
                return (
                  <View
                    key={unit.id}
                    style={{
                      backgroundColor: '#ffffff',
                      borderRadius: 20,
                      padding: 20,
                      flexDirection: 'row',
                      alignItems: 'center',
                      gap: 16,
                      shadowColor: '#000',
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.03,
                      shadowRadius: 6,
                      elevation: 1,
                      borderWidth: 1,
                      borderColor: isComplete
                        ? 'rgba(207, 170, 107, 0.3)'
                        : 'rgba(15, 46, 40, 0.05)',
                    }}>
                    {/* Unit status badge */}
                    {isComplete ? (
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 10,
                          backgroundColor: colors.emeraldDeep,
                          borderWidth: 2,
                          borderColor: colors.gold,
                          alignItems: 'center',
                          justifyContent: 'center',
                          transform: [{ rotate: '45deg' }],
                        }}>
                        <View style={{ transform: [{ rotate: '-45deg' }] }}>
                          <CheckCircle color={colors.gold} size={20} />
                        </View>
                      </View>
                    ) : (
                      <View
                        style={{
                          width: 44,
                          height: 44,
                          borderRadius: 12,
                          backgroundColor:
                            percent > 0 ? 'rgba(207, 170, 107, 0.15)' : 'rgba(15, 46, 40, 0.06)',
                          borderWidth: 1,
                          borderColor:
                            percent > 0 ? 'rgba(207, 170, 107, 0.2)' : 'rgba(15, 46, 40, 0.08)',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}>
                        <Text
                          style={{
                            fontFamily: fonts.fraunces,
                            fontSize: 16,
                            fontWeight: '600',
                            color: percent > 0 ? colors.gold : 'rgba(15, 46, 40, 0.4)',
                          }}>
                          {index + 1}
                        </Text>
                      </View>
                    )}

                    {/* Unit info */}
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontFamily: fonts.outfit,
                          fontSize: 16,
                          fontWeight: '500',
                          color: colors.emeraldDeep,
                          marginBottom: 4,
                        }}>
                        {unit.name}
                      </Text>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        <Text
                          style={{
                            fontFamily: fonts.outfit,
                            fontSize: 12,
                            color: 'rgba(15, 46, 40, 0.5)',
                          }}>
                          {unit.word_count} words
                        </Text>
                        <Text
                          style={{
                            fontFamily: fonts.outfit,
                            fontSize: 12,
                            color: isComplete ? colors.gold : 'rgba(15, 46, 40, 0.4)',
                          }}>
                          {isComplete ? 'Complete' : percent > 0 ? `${percent}%` : 'Not started'}
                        </Text>
                      </View>
                      {/* Mini progress bar */}
                      {!isComplete && percent > 0 && (
                        <View
                          style={{
                            marginTop: 8,
                            height: 4,
                            borderRadius: 2,
                            backgroundColor: 'rgba(15, 46, 40, 0.06)',
                            overflow: 'hidden',
                          }}>
                          <View
                            style={{
                              height: '100%',
                              borderRadius: 2,
                              backgroundColor: colors.gold,
                              width: `${percent}%`,
                            }}
                          />
                        </View>
                      )}
                    </View>
                  </View>
                );
              })}
            </View>
          ) : (
            <View
              style={{
                backgroundColor: '#ffffff',
                borderRadius: 24,
                padding: 32,
                alignItems: 'center',
                borderWidth: 1,
                borderColor: 'rgba(15, 46, 40, 0.05)',
              }}>
              <Award color={colors.gold} size={36} />
              <Text
                style={{
                  fontFamily: fonts.fraunces,
                  fontSize: 20,
                  color: colors.emeraldDeep,
                  marginTop: 16,
                  textAlign: 'center',
                }}>
                Start Your Journey
              </Text>
              <Text
                style={{
                  fontFamily: fonts.outfit,
                  fontSize: 14,
                  color: 'rgba(15, 46, 40, 0.6)',
                  marginTop: 8,
                  textAlign: 'center',
                }}>
                Complete lessons to track your milestones here.
              </Text>
            </View>
          )}

          {/* Version footer */}
          <View
            style={{
              marginTop: 32,
              paddingTop: 16,
              borderTopWidth: 1,
              borderTopColor: 'rgba(15, 46, 40, 0.1)',
            }}>
            <Text
              style={{
                fontFamily: fonts.outfit,
                fontSize: 10,
                letterSpacing: 2,
                textTransform: 'uppercase',
                textAlign: 'center',
                color: 'rgba(15, 46, 40, 0.3)',
              }}>
              Keep going — every word matters
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenBackground>
  );
}
