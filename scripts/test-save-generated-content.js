#!/usr/bin/env node
const dotenv = require('dotenv');
const fs = require('fs');
// prefer .env.local if present (matches Next.js behavior)
if (fs.existsSync('.env.local')) dotenv.config({ path: '.env.local' });
else dotenv.config();
const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in environment');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

(async () => {
  try {
    const payload = {
      content_type: 'caption',
      content_data: { text: 'Test insert - please delete' },
      emotional_context: { primary_emotions: { joy: 0.5 } },
      provider: 'manual-test',
      platform: 'test-runner',
      metadata: { test: true },
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase.from('generated_content').insert(payload).select().limit(1).single();
    if (error) {
      console.error('Insert error', error);
      process.exit(1);
    }
    console.log('Inserted row:', data);
    process.exit(0);
  } catch (err) {
    console.error('Exception', err);
    process.exit(1);
  }
})();
