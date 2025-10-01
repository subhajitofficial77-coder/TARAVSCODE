#!/usr/bin/env node

// Test all external API connections
const fetch = globalThis.fetch || require('node-fetch');
require('dotenv').config({ path: '.env.local' });

async function run() {
  const tests = [
    {
      name: 'Supabase Connection',
      test: async () => {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
        const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
        if (!url || !key) throw new Error('Supabase credentials missing');

        const res = await fetch(`${url}/rest/v1/emotional_state?select=id&limit=1`, {
          headers: { apikey: key, Authorization: `Bearer ${key}` }
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return 'Connected ✓';
      }
    },
    {
      name: 'OpenRouter API Key',
      test: async () => {
        const key = process.env.OPENROUTER_API_KEY;
        if (!key) throw new Error('OpenRouter API key missing - REQUIRED for chat!');
        if (!key.startsWith('sk-or-')) throw new Error('Invalid OpenRouter key format');
        return 'Key format valid ✓';
      }
    },
    {
      name: 'Google AI API Key',
      test: async () => {
        const key = process.env.GOOGLE_AI_KEY;
        if (!key) throw new Error('Google AI key missing');
        if (!key.startsWith('AIza')) throw new Error('Invalid Google AI key format');
        return 'Key format valid ✓';
      }
    },
    {
      name: 'Weather API',
      test: async () => {
        const key = process.env.WEATHER_API_KEY;
        const endpoint = process.env.WEATHER_API_ENDPOINT;
        if (!key || !endpoint) throw new Error('Weather API credentials missing');

        const response = await fetch(`${endpoint}/current.json?key=${key}&q=Indore&aqi=no`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        return `Weather in ${data.location.name}: ${data.current.temp_c}°C ✓`;
      }
    }
  ];

  console.log('\n🧪 Testing API Connections...\n');
  let passed = 0;
  let failed = 0;
  for (const { name, test } of tests) {
    try {
      const result = await test();
      console.log(`✅ ${name}: ${result}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}: ${error.message}`);
      failed++;
    }
  }

  console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);
  if (failed > 0) {
    console.log('⚠️  Fix the failed tests before deploying.\n');
    process.exit(1);
  } else {
    console.log('🎉 All API connections validated! Ready to deploy.\n');
    process.exit(0);
  }
}

run();
