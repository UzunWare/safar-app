-- Migration: Create lesson quiz questions table
-- Stores quiz questions for root lessons and other interactive lessons

CREATE TABLE IF NOT EXISTS public.lesson_quiz_questions (
  id TEXT PRIMARY KEY,
  lesson_id TEXT NOT NULL REFERENCES public.lessons(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  wrong_answers TEXT[] NOT NULL,
  explanation TEXT,
  "order" INTEGER NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.lesson_quiz_questions IS 'Quiz questions for interactive lessons (especially root lessons)';
COMMENT ON COLUMN public.lesson_quiz_questions.wrong_answers IS 'Array of 3 incorrect answers for multiple choice';
COMMENT ON COLUMN public.lesson_quiz_questions.explanation IS 'Optional explanation shown after answering';

-- Index for lesson lookups
CREATE INDEX idx_quiz_questions_lesson_id ON public.lesson_quiz_questions(lesson_id);

-- Prevent duplicate ordering within a lesson
CREATE UNIQUE INDEX idx_quiz_questions_lesson_order ON public.lesson_quiz_questions(lesson_id, "order");

-- Enable Row Level Security
ALTER TABLE public.lesson_quiz_questions ENABLE ROW LEVEL SECURITY;

-- RLS: All users can read quiz questions (read-only content)
CREATE POLICY "Anyone can read quiz questions"
  ON public.lesson_quiz_questions FOR SELECT
  TO anon, authenticated
  USING (true);

-- Apply updated_at trigger
CREATE TRIGGER set_quiz_questions_updated_at
  BEFORE UPDATE ON public.lesson_quiz_questions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
