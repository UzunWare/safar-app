import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import { fetchLessonProgress } from '@/lib/api/progress';
import { useAuthStore } from '@/lib/stores/useAuthStore';
import type { Unit, UserLessonProgress } from '@/types/supabase.types';
import { useMemo } from 'react';
import { timeouts } from '@/constants/timeouts';

export function useProgress(units: Unit[]) {
  const userId = useAuthStore((s) => s.user?.id);
  const unitIds = useMemo(() => units.map((u) => u.id), [units]);

  // Fetch all lessons for these units
  const { data: lessons = [], isLoading: lessonsLoading } = useQuery({
    queryKey: ['lessons-for-units', unitIds],
    queryFn: async () => {
      const { data, error } = await supabase.from('lessons').select('*').in('unit_id', unitIds);

      if (error) throw error;
      return data ?? [];
    },
    staleTime: timeouts.query.staticContent,
    enabled: unitIds.length > 0,
  });

  // Fetch user progress (M5: reuse fetchLessonProgress)
  const { data: progress = [], isLoading } = useQuery<UserLessonProgress[]>({
    queryKey: ['progress', userId],
    queryFn: () => fetchLessonProgress(userId!),
    staleTime: timeouts.query.wordProgress,
    enabled: !!userId,
  });

  const completedLessonIds = useMemo(() => new Set(progress.map((p) => p.lesson_id)), [progress]);

  const totalLessons = lessons.length;
  const completedLessons = lessons.filter((l) => completedLessonIds.has(l.id)).length;
  const pathwayPercent = totalLessons > 0 ? Math.round((completedLessons / totalLessons) * 100) : 0;

  const isLessonComplete = (lessonId: string) => completedLessonIds.has(lessonId);

  const isUnitComplete = (unitId: string) => {
    const unitLessons = lessons.filter((l) => l.unit_id === unitId);
    return unitLessons.length > 0 && unitLessons.every((l) => completedLessonIds.has(l.id));
  };

  const unitPercent = (unitId: string) => {
    const unitLessons = lessons.filter((l) => l.unit_id === unitId);
    if (unitLessons.length === 0) return 0;
    const completed = unitLessons.filter((l) => completedLessonIds.has(l.id)).length;
    return Math.round((completed / unitLessons.length) * 100);
  };

  // M3: Compute next incomplete lesson for Continue button
  const nextLessonId = useMemo(() => {
    for (const unit of units) {
      const unitLessons = lessons
        .filter((l) => l.unit_id === unit.id)
        .sort((a, b) => a.order - b.order);
      const next = unitLessons.find((l) => !completedLessonIds.has(l.id));
      if (next) return next.id;
    }
    // All complete — return first lesson for review
    if (units.length > 0) {
      const firstUnitLessons = lessons
        .filter((l) => l.unit_id === units[0].id)
        .sort((a, b) => a.order - b.order);
      return firstUnitLessons[0]?.id ?? null;
    }
    return null;
  }, [units, lessons, completedLessonIds]);

  return {
    completedLessons,
    totalLessons,
    pathwayPercent,
    isLessonComplete,
    isUnitComplete,
    unitPercent,
    isLoading: isLoading || lessonsLoading,
    completedLessonIds,
    nextLessonId,
  };
}
