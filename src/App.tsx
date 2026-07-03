import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/layout/AppShell';
import { ProtectedRoute } from './components/ProtectedRoute';
import { appPaths } from './constants/paths';
import { ChatPage } from './pages/ChatPage';
import { DashboardPage } from './pages/DashboardPage';
import { GovernmentSchemesPage } from './pages/GovernmentSchemesPage';
import { HomePage } from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ResumeBuilderPage } from './pages/ResumeBuilderPage';
import { JobSearchPage } from './pages/JobSearchPage';

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={appPaths.home} element={<HomePage />} />
        <Route path={appPaths.login} element={<LoginPage />} />
        <Route path={appPaths.register} element={<LoginPage />} />
        <Route path={appPaths.dashboard} element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path={appPaths.chat} element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path={appPaths.resumeBuilder} element={<ProtectedRoute><ResumeBuilderPage /></ProtectedRoute>} />
        <Route path={appPaths.governmentSchemes} element={<ProtectedRoute><GovernmentSchemesPage /></ProtectedRoute>} />
        <Route
  path="/jobs"
  element={
    <ProtectedRoute>
      <JobSearchPage />
    </ProtectedRoute>
  }
/>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="/app" element={<Navigate to={appPaths.dashboard} replace />} />
    </Routes>
  );
}