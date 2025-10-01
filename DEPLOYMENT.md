# TARA Deployment Guide

This document formalizes deployment steps and pre-deployment checks for TARA. It is intended to be the canonical guide for getting TARA from local to production.

## Status
**Status:** ✅ Production Ready (with one critical bug fix)
**Version:** 1.0.0
**Phases:** 8/8 Complete

---

## ⚠️ CRITICAL: Fix This Bug First

Before running tests or deploying, you MUST fix this blocking bug:

**File:** `supabase/functions/daily-awakening/index.ts`
**Line:** 24

Change:

```typescript
const result = runDailySimulation(currentState, relationships || []);
```

To:

```typescript
const result = await runDailySimulation(currentState, relationships || []);
```

Why: Without this await, `result` will be a Promise and later property access will fail at runtime.

After fixing, redeploy the function.

---

## Pre-Flight Checklist

- [ ] Fixed the `await` bug in `daily-awakening`
- [ ] `.env.local` created with valid keys (OpenRouter required)
- [ ] Supabase migrations executed
- [ ] Edge Functions deployed
- [ ] Real-time replication enabled for necessary tables
- [ ] Run `npm run verify-deployment` and `npm run test-apis`

---

## Quick Validation

```powershell
npm run check-env
npm run validate-font
npm run type-check
npm install
npm run build
```

If all commands succeed, proceed to start the server.

---

## Deploy Edge Functions

```bash
supabase functions deploy daily-awakening
supabase functions deploy relationship-decay
supabase functions deploy feedback-handler
```

Add the required secrets in Supabase Dashboard → Edge Functions → [function] → Settings → Secrets.

---

## Troubleshooting

See `DEPLOYMENT_AND_TESTING.md` for more details and run `npm run verify-deployment` for automated checks.
