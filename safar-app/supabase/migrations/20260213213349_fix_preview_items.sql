-- Fix preview_items to show English descriptions instead of Arabic-only words
UPDATE public.pathways
SET preview_items = ARRAY['Surah Al-Fatiha — every word explained', 'Prayer position phrases (ruku, sujood)', 'Essential du''as & adhkar']
WHERE id = 'salah-first';
