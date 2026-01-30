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
import PublicNewsView from './pages/PublicNewsView';
import Protect from './components/Protect';

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
          <Route index element={<Protect><Dashboard /></Protect>} />
          <Route path="users">
            <Route index element={<Navigate to="all" replace />} />
            <Route path="all" element={<Protect><UserManagement initialRole="All" /></Protect>} />
            <Route path="admins" element={<Protect><UserManagement initialRole="Admin" /></Protect>} />
            <Route path="reporters" element={<Protect><UserManagement initialRole="Reporter" /></Protect>} />
          </Route>
          <Route path="news" element={<Protect><NewsManagement /></Protect>} />
          <Route path="communities" element={<Protect><CommunityManagement /></Protect>} />
          <Route path="events" element={<Protect><ReporterEvents /></Protect>} />
          <Route path="moderation" element={<Protect><Reports /></Protect>} />
          <Route path="casestudies" element={<Protect><CaseStudyManagement /></Protect>} />
          <Route path="settings" element={<Protect><Settings /></Protect>} />
          <Route path="reporting-hub" element={<Protect><ReportingHub /></Protect>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;

