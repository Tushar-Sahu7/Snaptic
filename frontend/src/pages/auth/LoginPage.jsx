import { Navigate } from "react-router";
import AuthLoginForm from "@/features/auth/components/AuthLoginForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  // Already logged in — go to role-specific dashboard
  if (isAuthenticated) {
    return <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 sm:p-10">
      <div className="w-full max-w-sm">
        <AuthLoginForm />
      </div>
    </div>
  );
}
