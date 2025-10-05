JULES ONBOARDING — TARAVSCODE

Last updated: 2025-10-05

Purpose
-------
This document is a complete, detailed onboarding and reference guide for Jules (or any engineer) to understand, run, and extend the TARAVSCODE project. It explains architecture, core flows, data models, key files, runtime behavior, integrations (Supabase, n8n, Google Generative API), and step-by-step debugging and setup instructions.

Reading this file
-----------------
- Start with the Overview and Architecture sections to get the big picture.
- Read the Core runtime flows for a line-by-line description of how the system behaves at runtime.
- Use the File Map to find important files. Each file mentioned includes a purpose and what to look for.
- Follow the Debugging & Common Issues section when you see errors in the logs (e.g., PGRST205, hydration errors).
- The final section contains specific first tasks you can perform to verify and continue development.

Table of contents
-----------------
1. Overview & goals
2. Architectural components
3. Runtime flows (simulate, studio, master-plan generation)
4. Data model and Supabase integration
5. API routes (detailed)
6. In-memory cache behavior
7. UI and Client-side flows (dashboard, creative studio)
8. Integrations: n8n, Google Generative API
9. Dev setup and environment variables
10. Troubleshooting & common errors
11. First verification tasks
12. Next suggested improvements and tests

1) Overview & goals
--------------------
TARAVSCODE is a Next.js application combining a "sentient" simulation engine (TARA) with a creative studio/dashboard for producing daily creative plans and content. The server runs simulations of life events that mutate an in-memory and persisted "emotional_state". From the simulated state, the server generates content proposals, stores them to a proposals table, and posts a prompt+context to an n8n webhook for deeper master-plan generation.

High-level intentions:
- Maintain a single emotional_state that represents the agent's internal affective state.
- Run short daily simulations that produce a life event and updated emotional state.
- Derive a short "today's mood" and "today's narrative" using internal logic and optionally the Google Generative API.
- Expose endpoints for the dashboard and n8n to fetch the derived narrative and context.
- Provide an in-memory process cache so narrative changes are immediately visible to internal consumers (UI and n8n), even if the DB is temporarily unavailable or schema-mismatched.

2) Architectural components
---------------------------
- Next.js (App Router) — UI + API Routes under `app/`.
- Supabase — Postgres + PostgREST for persistence, service role client for server-side writes.
- In-process cache (`lib/studio/contextCache.ts`) — a simple process-level object holding recent context and narrative.
- Simulation engine (`lib/tale-engine.ts`) — deterministic-ish simulation logic for life events, emotion updates and mood calculation.
- Plan generator (`lib/simulation/planGenerator.ts`) — generates content candidates from context.
- n8n integration (`lib/n8n/*.ts`) — helper functions and expected webhook interactions for master-plan generation and content pipelines.
- Google Generative API integration (`lib/api/google-ai.ts` and usage in simulate route) — optionally call Gemini/Flash to derive mood JSON.
- UI components — dashboard and creative studio components that read from server endpoints and present proposals.

3) Runtime flows — end-to-end
-----------------------------
This is the important path: simulate → propose → persist → webhook → n8n → master plan

3.1 POST /api/simulate-life-event (server)
- Entry: the server receives a POST (can be triggered manually during development or via a scheduled job).
- Steps performed:
  1. Create a Supabase service-role client (admin privileges) using `createServiceRoleClient()` in `lib/supabase/server.ts`.
  2. Read the current emotional state and relationships via `getEmotionalStateWithRelationships()`.
  3. Call `runDailySimulation()` in `lib/tale-engine.ts` to select a LifeEvent and apply its emotional impacts:
     - apply decay, apply event impacts via `applyEmotionalImpact` and `processLifeEvent` logic,
     - produce `newState`, `event`, `relationshipUpdates`, `timestamp`, `summary`.
  4. Optionally call Google Generative API (if `GOOGLE_AI_ENDPOINT` and `GOOGLE_AI_KEY` are configured) with a compact context to derive a JSON mood object. The route tries multiple payload shapes and robust parsing.
     - If parsed JSON is found, merged into `result.newState` (mood_label, optimism, energy_level, stress_level, primary_emotions).
     - Cache updated (in-memory) with `todaysNarrative` and `emotional_state` for immediate visibility.
  5. Generate candidates from the updated state using `lib/simulation/planGenerator.ts` (small algorithmic extractor uses narrative keywords and mood energy to choose content types).
  6. Persist candidates to `simulation_proposals` table for UI preview. If insertion fails due to missing table, code attempts `exec_sql` RPC to create it and retries.
  7. Build a prompt using the context and post it to `N8N_WEBHOOK_URL` (configured). The webhook is expected to run a workflow that returns a master plan. The server logs the webhook response (and continues).
  8. Clear the in-memory cache (or reset it) so subsequent reads see fresh data (some routes prefer cache if present before DB is updated).
  9. Return a JSON response with ok:true and event/timestamp.

