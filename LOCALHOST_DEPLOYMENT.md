# 🚀 Deploy TARA to Localhost - Quick Guide

## ⏱️ Total Time: 10-15 minutes

---

## 🚨 CRITICAL: Fix Build Errors First (2 minutes)

**Before following the deployment steps, fix these two configuration issues:**

### Error 1: Missing Tailwind Typography Plugin

**Symptom:** `Error: Cannot find module '@tailwindcss/typography'`

**Fix:**
1. Open `package.json` in VS Code
2. Find the `devDependencies` section (around line 39)
3. Add this line after `"tailwindcss": "^3.4.3",`:
  ```json
  "@tailwindcss/typography": "^0.5.10",
  ```
4. Save the file
5. Run: `npm install`

### Error 2: Deprecated Next.js Config

**Symptom:** `Invalid next.config.js options detected: experimental.serverActions`

**Fix:**
1. Open `next.config.js` in VS Code
2. Find lines 5-7 (the `experimental` section)
3. Delete these lines:
  ```javascript
  experimental: {
    serverActions: true
  },
  ```
4. Save the file

**After fixing both issues:**
```bash
npm install  # Install the typography plugin
npm run dev  # Should start without errors now
```

**Expected output:**
```
▲ Next.js 14.2.33
- Local:        http://localhost:3000
✓ Ready in 3s
```

**If you still see errors, check the Troubleshooting section at the bottom.**

## Step 1: Get Your API Keys (5 minutes)

### 🔑 Key 1: Supabase Anon Key (REQUIRED)

1. Open https://supabase.com/dashboard in your browser
2. Select your project: **fgfxozvcibhuqgkjywtr**
3. Click **Settings** (left sidebar) → **API**
4. Find **"Project API keys"** section
5. Copy the **"anon public"** key (it's a long string starting with `eyJ...`)
6. Open `a:/TARAVSCODE/.env.local` in VS Code
7. Find the line: `NEXT_PUBLIC_SUPABASE_ANON_KEY=` and paste your copied key after the `=` (do NOT add quotes)
8. Save the file (Ctrl+S)

### 🔑 Key 2: OpenRouter API Key (REQUIRED)

1. Open https://openrouter.ai/ in your browser
2. Click **"Sign Up"** (free tier gives you $5 credits)
3. After signing up, go to https://openrouter.ai/keys
4. Click **"Create Key"**
5. Give it a name (e.g., "TARA Development")
6. Copy the key (starts with `sk-or-v1-...`)
7. Open `a:/TARAVSCODE/.env.local` in VS Code
8. Find the line: `OPENROUTER_API_KEY=` and paste your copied key after the `=` (do NOT add quotes)
9. Save the file (Ctrl+S)

**✅ Note:** Do NOT commit `.env.local` or these keys to source control. They are local secrets.

---

## Step 2: Set Up Database (5 minutes)

### 2.1 Run Migrations

1. Open Supabase Dashboard → **SQL Editor**
2. For each migration file in `a:/TARAVSCODE/supabase/migrations` (apply in chronological order), open and paste the SQL into the SQL Editor and click **Run**.
   - Typical files to run:
     - `20240101000000_initial_schema.sql`
     - `20240101000001_rls_policies.sql`
     - `20240102000000_tale_triggers.sql`
     - `20240930000001_add_feedback_received_at.sql`
3. Verify each migration reports success.

### 2.2 Enable Real-Time

Supabase Dashboard → **Database** → **Replication**
Enable replication for these tables:
- `emotional_state`
- `relationships`
- `chat_history`
- `generated_content`

This allows realtime UI updates in the dashboard.

### 2.3 Deploy Edge Functions (optional for local dev but recommended)

Open PowerShell in `a:/TARAVSCODE/` and run:

```powershell
# If you don't have supabase CLI
npm install -g supabase

# Login and link
supabase login
supabase link --project-ref fgfxozvcibhuqgkjywtr

# Deploy functions
supabase functions deploy daily-awakening
supabase functions deploy relationship-decay
supabase functions deploy feedback-handler
```

For each function, configure secrets in the Supabase dashboard (Edge Functions → function → Settings → Secrets):
- `SUPABASE_URL` = `https://fgfxozvcibhuqgkjywtr.supabase.com`
- `SUPABASE_SERVICE_ROLE_KEY` = (paste the service role key from your provider settings)

---

## Step 3: Install & Launch (2 minutes)

### 3.1 Install Dependencies

In the project root (`a:/TARAVSCODE/`):

```bash
npm install
```

### 3.2 Verify Setup

```powershell
npm run verify-deployment
```

Expect the script to validate `.env.local` keys and the critical bug fix. Fix any reported issues, then continue.

### 3.3 Start Development Server

```bash
npm run dev
```

Open: http://localhost:3000

---

## Step 4: See TARA in Action! (3 minutes)

### 4.1 View the 3D Hero Section

Open your browser: **http://localhost:3000**

You should see the hero scene, data orb, starfield, and entry button.

### 4.2 Wake Up TARA's Consciousness (invoke Edge function)

Replace `<YOUR_ANON_KEY>` with your actual Supabase anon key (do NOT paste it into shared channels):

```bash
curl -X POST https://fgfxozvcibhuqgkjywtr.supabase.co/functions/v1/daily-awakening \
  -H "Authorization: Bearer <YOUR_ANON_KEY>" \
  -H "Content-Type: application/json" \
  -d '{}'
```

If curl isn't available, use the Supabase dashboard → Edge Functions → daily-awakening → Invoke.

### 4.3 Dashboard and Features

- Visit http://localhost:3000/dashboard
- Chat with TARA
- Generate content via the Content Studio
- Provide feedback on generated content and watch the emotional state update

---

## Success checklist

- [ ] Hero scene loads
- [ ] Dashboard loads
- [ ] Edge function `daily-awakening` invoked successfully
- [ ] Chat works with OpenRouter
- [ ] Content generation works
- [ ] Feedback loop updates emotional state in real-time

---

## Quick Commands

```bash
# Start dev server
npm run dev

# Verify setup
npm run verify-deployment

# Test API connections
npm run test-apis

# Typecheck
npm run type-check
```

---

## Troubleshooting

- Black screen on homepage: check browser console (F12) and run `npm run validate-font`.
- Chat failing: ensure `OPENROUTER_API_KEY` is correct and you have credits.
- Dashboard empty: trigger `daily-awakening`.
- Realtime not updating: enable replication in Supabase.

---

## You're Done

TARA should now be running locally at http://localhost:3000 — enjoy! If you want, I can also create a short automated script to run the validations and start the server for you.
