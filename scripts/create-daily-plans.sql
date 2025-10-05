-- Create daily_plans table and seed example rows
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id BIGSERIAL PRIMARY KEY,
  item_type TEXT NOT NULL,
  topic TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  scheduled_for TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

INSERT INTO public.daily_plans (item_type, topic, status)
VALUES
  ('carousel', 'Mother-daughter relationships', 'pending'),
  ('story', 'Family traditions poll', 'pending'),
  ('caption', 'Childhood memories', 'pending')
ON CONFLICT DO NOTHING;
