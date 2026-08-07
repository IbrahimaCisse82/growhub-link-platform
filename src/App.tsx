import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/hooks/useAuth";
import { ThemeProvider } from "@/components/ThemeProvider";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import Layout from "./components/Layout";
import RoleGuard from "./components/RoleGuard";
import ToolGuard from "./components/ToolGuard";

// Routes are code-split per page (performance budget: initial bundle < 250 Ko gzip)
const AuthPage = lazy(() => import("./pages/AuthPage"));
const ResetPasswordPage = lazy(() => import("./pages/ResetPasswordPage"));
const NotFound = lazy(() => import("./pages/NotFound"));
const LandingPage = lazy(() => import("./pages/LandingPage"));
const DashboardPage = lazy(() => import("./pages/DashboardPage"));
const NetworkingPage = lazy(() => import("./pages/NetworkingPage"));
const CoachingPage = lazy(() => import("./pages/CoachingPage"));
const EventsPage = lazy(() => import("./pages/EventsPage"));
const FeedPage = lazy(() => import("./pages/FeedPage"));
const MessagingPage = lazy(() => import("./pages/MessagingPage"));
const ProfilePage = lazy(() => import("./pages/ProfilePage"));
const PublicProfilePage = lazy(() => import("./pages/PublicProfilePage"));
const NotificationsPage = lazy(() => import("./pages/NotificationsPage"));
const FundraisingPage = lazy(() => import("./pages/FundraisingPage"));
const PitchDeckPage = lazy(() => import("./pages/PitchDeckPage"));
const ObjectivesPage = lazy(() => import("./pages/ObjectivesPage"));
const BadgesPage = lazy(() => import("./pages/BadgesPage"));
const SettingsPage = lazy(() => import("./pages/SettingsPage"));
const AnalyticsPage = lazy(() => import("./pages/AnalyticsPage"));
const MarketingPage = lazy(() => import("./pages/MarketingPage"));
const ReferralPage = lazy(() => import("./pages/ReferralPage"));
const CirclesPage = lazy(() => import("./pages/CirclesPage"));
const PricingPage = lazy(() => import("./pages/PricingPage"));
const CompanyPage = lazy(() => import("./pages/CompanyPage"));
const WarmIntrosPage = lazy(() => import("./pages/WarmIntrosPage"));
const SpeedNetworkingPage = lazy(() => import("./pages/SpeedNetworkingPage"));
const SpacesPage = lazy(() => import("./pages/SpacesPage"));
const ContentCalendarPage = lazy(() => import("./pages/ContentCalendarPage"));
const DealRoomPage = lazy(() => import("./pages/DealRoomPage"));
const DealRoomDetailPage = lazy(() => import("./pages/DealRoomDetailPage"));
const ChallengesPage = lazy(() => import("./pages/ChallengesPage"));
const ROIDashboardPage = lazy(() => import("./pages/ROIDashboardPage"));
const ModerationPage = lazy(() => import("./pages/ModerationPage"));
const MarketplacePage = lazy(() => import("./pages/MarketplacePage"));
const TemplatesPage = lazy(() => import("./pages/TemplatesPage"));
const AdminDashboardPage = lazy(() => import("./pages/AdminDashboardPage"));
const AdminBackOfficePage = lazy(() => import("./pages/AdminBackOfficePage"));
const ProductAnalyticsPage = lazy(() => import("./pages/ProductAnalyticsPage"));
const BookmarksPage = lazy(() => import("./pages/BookmarksPage"));
const MentorDashboardPage = lazy(() => import("./pages/MentorDashboardPage"));
const CoachStudioPage = lazy(() => import("./pages/CoachStudioPage"));
const BecomeCoachPage = lazy(() => import("./pages/BecomeCoachPage"));
const InvestorDealFlowPage = lazy(() => import("./pages/InvestorDealFlowPage"));
const IncubatorCohortsPage = lazy(() => import("./pages/IncubatorCohortsPage"));
const FreelancePipelinePage = lazy(() => import("./pages/FreelancePipelinePage"));
const AmbassadorsPage = lazy(() => import("./pages/AmbassadorsPage"));
const CoursesPage = lazy(() => import("./pages/CoursesPage"));
const StudentCareerPage = lazy(() => import("./pages/StudentCareerPage"));
const CorporateInnovationPage = lazy(() => import("./pages/CorporateInnovationPage"));
const ProDevelopmentPage = lazy(() => import("./pages/ProDevelopmentPage"));
const AspirationalExplorerPage = lazy(() => import("./pages/AspirationalExplorerPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 30_000,
    },
  },
});

/** Skeleton shown while a route chunk loads (never a full-screen spinner). */
function RouteSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-4" role="status" aria-busy="true" aria-live="polite">
      <Skeleton className="h-8 w-1/3" />
      <Skeleton className="h-4 w-2/3" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
        <Skeleton className="h-32 w-full rounded-2xl" />
      </div>
      <Skeleton className="h-64 w-full rounded-2xl" />
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading) return <RouteSkeleton />;
  if (!user) return <Navigate to="/welcome" replace />;
  return <>{children}</>;
}

function AuthRoute() {
  const { user, loading } = useAuth();
  if (loading) return <RouteSkeleton />;
  if (user) return <Navigate to="/" replace />;
  return <AuthPage />;
}

