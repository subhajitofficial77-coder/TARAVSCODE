# 🚀 TARA's Creative Studio - Complete Upgrade Plan

## Overview
Transform the Studio into a complete, memory-enabled, multi-platform content creation system with image analysis capabilities.

---

## 🐛 Phase 1: Fix Critical Issues

### 1.1 Fix Instagram Carousel Generation
**Issue**: Carousel not generating content
**Root Cause**: API route or prompt builder issue
**Fix**:
- Debug `/api/generate-content` route
- Check carousel prompt builder in `content-prompts.ts`
- Verify content parsing logic
- Add detailed error logging

### 1.2 Fix Chat Functionality
**Issue**: Direct connection with TARA not working
**Root Cause**: Chat API or WebSocket connection issue
**Fix**:
- Debug `/api/chat` route
- Check chat history fetching
- Verify emotional state integration
- Add error boundaries

### 1.3 Add Back Button
**Location**: Top-left of Studio page
**Implementation**:
```tsx
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

function BackButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push('/')}
      className="fixed top-6 left-6 z-50 glass px-4 py-2 rounded-full flex items-center gap-2 hover:bg-white/10 transition-all"
    >
      <ArrowLeft className="w-5 h-5" />
      <span>Back to Home</span>
    </button>
  );
}
```

---

## 💾 Phase 2: Supabase Memory Integration

### 2.1 Database Schema Updates
**New Table**: `content_memory`
```sql
CREATE TABLE content_memory (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  content_id UUID REFERENCES generated_content(id),
  platform TEXT NOT NULL,
  content_type TEXT NOT NULL,
  caption TEXT,
  description TEXT,
  hashtags TEXT[],
  emotional_snapshot JSONB,
  user_action TEXT, -- 'accepted', 'rejected', 'declined'
  custom_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add indexes for common queries
CREATE INDEX idx_content_memory_platform ON content_memory(platform);
CREATE INDEX idx_content_memory_content_type ON content_memory(content_type);
CREATE INDEX idx_content_memory_user_action ON content_memory(user_action);
```

### 2.2 Memory Storage API
**New Route**: `/api/memory/store`
```typescript
export async function POST(req: Request) {
  const { contentId, platform, action, customNotes } = await req.json();
  
  // Fetch content from generated_content
  const content = await getGeneratedContent(supabase, 1, contentId);
  
  // Store in content_memory with emotional snapshot
  await supabase.from('content_memory').insert({
    content_id: contentId,
    platform,
    content_type: content.content_type,
    caption: content.content_data.text,
    emotional_snapshot: content.emotional_context,
    user_action: action,
    custom_notes: customNotes
  });
  
  return NextResponse.json({ success: true });
}
```

### 2.3 Memory Retrieval API
**New Route**: `/api/memory/retrieve`
```typescript
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const platform = searchParams.get('platform');
  const limit = parseInt(searchParams.get('limit') || '50');
  
  const { data } = await supabase
    .from('content_memory')
    .select('*')
    .eq('platform', platform)
    .order('created_at', { ascending: false })
    .limit(limit);
  
  return NextResponse.json({ success: true, memories: data });
}
```

---

## 🎯 Phase 3: Enhanced Feedback System

### 3.1 Three-Button System
**Buttons**: Accept | Reject | Decline

**Accept Button**:
- Stores content in Supabase memory
- Updates emotional state (positive feedback)
- Shows success toast

**Reject Button**:
- Triggers regeneration with same seed
- Keeps original for comparison
- Updates emotional state (neutral feedback)

**Decline Button**:
- Opens custom input modal
- User provides their own caption/description
- Stores user's version in memory
- Updates emotional state (learning feedback)

