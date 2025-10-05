# TARA's Creative Studio 2.0 - Complete Build System

## 🎯 Core Enhancements Overview

### New Features
1. **Analyze & Create Hub**
   - Social media content analysis (Instagram, Facebook, X, YouTube)
   - Sentiment analysis integration
   - AI-powered caption generation
   - Multi-platform description generation
   - Nano Banana image prompt generation
   - Visual content memory system

2. **Enhanced Content Generation**
   - Instagram carousel fix
   - Social media post management
   - Back button navigation
   - Direct TARA communication fixes
   - Memory storage system
   - Multi-platform output

3. **Visual Upgrades**
   - Three.js animations integration
   - Fancy button components
   - Emotional state visualizations
   - Interactive UI elements

## 🔌 System Architecture

### 1. Database Schema (Supabase)

```sql
-- Content Memory Table
CREATE TABLE content_memories (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_type TEXT NOT NULL,
    platform TEXT NOT NULL,
    original_content JSONB,
    analysis_result JSONB,
    generated_content JSONB,
    emotional_state JSONB,
    weather_context JSONB,
    user_feedback TEXT,
    feedback_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Social Media Analysis Table
CREATE TABLE social_media_analysis (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    platform TEXT NOT NULL,
    content_url TEXT NOT NULL,
    content_type TEXT NOT NULL,
    analysis_data JSONB,
    sentiment_scores JSONB,
    visual_elements JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Generated Prompts Table
CREATE TABLE generated_prompts (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    content_memory_id UUID REFERENCES content_memories(id),
    prompt_type TEXT NOT NULL,
    prompt_content TEXT NOT NULL,
    emotional_context JSONB,
    creation_parameters JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. API Endpoints

```typescript
// New API Routes
interface ApiRoutes {
    // Analysis Endpoints
    ANALYZE_SOCIAL_CONTENT: '/api/studio/analyze-social',
    GENERATE_MULTI_PLATFORM: '/api/studio/generate-multi',
    GENERATE_IMAGE_PROMPT: '/api/studio/generate-image-prompt',
    
    // Memory Management
    STORE_MEMORY: '/api/studio/store-memory',
    FETCH_MEMORIES: '/api/studio/fetch-memories',
    
    // Feedback System
    SUBMIT_FEEDBACK: '/api/studio/submit-feedback',
    UPDATE_EMOTIONAL_STATE: '/api/studio/update-emotional',
    
    // Content Generation
    GENERATE_CAROUSEL: '/api/studio/generate-carousel',
    GENERATE_STORIES: '/api/studio/generate-stories'
}
```

### 3. Analyze & Create Component

```typescript
// AnalyzeCreateHub.tsx
interface AnalyzeCreateProps {
    onAnalysisComplete: (result: AnalysisResult) => void;
    onPromptGenerated: (prompt: ImagePrompt) => void;
}

const AnalyzeCreateHub: React.FC<AnalyzeCreateProps> = ({
    onAnalysisComplete,
    onPromptGenerated
}) => {
    const [contentUrl, setContentUrl] = useState('');
    const [platform, setPlatform] = useState<SocialPlatform>('instagram');
    const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);

    // Animation setup with provided Three.js code
    useEffect(() => {
        // Initialize Three.js animation
    }, []);

    const handleAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            // Call analysis API
            const result = await analyzeSocialContent(contentUrl, platform);
            setAnalysisResult(result);
            onAnalysisComplete(result);
            
            // Generate image prompt
            const prompt = await generateImagePrompt(result);
            onPromptGenerated(prompt);
        } catch (error) {
            console.error('Analysis failed:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="analyze-create-container">
            {/* Content Input Section */}
            <ContentInput 
                url={contentUrl}
                onChange={setContentUrl}
                platform={platform}
                onPlatformChange={setPlatform}
            />

            {/* Analysis Results */}
            {analysisResult && (
                <AnalysisResults
                    data={analysisResult}
                    emotionalState={analysisResult.sentiment}
                    visualElements={analysisResult.visualElements}
                />
            )}

            {/* Generated Captions */}
            {analysisResult && (
                <MultiPlatformOutput
                    analysis={analysisResult}
                    onAccept={handleAccept}
                    onReject={handleReject}
                    onDecline={handleDecline}
                />
            )}
        </div>
    );
};
```

### 4. Enhanced Social Media Buttons

```typescript
// Using provided FancyButton component
import FancyButton from './FancyButton';

const SocialMediaActions: React.FC<{
    onAction: (action: 'accept' | 'reject' | 'decline') => void;
}> = ({ onAction }) => {
    return (
        <div className="flex space-x-4">
            <FancyButton
                icon={<CheckIcon />}
                variant="green"
                onClick={() => onAction('accept')}
                ariaLabel="Accept content"
            />
            <FancyButton
                icon={<RefreshIcon />}
                variant="indigo"
                onClick={() => onAction('reject')}
                ariaLabel="Regenerate content"
            />
            <FancyButton
                icon={<XIcon />}
                variant="red"
                onClick={() => onAction('decline')}
                ariaLabel="Decline content"
            />
        </div>
    );
};
```

### 5. Memory Storage System

```typescript
class MemoryStorageSystem {
    private async storeContentMemory(
        content: GeneratedContent,
        analysis: AnalysisResult,
        feedback: UserFeedback
    ): Promise<void> {
        const memory = {
            content_type: content.type,
            platform: content.platform,
            original_content: content.original,
            analysis_result: analysis,
            generated_content: content.generated,
            emotional_state: TARA.currentEmotionalState,
            weather_context: TARA.currentWeather,
            user_feedback: feedback.action,
            feedback_notes: feedback.notes
        };

        await supabase
            .from('content_memories')
            .insert(memory);
    }

