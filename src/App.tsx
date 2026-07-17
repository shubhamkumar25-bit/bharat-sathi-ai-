import { Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";

import { appPaths } from "./constants/paths";

import { HomePage } from "./pages/HomePage";
import { LoginPage } from "./pages/LoginPage";
import { DashboardPage } from "./pages/DashboardPage";
import { ChatPage } from "./pages/ChatPage";
import { ResumeBuilderPage } from "./pages/ResumeBuilderPage";
import { GovernmentSchemesPage } from "./pages/GovernmentSchemesPage";
import { JobSearchPage } from "./pages/JobSearchPage";
import { CareerGuidancePage } from "./pages/CareerGuidancePage";
import { StudentSupportPage } from "./pages/StudentSupportPage";
import { FarmerSupportPage } from "./pages/FarmerSupportPage";
import { ProfilePage } from "./pages/ProfilePage";
import { NotFoundPage } from "./pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={appPaths.home} element={<HomePage />} />
        <Route path={appPaths.login} element={<LoginPage />} />
        <Route path={appPaths.register} element={<LoginPage />} />

        <Route
          path={appPaths.dashboard}
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.chat}
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.resumeBuilder}
          element={
            <ProtectedRoute>
              <ResumeBuilderPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.governmentSchemes}
          element={
            <ProtectedRoute>
              <GovernmentSchemesPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/jobs"
          element={
            <ProtectedRoute>
              <JobSearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.careerGuidance}
          element={
            <ProtectedRoute>
              <CareerGuidancePage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.studentSupport}
          element={
            <ProtectedRoute>
              <StudentSupportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.farmerSupport}
          element={
            <ProtectedRoute>
              <FarmerSupportPage />
            </ProtectedRoute>
          }
        />

        <Route
          path={appPaths.profile}
          element={
            <ProtectedRoute>
              <ProfilePage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}