### 3.2 Decline Modal Component
**File**: `components/studio/DeclineModal.tsx`
```tsx
function DeclineModal({ open, item, onClose, onSave }) {
  const [customCaption, setCustomCaption] = useState('');
  const [customDescription, setCustomDescription] = useState('');
  const [platform, setPlatform] = useState('instagram');
  
  return (
    <AnimatePresence>
      {open && (
        <motion.div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
          <motion.div className="glass rounded-2xl p-6 w-11/12 max-w-2xl">
            <h2 className="text-xl font-bold text-white mb-4">Provide Your Version</h2>
            <p className="text-white/70 mb-4">Help TARA learn by sharing your preferred caption and description.</p>
            
            <div className="space-y-4">
              <div>
                <label className="text-sm text-white/70 mb-2 block">Platform</label>
                <select value={platform} onChange={(e) => setPlatform(e.target.value)} className="w-full p-3 bg-black/40 border border-white/10 rounded-lg text-white">
                  <option value="instagram">Instagram</option>
                  <option value="twitter">Twitter</option>
                  <option value="linkedin">LinkedIn</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-2 block">Your Caption</label>
                <textarea
                  value={customCaption}
                  onChange={(e) => setCustomCaption(e.target.value)}
                  placeholder="Write your preferred caption..."
                  className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-lg text-white resize-none"
                />
              </div>
              
              <div>
                <label className="text-sm text-white/70 mb-2 block">Your Description</label>
                <textarea
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  placeholder="Write your preferred description..."
                  className="w-full h-32 p-4 bg-black/40 border border-white/10 rounded-lg text-white resize-none"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={onClose} className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 text-white rounded-lg">Cancel</button>
              <button
                onClick={() => onSave({ caption: customCaption, description: customDescription, platform })}
                disabled={!customCaption.trim()}
                className="px-4 py-2 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-lg disabled:opacity-50"
              >
                Save to TARA's Memory
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
```

### 3.3 Update ContentStreamCard
Replace 2-button system with 3-button system:
```tsx
<div className="flex gap-2 mt-4">
  <button onClick={() => onAccept(item.id)} className="flex-1 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 border border-green-500/40 text-green-400 rounded-lg">
    ✓ Accept
  </button>
  <button onClick={() => onReject(item.id)} className="flex-1 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-500/40 text-blue-400 rounded-lg">
    ↻ Reject
  </button>
  <button onClick={() => onDecline(item)} className="flex-1 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 text-red-400 rounded-lg">
    ✗ Decline
  </button>
</div>
```

---

## 📸 Phase 4: Analyze & Create Feature

### 4.1 Image Upload Component
**File**: `components/studio/ImageAnalyzer.tsx`
```tsx
function ImageAnalyzer({ onAnalysisComplete }) {
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  
  async function handleUpload(file: File) {
    setUploading(true);
    
    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('content-images')
      .upload(`${Date.now()}-${file.name}`, file);
    
    if (data) {
      const url = supabase.storage.from('content-images').getPublicUrl(data.path).data.publicUrl;
      setImageUrl(url);
      await analyzeImage(url);
    }
    
    setUploading(false);
  }
  
  async function analyzeImage(url: string) {
    setAnalyzing(true);
    
    const res = await fetch('/api/analyze-image', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ imageUrl: url })
    });
    
    const data = await res.json();
    onAnalysisComplete(data);
    setAnalyzing(false);
  }
  
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-white mb-4">Analyze & Create</h3>
      <p className="text-white/70 text-sm mb-4">Upload an image or reel, and TARA will analyze it and create captions for all platforms.</p>
      
      <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center">
        {imageUrl ? (
          <img src={imageUrl} alt="Uploaded" className="max-h-64 mx-auto rounded-lg mb-4" />
        ) : (
          <div className="text-white/50 mb-4">Drop image here or click to upload</div>
        )}
        
        <input
          type="file"
          accept="image/*,video/*"
          onChange={(e) => e.target.files?.[0] && handleUpload(e.target.files[0])}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload" className="px-6 py-3 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-lg cursor-pointer inline-block">
          {uploading ? 'Uploading...' : analyzing ? 'Analyzing...' : 'Choose Image'}
        </label>
      </div>
    </div>
  );
}
```

