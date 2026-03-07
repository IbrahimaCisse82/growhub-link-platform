import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import DashboardPage from "@/pages/DashboardPage";
import NetworkingPage from "@/pages/NetworkingPage";
import CoachingPage from "@/pages/CoachingPage";
import EventsPage from "@/pages/EventsPage";
import FeedPage from "@/pages/FeedPage";
import MessagingPage from "@/pages/MessagingPage";
import ProfilePage from "@/pages/ProfilePage";
import NotificationsPage from "@/pages/NotificationsPage";
import FundraisingPage from "@/pages/FundraisingPage";
import PitchDeckPage from "@/pages/PitchDeckPage";
import ObjectivesPage from "@/pages/ObjectivesPage";
import BadgesPage from "@/pages/BadgesPage";
import GenericPage from "@/pages/GenericPage";
import OnboardingQuestionnaire from "@/components/OnboardingQuestionnaire";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const pageConfigs: Record<string, { title: string; subtitle: string; description: string }> = {
  marketing: { title: 'Acquérez des <span class="text-primary">clients & partenaires</span>', subtitle: "Outils Marketing & Prospection", description: "CRM intégré, génération de leads, automation marketing et analytics de performance." },
  analytics: { title: 'Mesurez votre <span class="text-primary">performance</span>', subtitle: "Analytics & Reporting", description: "Tableaux de bord, KPIs en temps réel et rapports automatisés pour piloter votre croissance." },
  settings: { title: '<span class="text-primary">Paramètres</span>', subtitle: "Configuration du compte", description: "Gérez votre profil, préférences et paramètres de sécurité." },
};

export default function Index() {
  const [activePage, setActivePage] = useState("dashboard");
  const [onboardingDone, setOnboardingDone] = useState(false);
  const { user, profile } = useAuth();

  const { data: userRole } = useQuery({
    queryKey: ["user-role", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user!.id).limit(1).maybeSingle();
      return data?.role ?? "startup";
    },
  });

  // Show onboarding if profile exists but key fields are empty
  const needsOnboarding = profile && !onboardingDone && !profile.sector && !profile.company_name && (!profile.skills || profile.skills.length === 0);

  const activeProfile = userRole ?? "startup";
  const navigate = (page: string) => setActivePage(page);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage onNavigate={navigate} />;
      case "networking": return <NetworkingPage onNavigate={navigate} />;
      case "coaching": return <CoachingPage onNavigate={navigate} />;
      case "events": return <EventsPage />;
      case "feed": return <FeedPage />;
      case "messaging": return <MessagingPage />;
      case "profile": return <ProfilePage />;
      case "notifications": return <NotificationsPage />;
      case "fundraising": return <FundraisingPage />;
      case "pitchdeck": return <PitchDeckPage />;
      case "progression": return <ObjectivesPage />;
      case "badges": return <BadgesPage />;
      default: {
        const config = pageConfigs[activePage];
        if (config) return <GenericPage pageId={activePage} {...config} />;
        return <DashboardPage onNavigate={navigate} />;
      }
    }
  };

  if (needsOnboarding) {
    return <OnboardingQuestionnaire onComplete={() => setOnboardingDone(true)} />;
  }

  return (
    <div className="flex min-h-screen scrollbar-thin">
      <AppSidebar activePage={activePage} onNavigate={navigate} activeRole={activeProfile} />
      <div className="ml-[68px] flex-1 flex flex-col min-h-screen">
        <Topbar onNavigate={navigate} />
        <div className="p-7 flex-1">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
