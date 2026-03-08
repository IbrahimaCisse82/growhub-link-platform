import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import MobileBottomNav from "@/components/MobileBottomNav";
import OnboardingTour, { useOnboardingTour } from "@/components/OnboardingTour";
import ContextualHelp, { helpConfigs } from "@/components/ContextualHelp";
import OnboardingQuestionnaire from "@/components/OnboardingQuestionnaire";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeNotifications, useRealtimeMessages } from "@/hooks/useRealtimeNotifications";
import AICoachAssistant from "@/components/AICoachAssistant";

const routeToHelpKey: Record<string, string> = {
  "/": "dashboard",
  "/networking": "networking",
  "/coaching": "coaching",
  "/feed": "feed",
  "/messaging": "messaging",
  "/events": "events",
};

export default function Layout() {
  const [onboardingDone, setOnboardingDone] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, profile, refetchProfile } = useAuth();
  const location = useLocation();
  const { showTour, completeTour } = useOnboardingTour();

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

  // Get contextual help for current route
  const helpKey = Object.entries(routeToHelpKey).find(([path]) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  })?.[1];
  const helpConfig = helpKey ? helpConfigs[helpKey] : null;

  return (
    <div className="flex min-h-screen scrollbar-thin">
      {/* Onboarding Tour */}
      <OnboardingTour show={showTour} onComplete={completeTour} />

      {/* Mobile overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-black/50 z-[199] lg:hidden" onClick={() => setMobileMenuOpen(false)} />
      )}
      <AppSidebar activeRole={activeRole} mobileOpen={mobileMenuOpen} onMobileClose={() => setMobileMenuOpen(false)} />
      <div className="lg:ml-[68px] flex-1 flex flex-col min-h-screen">
        <Topbar onMobileMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} />
        <main id="main-content" className="p-4 md:p-7 flex-1 pb-20 lg:pb-7" role="main">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom nav */}
      <MobileBottomNav onMorePress={() => setMobileMenuOpen(true)} />

      {/* Contextual help */}
      {helpConfig && <ContextualHelp title={helpConfig.title} items={helpConfig.items} />}
    </div>
  );
}
