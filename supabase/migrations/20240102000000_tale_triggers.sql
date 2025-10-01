-- TALE triggers: mood calculation and relationship decay helpers

CREATE OR REPLACE FUNCTION calculate_mood_from_emotions()
RETURNS TRIGGER AS $$
DECLARE
  emotions JSONB;
  joy NUMERIC;
  trust_val NUMERIC;
  fear NUMERIC;
  surprise NUMERIC;
  sadness NUMERIC;
  anger NUMERIC;
  disgust NUMERIC;
  anticipation NUMERIC;
  new_optimism NUMERIC;
  new_energy NUMERIC;
  new_stress NUMERIC;
BEGIN
  emotions := NEW.primary_emotions;
  joy := (emotions->>'joy')::NUMERIC;
  trust_val := (emotions->>'trust')::NUMERIC;
  fear := (emotions->>'fear')::NUMERIC;
  surprise := (emotions->>'surprise')::NUMERIC;
  sadness := (emotions->>'sadness')::NUMERIC;
  anger := (emotions->>'anger')::NUMERIC;
  disgust := (emotions->>'disgust')::NUMERIC;
  anticipation := (emotions->>'anticipation')::NUMERIC;

  new_optimism := ((joy + trust_val + anticipation - sadness - fear) / 5.0 + 1.0) / 2.0;
  new_energy := ((joy + anticipation + surprise - sadness - fear) / 5.0 + 1.0) / 2.0;
  new_stress := (fear + anger + disgust) / 3.0;

  new_optimism := GREATEST(0.0, LEAST(1.0, new_optimism));
  new_energy := GREATEST(0.0, LEAST(1.0, new_energy));
  new_stress := GREATEST(0.0, LEAST(1.0, new_stress));

  IF OLD.mood IS NOT NULL THEN
    new_optimism := (OLD.mood->>'optimism')::NUMERIC * 0.7 + new_optimism * 0.3;
    new_energy := (OLD.mood->>'energy_level')::NUMERIC * 0.7 + new_energy * 0.3;
    new_stress := (OLD.mood->>'stress_level')::NUMERIC * 0.7 + new_stress * 0.3;
  END IF;

  NEW.mood := jsonb_build_object('optimism', new_optimism, 'energy_level', new_energy, 'stress_level', new_stress);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_calculate_mood
BEFORE UPDATE OF primary_emotions ON emotional_state
FOR EACH ROW
EXECUTE FUNCTION calculate_mood_from_emotions();

-- Relationship decay helper function
CREATE OR REPLACE FUNCTION check_relationship_decay()
RETURNS TABLE(entity_name TEXT, old_status relationship_status, new_status relationship_status) AS $$
BEGIN
  RETURN QUERY
  WITH changed AS (
    SELECT id, entity_name, status AS old_status
    FROM relationships
    WHERE decay_timer IS NOT NULL AND decay_timer <= NOW()
  )
  UPDATE relationships r
  SET
    status = CASE WHEN r.status = 'strained' THEN 'neutral'::relationship_status ELSE r.status END,
    decay_timer = NULL,
    updated_at = NOW()
  FROM changed c
  WHERE r.id = c.id
  RETURNING r.entity_name, c.old_status, r.status AS new_status;
END;
$$ LANGUAGE plpgsql;

CREATE INDEX IF NOT EXISTS idx_relationships_decay_timer ON relationships(decay_timer) WHERE decay_timer IS NOT NULL;
