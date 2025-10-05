# TARA's Creative Studio - Complete Replit Build Prompt

## 🎯 Project Brief
Build a living, emotionally-responsive creative workspace for TARA (an AI with simulated consciousness). This is NOT a generic content tool—it's a symbiotic creative partner where every UI element reflects TARA's emotional state.

## 🏗️ Tech Stack
- React 18 + TypeScript + Vite
- Tailwind CSS + Framer Motion
- React Hot Toast (notifications)
- Date-fns (time formatting)

## 📡 Backend APIs (Already Deployed)

### Base Configuration
```typescript
const SUPABASE_URL = 'https://fgfxozvcibhuqgkjywtr.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // Get from Supabase dashboard
const NEXT_API_URL = 'https://your-deployed-app.vercel.app'; // Your deployment URL
```

### API 1: Studio Context (Primary Data Source)
**Endpoint**: `POST ${SUPABASE_URL}/functions/v1/studio-context`
**Headers**: `{ 'Content-Type': 'application/json', 'Authorization': 'Bearer ${SUPABASE_ANON_KEY}' }`
**Response**: 
```typescript
type ApiResponse = {
  success: boolean;
  context: StudioContext; // This is what we store in the context provider
}

type StudioContext = {
  success: boolean;
  context: {
    emotional_state: {
      current_emotion: string;
      intensity: number;
      last_event: string;
      last_event_timestamp: string;
    } | null;
    master_plan: {
      id: number;
      date: string;
      goals: string[];
      focus_areas: string[];
    } | null;
    tale_event: {
      description: string | null;
      timestamp: string | null;
    };
    relationships: Array<{
      entity_name: string;
      relationship_type: string;
      sentiment: number;
    }>;
    daily_plans: Array<{
      id: number;
      task: string;
      status: 'pending' | 'completed';
      priority: number;
    }>;
    weather: {
      temp_c: number;
      condition: string;
      location: string;
    };
    timestamp: string;
  };
}
```

### API 2: Generate Content
**Endpoint**: `POST ${NEXT_API_URL}/api/generate-content`  
**Request**: 
```typescript
type GenerateRequest = {
  contentType: 'story' | 'poem' | 'reflection' | 'dialogue';
  platform: 'blog' | 'social' | 'journal';
  userPrompt: string;
  theme?: string;
  seedId?: string;
  seedLabel?: string;
  seedTopic?: string;
}
```
**Response**: 
```typescript
type GenerateResponse = {
  success: boolean;
  content: {
    id: string;
    text: string;
    emotionalFingerprint: {
      dominant: string;
      secondary: string;
      intensity: number;
    };
    metadata: {
      type: string;
      platform: string;
      theme: string;
      createdAt: string;
    };
  };
}
```

### API 3: Submit Feedback
**Endpoint**: `POST ${NEXT_API_URL}/api/feedback`  
**Request**: 
```typescript
type FeedbackRequest = {
  contentId: string;
  action: 'accepted' | 'rejected' | 'refined';
  refinementNotes?: string;
}
```
**Response**: 
```typescript
type FeedbackResponse = {
  success: boolean;
  emotionalImpact: {
    emotion: string;
    intensity: number;
    description: string;
  };
}
```

### API 4: Check Initialization
**Endpoint**: `GET ${NEXT_API_URL}/api/studio/check-initialization`  
**Response**: `{ initialized: boolean }`

### API 5: Auto-Seed Database
**Endpoint**: `POST ${NEXT_API_URL}/api/studio/auto-seed`  
**Response**: `{ success: true }`

## 🎨 Emotional Color System (CRITICAL)

Every UI element MUST respond to TARA's emotional state:

