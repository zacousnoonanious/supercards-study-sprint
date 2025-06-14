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
          role?: string
          set_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
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
          role?: string
          set_id?: string
          updated_at?: string | null
        }
        Relationships: [
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
          permanent_shuffle?: boolean | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
