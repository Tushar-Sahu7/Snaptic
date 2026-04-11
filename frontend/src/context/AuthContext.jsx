import { createContext, useContext, useState, useEffect } from "react";
import api from "@/lib/axios";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Session restore on app mount — checks if cookie is still valid
  useEffect(() => {
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const { data } = await api.get("/api/auth/me");
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  // Login — email + password only, no role field (PRD F-1)
  async function login(email, password) {
    setError(null);
    try {
      const { data } = await api.post("/api/auth/login", { email, password });
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    }
  }

  // Register — inviteToken present = teacher, absent = student (PRD F-1)
  async function register(name, email, password, inviteToken) {
    setError(null);
    try {
      const body = { name, email, password };
      if (inviteToken) body.inviteToken = inviteToken;

      const { data } = await api.post("/api/auth/register", body);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    }
  }

  // Logout — clears HTTP-only cookie server-side
  async function logout() {
    try {
      await api.post("/api/auth/logout");
    } finally {
      setUser(null);
    }
  }

  const isAuthenticated = !!user;
  const isTeacher = user?.role === "teacher";
  const isStudent = user?.role === "student";

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        error,
        isAuthenticated,
        isTeacher,
        isStudent,
        login,
        register,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}

