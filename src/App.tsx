import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Layout from "./components/Layout";
import AuthPage from "./pages/AuthPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import NotFound from "./pages/NotFound";
import DashboardPage from "./pages/DashboardPage";
import NetworkingPage from "./pages/NetworkingPage";
import CoachingPage from "./pages/CoachingPage";
import EventsPage from "./pages/EventsPage";
import FeedPage from "./pages/FeedPage";
import MessagingPage from "./pages/MessagingPage";
import ProfilePage from "./pages/ProfilePage";
import PublicProfilePage from "./pages/PublicProfilePage";
import NotificationsPage from "./pages/NotificationsPage";
import FundraisingPage from "./pages/FundraisingPage";
import PitchDeckPage from "./pages/PitchDeckPage";
import ObjectivesPage from "./pages/ObjectivesPage";
import BadgesPage from "./pages/BadgesPage";
import SettingsPage from "./pages/SettingsPage";
import GenericPage from "./pages/GenericPage";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (!user) return <Navigate to="/auth" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

const pageConfigs: Record<string, { title: string; subtitle: string; description: string }> = {
  marketing: { title: 'Acquérez des <span class="text-primary">clients & partenaires</span>', subtitle: "Outils Marketing & Prospection", description: "CRM intégré, génération de leads, automation marketing et analytics de performance." },
  analytics: { title: 'Mesurez votre <span class="text-primary">performance</span>', subtitle: "Analytics & Reporting", description: "Tableaux de bord, KPIs en temps réel et rapports automatisés pour piloter votre croissance." },
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Routes>
                <Route path="/auth" element={<AuthRoute />} />
                <Route path="/reset-password" element={<ResetPasswordPage />} />
                <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                  <Route index element={<DashboardPage />} />
                  <Route path="networking" element={<NetworkingPage />} />
                  <Route path="coaching" element={<CoachingPage />} />
                  <Route path="events" element={<EventsPage />} />
                  <Route path="feed" element={<FeedPage />} />
                  <Route path="messaging" element={<MessagingPage />} />
                  <Route path="profile" element={<ProfilePage />} />
                  <Route path="profile/:userId" element={<PublicProfilePage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                  <Route path="fundraising" element={<FundraisingPage />} />
                  <Route path="pitchdeck" element={<PitchDeckPage />} />
                  <Route path="progression" element={<ObjectivesPage />} />
                  <Route path="badges" element={<BadgesPage />} />
                  <Route path="settings" element={<SettingsPage />} />
                  <Route path="marketing" element={<GenericPage pageId="marketing" {...pageConfigs.marketing} />} />
                  <Route path="analytics" element={<GenericPage pageId="analytics" {...pageConfigs.analytics} />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
