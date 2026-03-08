import { useState } from "react";
import { Outlet } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import OnboardingQuestionnaire from "@/components/OnboardingQuestionnaire";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications, useRealtimeMessages } from "@/hooks/useRealtimeNotifications";

export default function Layout() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, refetchProfile } = useAuth();

  // Activate realtime listeners
  useRealtimeNotifications();
  useRealtimeMessages();

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).limit(1).maybeSingle();
      return data?.role ?? "startup";
    },
  });

  const needsOnboarding = profile && !onboardingDone && !profile.sector && !profile.company_name && (!profile.skills || profile.skills.length === 0);

  if (needsOnboarding) {
    return (
      <OnboardingQuestionnaire
        onComplete={() => {
          setOnboardingDone(true);
          refetchProfile();
        }}
      />
    );
  }

  const activeRole = userRole ?? "startup";

  return (
    <div className="flex min-h-screen scrollbar-thin">
      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[199] lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <AppSidebar activeRole={activeRole} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="lg:ml-[68px] flex-1 flex flex-col min-h-screen">
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main id="main-content" className="p-4 md:p-7 flex-1" role="main">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
