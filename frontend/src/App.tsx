import { Route, Routes } from "react-router-dom";

import AppShell from "./components/layout/AppShell";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { AdminProtectedRoute } from "./components/AdminProtectedRoute";

import { appPaths } from "./constants/paths";

import { HomePage } from "./pages/HomePage";
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
import { AdminDashboard } from "./pages/AdminDashboard";
import { AdminDataSourcesPage } from "./pages/AdminDataSourcesPage";
import { AdminSyncPage } from "./pages/AdminSyncPage";
import { SchemeSearchPage } from "./pages/SchemeSearchPage";
import { SchemeDetailPage } from "./pages/SchemeDetailPage";
import AboutUsPage from "./pages/AboutUsPage";
import ContactUsPage from "./pages/ContactUsPage";
import CareerPage from "./pages/CareerPage";
import BlogPage from "./pages/BlogPage";
import TeamPage from "./pages/TeamPage";
import { AdminUsers } from "./pages/AdminUsers";
import { AdminUserDetail } from "./pages/AdminUserDetail";
import { AdminFeatureAnalytics } from "./pages/AdminFeatureAnalytics";
import { AdminAIAnalytics } from "./pages/AdminAIAnalytics";
import { AdminSchemeAnalytics } from "./pages/AdminSchemeAnalytics";
import { AdminRetentionAnalytics } from "./pages/AdminRetentionAnalytics";
import { AdminAuditLog } from "./pages/AdminAuditLog";
import { AdminSettings } from "./pages/AdminSettings";
import { AdminSidebar } from "./components/AdminSidebar";

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path={appPaths.home} element={<HomePage />} />
        <Route path={appPaths.aboutUs} element={<AboutUsPage />} />
        <Route path={appPaths.contactUs} element={<ContactUsPage />} />
        <Route path={appPaths.careers} element={<CareerPage />} />
        <Route path={appPaths.blog} element={<BlogPage />} />
        <Route path={appPaths.team} element={<TeamPage />} />

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

        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminDashboard />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/users"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminUsers />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/users/:userId"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminUserDetail />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminDashboard />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics/feature-usage"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminFeatureAnalytics />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics/ai"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminAIAnalytics />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics/government-schemes"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminSchemeAnalytics />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/analytics/retention"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminRetentionAnalytics />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/audit-log"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminAuditLog />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/settings"
          element={
            <AdminProtectedRoute>
              <div className="flex">
                <AdminSidebar />
                <div className="flex-1 lg:ml-64 p-6">
                  <AdminSettings />
                </div>
              </div>
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/data-sources"
          element={
            <AdminProtectedRoute>
              <AdminDataSourcesPage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/admin/sync"
          element={
            <AdminProtectedRoute>
              <AdminSyncPage />
            </AdminProtectedRoute>
          }
        />

        <Route
          path="/schemes/search"
          element={
            <ProtectedRoute>
              <SchemeSearchPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/schemes/:schemeId"
          element={
            <ProtectedRoute>
              <SchemeDetailPage />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}