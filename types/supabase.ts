import { EmotionalState, Relationship, GeneratedContent, ChatMessage } from './database';

export interface Database {
  public: {
    Tables: {
      emotional_state: {
        Row: EmotionalState;
        Insert: Omit<EmotionalState, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<EmotionalState, 'id' | 'created_at'>>;
      };
      relationships: {
        Row: Relationship;
        Insert: Omit<Relationship, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Relationship, 'id' | 'created_at'>>;
      };
      generated_content: {
        Row: GeneratedContent;
        Insert: Omit<GeneratedContent, 'id' | 'created_at'>;
        Update: Partial<Omit<GeneratedContent, 'id' | 'created_at'>>;
      };
      chat_history: {
        Row: ChatMessage;
        Insert: Omit<ChatMessage, 'id' | 'created_at'>;
        Update: Partial<Omit<ChatMessage, 'id' | 'created_at'>>;
      };
    };
    Views: {};
    Functions: {};
    Enums: {
      relationship_type: 'family' | 'friend' | 'colleague' | 'other';
      relationship_status: 'warm' | 'neutral' | 'strained' | 'excellent';
      content_type: 'carousel' | 'story' | 'caption' | 'post';
      chat_role: 'user' | 'tara' | 'system';
    };
  };
}
