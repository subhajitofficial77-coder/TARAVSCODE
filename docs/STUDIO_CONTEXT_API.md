# Studio Context API

## Overview

The Studio Context API provides a single, consolidated endpoint for fetching all data required by TARA's Studio interface. This eliminates multiple round-trips and ensures the UI always has a consistent snapshot of TARA's current state.

### Edge Function: `studio-context`

**Endpoint**: `POST /functions/v1/studio-context`

**Authentication**: Requires `Authorization: Bearer <SUPABASE_ANON_KEY>` header

**Request**: No body required (POST method for consistency with other edge functions)

**Response**:
```json
{
  "success": true,
  "context": {
    "emotional_state": { /* EmotionalState object */ },
    "master_plan": { /* MasterPlan object or null */ },
    "tale_event": {
      "description": "Had a heartwarming call with Mom",
      "timestamp": "2024-12-01T10:30:00Z"
    },
    "relationships": [ /* Array of Relationship objects */ ],
    "daily_plans": [ /* Array of pending daily plan items */ ],
    "weather": {
      "temp_c": 28,
      "condition": "Sunny",
      "location": "Indore"
    },
    "timestamp": "2024-12-01T14:22:00Z"
  }
}
```

### Master Plan Structure

The `master_plan` object contains:
- `narrative`: TARA's daily creative narrative
- `theme`: Creative theme for the day
- `mood_summary`: Human-readable mood description
- `inspiration_seeds`: Array of actionable creative tasks
- `quota`: Content quota (e.g., `{"carousel": 1, "story": 3}`)
- `emotional_snapshot`: Emotional state at plan creation time

### Inspiration Seeds

Each seed in `inspiration_seeds` has:
- `id`: Unique identifier (e.g., "seed-1")
- `label`: User-facing description (e.g., "Draft the carousel post about mother-daughter bonds")
- `type`: Content type (carousel, story, caption, post)
- `topic`: The topic from daily_plans
- `priority`: Numeric priority (1 = highest)

### Client Usage

Use the `getStudioContext()` helper from `lib/supabase/queries.ts`:

```typescript
import { getStudioContext } from '@/lib/supabase/queries';

const context = await getStudioContext();
if (context) {
  // Use context.emotional_state, context.master_plan, etc.
}
```

### Error Handling

- Returns `null` if the edge function fails
- Logs errors to console for debugging
- Gracefully handles missing master_plan (returns null in context)

### Performance

- Single round-trip to fetch all data
- Cached at edge for ~5 seconds (configurable)
- Typical response time: <200ms

### Related Files

- Edge function: `supabase/functions/studio-context/index.ts`
- Migration: `supabase/migrations/20241201000000_master_plans_and_studio_context.sql`
- Types: `types/database.ts` (StudioContext, MasterPlan, InspirationSeed)
- Queries: `lib/supabase/queries.ts` (getStudioContext, getLatestMasterPlan)
