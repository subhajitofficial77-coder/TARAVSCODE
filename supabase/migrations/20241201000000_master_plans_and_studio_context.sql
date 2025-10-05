-- Migration: add master_plans table and studio context support

-- Create master_plans table
CREATE TABLE IF NOT EXISTS public.master_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at timestamptz DEFAULT now(),
  date date NOT NULL,
  narrative text NOT NULL,
  theme text,
  mood_summary text,
  inspiration_seeds jsonb NOT NULL DEFAULT '[]'::jsonb,
  emotional_snapshot jsonb,
  quota jsonb,
  updated_at timestamptz DEFAULT now()
);

-- Ensure one plan per date
CREATE UNIQUE INDEX IF NOT EXISTS idx_master_plans_date ON public.master_plans (date DESC);

-- RLS: Enable row level security and policies
ALTER TABLE public.master_plans ENABLE ROW LEVEL SECURITY;

-- Allow authenticated users to read master plans
CREATE POLICY "master_plans_select_authenticated" ON public.master_plans
  FOR SELECT
  USING (auth.role() = 'authenticated');

-- Restrict inserts/updates to service role only
CREATE POLICY "master_plans_service_only_mutation" ON public.master_plans
  FOR INSERT, UPDATE, DELETE
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');

-- Add status column to daily_plans if not exists
ALTER TABLE public.daily_plans ADD COLUMN IF NOT EXISTS status text DEFAULT 'pending';

-- Comments for clarity
COMMENT ON TABLE public.master_plans IS 'Daily master plan for TARA: narrative, theme, inspiration seeds, emotional snapshot and content quota.';
COMMENT ON COLUMN public.master_plans.inspiration_seeds IS 'Array of inspiration seed objects: {id,label,type,topic,priority}';
COMMENT ON COLUMN public.master_plans.emotional_snapshot IS 'Copy of emotional_state at plan creation time';
COMMENT ON COLUMN public.master_plans.quota IS 'Daily content quota, e.g. {"carousel":1, "story":3}';
