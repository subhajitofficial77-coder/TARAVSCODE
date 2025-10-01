# ⚡ TARA Quick Start Guide

Get TARA running locally in **under 10 minutes**.

---

## 🚨 Step 0: Fix Critical Bug (30 seconds)

**REQUIRED BEFORE ANYTHING ELSE:**

Open `supabase/functions/daily-awakening/index.ts` and ensure line 24 uses `await`:

Change:
```typescript
const result = runDailySimulation(currentState, relationships || []);
```

To:
```typescript
const result = await runDailySimulation(currentState, relationships || []);
```

Save the file.

---

## 📋 Step 1: Environment Setup (2 minutes)

1. Copy environment file:

```bash
cp .env.local.example .env.local
```

2. Fill missing values in `.env.local` (Supabase anon key and OpenRouter key are required).

---

## 🗄️ Step 2: Database Setup (3 minutes)

Run required migrations in Supabase Dashboard → SQL Editor or using Supabase CLI.

---

## 🚀 Step 3: Run TARA (2 minutes)

```bash
npm install
npm run dev
```

Open http://localhost:3000 and verify the hero scene and dashboard.

---

## 🧪 Verify TALE engine

Trigger the daily awakening:

```bash
curl -X POST https://fgfxozvcibhuqgkjywtr.supabase.co/functions/v1/daily-awakening \
  -H "Authorization: Bearer <YOUR_SUPABASE_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

If everything works, TARA is alive! 🎉
