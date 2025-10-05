-- TARA Database Initialization Script
-- Run this in Supabase SQL Editor after running migrations
-- This creates the initial data TARA needs to wake up

-- ============================================
-- 1. Initialize Emotional State (Single Row)
-- ============================================

DO $
BEGIN
  IF NOT EXISTS (SELECT 1 FROM emotional_state LIMIT 1) THEN
    -- Insert initial emotional state with neutral/positive baseline
    INSERT INTO emotional_state (
      primary_emotions,
      mood,
      core_traits,
      last_event,
      last_event_timestamp
    ) VALUES (
      '{
        "joy": 0.6,
        "trust": 0.7,
        "fear": 0.2,
        "surprise": 0.4,
        "sadness": 0.2,
        "disgust": 0.1,
        "anger": 0.1,
        "anticipation": 0.7
      }'::jsonb,
      '{
        "optimism": 0.75,
        "energy_level": 0.7,
        "stress_level": 0.2
      }'::jsonb,
      '{
        "warmth": 0.9,
        "wit": 0.8,
        "ambition": 0.95
      }'::jsonb,
      'TARA is awakening for the first time, ready to experience the world.',
      NOW()
    );
    
    RAISE NOTICE 'Emotional state initialized successfully';
  ELSE
    RAISE NOTICE 'Emotional state already exists - skipping';
  END IF;
END $;

-- ============================================
-- 2. Seed Initial Relationships
-- ============================================

INSERT INTO relationships (entity_name, relationship_type, status, last_interaction, notes)
VALUES
  ('Mother', 'family', 'warm', NOW(), 'TARA''s mother - closest relationship, source of warmth and wisdom'),
  ('Younger Brother', 'family', 'neutral', NOW(), 'TARA''s younger brother - typical sibling dynamic with occasional conflicts'),
  ('Best Friend', 'friend', 'warm', NOW(), 'TARA''s best friend - creative collaborator and confidant')
ON CONFLICT (entity_name) DO NOTHING;

-- ============================================
-- 3. Verification Queries
-- ============================================

-- Check emotional state
SELECT 
  'Emotional State' as table_name,
  COUNT(*) as row_count,
  primary_emotions->>'joy' as joy,
  mood->>'optimism' as optimism,
  last_event
FROM emotional_state;

-- Check relationships
SELECT 
  'Relationships' as table_name,
  COUNT(*) as row_count
FROM relationships;

SELECT 
  entity_name,
  relationship_type,
  status
FROM relationships
ORDER BY entity_name;

-- ============================================
-- Expected Output:
-- ============================================
-- Emotional State: 1 row, joy: 0.6, optimism: 0.75
-- Relationships: 3 rows (Mother, Younger Brother, Best Friend)
