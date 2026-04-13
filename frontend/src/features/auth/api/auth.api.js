import api from "@/lib/axios";

export const login = async (email, password) => {
  const { data } = await api.post("/api/auth/login", { email, password });
  return data.user;
};

export const register = async (name, email, password, inviteToken) => {
  const body = { name, email, password };
  if (inviteToken) body.inviteToken = inviteToken;
  const { data } = await api.post("/api/auth/register", body);
  return data.user;
};

export const logout = async () => {
  await api.post("/api/auth/logout");
};

export const checkAuth = async () => {
  const { data } = await api.get("/api/auth/me");
  return data.user;
};

export const updateProfile = async (name, avatar) => {
  const { data } = await api.put("/api/auth/profile", { name, avatar });
  return data.profile;
};

export const changePassword = async (currentPassword, newPassword) => {
  await api.post("/api/auth/change-password", { currentPassword, newPassword });
};

export const generateInviteLink = async () => {
  const { data } = await api.post("/api/auth/invite");
  return data.inviteLink;
};

export const enrollFace = async (imageData, descriptorData) => {
  const { data } = await api.post("/api/auth/face/enroll", { image: imageData, embedding: descriptorData });
  return data;
};

export const deleteFace = async () => {
  const { data } = await api.delete("/api/auth/face");
  return data;
};