3.2 GET /api/studio/todays-narrative
- Purpose: provide a secure endpoint for n8n to fetch the latest narrative. The endpoint accepts an internal token (header X-Internal-Token or ?token= for dev). It prefers the in-memory cached narrative (set by `simulate-life-event`), then falls back to `emotional_state.last_event`, `master_plans` narrative for today, `simulation_proposals` latest event, and finally returns a 200 fallback with "No narrative available yet." rather than 404.

3.3 GET /api/studio/refresh-context (and tara-context)
- These endpoints return a larger studio context object (emotional_state, master_plan, relationships, weather, tale_event). They use the service-role supabase client and will attempt an auto-seed when tables are missing using `exec_sql`.
- The UI `TaraStudioProvider` fetches `/api/studio/refresh-context` and polls it every 10s to reflect changes quickly.

4) Data model and Supabase integration
-------------------------------------
Key tables (the app expects these):
- emotional_state (single primary row representing the agent)
  - id, user_id?, primary_emotions (jsonb), mood (jsonb), last_event, last_event_timestamp, created_at, updated_at
- relationships (entity_name, status, decay_timer, last_interaction, etc.)
- master_plans (id, date, narrative, mood_summary, quota, created_at)
- daily_plans (per-day items created from proposals)
- simulation_proposals (temporary proposals generated by simulation)
- generated_content, content_feedback, chat_history (other features)

The code uses two Supabase clients:
- Browser client: `lib/supabase/client.ts` (wrapped to be HMR-safe and export `createBrowserClient`)
- Service role client (server-side admin): `lib/supabase/server.ts` (createServiceRoleClient)

Important notes about the current state:
- Some tables/columns may be missing on new installs; code includes auto-seed attempts via a Postgres function `exec_sql` to create minimal tables, but manual SQL in the Supabase dashboard is often more reliable.
- When PostgREST schema cache is stale or tables are missing, PostgREST returns PGRST205 errors ("Could not find the table ... in the schema cache"). See Troubleshooting below.

5) API routes (detailed)
------------------------
This section lists the important API routes and what they do. These are located under `app/api/.../route.ts`.

