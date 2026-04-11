import { Navigate } from "react-router";
import LoginForm from "@/pages/auth/LoginForm";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  // Already logged in — go to role-specific dashboard
  if (isAuthenticated) {
    return <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center md:p-10">
      <div className="w-full max-w-sm">
        <LoginForm />
      </div>
    </div>
  );
}
