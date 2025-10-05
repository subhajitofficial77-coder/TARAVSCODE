# Quick Start: TARA's Creative Studio

## 🚀 Get the Studio Working in 3 Steps

### Step 1: Verify Environment Variables

Make sure your `.env.local` file has these keys:

```bash
# Required for Studio to work
NEXT_PUBLIC_SUPABASE_URL=https://fgfxozvcibhuqgkjywtr.supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_KEY>  # Get from Supabase dashboard
SUPABASE_SERVICE_ROLE_KEY=<YOUR_KEY>     # Already provided

# Required for content generation
OPENROUTER_API_KEY=<YOUR_KEY>  # Get from https://openrouter.ai/keys
GOOGLE_AI_KEY=<YOUR_KEY>       # Already provided (fallback)

# Required for weather display
WEATHER_API_KEY=ee78b5a89f28427eabe160052252609  # Already provided
WEATHER_API_ENDPOINT=https://api.weatherapi.com/v1  # Already provided

# Location settings
TARA_LOCATION=Indore,India
TARA_TIMEZONE=Asia/Kolkata
```

### Step 2: Seed the Database

Run this command to populate the Studio with sample data:

```bash
npm run seed-studio
```

This creates:
- ✅ Emotional state (TARA's current mood)
- ✅ Relationships (Mother, Best Friend, Mentor)
- ✅ Daily plans (5 content ideas)
- ✅ Master plan (today's creative roadmap with 4 inspiration seeds)

### Step 3: Start the Dev Server

```bash
npm run dev
```

Then visit: **http://localhost:3000/creative-studio**

---

## ✨ What You Should See

### Header (Today's Narrative)
- **TARA's Studio** title
- **Narrative**: "A beautiful day to celebrate connections..."
- **Creative Mood**: "Optimistic and Energized"
- **Latest Event**: "Woke up feeling inspired and ready to create"
- **Weather**: "28°C • Partly cloudy in Indore"
- **Key Relationships**: Mother ❤️, Priya 💛, Rajesh 💛

### Inspiration Hub
- **Master Plan**: Shows today's creative theme
- **4 Inspiration Seeds**:
  1. Draft a carousel post about mother-daughter bonds
  2. Write 3 Instagram story questions about family traditions
  3. Create a caption celebrating personal growth
  4. Brainstorm visual ideas for a gratitude post

### Creation Stream
- **Carousel Previews**: Shows generated carousel content
- **Content Cards**: Each with Emotional Fingerprint showing:
  - Top 3 emotions (e.g., joy: 70%, trust: 60%, anticipation: 50%)
  - Mood metrics (Optimism, Energy, Stress)
  - Accept/Refine/Discard buttons

---

## 🐛 Troubleshooting

### "No inspiration seeds available"
**Cause**: Master plan table is empty  
**Fix**: Run `npm run seed-studio`

### Weather shows "—"
**Cause**: Weather API key missing or invalid  
**Fix**: Check `WEATHER_API_KEY` in `.env.local`

### "No recent events"
**Cause**: TALE simulation hasn't run yet  
**Fix**: The seed script creates a default event. For real events, trigger the daily-awakening function.

### Content generation fails
**Cause**: Missing AI API keys  
**Fix**: Add `OPENROUTER_API_KEY` to `.env.local` (get from https://openrouter.ai/keys)

### Carousel looks broken
**Cause**: Browser compatibility or CSS issues  
**Fix**: Try a different browser (Chrome/Firefox recommended) or clear cache

---

## 🔄 Daily Workflow

1. **Morning**: Run the daily-awakening function to create a fresh master plan
2. **Create**: Select inspiration seeds and collaborate with TARA
3. **Review**: Accept, refine, or discard generated content
4. **Iterate**: Use the Refine modal to improve content

---

## 📚 Next Steps

- Read `docs/STUDIO_CONTEXT_API.md` for API details
- Explore the TALE engine for life simulation
- Customize master plan generation in `supabase/functions/daily-awakening/index.ts`
- Add more inspiration seed templates

---

## 🆘 Still Having Issues?

Check the browser console (F12) for error messages and review:
- Supabase connection status
- Edge function logs
- Network requests to `/api/generate-content`

If the Studio context fails to load, verify the `studio-context` edge function is deployed.
