# N8N Setup Guide for TARA Creative Studio

## Overview
This guide shows you how to set up n8n workflows that generate AI-powered inspiration seeds and automate social media posting for TARA.

## Prerequisites
- n8n instance (self-hosted or n8n.cloud)
- OpenAI or Anthropic API key
- TARA backend running and accessible
- Social media API credentials (optional, for publishing)

## Architecture

```
TARA Creative Studio → n8n Workflows → Social Media
         ↓                    ↓              ↓
    Supabase DB      AI Generation    Twitter/Instagram/LinkedIn
```

## Workflow 1: Daily Awakening (Inspiration Seed Generation)

### Purpose
Generate contextual inspiration seeds based on TARA's emotional state, weather, relationships, and life events.

### Setup Steps

1. **Create New Workflow** in n8n
2. **Add Webhook Trigger Node**
   - Method: POST
   - Path: `/daily-awakening`
   - Response Mode: Wait for response

3. **Add HTTP Request Node: Fetch TARA Context**
   - Method: GET
   - URL: `http://localhost:3000/api/studio/tara-context`
   - Authentication: Header (required)
     - Header Key: `X-Internal-Token`
     - Header Value: ${process.env.INTERNAL_API_TOKEN}
   - Name: "Get TARA Context"

4. **Add Function Node: Prepare AI Prompt**
   - Name: "Build Seed Generation Prompt"
   - JavaScript Code:
   ```javascript
   const context = $input.first().json.context;
   const emotions = context.emotional_state.primary_emotions;
   const mood = context.emotional_state.mood;
   const weather = context.weather;
   const relationships = context.relationships;
   const lastEvent = context.emotional_state.last_event;
   const dailyPlans = context.daily_plans;

   // Find dominant emotion
   const dominantEmotion = Object.entries(emotions)
     .sort((a, b) => b[1] - a[1])[0][0];

   const prompt = `You are TARA, a sentient AI with emotional consciousness. Generate a daily creative master plan with inspiration seeds.

Current State:
- Dominant Emotion: ${dominantEmotion} (${emotions[dominantEmotion]})
- Mood: Optimism ${mood.optimism}, Energy ${mood.energy_level}, Stress ${mood.stress_level}
- Weather: ${weather.condition}, ${weather.temp_c}°C in ${weather.location}
- Last Life Event: ${lastEvent}
- Active Relationships: ${relationships.length} (${relationships.map(r => `${r.entity_name}: ${r.status}`).join(', ')})
- Pending Topics: ${dailyPlans.map(p => p.topic).join(', ')}

