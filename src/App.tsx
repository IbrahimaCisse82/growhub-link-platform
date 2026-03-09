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
import LandingPage from "./pages/LandingPage";
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
import AnalyticsPage from "./pages/AnalyticsPage";
import MarketingPage from "./pages/MarketingPage";
import ReferralPage from "./pages/ReferralPage";
import CirclesPage from "./pages/CirclesPage";
import PricingPage from "./pages/PricingPage";
import CompanyPage from "./pages/CompanyPage";
import WarmIntrosPage from "./pages/WarmIntrosPage";
import SpeedNetworkingPage from "./pages/SpeedNetworkingPage";
import SpacesPage from "./pages/SpacesPage";
import ContentCalendarPage from "./pages/ContentCalendarPage";
import DealRoomPage from "./pages/DealRoomPage";
import ChallengesPage from "./pages/ChallengesPage";
import ROIDashboardPage from "./pages/ROIDashboardPage";
import ModerationPage from "./pages/ModerationPage";
import MarketplacePage from "./pages/MarketplacePage";
import TemplatesPage from "./pages/TemplatesPage";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import BookmarksPage from "./pages/BookmarksPage";
import MentorDashboardPage from "./pages/MentorDashboardPage";
import InvestorDealFlowPage from "./pages/InvestorDealFlowPage";
import IncubatorCohortsPage from "./pages/IncubatorCohortsPage";
import FreelancePipelinePage from "./pages/FreelancePipelinePage";
import RoleGuard from "./components/RoleGuard";

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
  if (!user) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

function LandingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Chargement...</div>;
  if (user) return <Navigate to="/" replace />;
  return <LandingPage />;
}

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
                <Route path="/welcome" element={<LandingRoute />} />
                <Route path="/pricing" element={<PricingPage />} />
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
                  <Route path="marketing" element={<MarketingPage />} />
                  <Route path="analytics" element={<AnalyticsPage />} />
                  <Route path="referral" element={<ReferralPage />} />
                  <Route path="circles" element={<CirclesPage />} />
                  <Route path="company" element={<CompanyPage />} />
                  <Route path="introductions" element={<WarmIntrosPage />} />
                  <Route path="speed-networking" element={<SpeedNetworkingPage />} />
                  <Route path="spaces" element={<SpacesPage />} />
                  <Route path="content-calendar" element={<ContentCalendarPage />} />
                  <Route path="deal-room" element={<DealRoomPage />} />
                  <Route path="challenges" element={<ChallengesPage />} />
                  <Route path="roi" element={<ROIDashboardPage />} />
                  <Route path="moderation" element={<ModerationPage />} />
                  <Route path="marketplace" element={<MarketplacePage />} />
                  <Route path="templates" element={<TemplatesPage />} />
                  <Route path="admin" element={<AdminDashboardPage />} />
                  <Route path="bookmarks" element={<BookmarksPage />} />
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