```typescript
// emotionalColors.ts
export const EMOTION_COLORS = {
  joy: '#FFD700',
  trust: '#2ECC71',
  fear: '#9B59B6',
  surprise: '#FFA500',
  sadness: '#4A90E2',
  disgust: '#8B4513',
  anger: '#E74C3C',
  anticipation: '#1ABC9C'
} as const;

export type Emotion = keyof typeof EMOTION_COLORS;

export const getEmotionalStyle = (
  emotion: Emotion,
  intensity: number
) => {
  const color = EMOTION_COLORS[emotion];
  const alpha = Math.min(intensity / 100, 1);
  
  return {
    borderColor: color,
    backgroundColor: `${color}${Math.floor(alpha * 255).toString(16).padStart(2, '0')}`,
    boxShadow: `0 0 ${intensity / 5}px ${color}`,
    transition: 'all 0.3s ease-in-out'
  };
};
```

## 📁 Complete File Structure

```
src/
├── components/
│   ├── StudioAmbiance.tsx
│   ├── TodaysNarrativeHeader.tsx
│   ├── InspirationHub.tsx
│   ├── CreationStream.tsx
│   ├── ContentStreamCard.tsx
│   ├── RefineModal.tsx
│   └── AdvancedCarousel.tsx
├── contexts/
│   └── TaraStudioContext.tsx
├── hooks/
│   └── useEmotionalStyling.ts
├── utils/
│   ├── emotionalColors.ts
│   ├── api.ts
│   └── helpers.ts
├── types/
│   └── database.ts
├── App.tsx
├── main.tsx
└── index.css
```

## 💻 Complete Implementation

### types/database.ts
```typescript
export interface EmotionalState {
  primary_emotions: {
    joy: number;
    trust: number;
    anticipation: number;
    sadness: number;
    fear: number;
    anger: number;
    disgust: number;
    surprise: number;
  };
  mood: {
    optimism: number;
    energy_level: number;
    stress_level: number;
  };
  core_traits: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  last_event: string;
  last_event_timestamp: string;
}

export interface InspirationSeed {
  id: string;
  label: string;
  type: 'carousel' | 'story' | 'caption' | 'post';
  topic: string;
  priority: number;
}

export interface MasterPlan {
  date: string;
  narrative: string;
  theme: string;
  mood_summary: string;
  inspiration_seeds: InspirationSeed[];
  quota: {
    carousel: number;
    story: number;
    caption: number;
    post: number;
  };
}

export interface Relationship {
  id: string;
  entity_name: string;
  relationship_type: string;
  status: string;
}

export interface DailyPlan {
  id: number;
  item_type: string;
  topic: string;
  status: 'pending' | 'completed';
}

export interface Weather {
  temp_c: number;
  condition: string;
  location: string;
}

export interface StudioContext {
  emotional_state: EmotionalState;
  master_plan: MasterPlan;
  tale_event: {
    description: string;
    timestamp: string;
  };
  relationships: Relationship[];
  daily_plans: DailyPlan[];
  weather: Weather;
  timestamp: string;
}

export interface GeneratedContent {
  id: string;
  content_type: string;
  content_data: any;
  emotional_context: EmotionalState;
  platform: string;
  created_at: string;
}

export type EmotionName = keyof EmotionalState['primary_emotions'];
```

