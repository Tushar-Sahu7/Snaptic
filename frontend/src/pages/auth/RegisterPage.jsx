import { Navigate } from "react-router";
import RegisterForm from "@/pages/auth/RegisterForm";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return <Navigate to={user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"} replace />;
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center md:p-10">
      <div className="w-full max-w-sm">
        <RegisterForm />
      </div>
    </div>
  );
}
