import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as authApi from "../api/auth.api";

export const useAuth = () => {
  return useQuery({
    queryKey: ["auth-user"],
    queryFn: authApi.checkAuth,
    retry: false,
    staleTime: Infinity,
  });
};

export const useAuthUser = useAuth;

export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ email, password, rememberMe }) => authApi.login(email, password, rememberMe),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth-user"], user);
    },
  });
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, email, password, inviteToken }) => 
      authApi.register(name, email, password, inviteToken),
    onSuccess: (user) => {
      queryClient.setQueryData(["auth-user"], user);
    },
  });
};

export const useLogout = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: authApi.logout,
    onSuccess: () => {
      queryClient.setQueryData(["auth-user"], null);
      queryClient.clear();
    },
  });
};

export const useUpdateProfile = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, avatar }) => authApi.updateProfile(name, avatar),
    onSuccess: (profile) => {
      queryClient.setQueryData(["auth-user"], (old) => ({
        ...old,
        name: profile.name,
        avatar: profile.avatar,
      }));
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({ currentPassword, newPassword }) =>
      authApi.changePassword(currentPassword, newPassword),
  });
};
