export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      ai_videos: {
        Row: {
          created_at: string
          id: string
          platform_targeting: string[] | null
          script_text: string
          video_url: string
          voice_style: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform_targeting?: string[] | null
          script_text: string
          video_url: string
          voice_style: string
        }
        Update: {
          created_at?: string
          id?: string
          platform_targeting?: string[] | null
          script_text?: string
          video_url?: string
          voice_style?: string
        }
        Relationships: []
      }
      assessment_categories: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      assessment_sessions: {
        Row: {
          ai_adaptation_level: number | null
          assessment_id: string
          current_score: number | null
          end_time: string | null
          id: string
          next_question_id: string | null
          start_time: string
          status: string
          user_id: string
        }
        Insert: {
          ai_adaptation_level?: number | null
          assessment_id: string
          current_score?: number | null
          end_time?: string | null
          id?: string
          next_question_id?: string | null
          start_time?: string
          status: string
          user_id: string
        }
        Update: {
          ai_adaptation_level?: number | null
          assessment_id?: string
          current_score?: number | null
          end_time?: string | null
          id?: string
          next_question_id?: string | null
          start_time?: string
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_next_question_id_fkey"
            columns: ["next_question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      assessments: {
        Row: {
          category_id: string
          created_at: string
          description: string | null
          expires_at: string | null
          id: string
          is_active: boolean
          level_id: number
          questions_count: number
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          level_id: number
          questions_count?: number
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean
          level_id?: number
          questions_count?: number
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "assessment_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessments_level_id_fkey"
            columns: ["level_id"]
            isOneToOne: false
            referencedRelation: "moral_levels"
            referencedColumns: ["id"]
          },
        ]
      }
      memes: {
        Row: {
          created_at: string
          engagement_score: number | null
          id: string
          image_url: string
          meme_text: string
          platform_tags: string[] | null
        }
        Insert: {
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url: string
          meme_text: string
          platform_tags?: string[] | null
        }
        Update: {
          created_at?: string
          engagement_score?: number | null
          id?: string
          image_url?: string
          meme_text?: string
          platform_tags?: string[] | null
        }
        Relationships: []
      }
      moral_levels: {
        Row: {
          id: number
          level: number
          name: string
        }
        Insert: {
          id?: number
          level: number
          name: string
        }
        Update: {
          id?: number
          level?: number
          name?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          role: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          role?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          is_correct: boolean | null
          moral_level_indicator: number | null
          question_id: string
          score_value: number | null
          text: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          moral_level_indicator?: number | null
          question_id: string
          score_value?: number | null
          text: string
        }
        Update: {
          created_at?: string
          id?: string
          is_correct?: boolean | null
          moral_level_indicator?: number | null
          question_id?: string
          score_value?: number | null
          text?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          assessment_id: string
          category: Database["public"]["Enums"]["question_category"]
          created_at: string
          difficulty_weight: number
          id: string
          is_active: boolean
          level: number
          options: Json | null
          question_type: Database["public"]["Enums"]["question_type"]
          text: string
          time_limit_seconds: number
        }
        Insert: {
          assessment_id: string
          category: Database["public"]["Enums"]["question_category"]
          created_at?: string
          difficulty_weight?: number
          id?: string
          is_active?: boolean
          level: number
          options?: Json | null
          question_type: Database["public"]["Enums"]["question_type"]
          text: string
          time_limit_seconds?: number
        }
        Update: {
          assessment_id?: string
          category?: Database["public"]["Enums"]["question_category"]
          created_at?: string
          difficulty_weight?: number
          id?: string
          is_active?: boolean
          level?: number
          options?: Json | null
          question_type?: Database["public"]["Enums"]["question_type"]
          text?: string
          time_limit_seconds?: number
        }
        Relationships: [
          {
            foreignKeyName: "questions_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      responses: {
        Row: {
          ai_analysis: string | null
          answer_option: string | null
          answer_text: string | null
          assessment_id: string
          correctness_score: number | null
          created_at: string
          id: string
          question_id: string
          response_time_ms: number
          user_id: string
        }
        Insert: {
          ai_analysis?: string | null
          answer_option?: string | null
          answer_text?: string | null
          assessment_id: string
          correctness_score?: number | null
          created_at?: string
          id?: string
          question_id: string
          response_time_ms: number
          user_id: string
        }
        Update: {
          ai_analysis?: string | null
          answer_option?: string | null
          answer_text?: string | null
          assessment_id?: string
          correctness_score?: number | null
          created_at?: string
          id?: string
          question_id?: string
          response_time_ms?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "responses_answer_option_fkey"
            columns: ["answer_option"]
            isOneToOne: false
            referencedRelation: "question_options"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_moral_level_progress: {
        Row: {
          ai_feedback: string | null
          confidence_score: number
          current_level: number
          id: string
          last_assessment_id: string | null
          last_updated: string
          previous_level: number | null
          user_id: string
        }
        Insert: {
          ai_feedback?: string | null
          confidence_score: number
          current_level: number
          id?: string
          last_assessment_id?: string | null
          last_updated?: string
          previous_level?: number | null
          user_id: string
        }
        Update: {
          ai_feedback?: string | null
          confidence_score?: number
          current_level?: number
          id?: string
          last_assessment_id?: string | null
          last_updated?: string
          previous_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_moral_level_progress_last_assessment_id_fkey"
            columns: ["last_assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
    }
    Enums: {
      assessment_category:
        | "Moral Dilemma"
        | "Professional Ethics"
        | "Social Dynamics"
        | "Global Ethics"
        | "Personal Values"
      assessment_status: "draft" | "active" | "inactive"
      question_category:
        | "Honesty"
        | "Empathy"
        | "Justice"
        | "Loyalty"
        | "Authority"
        | "Care"
        | "Fairness"
        | "Liberty"
        | "Sanctity"
      question_type: "Multiple Choice" | "Likert Scale" | "Scenario-Based"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
