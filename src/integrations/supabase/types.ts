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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      // ── Existing tables (game/book) ─────────────────────────────────────
      book_codes: {
        Row: { id: string; code: string; created_at: string }
        Insert: { id?: string; code: string; created_at?: string }
        Update: { id?: string; code?: string; created_at?: string }
      }
      book_progress: {
        Row: { id: string; user_id: string; chapter: number; created_at: string }
        Insert: { id?: string; user_id: string; chapter: number; created_at?: string }
        Update: { id?: string; user_id?: string; chapter?: number; created_at?: string }
      }
      book_registrations: {
        Row: { id: string; email: string; created_at: string }
        Insert: { id?: string; email: string; created_at?: string }
        Update: { id?: string; email?: string; created_at?: string }
      }
      waitlist: {
        Row: { id: string; email: string; created_at: string }
        Insert: { id?: string; email: string; created_at?: string }
        Update: { id?: string; email?: string; created_at?: string }
      }
      user_profiles: {
        Row: { id: string; user_id: string; display_name: string | null; created_at: string }
        Insert: { id?: string; user_id: string; display_name?: string | null; created_at?: string }
        Update: { id?: string; user_id?: string; display_name?: string | null; created_at?: string }
      }
      game_sessions: {
        Row: { id: string; created_at: string }
        Insert: { id?: string; created_at?: string }
        Update: { id?: string; created_at?: string }
      }
      game_players: {
        Row: { id: string; session_id: string; name: string; created_at: string }
        Insert: { id?: string; session_id: string; name: string; created_at?: string }
        Update: { id?: string; session_id?: string; name?: string; created_at?: string }
      }
      game_companies: {
        Row: { id: string; session_id: string; name: string; created_at: string }
        Insert: { id?: string; session_id: string; name: string; created_at?: string }
        Update: { id?: string; session_id?: string; name?: string; created_at?: string }
      }
      game_shareholdings: {
        Row: { id: string; company_id: string; player_id: string; shares: number; created_at: string }
        Insert: { id?: string; company_id: string; player_id: string; shares: number; created_at?: string }
        Update: { id?: string; company_id?: string; player_id?: string; shares?: number; created_at?: string }
      }
      game_transactions: {
        Row: { id: string; session_id: string; amount: number; created_at: string }
        Insert: { id?: string; session_id: string; amount: number; created_at?: string }
        Update: { id?: string; session_id?: string; amount?: number; created_at?: string }
      }
      club_classes: {
        Row: { id: string; name: string; created_at: string }
        Insert: { id?: string; name: string; created_at?: string }
        Update: { id?: string; name?: string; created_at?: string }
      }
      club_students: {
        Row: { id: string; class_id: string; name: string; created_at: string }
        Insert: { id?: string; class_id: string; name: string; created_at?: string }
        Update: { id?: string; class_id?: string; name?: string; created_at?: string }
      }
      club_lessons: {
        Row: { id: string; class_id: string; title: string; created_at: string }
        Insert: { id?: string; class_id: string; title: string; created_at?: string }
        Update: { id?: string; class_id?: string; title?: string; created_at?: string }
      }
      club_challenges: {
        Row: { id: string; lesson_id: string; description: string; created_at: string }
        Insert: { id?: string; lesson_id: string; description: string; created_at?: string }
        Update: { id?: string; lesson_id?: string; description?: string; created_at?: string }
      }
      club_submissions: {
        Row: { id: string; challenge_id: string; student_id: string; content: string; created_at: string }
        Insert: { id?: string; challenge_id: string; student_id: string; content: string; created_at?: string }
        Update: { id?: string; challenge_id?: string; student_id?: string; content?: string; created_at?: string }
      }
      club_lean_canvas: {
        Row: { id: string; class_id: string; content: Json; created_at: string }
        Insert: { id?: string; class_id: string; content: Json; created_at?: string }
        Update: { id?: string; class_id?: string; content?: Json; created_at?: string }
      }
      club_pitches: {
        Row: { id: string; class_id: string; content: string; created_at: string }
        Insert: { id?: string; class_id: string; content: string; created_at?: string }
        Update: { id?: string; class_id?: string; content?: string; created_at?: string }
      }

      // ── Junior Finance Buddy tables ─────────────────────────────────────
      jfb_children: {
        Row: {
          id: string
          user_id: string | null
          parent_id: string | null
          name: string
          avatar: string
          coins: number
          xp: number
          level: number
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          parent_id?: string | null
          name: string
          avatar?: string
          coins?: number
          xp?: number
          level?: number
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          parent_id?: string | null
          name?: string
          avatar?: string
          coins?: number
          xp?: number
          level?: number
          created_at?: string
        }
      }
      jfb_parents: {
        Row: {
          id: string
          user_id: string | null
          name: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          created_at?: string
        }
      }
      jfb_transactions: {
        Row: {
          id: string
          child_id: string
          type: "chore" | "lesson" | "investment" | "reward" | "deposit" | "withdrawal"
          amount: number
          description: string
          icon: string
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          type: "chore" | "lesson" | "investment" | "reward" | "deposit" | "withdrawal"
          amount: number
          description: string
          icon?: string
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          type?: "chore" | "lesson" | "investment" | "reward" | "deposit" | "withdrawal"
          amount?: number
          description?: string
          icon?: string
          created_at?: string
        }
      }
      jfb_chores: {
        Row: {
          id: string
          parent_id: string
          name: string
          emoji: string
          coins: number
          is_obligatory: boolean
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          emoji?: string
          coins?: number
          is_obligatory?: boolean
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          emoji?: string
          coins?: number
          is_obligatory?: boolean
          active?: boolean
          created_at?: string
        }
      }
      jfb_chore_submissions: {
        Row: {
          id: string
          chore_id: string
          child_id: string
          status: "pending" | "approved" | "rejected"
          submitted_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          chore_id: string
          child_id: string
          status?: "pending" | "approved" | "rejected"
          submitted_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          chore_id?: string
          child_id?: string
          status?: "pending" | "approved" | "rejected"
          submitted_at?: string
          reviewed_at?: string | null
        }
      }
      jfb_savings_goals: {
        Row: {
          id: string
          child_id: string
          name: string
          emoji: string
          target_coins: number
          saved_coins: number
          completed: boolean
          created_at: string
        }
        Insert: {
          id?: string
          child_id: string
          name: string
          emoji?: string
          target_coins: number
          saved_coins?: number
          completed?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          name?: string
          emoji?: string
          target_coins?: number
          saved_coins?: number
          completed?: boolean
          created_at?: string
        }
      }
      jfb_rewards: {
        Row: {
          id: string
          parent_id: string
          name: string
          emoji: string
          cost: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          parent_id: string
          name: string
          emoji?: string
          cost: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          parent_id?: string
          name?: string
          emoji?: string
          cost?: number
          active?: boolean
          created_at?: string
        }
      }
      jfb_reward_requests: {
        Row: {
          id: string
          reward_id: string
          child_id: string
          status: "pending" | "approved" | "rejected"
          requested_at: string
          reviewed_at: string | null
        }
        Insert: {
          id?: string
          reward_id: string
          child_id: string
          status?: "pending" | "approved" | "rejected"
          requested_at?: string
          reviewed_at?: string | null
        }
        Update: {
          id?: string
          reward_id?: string
          child_id?: string
          status?: "pending" | "approved" | "rejected"
          requested_at?: string
          reviewed_at?: string | null
        }
      }
      jfb_lesson_progress: {
        Row: {
          id: string
          child_id: string
          lesson_id: string
          lesson_title: string
          xp_earned: number
          coins_earned: number
          completed_at: string
        }
        Insert: {
          id?: string
          child_id: string
          lesson_id: string
          lesson_title: string
          xp_earned?: number
          coins_earned?: number
          completed_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          lesson_id?: string
          lesson_title?: string
          xp_earned?: number
          coins_earned?: number
          completed_at?: string
        }
      }
      jfb_stock_holdings: {
        Row: {
          id: string
          child_id: string
          ticker: string
          company_name: string
          emoji: string
          shares: number
          avg_buy_price: number
          updated_at: string
        }
        Insert: {
          id?: string
          child_id: string
          ticker: string
          company_name: string
          emoji?: string
          shares?: number
          avg_buy_price?: number
          updated_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          ticker?: string
          company_name?: string
          emoji?: string
          shares?: number
          avg_buy_price?: number
          updated_at?: string
        }
      }
      jfb_startup_investments: {
        Row: {
          id: string
          child_id: string
          startup_name: string
          emoji: string
          shares: number
          price_per_share: number
          invested_at: string
        }
        Insert: {
          id?: string
          child_id: string
          startup_name: string
          emoji?: string
          shares?: number
          price_per_share?: number
          invested_at?: string
        }
        Update: {
          id?: string
          child_id?: string
          startup_name?: string
          emoji?: string
          shares?: number
          price_per_share?: number
          invested_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      jfb_add_coins: {
        Args: { p_child_id: string; p_amount: number; p_xp?: number }
        Returns: undefined
      }
      jfb_seed_default_chores: {
        Args: { p_parent_id: string }
        Returns: undefined
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
