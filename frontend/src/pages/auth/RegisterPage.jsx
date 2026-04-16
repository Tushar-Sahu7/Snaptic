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
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-background p-6 md:p-10">
      <div className="flex w-full max-w-[400px] flex-col gap-6">
        <Logo size="md" />
        <AuthRegisterForm />
        
        <footer className="text-center text-xs text-muted-foreground">
          <p>
            By clicking continue, you agree to our{" "}
            <Link
              to="/terms"
              className="underline underline-offset-4 hover:text-primary transition-colors"
            >
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link
              to="/privacy"
              className="underline underline-offset-4 hover:text-primary transition-colors"
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
