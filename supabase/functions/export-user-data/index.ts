import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

/**
 * GDPR right of access — exhaustive export of every public table that stores
 * data attached to the requesting user. Each entry maps a table to the column(s)
 * that reference the user; multiple columns are OR-ed.
 */
const USER_TABLES: Record<string, string[]> = {
  ai_coach_conversations: ["user_id"],
  ambassadors: ["user_id"],
  aspirational_journey: ["user_id"],
  blocked_users: ["blocker_id"],
  bookmarks: ["user_id"],
  challenge_participants: ["user_id"],
  circle_members: ["user_id"],
  circles: ["created_by"],
  coach_applications: ["user_id"],
  coaches: ["user_id"],
  coaching_disputes: ["opened_by"],
  coaching_payments: ["learner_id"],
  coaching_sessions: ["learner_id"],
  collaborations: ["user_id"],
  comments: ["author_id"],
  company_members: ["user_id"],
  company_pages: ["owner_id"],
  connections: ["requester_id", "receiver_id"],
  course_enrollments: ["user_id"],
  courses: ["created_by"],
  deal_room_audit_logs: ["user_id"],
  deal_room_documents: ["uploaded_by"],
  deal_room_members: ["user_id"],
  deal_room_ndas: ["user_id"],
  deal_rooms: ["owner_id"],
  endorsements: ["endorser_id", "endorsed_id"],
  event_registrations: ["user_id"],
  event_reminders: ["user_id"],
  events: ["organizer_id"],
  fundraising_metrics: ["user_id"],
  fundraising_rounds: ["user_id"],
  intent_profiles: ["user_id"],
  investor_contacts: ["user_id"],
  kyc_verifications: ["user_id"],
  leads: ["user_id"],
  marketplace_services: ["user_id"],
  message_reports: ["reporter_id"],
  message_templates: ["user_id"],
  messages: ["sender_id", "receiver_id"],
  milestones: ["user_id"],
  notification_preferences: ["user_id"],
  notifications: ["user_id"],
  objectives: ["user_id"],
  pitch_decks: ["user_id"],
  poll_votes: ["user_id"],
  post_reactions: ["user_id"],
  post_reports: ["reporter_id"],
  posts: ["author_id"],
  pro_development_goals: ["user_id"],
  profiles: ["user_id"],
  recommendations: ["author_id", "target_id"],
  referrals: ["referrer_id", "referred_id"],
  reposts: ["user_id"],
  space_members: ["user_id"],
  space_messages: ["user_id"],
  space_tasks: ["created_by"],
  spaces: ["created_by"],
  speed_networking_participants: ["user_id"],
  speed_networking_sessions: ["created_by"],
  student_applications: ["user_id"],
  student_career_profiles: ["user_id"],
  tool_activation_events: ["user_id"],
  user_activated_tools: ["user_id"],
  user_badges: ["user_id"],
  user_roles: ["user_id"],
  warm_intros: ["requester_id"],
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user }, error: userErr } = await supabase.auth.getUser();
    if (userErr || !user) {
      return new Response(JSON.stringify({ error: "Non authentifié" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const entries = Object.entries(USER_TABLES);
    const results = await Promise.all(
      entries.map(async ([table, columns]) => {
        try {
          let query = supabase.from(table).select("*");
          query = columns.length === 1
            ? query.eq(columns[0], user.id)
            : query.or(columns.map((c) => `${c}.eq.${user.id}`).join(","));
          const { data, error } = await query;
          // RLS may legitimately hide rows; never fail the whole export on one table.
          if (error) return [table, { error: error.message }] as const;
          return [table, data ?? []] as const;
        } catch (e) {
          return [table, { error: (e as Error).message }] as const;
        }
      }),
    );

    const exportPayload = {
      exported_at: new Date().toISOString(),
      format_version: 2,
      user: { id: user.id, email: user.email, created_at: user.created_at },
      data: Object.fromEntries(results),
    };

    return new Response(JSON.stringify(exportPayload, null, 2), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Content-Disposition": `attachment; filename="growhub-export-${user.id}.json"`,
      },
    });
  } catch (e) {
    console.error("export-user-data failure", (e as Error).message);
    return new Response(JSON.stringify({ error: "Erreur lors de l'export" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