function LandingRoute() {
  const { user, loading } = useAuth();
  if (loading) return <RouteSkeleton />;
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
              <Suspense fallback={<RouteSkeleton />}>
                <Routes>
                  <Route path="/welcome" element={<LandingRoute />} />
                  <Route path="/pricing" element={<PricingPage />} />
                  <Route path="/ambassadors" element={<AmbassadorsPage />} />
                  <Route path="/auth" element={<AuthRoute />} />
                  <Route path="/reset-password" element={<ResetPasswordPage />} />
                  <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                    <Route index element={<DashboardPage />} />
                    {/* Community — always accessible */}
                    <Route path="networking" element={<NetworkingPage />} />
                    <Route path="events" element={<EventsPage />} />
                    <Route path="feed" element={<FeedPage />} />
                    <Route path="messaging" element={<MessagingPage />} />
                    <Route path="circles" element={<CirclesPage />} />
                    <Route path="speed-networking" element={<SpeedNetworkingPage />} />
                    <Route path="spaces" element={<SpacesPage />} />
                    <Route path="warm-intros" element={<WarmIntrosPage />} />
                    {/* Profile & settings — always accessible */}
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/:userId" element={<PublicProfilePage />} />
                    <Route path="notifications" element={<NotificationsPage />} />
                    <Route path="settings" element={<SettingsPage />} />
                    <Route path="referral" element={<ReferralPage />} />
                    <Route path="bookmarks" element={<BookmarksPage />} />
                    <Route path="marketplace" element={<MarketplacePage />} />
                    <Route path="company" element={<CompanyPage />} />
                    <Route path="courses" element={<CoursesPage />} />
                    {/* Tools — require activation via marketplace */}
                    <Route path="pitchdeck" element={<ToolGuard toolKey="pitchdeck"><PitchDeckPage /></ToolGuard>} />
                    <Route path="fundraising" element={<ToolGuard toolKey="fundraising"><RoleGuard allowedRoles={["startup", "incubateur"]}><FundraisingPage /></RoleGuard></ToolGuard>} />
                    <Route path="coaching" element={<ToolGuard toolKey="coaching"><CoachingPage /></ToolGuard>} />
                    <Route path="content-calendar" element={<ToolGuard toolKey="content-calendar"><ContentCalendarPage /></ToolGuard>} />
                    <Route path="deal-room" element={<ToolGuard toolKey="deal-room"><RoleGuard allowedRoles={["investor", "corporate", "startup"]}><DealRoomPage /></RoleGuard></ToolGuard>} />
                    <Route path="deal-room/:id" element={<ToolGuard toolKey="deal-room"><RoleGuard allowedRoles={["investor", "corporate", "startup"]}><DealRoomDetailPage /></RoleGuard></ToolGuard>} />
                    <Route path="templates" element={<ToolGuard toolKey="templates"><TemplatesPage /></ToolGuard>} />
                    <Route path="challenges" element={<ToolGuard toolKey="challenges"><ChallengesPage /></ToolGuard>} />
                    <Route path="marketing" element={<ToolGuard toolKey="marketing"><MarketingPage /></ToolGuard>} />
                    <Route path="analytics" element={<ToolGuard toolKey="analytics"><AnalyticsPage /></ToolGuard>} />
                    <Route path="roi" element={<ToolGuard toolKey="roi"><ROIDashboardPage /></ToolGuard>} />
                    <Route path="progression" element={<ToolGuard toolKey="progression"><ObjectivesPage /></ToolGuard>} />
                    <Route path="badges" element={<ToolGuard toolKey="badges"><BadgesPage /></ToolGuard>} />
                    {/* Role-specific pages — role + tool guard */}
                    <Route path="mentor-dashboard" element={<RoleGuard allowedRoles={["mentor"]}><MentorDashboardPage /></RoleGuard>} />
                    <Route path="coach-studio" element={<CoachStudioPage />} />
                    <Route path="become-coach" element={<BecomeCoachPage />} />
                    <Route path="deal-flow" element={<RoleGuard allowedRoles={["investor"]}><InvestorDealFlowPage /></RoleGuard>} />
                    <Route path="cohorts" element={<RoleGuard allowedRoles={["incubateur"]}><IncubatorCohortsPage /></RoleGuard>} />
                    <Route path="pipeline" element={<RoleGuard allowedRoles={["freelance", "expert"]}><FreelancePipelinePage /></RoleGuard>} />
                    <Route path="career" element={<RoleGuard allowedRoles={["etudiant"]}><StudentCareerPage /></RoleGuard>} />
                    <Route path="open-innovation" element={<RoleGuard allowedRoles={["corporate"]}><CorporateInnovationPage /></RoleGuard>} />
                    <Route path="dev-goals" element={<RoleGuard allowedRoles={["professionnel"]}><ProDevelopmentPage /></RoleGuard>} />
                    <Route path="explorer" element={<RoleGuard allowedRoles={["aspirationnel"]}><AspirationalExplorerPage /></RoleGuard>} />
                    <Route path="moderation" element={<ModerationPage />} />
                    <Route path="admin" element={<AdminDashboardPage />} />
                    <Route path="admin/back-office" element={<AdminBackOfficePage />} />
                    <Route path="admin/analytics" element={<ProductAnalyticsPage />} />
                  </Route>
                  <Route path="/dashboard" element={<Navigate to="/" replace />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
