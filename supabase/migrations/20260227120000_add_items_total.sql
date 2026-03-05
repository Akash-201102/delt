-- add columns for itemized data and total to entries table
ALTER TABLE public.entries
  ADD COLUMN items JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN total TEXT NOT NULL DEFAULT '';
