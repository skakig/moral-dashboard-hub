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
      affiliate_achievements: {
        Row: {
          created_at: string
          criteria: Json
          description: string
          icon_url: string | null
          id: string
          is_active: boolean
          name: string
          reward_amount: number | null
          reward_duration: number | null
          reward_type: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          criteria: Json
          description: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name: string
          reward_amount?: number | null
          reward_duration?: number | null
          reward_type?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          criteria?: Json
          description?: string
          icon_url?: string | null
          id?: string
          is_active?: boolean
          name?: string
          reward_amount?: number | null
          reward_duration?: number | null
          reward_type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      affiliate_earned_achievements: {
        Row: {
          achievement_id: string | null
          affiliate_id: string | null
          earned_at: string
          id: string
          reward_applied: boolean
          reward_expires_at: string | null
        }
        Insert: {
          achievement_id?: string | null
          affiliate_id?: string | null
          earned_at?: string
          id?: string
          reward_applied?: boolean
          reward_expires_at?: string | null
        }
        Update: {
          achievement_id?: string | null
          affiliate_id?: string | null
          earned_at?: string
          id?: string
          reward_applied?: boolean
          reward_expires_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_earned_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "affiliate_achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_earned_achievements_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_earned_achievements_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_earned_achievements_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "monthly_top_performers"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_profiles: {
        Row: {
          approved_at: string | null
          commission_rate: number
          created_at: string
          earnings_paid: number
          earnings_pending: number
          earnings_total: number
          email: string
          id: string
          name: string
          payout_details: Json | null
          preferred_payout_method: string | null
          referral_code: string
          social_profiles: Json | null
          status: string
          tier: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          earnings_paid?: number
          earnings_pending?: number
          earnings_total?: number
          email: string
          id?: string
          name: string
          payout_details?: Json | null
          preferred_payout_method?: string | null
          referral_code: string
          social_profiles?: Json | null
          status?: string
          tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          approved_at?: string | null
          commission_rate?: number
          created_at?: string
          earnings_paid?: number
          earnings_pending?: number
          earnings_total?: number
          email?: string
          id?: string
          name?: string
          payout_details?: Json | null
          preferred_payout_method?: string | null
          referral_code?: string
          social_profiles?: Json | null
          status?: string
          tier?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      affiliate_tiers: {
        Row: {
          benefits: Json | null
          commission_rate: number
          created_at: string
          description: string | null
          id: string
          min_earnings: number
          min_referrals: number
          name: string
          updated_at: string
        }
        Insert: {
          benefits?: Json | null
          commission_rate: number
          created_at?: string
          description?: string | null
          id?: string
          min_earnings?: number
          min_referrals?: number
          name: string
          updated_at?: string
        }
        Update: {
          benefits?: Json | null
          commission_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          min_earnings?: number
          min_referrals?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
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
      api_function_mapping: {
        Row: {
          created_at: string | null
          description: string | null
          function_name: string
          id: string
          is_active: boolean | null
          parameters: Json | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          function_name: string
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          function_name?: string
          id?: string
          is_active?: boolean | null
          parameters?: Json | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_keys: {
        Row: {
          api_key: string
          base_url: string | null
          category: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_validated: string | null
          service_name: string
          status: string | null
          updated_at: string | null
          validation_errors: string[] | null
        }
        Insert: {
          api_key: string
          base_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_validated?: string | null
          service_name: string
          status?: string | null
          updated_at?: string | null
          validation_errors?: string[] | null
        }
        Update: {
          api_key?: string
          base_url?: string | null
          category?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_validated?: string | null
          service_name?: string
          status?: string | null
          updated_at?: string | null
          validation_errors?: string[] | null
        }
        Relationships: []
      }
      api_rate_limits: {
        Row: {
          created_at: string | null
          current_daily_usage: number | null
          current_hourly_usage: number | null
          current_monthly_usage: number | null
          daily_limit: number | null
          hourly_limit: number | null
          id: string
          last_reset_daily: string | null
          last_reset_hourly: string | null
          last_reset_monthly: string | null
          monthly_limit: number | null
          service_name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          current_daily_usage?: number | null
          current_hourly_usage?: number | null
          current_monthly_usage?: number | null
          daily_limit?: number | null
          hourly_limit?: number | null
          id?: string
          last_reset_daily?: string | null
          last_reset_hourly?: string | null
          last_reset_monthly?: string | null
          monthly_limit?: number | null
          service_name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          current_daily_usage?: number | null
          current_hourly_usage?: number | null
          current_monthly_usage?: number | null
          daily_limit?: number | null
          hourly_limit?: number | null
          id?: string
          last_reset_daily?: string | null
          last_reset_hourly?: string | null
          last_reset_monthly?: string | null
          monthly_limit?: number | null
          service_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      api_usage_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          function_name: string | null
          id: string
          request_data: Json | null
          response_data: Json | null
          response_time_ms: number | null
          service_name: string
          success: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          function_name?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          service_name: string
          success?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          function_name?: string | null
          id?: string
          request_data?: Json | null
          response_data?: Json | null
          response_time_ms?: number | null
          service_name?: string
          success?: boolean | null
        }
        Relationships: []
      }
      article_analytics: {
        Row: {
          article_id: string
          average_time_on_page: number | null
          bounce_rate: number | null
          conversion_count: number | null
          created_at: string | null
          date_recorded: string
          id: string
          social_shares: number | null
          source_breakdown: Json | null
          visit_count: number | null
        }
        Insert: {
          article_id: string
          average_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_count?: number | null
          created_at?: string | null
          date_recorded: string
          id?: string
          social_shares?: number | null
          source_breakdown?: Json | null
          visit_count?: number | null
        }
        Update: {
          article_id?: string
          average_time_on_page?: number | null
          bounce_rate?: number | null
          conversion_count?: number | null
          created_at?: string | null
          date_recorded?: string
          id?: string
          social_shares?: number | null
          source_breakdown?: Json | null
          visit_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "article_analytics_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      article_social_posts: {
        Row: {
          article_id: string
          content: string
          created_at: string | null
          engagement_metrics: Json | null
          id: string
          image_url: string | null
          platform: string
          post_url: string | null
          posted_at: string | null
          scheduled_for: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          article_id: string
          content: string
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          image_url?: string | null
          platform: string
          post_url?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          article_id?: string
          content?: string
          created_at?: string | null
          engagement_metrics?: Json | null
          id?: string
          image_url?: string | null
          platform?: string
          post_url?: string | null
          posted_at?: string | null
          scheduled_for?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "article_social_posts_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
        ]
      }
      articles: {
        Row: {
          author_id: string | null
          category: string
          content: string
          created_at: string | null
          engagement_score: number | null
          featured_image: string | null
          id: string
          meta_description: string | null
          moral_level: number | null
          publish_date: string | null
          seo_keywords: string[] | null
          status: string
          title: string
          updated_at: string | null
          view_count: number | null
          voice_base64: string | null
          voice_file_name: string | null
          voice_generated: boolean | null
          voice_url: string | null
        }
        Insert: {
          author_id?: string | null
          category: string
          content: string
          created_at?: string | null
          engagement_score?: number | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          moral_level?: number | null
          publish_date?: string | null
          seo_keywords?: string[] | null
          status?: string
          title: string
          updated_at?: string | null
          view_count?: number | null
          voice_base64?: string | null
          voice_file_name?: string | null
          voice_generated?: boolean | null
          voice_url?: string | null
        }
        Update: {
          author_id?: string | null
          category?: string
          content?: string
          created_at?: string | null
          engagement_score?: number | null
          featured_image?: string | null
          id?: string
          meta_description?: string | null
          moral_level?: number | null
          publish_date?: string | null
          seo_keywords?: string[] | null
          status?: string
          title?: string
          updated_at?: string | null
          view_count?: number | null
          voice_base64?: string | null
          voice_file_name?: string | null
          voice_generated?: boolean | null
          voice_url?: string | null
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
      commission_tiers: {
        Row: {
          commission_rate: number
          created_at: string
          description: string | null
          id: string
          label: string
          max_level: number
          min_level: number
          updated_at: string
        }
        Insert: {
          commission_rate: number
          created_at?: string
          description?: string | null
          id?: string
          label: string
          max_level: number
          min_level: number
          updated_at?: string
        }
        Update: {
          commission_rate?: number
          created_at?: string
          description?: string | null
          id?: string
          label?: string
          max_level?: number
          min_level?: number
          updated_at?: string
        }
        Relationships: []
      }
      commissions: {
        Row: {
          affiliate_id: string | null
          amount: number
          commission_type: string
          created_at: string
          id: string
          paid_at: string | null
          referral_id: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          commission_type?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          commission_type?: string
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "monthly_top_performers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
        ]
      }
      content_themes: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          keywords: string[] | null
          name: string
          recommended_frequency: number | null
          target_audience: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          name: string
          recommended_frequency?: number | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          keywords?: string[] | null
          name?: string
          recommended_frequency?: number | null
          target_audience?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      influencer_assessments: {
        Row: {
          ai_analysis: string | null
          created_at: string
          end_time: string | null
          id: string
          influencer_id: string
          moral_level: number | null
          passed: boolean | null
          responses: Json | null
          score: number | null
          start_time: string
          status: string | null
        }
        Insert: {
          ai_analysis?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          influencer_id: string
          moral_level?: number | null
          passed?: boolean | null
          responses?: Json | null
          score?: number | null
          start_time?: string
          status?: string | null
        }
        Update: {
          ai_analysis?: string | null
          created_at?: string
          end_time?: string | null
          id?: string
          influencer_id?: string
          moral_level?: number | null
          passed?: boolean | null
          responses?: Json | null
          score?: number | null
          start_time?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencer_assessments_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      influencer_materials: {
        Row: {
          content_url: string
          created_at: string
          description: string | null
          id: string
          material_type: string
          min_moral_level: number
          name: string
          updated_at: string
        }
        Insert: {
          content_url: string
          created_at?: string
          description?: string | null
          id?: string
          material_type: string
          min_moral_level: number
          name: string
          updated_at?: string
        }
        Update: {
          content_url?: string
          created_at?: string
          description?: string | null
          id?: string
          material_type?: string
          min_moral_level?: number
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      influencers: {
        Row: {
          can_retry: boolean | null
          commission_rate: number | null
          cooldown_until: string | null
          created_at: string
          current_moral_level: number | null
          email: string
          followers_count: number | null
          id: string
          last_assessment_date: string | null
          name: string
          social_platforms: Json | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          can_retry?: boolean | null
          commission_rate?: number | null
          cooldown_until?: string | null
          created_at?: string
          current_moral_level?: number | null
          email: string
          followers_count?: number | null
          id?: string
          last_assessment_date?: string | null
          name: string
          social_platforms?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          can_retry?: boolean | null
          commission_rate?: number | null
          cooldown_until?: string | null
          created_at?: string
          current_moral_level?: number | null
          email?: string
          followers_count?: number | null
          id?: string
          last_assessment_date?: string | null
          name?: string
          social_platforms?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_materials: {
        Row: {
          asset_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          material_type: string
          title: string
          updated_at: string
        }
        Insert: {
          asset_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          material_type: string
          title: string
          updated_at?: string
        }
        Update: {
          asset_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          material_type?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      payout_requests: {
        Row: {
          affiliate_id: string | null
          amount: number
          created_at: string
          id: string
          notes: string | null
          payout_details: Json
          payout_method: string
          processed_at: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          affiliate_id?: string | null
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          payout_details?: Json
          payout_method: string
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_id?: string | null
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          payout_details?: Json
          payout_method?: string
          processed_at?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payout_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payout_requests_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "monthly_top_performers"
            referencedColumns: ["id"]
          },
        ]
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
      promo_codes: {
        Row: {
          affiliate_id: string | null
          code: string
          created_at: string
          discount_fixed: number | null
          discount_percent: number | null
          id: string
          is_active: boolean
          updated_at: string
          usage_count: number
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          affiliate_id?: string | null
          code: string
          created_at?: string
          discount_fixed?: number | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          affiliate_id?: string | null
          code?: string
          created_at?: string
          discount_fixed?: number | null
          discount_percent?: number | null
          id?: string
          is_active?: boolean
          updated_at?: string
          usage_count?: number
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "promo_codes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_codes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promo_codes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "monthly_top_performers"
            referencedColumns: ["id"]
          },
        ]
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
      referrals: {
        Row: {
          affiliate_id: string | null
          commission_earned: number | null
          converted_at: string | null
          converted_plan_id: string | null
          created_at: string
          expires_at: string
          id: string
          ip_address: string | null
          referral_code: string
          referred_user_id: string | null
          referrer_url: string | null
          status: string
          user_agent: string | null
        }
        Insert: {
          affiliate_id?: string | null
          commission_earned?: number | null
          converted_at?: string | null
          converted_plan_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          referral_code: string
          referred_user_id?: string | null
          referrer_url?: string | null
          status?: string
          user_agent?: string | null
        }
        Update: {
          affiliate_id?: string | null
          commission_earned?: number | null
          converted_at?: string | null
          converted_plan_id?: string | null
          created_at?: string
          expires_at?: string
          id?: string
          ip_address?: string | null
          referral_code?: string
          referred_user_id?: string | null
          referrer_url?: string | null
          status?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliate_profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "monthly_top_performers"
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
      site_settings: {
        Row: {
          admin_email: string
          created_at: string | null
          id: string
          maintenance_mode: boolean
          site_name: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          admin_email: string
          created_at?: string | null
          id?: string
          maintenance_mode?: boolean
          site_name: string
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          admin_email?: string
          created_at?: string | null
          id?: string
          maintenance_mode?: boolean
          site_name?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      user_advertising_data: {
        Row: {
          affiliate_sales_performance: Json | null
          conversion_rate: number | null
          created_at: string | null
          global_coordinates: unknown | null
          id: string
          interest_based_segmentation: Json | null
          most_viewed_tmh_content: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          affiliate_sales_performance?: Json | null
          conversion_rate?: number | null
          created_at?: string | null
          global_coordinates?: unknown | null
          id?: string
          interest_based_segmentation?: Json | null
          most_viewed_tmh_content?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          affiliate_sales_performance?: Json | null
          conversion_rate?: number | null
          created_at?: string | null
          global_coordinates?: unknown | null
          id?: string
          interest_based_segmentation?: Json | null
          most_viewed_tmh_content?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_demographics: {
        Row: {
          age_range: string | null
          country: string | null
          created_at: string | null
          device_type: string | null
          gender: string | null
          id: string
          primary_language: string | null
          region: string | null
          timezone: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          age_range?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          gender?: string | null
          id?: string
          primary_language?: string | null
          region?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          age_range?: string | null
          country?: string | null
          created_at?: string | null
          device_type?: string | null
          gender?: string | null
          id?: string
          primary_language?: string | null
          region?: string | null
          timezone?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      user_engagement: {
        Row: {
          ai_content_interaction: Json | null
          average_scores: Json | null
          created_at: string | null
          id: string
          influencer_status: boolean | null
          platform_engagement_score: number | null
          preferred_assessment_category: string | null
          referral_source: string | null
          shared_content: Json | null
          total_assessments_taken: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_content_interaction?: Json | null
          average_scores?: Json | null
          created_at?: string | null
          id?: string
          influencer_status?: boolean | null
          platform_engagement_score?: number | null
          preferred_assessment_category?: string | null
          referral_source?: string | null
          shared_content?: Json | null
          total_assessments_taken?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_content_interaction?: Json | null
          average_scores?: Json | null
          created_at?: string | null
          id?: string
          influencer_status?: boolean | null
          platform_engagement_score?: number | null
          preferred_assessment_category?: string | null
          referral_source?: string | null
          shared_content?: Json | null
          total_assessments_taken?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      user_morality: {
        Row: {
          contradictions_detected: boolean | null
          created_at: string | null
          emotional_response_patterns: Json | null
          id: string
          moral_level: number | null
          moral_progression_history: Json | null
          predicted_moral_level: number | null
          response_time_tracking: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          contradictions_detected?: boolean | null
          created_at?: string | null
          emotional_response_patterns?: Json | null
          id?: string
          moral_level?: number | null
          moral_progression_history?: Json | null
          predicted_moral_level?: number | null
          response_time_tracking?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          contradictions_detected?: boolean | null
          created_at?: string | null
          emotional_response_patterns?: Json | null
          id?: string
          moral_level?: number | null
          moral_progression_history?: Json | null
          predicted_moral_level?: number | null
          response_time_tracking?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      admin_analytics_summary: {
        Row: {
          average_conversion_rate: number | null
          average_engagement: number | null
          average_moral_level: number | null
          total_influencers: number | null
          total_users: number | null
        }
        Relationships: []
      }
      affiliate_leaderboard: {
        Row: {
          achievements_count: number | null
          id: string | null
          name: string | null
          rank: number | null
          tier: string | null
          total_conversions: number | null
          total_earnings: number | null
        }
        Relationships: []
      }
      monthly_top_performers: {
        Row: {
          id: string | null
          month: string | null
          month_earnings: number | null
          month_rank: number | null
          name: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      generate_referral_code: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_age_range_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          age_range: string
          user_count: number
        }[]
      }
      get_country_moral_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          country: string
          avg_moral_level: number
          user_count: number
        }[]
      }
      get_gender_moral_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          gender: string
          moral_level: number
          user_count: number
        }[]
      }
      get_moral_level_distribution: {
        Args: Record<PropertyKey, never>
        Returns: {
          moral_level: number
          user_count: number
        }[]
      }
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