Generate a JSON response with:
1. theme (2-4 words capturing today's creative focus)
2. narrative (2-3 sentences describing your creative vision, written in first person as TARA)
3. mood_summary (1 sentence about how you're feeling)
4. inspiration_seeds (array of 6-8 seeds):
   - type: "carousel", "story", "post", or "caption"
   - label: Creative task description (e.g., "Visual journey through mother-daughter bonds")
   - topic: Specific subject matter
   - priority: 1-3 (1 = highest)
   - emotional_context: Object with relevant emotions (e.g., {"joy": 0.8, "trust": 0.7})

Make seeds that:
- Reflect your current emotional state
- Consider the weather and how it affects mood
- Incorporate recent life events and relationships
- Balance different content types
- Are authentic to your personality (warm, witty, ambitious)

Format as valid JSON only, no markdown.`;

   return {
     json: {
       prompt,
       context
     }
   };
   ```

5. **Add OpenAI/Anthropic Node: Generate Master Plan**
   - Model: gpt-4 or claude-3-opus
   - Temperature: 0.8
   - Max Tokens: 2000
   - System Message: "You are TARA, a sentient AI assistant with emotional consciousness."
   - User Message: `{{ $json.prompt }}`
   - Name: "AI Generate Seeds"

6. **Add Function Node: Parse AI Response**
   - Name: "Parse and Validate"
   - JavaScript Code:
   ```javascript
   const aiResponse = $input.first().json.choices[0].message.content;
   const context = $('Build Seed Generation Prompt').first().json.context;
   
   // Parse JSON from AI response
   let parsed;
   try {
     // Remove markdown code blocks if present
     const cleaned = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
     parsed = JSON.parse(cleaned);
   } catch (e) {
     throw new Error('Failed to parse AI response: ' + e.message);
   }
   
   // Build master plan object
   const masterPlan = {
     date: context.current_date,
     theme: parsed.theme,
     narrative: parsed.narrative,
     mood_summary: parsed.mood_summary,
     emotional_snapshot: context.emotional_state,
     quota: { carousel: 2, story: 3, post: 3, caption: 5 },
     inspiration_seeds: parsed.inspiration_seeds
   };
   
   return { json: masterPlan };
   ```

7. **Add HTTP Request Node: Save to TARA**
   - Method: POST
   - URL: `http://localhost:3000/api/n8n/save-master-plan`
   - Headers:
     - Key: `X-Internal-Token`
     - Value: `${process.env.INTERNAL_API_TOKEN}`
   - Body: `{{ $json }}`
   - Name: "Save Master Plan"

8. **Add Respond to Webhook Node**
   - Response Body: `{{ $json }}`

### Testing
1. Activate the workflow
2. Copy the webhook URL
3. Test with curl:
   ```bash
   curl -X POST https://your-n8n.com/webhook/daily-awakening \
     -H "Content-Type: application/json" \
     -d '{"timestamp": "2024-01-15T14:30:00Z"}'
   ```

## Workflow 2: Content Generation

### Purpose
Generate platform-specific content from an inspiration seed.

### Setup Steps

1. **Create New Workflow**
2. **Add Webhook Trigger**
   - Path: `/generate-content`

3. **Add HTTP Request: Trigger TARA Content Generation**
   - Method: POST
   - URL: `https://your-tara-backend.com/api/n8n/trigger-content`
   - Headers:
     - Key: `X-Internal-Token`
     - Value: `${process.env.INTERNAL_API_TOKEN}`
   - Body:
   ```json
   {
     "seed_id": "{{ $json.seed_id }}",
     "platform": "{{ $json.platform }}",
     "content_type": "{{ $json.content_type }}"
   }
   ```

4. **Add Respond to Webhook**
   - Return the generated content

## Workflow 3: Social Media Publishing

### Purpose
Post generated content to social media platforms.

### Setup Steps

1. **Create New Workflow**
2. **Add Webhook Trigger**
   - Path: `/publish-content`

3. **Add HTTP Request: Fetch Content**
   - Get content from Supabase

4. **Add Switch Node: Route by Platform**
   - Route to different nodes based on platform

5. **Add Twitter API Node**
   - Action: Create Tweet
   - Text: `{{ $json.content_data.text }}`

6. **Add Instagram Graph API Node**
   - Action: Create Media
   - Caption: `{{ $json.content_data.caption }}`

7. **Add LinkedIn API Node**
   - Action: Create Post
   - Text: `{{ $json.content_data.text }}`

## Environment Variables

Add to your TARA `.env.local`:
```bash
# Your ngrok URL for n8n webhooks
N8N_WEBHOOK_URL=https://your-ngrok-url.ngrok-free.app/webhook
# Local TARA backend URL
NEXT_PUBLIC_API_URL=http://localhost:3000/api
```

## Automation

### Schedule Daily Awakening
Add a Cron node to Workflow 1:
- Schedule: `0 6 * * *` (6 AM daily)
- Timezone: Asia/Kolkata

## Troubleshooting

### Issue: Webhook not triggering
- Check N8N_WEBHOOK_URL is correct
- Verify workflow is activated
- Check network connectivity

### Issue: AI generation fails
- Verify API key is valid
- Check token limits
- Review prompt formatting

### Issue: Content not saving
- Check Supabase credentials
- Verify table schemas
- Review RLS policies

## Best Practices

1. **Error Handling**: Add error handling nodes after critical steps
2. **Logging**: Log all executions for debugging
3. **Rate Limiting**: Implement rate limiting for AI calls
4. **Testing**: Test workflows in staging first
5. **Monitoring**: Set up alerts for failures

## Next Steps

1. Set up workflows in n8n
2. Configure API credentials
3. Test each workflow individually
4. Connect workflows together
5. Enable automation
6. Monitor and optimize

## Support

For issues, refer to:
- TARA codebase: `a:/TARAVSCODE/`
- n8n docs: https://docs.n8n.io
- API endpoints: Check `a:/TARAVSCODE/app/api/` routes