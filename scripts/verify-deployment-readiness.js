#!/usr/bin/env node
const fs = require('fs');

console.log('\n🔍 TARA Deployment Readiness Check\n');
console.log('='.repeat(50) + '\n');

function check(name, test) {
  try {
    const result = test();
    if (result === true || result) {
      console.log(`✅ ${name}`);
      return true;
    } else {
      console.log(`❌ ${name}: Failed`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${name}: ${error.message}`);
    return false;
  }
}

let passed = 0;
let failed = 0;

function runCheck(name, fn) {
  const ok = check(name, fn);
  if (ok) passed++; else failed++;
}

runCheck('.env.local file exists', () => fs.existsSync('.env.local'));

if (fs.existsSync('.env.local')) {
  const env = fs.readFileSync('.env.local', 'utf8');
  runCheck('NEXT_PUBLIC_SUPABASE_URL is set', () => env.includes('NEXT_PUBLIC_SUPABASE_URL=https://'));
  runCheck('SUPABASE_SERVICE_ROLE_KEY is set', () => env.includes('SUPABASE_SERVICE_ROLE_KEY=') && !env.includes('your_service_role_key_here'));
  runCheck('OPENROUTER_API_KEY is set', () => env.includes('OPENROUTER_API_KEY=') && !env.includes('<YOUR_OPENROUTER_KEY_HERE>'));
  runCheck('GOOGLE_AI_KEY is set', () => env.includes('GOOGLE_AI_KEY=AIza'));
}

const criticalFiles = [
  'app/api/chat/route.ts',
  'app/api/generate-content/route.ts',
  'app/api/feedback/route.ts',
  'supabase/functions/daily-awakening/index.ts',
  'supabase/migrations/20240101000000_initial_schema.sql',
  'lib/prompts/genesis-v7.ts',
  'lib/tale-engine.ts',
  'public/fonts/Inter_Bold.json',
];

for (const f of criticalFiles) {
  runCheck(`File exists: ${f}`, () => fs.existsSync(f));
}

// Check critical bug fix
runCheck('CRITICAL BUG FIX: await in daily-awakening', () => {
  const content = fs.readFileSync('supabase/functions/daily-awakening/index.ts', 'utf8');
  return content.includes('const result = await runDailySimulation');
});

runCheck('node_modules exists', () => fs.existsSync('node_modules'));
runCheck('next.config.js exists', () => fs.existsSync('next.config.js'));
runCheck('tailwind.config.ts exists', () => fs.existsSync('tailwind.config.ts'));

console.log('\n' + '='.repeat(50));
console.log(`\n📊 Results: ${passed} passed, ${failed} failed\n`);

if (failed > 0) {
  console.log('❌ Deployment readiness: FAILED\n');
  process.exit(1);
} else {
  console.log("✅ Deployment readiness: PASSED\n");
  process.exit(0);
}
