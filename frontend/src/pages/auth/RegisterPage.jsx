import { Navigate } from "react-router";
import AuthRegisterForm from "@/features/auth/components/AuthRegisterForm";
import { useAuth } from "@/context/AuthContext";
import { Logo } from "@/components/shared/Logo";
import { Link } from "react-router";

export default function RegisterPage() {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return null;

  if (isAuthenticated) {
    return (
      <Navigate
        to={
          user.role === "teacher" ? "/teacher/dashboard" : "/student/dashboard"
        }
        replace
      />
    );
  }

  return (
    <div className="flex min-h-svh items-center justify-center p-4">
      <div className="flex w-full max-w-sm flex-col gap-6">
        <Logo size="md" className="self-center" />
        <AuthRegisterForm />

        <footer className="text-center">
          <p className="text-xs text-muted-foreground">
            By clicking continue, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            .
          </p>
        </footer>
      </div>
    </div>
  );
}
