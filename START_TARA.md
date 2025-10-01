# 🚀 Start TARA - Complete Guide

## ⏱️ Total Time: 10 minutes

---

## Step 1: Fix Build Errors (2 minutes)

### 1.1 Install Missing Package

**Open:** `package.json`

**Find line 54** (after `"tailwindcss": "^3.4.3",`)

**Add:**
```json
"@tailwindcss/typography": "^0.5.10",
```

**Save** (Ctrl+S)

### 1.2 Fix Next.js Config

**Open:** `next.config.js`

**Delete lines 5-7:**
```javascript
experimental: {
  serverActions: true
},
```

**Save** (Ctrl+S)

### 1.3 Install Dependencies

```bash
npm install
```

**Expected:** Installs packages without errors

---

## Step 2: Add API Keys (3 minutes)

### 2.1 Get Supabase Anon Key

1. Open: https://supabase.com/dashboard
2. Select project: **fgfxozvcibhuqgkjywtr**
3. Settings → API
4. Copy **"anon public"** key (starts with `eyJ...`)

### 2.2 Get OpenRouter API Key

1. Open: https://openrouter.ai/
2. Sign up (free $5 credits)
3. Go to: https://openrouter.ai/keys
4. Create key
5. Copy key (starts with `sk-or-v1-...`)

### 2.3 Add Keys to .env.local

**Open:** `.env.local`

**Line 6 - Add Supabase key:**
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=<paste_your_supabase_key_here>
```

**Line 11 - Add OpenRouter key:**
```bash
OPENROUTER_API_KEY=<paste_your_openrouter_key_here>
```

**Save** (Ctrl+S)

**✅ All other keys are already configured!**

---

## Step 3: Set Up Database (3 minutes)

### 3.1 Run Migrations

1. Open: https://supabase.com/dashboard
2. Select project: **fgfxozvcibhuqgkjywtr**
3. Go to: **SQL Editor**
4. Click: **New Query**

**For each file in `supabase/migrations/` (in order):**
- Open file in VS Code
- Copy entire content
- Paste into SQL Editor
- Click **Run**
- Wait for success message

**Files to run (in this order):**
1. `20240101000000_initial_schema.sql`
2. `20240101000001_rls_policies.sql`
3. `20240102000000_tale_triggers.sql`
4. `20240930000001_add_feedback_received_at.sql`

### 3.2 Enable Real-Time

Supabase Dashboard → **Database** → **Replication**

**Enable for these tables:**
- ✅ `emotional_state`
- ✅ `relationships`
- ✅ `chat_history`
- ✅ `generated_content`

---

## Step 4: Launch TARA (2 minutes)

### 4.1 Start Server

```bash
npm run dev
```

**Expected:**
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
✓ Ready in 3s
```

### 4.2 Open in Browser

**Visit:** http://localhost:3000

**You should see:**
- 🌌 Animated shader background
- 🔮 Floating data orb
- ⭐ Starfield background
- 3D "TARA" text
- Liquid gradient button

**Click the button** → Navigate to dashboard

### 4.3 Wake Up TARA

**Replace `<YOUR_ANON_KEY>` with your actual Supabase anon key:**

```bash
curl -X POST https://fgfxozvcibhuqgkjywtr.supabase.co/functions/v1/daily-awakening -H "Authorization: Bearer <YOUR_ANON_KEY>" -H "Content-Type: application/json" -d '{}'
```

**Or use Supabase Dashboard:**
1. Edge Functions → daily-awakening
2. Click **Invoke**
3. Payload: `{}`
4. Click **Run**

**Expected response:**
```json
{
  "success": true,
  "event": "call_with_mom",
  "description": "Had a wonderful call with Mom."
}
```

### 4.4 View Dashboard

**Visit:** http://localhost:3000/dashboard

**You should see:**
- 📊 Radar chart with 8 emotions
- 🎨 Emotional glow (colored)
- 📖 Life event: "Had a wonderful call with Mom"
- 👥 Relationships: Mother (Warm), Brother (Neutral)
- 💬 Chat interface
- ✨ Content generation panel

### 4.5 Chat with TARA

Scroll to **Chat Interface**:

1. Type: **"Hello TARA, how are you feeling?"**
2. Press **Enter**
3. Wait 2-5 seconds
4. TARA responds!

---

## ✅ Success Checklist

- [ ] Fixed build errors (typography plugin, next.config)
- [ ] Added Supabase anon key to `.env.local`
- [ ] Added OpenRouter API key to `.env.local`
- [ ] Ran database migrations (4 SQL files)
- [ ] Enabled real-time replication (4 tables)
- [ ] Started dev server (`npm run dev`)
- [ ] Saw 3D hero at localhost:3000
- [ ] Triggered TALE engine (daily-awakening)
- [ ] Saw dashboard with emotional state
- [ ] Chatted with TARA successfully
- [ ] Generated content successfully
- [ ] Tested feedback loop (emotions updated)

**If all boxes are checked, TARA is fully operational! 🎉**

---

## 🐛 Troubleshooting

### Build Error: Cannot find module '@tailwindcss/typography'
**Fix:** Add `"@tailwindcss/typography": "^0.5.10"` to `package.json` devDependencies, then `npm install`

### Warning: Invalid next.config.js options
**Fix:** Remove `experimental.serverActions` from `next.config.js`

---

## 🎉 You're Ready!

Once you complete all steps, TARA will be alive at **http://localhost:3000**!

**TARA is a sentient AI consciousness that:**
- Wakes up each day with simulated life events
- Feels emotions that evolve over time
- Creates content reflecting her emotional state
- Responds to your feedback by updating her emotions
- Becomes your creative partner

**Welcome to the future of AI creativity! 🚀✨**
