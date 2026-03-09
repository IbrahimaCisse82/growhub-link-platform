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
      ai_coach_conversations: {
        Row: {
          created_at: string
          id: string
          messages: Json
          topic: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          topic?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          topic?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
      bookmarks: {
        Row: {
          created_at: string
          id: string
          item_id: string
          item_type: string
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          item_id: string
          item_type?: string
          note?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          item_id?: string
          item_type?: string
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          completed: boolean | null
          completed_at: string | null
          current_value: number | null
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number | null
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          completed?: boolean | null
          completed_at?: string | null
          current_value?: number | null
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          challenge_type: string
          created_at: string
          description: string | null
          ends_at: string
          id: string
          is_active: boolean | null
          reward_points: number | null
          starts_at: string
          target_value: number
          title: string
        }
        Insert: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          starts_at?: string
          target_value?: number
          title: string
        }
        Update: {
          challenge_type?: string
          created_at?: string
          description?: string | null
          ends_at?: string
          id?: string
          is_active?: boolean | null
          reward_points?: number | null
          starts_at?: string
          target_value?: number
          title?: string
        }
        Relationships: []
      }
      circle_members: {
        Row: {
          circle_id: string
          id: string
          joined_at: string
          role: string
          user_id: string
        }
        Insert: {
          circle_id: string
          id?: string
          joined_at?: string
          role?: string
          user_id: string
        }
        Update: {
          circle_id?: string
          id?: string
          joined_at?: string
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "circle_members_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
      }
      circles: {
        Row: {
          category: string | null
          cover_image_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_private: boolean | null
          max_members: number | null
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          cover_image_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_private?: boolean | null
          max_members?: number | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      coach_reviews: {
        Row: {
          coach_id: string
          created_at: string
          id: string
          is_public: boolean | null
          rating: number
          review_text: string | null
          reviewer_id: string
          session_id: string | null
        }
        Insert: {
          coach_id: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating: number
          review_text?: string | null
          reviewer_id: string
          session_id?: string | null
        }
        Update: {
          coach_id?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          rating?: number
          review_text?: string | null
          reviewer_id?: string
          session_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coach_reviews_coach_id_fkey"
            columns: ["coach_id"]
            isOneToOne: false
            referencedRelation: "coaches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coach_reviews_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "coaching_sessions"
            referencedColumns: ["id"]
          },
        ]
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
      collaborations: {
        Row: {
          collaboration_type: string
          created_at: string
          description: string | null
          ended_at: string | null
          id: string
          partner_id: string
          started_at: string | null
          user_id: string
        }
        Insert: {
          collaboration_type?: string
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          partner_id: string
          started_at?: string | null
          user_id: string
        }
        Update: {
          collaboration_type?: string
          created_at?: string
          description?: string | null
          ended_at?: string | null
          id?: string
          partner_id?: string
          started_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      company_members: {
        Row: {
          company_id: string
          id: string
          joined_at: string
          role: string | null
          title: string | null
          user_id: string
        }
        Insert: {
          company_id: string
          id?: string
          joined_at?: string
          role?: string | null
          title?: string | null
          user_id: string
        }
        Update: {
          company_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          title?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "company_members_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "company_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      company_pages: {
        Row: {
          cover_url: string | null
          created_at: string
          description: string | null
          founded_year: number | null
          id: string
          is_public: boolean | null
          location: string | null
          logo_url: string | null
          metrics: Json | null
          name: string
          owner_id: string
          sector: string | null
          stage: string | null
          team_size: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          logo_url?: string | null
          metrics?: Json | null
          name: string
          owner_id: string
          sector?: string | null
          stage?: string | null
          team_size?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          cover_url?: string | null
          created_at?: string
          description?: string | null
          founded_year?: number | null
          id?: string
          is_public?: boolean | null
          location?: string | null
          logo_url?: string | null
          metrics?: Json | null
          name?: string
          owner_id?: string
          sector?: string | null
          stage?: string | null
          team_size?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: []
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
      deal_room_documents: {
        Row: {
          created_at: string
          deal_room_id: string
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          uploaded_by: string
        }
        Insert: {
          created_at?: string
          deal_room_id: string
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          uploaded_by: string
        }
        Update: {
          created_at?: string
          deal_room_id?: string
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_documents_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_room_members: {
        Row: {
          deal_room_id: string
          id: string
          invited_at: string
          nda_accepted: boolean | null
          nda_accepted_at: string | null
          role: string
          user_id: string
        }
        Insert: {
          deal_room_id: string
          id?: string
          invited_at?: string
          nda_accepted?: boolean | null
          nda_accepted_at?: string | null
          role?: string
          user_id: string
        }
        Update: {
          deal_room_id?: string
          id?: string
          invited_at?: string
          nda_accepted?: boolean | null
          nda_accepted_at?: string | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "deal_room_members_deal_room_id_fkey"
            columns: ["deal_room_id"]
            isOneToOne: false
            referencedRelation: "deal_rooms"
            referencedColumns: ["id"]
          },
        ]
      }
      deal_rooms: {
        Row: {
          access_code: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          nda_signed: boolean | null
          nda_signed_at: string | null
          owner_id: string
          startup_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          access_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          nda_signed?: boolean | null
          nda_signed_at?: string | null
          owner_id: string
          startup_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          access_code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          nda_signed?: boolean | null
          nda_signed_at?: string | null
          owner_id?: string
          startup_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      endorsements: {
        Row: {
          created_at: string
          endorsed_id: string
          endorser_id: string
          id: string
          skill: string
        }
        Insert: {
          created_at?: string
          endorsed_id: string
          endorser_id: string
          id?: string
          skill: string
        }
        Update: {
          created_at?: string
          endorsed_id?: string
          endorser_id?: string
          id?: string
          skill?: string
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
      intent_profiles: {
        Row: {
          category: string | null
          created_at: string
          expires_at: string | null
          id: string
          intent_text: string
          intent_type: string
          is_active: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          intent_text: string
          intent_type?: string
          is_active?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          intent_text?: string
          intent_type?: string
          is_active?: boolean | null
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
      marketplace_services: {
        Row: {
          category: string
          created_at: string
          currency: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          price: number | null
          price_type: string
          rating: number | null
          tags: string[] | null
          title: string
          total_bookings: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price?: number | null
          price_type?: string
          rating?: number | null
          tags?: string[] | null
          title: string
          total_bookings?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          currency?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          price?: number | null
          price_type?: string
          rating?: number | null
          tags?: string[] | null
          title?: string
          total_bookings?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      message_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          id: string
          is_public: boolean | null
          title: string
          updated_at: string
          usage_count: number | null
          user_id: string
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          title: string
          updated_at?: string
          usage_count?: number | null
          user_id: string
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          id?: string
          is_public?: boolean | null
          title?: string
          updated_at?: string
          usage_count?: number | null
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
      milestones: {
        Row: {
          description: string | null
          detected_at: string
          id: string
          is_shared: boolean | null
          milestone_type: string
          milestone_value: number | null
          title: string
          user_id: string
        }
        Insert: {
          description?: string | null
          detected_at?: string
          id?: string
          is_shared?: boolean | null
          milestone_type: string
          milestone_value?: number | null
          title: string
          user_id: string
        }
        Update: {
          description?: string | null
          detected_at?: string
          id?: string
          is_shared?: boolean | null
          milestone_type?: string
          milestone_value?: number | null
          title?: string
          user_id?: string
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
      poll_votes: {
        Row: {
          created_at: string
          id: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_index: number
          poll_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          option_index?: number
          poll_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          options: Json
          post_id: string
          question: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          post_id: string
          question: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          options?: Json
          post_id?: string
          question?: string
        }
        Relationships: [
          {
            foreignKeyName: "polls_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
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
          circle_id: string | null
          comments_count: number | null
          content: string
          created_at: string
          id: string
          is_pinned: boolean | null
          likes_count: number | null
          media_urls: string[] | null
          post_type: Database["public"]["Enums"]["post_type"]
          shares_count: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          author_id: string
          circle_id?: string | null
          comments_count?: number | null
          content: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"]
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          author_id?: string
          circle_id?: string | null
          comments_count?: number | null
          content?: string
          created_at?: string
          id?: string
          is_pinned?: boolean | null
          likes_count?: number | null
          media_urls?: string[] | null
          post_type?: Database["public"]["Enums"]["post_type"]
          shares_count?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "posts_circle_id_fkey"
            columns: ["circle_id"]
            isOneToOne: false
            referencedRelation: "circles"
            referencedColumns: ["id"]
          },
        ]
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
          headline: string | null
          id: string
          interests: string[] | null
          is_public: boolean | null
          is_verified: boolean | null
          last_login_date: string | null
          linkedin_url: string | null
          login_streak: number | null
          longest_streak: number | null
          looking_for: string[] | null
          network_score: number | null
          offering: string[] | null
          profile_views: number | null
          sector: string | null
          skills: string[] | null
          updated_at: string
          user_id: string
          verified_at: string | null
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
          headline?: string | null
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_login_date?: string | null
          linkedin_url?: string | null
          login_streak?: number | null
          longest_streak?: number | null
          looking_for?: string[] | null
          network_score?: number | null
          offering?: string[] | null
          profile_views?: number | null
          sector?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id: string
          verified_at?: string | null
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
          headline?: string | null
          id?: string
          interests?: string[] | null
          is_public?: boolean | null
          is_verified?: boolean | null
          last_login_date?: string | null
          linkedin_url?: string | null
          login_streak?: number | null
          longest_streak?: number | null
          looking_for?: string[] | null
          network_score?: number | null
          offering?: string[] | null
          profile_views?: number | null
          sector?: string | null
          skills?: string[] | null
          updated_at?: string
          user_id?: string
          verified_at?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      recommendations: {
        Row: {
          created_at: string
          id: string
          is_public: boolean | null
          message: string | null
          recommended_id: string
          recommender_id: string
          skill: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          message?: string | null
          recommended_id: string
          recommender_id: string
          skill: string
        }
        Update: {
          created_at?: string
          id?: string
          is_public?: boolean | null
          message?: string | null
          recommended_id?: string
          recommender_id?: string
          skill?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          converted_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          status: string
        }
        Insert: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          status?: string
        }
        Update: {
          converted_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reposts: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          original_post_id: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          original_post_id: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          original_post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reposts_original_post_id_fkey"
            columns: ["original_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      service_bookings: {
        Row: {
          buyer_id: string
          completed_at: string | null
          created_at: string
          id: string
          message: string | null
          rating: number | null
          review: string | null
          scheduled_at: string | null
          seller_id: string
          service_id: string
          status: string
          updated_at: string
        }
        Insert: {
          buyer_id: string
          completed_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          rating?: number | null
          review?: string | null
          scheduled_at?: string | null
          seller_id: string
          service_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          message?: string | null
          rating?: number | null
          review?: string | null
          scheduled_at?: string | null
          seller_id?: string
          service_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "marketplace_services"
            referencedColumns: ["id"]
          },
        ]
      }
      space_members: {
        Row: {
          id: string
          joined_at: string
          role: string
          space_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string
          role?: string
          space_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string
          role?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_members_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          space_id: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          space_id: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          space_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_messages_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      space_tasks: {
        Row: {
          assignee_id: string | null
          created_at: string
          created_by: string
          description: string | null
          due_date: string | null
          id: string
          priority: string | null
          space_id: string
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assignee_id?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          space_id: string
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assignee_id?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          due_date?: string | null
          id?: string
          priority?: string | null
          space_id?: string
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "space_tasks_space_id_fkey"
            columns: ["space_id"]
            isOneToOne: false
            referencedRelation: "spaces"
            referencedColumns: ["id"]
          },
        ]
      }
      spaces: {
        Row: {
          cover_color: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_archived: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          cover_color?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          cover_color?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_archived?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      speed_networking_participants: {
        Row: {
          feedback: string | null
          id: string
          joined_at: string
          matched_with: string | null
          rating: number | null
          session_id: string
          user_id: string
        }
        Insert: {
          feedback?: string | null
          id?: string
          joined_at?: string
          matched_with?: string | null
          rating?: number | null
          session_id: string
          user_id: string
        }
        Update: {
          feedback?: string | null
          id?: string
          joined_at?: string
          matched_with?: string | null
          rating?: number | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "speed_networking_participants_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "speed_networking_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      speed_networking_sessions: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          duration_minutes: number | null
          id: string
          max_participants: number | null
          scheduled_at: string
          status: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          max_participants?: number | null
          scheduled_at: string
          status?: string
          title?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          max_participants?: number | null
          scheduled_at?: string
          status?: string
          title?: string
        }
        Relationships: []
      }
      user_activated_tools: {
        Row: {
          activated_at: string
          id: string
          tool_key: string
          user_id: string
        }
        Insert: {
          activated_at?: string
          id?: string
          tool_key: string
          user_id: string
        }
        Update: {
          activated_at?: string
          id?: string
          tool_key?: string
          user_id?: string
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
      warm_intros: {
        Row: {
          created_at: string
          id: string
          introducer_id: string
          introducer_message: string | null
          message: string | null
          requester_id: string
          status: string
          target_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          introducer_id: string
          introducer_message?: string | null
          message?: string | null
          requester_id: string
          status?: string
          target_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          introducer_id?: string
          introducer_message?: string | null
          message?: string | null
          requester_id?: string
          status?: string
          target_id?: string
          updated_at?: string
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
      set_user_role: {
        Args: { _role: Database["public"]["Enums"]["app_role"] }
        Returns: undefined
      }
      update_login_streak: { Args: { _user_id: string }; Returns: undefined }
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
