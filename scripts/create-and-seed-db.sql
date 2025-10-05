-- Create and seed TARA database tables (run in Supabase SQL Editor)
-- This script creates the `emotional_state` and `relationships` tables if they
-- don't exist, then inserts the initial seed rows idempotently.

CREATE TABLE IF NOT EXISTS public.emotional_state (
  id BIGSERIAL PRIMARY KEY,
  primary_emotions JSONB NOT NULL,
  mood JSONB NOT NULL,
  core_traits JSONB,
  last_event TEXT,
  last_event_timestamp TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.relationships (
  id BIGSERIAL PRIMARY KEY,
  entity_name TEXT NOT NULL UNIQUE,
  relationship_type TEXT,
  status TEXT,
  last_interaction TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- Idempotent seed for emotional_state (insert only if table empty)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM public.emotional_state LIMIT 1) THEN
    INSERT INTO public.emotional_state (
      primary_emotions,
      mood,
      core_traits,
      last_event,
      last_event_timestamp
    ) VALUES (
      '{"joy": 0.6, "trust": 0.7, "fear": 0.2, "surprise": 0.4, "sadness": 0.2, "disgust": 0.1, "anger": 0.1, "anticipation": 0.7}'::jsonb,
      '{"optimism": 0.75, "energy_level": 0.7, "stress_level": 0.2}'::jsonb,
      '{"warmth": 0.9, "wit": 0.8, "ambition": 0.95}'::jsonb,
      'TARA is awakening for the first time, ready to experience the world.',
      now()
    );
  END IF;
END $$;

-- Idempotent seed for relationships
INSERT INTO public.relationships (entity_name, relationship_type, status, last_interaction, notes)
VALUES
  ('Mother', 'family', 'warm', now(), 'TARA''s mother - closest relationship, source of warmth and wisdom'),
  ('Younger Brother', 'family', 'neutral', now(), 'TARA''s younger brother - typical sibling dynamic with occasional conflicts'),
  ('Best Friend', 'friend', 'warm', now(), 'TARA''s best friend - creative collaborator and confidant')
ON CONFLICT (entity_name) DO NOTHING;

-- generated_content table (idempotent)
CREATE TABLE IF NOT EXISTS public.generated_content (
  id BIGSERIAL PRIMARY KEY,
  content_type TEXT,
  content_data JSONB NOT NULL,
  emotional_context JSONB,
  user_feedback TEXT,
  provider TEXT,
  platform TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT now(),
  feedback_received_at TIMESTAMPTZ
);

-- content_feedback table for storing granular feedback items
CREATE TABLE IF NOT EXISTS public.content_feedback (
  id BIGSERIAL PRIMARY KEY,
  content_id BIGINT,
  user_id TEXT,
  category TEXT,
  score INTEGER,
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- chat_history table (simple version)
CREATE TABLE IF NOT EXISTS public.chat_history (
  id BIGSERIAL PRIMARY KEY,
  role TEXT,
  message TEXT NOT NULL,
  emotional_state JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes to improve queries
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON public.generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_content_type ON public.generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON public.chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_content_feedback_content_id ON public.content_feedback(content_id);

-- Verification queries (optional):
-- SELECT 'Emotional State' as table_name, COUNT(*) as row_count FROM public.emotional_state;
-- SELECT 'Relationships' as table_name, COUNT(*) as row_count FROM public.relationships;
