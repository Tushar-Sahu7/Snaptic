import { createContext, useContext } from "react";
import { useAuthUser, useLogin, useRegister, useLogout } from "@/features/auth/hooks/useAuth";
import * as authApi from "@/features/auth/api/auth.api";
import { useQueryClient } from "@tanstack/react-query";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  const { data: user, isLoading: loading, error: authError } = useAuthUser();
  
  const loginMutation = useLogin();
  const registerMutation = useRegister();
  const logoutMutation = useLogout();

  async function updateProfile(name, avatar) {
    const profileData = await authApi.updateProfile(name, avatar);
    queryClient.setQueryData(["auth-user"], prev => ({ ...prev, name: profileData.name, avatar: profileData.avatar }));
    return profileData;
  }

  async function enrollFace(imageData, descriptorData) {
    const data = await authApi.enrollFace(imageData, descriptorData);
    queryClient.setQueryData(["auth-user"], prev => ({ ...prev, faceEnrolled: true, avatar: imageData }));
    return data;
  }

  async function deleteFace() {
    const data = await authApi.deleteFace();
    queryClient.setQueryData(["auth-user"], prev => ({ ...prev, faceEnrolled: false, avatar: null }));
    return data;
  }

  const value = {
    user,
    loading,
    error: loginMutation.error?.response?.data?.message || authError?.message || null,
    isAuthenticated: !!user,
    isTeacher: user?.role === "teacher",
    isStudent: user?.role === "student",
    login: loginMutation.mutateAsync,
    register: registerMutation.mutateAsync,
    logout: logoutMutation.mutateAsync,
    updateProfile,
    enrollFace,
    deleteFace,
    // Add other functions if needed, mapping them to mutations/api calls
    changePassword: authApi.changePassword,
    generateInviteLink: authApi.generateInviteLink,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}