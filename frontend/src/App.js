import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';

// Layout Components
import Layout from './components/Layout/Layout';

// Page Components
import HomePage from './pages/HomePage';
import AuthPage from './pages/auth/AuthPage';
import DashboardPage from './pages/DashboardPage';
import InterviewPage from './pages/interview/InterviewPage';
import InterviewSetupPage from './pages/interview/InterviewSetupPage';
import InterviewSessionPage from './pages/interview/InterviewSessionPage';
import InterviewResultsPage from './pages/interview/InterviewResultsPage';
import AIInterviewPage from './pages/interview/AIInterviewPage';
import AIInterviewSetupPage from './pages/interview/AIInterviewSetupPage';
import CodingInterviewPage from './pages/interview/CodingInterviewPage';
import QuickPracticeSetupPage from './pages/quickPractice/QuickPracticeSetupPage';
import QuickPracticeSessionPage from './pages/quickPractice/QuickPracticeSessionPage';
import QuickPracticeResultsPage from './pages/quickPractice/QuickPracticeResultsPage';
import QuickMockSetupPage from './pages/quickMock/QuickMockSetupPage';
import QuickMockSessionPage from './pages/quickMock/QuickMockSessionPage';
import QuickMockResultsPage from './pages/quickMock/QuickMockResultsPage';
import ProfilePage from './pages/ProfilePage';
import ProgressPage from './pages/ProgressPage';
import PreparationGuidePage from './pages/PreparationGuidePage';
import SettingsPage from './pages/SettingsPage';
import NotFoundPage from './pages/NotFoundPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminCodingQuestionsPage from './pages/admin/AdminCodingQuestionsPage';
import AdminQuickPracticeQuestionsPage from './pages/admin/AdminQuickPracticeQuestionsPage';

// Loading Component
import LoadingSpinner from './components/UI/LoadingSpinner';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
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

        {/* 404 Route */}
        <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </div>
    </SocketProvider>
  );
}

export default App;
