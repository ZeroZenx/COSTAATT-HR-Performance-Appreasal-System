import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useMSALAuth } from './hooks/useMSALAuth';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { AppraisalsPage } from './pages/AppraisalsPage';
import { AppraisalEditorPage } from './pages/AppraisalEditorPage';
import { CreateAppraisalPage } from './pages/CreateAppraisalPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { CompetenciesPage } from './pages/CompetenciesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SelfAppraisalPage } from './pages/SelfAppraisalPage';
import { FinalReviewPage } from './pages/FinalReviewPage';
import { ManagerReviewPage } from './pages/ManagerReviewPage';
import DivisionalHeadPage from './pages/DivisionalHeadPage';
import AppraisalDetailsPage from './pages/AppraisalDetailsPage';
import SettingsPage from './pages/SettingsPage';
import UserManagementPage from './pages/UserManagementPage';
import { AppraisalCyclesPage } from './pages/AppraisalCyclesPage';
import { IntegrationDashboard } from './pages/IntegrationDashboard';
import { Layout } from './components/Layout';
import { LoadingSpinner } from './components/ui/loading-spinner';
import { RouteGuard } from './components/RouteGuard';
import { MSALProvider } from './components/MSALProvider';
import { ToastProvider } from './components/ui/toast';

function AppContent() {
  const { user, isLoading } = useAuth();
  const { user: msalUser, isAuthenticated: isMSALAuthenticated } = useMSALAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Use MSAL user if available, otherwise fall back to regular auth
  const currentUser = isMSALAuthenticated ? msalUser : user;

  if (!currentUser) {
    return <LoginPage />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/appraisals" element={<AppraisalsPage />} />
        <Route 
          path="/appraisals/new" 
          element={
            <RouteGuard action="create" resource="appraisal">
              <CreateAppraisalPage />
            </RouteGuard>
          } 
        />
        <Route path="/appraisals/:id" element={<AppraisalEditorPage />} />
        <Route path="/appraisals/:id/final-review" element={<FinalReviewPage />} />
        <Route path="/self-appraisal/:cycleId" element={<SelfAppraisalPage />} />
        <Route 
          path="/employees" 
          element={
            <RouteGuard action="view" resource="employee" context={{ scope: 'team' }}>
              <EmployeesPage />
            </RouteGuard>
          } 
        />
        <Route path="/competencies" element={<CompetenciesPage />} />
        <Route 
          path="/reports" 
          element={
            <RouteGuard action="view" resource="report">
              <ReportsPage />
            </RouteGuard>
          } 
        />
        <Route 
          path="/settings" 
          element={
            <RouteGuard action="manage" resource="settings">
              <SettingsPage />
            </RouteGuard>
          } 
        />
        <Route 
          path="/users" 
          element={
            <RouteGuard action="manage" resource="user">
              <UserManagementPage />
            </RouteGuard>
          } 
        />
        <Route 
          path="/cycles" 
          element={
            <RouteGuard action="manage" resource="cycle">
              <AppraisalCyclesPage />
            </RouteGuard>
          } 
        />
        <Route 
          path="/integration" 
          element={
            <RouteGuard action="manage" resource="integration">
              <IntegrationDashboard />
            </RouteGuard>
          } 
        />
        <Route 
          path="/appraisals/:id/review" 
          element={
            <RouteGuard action="review" resource="appraisal">
              <ManagerReviewPage />
            </RouteGuard>
          } 
        />
        <Route 
          path="/appraisals/:id/finalize" 
          element={<DivisionalHeadPage />} 
        />
        <Route 
          path="/appraisals/create" 
          element={
            <RouteGuard action="create" resource="appraisal">
              <AppraisalDetailsPage />
            </RouteGuard>
          } 
        />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}

function App() {
  return (
    <MSALProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </MSALProvider>
  );
}

export default App;

