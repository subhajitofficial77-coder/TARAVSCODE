-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Content Memory Table
CREATE TABLE IF NOT EXISTS content_memories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    original_content JSONB,
    analysis_result JSONB,
    generated_content JSONB,
    emotional_state JSONB,
    weather_context JSONB,
    user_feedback TEXT CHECK (user_feedback IN ('accepted', 'rejected', 'declined')),
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Analysis Table
CREATE TABLE IF NOT EXISTS social_media_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    platform TEXT NOT NULL,
    content_url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    analysis_data JSONB,
    sentiment_scores JSONB,
    visual_elements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Prompts Table
CREATE TABLE IF NOT EXISTS generated_prompts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    content_memory_id UUID REFERENCES content_memories(id) ON DELETE CASCADE,
    prompt_type TEXT NOT NULL,
    prompt_content TEXT NOT NULL,
    emotional_context JSONB,
    creation_parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_content_memories_platform ON content_memories(platform);
CREATE INDEX IF NOT EXISTS idx_content_memories_content_type ON content_memories(content_type);
CREATE INDEX IF NOT EXISTS idx_content_memories_created_at ON content_memories(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_content_memories_user_feedback ON content_memories(user_feedback);
CREATE INDEX IF NOT EXISTS idx_social_media_analysis_platform ON social_media_analysis(platform);
CREATE INDEX IF NOT EXISTS idx_social_media_analysis_created_at ON social_media_analysis(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_generated_prompts_memory_id ON generated_prompts(content_memory_id);

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for content_memories
CREATE TRIGGER trg_content_memories_updated_at 
    BEFORE UPDATE ON content_memories 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Comments
COMMENT ON TABLE content_memories IS 'Stores analyzed social media content and generated variations with full context';
COMMENT ON TABLE social_media_analysis IS 'Stores analysis results from social media content';
COMMENT ON TABLE generated_prompts IS 'Stores AI-generated image prompts linked to content memories';
COMMENT ON COLUMN content_memories.content_type IS 'Type of content (carousel, story, post, reel, etc.)';
COMMENT ON COLUMN content_memories.platform IS 'Social media platform (instagram, facebook, twitter, etc.)';
COMMENT ON COLUMN content_memories.emotional_state IS 'TARA''s emotional state at time of memory creation';
COMMENT ON COLUMN content_memories.weather_context IS 'Weather conditions at time of memory creation';
COMMENT ON COLUMN social_media_analysis.platform IS 'Source platform of the analyzed content';
COMMENT ON COLUMN social_media_analysis.content_url IS 'Original URL of the analyzed content';
COMMENT ON COLUMN generated_prompts.prompt_type IS 'Type of prompt (nano_banana, stable_diffusion, etc.)';