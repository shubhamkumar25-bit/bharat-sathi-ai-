import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { ChatPage } from './pages/ChatPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { CareerGuidancePage } from './pages/CareerGuidancePage';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage';
import { FarmerSupportPage } from './pages/FarmerSupportPage';
import { StudentSupportPage } from './pages/StudentSupportPage';
import { ProfilePage } from './pages/ProfilePage';
import { NotFoundPage } from './pages/NotFoundPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
        />
        <Route
          path="/chat"
          element={<ProtectedRoute><ChatPage /></ProtectedRoute>}
        />
        <Route
          path="/resume-builder"
          element={<ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>}
        />
        <Route
          path="/career-guidance"
          element={<ProtectedRoute><CareerGuidancePage /></ProtectedRoute>}
        />
        <Route
          path="/government-schemes"
          element={<ProtectedRoute><GovernmentSchemesPage /></ProtectedRoute>}
        />
        <Route
          path="/farmer-support"
          element={<ProtectedRoute><FarmerSupportPage /></ProtectedRoute>}
        />
        <Route
          path="/student-support"
          element={<ProtectedRoute><StudentSupportPage /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/app" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}