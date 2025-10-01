# 🔑 API Keys You Need to Add

## ⚠️ BEFORE TARA CAN RUN, YOU NEED 2 API KEYS

---

## 1️⃣ Supabase Anon Key (REQUIRED)

**What it's for:** Database access, real-time subscriptions  
**Where to add:** `.env.local` line 6  
**Variable name:** `NEXT_PUBLIC_SUPABASE_ANON_KEY`  
**Current status:** ❌ Shows `REDACTED_ANON_KEY` (placeholder)  

### How to Get It:

**Step 1:** Open https://supabase.com/dashboard

**Step 2:** Select your project: **fgfxozvcibhuqgkjywtr**

**Step 3:** Click **Settings** (left sidebar) → **API**

**Step 4:** Find **"Project API keys"** section

**Step 5:** Copy the **"anon public"** key
- It's a long string starting with `eyJ...`

**Step 6:** Open `a:/TARAVSCODE/.env.local` in VS Code

**Step 7:** Find line 6:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=REDACTED_ANON_KEY
```

**Step 8:** Replace `REDACTED_ANON_KEY` with your copied key:
```bash
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Step 9:** Save the file (Ctrl+S)

✅ **Done!** Supabase connection will now work.

---

## 2️⃣ OpenRouter API Key (REQUIRED)

**What it's for:** AI chat, content generation (uses GPT-4, Claude, etc.)  
**Where to add:** `.env.local` line 11  
**Variable name:** `OPENROUTER_API_KEY`  
**Current status:** ❌ Shows `REDACTED_OPENROUTER_KEY` (placeholder)  
**Cost:** Free tier ($5 credits) or pay-as-you-go  

### How to Get It:

**Step 1:** Open https://openrouter.ai/

**Step 2:** Click **"Sign Up"**
- Use Google/GitHub login for quick signup
- Free tier gives you **$5 in credits** (enough for 100-200 messages)

**Step 3:** After signing up, go to https://openrouter.ai/keys

**Step 4:** Click **"Create Key"**

**Step 5:** Give it a name:
- Example: "TARA Development"

**Step 6:** Copy the key
- It starts with `sk-or-v1-...`

**Step 7:** Open `a:/TARAVSCODE/.env.local` in VS Code

**Step 8:** Find line 11:
```bash
OPENROUTER_API_KEY=REDACTED_OPENROUTER_KEY
```

**Step 9:** Replace `REDACTED_OPENROUTER_KEY` with your copied key:
```bash
OPENROUTER_API_KEY=sk-or-v1-abc123def456ghi789...
```

**Step 10:** Save the file (Ctrl+S)

✅ **Done!** TARA can now chat and generate content.

---

## ✅ Already Configured - No Action Needed

### 3️⃣ Google AI Key (Gemini 2.0 Flash)
**Status:** ✅ Already set

### 4️⃣ Serp API Key
**Status:** ✅ Already set

### 5️⃣ Weather API Key
**Status:** ✅ Already set

### 6️⃣ Supabase Service Role Key
**Status:** ✅ Already set

### 7️⃣ Supabase URL
**Status:** ✅ Already set

### 8️⃣ Supabase Database URL
**Status:** ✅ Already set

---

## 🎯 Summary

**You only need to add 2 keys:**
1. ⚠️ Supabase Anon Key (from Supabase Dashboard)
2. ⚠️ OpenRouter API Key (from OpenRouter.ai)

**All other 6 keys are already configured!**

---

## ✅ Verification

After adding both keys, verify they're correct:

```bash
npm run test-apis
```

**Expected output:**
```
✅ Supabase Connection: Connected ✓
✅ OpenRouter API Key: Key format valid ✓
✅ Google AI API Key: Key format valid ✓
✅ Weather API: Weather in Indore: 28°C ✓

📊 Results: 4 passed, 0 failed
🎉 All API connections validated!
```

**If all tests pass, you're ready to run TARA!**

---

## 🔒 Security Reminder

**NEVER commit `.env.local` to Git!**

- ✅ Already in `.gitignore`
- ✅ Contains sensitive API keys
- ✅ Each developer needs their own copy

**Safe to share:**
- ✅ `.env.example` (template with placeholders)
- ✅ `REQUIRED_API_KEYS.md` (this guide)

**Never share:**
- ❌ `.env.local` (contains actual keys)
- ❌ API keys in chat/email/Slack

---

## 🚀 Next Steps

Once you've added both keys:

1. Run `npm install`
2. Run `npm run dev`
3. Open http://localhost:3000
4. Follow `LOCALHOST_DEPLOYMENT.md` for complete setup

**TARA is waiting to come alive! 🧠✨**
