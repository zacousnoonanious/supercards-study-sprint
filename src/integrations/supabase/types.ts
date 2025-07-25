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
      ai_flashcard_generations: {
        Row: {
          created_at: string
          id: string
          prompt: string
          set_id: string
          status: string
          style: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          prompt: string
          set_id: string
          status?: string
          style: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          prompt?: string
          set_id?: string
          status?: string
          style?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_flashcard_generations_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      card_reviews: {
        Row: {
          card_id: string
          created_at: string
          ease_factor: number
          id: string
          interval_days: number
          next_review: string
          reviewed_at: string
          score: number
          user_id: string
        }
        Insert: {
          card_id: string
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          next_review: string
          reviewed_at?: string
          score: number
          user_id: string
        }
        Update: {
          card_id?: string
          created_at?: string
          ease_factor?: number
          id?: string
          interval_days?: number
          next_review?: string
          reviewed_at?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "card_reviews_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_collaborators: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          organization_id: string | null
          role: string
          set_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string | null
          role?: string
          set_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          organization_id?: string | null
          role?: string
          set_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deck_collaborators_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_collaborators_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      deck_invite_links: {
        Row: {
          created_at: string | null
          created_by: string
          current_uses: number | null
          expires_at: string | null
          id: string
          invite_token: string
          is_active: boolean | null
          max_uses: number | null
          organization_id: string | null
          password_hash: string | null
          role: string
          set_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          invite_token: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id?: string | null
          password_hash?: string | null
          role?: string
          set_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_uses?: number | null
          expires_at?: string | null
          id?: string
          invite_token?: string
          is_active?: boolean | null
          max_uses?: number | null
          organization_id?: string | null
          password_hash?: string | null
          role?: string
          set_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deck_invite_links_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "deck_invite_links_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      editing_sessions: {
        Row: {
          card_id: string | null
          created_at: string | null
          cursor_position: Json | null
          id: string
          last_seen: string | null
          set_id: string
          user_avatar: string | null
          user_id: string
          user_name: string
        }
        Insert: {
          card_id?: string | null
          created_at?: string | null
          cursor_position?: Json | null
          id?: string
          last_seen?: string | null
          set_id: string
          user_avatar?: string | null
          user_id: string
          user_name: string
        }
        Update: {
          card_id?: string | null
          created_at?: string | null
          cursor_position?: Json | null
          id?: string
          last_seen?: string | null
          set_id?: string
          user_avatar?: string | null
          user_id?: string
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "editing_sessions_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "editing_sessions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcard_sets: {
        Row: {
          collaboration_settings: Json | null
          created_at: string
          description: string | null
          id: string
          is_collaborative: boolean | null
          organization_id: string | null
          permanent_shuffle: boolean | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          collaboration_settings?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          organization_id?: string | null
          permanent_shuffle?: boolean | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          collaboration_settings?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_collaborative?: boolean | null
          organization_id?: string | null
          permanent_shuffle?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcard_sets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      flashcards: {
        Row: {
          answer: string
          back_elements: Json | null
          canvas_height: number | null
          canvas_width: number | null
          card_type: string | null
          countdown_behavior_back: string | null
          countdown_behavior_front: string | null
          countdown_timer: number | null
          countdown_timer_back: number | null
          countdown_timer_front: number | null
          created_at: string
          flips_before_next: number | null
          front_elements: Json | null
          hint: string | null
          id: string
          interactive_type: string | null
          last_reviewed_at: string | null
          metadata: Json | null
          password: string | null
          question: string
          set_id: string
          updated_at: string
        }
        Insert: {
          answer: string
          back_elements?: Json | null
          canvas_height?: number | null
          canvas_width?: number | null
          card_type?: string | null
          countdown_behavior_back?: string | null
          countdown_behavior_front?: string | null
          countdown_timer?: number | null
          countdown_timer_back?: number | null
          countdown_timer_front?: number | null
          created_at?: string
          flips_before_next?: number | null
          front_elements?: Json | null
          hint?: string | null
          id?: string
          interactive_type?: string | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          password?: string | null
          question: string
          set_id: string
          updated_at?: string
        }
        Update: {
          answer?: string
          back_elements?: Json | null
          canvas_height?: number | null
          canvas_width?: number | null
          card_type?: string | null
          countdown_behavior_back?: string | null
          countdown_behavior_front?: string | null
          countdown_timer?: number | null
          countdown_timer_back?: number | null
          countdown_timer_front?: number | null
          created_at?: string
          flips_before_next?: number | null
          front_elements?: Json | null
          hint?: string | null
          id?: string
          interactive_type?: string | null
          last_reviewed_at?: string | null
          metadata?: Json | null
          password?: string | null
          question?: string
          set_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "flashcards_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      imported_content_logs: {
        Row: {
          cards_imported: number | null
          created_at: string | null
          deck_id: string | null
          error_message: string | null
          id: string
          imported_at: string | null
          metadata: Json | null
          original_filename: string | null
          source: string
          source_url: string | null
          status: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cards_imported?: number | null
          created_at?: string | null
          deck_id?: string | null
          error_message?: string | null
          id?: string
          imported_at?: string | null
          metadata?: Json | null
          original_filename?: string | null
          source: string
          source_url?: string | null
          status?: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cards_imported?: number | null
          created_at?: string | null
          deck_id?: string | null
          error_message?: string | null
          id?: string
          imported_at?: string | null
          metadata?: Json | null
          original_filename?: string | null
          source?: string
          source_url?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "imported_content_logs_deck_id_fkey"
            columns: ["deck_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_decks: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          featured: boolean | null
          id: string
          is_active: boolean | null
          preview_card_count: number | null
          price: number
          rating: number | null
          rating_count: number | null
          seller_id: string
          set_id: string
          tags: string[] | null
          title: string
          total_downloads: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          preview_card_count?: number | null
          price?: number
          rating?: number | null
          rating_count?: number | null
          seller_id: string
          set_id: string
          tags?: string[] | null
          title: string
          total_downloads?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          featured?: boolean | null
          id?: string
          is_active?: boolean | null
          preview_card_count?: number | null
          price?: number
          rating?: number | null
          rating_count?: number | null
          seller_id?: string
          set_id?: string
          tags?: string[] | null
          title?: string
          total_downloads?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_decks_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_purchases: {
        Row: {
          buyer_id: string
          id: string
          marketplace_deck_id: string
          purchase_price: number
          purchased_at: string
          status: string
          stripe_payment_intent_id: string | null
        }
        Insert: {
          buyer_id: string
          id?: string
          marketplace_deck_id: string
          purchase_price: number
          purchased_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Update: {
          buyer_id?: string
          id?: string
          marketplace_deck_id?: string
          purchase_price?: number
          purchased_at?: string
          status?: string
          stripe_payment_intent_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_purchases_marketplace_deck_id_fkey"
            columns: ["marketplace_deck_id"]
            isOneToOne: false
            referencedRelation: "marketplace_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      marketplace_reviews: {
        Row: {
          created_at: string
          id: string
          marketplace_deck_id: string
          rating: number
          review_text: string | null
          reviewer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          marketplace_deck_id: string
          rating: number
          review_text?: string | null
          reviewer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          marketplace_deck_id?: string
          rating?: number
          review_text?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "marketplace_reviews_marketplace_deck_id_fkey"
            columns: ["marketplace_deck_id"]
            isOneToOne: false
            referencedRelation: "marketplace_decks"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_invites: {
        Row: {
          accepted_at: string | null
          created_at: string
          email: string
          expires_at: string
          first_name: string | null
          id: string
          invite_token: string
          invited_by: string
          last_name: string | null
          organization_id: string
          role: string
          status: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          first_name?: string | null
          id?: string
          invite_token: string
          invited_by: string
          last_name?: string | null
          organization_id: string
          role?: string
          status?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          first_name?: string | null
          id?: string
          invite_token?: string
          invited_by?: string
          last_name?: string | null
          organization_id?: string
          role?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_invites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_members: {
        Row: {
          created_at: string
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          organization_id: string
          pending_reason: string | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id: string
          pending_reason?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          organization_id?: string
          pending_reason?: string | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          approved_domains: string[] | null
          created_at: string
          created_by: string
          deleted_at: string | null
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          approved_domains?: string[] | null
          created_at?: string
          created_by: string
          deleted_at?: string | null
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          approved_domains?: string[] | null
          created_at?: string
          created_by?: string
          deleted_at?: string | null
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          created_by: string
          expires_at: string
          id: string
          token: string
          used_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          created_by: string
          expires_at?: string
          id?: string
          token: string
          used_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          created_by?: string
          expires_at?: string
          id?: string
          token?: string
          used_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          email: string | null
          first_name: string | null
          id: string
          language: string | null
          last_login: string | null
          last_name: string | null
          show_in_leaderboard: boolean | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id: string
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          show_in_leaderboard?: boolean | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          language?: string | null
          last_login?: string | null
          last_name?: string | null
          show_in_leaderboard?: boolean | null
          updated_at?: string
        }
        Relationships: []
      }
      study_sessions: {
        Row: {
          cards_reviewed: number | null
          correct_answers: number | null
          created_at: string
          ended_at: string | null
          id: string
          incorrect_answers: number | null
          organization_id: string | null
          set_id: string
          srs_enabled: boolean | null
          started_at: string
          study_mode: string | null
          total_time_seconds: number | null
          user_id: string
        }
        Insert: {
          cards_reviewed?: number | null
          correct_answers?: number | null
          created_at?: string
          ended_at?: string | null
          id?: string
          incorrect_answers?: number | null
          organization_id?: string | null
          set_id: string
          srs_enabled?: boolean | null
          started_at?: string
          study_mode?: string | null
          total_time_seconds?: number | null
          user_id: string
        }
        Update: {
          cards_reviewed?: number | null
          correct_answers?: number | null
          created_at?: string
          ended_at?: string | null
          id?: string
          incorrect_answers?: number | null
          organization_id?: string | null
          set_id?: string
          srs_enabled?: boolean | null
          started_at?: string
          study_mode?: string | null
          total_time_seconds?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "study_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "study_sessions_set_id_fkey"
            columns: ["set_id"]
            isOneToOne: false
            referencedRelation: "flashcard_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_description: string | null
          badge_name: string
          badge_type: string
          earned_at: string
          id: string
          metadata: Json | null
          organization_id: string | null
          user_id: string
        }
        Insert: {
          badge_description?: string | null
          badge_name: string
          badge_type: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id: string
        }
        Update: {
          badge_description?: string | null
          badge_name?: string
          badge_type?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_card_stats: {
        Row: {
          card_id: string
          correct_reviews: number | null
          created_at: string
          current_ease_factor: number | null
          current_interval_days: number | null
          id: string
          last_reviewed_at: string | null
          next_review_date: string | null
          total_reviews: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          card_id: string
          correct_reviews?: number | null
          created_at?: string
          current_ease_factor?: number | null
          current_interval_days?: number | null
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          card_id?: string
          correct_reviews?: number | null
          created_at?: string
          current_ease_factor?: number | null
          current_interval_days?: number | null
          id?: string
          last_reviewed_at?: string | null
          next_review_date?: string | null
          total_reviews?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_card_stats_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "flashcards"
            referencedColumns: ["id"]
          },
        ]
      }
      user_restrictions: {
        Row: {
          block_deck_creation: boolean | null
          can_change_own_password: boolean
          created_at: string
          created_by: string
          disable_chat: boolean | null
          disable_comments: boolean | null
          id: string
          organization_id: string
          updated_at: string
          user_id: string
          view_only_mode: boolean | null
        }
        Insert: {
          block_deck_creation?: boolean | null
          can_change_own_password?: boolean
          created_at?: string
          created_by: string
          disable_chat?: boolean | null
          disable_comments?: boolean | null
          id?: string
          organization_id: string
          updated_at?: string
          user_id: string
          view_only_mode?: boolean | null
        }
        Update: {
          block_deck_creation?: boolean | null
          can_change_own_password?: boolean
          created_at?: string
          created_by?: string
          disable_chat?: boolean | null
          disable_comments?: boolean | null
          id?: string
          organization_id?: string
          updated_at?: string
          user_id?: string
          view_only_mode?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "user_restrictions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_stats: {
        Row: {
          created_at: string
          current_streak: number | null
          id: string
          last_study_date: string | null
          longest_streak: number | null
          organization_id: string | null
          total_cards_reviewed: number | null
          total_study_time_seconds: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          organization_id?: string | null
          total_cards_reviewed?: number | null
          total_study_time_seconds?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_streak?: number | null
          id?: string
          last_study_date?: string | null
          longest_streak?: number | null
          organization_id?: string | null
          total_cards_reviewed?: number | null
          total_study_time_seconds?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_stats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard_stats: {
        Row: {
          avatar_url: string | null
          cards_rank: number | null
          current_streak: number | null
          display_name: string | null
          id: string | null
          last_study_date: string | null
          longest_streak: number | null
          overall_score: number | null
          streak_rank: number | null
          time_rank: number | null
          total_cards_reviewed: number | null
          total_study_time_seconds: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      accept_organization_invite: {
        Args: { invite_token: string; user_id: string }
        Returns: boolean
      }
      calculate_srs_values: {
        Args: {
          current_score: number
          previous_ease_factor?: number
          previous_interval?: number
        }
        Returns: {
          new_ease_factor: number
          new_interval: number
          next_review_date: string
        }[]
      }
      cleanup_old_editing_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      delete_organization: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      generate_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_org_invite_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_org_slug: {
        Args: { org_name: string }
        Returns: string
      }
      generate_reset_token: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      generate_temp_password: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_cards_due_for_review: {
        Args: { p_user_id: string; p_limit?: number }
        Returns: {
          card_id: string
          set_id: string
          next_review_date: string
          current_ease_factor: number
          total_reviews: number
        }[]
      }
      get_organizations_by_email_domain: {
        Args: { p_email: string }
        Returns: {
          id: string
          name: string
        }[]
      }
      get_user_leaderboard_position: {
        Args: { p_user_id: string }
        Returns: {
          streak_position: number
          cards_position: number
          time_position: number
          overall_position: number
          total_users: number
        }[]
      }
      hash_password: {
        Args: { password: string }
        Returns: string
      }
      is_domain_approved: {
        Args: { org_id: string; email: string }
        Returns: boolean
      }
      process_organization_join: {
        Args: {
          org_id: string
          user_id: string
          user_email: string
          invite_role?: string
        }
        Returns: string
      }
      update_user_streak: {
        Args: { p_user_id: string }
        Returns: undefined
      }
      verify_invite_password: {
        Args: { invite_token: string; password?: string }
        Returns: boolean
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
