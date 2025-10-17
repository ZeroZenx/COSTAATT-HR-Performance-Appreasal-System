import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './contexts/AuthContext';
import { SSOProvider } from './contexts/SSOContext';
import { ToastProvider } from './components/ui/toast';
import { LoginPage } from './pages/LoginPage';
import { ForgotPasswordPage } from './pages/ForgotPasswordPage';
import { ResetPasswordPage } from './pages/ResetPasswordPage';
import { DashboardPage } from './pages/DashboardPage';
import { CreateAppraisalPage } from './pages/CreateAppraisalPage';
import { EnhancedCreateAppraisalPage } from './pages/EnhancedCreateAppraisalPage';
import { QuickCreateAppraisalPage } from './pages/QuickCreateAppraisalPage';
import { AppraisalsPage } from './pages/AppraisalsPage';
import { AppraisalTemplatesPage } from './pages/AppraisalTemplatesPage';
import { AppraisalCyclesPage } from './pages/AppraisalCyclesPage';
import { AppraisalFormsPage } from './pages/AppraisalFormsPage';
import { EmployeesPage } from './pages/EmployeesPage';
import { CompetenciesPage } from './pages/CompetenciesPage';
import { ReportsPage } from './pages/ReportsPage';
import { SettingsPage } from './pages/SettingsPage';
import { DivisionalHeadReviewPage } from './pages/DivisionalHeadReviewPage';
import { FinalReviewPage } from './pages/FinalReviewPage';
import { AppraisalEditPage } from './pages/AppraisalEditPage';
import { EmployeeProfilePage } from './pages/EmployeeProfilePage';
import { EmployeeSelfEvaluationPage } from './pages/EmployeeSelfEvaluationPage';
import { SelfEvaluationHistoryPage } from './pages/SelfEvaluationHistoryPage';
import { SelfEvaluationViewPage } from './pages/SelfEvaluationViewPage';
import { ChangePasswordPage } from './pages/ChangePasswordPage';
import { AdminPasswordManagementPage } from './pages/AdminPasswordManagementPage';
import { TeamManagementPage } from './pages/TeamManagementPage';
import { SSOCallbackPage } from './pages/SSOCallbackPage';
import { TestPage } from './pages/TestPage';
import { RouteGuard } from './components/RouteGuard';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SSOProvider>
        <AuthProvider>
          <ToastProvider>
            <Router>
            <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={
              <RouteGuard>
                <DashboardPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/new" element={
              <RouteGuard>
                <CreateAppraisalPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/new-enhanced" element={
              <RouteGuard>
                <EnhancedCreateAppraisalPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/new-quick" element={
              <RouteGuard>
                <QuickCreateAppraisalPage />
              </RouteGuard>
            } />
            <Route path="/appraisals" element={
              <RouteGuard>
                <AppraisalsPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/:id/review" element={
              <RouteGuard>
                <DivisionalHeadReviewPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/:id/final-review" element={
              <RouteGuard>
                <FinalReviewPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/:id/edit" element={
              <RouteGuard>
                <AppraisalEditPage />
              </RouteGuard>
            } />
            <Route path="/appraisals/:id/view" element={
              <RouteGuard>
                <DivisionalHeadReviewPage />
              </RouteGuard>
            } />
               <Route path="/profile" element={
                 <RouteGuard>
                   <EmployeeProfilePage />
                 </RouteGuard>
               } />
               <Route path="/self-evaluation" element={
                 <RouteGuard>
                   <EmployeeSelfEvaluationPage />
                 </RouteGuard>
               } />
               <Route path="/self-evaluation/history" element={
                 <RouteGuard>
                   <SelfEvaluationHistoryPage />
                 </RouteGuard>
               } />
               <Route path="/self-evaluation/:id/view" element={
                 <RouteGuard>
                   <SelfEvaluationViewPage />
                 </RouteGuard>
               } />
               <Route path="/change-password" element={
                 <RouteGuard>
                   <ChangePasswordPage />
                 </RouteGuard>
               } />
               <Route path="/admin/password-management" element={
                 <RouteGuard>
                   <AdminPasswordManagementPage />
                 </RouteGuard>
               } />
               <Route path="/team-management" element={
                 <RouteGuard>
                   <TeamManagementPage />
                 </RouteGuard>
               } />
            <Route path="/templates" element={
              <RouteGuard>
                <AppraisalTemplatesPage />
              </RouteGuard>
            } />
            <Route path="/cycles" element={
              <RouteGuard>
                <AppraisalCyclesPage />
              </RouteGuard>
            } />
            <Route path="/appraisal-forms" element={
              <RouteGuard>
                <AppraisalFormsPage />
              </RouteGuard>
            } />
            <Route path="/employees" element={
              <RouteGuard>
                <EmployeesPage />
              </RouteGuard>
            } />
            <Route path="/competencies" element={
              <RouteGuard>
                <CompetenciesPage />
              </RouteGuard>
            } />
            <Route path="/reports" element={
              <RouteGuard>
                <ReportsPage />
              </RouteGuard>
            } />
            <Route path="/settings" element={
              <RouteGuard>
                <SettingsPage />
              </RouteGuard>
            } />
            <Route path="/test" element={<TestPage />} />
            <Route path="/auth/sso/callback" element={<SSOCallbackPage />} />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
            </Router>
          </ToastProvider>
        </AuthProvider>
      </SSOProvider>
    </QueryClientProvider>
  );
}

export default App;