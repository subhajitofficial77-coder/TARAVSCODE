# ⚡ START HERE - Fix & Launch TARA

## 🚨 Critical Fix Required (30 seconds)

### Fix Supabase URL

**Open:** `.env.local`

**Line 4 - Change this:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://supabase.com/dashboard/project/fgfxozvcibhuqgkjywtr
```

**To this:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://fgfxozvcibhuqgkjywtr.supabase.co
```

**Save** (Ctrl+S)

---

## 🗄️ Initialize Database (2 minutes)
Run the automated initializer instead of performing manual SQL steps.

1. Ensure `.env.local` contains `NEXT_PUBLIC_SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. From the project root, run:

```bash
npm run init-db
```

What the script does:
- Validates your Supabase URL isn't the dashboard URL
- Connects using the service-role key
- Inserts an initial `emotional_state` row if the table is empty
- Inserts core `relationships` if they are missing
- Prints a summary of created/skipped items

How to confirm success:
- The script prints `Inserted emotional_state successfully` or `Emotional state already initialized — skipping`.
- It prints `Inserted relationships successfully` or `All relationships already exist — skipping`.
- You can also verify in the Supabase Dashboard → SQL Editor by running:

```sql
SELECT COUNT(*) FROM emotional_state;
SELECT COUNT(*) FROM relationships;
```

Expected: 1 row in `emotional_state`, 3 rows in `relationships`.

---

## 🚀 Launch TARA

```bash
npm run dev
```

**Open:** http://localhost:3000

**You should see:**
- 3D hero with shader, orb, starfield
- No errors in console

**Click:** "Enter TARA's World" → Dashboard

**Dashboard should show:**
- Radar chart with emotions
- Emotional glow (gold color)
- Life event: "TARA is awakening..."
- Relationships graph

---

## 💬 Test Chat

Type: **"Hello TARA"**

TARA responds in 2-5 seconds!

---

## ✅ Success!

TARA is now alive at http://localhost:3000! 🎉