- POST /api/simulate-life-event — run simulation (see 3.1 above). Key side effects: updates in-memory cache, inserts into `simulation_proposals`, posts to n8n webhook.
- GET /api/studio/todays-narrative — secure narrative endpoint meant for n8n or internal consumers; prefers cache and falls back to DB sources; returns 200 fallback if no narrative.
- GET /api/studio/tara-context — internal context endpoint (protected by internal token) returning context used by n8n and the UI; recently updated to accept ?token= for dev.
- POST /api/studio/persist-narrative — accept narrative from the UI and persist into `simulation_proposals` and the in-memory cache.
- POST /api/studio/masterplan-webhook — internal hook that receives master plans, persists them into `master_plans` and clears caches.
- GET /api/simulation/proposal — returns latest simulation proposal (this route contains defensive create-table logic if the proposals table is missing).
- Many debug/test endpoints: /api/debug/* and /api/studio/auto-seed for initialization.

6) In-memory cache behavior (`lib/studio/contextCache.ts`)
--------------------------------------------------------
This is a tiny, important module. It holds transient data to make changes immediately visible. It exports:
- getContextCache() — returns cached data or null
- setContextCache(data) — sets cached data with timestamp
- clearContextCache() — clears cache
- cacheAgeMs() — returns age in ms

Usage patterns:
- `simulate-life-event` sets the cache with { todaysNarrative: { narrative, timestamp }, emotional_state } after deriving mood or narrative.
- `todays-narrative` prefers cached narrative if present.
- `getStudioContext` (server-side helper) prefers cached `emotional_state` so the UI quickly reflects changes after simulate.
- After posting to n8n or after master-plan insertion, the cache is cleared to allow DB canonical values to surface.

Why this cache exists
- During development and when DB schema mismatches exist, DB calls can fail. The in-process cache ensures the UI and internal webhooks see fresh narrative/mood immediately even if persistence fails temporarily.

Memory/Scope
- The cache is process-local (not shared across instances). This is adequate for local development and single-node deploys but not for horizontally scaled production unless replaced with a shared cache (Redis).

7) UI and Client-side flows (dashboard & creative studio)
---------------------------------------------------------
Key UI pieces:
- `lib/contexts/TaraStudioContext.tsx`: React context provider used by pages/components. It calls `/api/studio/refresh-context` and polls every 10s.
- Dashboard components (under `components/dashboard/*`) use the context and make client-side calls for actions (accept mood, accept content, fetch proposals).
- Mood/Proposal Acceptance: The UI reads `/api/simulation/proposal` and allows users to accept the suggested mood or accept content proposals; accepted items write to `emotional_state` or `daily_plans`.
- Creative Studio: The creative studio pages/components allow generating content, refining seeds, and pushing content to n8n workflows.

Hydration notes
- When server-side rendering returns different data than the client (often because server-side DB calls failed while the client fetch after mount succeeds), React hydration errors occur. Solving these requires ensuring the server returns stable data (i.e., fix DB schema issues) or mark components as client-only if they must differ.

8) Integrations
----------------
8.1 n8n
- The app posts prompt+context to `N8N_WEBHOOK_URL` in `simulate-life-event` and calls helper functions in `lib/n8n/workflows.ts` for specific actions.
- n8n workflows are expected to receive prompt/context and return a master plan JSON object. In test mode, workflows require "Execute workflow" to be clicked to register the test webhook.

8.2 Google Generative API
- The simulate route includes a call to the `GOOGLE_AI_ENDPOINT` using `GOOGLE_AI_KEY`.
- The code defensively tries multiple payload shapes: `instances: [{input: ...}]` and `prompt: { text: '...' }` because different Google endpoints expect different shapes.
- The route parses text responses to extract the first JSON object. If parsed, values like `mood_label`, `optimism`, `energy_level`, `stress_level`, `primary_emotions` are merged into `result.newState`.
- Important: The Google key type matters. If `GOOGLE_AI_KEY` looks like an API key (starts with "AIza"), the code appends it as a `?key=` query param; otherwise it uses Bearer Authorization.

8.3 Weather API
- Weather data is fetched via `lib/api/weather.ts` and used to enrich prompts and plan generation.

9) Dev setup and environment variables
--------------------------------------
Essential env vars (in `.env.local` or repository secrets):
- NEXT_PUBLIC_SUPABASE_URL — Supabase project URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY — Supabase anon key (browser)
- SUPABASE_SERVICE_ROLE_KEY — Supabase service role key (server) — keep secret
- INTERNAL_API_TOKEN — Simple internal token for protected internal endpoints
- N8N_WEBHOOK_URL — The base URL of your n8n webhook (ngrok or hosted)
- GOOGLE_AI_ENDPOINT — Optional Google Generative endpoint
- GOOGLE_AI_KEY — Optional key for Google Generative API
- NEXT_PUBLIC_APP_URL — e.g., http://localhost:3000
- TARA_LOCATION — location string used in prompts
- TARA_TIMEZONE — timezone string used in date formatting

Run the app locally:
- npm install (or pnpm)
- npm run dev (runs Next.js dev server on 3000)

Supabase notes
- Create the DB tables the app expects (see SQL in Troubleshooting). The app tries to auto-seed, but often manual SQL is faster and more reliable.

10) Troubleshooting & common errors
-----------------------------------
A. PostgREST PGRST205 "Could not find the table 'public.X' in the schema cache"
- Cause: table does not exist in the Postgres DB (or PostgREST schema cache not updated after table creation).
- Fix: Run the SQL to create the table in Supabase SQL editor. Then wait a few seconds or click "Refresh" in Supabase UI. Example SQL for key tables is listed at the end of this doc.

B. Hydration failed / Expected server HTML to contain matching
- Cause: SSR produced different DOM because server-side data retrieval failed or returned different data than client fetch.
- Fix: Fix DB/schema issues so server can return canonical data. If data is inherently client-only, move the component to client-side only ("use client") or wrap in Suspense + fallback.

C. Google Generative API errors
- 401 UNAUTHENTICATED: The code used Authorization when the endpoint expects `?key=` or a different auth method.
- 400 INVALID_ARGUMENT: The payload shape doesn't match the endpoint's expected fields.
- Fix: Confirm which Google endpoint you're calling and what shape it expects. Update `simulate-life-event` to use the exact request shape and auth. The code currently tries both `instances` and `prompt` shapes.

D. n8n webhook 404 "webhook not registered"
- Cause: In n8n test mode the webhook is only registered after clicking 'Execute workflow'. The path called by the server did not match an active webhook.
- Fix: Activate the workflow in n8n (Execute workflow) or ensure the webhook node is in an always-on workflow.

11) First verification tasks (quick wins for Jules)
---------------------------------------------------
1) Confirm environment variables: ensure `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` and `INTERNAL_API_TOKEN` are set.
2) Run the SQL in Supabase (SQL editor) to create `emotional_state`, `relationships`, `daily_plans`, `master_plans`, and `simulation_proposals` tables (SQL snippet provided below).
3) Start Next dev server and check logs for errors. Visit `http://localhost:3000/dashboard`.
4) In a separate PowerShell run the simulate endpoint to exercise the full flow:

```powershell
$body = @{ action = 'simulate'; note = 'jules smoke test' } | ConvertTo-Json
Invoke-RestMethod -Method Post -Uri 'http://localhost:3000/api/simulate-life-event' -Body $body -ContentType 'application/json'
Get-Content .dev_server.out.log -Tail 200
```

5) Check `GET /api/studio/todays-narrative?token=<INTERNAL_API_TOKEN>` and `GET /api/simulation/proposal` to confirm proposals are present.

12) SQL to create key tables (copy-paste into Supabase SQL editor)
----------------------------------------------------------------
Run these statements in Supabase to ensure the app's expected tables exist. Adjust types if your project expects different columns.

```sql
-- emotional_state
CREATE TABLE IF NOT EXISTS public.emotional_state (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  primary_emotions jsonb DEFAULT '{}'::jsonb,
  mood jsonb DEFAULT '{}'::jsonb,
  last_event text,
  last_event_timestamp timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- relationships
CREATE TABLE IF NOT EXISTS public.relationships (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_name text UNIQUE,
  status text,
  decay_timer timestamptz,
  last_interaction timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- daily_plans
CREATE TABLE IF NOT EXISTS public.daily_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  notes text,
  topic text,
  priority integer DEFAULT 0,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- master_plans
CREATE TABLE IF NOT EXISTS public.master_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL,
  theme text,
  narrative text,
  mood_summary text,
  quota jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- inspiration_seeds
CREATE TABLE IF NOT EXISTS public.inspiration_seeds (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  master_plan_id uuid REFERENCES public.master_plans(id) ON DELETE CASCADE,
  type text NOT NULL,
  label text NOT NULL,
  topic text,
  priority integer DEFAULT 1,
  emotional_context jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now()
);

-- simulation_proposals
CREATE TABLE IF NOT EXISTS public.simulation_proposals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text,
  narrative text,
  candidates jsonb DEFAULT '{}'::jsonb,
  payload jsonb DEFAULT '{}'::jsonb,
  event text,
  rejected boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);
```

13) First tasks you can hand off to Jules
----------------------------------------
- Run the SQL in Supabase and confirm tables are present.
- Start the Next dev server locally and verify `GET /api/studio/todays-narrative?token=...` returns a 200.
- Trigger `/api/simulate-life-event` and confirm the server logs show a webhook POST to `N8N_WEBHOOK_URL` and that `simulation_proposals` contains a row.
- Activate the n8n workflow (or run it in Execute mode) and confirm the webhook accepts the POST (no 404).

Appendix: File map and what to inspect
-------------------------------------
- app/
  - api/studio/
    - tara-context/route.ts — internal context endpoint, uses service role client; now accepts ?token= for dev.
    - todays-narrative/route.ts — secure narrative for n8n; prefers cache; returns 200 fallback.
    - refresh-context/route.ts — returns the big context object consumed by UI.
    - persist-narrative/route.ts — endpoint for the UI to post narrative changes.
    - masterplan-webhook/route.ts — receives master plan JSON from n8n and persists master_plans.
  - api/simulate-life-event/route.ts — main simulation entry.
  - api/simulation/proposal/route.ts — proposal retrieval and accept/reject handlers.
- lib/
  - tale-engine.ts — simulation logic (decay, event impacts, mood calculation).
  - simulation/planGenerator.ts — generates content candidates from context.
  - studio/contextCache.ts — small in-process cache (get/set/clear)
  - supabase/server.ts — createServiceRoleClient function.
  - n8n/workflows.ts — client wrappers that call `N8N_WEBHOOK_URL` endpoints.
  - api/google-ai.ts — helpers for calling Google Generative API.
  - prompts/ — a folder with prompt templates used when building payloads.
- components/
  - dashboard/ — UI components referencing the studio context and proposal endpoints
  - studio/ — creative-studio UI components

End — contact & notes
---------------------
If Jules needs a live walkthrough, share a minimal set of environment variables or invite to the dev machine. I can also generate a smaller "quick-start" cheat-sheet and a list of targeted grep/search commands to find the code paths for specific behaviors (e.g., "how the mood_label is surfaced in UI").

If you'd like I can now (A) attempt to auto-apply the SQL via the app's exec_sql RPC (I can try, but manual run is recommended), or (B) produce extra docs for specific subsystems (n8n workflow spec, Google Generative API exact payloads required) — tell me which and I will continue.