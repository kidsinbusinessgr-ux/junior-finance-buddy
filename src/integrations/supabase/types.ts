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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      book_codes: {
        Row: {
          code: string
          created_at: string | null
          edition: string
          id: string
          max_uses: number | null
          use_count: number | null
        }
        Insert: {
          code: string
          created_at?: string | null
          edition?: string
          id?: string
          max_uses?: number | null
          use_count?: number | null
        }
        Update: {
          code?: string
          created_at?: string | null
          edition?: string
          id?: string
          max_uses?: number | null
          use_count?: number | null
        }
        Relationships: []
      }
      book_progress: {
        Row: {
          chapter_id: number
          coins_earned: number | null
          completed: boolean | null
          created_at: string | null
          id: string
          math_score: number | null
          quiz_score: number | null
          time_spent_seconds: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          chapter_id: number
          coins_earned?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          math_score?: number | null
          quiz_score?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          chapter_id?: number
          coins_earned?: number | null
          completed?: boolean | null
          created_at?: string | null
          id?: string
          math_score?: number | null
          quiz_score?: number | null
          time_spent_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      book_registrations: {
        Row: {
          child_age: number | null
          child_name: string
          id: string
          parent_email: string | null
          registered_at: string | null
        }
        Insert: {
          child_age?: number | null
          child_name: string
          id?: string
          parent_email?: string | null
          registered_at?: string | null
        }
        Update: {
          child_age?: number | null
          child_name?: string
          id?: string
          parent_email?: string | null
          registered_at?: string | null
        }
        Relationships: []
      }
      club_challenges: {
        Row: {
          class_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          lesson_id: string | null
          title: string
          week_number: number
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          title: string
          week_number: number
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lesson_id?: string | null
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "club_challenges_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "club_classes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_challenges_lesson_id_fkey"
            columns: ["lesson_id"]
            isOneToOne: false
            referencedRelation: "club_lessons"
            referencedColumns: ["id"]
          },
        ]
      }
      club_classes: {
        Row: {
          class_code: string
          created_at: string | null
          description: string | null
          id: string
          name: string
          school_year: string
          teacher_id: string | null
        }
        Insert: {
          class_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          school_year?: string
          teacher_id?: string | null
        }
        Update: {
          class_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          school_year?: string
          teacher_id?: string | null
        }
        Relationships: []
      }
      club_lean_canvas: {
        Row: {
          channels: string | null
          cost_structure: string | null
          customer_segments: string | null
          id: string
          key_metrics: string | null
          problem: string | null
          revenue_streams: string | null
          solution: string | null
          student_id: string | null
          unfair_advantage: string | null
          unique_value_prop: string | null
          updated_at: string | null
        }
        Insert: {
          channels?: string | null
          cost_structure?: string | null
          customer_segments?: string | null
          id?: string
          key_metrics?: string | null
          problem?: string | null
          revenue_streams?: string | null
          solution?: string | null
          student_id?: string | null
          unfair_advantage?: string | null
          unique_value_prop?: string | null
          updated_at?: string | null
        }
        Update: {
          channels?: string | null
          cost_structure?: string | null
          customer_segments?: string | null
          id?: string
          key_metrics?: string | null
          problem?: string | null
          revenue_streams?: string | null
          solution?: string | null
          student_id?: string | null
          unfair_advantage?: string | null
          unique_value_prop?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_lean_canvas_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "club_students"
            referencedColumns: ["id"]
          },
        ]
      }
      club_lessons: {
        Row: {
          class_id: string | null
          content: string | null
          created_at: string | null
          id: string
          material_name: string | null
          material_url: string | null
          title: string
          week_number: number
        }
        Insert: {
          class_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          material_name?: string | null
          material_url?: string | null
          title: string
          week_number: number
        }
        Update: {
          class_id?: string | null
          content?: string | null
          created_at?: string | null
          id?: string
          material_name?: string | null
          material_url?: string | null
          title?: string
          week_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "club_lessons_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "club_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      club_pitches: {
        Row: {
          content: string | null
          id: string
          logo_name: string | null
          logo_url: string | null
          student_id: string | null
          updated_at: string | null
        }
        Insert: {
          content?: string | null
          id?: string
          logo_name?: string | null
          logo_url?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string | null
          id?: string
          logo_name?: string | null
          logo_url?: string | null
          student_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_pitches_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: true
            referencedRelation: "club_students"
            referencedColumns: ["id"]
          },
        ]
      }
      club_students: {
        Row: {
          class_id: string | null
          created_at: string | null
          full_name: string
          id: string
          role: string | null
        }
        Insert: {
          class_id?: string | null
          created_at?: string | null
          full_name: string
          id?: string
          role?: string | null
        }
        Update: {
          class_id?: string | null
          created_at?: string | null
          full_name?: string
          id?: string
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_students_class_id_fkey"
            columns: ["class_id"]
            isOneToOne: false
            referencedRelation: "club_classes"
            referencedColumns: ["id"]
          },
        ]
      }
      club_submissions: {
        Row: {
          challenge_id: string | null
          content: string | null
          file_name: string | null
          file_url: string | null
          id: string
          student_id: string | null
          submitted_at: string | null
        }
        Insert: {
          challenge_id?: string | null
          content?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          student_id?: string | null
          submitted_at?: string | null
        }
        Update: {
          challenge_id?: string | null
          content?: string | null
          file_name?: string | null
          file_url?: string | null
          id?: string
          student_id?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "club_submissions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "club_challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "club_submissions_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "club_students"
            referencedColumns: ["id"]
          },
        ]
      }
      game_companies: {
        Row: {
          ad_text: string | null
          color: string | null
          cost_marketing: number | null
          cost_operational: number | null
          cost_staff: number | null
          created_at: string | null
          description: string | null
          emoji: string | null
          id: string
          name: string
          net_profit: number | null
          pitch_text: string | null
          player_id: string | null
          product_name: string | null
          product_price: number | null
          revenue: number | null
          session_id: string | null
          share_price: number | null
          shares_for_sale: number | null
          shares_sold: number | null
          total_costs: number | null
          units_sold: number | null
        }
        Insert: {
          ad_text?: string | null
          color?: string | null
          cost_marketing?: number | null
          cost_operational?: number | null
          cost_staff?: number | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          name: string
          net_profit?: number | null
          pitch_text?: string | null
          player_id?: string | null
          product_name?: string | null
          product_price?: number | null
          revenue?: number | null
          session_id?: string | null
          share_price?: number | null
          shares_for_sale?: number | null
          shares_sold?: number | null
          total_costs?: number | null
          units_sold?: number | null
        }
        Update: {
          ad_text?: string | null
          color?: string | null
          cost_marketing?: number | null
          cost_operational?: number | null
          cost_staff?: number | null
          created_at?: string | null
          description?: string | null
          emoji?: string | null
          id?: string
          name?: string
          net_profit?: number | null
          pitch_text?: string | null
          player_id?: string | null
          product_name?: string | null
          product_price?: number | null
          revenue?: number | null
          session_id?: string | null
          share_price?: number | null
          shares_for_sale?: number | null
          shares_sold?: number | null
          total_costs?: number | null
          units_sold?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_companies_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_companies_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_players: {
        Row: {
          coins: number | null
          id: string
          joined_at: string | null
          nickname: string
          session_id: string | null
        }
        Insert: {
          coins?: number | null
          id?: string
          joined_at?: string | null
          nickname: string
          session_id?: string | null
        }
        Update: {
          coins?: number | null
          id?: string
          joined_at?: string | null
          nickname?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "game_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      game_sessions: {
        Row: {
          class_code: string
          created_at: string | null
          current_round: number | null
          id: string
          starting_coins: number | null
          status: string | null
          teacher_name: string
          title: string
        }
        Insert: {
          class_code: string
          created_at?: string | null
          current_round?: number | null
          id?: string
          starting_coins?: number | null
          status?: string | null
          teacher_name: string
          title?: string
        }
        Update: {
          class_code?: string
          created_at?: string | null
          current_round?: number | null
          id?: string
          starting_coins?: number | null
          status?: string | null
          teacher_name?: string
          title?: string
        }
        Relationships: []
      }
      game_shareholdings: {
        Row: {
          coins_invested: number | null
          company_id: string | null
          created_at: string | null
          dividends_received: number | null
          id: string
          investor_id: string | null
          shares_owned: number | null
        }
        Insert: {
          coins_invested?: number | null
          company_id?: string | null
          created_at?: string | null
          dividends_received?: number | null
          id?: string
          investor_id?: string | null
          shares_owned?: number | null
        }
        Update: {
          coins_invested?: number | null
          company_id?: string | null
          created_at?: string | null
          dividends_received?: number | null
          id?: string
          investor_id?: string | null
          shares_owned?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "game_shareholdings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "game_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_shareholdings_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
        ]
      }
      game_transactions: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          player_id: string | null
          session_id: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          player_id?: string | null
          session_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          player_id?: string | null
          session_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "game_transactions_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "game_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "game_transactions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "game_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_achievements: {
        Row: {
          description_gr: string
          icon: string
          key: string
          name_gr: string
          sort_order: number | null
        }
        Insert: {
          description_gr: string
          icon: string
          key: string
          name_gr: string
          sort_order?: number | null
        }
        Update: {
          description_gr?: string
          icon?: string
          key?: string
          name_gr?: string
          sort_order?: number | null
        }
        Relationships: []
      }
      jfb_ai_usage: {
        Row: {
          count: number
          day: string
          kind: string
          user_id: string
        }
        Insert: {
          count?: number
          day?: string
          kind: string
          user_id: string
        }
        Update: {
          count?: number
          day?: string
          kind?: string
          user_id?: string
        }
        Relationships: []
      }
      jfb_allowances: {
        Row: {
          active: boolean
          amount_coins: number
          child_id: string | null
          created_at: string
          day_of_week: number
          id: string
          parent_id: string | null
          updated_at: string
        }
        Insert: {
          active?: boolean
          amount_coins?: number
          child_id?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Update: {
          active?: boolean
          amount_coins?: number
          child_id?: string | null
          created_at?: string
          day_of_week?: number
          id?: string
          parent_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_allowances_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfb_allowances_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "jfb_parents"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_child_achievements: {
        Row: {
          badge_key: string
          child_id: string
          earned_at: string
          id: string
        }
        Insert: {
          badge_key: string
          child_id: string
          earned_at?: string
          id?: string
        }
        Update: {
          badge_key?: string
          child_id?: string
          earned_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_child_achievements_badge_key_fkey"
            columns: ["badge_key"]
            isOneToOne: false
            referencedRelation: "jfb_achievements"
            referencedColumns: ["key"]
          },
          {
            foreignKeyName: "jfb_child_achievements_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_children: {
        Row: {
          avatar: string | null
          coins: number
          created_at: string | null
          current_streak: number
          id: string
          invite_code: string
          last_login_date: string | null
          level: number
          name: string
          parent_id: string | null
          user_id: string | null
          xp: number
        }
        Insert: {
          avatar?: string | null
          coins?: number
          created_at?: string | null
          current_streak?: number
          id?: string
          invite_code: string
          last_login_date?: string | null
          level?: number
          name: string
          parent_id?: string | null
          user_id?: string | null
          xp?: number
        }
        Update: {
          avatar?: string | null
          coins?: number
          created_at?: string | null
          current_streak?: number
          id?: string
          invite_code?: string
          last_login_date?: string | null
          level?: number
          name?: string
          parent_id?: string | null
          user_id?: string | null
          xp?: number
        }
        Relationships: [
          {
            foreignKeyName: "jfb_children_parent_fk"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "jfb_parents"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_chore_submissions: {
        Row: {
          child_id: string
          chore_id: string
          id: string
          reviewed_at: string | null
          status: string
          submitted_at: string | null
        }
        Insert: {
          child_id: string
          chore_id: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
        }
        Update: {
          child_id?: string
          chore_id?: string
          id?: string
          reviewed_at?: string | null
          status?: string
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jfb_chore_submissions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfb_chore_submissions_chore_id_fkey"
            columns: ["chore_id"]
            isOneToOne: false
            referencedRelation: "jfb_chores"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_chores: {
        Row: {
          active: boolean
          coins: number
          created_at: string | null
          emoji: string | null
          id: string
          is_obligatory: boolean
          name: string
          parent_id: string
        }
        Insert: {
          active?: boolean
          coins?: number
          created_at?: string | null
          emoji?: string | null
          id?: string
          is_obligatory?: boolean
          name: string
          parent_id: string
        }
        Update: {
          active?: boolean
          coins?: number
          created_at?: string | null
          emoji?: string | null
          id?: string
          is_obligatory?: boolean
          name?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_chores_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "jfb_parents"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_lesson_progress: {
        Row: {
          child_id: string
          coins_earned: number
          completed_at: string | null
          id: string
          lesson_id: string
          lesson_title: string
          xp_earned: number
        }
        Insert: {
          child_id: string
          coins_earned?: number
          completed_at?: string | null
          id?: string
          lesson_id: string
          lesson_title: string
          xp_earned?: number
        }
        Update: {
          child_id?: string
          coins_earned?: number
          completed_at?: string | null
          id?: string
          lesson_id?: string
          lesson_title?: string
          xp_earned?: number
        }
        Relationships: [
          {
            foreignKeyName: "jfb_lesson_progress_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_market_holdings: {
        Row: {
          avg_buy_price_eur: number
          child_id: string
          coins_invested: number
          company_name: string
          emoji: string
          shares: number
          ticker: string
          updated_at: string
        }
        Insert: {
          avg_buy_price_eur: number
          child_id: string
          coins_invested: number
          company_name: string
          emoji?: string
          shares: number
          ticker: string
          updated_at?: string
        }
        Update: {
          avg_buy_price_eur?: number
          child_id?: string
          coins_invested?: number
          company_name?: string
          emoji?: string
          shares?: number
          ticker?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_market_holdings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_notifications: {
        Row: {
          child_id: string
          created_at: string
          id: string
          message: string
          read: boolean
          type: string
        }
        Insert: {
          child_id: string
          created_at?: string
          id?: string
          message: string
          read?: boolean
          type: string
        }
        Update: {
          child_id?: string
          created_at?: string
          id?: string
          message?: string
          read?: boolean
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_notifications_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_parents: {
        Row: {
          created_at: string | null
          id: string
          name: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      jfb_premium_claims: {
        Row: {
          claimed_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          claimed_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          claimed_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: []
      }
      jfb_reward_requests: {
        Row: {
          child_id: string
          id: string
          requested_at: string | null
          reviewed_at: string | null
          reward_id: string
          status: string
        }
        Insert: {
          child_id: string
          id?: string
          requested_at?: string | null
          reviewed_at?: string | null
          reward_id: string
          status?: string
        }
        Update: {
          child_id?: string
          id?: string
          requested_at?: string | null
          reviewed_at?: string | null
          reward_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_reward_requests_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "jfb_reward_requests_reward_id_fkey"
            columns: ["reward_id"]
            isOneToOne: false
            referencedRelation: "jfb_rewards"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_rewards: {
        Row: {
          active: boolean
          cost: number
          created_at: string | null
          emoji: string | null
          id: string
          name: string
          parent_id: string
        }
        Insert: {
          active?: boolean
          cost: number
          created_at?: string | null
          emoji?: string | null
          id?: string
          name: string
          parent_id: string
        }
        Update: {
          active?: boolean
          cost?: number
          created_at?: string | null
          emoji?: string | null
          id?: string
          name?: string
          parent_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_rewards_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "jfb_parents"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_savings_goals: {
        Row: {
          child_id: string
          completed: boolean
          created_at: string | null
          emoji: string | null
          id: string
          name: string
          saved_coins: number
          target_coins: number
        }
        Insert: {
          child_id: string
          completed?: boolean
          created_at?: string | null
          emoji?: string | null
          id?: string
          name: string
          saved_coins?: number
          target_coins: number
        }
        Update: {
          child_id?: string
          completed?: boolean
          created_at?: string | null
          emoji?: string | null
          id?: string
          name?: string
          saved_coins?: number
          target_coins?: number
        }
        Relationships: [
          {
            foreignKeyName: "jfb_savings_goals_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_startup_investments: {
        Row: {
          child_id: string
          emoji: string | null
          id: string
          invested_at: string | null
          price_per_share: number
          shares: number
          startup_name: string
        }
        Insert: {
          child_id: string
          emoji?: string | null
          id?: string
          invested_at?: string | null
          price_per_share?: number
          shares?: number
          startup_name: string
        }
        Update: {
          child_id?: string
          emoji?: string | null
          id?: string
          invested_at?: string | null
          price_per_share?: number
          shares?: number
          startup_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_startup_investments_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_stock_holdings: {
        Row: {
          avg_buy_price: number
          child_id: string
          company_name: string
          emoji: string | null
          id: string
          shares: number
          ticker: string
          updated_at: string | null
        }
        Insert: {
          avg_buy_price?: number
          child_id: string
          company_name: string
          emoji?: string | null
          id?: string
          shares?: number
          ticker: string
          updated_at?: string | null
        }
        Update: {
          avg_buy_price?: number
          child_id?: string
          company_name?: string
          emoji?: string | null
          id?: string
          shares?: number
          ticker?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "jfb_stock_holdings_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      jfb_transactions: {
        Row: {
          amount: number
          child_id: string
          created_at: string | null
          description: string
          icon: string | null
          id: string
          type: string
        }
        Insert: {
          amount: number
          child_id: string
          created_at?: string | null
          description: string
          icon?: string | null
          id?: string
          type: string
        }
        Update: {
          amount?: number
          child_id?: string
          created_at?: string | null
          description?: string
          icon?: string | null
          id?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "jfb_transactions_child_id_fkey"
            columns: ["child_id"]
            isOneToOne: false
            referencedRelation: "jfb_children"
            referencedColumns: ["id"]
          },
        ]
      }
      push_subscriptions: {
        Row: {
          auth: string | null
          created_at: string | null
          endpoint: string
          id: string
          p256dh: string | null
          tickers: string[] | null
          updated_at: string | null
        }
        Insert: {
          auth?: string | null
          created_at?: string | null
          endpoint: string
          id?: string
          p256dh?: string | null
          tickers?: string[] | null
          updated_at?: string | null
        }
        Update: {
          auth?: string | null
          created_at?: string | null
          endpoint?: string
          id?: string
          p256dh?: string | null
          tickers?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      startup_investments: {
        Row: {
          coins: number
          created_at: string
          id: string
          investor_name: string
          startup_id: string
        }
        Insert: {
          coins?: number
          created_at?: string
          id?: string
          investor_name?: string
          startup_id: string
        }
        Update: {
          coins?: number
          created_at?: string
          id?: string
          investor_name?: string
          startup_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "startup_investments_startup_id_fkey"
            columns: ["startup_id"]
            isOneToOne: false
            referencedRelation: "startups"
            referencedColumns: ["id"]
          },
        ]
      }
      startups: {
        Row: {
          coins_raised: number
          created_at: string
          creator_name: string
          customer: string
          emoji: string
          id: string
          model: string
          name: string
          problem: string
          solution: string
        }
        Insert: {
          coins_raised?: number
          created_at?: string
          creator_name?: string
          customer: string
          emoji?: string
          id?: string
          model: string
          name: string
          problem: string
          solution: string
        }
        Update: {
          coins_raised?: number
          created_at?: string
          creator_name?: string
          customer?: string
          emoji?: string
          id?: string
          model?: string
          name?: string
          problem?: string
          solution?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          activated_at: string | null
          age: number | null
          book_code: string | null
          created_at: string | null
          email: string | null
          full_name: string
          id: string
        }
        Insert: {
          activated_at?: string | null
          age?: number | null
          book_code?: string | null
          created_at?: string | null
          email?: string | null
          full_name: string
          id: string
        }
        Update: {
          activated_at?: string | null
          age?: number | null
          book_code?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_book_code_fkey"
            columns: ["book_code"]
            isOneToOne: false
            referencedRelation: "book_codes"
            referencedColumns: ["code"]
          },
        ]
      }
      waitlist: {
        Row: {
          created_at: string | null
          email: string
          id: string
          type: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id?: string
          type: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      award_badge: {
        Args: { p_badge_key: string; p_child_id: string }
        Returns: undefined
      }
      jfb_add_coins: {
        Args: { p_amount: number; p_child_id: string; p_xp?: number }
        Returns: undefined
      }
      jfb_ai_take: {
        Args: { p_kind: string; p_limit: number; p_user: string }
        Returns: boolean
      }
      jfb_apply_coins: {
        Args: {
          p_amount: number
          p_child_id: string
          p_description: string
          p_icon: string
          p_type: string
        }
        Returns: number
      }
      jfb_approve_chore: {
        Args: { p_submission_id: string }
        Returns: undefined
      }
      jfb_approve_reward: { Args: { p_request_id: string }; Returns: undefined }
      jfb_check_invite: { Args: { p_code: string }; Returns: string }
      jfb_claim_invite: { Args: { p_code: string }; Returns: string }
      jfb_complete_lesson: {
        Args: {
          p_child_id: string
          p_lesson_id: string
          p_lesson_title: string
          p_score: number
          p_total: number
        }
        Returns: number
      }
      jfb_deposit_to_goal: {
        Args: { p_amount: number; p_goal_id: string }
        Returns: undefined
      }
      jfb_insert_default_chores: {
        Args: { p_parent_id: string }
        Returns: undefined
      }
      jfb_invest_startup: {
        Args: {
          p_child_id: string
          p_emoji: string
          p_quantity: number
          p_startup_name: string
        }
        Returns: undefined
      }
      jfb_is_child: { Args: { p_child_id: string }; Returns: boolean }
      jfb_is_parent_of: { Args: { p_child_id: string }; Returns: boolean }
      jfb_lesson_max_xp: { Args: { p_lesson_id: string }; Returns: number }
      jfb_market_trade: {
        Args: {
          p_child_id: string
          p_coins: number
          p_company: string
          p_emoji: string
          p_price_eur: number
          p_side: string
          p_ticker: string
        }
        Returns: number
      }
      jfb_parent_give_coins: {
        Args: { p_amount: number; p_child_id: string; p_note?: string }
        Returns: number
      }
      jfb_seed_default_chores: {
        Args: { p_parent_id: string }
        Returns: undefined
      }
      jfb_startup_price: { Args: { p_name: string }; Returns: number }
      jfb_stock_price: { Args: { p_ticker: string }; Returns: number }
      jfb_trade_stock: {
        Args: {
          p_child_id: string
          p_company: string
          p_emoji: string
          p_quantity: number
          p_side: string
          p_ticker: string
        }
        Returns: undefined
      }
      jfb_xp_to_level: { Args: { p_xp: number }; Returns: number }
      process_weekly_allowances: { Args: never; Returns: undefined }
      validate_and_use_book_code: {
        Args: { input_code: string }
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
