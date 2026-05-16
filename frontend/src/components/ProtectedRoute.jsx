import { Navigate } from "react-router";
import { useAuth } from "@/context/AuthContext";

// Blocks unauthenticated users and optionally restricts by role
export default function ProtectedRoute({ children, allowedRole }) {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  if (allowedRole && user.role !== allowedRole) {
    const correctPath = user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard";
    return <Navigate to={correctPath} replace />;
  }

  return children;
}
