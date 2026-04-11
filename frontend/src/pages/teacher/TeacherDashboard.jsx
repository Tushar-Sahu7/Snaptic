import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

export default function TeacherDashboard() {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="text-center space-y-4">
        <h1 className="text-2xl font-bold">Teacher Dashboard</h1>
        <p className="text-muted-foreground">{user.email}</p>
        <Button variant="outline" onClick={logout}>
          Logout
        </Button>
      </div>
    </div>
  );
}
