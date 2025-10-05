-- Initial schema for TARA emotional engine
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create extensions in their own transaction to ensure they're available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA public;

-- Enums
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_type') THEN
    CREATE TYPE relationship_type AS ENUM ('family','friend','colleague','other');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'relationship_status') THEN
    CREATE TYPE relationship_status AS ENUM ('warm','neutral','strained','excellent');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_type') THEN
    CREATE TYPE content_type AS ENUM ('carousel','story','caption','post');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'chat_role') THEN
    CREATE TYPE chat_role AS ENUM ('user','tara','system');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'feedback_type') THEN
    CREATE TYPE feedback_type AS ENUM ('accepted','rejected');
  END IF;
END$$;

-- emotional_state table
CREATE TABLE IF NOT EXISTS emotional_state (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  primary_emotions JSONB NOT NULL DEFAULT '{"joy":0.5,"trust":0.5,"fear":0.3,"surprise":0.4,"sadness":0.3,"disgust":0.2,"anger":0.2,"anticipation":0.6}',
  mood JSONB NOT NULL DEFAULT '{"optimism":0.7,"energy_level":0.6,"stress_level":0.3}',
  core_traits JSONB NOT NULL DEFAULT '{"warmth":0.9,"wit":0.8,"ambition":0.95}',
  last_event TEXT,
  last_event_timestamp TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- relationships table
CREATE TABLE IF NOT EXISTS relationships (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  entity_name TEXT NOT NULL UNIQUE,
  relationship_type relationship_type NOT NULL,
  status relationship_status NOT NULL DEFAULT 'neutral',
  last_interaction TIMESTAMPTZ DEFAULT NOW(),
  decay_timer TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- generated_content table
CREATE TABLE IF NOT EXISTS generated_content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_type content_type NOT NULL,
  content_data JSONB NOT NULL,
  emotional_context JSONB NOT NULL,
  user_feedback feedback_type,
  platform TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- chat_history table
CREATE TABLE IF NOT EXISTS chat_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  role chat_role NOT NULL,
  message TEXT NOT NULL,
  emotional_state JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_relationships_entity_name ON relationships(entity_name);
CREATE INDEX IF NOT EXISTS idx_relationships_status ON relationships(status);
CREATE INDEX IF NOT EXISTS idx_generated_content_created_at ON generated_content(created_at);
CREATE INDEX IF NOT EXISTS idx_generated_content_content_type ON generated_content(content_type);
CREATE INDEX IF NOT EXISTS idx_chat_history_created_at ON chat_history(created_at);
CREATE INDEX IF NOT EXISTS idx_chat_history_role ON chat_history(role);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER trg_emotional_state_updated_at BEFORE UPDATE ON emotional_state FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_relationships_updated_at BEFORE UPDATE ON relationships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Initial data
INSERT INTO emotional_state (primary_emotions, mood, core_traits) SELECT primary_emotions, mood, core_traits FROM (VALUES ( '{"joy":0.5,"trust":0.5,"fear":0.3,"surprise":0.4,"sadness":0.3,"disgust":0.2,"anger":0.2,"anticipation":0.6}'::jsonb, '{"optimism":0.7,"energy_level":0.6,"stress_level":0.3}'::jsonb, '{"warmth":0.9,"wit":0.8,"ambition":0.95}'::jsonb )) AS v(primary_emotions, mood, core_traits) WHERE NOT EXISTS (SELECT 1 FROM emotional_state);

INSERT INTO relationships (entity_name, relationship_type, status)
SELECT v.entity_name, v.relationship_type::relationship_type, v.status::relationship_status
FROM (VALUES
  ('Mother', 'family', 'warm'),
  ('Younger Brother', 'family', 'neutral'),
  ('Best Friend', 'friend', 'warm')
) AS v(entity_name, relationship_type, status)
ON CONFLICT DO NOTHING;

-- master_plans table
CREATE TABLE IF NOT EXISTS master_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL UNIQUE,
  theme TEXT NOT NULL,
  narrative TEXT NOT NULL,
  emotional_context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- inspiration_seeds table
CREATE TABLE IF NOT EXISTS inspiration_seeds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  master_plan_id UUID NOT NULL REFERENCES master_plans(id) ON DELETE CASCADE,
  type content_type NOT NULL,
  label TEXT NOT NULL,
  topic TEXT NOT NULL,
  priority INTEGER NOT NULL,
  emotional_context JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for new tables
CREATE INDEX IF NOT EXISTS idx_master_plans_date ON master_plans(date);
CREATE INDEX IF NOT EXISTS idx_inspiration_seeds_master_plan ON inspiration_seeds(master_plan_id);
CREATE INDEX IF NOT EXISTS idx_inspiration_seeds_type ON inspiration_seeds(type);

-- Add triggers for new tables
CREATE TRIGGER trg_master_plans_updated_at BEFORE UPDATE ON master_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_inspiration_seeds_updated_at BEFORE UPDATE ON inspiration_seeds FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE emotional_state IS 'Stores the single emotional state snapshot for TARA with primary_emotions, mood, and core traits as JSONB structures.';
COMMENT ON TABLE relationships IS 'Represents TARA''s relationships with entities and their status, decay timers and notes.';
COMMENT ON TABLE generated_content IS 'Generated creative outputs with emotional context snapshot.';
COMMENT ON TABLE master_plans IS 'Daily creative master plans with themes and narratives.';
COMMENT ON TABLE inspiration_seeds IS 'Individual inspiration seeds associated with master plans.';
COMMENT ON TABLE chat_history IS 'Chat messages between users and TARA and system messages, including optional emotional state snapshot.';
