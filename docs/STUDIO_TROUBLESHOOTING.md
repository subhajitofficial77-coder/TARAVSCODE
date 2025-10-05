# TARA's Studio Troubleshooting Guide

## Quick Fixes

### "Unable to load studio context"

**Cause**: The studio-context edge function is failing or not deployed.

**Solutions**:
1. Click the "Initialize Studio" button - this will auto-seed the database
2. Check that the edge function is deployed: `supabase functions deploy studio-context`
3. Verify environment variables in Supabase dashboard:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `WEATHER_API_KEY`

### "No inspiration seeds available"

**Cause**: The master_plans table is empty.

**Solutions**:
1. Click "Initialize Studio" in the header
2. Run the seed script manually: `npm run seed-studio`
3. Trigger the daily-awakening function to generate a new master plan

### Weather shows "—"

**Cause**: Weather API key is missing or invalid.

**Solutions**:
1. Add `WEATHER_API_KEY` to your `.env.local` file
2. Use the provided key: `ee78b5a89f28427eabe160052252609`
3. Restart the dev server after adding the key

### Content generation fails

**Cause**: Missing AI API keys.

**Solutions**:
1. Add `OPENROUTER_API_KEY` to `.env.local` (get from https://openrouter.ai/keys)
2. Or add `GOOGLE_AI_KEY` as a fallback
3. Restart the dev server

### Carousel looks broken

**Cause**: Browser compatibility or CSS issues.

**Solutions**:
1. Try a different browser (Chrome/Firefox recommended)
2. Clear browser cache and reload
3. Check browser console for errors

## Environment Variables Checklist

Ensure these are set in `.env.local`:

```bash
# Required
NEXT_PUBLIC_SUPABASE_URL=https://fgfxozvcibhuqgkjywtr.supabase.com
NEXT_PUBLIC_SUPABASE_ANON_KEY=<YOUR_KEY>
SUPABASE_SERVICE_ROLE_KEY=<YOUR_KEY>

# For content generation (at least one required)
OPENROUTER_API_KEY=<YOUR_KEY>  # Recommended
GOOGLE_AI_KEY=<YOUR_KEY>       # Fallback

# For weather display
WEATHER_API_KEY=ee78b5a89f28427eabe160052252609
WEATHER_API_ENDPOINT=https://api.weatherapi.com/v1

# Location settings
TARA_LOCATION=Indore,India
TARA_TIMEZONE=Asia/Kolkata
```

## Edge Functions Checklist

Verify these edge functions are deployed:

1. **studio-context**: Aggregates all Studio data
   - Test: `curl -X POST https://fgfxozvcibhuqgkjywtr.supabase.co/functions/v1/studio-context`
   - Should return: `{"success": true, "context": {...}}`

2. **daily-awakening**: Generates master plans
   - Test: `curl -X POST https://fgfxozvcibhuqgkjywtr.supabase.co/functions/v1/daily-awakening`
   - Should return: `{"success": true, "simulation": {...}}`

## Database Checklist

Verify these tables have data:

1. **emotional_state**: Should have 1 row
2. **relationships**: Should have at least 3 rows
3. **daily_plans**: Should have at least 5 rows
4. **master_plans**: Should have at least 1 row for today

Run this SQL in Supabase SQL Editor:

```sql
SELECT 'emotional_state' as table_name, COUNT(*) as count FROM emotional_state
UNION ALL
SELECT 'relationships', COUNT(*) FROM relationships
UNION ALL
SELECT 'daily_plans', COUNT(*) FROM daily_plans
UNION ALL
SELECT 'master_plans', COUNT(*) FROM master_plans;
```

Expected results:
- emotional_state: 1
- relationships: 3+
- daily_plans: 5+
- master_plans: 1+

## Common Error Messages

### "Missing Supabase env vars for studio context"

**Fix**: Add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to `.env.local`

### "studio-context edge function failed 404"

**Fix**: Deploy the edge function: `supabase functions deploy studio-context`

### "Generation failed: Missing AI API keys"

**Fix**: Add `OPENROUTER_API_KEY` or `GOOGLE_AI_KEY` to `.env.local`

### "Invalid JSON format" (in Refine modal)

**Fix**: Ensure the JSON is properly formatted. Use a JSON validator if needed.

## Still Having Issues?

1. Check browser console (F12) for error messages
2. Check Supabase edge function logs
3. Check Next.js server logs
4. Review the `QUICK_START_STUDIO.md` guide
5. Ensure all migrations have run: `supabase db push`

## Reset Everything

If all else fails, reset the Studio:

```bash
# 1. Clear the database
supabase db reset

# 2. Run migrations
supabase db push

# 3. Seed the database
npm run seed-studio

# 4. Restart the dev server
npm run dev
```

Then visit `/creative-studio` and click "Initialize Studio".