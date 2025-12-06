/**
 * Supabase Database Types
 *
 * Auto-generated types for type-safe database queries
 * Run `npm run supabase:generate-types` to update
 */

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
      song_orders: {
        Row: {
          id: string
          order_id: string
          stripe_payment_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string | null
          song_brief: string | null
          generated_prompt: string | null
          suno_url: string | null
          suno_embed_url: string | null
          status: string
          package_type: string | null
          occasion: string | null
          mood: string | null
          genre: string | null
          event_date: string | null
          created_at: string
          completed_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          order_id: string
          stripe_payment_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone?: string | null
          song_brief?: string | null
          generated_prompt?: string | null
          suno_url?: string | null
          suno_embed_url?: string | null
          status?: string
          package_type?: string | null
          occasion?: string | null
          mood?: string | null
          genre?: string | null
          event_date?: string | null
          created_at?: string
          completed_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          order_id?: string
          stripe_payment_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string | null
          song_brief?: string | null
          generated_prompt?: string | null
          suno_url?: string | null
          suno_embed_url?: string | null
          status?: string
          package_type?: string | null
          occasion?: string | null
          mood?: string | null
          genre?: string | null
          event_date?: string | null
          created_at?: string
          completed_at?: string | null
          notes?: string | null
        }
      }
      song_order_audit: {
        Row: {
          id: number
          order_id: string | null
          action: string
          timestamp: string
          details: Json | null
          user_email: string | null
          ip_address: string | null
        }
        Insert: {
          id?: number
          order_id?: string | null
          action: string
          timestamp?: string
          details?: Json | null
          user_email?: string | null
          ip_address?: string | null
        }
        Update: {
          id?: number
          order_id?: string | null
          action?: string
          timestamp?: string
          details?: Json | null
          user_email?: string | null
          ip_address?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

// Type helpers for easier usage
export type SongOrder = Database['public']['Tables']['song_orders']['Row'];
export type SongOrderInsert = Database['public']['Tables']['song_orders']['Insert'];
export type SongOrderUpdate = Database['public']['Tables']['song_orders']['Update'];

export type SongOrderAudit = Database['public']['Tables']['song_order_audit']['Row'];
