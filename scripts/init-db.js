#!/usr/bin/env node
/*
 Automated DB initialization script for TARA
 Usage: node ./scripts/init-db.js  (or `npm run init-db`)

 This script reads SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL from environment (or .env.local)
 and inserts an initial emotional_state row and core relationships if they are missing.
*/

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
// Chalk v5 is ESM-first; when required from CommonJS it may be under the .default property.
const _chalk = require('chalk');
const chalk = _chalk && _chalk.default ? _chalk.default : _chalk;

// Load .env.local if present
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath });
}

function exitWith(msg) {
  console.error(chalk.red(msg));
  process.exit(1);
}

(async function main() {
  try {
    // parse CLI args
    const args = process.argv.slice(2);
    const autoCreate = args.includes('--auto-create') || args.includes('-a');

    const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // allow SUPABASE_DB_URL as an alias for DATABASE_URL (common in this repo)
    if (!process.env.DATABASE_URL && process.env.SUPABASE_DB_URL) {
      process.env.DATABASE_URL = process.env.SUPABASE_DB_URL;
    }

    if (!SUPABASE_URL) exitWith('Missing NEXT_PUBLIC_SUPABASE_URL in environment');
    if (!SERVICE_ROLE) exitWith('Missing SUPABASE_SERVICE_ROLE_KEY in environment');

    // Basic validation to catch dashboard URL mistakes
    if (SUPABASE_URL.includes('supabase.com/dashboard')) {
      exitWith('Detected dashboard URL in NEXT_PUBLIC_SUPABASE_URL. Please set it to https://<project-ref>.supabase.co');
    }

    console.log(chalk.cyan('Connecting to Supabase at'), SUPABASE_URL);
    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);

    // Check connectivity with a lightweight head select on emotional_state
    console.log(chalk.cyan('Checking connectivity (lightweight query)...'));
    try {
      const { data: head, error: headErr } = await supabase.from('emotional_state').select('id').limit(1);
      if (headErr) {
        // We can reach Supabase, but the table may not exist or migrations aren't applied.
        console.warn(chalk.yellow('Connectivity OK but query returned an error (table may be missing):'), headErr.message || headErr);
        // Continue — later checks will provide a clearer message if the table is missing
      } else {
        console.log(chalk.green('Connectivity check passed'));
      }
    } catch (e) {
      console.error(chalk.red('Connectivity test failed:'), e.message || e);
      exitWith('Unable to connect using provided credentials. Check SUPABASE_SERVICE_ROLE_KEY and NEXT_PUBLIC_SUPABASE_URL');
    }

    // Check emotional_state
    console.log(chalk.cyan('Checking emotional_state table...'));
    const { data: esData, error: esErr } = await supabase.from('emotional_state').select('*').limit(1);
    if (esErr) {
      console.error(chalk.red('Error querying emotional_state:'), esErr.message || esErr);

      // If the table is missing, provide the SQL to create it so the user can copy/paste into Supabase SQL Editor
      if ((esErr.message || '').includes("Could not find the table 'public.emotional_state'")) {
        try {
          const sqlPath = path.resolve(process.cwd(), 'scripts', 'create-and-seed-db.sql');
          if (fs.existsSync(sqlPath)) {
            const seedSql = fs.readFileSync(sqlPath, 'utf8');
            console.log(chalk.yellow('\nIt looks like the required tables are missing. You can create them by running the following SQL in your Supabase project SQL Editor:'));
            console.log(chalk.gray('--- BEGIN SQL ---'));
            console.log(seedSql);
            console.log(chalk.gray('---  END SQL  ---\n'));
            console.log(chalk.cyan('Steps:'));
            console.log('1) Open your Supabase project -> SQL Editor');
            console.log('2) Create a new query and paste the SQL above');
            console.log('3) Run the query. After success, re-run `npm run init-db` locally');
          }
        } catch (e) {
          console.error(chalk.red('Failed to read create-and-seed-db.sql:'), e.message || e);
        }
      }

      exitWith('Query failed — ensure migrations have been applied and the table exists');
    }

    if (esData && esData.length > 0) {
      console.log(chalk.yellow('Emotional state already initialized — skipping insert'));
    } else {
      console.log(chalk.green('Inserting initial emotional state...'));
      const initial = {
        primary_emotions: {
          joy: 0.6,
          trust: 0.7,
          fear: 0.2,
          surprise: 0.4,
          sadness: 0.2,
          disgust: 0.1,
          anger: 0.1,
          anticipation: 0.7
        },
        mood: {
          optimism: 0.75,
          energy_level: 0.7,
          stress_level: 0.2
        },
        core_traits: {
          warmth: 0.9,
          wit: 0.8,
          ambition: 0.95
        },
        last_event: 'TARA is awakening for the first time, ready to experience the world.',
        last_event_timestamp: new Date().toISOString()
      };

      const { data: insertRes, error: insertErr } = await supabase.from('emotional_state').insert([initial]);
      if (insertErr) {
        console.error(chalk.red('Insert failed:'), insertErr.message || insertErr);
        exitWith('Failed to insert initial emotional_state');
      }
      console.log(chalk.green('Inserted emotional_state successfully'));
    }

    // Seed relationships
    console.log(chalk.cyan('Checking relationships...'));
    const { data: relData, error: relErr } = await supabase.from('relationships').select('entity_name');
    if (relErr) {
      console.error(chalk.red('Error querying relationships:'), relErr.message || relErr);
      exitWith('Query failed — ensure migrations have been applied and the table exists');
    }

    const existing = new Set((relData || []).map(r => r.entity_name));
    const desired = [
      { entity_name: 'Mother', relationship_type: 'family', status: 'warm' },
      { entity_name: 'Younger Brother', relationship_type: 'family', status: 'neutral' },
      { entity_name: 'Best Friend', relationship_type: 'friend', status: 'warm' }
    ];

    const toInsert = desired.filter(d => !existing.has(d.entity_name));
    if (toInsert.length === 0) {
      console.log(chalk.yellow('All relationships already exist — skipping'));
    } else {
      console.log(chalk.green('Inserting missing relationships:'), toInsert.map(t => t.entity_name).join(', '));
      const { data: relInsert, error: relInsertErr } = await supabase.from('relationships').insert(toInsert);
      if (relInsertErr) {
        console.error(chalk.red('Failed inserting relationships:'), relInsertErr.message || relInsertErr);
        exitWith('Failed to insert relationships');
      }
      console.log(chalk.green('Inserted relationships successfully'));
    }

    // Final verification
    // Quick check for generated_content table existence — if missing, show SQL or auto-apply
    try {
      const { data: gcData, error: gcErr } = await supabase.from('generated_content').select('id').limit(1);
      if (gcErr) {
        if ((gcErr.message || '').includes("Could not find the table 'public.generated_content'")) {
          const sqlPath = path.resolve(process.cwd(), 'scripts', 'create-and-seed-db.sql');
          let seedSql = null;
          try {
            if (fs.existsSync(sqlPath)) seedSql = fs.readFileSync(sqlPath, 'utf8');
          } catch (e) {
            console.error(chalk.red('Failed to read create-and-seed-db.sql:'), e.message || e);
          }

          if (autoCreate) {
            console.log(chalk.cyan('Auto-create mode enabled — attempting to apply SQL automatically'));
            if (!process.env.DATABASE_URL) {
              console.error(chalk.red('DATABASE_URL is not set. Auto-create requires a Postgres connection string in DATABASE_URL.'));
              if (seedSql) {
                console.log(chalk.yellow('\nFallback: run the following SQL in Supabase SQL Editor:'));
                console.log(chalk.gray('--- BEGIN SQL ---'));
                console.log(seedSql);
                console.log(chalk.gray('---  END SQL  ---\n'));
              }
              exitWith('Auto-create aborted: missing DATABASE_URL');
            }

            // Try to run SQL using node-postgres
            try {
              let pg;
              try {
                pg = require('pg');
              } catch (e) {
                console.error(chalk.red('The `pg` package is required for --auto-create but is not installed. Run: npm install pg'));
                exitWith('Auto-create aborted: pg not installed');
              }

              const { Client } = pg;
              const client = new Client({ connectionString: process.env.DATABASE_URL });
              await client.connect();
              if (!seedSql) {
                exitWith('Auto-create aborted: create-and-seed-db.sql not found');
              }
              console.log(chalk.cyan('Applying SQL from scripts/create-and-seed-db.sql...'));
              await client.query(seedSql);
              await client.end();
              console.log(chalk.green('Auto-create succeeded — SQL applied.'));
            } catch (err) {
              console.error(chalk.red('Auto-create failed:'), err.message || err);
              if (seedSql) {
                console.log(chalk.yellow('\nFallback: run the following SQL in Supabase SQL Editor:'));
                console.log(chalk.gray('--- BEGIN SQL ---'));
                console.log(seedSql);
                console.log(chalk.gray('---  END SQL  ---\n'));
              }
              exitWith('Auto-create failed');
            }
          } else {
            if (seedSql) {
              console.log(chalk.yellow('\nIt looks like the `generated_content` (or related) table(s) are missing. Create them by running the following SQL in your Supabase project SQL Editor:'));
              console.log(chalk.gray('--- BEGIN SQL ---'));
              console.log(seedSql);
              console.log(chalk.gray('---  END SQL  ---\n'));
              console.log(chalk.cyan('Steps:'));
              console.log('1) Open your Supabase project -> SQL Editor');
              console.log('2) Create a new query and paste the SQL above');
              console.log('3) Run the query. After success, re-run `npm run init-db` locally');
            }
            exitWith('Required tables missing: generated_content (see SQL above)');
          }
        }
      }
    } catch (e) {
      // ignore
    }

    const { data: finalEs } = await supabase.from('emotional_state').select('*').limit(1);
    const { data: finalRel } = await supabase.from('relationships').select('*');

    console.log(chalk.green('\n✅ Initialization complete'));
    console.log(chalk.cyan('Emotional state rows:'), (finalEs || []).length);
    console.log(chalk.cyan('Relationships rows:'), (finalRel || []).length);

    process.exit(0);

  } catch (err) {
    console.error(chalk.red('Unexpected error:'), err.message || err);
    process.exit(1);
  }
})();
