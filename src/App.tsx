import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { DocumentsProvider } from "@/contexts/DocumentsContext";
import { CredentialsProvider } from "@/contexts/CredentialsContext";
import { CreditsProvider } from "@/contexts/CreditsContext";
import { PayersProvider } from "@/contexts/PayersContext";
import { UIProvider } from "@/contexts/UIContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GroupDashboardLayout } from "@/components/GroupDashboardLayout";
import React from "react";
// Provider pages
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import DashboardPage from "./pages/DashboardPage";
import DocumentVaultPage from "./pages/DocumentVaultPage";
import CredentialTrackerPage from "./pages/CredentialTrackerPage";
import ProfileBuilderPage from "./pages/ProfileBuilderPage";
import PacketGeneratorPage from "./pages/PacketGeneratorPage";
import ExpirationCalendarPage from "./pages/ExpirationCalendarPage";
import SettingsPage from "./pages/SettingsPage";
import NotFound from "./pages/NotFound";
import MyGroupsPage from "./pages/MyGroupsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CAQHManagerPage from "./pages/CAQHManagerPage";
import PacketHistoryPage from "./pages/PacketHistoryPage";

// Group admin pages
import GroupDashboardPage from "./pages/group/GroupDashboardPage";
import GroupProvidersPage from "./pages/group/GroupProvidersPage";
import GroupPayerWorkflowsPage from "./pages/group/GroupPayerWorkflowsPage";
import GroupCompliancePage from "./pages/group/GroupCompliancePage";
import GroupPacketGeneratorPage from "./pages/group/GroupPacketGeneratorPage";
import GroupSettingsPage from "./pages/group/GroupSettingsPage";
import GroupPacketHistoryPage from "./pages/group/GroupPacketHistoryPage";

const queryClient = new QueryClient();

function ProtectedRoute({
  children,
  requiredRole,
}: {
  children: React.ReactNode;
  requiredRole?: 'provider' | 'group_admin';
}) {
  const { isAuthenticated, role } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'group_admin' ? '/group/dashboard' : '/dashboard'} replace />;
  }
  return <>{children}</>;
}

function AppRoutes() {
  const { isAuthenticated, role } = useAuth();

  return (
    <Routes>
      {/* Public - Root shows login */}
      <Route path="/" element={
        isAuthenticated
          ? <Navigate to={role === 'group_admin' ? '/group/dashboard' : '/dashboard'} replace />
          : <LoginPage />
      } />
      <Route path="/login" element={
        isAuthenticated
          ? <Navigate to={role === 'group_admin' ? '/group/dashboard' : '/dashboard'} replace />
          : <LoginPage />
      } />
      <Route path="/signup" element={
        isAuthenticated
          ? <Navigate to={role === 'group_admin' ? '/group/dashboard' : '/dashboard'} replace />
          : <SignupPage />
      } />

      {/* Provider routes */}
      <Route element={<ProtectedRoute requiredRole="provider"><DashboardLayout /></ProtectedRoute>}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/documents" element={<DocumentVaultPage />} />
        <Route path="/credentials" element={<CredentialTrackerPage />} />
        <Route path="/profile" element={<ProfileBuilderPage />} />
        <Route path="/packet" element={<PacketGeneratorPage />} />
        <Route path="/caqh" element={<CAQHManagerPage />} />
        <Route path="/calendar" element={<ExpirationCalendarPage />} />
        <Route path="/settings" element={<SettingsPage />} />
        <Route path="/my-groups" element={<MyGroupsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/packet-history" element={<PacketHistoryPage />} />
      </Route>

      {/* Group admin routes */}
      <Route element={<ProtectedRoute requiredRole="group_admin"><GroupDashboardLayout /></ProtectedRoute>}>
        <Route path="/group/dashboard" element={<GroupDashboardPage />} />
        <Route path="/group/providers" element={<GroupProvidersPage />} />
        <Route path="/group/payer-workflows" element={<GroupPayerWorkflowsPage />} />
        <Route path="/group/compliance" element={<GroupCompliancePage />} />
        <Route path="/group/packets" element={<GroupPacketGeneratorPage />} />
        <Route path="/group/settings" element={<GroupSettingsPage />} />
        <Route path="/group/packet-history" element={<GroupPacketHistoryPage />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <DocumentsProvider>
        <CredentialsProvider>
          <CreditsProvider>
            <PayersProvider>
              <NotificationsProvider>
                <UIProvider>
                <TooltipProvider>
                  <Toaster />
                  <Sonner />
                  <BrowserRouter>
                    <AppRoutes />
                  </BrowserRouter>
                </TooltipProvider>
                </UIProvider>
              </NotificationsProvider>
            </PayersProvider>
          </CreditsProvider>
        </CredentialsProvider>
      </DocumentsProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