### 4.2 Image Analysis API
**File**: `/api/analyze-image/route.ts`
```typescript
export async function POST(req: Request) {
  const { imageUrl } = await req.json();
  
  // Get studio context for emotional state
  const context = await getStudioContext();
  
  // Use Google Vision API or OpenAI Vision to analyze image
  const analysisPrompt = `
    Analyze this image and provide:
    1. Main subject/theme
    2. Mood/atmosphere
    3. Colors and visual elements
    4. Suggested caption themes
    
    Current emotional state: ${JSON.stringify(context.emotional_state.primary_emotions)}
    Current mood: ${JSON.stringify(context.emotional_state.mood)}
    Weather: ${context.weather.condition}
  `;
  
  const analysis = await analyzeImageWithAI(imageUrl, analysisPrompt);
  
  // Generate captions for all platforms
  const captions = await generateMultiPlatformCaptions(analysis, context);
  
  // Generate AI image prompt
  const imagePrompt = await generateImagePrompt(analysis, captions);
  
  return NextResponse.json({
    success: true,
    analysis,
    captions,
    imagePrompt
  });
}
```

### 4.3 Multi-Platform Caption Generator
```typescript
async function generateMultiPlatformCaptions(analysis: any, context: StudioContext) {
  const platforms = ['instagram', 'twitter', 'linkedin'];
  const captions = {};
  
  for (const platform of platforms) {
    const prompt = `
      Based on this image analysis: ${JSON.stringify(analysis)}
      
      Generate a ${platform} caption that:
      - Matches TARA's current mood: ${context.emotional_state.mood}
      - Reflects her emotional state: ${JSON.stringify(context.emotional_state.primary_emotions)}
      - Considers the weather: ${context.weather.condition}
      - Platform-specific best practices for ${platform}
      
      ${platform === 'instagram' ? 'Include 5-10 relevant hashtags' : ''}
      ${platform === 'twitter' ? 'Keep under 280 characters' : ''}
      ${platform === 'linkedin' ? 'Professional tone, thought-provoking' : ''}
    `;
    
    captions[platform] = await generateWithAI(prompt);
  }
  
  return captions;
}
```

### 4.4 AI Image Prompt Generator
```typescript
async function generateImagePrompt(analysis: any, captions: any) {
  const prompt = `
    Based on this image analysis: ${JSON.stringify(analysis)}
    And these captions: ${JSON.stringify(captions)}
    
    Generate a detailed prompt for an AI image generator (like Midjourney, DALL-E, or Stable Diffusion) that would create a cinematic, high-quality image matching the theme.
    
    Include:
    - Main subject and composition
    - Lighting and atmosphere
    - Color palette
    - Style and mood
    - Technical details (camera angle, depth of field, etc.)
    
    Format as a single, detailed prompt ready to paste into an AI image generator.
  `;
  
  return await generateWithAI(prompt);
}
```

### 4.5 Analysis Results Display
**Component**: `AnalysisResults.tsx`
```tsx
function AnalysisResults({ analysis, captions, imagePrompt }) {
  return (
    <div className="space-y-4">
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Image Analysis</h3>
        <div className="text-white/80 space-y-2">
          <p><strong>Theme:</strong> {analysis.theme}</p>
          <p><strong>Mood:</strong> {analysis.mood}</p>
          <p><strong>Colors:</strong> {analysis.colors.join(', ')}</p>
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Generated Captions</h3>
        <div className="space-y-4">
          {Object.entries(captions).map(([platform, caption]) => (
            <div key={platform} className="border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium capitalize">{platform}</span>
                <button className="text-xs text-yellow-400 hover:text-yellow-300">Copy</button>
              </div>
              <p className="text-white/80 text-sm">{caption}</p>
            </div>
          ))}
        </div>
      </div>
      
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">AI Image Prompt</h3>
        <p className="text-white/70 text-sm mb-2">Use this prompt with Midjourney, DALL-E, or Stable Diffusion:</p>
        <div className="bg-black/40 border border-white/10 rounded-lg p-4">
          <p className="text-white/90 text-sm font-mono">{imagePrompt}</p>
        </div>
        <button className="mt-3 px-4 py-2 bg-yellow-500/80 hover:bg-yellow-500 text-white rounded-lg text-sm">Copy Prompt</button>
      </div>
    </div>
  );
}
```