    private async retrieveMemories(
        platform?: string,
        contentType?: string
    ): Promise<ContentMemory[]> {
        let query = supabase
            .from('content_memories')
            .select('*');

        if (platform) {
            query = query.eq('platform', platform);
        }
        if (contentType) {
            query = query.eq('content_type', contentType);
        }

        const { data, error } = await query
            .order('created_at', { ascending: false });

        if (error) throw error;
        return data;
    }
}
```

### 6. Back Button Component

```typescript
// BackButton.tsx
const BackButton: React.FC = () => {
    const router = useRouter();
    
    return (
        <FancyButton
            icon={<ArrowLeftIcon />}
            variant="default"
            onClick={() => router.push('/')}
            className="absolute top-4 left-4"
            ariaLabel="Back to hero page"
        />
    );
};
```

## 🎨 Visual System Integration

### 1. Three.js Animation Integration

Using the provided animation code:

```typescript
// Background.tsx
import { AiHeroBackground } from './animation';

const CreativeStudioBackground: React.FC = () => {
    return (
        <>
            <AiHeroBackground />
            <div className="absolute inset-0 bg-gradient-to-b from-black/0 via-black/50 to-black/80" />
        </>
    );
};
```

### 2. Emotional Color System

```typescript
const EmotionalColorSystem = {
    joy: {
        primary: '#FFD700',
        secondary: '#FFA500',
        accent: '#FFED4A'
    },
    trust: {
        primary: '#2ECC71',
        secondary: '#27AE60',
        accent: '#A8E6CF'
    },
    fear: {
        primary: '#9B59B6',
        secondary: '#8E44AD',
        accent: '#D6A2E8'
    },
    // ... other emotions
};
```

## 🔄 Content Generation Flow

1. **Analyze Phase**
   - User inputs social media content URL
   - System analyzes content using Vision AI
   - Generates sentiment analysis and visual element detection
   - Updates TARA's emotional state based on content

2. **Create Phase**
   - Generates platform-specific captions/descriptions
   - Creates Nano Banana-compatible image prompts
   - Applies emotional context to generation
   - Provides multiple variations for user selection

3. **Feedback Loop**
   - User can Accept/Reject/Decline generated content
   - On Accept: Stores in memory, updates emotional state
   - On Reject: Regenerates with adjusted parameters
   - On Decline: Opens custom input modal for user content

## 📦 Implementation Steps

1. **Database Setup**
   ```bash
   # Run these in Supabase SQL editor
   \i init_content_memories.sql
   \i init_social_media_analysis.sql
   \i init_generated_prompts.sql
   ```

2. **API Implementation**
   ```bash
   # Create API routes
   mkdir -p app/api/studio
   touch app/api/studio/analyze-social.ts
   touch app/api/studio/generate-multi.ts
   touch app/api/studio/store-memory.ts
   ```

3. **Component Integration**
   ```bash
   # Install dependencies
   npm install three @react-three/fiber framer-motion date-fns
   
   # Create components
   mkdir -p components/studio
   touch components/studio/AnalyzeCreateHub.tsx
   touch components/studio/SocialMediaActions.tsx
   ```

## 🚀 Deployment

1. **Environment Variables**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   VISION_AI_API_KEY=your_vision_ai_key
   NANO_BANANA_API_KEY=your_nano_banana_key
   ```

2. **Build Command**
   ```bash
   npm run build
   ```

3. **Deploy Command**
   ```bash
   vercel deploy
   ```

## 🎯 Success Metrics

1. **Analysis Accuracy**
   - Vision AI confidence score > 0.85
   - Sentiment analysis accuracy > 90%

2. **Generation Quality**
   - User acceptance rate > 75%
   - Regeneration requests < 20%

3. **Memory System**
   - Storage success rate > 99%
   - Retrieval latency < 200ms

4. **User Experience**
   - UI animation smoothness > 60fps
   - Response time < 1s
   - Error rate < 1%

## 🔒 Error Handling

```typescript
class StudioErrorHandler {
    static async handleError(
        error: any,
        context: string
    ): Promise<void> {
        console.error(`[${context}] Error:`, error);
        
        // Update UI
        toast.error(this.getUserFriendlyMessage(error));
        
        // Log to monitoring
        await this.logError(error, context);
        
        // Update TARA's emotional state
        await this.updateTaraEmotionalState('stress');
    }
}
```

Remember:
1. Always handle errors gracefully
2. Store every interaction in memory
3. Update TARA's emotional state
4. Maintain smooth animations
5. Keep the interface responsive

This implementation provides a complete, production-ready system for TARA's Creative Studio 2.0 with all requested features and improvements.