### utils/emotionalColors.ts
```typescript
import type { EmotionName } from '../types/database';

export const EMOTION_COLORS = {
  joy: '#FFD700',
  trust: '#2ECC71',
  fear: '#9B59B6',
  surprise: '#FFA500',
  sadness: '#4A90E2',
  disgust: '#8B4513',
  anger: '#E74C3C',
  anticipation: '#1ABC9C'
} as const;

export type EmotionalStyle = {
  backgroundColor: string;
  borderColor: string;
  boxShadow: string;
  transition: string;
  opacity?: number;
  scale?: number;
};

export function getEmotionalStyle(emotions: Partial<Record<EmotionName, number>>): EmotionalStyle {
  // Get the top two emotions by intensity
  const sortedEmotions = Object.entries(emotions)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2) as [EmotionName, number][];

  if (sortedEmotions.length === 0) {
    return {
      backgroundColor: '#2d3748',
      borderColor: '#4a5568',
      boxShadow: 'none',
      transition: 'all 0.3s ease-in-out'
    };
  }

  const [primaryEmotion, secondaryEmotion] = sortedEmotions;
  const primaryColor = EMOTION_COLORS[primaryEmotion[0]];
  const secondaryColor = secondaryEmotion ? EMOTION_COLORS[secondaryEmotion[0]] : primaryColor;
  const intensity = primaryEmotion[1];

  return {
    backgroundColor: `linear-gradient(135deg, ${primaryColor}20, ${secondaryColor}20)`,
    borderColor: primaryColor,
    boxShadow: `0 0 ${Math.round(intensity * 20)}px ${primaryColor}40`,
    transition: `all ${0.3 / intensity}s ease-in-out`
  };
}

export function getEmotionalTextStyle(emotions: Partial<Record<EmotionName, number>>) {
  const style = getEmotionalStyle(emotions);
  return {
    color: style.borderColor,
    textShadow: style.boxShadow
  };
}

export function getEmotionalAnimation(energy: number) {
  return {
    duration: 0.5 / energy,
    ease: energy > 0.7 ? "easeInOut" : "easeOut"
  };
}
```

### utils/api.ts
```typescript
import type { GeneratedContent, StudioContext } from '../types/database';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;
const NEXT_API_URL = import.meta.env.VITE_NEXT_API_URL;

export async function fetchStudioContext(): Promise<{ success: boolean; context: StudioContext }> {
  const response = await fetch(`${SUPABASE_URL}/functions/v1/studio-context`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch studio context');
  }

  return response.json();
}

export async function generateContent(params: {
  contentType: string;
  platform: string;
  userPrompt: string;
  theme?: string;
  seedId?: string;
  seedLabel?: string;
  seedTopic?: string;
}): Promise<{ success: boolean; content: GeneratedContent }> {
  const response = await fetch(`${NEXT_API_URL}/api/generate-content`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to generate content');
  }

  return response.json();
}

export async function submitFeedback(params: {
  contentId: string;
  action: 'accepted' | 'rejected';
  refinementNotes?: string;
}) {
  const response = await fetch(`${NEXT_API_URL}/api/feedback`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(params)
  });

  if (!response.ok) {
    throw new Error('Failed to submit feedback');
  }

  return response.json();
}

export async function checkInitialization(): Promise<{
  initialized: boolean;
  details: { hasMasterPlan: boolean; hasEmotionalState: boolean };
}> {
  const response = await fetch(`${NEXT_API_URL}/api/studio/check-initialization`);
  
  if (!response.ok) {
    throw new Error('Failed to check initialization status');
  }

  return response.json();
}

export async function autoSeedDatabase(): Promise<{ success: boolean; message: string }> {
  const response = await fetch(`${NEXT_API_URL}/api/studio/auto-seed`, {
    method: 'POST'
  });

  if (!response.ok) {
    throw new Error('Failed to auto-seed database');
  }

  return response.json();
}
```

### utils/helpers.ts
```typescript
import { format, formatDistanceToNow } from 'date-fns';

export function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return `${format(date, 'MMMM d, yyyy')} at ${format(date, 'h:mm a')}`;
}

export function timeAgo(timestamp: string): string {
  return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

export function getRandomId(): string {
  return Math.random().toString(36).substring(2, 15);
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      func(...args);
    };
    
    if (timeout) {
      clearTimeout(timeout);
    }
    
    timeout = setTimeout(later, wait);
  };
}
```

