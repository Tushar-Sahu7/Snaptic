import axios from "axios"

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const path = window.location.pathname;
  if (path.startsWith("/teacher")) {
    config.headers["X-Role"] = "teacher";
  } else if (path.startsWith("/student")) {
    config.headers["X-Role"] = "student";
  }
  return config;
});

export default api