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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          category: string | null
          condition_type: string
          condition_value: number | null
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string | null
          condition_type: string
          condition_value?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
        }
        Update: {
          category?: string | null
          condition_type?: string
          condition_value?: number | null
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      coaches: {
        Row: {
          availability: Json | null
          created_at: string
          currency: string | null
          hourly_rate: number | null
          id: string
          is_active: boolean | null
          rating: number | null
          specialties: string[] | null
          total_reviews: number | null
          total_sessions: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          availability?: Json | null
          created_at?: string
          currency?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          availability?: Json | null
          created_at?: string
          currency?: string | null
          hourly_rate?: number | null
          id?: string
          is_active?: boolean | null
          rating?: number | null
          specialties?: string[] | null
          total_reviews?: number | null
          total_sessions?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      coaching_sessions: {
        Row: {
          coach_id: string
          created_at: string
          duration_minutes: number | null
          feedback: string | null
          id: string
          learner_id: string
          meeting_url: string | null
          notes: string | null
          rating: number | null
          scheduled_at: string
          status: Database["public"]["Enums"]["coaching_status"]
          topic: string | null
          updated_at: string
        }
        Insert: {
          coach_id: string
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          learner_id: string
          meeting_url?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_at: string
          status?: Database["public"]["Enums"]["coaching_status"]
          topic?: string | null
          updated_at?: string
        }
        Update: {
          coach_id?: string
          created_at?: string
          duration_minutes?: number | null
          feedback?: string | null
          id?: string
          learner_id?: string
          meeting_url?: string | null
          notes?: string | null
          rating?: number | null
          scheduled_at?: string
          status?: Database["public"]["Enums"]["coaching_status"]
          topic?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coaching_sessions_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string
          id: string
          likes_count: number | null
          parent_id: string | null
          post_id: string
          updated_at: string
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          parent_id?: string | null
          post_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connections: {
        Row: {
          created_at: string
          id: string
          match_score: number | null
          message: string | null
          receiver_id: string
          requester_id: string
          status: Database["public"]["Enums"]["connection_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          match_score?: number | null
          message?: string | null
          receiver_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          match_score?: number | null
          message?: string | null
          receiver_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["connection_status"]
          updated_at?: string
        }
        Relationships: []
      }
      event_registrations: {
        Row: {
          attended: boolean | null
          event_id: string
          id: string
          registered_at: string
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          event_id: string
          id?: string
          registered_at?: string
          user_id: string
        }
        Update: {
          attended?: boolean | null
          event_id?: string
          id?: string
          registered_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          ends_at: string | null
          event_type: Database["public"]["Enums"]["event_type"]
          id: string
          is_free: boolean | null
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_url: string | null
          organizer_id: string
          price: number | null
          starts_at: string
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_free?: boolean | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          organizer_id: string
          price?: number | null
          starts_at: string
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          ends_at?: string | null
          event_type?: Database["public"]["Enums"]["event_type"]
          id?: string
          is_free?: boolean | null
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_url?: string | null
          organizer_id?: string
          price?: number | null
          starts_at?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      fundraising_rounds: {
        Row: {
          closed_at: string | null
          created_at: string
          currency: string | null
          id: string
          name: string
          raised_amount: number | null
          stage: string | null
          started_at: string | null
          status: string | null
          target_amount: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          name: string
          raised_amount?: number | null
          stage?: string | null
          started_at?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          closed_at?: string | null
          created_at?: string
          currency?: string | null
          id?: string
          name?: string
          raised_amount?: number | null
          stage?: string | null
          started_at?: string | null
          status?: string | null
          target_amount?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      investor_contacts: {
        Row: {
          amount_committed: number | null
          created_at: string
          email: string | null
          firm: string | null
          id: string
          investor_name: string
          next_step: string | null
          next_step_date: string | null
          notes: string | null
          phone: string | null
          round_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_committed?: number | null
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          investor_name: string
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          phone?: string | null
          round_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_committed?: number | null
          created_at?: string
          email?: string | null
          firm?: string | null
          id?: string
          investor_name?: string
          next_step?: string | null
          next_step_date?: string | null
          notes?: string | null
          phone?: string | null
          round_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investor_contacts_round_id_fkey"
            columns: ["round_id"]
            isOneToOne: false
            referencedRelation: "fundraising_rounds"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          company: string | null
          created_at: string
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          source: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          badge_earned: boolean
          coaching_booked: boolean
          coaching_reminder: boolean
          connection_accepted: boolean
          connection_request: boolean
          created_at: string
          event_reminder: boolean
          id: string
          post_comment: boolean
          post_reaction: boolean
          system_notifications: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          badge_earned?: boolean
          coaching_booked?: boolean
          coaching_reminder?: boolean
          connection_accepted?: boolean
          connection_request?: boolean
          created_at?: string
          event_reminder?: boolean
          id?: string
          post_comment?: boolean
          post_reaction?: boolean
          system_notifications?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          badge_earned?: boolean
          coaching_booked?: boolean
          coaching_reminder?: boolean
          connection_accepted?: boolean
          connection_request?: boolean
          created_at?: string
          event_reminder?: boolean
          id?: string
          post_comment?: boolean
          post_reaction?: boolean
          system_notifications?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          message: string | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      objectives: {
        Row: {
          category: string | null
          created_at: string
          current_value: number | null
          deadline: string | null
          description: string | null
          id: string
          is_completed: boolean | null
          target_value: number | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_value?: number | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          current_value?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          is_completed?: boolean | null
          target_value?: number | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pitch_decks: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          slides: Json | null
          template: string | null
          title: string
          updated_at: string
          user_id: string
          view_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          slides?: Json | null
          template?: string | null
          title?: string
          updated_at?: string
          user_id: string
          view_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          slides?: Json | null
          template?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          view_count?: number | null
        }
        Relationships: []
      }
      post_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          emoji?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_reactions_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          post_type: Database["public"]["Enums"]["post_type"]
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"]
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"]
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          city: string | null
          company_name: string | null
          company_stage: string | null
          country: string | null
          created_at: string
          display_name: string
          id: string
          interests: string[] | null
          is_public: boolean | null
          linkedin_url: string | null
          network_score: number | null
          profile_views: number | null
          sector: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          website_url: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          company_stage?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          linkedin_url?: string | null
          network_score?: number | null
          profile_views?: number | null
          sector?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          website_url?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          city?: string | null
          company_name?: string | null
          company_stage?: string | null
          country?: string | null
          created_at?: string
          display_name?: string
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          linkedin_url?: string | null
          network_score?: number | null
          profile_views?: number | null
          sector?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          website_url?: string | null
        }
        Relationships: []
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      check_and_award_badges: { Args: { _user_id: string }; Returns: undefined }
      decrement_post_comments: { Args: { post_id: string }; Returns: undefined }
      decrement_post_likes: { Args: { post_id: string }; Returns: undefined }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_post_comments: { Args: { post_id: string }; Returns: undefined }
      increment_post_likes: { Args: { post_id: string }; Returns: undefined }
      increment_profile_views: {
        Args: { profile_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role:
        | "startup"
        | "mentor"
        | "investor"
        | "expert"
        | "admin"
        | "freelance"
        | "incubateur"
        | "etudiant"
        | "aspirationnel"
        | "professionnel"
        | "corporate"
      coaching_status: "scheduled" | "in_progress" | "completed" | "cancelled"
      connection_status: "pending" | "accepted" | "rejected" | "blocked"
      event_type: "webinar" | "workshop" | "meetup" | "conference" | "demo_day"
      notification_type:
        | "connection_request"
        | "connection_accepted"
        | "coaching_booked"
        | "coaching_reminder"
        | "event_reminder"
        | "post_reaction"
        | "post_comment"
        | "badge_earned"
        | "system"
      post_type: "text" | "milestone" | "question" | "resource" | "announcement"
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
    Enums: {
      app_role: [
        "startup",
        "mentor",
        "investor",
        "expert",
        "admin",
        "freelance",
        "incubateur",
        "etudiant",
        "aspirationnel",
        "professionnel",
        "corporate",
      ],
      coaching_status: ["scheduled", "in_progress", "completed", "cancelled"],
      connection_status: ["pending", "accepted", "rejected", "blocked"],
      event_type: ["webinar", "workshop", "meetup", "conference", "demo_day"],
      notification_type: [
        "connection_request",
        "connection_accepted",
        "coaching_booked",
        "coaching_reminder",
        "event_reminder",
        "post_reaction",
        "post_comment",
        "badge_earned",
        "system",
      ],
      post_type: ["text", "milestone", "question", "resource", "announcement"],
    },
  },
} as const
