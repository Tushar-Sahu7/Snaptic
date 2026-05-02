import { createContext, useContext, useState, useEffect, useRef } from "react";
import * as authApi from "@/features/auth/api/auth.api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const initialized = useRef(false);
  
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    checkAuth();
  }, []);

  async function checkAuth() {
    try {
      const userData = await authApi.checkAuth();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }

  async function login(email, password) {
    setError(null);
    try {
      const userData = await authApi.login(email, password);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    }
  }

  async function register(name, email, password, inviteToken) {
    setError(null);
    try {
      const userData = await authApi.register(name, email, password, inviteToken);
      setUser(userData);
      return userData;
    } catch (err) {
      const msg = err.response?.data?.message || err.message;
      setError(msg);
      throw err;
    }
  }

  async function logout() {
    try {
      await authApi.logout();
    } finally {
      setUser(null);
    }
  }

  async function updateProfile(name, avatar) {
    try {
      const profileData = await authApi.updateProfile(name, avatar);
      setUser(prev => ({ ...prev, name: profileData.name, avatar: profileData.avatar }));
      return profileData;
    } catch (err) {
      throw err;
    }
  }

  async function changePassword(currentPassword, newPassword) {
    try {
      await authApi.changePassword(currentPassword, newPassword);
    } catch (err) {
      throw err;
    }
  }

  async function generateInviteLink() {
    try {
      return await authApi.generateInviteLink();
    } catch (err) {
      throw err;
    }
  }

  async function enrollFace(imageData, descriptorData) {
    try {
      const data = await authApi.enrollFace(imageData, descriptorData);
      setUser(prev => ({ ...prev, faceEnrolled: true, avatar: imageData }));
      return data;
    } catch (err) {
      throw err;
    }
  }

  async function deleteFace() {
    try {
      const data = await authApi.deleteFace();
      setUser(prev => ({ ...prev, faceEnrolled: false, avatar: null }));
      return data;
    } catch (err) {
      throw err;
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
        updateProfile,
        changePassword,
        generateInviteLink,
        enrollFace,
        deleteFace,
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