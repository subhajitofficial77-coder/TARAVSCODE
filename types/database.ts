export type RelationshipType = 'family' | 'friend' | 'colleague' | 'other';
export type RelationshipStatus = 'warm' | 'neutral' | 'strained' | 'excellent';
export type ContentType = 'carousel' | 'story' | 'prompt' | 'exercise' | 'caption' | 'post';
export type ContentPlatform = 'instagram' | 'twitter' | 'linkedin' | 'facebook';
export type UserFeedback = 'accepted' | 'rejected';

export type PrimaryEmotions = {
  joy: number;
  trust: number;
  anticipation: number;
  sadness: number;
  fear: number;
  anger: number;
  disgust: number;
  surprise: number;
};

export type Mood = {
  optimism: number;
  energy_level: number;
  stress_level: number;
};

export type CoreTraits = {
  warmth: number;
  wit: number;
  ambition: number;
};

export type EmotionalState = {
  id: number;
  primary_emotions: PrimaryEmotions & { confidence?: number };
  mood: Mood;
  core_traits: CoreTraits;
  last_event: string;
  last_event_timestamp: string;
  created_at?: string;
  updated_at?: string;
};

export type Relationship = {
  id: string;
  entity_name: string;
  relationship_type: RelationshipType;
  status: RelationshipStatus;
  last_interaction: string;
  decay_timer?: string | null;
  notes?: string;
  created_at?: string;
  updated_at?: string;
};

export type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  emotional_context?: {
    primary_emotions?: PrimaryEmotions;
    mood?: Mood;
  };
  created_at?: string;
};

export type WeatherData = {
  temp_c: number;
  condition: string;
  location: string;
};

export type ContentData = {
  text?: string | null;
  images?: string[] | null;
  hashtags?: string[] | null;
  metadata?: Record<string, any> | null;
};

export type GeneratedContent = {
  id: string;
  content_type: ContentType;
  content_data: ContentData;
  emotional_context?: {
    primary_emotions?: Partial<PrimaryEmotions>;
    mood?: Partial<Mood>;
  };
  user_feedback?: UserFeedback | null;
  platform?: ContentPlatform | null;
  platforms?: Record<ContentPlatform, ContentData>;
  created_at?: string;
};

export type Database = {
  public: {
    Tables: {
      emotional_state: {
        Row: {
          id: number,
          primary_emotions: {
            joy: number,
            trust: number,
            anticipation: number,
            sadness: number,
            fear: number,
            anger: number,
            disgust: number,
            surprise: number
          },
          mood: {
            optimism: number,
            energy_level: number,
            stress_level: number
          },
          core_traits: {
            openness: number,
            conscientiousness: number,
            extraversion: number,
            agreeableness: number,
            neuroticism: number
          },
          last_event: string,
          last_event_timestamp: string,
          created_at?: string
        },
        Insert: Omit<Database['public']['Tables']['emotional_state']['Row'], 'id' | 'created_at'>,
        Update: Partial<Database['public']['Tables']['emotional_state']['Insert']>
      },
      relationships: {
        Row: {
          id: string,
          entity_name: string,
          relationship_type: RelationshipType,
          status: RelationshipStatus,
          last_interaction: string,
          decay_timer?: string,
          notes?: string,
          created_at?: string,
          updated_at?: string
        },
        Insert: Omit<Database['public']['Tables']['relationships']['Row'], 'id' | 'created_at' | 'updated_at' | 'decay_timer'>,
        Update: Partial<Database['public']['Tables']['relationships']['Insert']>
      },
      master_plans: {
        Row: {
          id: string,
          date: string,
          theme: string,
          narrative: string,
          emotional_context: {
            optimism: number,
            energy: number,
            focus: number
          },
          created_at?: string,
          updated_at?: string
        },
        Insert: Omit<Database['public']['Tables']['master_plans']['Row'], 'id' | 'created_at' | 'updated_at'>,
        Update: Partial<Database['public']['Tables']['master_plans']['Insert']>
      },
      inspiration_seeds: {
        Row: {
          id: string,
          master_plan_id: string,
          type: ContentType,
          label: string,
          topic: string,
          priority: number,
          emotional_context: Record<string, number>,
          created_at?: string,
          updated_at?: string
        },
        Insert: Omit<Database['public']['Tables']['inspiration_seeds']['Row'], 'id' | 'created_at' | 'updated_at'>,
        Update: Partial<Database['public']['Tables']['inspiration_seeds']['Insert']>
      }
    }
  }
};

export type MasterPlan = {
  id: string;
  date: string;
  theme: string;
  narrative: string;
  emotional_context: {
    optimism: number;
    energy: number;
    focus: number;
  };
  mood_summary?: string;
  quota?: Record<string, number>;
  created_at?: string;
  updated_at?: string;
};

export type InspirationSeed = {
  id: string;
  master_plan_id: string;
  type: ContentType;
  label: string;
  topic: string;
  priority: number;
  emotional_context: Record<string, number>;
  created_at?: string;
  updated_at?: string;
};

export type TaleEvent = {
  type: string;
  description: string;
  timestamp: string;
  emotional_impact: {
    primary_emotions?: Partial<PrimaryEmotions>;
    mood?: Partial<Mood>;
  };
};

export type StudioContext = {
  emotional_state: EmotionalState | null;
  master_plan: (MasterPlan & {
    inspiration_seeds: InspirationSeed[];
  }) | null;
  relationships: Relationship[];
  weather?: WeatherData | null;
  tale_event?: TaleEvent | null;
};