---

## 🎨 Phase 5: Visual Upgrades

### 5.1 Replace Background Animation
Update to be implemented with Three.js animation code

### 5.2 Add Fancy Buttons
Update to be implemented with provided fancy button code

### 5.3 Add Liquid Button
Update to be implemented with provided liquid button code

### 5.4 Update Button Usage
Replace all action buttons with fancy buttons:
```tsx
import FancyButton from './FancyButton';

<FancyButton
  icon={<Check className="w-5 h-5" />}
  variant="green"
  onClick={() => onAccept(item.id)}
  ariaLabel="Accept content"
/>

<FancyButton
  icon={<RefreshCw className="w-5 h-5" />}
  variant="indigo"
  onClick={() => onReject(item.id)}
  ariaLabel="Reject and regenerate"
/>

<FancyButton
  icon={<Trash2 className="w-5 h-5" />}
  variant="red"
  onClick={() => onDecline(item)}
  ariaLabel="Decline and provide custom"
/>
```

---

## 📋 Implementation Checklist

### Phase 1: Critical Fixes
- [ ] Debug and fix carousel generation
- [ ] Debug and fix chat functionality
- [ ] Add back button to hero page
- [ ] Add error logging throughout

### Phase 2: Memory System
- [ ] Create `content_memory` table
- [ ] Implement `/api/memory/store` route
- [ ] Implement `/api/memory/retrieve` route
- [ ] Update all action handlers to store in memory
- [ ] Add memory retrieval UI

### Phase 3: Enhanced Feedback
- [ ] Create `DeclineModal` component
- [ ] Update `ContentStreamCard` with 3 buttons
- [ ] Implement Accept handler (store in memory)
- [ ] Implement Reject handler (regenerate)
- [ ] Implement Decline handler (open modal)
- [ ] Update emotional state based on feedback type

### Phase 4: Analyze & Create
- [ ] Set up Supabase Storage bucket for images
- [ ] Create `ImageAnalyzer` component
- [ ] Implement `/api/analyze-image` route
- [ ] Integrate Google Vision or OpenAI Vision API
- [ ] Implement multi-platform caption generation
- [ ] Implement AI image prompt generation
- [ ] Create `AnalysisResults` component
- [ ] Add copy-to-clipboard functionality

### Phase 5: Visual Upgrades
- [ ] Add `AiHeroBackground` component
- [ ] Add `FancyButton` component
- [ ] Add `LiquidButton` component
- [ ] Replace all buttons with fancy variants
- [ ] Update Studio page to use new background
- [ ] Test animations on mobile

---

## 🚀 Deployment Steps

1. **Database Migration**: Run SQL to create `content_memory` table
2. **Environment Variables**: Add image analysis API keys
3. **Supabase Storage**: Create `content-images` bucket
4. **Deploy Edge Functions**: Update and deploy all functions
5. **Test All Features**: Run through complete workflow
6. **Monitor Performance**: Check animation performance on mobile

---

## 🎯 Success Metrics

- [ ] Carousel generation works 100% of the time
- [ ] Chat responds within 2 seconds
- [ ] All content stored in Supabase memory
- [ ] Image analysis completes in < 10 seconds
- [ ] Multi-platform captions generated simultaneously
- [ ] AI image prompts are detailed and usable
- [ ] Animations run at 60fps on desktop
- [ ] All buttons have smooth hover effects
- [ ] Memory retrieval shows past content
- [ ] TARA learns from declined content

---

## 📚 API Documentation

All new APIs will be documented in `docs/API_REFERENCE.md` with:
- Endpoint URLs
- Request/response formats
- Authentication requirements
- Example usage
- Error codes

---

## 🔒 Security Considerations

- Image uploads limited to 10MB
- File type validation (images/videos only)
- Rate limiting on analysis API
- Sanitize user input in decline modal
- Secure Supabase RLS policies for memory table

---

This upgrade transforms TARA's Studio into a **complete creative AI system** with memory, multi-platform generation, and visual content analysis.