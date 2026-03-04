import { useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import Topbar from "@/components/Topbar";
import ProfileSwitcher from "@/components/ProfileSwitcher";
import DashboardPage from "@/pages/DashboardPage";
import NetworkingPage from "@/pages/NetworkingPage";
import CoachingPage from "@/pages/CoachingPage";
import EventsPage from "@/pages/EventsPage";
import GenericPage from "@/pages/GenericPage";

const pageConfigs: Record<string, { title: string; subtitle: string; description: string }> = {
  pitchdeck: { title: 'Créez un pitch <span class="text-primary">irrésistible</span>', subtitle: "Pitch Deck Builder", description: "Templates conçus avec des VCs, IA pour optimiser votre storytelling, et export prêt à envoyer." },
  fundraising: { title: 'Pilotez votre <span class="text-primary">levée de fonds</span>', subtitle: "Fundraising Tracker", description: "Suivez vos investisseurs, gérez votre pipeline et optimisez votre stratégie de levée." },
  marketing: { title: 'Acquérez des <span class="text-primary">clients & partenaires</span>', subtitle: "Outils Marketing & Prospection", description: "CRM intégré, génération de leads, automation marketing et analytics de performance." },
  analytics: { title: 'Mesurez votre <span class="text-primary">performance</span>', subtitle: "Analytics & Reporting", description: "Tableaux de bord, KPIs en temps réel et rapports automatisés pour piloter votre croissance." },
  feed: { title: "L'<span class=\"text-primary\">écosystème</span> en direct", subtitle: "Fil d'actualité — Communauté GrowHubLink", description: "Partagez, réagissez, commentez — chaque action est visible par tout votre réseau." },
  progression: { title: 'Ma <span class="text-primary">progression</span> 🌟', subtitle: "Parcours & Badges", description: "Suivez vos objectifs, débloquez des badges et mesurez vos avancées concrètes." },
  notifications: { title: 'Vos <span class="text-primary">notifications</span>', subtitle: "Centre de notifications", description: "Toutes vos alertes, demandes et mises à jour en un seul endroit." },
  settings: { title: '<span class="text-primary">Paramètres</span>', subtitle: "Configuration du compte", description: "Gérez votre profil, préférences et paramètres de sécurité." },
};

export default function Index() {
  const [activePage, setActivePage] = useState("dashboard");
  const [activeProfile, setActiveProfile] = useState("startup");

  const navigate = (page: string) => setActivePage(page);

  const renderPage = () => {
    switch (activePage) {
      case "dashboard": return <DashboardPage onNavigate={navigate} />;
      case "networking": return <NetworkingPage onNavigate={navigate} />;
      case "coaching": return <CoachingPage onNavigate={navigate} />;
      case "events": return <EventsPage />;
      default: {
        const config = pageConfigs[activePage];
        if (config) return <GenericPage pageId={activePage} {...config} />;
        return <DashboardPage onNavigate={navigate} />;
      }
    }
  };

  return (
    <div className="flex min-h-screen scrollbar-thin">
      <AppSidebar activePage={activePage} onNavigate={navigate} />
      <div className="ml-[68px] flex-1 flex flex-col min-h-screen">
        <Topbar onNavigate={navigate} />
        <ProfileSwitcher activeProfile={activeProfile} onSwitch={setActiveProfile} />
        <div className="p-7 flex-1">
          {renderPage()}
        </div>
      </div>
    </div>
  );
}
