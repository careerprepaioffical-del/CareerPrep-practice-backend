import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import LoadingSpinner from './components/UI/LoadingSpinner';

const Layout = lazy(() => import('./components/Layout/Layout'));
const HomePage = lazy(() => import('./pages/HomePage'));
const AuthPage = lazy(() => import('./pages/auth/AuthPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InterviewPage = lazy(() => import('./pages/interview/InterviewPage'));
const InterviewSetupPage = lazy(() => import('./pages/interview/InterviewSetupPage'));
const InterviewSessionPage = lazy(() => import('./pages/interview/InterviewSessionPage'));
const InterviewResultsPage = lazy(() => import('./pages/interview/InterviewResultsPage'));
const AIInterviewPage = lazy(() => import('./pages/interview/AIInterviewPage'));
const AIInterviewSetupPage = lazy(() => import('./pages/interview/AIInterviewSetupPage'));
const CodingInterviewPage = lazy(() => import('./pages/interview/CodingInterviewPage'));
const QuickPracticeSetupPage = lazy(() => import('./pages/quickPractice/QuickPracticeSetupPage'));
const QuickPracticeSessionPage = lazy(() => import('./pages/quickPractice/QuickPracticeSessionPage'));
const QuickPracticeResultsPage = lazy(() => import('./pages/quickPractice/QuickPracticeResultsPage'));
const QuickMockSetupPage = lazy(() => import('./pages/quickMock/QuickMockSetupPage'));
const QuickMockSessionPage = lazy(() => import('./pages/quickMock/QuickMockSessionPage'));
const QuickMockResultsPage = lazy(() => import('./pages/quickMock/QuickMockResultsPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const PreparationGuidePage = lazy(() => import('./pages/PreparationGuidePage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminCodingQuestionsPage = lazy(() => import('./pages/admin/AdminCodingQuestionsPage'));
const AdminQuickPracticeQuestionsPage = lazy(() => import('./pages/admin/AdminQuickPracticeQuestionsPage'));
const AdminPreparationSheetPage = lazy(() => import('./pages/admin/AdminPreparationSheetPage'));
const GoogleCallbackPage = lazy(() => import('./pages/auth/GoogleCallbackPage'));

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-2">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

// Admin Route Component
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Public Route Component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <SocketProvider>
      <div className="App">
        <Suspense
          fallback={
            <div className="min-h-screen flex items-center justify-center">
              <LoadingSpinner size="lg" text="Loading page..." />
            </div>
          }
        >
        <Routes>
        {/* Public Routes */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <HomePage />
            </PublicRoute>
          }
        />
        
        {/* Google OAuth callback – must NOT be wrapped in PublicRoute/ProtectedRoute */}
        <Route path="/auth/callback" element={<GoogleCallbackPage />} />

        {/* Auth Routes - Unified Auth Page */}
        <Route
          path="/login"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />
        
        <Route
          path="/register"
          element={
            <PublicRoute>
              <AuthPage />
            </PublicRoute>
          }
        />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Layout>
                <DashboardPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview"
          element={
            <ProtectedRoute>
              <Layout>
                <InterviewPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-practice"
          element={
            <ProtectedRoute>
              <Layout>
                <QuickPracticeSetupPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-practice/session/:sessionId"
          element={
            <ProtectedRoute>
              <Layout>
                <QuickPracticeSessionPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-practice/results/:sessionId"
          element={
            <ProtectedRoute>
              <Layout>
                <QuickPracticeResultsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-mock"
          element={
            <ProtectedRoute>
              <Layout>
                <QuickMockSetupPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-mock/session/:sessionId"
          element={
            <ProtectedRoute>
              <QuickMockSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/quick-mock/results/:sessionId"
          element={
            <ProtectedRoute>
              <Layout>
                <QuickMockResultsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <Layout>
                <InterviewSetupPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/ai-setup"
          element={
            <ProtectedRoute>
              <AIInterviewSetupPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/session/:sessionId"
          element={
            <ProtectedRoute>
              <InterviewSessionPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/ai/:sessionId"
          element={
            <ProtectedRoute>
              <AIInterviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/coding/:sessionId"
          element={
            <ProtectedRoute>
              <CodingInterviewPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/interview/results/:sessionId"
          element={
            <ProtectedRoute>
              <Layout>
                <InterviewResultsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Layout>
                <ProfilePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <Layout>
                <ProgressPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/preparation-guide"
          element={
            <ProtectedRoute>
              <Layout>
                <PreparationGuidePage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Layout>
                <SettingsPage />
              </Layout>
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <AdminRoute>
              <Layout>
                <AdminDashboardPage />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/coding-questions"
          element={
            <AdminRoute>
              <Layout>
                <AdminCodingQuestionsPage />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/quick-practice-questions"
          element={
            <AdminRoute>
              <Layout>
                <AdminQuickPracticeQuestionsPage />
              </Layout>
            </AdminRoute>
          }
        />

        <Route
          path="/admin/preparation-sheet"
          element={
            <AdminRoute>
              <Layout>
                <AdminPreparationSheetPage />
              </Layout>
            </AdminRoute>
          }
        />

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
        </Suspense>
      </div>
    </SocketProvider>
  );
}

export default App;
