/*
  # Add simulation_proposals table

  1. New Tables
    - `simulation_proposals`
      - `id` (uuid, primary key)
      - `description` (text) - Description of the proposed simulation
      - `emotional_impact` (jsonb) - Expected emotional impact
      - `mood_impact` (jsonb) - Expected mood impact
      - `created_at` (timestamptz) - When the proposal was created
      - `accepted` (boolean) - Whether the proposal was accepted

  2. Security
    - Enable RLS on `simulation_proposals` table
    - Add policy for authenticated access
*/

CREATE TABLE IF NOT EXISTS simulation_proposals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  description TEXT NOT NULL,
  emotional_impact JSONB,
  mood_impact JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  accepted BOOLEAN DEFAULT FALSE
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_simulation_proposals_created_at ON simulation_proposals(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_simulation_proposals_accepted ON simulation_proposals(accepted);

-- Enable RLS
ALTER TABLE simulation_proposals ENABLE ROW LEVEL SECURITY;

-- Create policy for authenticated users to read proposals
CREATE POLICY "Allow authenticated users to read simulation proposals"
  ON simulation_proposals
  FOR SELECT
  TO authenticated
  USING (true);

-- Create policy for authenticated users to insert proposals
CREATE POLICY "Allow authenticated users to create simulation proposals"
  ON simulation_proposals
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Create policy for authenticated users to update proposals
CREATE POLICY "Allow authenticated users to update simulation proposals"
  ON simulation_proposals
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Comments
COMMENT ON TABLE simulation_proposals IS 'Stores proposed life event simulations for TARA';
COMMENT ON COLUMN simulation_proposals.description IS 'Description of the proposed simulation event';
COMMENT ON COLUMN simulation_proposals.emotional_impact IS 'Expected emotional impact on TARA';
COMMENT ON COLUMN simulation_proposals.mood_impact IS 'Expected mood impact on TARA';
COMMENT ON COLUMN simulation_proposals.accepted IS 'Whether the proposal was accepted and executed';
