-- Add feedback_received_at timestamp to generated_content
ALTER TABLE generated_content
  ADD COLUMN IF NOT EXISTS feedback_received_at TIMESTAMPTZ;
