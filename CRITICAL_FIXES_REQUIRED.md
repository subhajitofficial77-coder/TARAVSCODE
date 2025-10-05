# 🚨 CRITICAL FIX: Database Connection Error

## ⚠️ Your Error

```
getEmotionalState error { message: '<!DOCTYPE html>...' }
Failed to build genesis prompt: [Error: Emotional state not initialized]
POST /api/chat 500 in 3225ms
```

## 🔍 Root Cause

**Your `.env.local` file has the WRONG Supabase URL!**

**Current (WRONG):**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/fgfxozvcibhuqgkjywtr
```

This is the **dashboard URL** (for viewing in browser), not the **API endpoint** (for database queries).

**What's happening:**
1. Your app tries to query: `https://supabase.com/dashboard/project/fgfxozvcibhuqgkjywtr/rest/v1/emotional_state`
2. Supabase returns: HTML 404 page ("Looking for something? 🔍")
3. Your app tries to parse HTML as JSON → Error
4. Chat fails because it can't load emotional state

## ✅ The Fix (30 seconds)

### Step 1: Open `.env.local`

In VS Code, open: `a:/TARAVSCODE/.env.local`

### Step 2: Fix Line 4

**Change from:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/fgfxozvcibhuqgkjywtr
```

**To:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fgfxozvcibhuqgkjywtr.supabase.co
```

### Step 3: Save

Press **Ctrl+S** to save the file.

### Step 4: Restart Server

```bash
# In terminal, stop the server (Ctrl+C)
npm run dev
```

## 🧪 Verify the Fix

**After restarting, open browser console (F12) → Network tab:**

**Before fix:**
- Requests to: `supabase.com/dashboard/project/...`
- Status: 404
- Response: HTML page

**After fix:**
- Requests to: `fgfxozvcibhuqgkjywtr.supabase.co/rest/v1/...`
- Status: 200 or 406 (both are OK - 406 means table is empty)
- Response: JSON data

## 🗄️ Second Issue: Empty Database

**After fixing the URL, you'll get a different error:**
```
Emotional state not initialized
```

This means the database table exists but has no data.

### Fix: Initialize Database

**Run this SQL in Supabase SQL Editor:**

```sql
INSERT INTO emotional_state (primary_emotions, mood, core_traits, last_event, last_event_timestamp)
VALUES (
  '{"joy": 0.6, "trust": 0.7, "fear": 0.2, "surprise": 0.4, "sadness": 0.2, "disgust": 0.1, "anger": 0.1, "anticipation": 0.7}'::jsonb,
  '{"optimism": 0.75, "energy_level": 0.7, "stress_level": 0.2}'::jsonb,
  '{"warmth": 0.9, "wit": 0.8, "ambition": 0.95}'::jsonb,
  'TARA is awakening for the first time.',
  NOW()
);

INSERT INTO relationships (entity_name, relationship_type, status, last_interaction)
VALUES
  ('Mother', 'family', 'warm', NOW()),
  ('Younger Brother', 'family', 'neutral', NOW()),
  ('Best Friend', 'friend', 'warm', NOW())
ON CONFLICT (entity_name) DO NOTHING;
```

**How to run:**
1. Open: https://supabase.com/dashboard
2. Select project: **fgfxozvcibhuqgkjywtr**
3. Go to: **SQL Editor** → **New Query**
4. Paste the SQL above
5. Click: **Run**
6. Verify: "Success. 1 row(s) affected"

## ✅ After Both Fixes

**Restart dev server:**
```bash
npm run dev
```

**Open:** http://localhost:3000/dashboard

**You should see:**
- ✅ Radar chart with 8 emotions
- ✅ Emotional glow (gold/yellow color)
- ✅ Life event: "TARA is awakening for the first time."
- ✅ Mood bars: Optimism 75%, Energy 70%, Stress 20%
- ✅ Relationships: Mother (Warm), Brother (Neutral), Best Friend (Warm)

**Chat will work:**
- Type: "Hello TARA"
- TARA responds in 2-5 seconds

## 🎯 Summary

**2 critical fixes:**
1. ✅ Fix Supabase URL in `.env.local` line 4
2. ✅ Run SQL to initialize database

**After fixes:**
- Database connection works
- Emotional state loads
- Chat works
- Content generation works
- TARA is alive! 🧠✨
