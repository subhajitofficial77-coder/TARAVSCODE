-- Enable RLS for tables (Phase 1 permissive policies)
ALTER TABLE emotional_state ENABLE ROW LEVEL SECURITY;
ALTER TABLE relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE generated_content ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history ENABLE ROW LEVEL SECURITY;

-- emotional_state policies
CREATE POLICY "emotional_state_select_authenticated" ON emotional_state FOR SELECT USING (true);
CREATE POLICY "emotional_state_update_service_role" ON emotional_state FOR UPDATE USING (current_setting('is_superuser', true) IS NOT NULL OR true) WITH CHECK (true);

-- relationships policies
CREATE POLICY "relationships_select_authenticated" ON relationships FOR SELECT USING (true);
CREATE POLICY "relationships_insert_service_role" ON relationships FOR INSERT USING (false);
CREATE POLICY "relationships_update_service_role" ON relationships FOR UPDATE USING (false);

-- generated_content policies
CREATE POLICY "generated_content_select" ON generated_content FOR SELECT USING (true);
CREATE POLICY "generated_content_insert_authenticated" ON generated_content FOR INSERT USING (true);
CREATE POLICY "generated_content_update_authenticated" ON generated_content FOR UPDATE USING (true);

-- chat_history policies
CREATE POLICY "chat_history_select" ON chat_history FOR SELECT USING (true);
CREATE POLICY "chat_history_insert_authenticated" ON chat_history FOR INSERT USING (true);

-- Temporary anon access for Phase 1 (remove in production)
-- NOTE: This is permissive and should be tightened before production
GRANT SELECT ON ALL TABLES IN SCHEMA public TO anon;
