
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  amount TEXT NOT NULL DEFAULT '',
  date TEXT NOT NULL DEFAULT '',
  raw_ocr_text TEXT,
  confidence REAL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Public access for this app (no auth required for simplicity)
CREATE POLICY "Allow all read access" ON public.entries FOR SELECT USING (true);
CREATE POLICY "Allow all insert access" ON public.entries FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow all update access" ON public.entries FOR UPDATE USING (true);
CREATE POLICY "Allow all delete access" ON public.entries FOR DELETE USING (true);
