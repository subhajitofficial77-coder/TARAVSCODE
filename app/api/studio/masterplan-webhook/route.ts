import { NextResponse } from 'next/server';
import { createServiceRoleClient } from '@/lib/supabase/server';
import { clearContextCache } from '@/lib/studio/contextCache';

function normalizeValue(v: any) {
  if (typeof v === 'number') return v > 1 ? Math.min(1, v / 10) : v;
  return v;
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const plan = Array.isArray(payload) ? payload[0] : payload;
    if (!plan || !plan.date || !plan.theme) {
      return NextResponse.json({ success: false, error: 'invalid payload' }, { status: 400 });
    }

    const supabase = createServiceRoleClient();

    // create master plan id
    const mpId = (globalThis as any).crypto?.randomUUID?.() ?? `mp_${Date.now()}`;

    const emotional_snapshot = plan.emotional_snapshot || plan.emotional_context || {};
    // normalize numbers in emotional snapshot
    if (emotional_snapshot?.primary_emotions) {
      for (const k of Object.keys(emotional_snapshot.primary_emotions)) {
        emotional_snapshot.primary_emotions[k] = normalizeValue(emotional_snapshot.primary_emotions[k]);
      }
    }
    if (emotional_snapshot?.mood) {
      for (const k of Object.keys(emotional_snapshot.mood)) {
        emotional_snapshot.mood[k] = normalizeValue(emotional_snapshot.mood[k]);
      }
    }

    const masterPlanRow: any = {
      id: mpId,
      date: plan.date,
      theme: plan.theme,
      narrative: plan.narrative || null,
      mood_summary: plan.mood_summary || null,
      emotional_context: emotional_snapshot,
      quota: plan.quota || {},
      created_at: new Date().toISOString()
    };

    const seeds = (plan.inspiration_seeds || []).map((s: any, idx: number) => ({
      id: (globalThis as any).crypto?.randomUUID?.() ?? `seed_${Date.now()}_${idx}`,
      master_plan_id: mpId,
      type: s.type,
      label: s.label,
      topic: s.topic,
      priority: s.priority ?? 3,
      emotional_context: s.emotional_context || {},
      created_at: new Date().toISOString()
    }));

  // Try insert; if table is missing, attempt to create tables then retry
  let mpData: any = null;
  let usedExecSql = false;
    try {
      const res = await supabase.from('master_plans').insert(masterPlanRow).select().limit(1).single();
      mpData = res.data;
      if (res.error) throw res.error;
    } catch (err: any) {
      const msg = err?.message || String(err || '');
      // Detect missing table in PostgREST schema cache
      if (msg.includes("Could not find the table") || msg.includes('public.master_plans')) {
        try {
          // Create master_plans and inspiration_seeds tables using exec_sql RPC (same as auto-seed)
          await supabase.rpc('exec_sql', { sql: `
            CREATE TABLE IF NOT EXISTS master_plans (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              date date NOT NULL,
              theme text,
              narrative text NOT NULL,
              mood_summary text,
              quota jsonb DEFAULT '{}',
              created_at timestamptz DEFAULT now(),
              updated_at timestamptz DEFAULT now()
            );
          ` } as any);

          await supabase.rpc('exec_sql', { sql: `
            CREATE TABLE IF NOT EXISTS inspiration_seeds (
              id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
              master_plan_id uuid REFERENCES master_plans(id) ON DELETE CASCADE,
              type text NOT NULL,
              label text NOT NULL,
              topic text,
              priority integer DEFAULT 1,
              emotional_context jsonb DEFAULT '{}',
              created_at timestamptz DEFAULT now()
            );
          ` } as any);

          // If PostgREST still doesn't see the table, use exec_sql to insert rows directly to avoid schema cache problems
          const mpQuota = JSON.stringify(masterPlanRow.quota || {});
          const mpNarrative = masterPlanRow.narrative ? masterPlanRow.narrative.replace(/'/g, "''") : '';
          const mpMood = masterPlanRow.mood_summary ? masterPlanRow.mood_summary.replace(/'/g, "''") : '';
          const sqlParts: string[] = [];
          sqlParts.push(`INSERT INTO master_plans (id, date, theme, narrative, mood_summary, quota, created_at) VALUES ('${mpId}', '${masterPlanRow.date}', '${masterPlanRow.theme.replace(/'/g, "''")}', '${mpNarrative}', '${mpMood}', '${mpQuota}'::jsonb, now());`);

          for (const s of seeds) {
            const seedEmo = JSON.stringify(s.emotional_context || {});
            sqlParts.push(`INSERT INTO inspiration_seeds (id, master_plan_id, type, label, topic, priority, emotional_context, created_at) VALUES ('${s.id}', '${mpId}', '${(s.type||'').replace(/'/g, "''")}', '${(s.label||'').replace(/'/g, "''")}', '${(s.topic||'').replace(/'/g, "''")}', ${s.priority || 1}, '${seedEmo}'::jsonb, now());`);
          }

          const finalSql = sqlParts.join('\n');
          const execRes = await supabase.rpc('exec_sql', { sql: finalSql } as any);
          // rpc returns no error via client lib; assume success if no thrown error
          mpData = mpId; // placeholder
          usedExecSql = true;
        } catch (createErr: any) {
          console.error('Error creating master_plans tables or inserting via exec_sql', createErr);
          return NextResponse.json({ success: false, error: createErr?.message || String(createErr) }, { status: 500 });
        }
      } else {
        console.error('masterplan insert error', err);
        return NextResponse.json({ success: false, error: msg }, { status: 500 });
      }
    }


    if (!usedExecSql && seeds.length > 0) {
      const { error: seedError } = await supabase.from('inspiration_seeds').insert(seeds as any);
      if (seedError) {
        console.error('seed insert error', seedError);
        return NextResponse.json({ success: false, error: seedError.message || seedError }, { status: 500 });
      }
    }

    // Clear cached studio context so narrative updates propagate to readers
    try { clearContextCache(); } catch { /* ignore */ }

    return NextResponse.json({ success: true, master_plan_id: mpId, inserted_seeds: seeds.length });
  } catch (err: any) {
    console.error('masterplan-webhook error', err);
    return NextResponse.json({ success: false, error: err?.message || String(err) }, { status: 500 });
  }
}
