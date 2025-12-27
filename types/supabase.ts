/**
 * Supabase Database Types
 *
 * Auto-generated types for type-safe database queries
 * Generated from Supabase Dashboard - Settings → API → Generate TypeScript types
 * Last updated: December 25, 2025
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      ai_assistant_conversations: {
        Row: {
          client_ip: string | null
          created_at: string | null
          id: string
          last_message: string | null
          message_count: number | null
          updated_at: string | null
        }
        Insert: {
          client_ip?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          message_count?: number | null
          updated_at?: string | null
        }
        Update: {
          client_ip?: string | null
          created_at?: string | null
          id?: string
          last_message?: string | null
          message_count?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      ai_assistant_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_assistant_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_assistant_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      case_studies: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: Json | null
          category: string | null
          featured: boolean | null
          status: string | null
          published_at: string | null
          before_metrics: Json | null
          after_metrics: Json | null
          hero_image_url: string | null
          images: Json | null
          testimonial_text: string | null
          testimonial_author: string | null
          testimonial_company: string | null
          testimonial_author_role: string | null
          meta_title: string | null
          meta_description: string | null
          meta_keywords: string[] | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: Json | null
          category?: string | null
          featured?: boolean | null
          status?: string | null
          published_at?: string | null
          before_metrics?: Json | null
          after_metrics?: Json | null
          hero_image_url?: string | null
          images?: Json | null
          testimonial_text?: string | null
          testimonial_author?: string | null
          testimonial_company?: string | null
          testimonial_author_role?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          excerpt?: string | null
          content?: Json | null
          category?: string | null
          featured?: boolean | null
          status?: string | null
          published_at?: string | null
          before_metrics?: Json | null
          after_metrics?: Json | null
          hero_image_url?: string | null
          images?: Json | null
          testimonial_text?: string | null
          testimonial_author?: string | null
          testimonial_company?: string | null
          testimonial_author_role?: string | null
          meta_title?: string | null
          meta_description?: string | null
          meta_keywords?: string[] | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "case_studies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "case_studies_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_conversations: {
        Row: {
          ai_responses_count: number | null
          business_id: number | null
          channel: string
          chat_widget_id: string | null
          created_at: string
          escalated_at: string | null
          escalation_reason: string | null
          human_handoff_count: number | null
          id: number
          language: string | null
          satisfaction_feedback: string | null
          satisfaction_score: number | null
          status: string
          updated_at: string
          visitor_email: string | null
          visitor_id: string | null
          visitor_name: string | null
          visitor_phone: string | null
        }
        Insert: {
          ai_responses_count?: number | null
          business_id?: number | null
          channel?: string
          chat_widget_id?: string | null
          created_at?: string
          escalated_at?: string | null
          escalation_reason?: string | null
          human_handoff_count?: number | null
          id?: number
          language?: string | null
          satisfaction_feedback?: string | null
          satisfaction_score?: number | null
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Update: {
          ai_responses_count?: number | null
          business_id?: number | null
          channel?: string
          chat_widget_id?: string | null
          created_at?: string
          escalated_at?: string | null
          escalation_reason?: string | null
          human_handoff_count?: number | null
          id?: number
          language?: string | null
          satisfaction_feedback?: string | null
          satisfaction_score?: number | null
          status?: string
          updated_at?: string
          visitor_email?: string | null
          visitor_id?: string | null
          visitor_name?: string | null
          visitor_phone?: string | null
        }
        Relationships: []
      }
      chat_escalations: {
        Row: {
          assigned_to: string | null
          conversation_id: number
          created_at: string
          escalation_reason: string
          escalation_type: string
          id: number
          priority: string
          resolution_notes: string | null
          resolved_at: string | null
          slack_channel: string | null
          slack_thread_ts: string | null
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          conversation_id: number
          created_at?: string
          escalation_reason: string
          escalation_type: string
          id?: number
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          slack_channel?: string | null
          slack_thread_ts?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          conversation_id?: number
          created_at?: string
          escalation_reason?: string
          escalation_type?: string
          id?: number
          priority?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          slack_channel?: string | null
          slack_thread_ts?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_escalations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          ai_confidence: number | null
          ai_intent: string | null
          ai_model: string | null
          ai_tokens_used: number | null
          conversation_id: number
          created_at: string
          faq_match_confidence: number | null
          faq_matched_id: number | null
          id: number
          message_text: string
          response_data: Json | null
          response_type: string | null
          sender_id: string | null
          sender_type: string
        }
        Insert: {
          ai_confidence?: number | null
          ai_intent?: number | null
          ai_model?: string | null
          ai_tokens_used?: number | null
          conversation_id: number
          created_at?: string
          faq_match_confidence?: number | null
          faq_matched_id?: number | null
          id?: number
          message_text: string
          response_data?: Json | null
          response_type?: string | null
          sender_id?: string | null
          sender_type: string
        }
        Update: {
          ai_confidence?: number | null
          ai_intent?: string | null
          ai_model?: string | null
          ai_tokens_used?: number | null
          conversation_id?: number
          created_at?: string
          faq_match_confidence?: number | null
          faq_matched_id?: number | null
          id?: number
          message_text?: string
          response_data?: Json | null
          response_type?: string | null
          sender_id?: string | null
          sender_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_faq_matched_id_fkey"
            columns: ["faq_matched_id"]
            isOneToOne: false
            referencedRelation: "faq_knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      consciousness_levels_reference: {
        Row: {
          created_at: string
          id: string
          level_description: string | null
          level_key: string
          level_name: string
          level_value: number
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          level_description?: string | null
          level_key: string
          level_name: string
          level_value: number
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          level_description?: string | null
          level_key?: string
          level_name?: string
          level_value?: number
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      faq_knowledge_base: {
        Row: {
          answer: string
          business_id: number | null
          category: string
          created_at: string
          id: number
          intent_keywords: Json | null
          intent_labels: Json | null
          is_active: boolean
          last_used_at: string | null
          priority: number | null
          question: string
          response_template: string | null
          response_variables: Json | null
          updated_at: string
          usage_count: number | null
        }
        Insert: {
          answer: string
          business_id?: number | null
          category: string
          created_at?: string
          id?: number
          intent_keywords?: Json | null
          intent_labels?: Json | null
          is_active?: boolean
          last_used_at?: string | null
          priority?: number | null
          question: string
          response_template?: string | null
          response_variables?: Json | null
          updated_at?: string
          usage_count?: number | null
        }
        Update: {
          answer?: string
          business_id?: number | null
          category?: string
          created_at?: string
          id?: number
          intent_keywords?: Json | null
          intent_labels?: Json | null
          is_active?: boolean
          last_used_at?: string | null
          priority?: number | null
          question?: string
          response_template?: string | null
          response_variables?: Json | null
          updated_at?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      pdf_components: {
        Row: {
          component_key: string
          component_type: string
          content_html: string
          content_json: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          display_order: number | null
          id: number
          is_active: boolean | null
          notes: string | null
          parent_component_id: number | null
          sector_filter: string[] | null
          styles: Json | null
          title: string | null
          updated_at: string
          version: number | null
        }
        Insert: {
          component_key: string
          component_type: string
          content_html: string
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          parent_component_id?: number | null
          sector_filter?: string[] | null
          styles?: Json | null
          title?: string | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          component_key?: string
          component_type?: string
          content_html?: string
          content_json?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          display_order?: number | null
          id?: number
          is_active?: boolean | null
          notes?: string | null
          parent_component_id?: number | null
          sector_filter?: string[] | null
          styles?: Json | null
          title?: string | null
          updated_at?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "pdf_components_parent_component_id_fkey"
            columns: ["parent_component_id"]
            isOneToOne: false
            referencedRelation: "pdf_components"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_templates: {
        Row: {
          component_keys: string[]
          created_at: string
          description: string | null
          id: number
          is_active: boolean | null
          margins: Json | null
          orientation: string | null
          page_size: string | null
          template_key: string
          template_name: string
          theme: Json | null
          updated_at: string
          version: number | null
        }
        Insert: {
          component_keys: string[]
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          margins?: Json | null
          orientation?: string | null
          page_size?: string | null
          template_key: string
          template_name: string
          theme?: Json | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          component_keys?: string[]
          created_at?: string
          description?: string | null
          id?: number
          is_active?: boolean | null
          margins?: Json | null
          orientation?: string | null
          page_size?: string | null
          template_key?: string
          template_name?: string
          theme?: Json | null
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      questionnaire_responses: {
        Row: {
          annual_revenue: string | null
          audit_started_at: string | null
          audit_status: string | null
          budget_range: string | null
          business_email: string
          business_name: string
          business_phone: string
          business_profile: Json | null
          challenges: Json | null
          client_id: string
          created_at: string
          discovery_tree: Json | null
          email_sent_at: string | null
          employee_count: string | null
          first_name: string
          goals: Json | null
          id: number
          last_name: string
          pain_points: string[]
          pdf_generated_at: string | null
          pdf_url: string | null
          primary_offers: Json | null
          sector: string
          sector_specific_data: Json | null
          status: string | null
          timeline: string | null
          updated_at: string
        }
        Insert: {
          annual_revenue?: string | null
          audit_started_at?: string | null
          audit_status?: string | null
          budget_range?: string | null
          business_email: string
          business_name: string
          business_phone: string
          business_profile?: Json | null
          challenges?: Json | null
          client_id?: string
          created_at?: string
          discovery_tree?: Json | null
          email_sent_at?: string | null
          employee_count?: string | null
          first_name: string
          goals?: Json | null
          id?: number
          last_name: string
          pain_points: string[]
          pdf_generated_at?: string | null
          pdf_url?: string | null
          primary_offers?: Json | null
          sector: string
          sector_specific_data?: Json | null
          status?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Update: {
          annual_revenue?: string | null
          audit_started_at?: string | null
          audit_status?: string | null
          budget_range?: string | null
          business_email?: string
          business_name?: string
          business_phone?: string
          business_profile?: Json | null
          challenges?: Json | null
          client_id?: string
          created_at?: string
          discovery_tree?: Json | null
          email_sent_at?: string | null
          employee_count?: string | null
          first_name?: string
          goals?: Json | null
          id?: number
          last_name?: string
          pain_points?: string[]
          pdf_generated_at?: string | null
          pdf_url?: string | null
          primary_offers?: Json | null
          sector?: string
          sector_specific_data?: Json | null
          status?: string | null
          timeline?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      rws_genre_library: {
        Row: {
          content: string | null
          created_at: string
          embedding: string | null
          genre_name: string | null
          id: number
          metadata: Json | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          genre_name?: string | null
          id?: number
          metadata?: Json | null
        }
        Update: {
          content?: string | null
          created_at?: string
          embedding?: string | null
          genre_name?: string | null
          id?: number
          metadata?: Json | null
        }
        Relationships: []
      }
      service_bookings: {
        Row: {
          completed_at: string | null
          created_at: string | null
          id: string
          notes: string | null
          scheduled_at: string | null
          service_lead_id: string | null
          service_type_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          service_lead_id?: string | null
          service_type_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          scheduled_at?: string | null
          service_lead_id?: string | null
          service_type_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_lead_id_fkey"
            columns: ["service_lead_id"]
            isOneToOne: false
            referencedRelation: "service_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_bookings_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_leads: {
        Row: {
          company: string | null
          created_at: string | null
          email: string
          id: string
          message: string | null
          name: string
          phone: string | null
          service_type_id: string | null
          source: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          message?: string | null
          name: string
          phone?: string | null
          service_type_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          message?: string | null
          name?: string
          phone?: string | null
          service_type_id?: string | null
          source?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_leads_service_type_id_fkey"
            columns: ["service_type_id"]
            isOneToOne: false
            referencedRelation: "service_types"
            referencedColumns: ["id"]
          },
        ]
      }
      service_types: {
        Row: {
          base_price_cents: number | null
          created_at: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          base_price_cents?: number | null
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          base_price_cents?: number | null
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      song_order_audit: {
        Row: {
          action: string
          details: Json | null
          id: number
          order_id: string | null
          timestamp: string | null
        }
        Insert: {
          action: string
          details?: Json | null
          id?: number
          order_id?: string | null
          timestamp?: string | null
        }
        Update: {
          action?: string
          details?: Json | null
          id?: number
          order_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "song_order_audit_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "song_orders"
            referencedColumns: ["id"]
          },
        ]
      }
      song_orders: {
        Row: {
          amount_cents: number
          completed_at: string | null
          created_at: string | null
          customer_email: string
          customer_name: string
          customer_phone: string | null
          generated_prompt: string | null
          id: string
          notes: string | null
          order_id: string
          package_type: string | null
          song_brief: string | null
          status: string | null
          stripe_payment_id: string | null
          suno_embed_url: string | null
          suno_url: string | null
        }
        Insert: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string | null
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          generated_prompt?: string | null
          id?: string
          notes?: string | null
          order_id: string
          package_type?: string | null
          song_brief?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          suno_embed_url?: string | null
          suno_url?: string | null
        }
        Update: {
          amount_cents?: number
          completed_at?: string | null
          created_at?: string | null
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          generated_prompt?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          package_type?: string | null
          song_brief?: string | null
          status?: string | null
          stripe_payment_id?: string | null
          suno_embed_url?: string | null
          suno_url?: string | null
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          client_name: string
          client_title: string | null
          client_company: string | null
          client_image_url: string | null
          content: string
          rating: number | null
          service_type: string | null
          case_study_id: string | null
          published: boolean | null
          display_order: number | null
          created_at: string | null
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_name: string
          client_title?: string | null
          client_company?: string | null
          client_image_url?: string | null
          content: string
          rating?: number | null
          service_type?: string | null
          case_study_id?: string | null
          published?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          id?: string
          client_name?: string
          client_title?: string | null
          client_company?: string | null
          client_image_url?: string | null
          content?: string
          rating?: number | null
          service_type?: string | null
          case_study_id?: string | null
          published?: boolean | null
          display_order?: number | null
          created_at?: string | null
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "testimonials_case_study_id_fkey"
            columns: ["case_study_id"]
            isOneToOne: false
            referencedRelation: "case_studies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "testimonials_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      match_genres: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          content: string
          genre_name: string
          id: number
          metadata: Json
          similarity: number
        }[]
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {},
  },
} as const

// Type helpers for easier usage (preserved from original file)
export type SongOrder = Database['public']['Tables']['song_orders']['Row'];
export type SongOrderInsert = Database['public']['Tables']['song_orders']['Insert'];
export type SongOrderUpdate = Database['public']['Tables']['song_orders']['Update'];

export type SongOrderAudit = Database['public']['Tables']['song_order_audit']['Row'];

// New type helpers for AI Assistant tables
export type AIAssistantConversation = Database['public']['Tables']['ai_assistant_conversations']['Row'];
export type AIAssistantConversationInsert = Database['public']['Tables']['ai_assistant_conversations']['Insert'];
export type AIAssistantConversationUpdate = Database['public']['Tables']['ai_assistant_conversations']['Update'];

export type AIAssistantMessage = Database['public']['Tables']['ai_assistant_messages']['Row'];
export type AIAssistantMessageInsert = Database['public']['Tables']['ai_assistant_messages']['Insert'];
export type AIAssistantMessageUpdate = Database['public']['Tables']['ai_assistant_messages']['Update'];

// Type helpers for Testimonials
export type TestimonialRow = Database['public']['Tables']['testimonials']['Row'];
export type TestimonialInsert = Database['public']['Tables']['testimonials']['Insert'];
export type TestimonialUpdate = Database['public']['Tables']['testimonials']['Update'];

// Type helpers for Case Studies
export type CaseStudyRow = Database['public']['Tables']['case_studies']['Row'];
export type CaseStudyInsert = Database['public']['Tables']['case_studies']['Insert'];
export type CaseStudyUpdate = Database['public']['Tables']['case_studies']['Update'];