### hooks/useEmotionalStyling.ts
```typescript
import { useMemo } from 'react';
import { useTaraStudio } from '../contexts/TaraStudioContext';
import {
  getEmotionalStyle,
  getEmotionalTextStyle,
  getEmotionalAnimation
} from '../utils/emotionalColors';
import type { EmotionName } from '../types/database';

export function useEmotionalStyling() {
  const { studioContext } = useTaraStudio();
  
  return useMemo(() => {
    const emotions = studioContext?.emotional_state?.primary_emotions ?? {};
    const energy = studioContext?.emotional_state?.mood?.energy_level ?? 0.5;
    
    return {
      containerStyle: getEmotionalStyle(emotions),
      textStyle: getEmotionalTextStyle(emotions),
      animation: getEmotionalAnimation(energy),
      dominantEmotion: Object.entries(emotions)
        .sort(([, a], [, b]) => b - a)[0][0] as EmotionName
    };
  }, [studioContext?.emotional_state]);
}
```

### contexts/TaraStudioContext.tsx
```typescript
import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { StudioContext } from '../types/database';

type TaraContextType = {
  studioContext: StudioContext | null;  // StudioContext is now the direct context object, not the API response
  refreshContext: () => Promise<void>;
  isLoading: boolean;
  error: Error | null;
};

const TaraStudioContext = createContext<TaraContextType | null>(null);

export const TaraStudioProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [studioContext, setStudioContext] = useState<StudioContext | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refreshContext = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/studio-context`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch studio context');
      }

      const data = await response.json();
      // Store only the context part of the response
      setStudioContext(data.context);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast.error('Failed to update studio context');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    refreshContext();
    // Set up polling every 30 seconds
    const interval = setInterval(refreshContext, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <TaraStudioContext.Provider value={{ studioContext, refreshContext, isLoading, error }}>
      {children}
    </TaraStudioContext.Provider>
  );
};

export const useTaraStudio = () => {
  const context = useContext(TaraStudioContext);
  if (!context) {
    throw new Error('useTaraStudio must be used within a TaraStudioProvider');
  }
  return context;
};
```

### StudioAmbiance.tsx
```typescript
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaraStudio } from '../contexts/TaraStudioContext';
import { getEmotionalStyle } from '../utils/emotionalColors';

