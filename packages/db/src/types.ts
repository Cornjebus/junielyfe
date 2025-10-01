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
  public: {
    Tables: {
      answers: {
        Row: {
          answer_metadata: Json | null
          answer_text: string
          clerk_user_id: string
          created_at: string | null
          id: string
          question_key: string
          question_text: string
          session_id: string
          user_id: string
        }
        Insert: {
          answer_metadata?: Json | null
          answer_text: string
          clerk_user_id: string
          created_at?: string | null
          id?: string
          question_key: string
          question_text: string
          session_id: string
          user_id: string
        }
        Update: {
          answer_metadata?: Json | null
          answer_text?: string
          clerk_user_id?: string
          created_at?: string | null
          id?: string
          question_key?: string
          question_text?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "answers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          artifact_type: string
          clerk_user_id: string
          content: string
          created_at: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          artifact_type: string
          clerk_user_id: string
          content: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          artifact_type?: string
          clerk_user_id?: string
          content?: string
          created_at?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artifacts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      clerk_webhook_events: {
        Row: {
          clerk_user_id: string | null
          created_at: string | null
          error: string | null
          event_type: string
          id: string
          payload: Json
          processed: boolean | null
        }
        Insert: {
          clerk_user_id?: string | null
          created_at?: string | null
          error?: string | null
          event_type: string
          id?: string
          payload: Json
          processed?: boolean | null
        }
        Update: {
          clerk_user_id?: string | null
          created_at?: string | null
          error?: string | null
          event_type?: string
          id?: string
          payload?: Json
          processed?: boolean | null
        }
        Relationships: []
      }
      goals: {
        Row: {
          budget_for_learning: number | null
          clerk_user_id: string
          created_at: string | null
          ethical_exclusions: string[] | null
          goal_text: string
          goal_type: string
          horizon_weeks: number | null
          hours_per_week: number | null
          id: string
          remote_only: boolean | null
          risk_tolerance: string | null
          target_income_delta: number | null
          target_role: string | null
          target_title: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          budget_for_learning?: number | null
          clerk_user_id: string
          created_at?: string | null
          ethical_exclusions?: string[] | null
          goal_text: string
          goal_type: string
          horizon_weeks?: number | null
          hours_per_week?: number | null
          id?: string
          remote_only?: boolean | null
          risk_tolerance?: string | null
          target_income_delta?: number | null
          target_role?: string | null
          target_title?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          budget_for_learning?: number | null
          clerk_user_id?: string
          created_at?: string | null
          ethical_exclusions?: string[] | null
          goal_text?: string
          goal_type?: string
          horizon_weeks?: number | null
          hours_per_week?: number | null
          id?: string
          remote_only?: boolean | null
          risk_tolerance?: string | null
          target_income_delta?: number | null
          target_role?: string | null
          target_title?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ideas: {
        Row: {
          category: string
          clerk_user_id: string
          created_at: string | null
          description: string
          fit_score: number | null
          id: string
          is_intensive: boolean | null
          is_selected: boolean | null
          market_score: number | null
          research_sources: Json | null
          risk_score: number | null
          selected_at: string | null
          session_id: string
          speed_score: number | null
          title: string
          user_id: string
          why_this_fits: string
        }
        Insert: {
          category: string
          clerk_user_id: string
          created_at?: string | null
          description: string
          fit_score?: number | null
          id?: string
          is_intensive?: boolean | null
          is_selected?: boolean | null
          market_score?: number | null
          research_sources?: Json | null
          risk_score?: number | null
          selected_at?: string | null
          session_id: string
          speed_score?: number | null
          title: string
          user_id: string
          why_this_fits: string
        }
        Update: {
          category?: string
          clerk_user_id?: string
          created_at?: string | null
          description?: string
          fit_score?: number | null
          id?: string
          is_intensive?: boolean | null
          is_selected?: boolean | null
          market_score?: number | null
          research_sources?: Json | null
          risk_score?: number | null
          selected_at?: string | null
          session_id?: string
          speed_score?: number | null
          title?: string
          user_id?: string
          why_this_fits?: string
        }
        Relationships: [
          {
            foreignKeyName: "ideas_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "questionnaire_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ideas_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_ideas: {
        Row: {
          idea_id: string
          plan_id: string
        }
        Insert: {
          idea_id: string
          plan_id: string
        }
        Update: {
          idea_id?: string
          plan_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plan_ideas_idea_id_fkey"
            columns: ["idea_id"]
            isOneToOne: false
            referencedRelation: "ideas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "plan_ideas_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
        ]
      }
      plans: {
        Row: {
          clerk_user_id: string
          completed_at: string | null
          created_at: string | null
          duration_weeks: number
          id: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clerk_user_id: string
          completed_at?: string | null
          created_at?: string | null
          duration_weeks?: number
          id?: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clerk_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          duration_weeks?: number
          id?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "plans_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          clerk_user_id: string
          consents: Json | null
          created_at: string | null
          id: string
          linkedin_data: Json | null
          linkedin_profile_url: string | null
          narrative: string | null
          resume_file_path: string | null
          resume_parsed_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clerk_user_id: string
          consents?: Json | null
          created_at?: string | null
          id?: string
          linkedin_data?: Json | null
          linkedin_profile_url?: string | null
          narrative?: string | null
          resume_file_path?: string | null
          resume_parsed_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clerk_user_id?: string
          consents?: Json | null
          created_at?: string | null
          id?: string
          linkedin_data?: Json | null
          linkedin_profile_url?: string | null
          narrative?: string | null
          resume_file_path?: string | null
          resume_parsed_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      questionnaire_sessions: {
        Row: {
          clerk_user_id: string
          completed_at: string | null
          created_at: string | null
          depth: string
          goal_id: string
          id: string
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          clerk_user_id: string
          completed_at?: string | null
          created_at?: string | null
          depth: string
          goal_id: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          clerk_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          depth?: string
          goal_id?: string
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "questionnaire_sessions_goal_id_fkey"
            columns: ["goal_id"]
            isOneToOne: false
            referencedRelation: "goals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "questionnaire_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          clerk_user_id: string
          completed_at: string | null
          created_at: string | null
          description: string | null
          id: string
          order_in_week: number
          plan_id: string
          status: string
          title: string
          user_id: string
          week_number: number
        }
        Insert: {
          clerk_user_id: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_in_week: number
          plan_id: string
          status?: string
          title: string
          user_id: string
          week_number: number
        }
        Update: {
          clerk_user_id?: string
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          order_in_week?: number
          plan_id?: string
          status?: string
          title?: string
          user_id?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "tasks_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          clerk_user_id: string
          created_at: string | null
          deleted_at: string | null
          email: string
          first_name: string | null
          id: string
          image_url: string | null
          last_name: string | null
          updated_at: string | null
        }
        Insert: {
          clerk_user_id: string
          created_at?: string | null
          deleted_at?: string | null
          email: string
          first_name?: string | null
          id?: string
          image_url?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Update: {
          clerk_user_id?: string
          created_at?: string | null
          deleted_at?: string | null
          email?: string
          first_name?: string | null
          id?: string
          image_url?: string | null
          last_name?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      current_clerk_user_id: {
        Args: Record<PropertyKey, never>
        Returns: string
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
  public: {
    Enums: {},
  },
} as const
