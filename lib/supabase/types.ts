import type { PrimaryEmotions, Mood, CoreTraits, ContentType } from '@/types/database';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      emotional_state: {
        Row: {
          id: string
          primary_emotions: PrimaryEmotions
          mood: Mood
          core_traits: CoreTraits
          last_event: string | null
          last_event_timestamp: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          primary_emotions?: PrimaryEmotions
          mood?: Mood
          core_traits?: CoreTraits
          last_event?: string | null
          last_event_timestamp?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          primary_emotions?: PrimaryEmotions
          mood?: Mood
          core_traits?: CoreTraits
          last_event?: string | null
          last_event_timestamp?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      relationships: {
        Row: {
          id: string
          entity_name: string
          relationship_type: 'family' | 'friend' | 'colleague' | 'other'
          status: 'warm' | 'neutral' | 'strained' | 'excellent'
          last_interaction: string | null
          decay_timer: string | null
          notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          entity_name: string
          relationship_type: 'family' | 'friend' | 'colleague' | 'other'
          status?: 'warm' | 'neutral' | 'strained' | 'excellent'
          last_interaction?: string | null
          decay_timer?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          entity_name?: string
          relationship_type?: 'family' | 'friend' | 'colleague' | 'other'
          status?: 'warm' | 'neutral' | 'strained' | 'excellent'
          last_interaction?: string | null
          decay_timer?: string | null
          notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      master_plans: {
        Row: {
          id: string
          date: string
          theme: string
          narrative: string
          emotional_context: Json | null
          mood_summary: string | null
          quota: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          date: string
          theme: string
          narrative: string
          emotional_context?: Json | null
          mood_summary?: string | null
          quota?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          date?: string
          theme?: string
          narrative?: string
          emotional_context?: Json | null
          mood_summary?: string | null
          quota?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      inspiration_seeds: {
        Row: {
          id: string
          master_plan_id: string
          type: ContentType
          label: string
          topic: string
          priority: number
          emotional_context: Json | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          master_plan_id: string
          type: ContentType
          label: string
          topic: string
          priority: number
          emotional_context?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          master_plan_id?: string
          type?: ContentType
          label?: string
          topic?: string
          priority?: number
          emotional_context?: Json | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      generated_content: {
        Row: {
          id: string
          content_type: ContentType
          content_data: Json
          emotional_context: Json
          user_feedback: 'accepted' | 'rejected' | null
          platform: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          content_type: ContentType
          content_data: Json
          emotional_context: Json
          user_feedback?: 'accepted' | 'rejected' | null
          platform?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          content_type?: ContentType
          content_data?: Json
          emotional_context?: Json
          user_feedback?: 'accepted' | 'rejected' | null
          platform?: string | null
          created_at?: string | null
        }
      }
      chat_history: {
        Row: {
          id: string
          role: 'user' | 'tara' | 'system'
          message: string
          emotional_state: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          role: 'user' | 'tara' | 'system'
          message: string
          emotional_state?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          role?: 'user' | 'tara' | 'system'
          message?: string
          emotional_state?: Json | null
          created_at?: string | null
        }
      }
      content_memories: {
        Row: {
          id: string
          content_type: string
          platform: string | null
          original_content: Json | null
          analysis_result: Json | null
          generated_content: Json | null
          emotional_state: Json | null
          weather_context: Json | null
          user_feedback: string | null
          feedback_notes: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          content_type: string
          platform?: string | null
          original_content?: Json | null
          analysis_result?: Json | null
          generated_content?: Json | null
          emotional_state?: Json | null
          weather_context?: Json | null
          user_feedback?: string | null
          feedback_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          content_type?: string
          platform?: string | null
          original_content?: Json | null
          analysis_result?: Json | null
          generated_content?: Json | null
          emotional_state?: Json | null
          weather_context?: Json | null
          user_feedback?: string | null
          feedback_notes?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
      }
      generated_prompts: {
        Row: {
          id: string
          prompt_type: string
          prompt_content: string
          emotional_context: Json | null
          creation_parameters: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          prompt_type: string
          prompt_content: string
          emotional_context?: Json | null
          creation_parameters?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          prompt_type?: string
          prompt_content?: string
          emotional_context?: Json | null
          creation_parameters?: Json | null
          created_at?: string | null
        }
      }
      simulation_proposals: {
        Row: {
          id: string
          description: string
          emotional_impact: Json | null
          mood_impact: Json | null
          created_at: string | null
          accepted: boolean | null
        }
        Insert: {
          id?: string
          description: string
          emotional_impact?: Json | null
          mood_impact?: Json | null
          created_at?: string | null
          accepted?: boolean | null
        }
        Update: {
          id?: string
          description?: string
          emotional_impact?: Json | null
          mood_impact?: Json | null
          created_at?: string | null
          accepted?: boolean | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      exec_sql: {
        Args: {
          sql_query: string
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
  }
}