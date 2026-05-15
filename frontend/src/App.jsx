import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import LoginPage from "@/pages/auth/LoginPage";
import RegisterPage from "@/pages/auth/RegisterPage";
import DashboardLayout from "@/components/DashboardLayout";

// Shared Pages
import DashboardPage from "@/pages/shared/DashboardPage";
import ClassListPage from "@/pages/shared/ClassListPage";
import ClassDetailPage from "@/pages/shared/ClassDetailPage";
import ProfilePage from "@/pages/shared/ProfilePage";
import FaceEnrollmentPage from "@/pages/shared/FaceEnrollmentPage";
import SessionRecordPage from "@/pages/shared/SessionRecordPage";

// Teacher Specific Pages
import AttendanceSessionPage from "@/pages/teacher/AttendanceSessionPage";
import AttendanceSelectionPage from "@/pages/teacher/AttendanceSelectionPage";
import AttendanceSummaryPage from "@/pages/teacher/AttendanceSummaryPage";

// Student Specific Pages


import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import ShaderDemo from "@/components/ShaderDemo";
import { HeroSection } from "@/components/shared/landing/hero";


export default function App() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold animate-pulse uppercase tracking-widest text-muted-foreground">
            Initializing Snaptic...
          </p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="system" storageKey="snaptic-theme">

        <TooltipProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/login" replace />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Teacher — sidebar dashboard with nested routes */}
              <Route
                path="/teacher"
                element={
                  <ProtectedRoute allowedRole="teacher">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="classes" element={<ClassListPage />} />
                <Route path="classes/:id" element={<ClassDetailPage />} />
                <Route
                  path="classes/:id/attendance"
                  element={<AttendanceSessionPage />}
                />
                <Route
                  path="classes/:id/records/:sessionId"
                  element={<SessionRecordPage />}
                />
                <Route
                  path="take-attendance"
                  element={<AttendanceSelectionPage />}
                />
                <Route
                  path="attendance/:id/summary"
                  element={<AttendanceSummaryPage />}
                />
                <Route path="face-enrollment" element={<FaceEnrollmentPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              {/* Student — sidebar dashboard with nested routes */}
              <Route
                path="/student"
                element={
                  <ProtectedRoute allowedRole="student">
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<DashboardPage />} />
                <Route path="classes" element={<ClassListPage />} />
                <Route path="classes/:id" element={<ClassDetailPage />} />

                <Route
                  path="classes/:id/records/:sessionId"
                  element={<SessionRecordPage />}
                />
                <Route path="face-enrollment" element={<FaceEnrollmentPage />} />
                <Route path="profile" element={<ProfilePage />} />
              </Route>

              <Route path="/shader-demo" element={<ShaderDemo />} />
              <Route path="/landing" element={<HeroSection />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
            <Toaster position="bottom-right" />
          </BrowserRouter>
        </TooltipProvider>

    </ThemeProvider>
  );
}
