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
          id: string
          invite_token: string
          invited_by: string
          organization_id: string
          role: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string
          email: string
          expires_at: string
          id?: string
          invite_token: string
          invited_by: string
          organization_id: string
          role?: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invite_token?: string
          invited_by?: string
          organization_id?: string
          role?: string
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
          id: string
          name: string
          slug: string | null
          updated_at: string
        }
        Insert: {
          approved_domains?: string[] | null
          created_at?: string
          created_by: string
          id?: string
          name: string
          slug?: string | null
          updated_at?: string
        }
        Update: {
          approved_domains?: string[] | null
          created_at?: string
          created_by?: string
          id?: string
          name?: string
          slug?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          first_name: string | null
          id: string
          language: string | null
          last_name: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          language?: string | null
          last_name?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          language?: string | null
          last_name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_old_editing_sessions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
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
      get_organizations_by_email_domain: {
        Args: { p_email: string }
        Returns: {
          id: string
          name: string
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
