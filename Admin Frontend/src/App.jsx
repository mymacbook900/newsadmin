import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import Dashboard from './pages/Dashboard';
import UserManagement from './pages/UserManagement';
import ReporterManagement from './pages/ReporterManagement';
import NewsManagement from './pages/NewsManagement';
import CommunityManagement from './pages/CommunityManagement';
import ReporterEvents from './pages/ReporterEvents';
import Reports from './pages/Reports';
import CaseStudyManagement from './pages/CaseStudyManagement';
import Settings from './pages/Settings';
import LoginPage from './pages/LoginPage';
import ForgotPassword from './pages/ForgotPassword';
import ReportingHub from './pages/ReportingHub';
import MyActivity from './pages/MyActivity';
import SavedContent from './pages/SavedContent';
import PublicNewsView from './pages/PublicNewsView';

// Simple Protected Route Component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = localStorage.getItem('isAdminAuthenticated') === 'true';
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/story/:id" element={<PublicNewsView />} />

        <Route path="/" element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index element={<Dashboard />} />
          <Route path="users">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<UserManagement initialRole="All" />} />
            <Route path="admins" element={<UserManagement initialRole="Admin" />} />
            <Route path="reporters" element={<UserManagement initialRole="Reporter" />} />
          </Route>
          <Route path="news" element={<NewsManagement />} />
          <Route path="communities" element={<CommunityManagement />} />
          <Route path="events" element={<ReporterEvents />} />
          <Route path="moderation" element={<Reports />} />
          <Route path="casestudies" element={<CaseStudyManagement />} />
          <Route path="settings" element={<Settings />} />
          <Route path="reporting-hub" element={<ReportingHub />} />
          <Route path="my-activity" element={<MyActivity />} />
          <Route path="saved" element={<SavedContent />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
