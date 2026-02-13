import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/api/supabase';
import type { Lesson, Word } from '@/types';
import { timeouts } from '@/constants/timeouts';

export type LessonWithWords = Lesson & {
  words: Word[];
};

type UseLessonOptions = {
  enabled?: boolean;
};

export type LessonPreviewWord = Pick<Word, 'id' | 'arabic' | 'transliteration' | 'meaning'>;

export function useLesson(lessonId: string, options: UseLessonOptions = {}) {
  const { enabled = true } = options;

  return useQuery<LessonWithWords>({
    queryKey: ['lesson', lessonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lessons')
        .select('*, words(*)')
        .eq('id', lessonId)
        .order('order', { referencedTable: 'words', ascending: true })
        .single();

      if (error) throw error;
      return data as LessonWithWords;
    },
    staleTime: timeouts.query.staticContent,
    enabled: !!lessonId && enabled,
  });
}

export function useLessonPreview(
  lessonId: string,
  previewCount = 2,
  options: UseLessonOptions = {}
) {
  const { enabled = true } = options;

  return useQuery<LessonPreviewWord[]>({
    queryKey: ['lesson-preview', lessonId, previewCount],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('words')
        .select('id, arabic, transliteration, meaning')
        .eq('lesson_id', lessonId)
        .order('order', { ascending: true })
        .limit(previewCount);

      if (error) throw error;
      return (data ?? []) as LessonPreviewWord[];
    },
    staleTime: timeouts.query.staticContent,
    enabled: !!lessonId && previewCount > 0 && enabled,
  });
}
