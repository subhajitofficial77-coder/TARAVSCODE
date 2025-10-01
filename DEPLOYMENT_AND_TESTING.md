# TARA Deployment & Testing Guide

This document consolidates the Pre-Flight Checklist, local integration test steps, troubleshooting, and end-to-end tests for TARA. Use this to validate a local environment before deploying to production.

## Pre-Flight Checklist

## 🚨 CRITICAL: Fix This Bug First

Before running any tests or deploying, you MUST fix this bug in the TALE engine:

**File:** `supabase/functions/daily-awakening/index.ts`  
**Line:** 24  
**Issue:** Missing `await` keyword

Change from:
```typescript
const result = runDailySimulation(currentState, relationships || []);
```

To:
```typescript
const result = await runDailySimulation(currentState, relationships || []);
```

Why this matters: Without this fix the TALE engine will crash at runtime (attempting to read properties from a Promise). This is a blocking bug and must be fixed before any deployment or testing.

---

### Pre-Flight Checklist (expanded)

1. Environment variables (.env.local)

Required keys (place them in `.env.local` at the repo root):

- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_ANON_KEY
- SUPABASE_SERVICE_ROLE_KEY
- OPENROUTER_API_KEY  # REQUIRED - Get from https://openrouter.ai/keys
- GOOGLE_AI_KEY
- SERP_API_KEY
- WEATHER_API_KEY
- NEXT_PUBLIC_APP_URL
- TARA_LOCATION
- TARA_TIMEZONE

Checklist items:

- [ ] **CRITICAL:** Fixed the `await` bug in daily-awakening Edge Function (see above)
- [ ] Created `.env.local` with all API keys (especially OpenRouter)
- [ ] Obtained Supabase anon key from dashboard
- [ ] Obtained OpenRouter API key from https://openrouter.ai/keys
- [ ] Verified all API keys are valid and have credits/quota

---

## Database migrations

Run all Supabase migrations with the Supabase CLI or execute SQL files in order in the Supabase Dashboard.

Example with Supabase CLI:

supabase db push

Or execute SQL files in order in Dashboard → SQL Editor.

---

## Deploy Edge Functions

Deploy the Edge Functions used by TARA:

supabase functions deploy daily-awakening
supabase functions deploy relationship-decay
supabase functions deploy feedback-handler

---

## Local Integration Testing

1. Install dependencies and start dev server

```powershell
cd a:/TARAVSCODE
npm install
npm run dev
```

2. Visit http://localhost:3000 and verify the hero scene, 3D orb, and UI overlays load.

3. Test the TALE engine (daily-awakening)

Invoke via Supabase Dashboard or curl. Expected JSON response contains `emotional_summary` and `dominant_emotion`.

4. Test chat, content generation, and feedback flows from the Dashboard UI.

---

## End-to-End Tests (curl examples)

Trigger TALE:

```bash
curl -X POST https://<your-project>.supabase.co/functions/v1/daily-awakening \
  -H "Authorization: Bearer <ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

Chat to local API:

```bash
curl -X POST http://localhost:3000/api/chat \
  -H "Content-Type: application/json" \
  -d '{"message": "How are you feeling?"}'
```

Generate content then feedback:

```bash
curl -X POST http://localhost:3000/api/generate-content \
  -H "Content-Type: application/json" \
  -d '{"contentType": "caption", "platform": "instagram"}'

# then POST feedback using the returned content ID
```

---

## Troubleshooting Tips

- Missing OpenRouter key → add `OPENROUTER_API_KEY` to `.env.local`.
- Type errors → `npm run type-check`
- Missing fonts → run `node ./scripts/download-and-convert-inter.js`
- Edge Function errors → view logs in Supabase Dashboard

---

## ⚡ Quick Validation (2 minutes)

Run these commands to verify your setup before full testing:

```powershell
# 1. Check environment variables
npm run check-env

# 2. Validate font file
npm run validate-font

# 3. Type check (should have no errors)
npm run type-check

# 4. Install dependencies
npm install

# 5. Test build (optional but recommended)
npm run build
```

If all commands succeed, you're ready to start the development server.

---

## 🚫 Common Setup Mistakes

1. **Forgot to add OpenRouter API key** → Chat and content generation will fail with "temporarily unavailable"
2. **Didn't run database migrations** → Dashboard will be empty, "emotional state not initialized" errors
3. **Didn't deploy Edge Functions** → TALE engine won't run, no daily updates
4. **Didn't enable Supabase real-time** → Dashboard won't update automatically
5. **Used wrong Supabase key** → Used service role key in NEXT_PUBLIC_ variable (security risk!)
6. **Didn't fix the await bug** → TALE engine crashes every time

---

If you'd like, I can also add a debug route or helper scripts to automate some of these tests.
