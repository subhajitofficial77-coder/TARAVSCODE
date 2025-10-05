export interface Database {
  public: {
    Tables: {
      emotional_state: EmotionalStateTable
      relationships: RelationshipsTable
      master_plans: MasterPlansTable
      inspiration_seeds: InspirationSeedsTable
    }
  }
}

interface EmotionalStateTable {
  Row: {
    id: number
    primary_emotions: EmotionalState
    mood: Mood
    core_traits: CoreTraits
    last_event: string
    last_event_timestamp: string
    created_at?: string
  }
  Insert: Omit<EmotionalStateTable['Row'], 'id' | 'created_at'>
  Update: Partial<EmotionalStateTable['Insert']>
}

interface RelationshipsTable {
  Row: {
    id: string
    entity_name: string
    relationship_type: 'family' | 'friend' | 'colleague' | 'other'
    status: 'warm' | 'neutral' | 'strained' | 'excellent'
    last_interaction: string
    decay_timer?: string
    notes?: string
    created_at?: string
    updated_at?: string
  }
  Insert: Omit<RelationshipsTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<RelationshipsTable['Insert']>
}

interface DailyPlansTable {
  Row: {
    id: number
    task: string
    completed: boolean
    created_at?: string
  }
  Insert: Omit<DailyPlansTable['Row'], 'id' | 'created_at'>
  Update: Partial<DailyPlansTable['Insert']>
}

interface MasterPlansTable {
  Row: {
    id: string
    date: string
    theme: string
    narrative: string
    emotional_context?: Record<string, number>
    created_at?: string
    updated_at?: string
  }
  Insert: Omit<MasterPlansTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<MasterPlansTable['Insert']>
}

interface InspirationSeedsTable {
  Row: {
    id: string
    master_plan_id: string
    type: 'carousel' | 'story' | 'caption' | 'post'
    label: string
    topic: string
    priority: number
    emotional_context?: Record<string, number>
    created_at?: string
    updated_at?: string
  }
  Insert: Omit<InspirationSeedsTable['Row'], 'id' | 'created_at' | 'updated_at'>
  Update: Partial<InspirationSeedsTable['Insert']>
}

interface EmotionalState {
  joy: number
  trust: number
  anticipation: number
  sadness: number
  fear: number
  anger: number
  disgust: number
  surprise: number
}

interface Mood {
  optimism: number
  energy_level: number
  stress_level: number
}

interface CoreTraits {
  openness: number
  conscientiousness: number
  extraversion: number
  agreeableness: number
  neuroticism: number
}