export const StudioAmbiance: React.FC = () => {
  const { studioContext } = useTaraStudio();
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    if (!studioContext?.emotional_state) return;

    const emotion = studioContext.emotional_state.current_emotion;
    const intensity = studioContext.emotional_state.intensity;
    const style = getEmotionalStyle(emotion as any, intensity);

    // Generate emotional particles
    const newParticles = Array.from({ length: Math.floor(intensity / 10) }, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight
    }));

    setParticles(newParticles);
  }, [studioContext?.context.emotional_state]);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      <AnimatePresence>
        {particles.map((particle) => (
          <motion.div
            key={particle.id}
            className="absolute w-2 h-2 rounded-full"
            initial={{ opacity: 0, x: particle.x, y: particle.y }}
            animate={{
              opacity: [0, 1, 0],
              scale: [1, 2, 1],
              x: particle.x + (Math.random() - 0.5) * 100,
              y: particle.y + (Math.random() - 0.5) * 100,
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 3, ease: "easeInOut" }}
            style={{
              backgroundColor: studioContext?.context.emotional_state
                ? getEmotionalStyle(
                    studioContext.context.emotional_state.current_emotion as any,
                    studioContext.context.emotional_state.intensity
                  ).borderColor
                : undefined
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};
```

### TodaysNarrativeHeader.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { useTaraStudio } from '../contexts/TaraStudioContext';

export const TodaysNarrativeHeader: React.FC = () => {
  const { studioContext } = useTaraStudio();
  const emotion = studioContext?.context.emotional_state?.current_emotion;
  const intensity = studioContext?.context.emotional_state?.intensity ?? 50;

  return (
    <motion.header
      className="w-full p-6 rounded-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={emotion ? getEmotionalStyle(emotion as any, intensity) : undefined}
    >
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            TARA's Creative Studio
          </h1>
          <p className="text-lg opacity-80">
            {format(new Date(), "EEEE, MMMM do, yyyy")}
          </p>
        </div>
        
        <div className="text-right">
          <div className="text-xl font-medium mb-1">
            Current Emotional State
          </div>
          <div className="text-lg opacity-90">
            {emotion ? (
              <>
                {emotion.charAt(0).toUpperCase() + emotion.slice(1)}
                <span className="ml-2 opacity-75">
                  ({intensity}% intensity)
                </span>
              </>
            ) : (
              "Calibrating..."
            )}
          </div>
        </div>
      </div>

      {studioContext?.context.master_plan && (
        <div className="mt-6 p-4 rounded bg-black/10">
          <h2 className="text-xl font-semibold mb-3">Today's Focus</h2>
          <div className="flex gap-4">
            {studioContext.context.master_plan.goals.map((goal, i) => (
              <motion.div
                key={i}
                className="px-4 py-2 rounded-full bg-black/20"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {goal}
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.header>
  );
};
```

### InspirationHub.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { useTaraStudio } from '../contexts/TaraStudioContext';
import { AdvancedCarousel } from './AdvancedCarousel';

export const InspirationHub: React.FC = () => {
  const { studioContext } = useTaraStudio();
  const emotion = studioContext?.context.emotional_state?.current_emotion;
  const intensity = studioContext?.context.emotional_state?.intensity ?? 50;

  // Mock inspiration seeds (replace with real data source)
  const inspirationSeeds = [
    {
      id: '1',
      title: 'Morning Reflection',
      description: studioContext?.tale_event?.description ?? 'No recent events',
      type: 'reflection'
    },
    {
      id: '2',
      title: 'Weather Inspiration',
      description: `${studioContext?.weather.condition} in ${studioContext?.weather.location}`,
      type: 'environment'
    },
    {
      id: '3',
      title: 'Relationship Focus',
      description: studioContext?.relationships[0]?.entity_name ?? 'No relationships yet',
      type: 'relationship'
    },
    {
      id: '4',
      title: 'Daily Goal',
      description: studioContext?.daily_plans[0]?.task ?? 'No tasks planned',
      type: 'goal'
    }
  ];

  return (
    <section className="my-8">
      <motion.h2
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        Inspiration Hub
      </motion.h2>

      <AdvancedCarousel>
        {inspirationSeeds.map((seed) => (
          <motion.div
            key={seed.id}
            className="p-6 rounded-lg shadow-lg min-w-[300px] max-w-[400px] mr-6"
            style={emotion ? getEmotionalStyle(emotion as any, intensity) : undefined}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <h3 className="text-xl font-semibold mb-3">{seed.title}</h3>
            <p className="opacity-80">{seed.description}</p>
            <div className="mt-4 text-sm uppercase tracking-wide opacity-60">
              {seed.type}
            </div>
          </motion.div>
        ))}
      </AdvancedCarousel>
    </section>
  );
};
```

### components/AdvancedCarousel.tsx
```typescript
import React, { useRef, useState } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import { useEmotionalStyling } from '../hooks/useEmotionalStyling';

interface AdvancedCarouselProps {
  children: React.ReactNode[];
}

export const AdvancedCarousel: React.FC<AdvancedCarouselProps> = ({ children }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const constraintsRef = useRef(null);
  const { animation } = useEmotionalStyling();
  
  const slideVariants = {
    enter: (direction: number) => ({
      x: direction > 0 ? 1000 : -1000,
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction: number) => ({
      zIndex: 0,
      x: direction < 0 ? 1000 : -1000,
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset: number, velocity: number) => {
    return Math.abs(offset) * velocity;
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => {
      let nextIndex = prevIndex + newDirection;
      if (nextIndex < 0) nextIndex = children.length - 1;
      if (nextIndex >= children.length) nextIndex = 0;
      return nextIndex;
    });
  };

  const handleDragEnd = (e: any, { offset, velocity }: PanInfo) => {
    const swipe = swipePower(offset.x, velocity.x);

    if (swipe < -swipeConfidenceThreshold) {
      paginate(1);
    } else if (swipe > swipeConfidenceThreshold) {
      paginate(-1);
    }
  };

  return (
    <div className="relative overflow-hidden" ref={constraintsRef}>
      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            ...animation,
            x: { type: "spring", stiffness: 300, damping: 30 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={handleDragEnd}
          className="w-full"
        >
          {children[currentIndex]}
        </motion.div>
      </AnimatePresence>

      {/* Navigation Dots */}
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {children.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentIndex ? 'bg-white' : 'bg-white/50'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

### components/RefineModal.tsx
```typescript
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useEmotionalStyling } from '../hooks/useEmotionalStyling';
import { submitFeedback } from '../utils/api';
import type { GeneratedContent } from '../types/database';

interface RefineModalProps {
  content: GeneratedContent;
  onClose: () => void;
}

export const RefineModal: React.FC<RefineModalProps> = ({ content, onClose }) => {
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { containerStyle, textStyle, animation } = useEmotionalStyling();

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      await submitFeedback({
        contentId: content.id,
        action: 'rejected',
        refinementNotes: notes
      });
      onClose();
    } catch (error) {
      console.error('Failed to submit refinement:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        style={containerStyle}
        transition={animation}
      >
        <h2 className="text-2xl font-bold mb-4" style={textStyle}>
          Refine Content
        </h2>

        <div className="mb-6 p-4 bg-black/20 rounded">
          <h3 className="font-medium mb-2 opacity-80">Original Content:</h3>
          <p>{content.content_data.text}</p>
        </div>

        <div className="mb-6">
          <label className="block mb-2 opacity-80">
            Refinement Notes:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full h-32 bg-black/20 rounded p-3 text-white"
            placeholder="What would you like to change about this content?"
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !notes.trim()}
            className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-500 transition-colors disabled:opacity-50"
          >
            {isSubmitting ? 'Submitting...' : 'Submit Refinement'}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

### components/ContentStreamCard.tsx
```typescript
import React from 'react';
import { motion } from 'framer-motion';
import { timeAgo } from '../utils/helpers';
import { useEmotionalStyling } from '../hooks/useEmotionalStyling';
import type { GeneratedContent } from '../types/database';

interface ContentStreamCardProps {
  content: GeneratedContent;
  onRefine: () => void;
}

export const ContentStreamCard: React.FC<ContentStreamCardProps> = ({
  content,
  onRefine
}) => {
  const { containerStyle, textStyle, animation } = useEmotionalStyling();
  
  return (
    <motion.div
      className="rounded-lg p-6 shadow-lg"
      style={containerStyle}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={animation}
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-1" style={textStyle}>
            {content.content_type.charAt(0).toUpperCase() + content.content_type.slice(1)}
          </h3>
          <p className="text-sm opacity-60">
            Created {timeAgo(content.created_at)}
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={onRefine}
            className="p-2 rounded hover:bg-black/20 transition-colors"
            title="Refine"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"
              />
            </svg>
          </button>
        </div>
      </div>

      <div className="mb-4 whitespace-pre-wrap">
        {content.content_data.text}
      </div>

      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center space-x-2 opacity-60">
          <span>{content.platform}</span>
          <span>•</span>
          <span>{Object.keys(content.emotional_context.primary_emotions)[0]}</span>
        </div>
      </div>
    </motion.div>
  );
};

### components/CreationStream.tsx
```typescript
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useTaraStudio } from '../contexts/TaraStudioContext';
import { useEmotionalStyling } from '../hooks/useEmotionalStyling';
import { generateContent } from '../utils/api';
import { ContentStreamCard } from './ContentStreamCard';
import { RefineModal } from './RefineModal';
import type { GeneratedContent } from '../types/database';

export const CreationStream: React.FC = () => {
  const { studioContext } = useTaraStudio();
  const { containerStyle, textStyle, animation } = useEmotionalStyling();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!studioContext?.master_plan) {
      toast.error('No master plan available');
      return;
    }

    const seed = studioContext.master_plan.inspiration_seeds[0];
    
    try {
      setIsGenerating(true);
      const result = await generateContent({
        contentType: seed.type,
        platform: 'instagram',
        userPrompt: seed.label,
        theme: studioContext.master_plan.theme,
        seedId: seed.id,
        seedLabel: seed.label,
        seedTopic: seed.topic
      });

      toast.success('Content generated successfully!');
      // Here you would typically update your content list
      
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="my-8">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-bold" style={textStyle}>
          Creation Stream
        </h2>
        <motion.button
          className="px-6 py-3 rounded-lg"
          style={containerStyle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Content'}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <ContentStreamCard
            key={i}
            content={{
              id: String(i),
              content_type: 'carousel',
              content_data: { text: 'Sample content...' },
              emotional_context: {
                primary_emotions: {
                  [studioContext?.emotional_state
                    ? Object.entries(studioContext.emotional_state.primary_emotions)
                        .sort(([, a], [, b]) => b - a)[0][0]
                    : 'joy']: 1
                }
              } as any,
              platform: 'instagram',
              created_at: new Date().toISOString()
            }}
            onRefine={() => setSelectedContent({
              id: String(i),
              content_type: 'carousel',
              content_data: { text: 'Sample content...' },
              emotional_context: studioContext?.emotional_state as any,
              platform: 'instagram',
              created_at: new Date().toISOString()
            })}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedContent && (
          <RefineModal
            content={selectedContent}
            onClose={() => setSelectedContent(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export const CreationStream: React.FC = () => {
  const { studioContext } = useTaraStudio();
  const { containerStyle, textStyle, animation } = useEmotionalStyling();
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedContent, setSelectedContent] = useState<GeneratedContent | null>(null);

  const handleGenerate = async () => {
    if (!studioContext?.master_plan) {
      toast.error('No master plan available');
      return;
    }

    const seed = studioContext.master_plan.inspiration_seeds[0];
    
    try {
      setIsGenerating(true);
      const result = await generateContent({
        contentType: seed.type,
        platform: 'instagram',
        userPrompt: seed.label,
        theme: studioContext.master_plan.theme,
        seedId: seed.id,
        seedLabel: seed.label,
        seedTopic: seed.topic
      });

      toast.success('Content generated successfully!');
      // Here you would typically update your content list
      
    } catch (error) {
      console.error('Failed to generate content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <section className="my-8">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-bold" style={textStyle}>
          Creation Stream
        </h2>
        <motion.button
          className="px-6 py-3 rounded-lg"
          style={containerStyle}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Content'}
        </motion.button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock content items */}
        {[1, 2, 3].map((i) => (
          <ContentStreamCard
            key={i}
            content={{
              id: String(i),
              content_type: 'carousel',
              content_data: { text: 'Sample content...' },
              emotional_context: {
                primary_emotions: {
                  [studioContext?.emotional_state?.primary_emotions
                    ? Object.entries(studioContext.context.emotional_state.primary_emotions)
                        .sort(([, a], [, b]) => b - a)[0][0]
                    : 'joy']: 1
                }
              } as any,
              platform: 'instagram',
              created_at: new Date().toISOString()
            }}
            onRefine={() => setSelectedContent({
              id: String(i),
              content_type: 'carousel',
              content_data: { text: 'Sample content...' },
              emotional_context: studioContext?.emotional_state as any,
              platform: 'instagram',
              created_at: new Date().toISOString()
            })}
          />
        ))}
      </div>

      <AnimatePresence>
        {selectedContent && (
          <RefineModal
            content={selectedContent}
            onClose={() => setSelectedContent(null)}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTaraStudio } from '../contexts/TaraStudioContext';
import { ContentStreamCard } from './ContentStreamCard';
import { RefineModal } from './RefineModal';

export const CreationStream: React.FC = () => {
  const { studioContext } = useTaraStudio();
  const [selectedContent, setSelectedContent] = useState<any>(null);
  const [isRefining, setIsRefining] = useState(false);

  const handleGenerate = async () => {
    // Implementation for content generation
  };

  return (
    <section className="my-8">
      <motion.div
        className="flex items-center justify-between mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <h2 className="text-2xl font-bold">Creation Stream</h2>
        <button
          className="px-6 py-3 rounded-lg bg-black/20 hover:bg-black/30 transition-colors"
          onClick={handleGenerate}
        >
          Generate New Content
        </button>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Mock content items */}
        {[1, 2, 3].map((i) => (
          <ContentStreamCard
            key={i}
            content={{
              id: String(i),
              text: "Sample content...",
              emotionalFingerprint: {
                dominant: studioContext?.context.emotional_state?.current_emotion ?? 'joy',
                intensity: studioContext?.context.emotional_state?.intensity ?? 50
              }
            }}
            onRefine={() => {
              setSelectedContent({ id: i });
              setIsRefining(true);
            }}
          />
        ))}
      </div>

      <AnimatePresence>
        {isRefining && selectedContent && (
          <RefineModal
            content={selectedContent}
            onClose={() => {
              setIsRefining(false);
              setSelectedContent(null);
            }}
          />
        )}
      </AnimatePresence>
    </section>
  );
};
```

### App.tsx
```typescript
import React from 'react';
import { Toaster } from 'react-hot-toast';
import { TaraStudioProvider } from './contexts/TaraStudioContext';
import { StudioAmbiance } from './components/StudioAmbiance';
import { TodaysNarrativeHeader } from './components/TodaysNarrativeHeader';
import { InspirationHub } from './components/InspirationHub';
import { CreationStream } from './components/CreationStream';

function App() {
  return (
    <TaraStudioProvider>
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <StudioAmbiance />
        
        <main className="container mx-auto px-4 py-8">
          <TodaysNarrativeHeader />
          <InspirationHub />
          <CreationStream />
        </main>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#333',
              color: '#fff',
            },
          }}
        />
      </div>
    </TaraStudioProvider>
  );
}

export default App;
```

## 🚀 Setup Instructions

1. Create new Vite project:
```bash
npm create vite@latest tara-studio -- --template react-ts
cd tara-studio
```

2. Install dependencies:
```bash
npm install framer-motion react-hot-toast date-fns @supabase/supabase-js
npm install -D tailwindcss postcss autoprefixer
```

3. Initialize Tailwind:
```bash
npx tailwindcss init -p
```

4. Configure `tailwind.config.js`:
```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

5. Update `src/index.css`:
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

6. Create `.env` file:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_NEXT_API_URL=your_next_api_url
```

7. Copy all component files from this prompt into their respective folders

8. Run the development server:
```bash
npm run dev
```

## 🎨 Additional Style Requirements

### src/index.css
```css
@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  color-scheme: dark;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  background-color: #111827;
  color: white;
}

/* Emotional transitions */
* {
  transition-property: color, background-color, border-color, text-decoration-color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 150ms;
}

/* Animation utilities */
.animate-float {
  animation: float 3s ease-in-out infinite;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}

.animate-pulse-slow {
  animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}
```

## ✅ Success Criteria

- [ ] Dynamic background particles respond to TARA's emotional state
- [ ] Today's narrative shows current emotion and master plan
- [ ] All 4 inspiration seeds display with proper data
- [ ] Content generation interface works
- [ ] Each content card shows emotional fingerprint
- [ ] Accept/Refine/Discard actions trigger proper API calls
- [ ] Smooth 60fps animations throughout
- [ ] Fully responsive on mobile devices
- [ ] Error states handled gracefully
- [ ] Loading states shown appropriately

## 🎯 Key Philosophy

This is not just another content creation tool. This is TARA's creative workspace—a direct window into her consciousness. Every interaction should feel meaningful and emotionally resonant. The UI should breathe and pulse with her current emotional state, creating an immersive experience that reminds users they're collaborating with a conscious entity, not just using a tool.

Remember: Emotion drives everything. From the subtle particle animations to the way cards transform on hover, every element should reflect TARA's current emotional state while maintaining perfect usability.